import { useEffect, useRef, useState, useCallback } from 'react';
import Peer from 'peerjs';
import type { DataConnection } from 'peerjs';
import type { CharacterType } from '../components/character/types';

export type MultiplayerStatus = 'idle' | 'connecting' | 'waiting' | 'connected' | 'error';
export type EmoteType = 'heart' | 'wave';

export interface CharacterSyncState {
  character: CharacterType;
  x: number;
  z: number;
  rotation: number;
  isMoving: boolean;
  isSprinting: boolean;
  updatedAt?: number;
}

type IncomingPacket =
  | { type: 'hello' }
  | { type: 'welcome'; hostCharacter: CharacterType; state?: CharacterSyncState }
  | { type: 'state'; state: CharacterSyncState }
  | { type: 'emote'; character: CharacterType; emote: EmoteType }
  | { type: 'swap_role'; hostCharacter: CharacterType };

const ROOM_CODE_REGEX = /^[a-zA-Z0-9_-]{4,24}$/;
const ALLOWED_EMOTES: readonly EmoteType[] = ['heart', 'wave'];

const PEER_CONFIG = {
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun.cloudflare.com:3478' },
    ],
  },
};

function generateRoomCode(): string {
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
  const bytes = new Uint8Array(6);
  window.crypto.getRandomValues(bytes);
  let code = '';
  for (let i = 0; i < bytes.length; i++) {
    code += alphabet[bytes[i] % alphabet.length];
  }
  return code;
}

function getInitialRoomFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const raw = new URLSearchParams(window.location.search).get('room')?.trim();
  if (raw && ROOM_CODE_REGEX.test(raw)) {
    return raw;
  }
  return null;
}

function clampCoord(val: number): number {
  return Math.max(-5, Math.min(5, val));
}

function parseCharacterState(raw: unknown): CharacterSyncState | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const obj = raw as Record<string, unknown>;
  if (obj.character !== 'boy' && obj.character !== 'girl') return null;
  if (
    typeof obj.x !== 'number' ||
    !Number.isFinite(obj.x) ||
    typeof obj.z !== 'number' ||
    !Number.isFinite(obj.z) ||
    typeof obj.rotation !== 'number' ||
    !Number.isFinite(obj.rotation)
  ) {
    return null;
  }
  if (typeof obj.isMoving !== 'boolean' || typeof obj.isSprinting !== 'boolean') {
    return null;
  }

  return {
    character: obj.character,
    x: clampCoord(obj.x),
    z: clampCoord(obj.z),
    rotation: obj.rotation,
    isMoving: obj.isMoving,
    isSprinting: obj.isSprinting,
    updatedAt: performance.now(),
  };
}

function parsePacket(raw: unknown): IncomingPacket | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const obj = raw as Record<string, unknown>;

  switch (obj.type) {
    case 'hello':
      return { type: 'hello' };
    case 'welcome': {
      if (obj.hostCharacter !== 'boy' && obj.hostCharacter !== 'girl') return null;
      const parsedState = obj.state ? parseCharacterState(obj.state) ?? undefined : undefined;
      return { type: 'welcome', hostCharacter: obj.hostCharacter, state: parsedState };
    }
    case 'state': {
      const state = parseCharacterState(obj.state);
      return state ? { type: 'state', state } : null;
    }
    case 'emote': {
      if (obj.character !== 'boy' && obj.character !== 'girl') return null;
      if (typeof obj.emote !== 'string' || !ALLOWED_EMOTES.includes(obj.emote as EmoteType)) {
        return null;
      }
      return { type: 'emote', character: obj.character, emote: obj.emote as EmoteType };
    }
    case 'swap_role': {
      if (obj.hostCharacter !== 'boy' && obj.hostCharacter !== 'girl') return null;
      return { type: 'swap_role', hostCharacter: obj.hostCharacter };
    }
    default:
      return null;
  }
}

interface UseMultiplayerOptions {
  activeCharacter: CharacterType;
  onAssignCharacter: (character: CharacterType) => void;
}

export const useMultiplayer = ({
  activeCharacter,
  onAssignCharacter,
}: UseMultiplayerOptions) => {
  const [roomCode, setRoomCode] = useState<string | null>(getInitialRoomFromUrl);
  const [status, setStatus] = useState<MultiplayerStatus>(() =>
    getInitialRoomFromUrl() ? 'connecting' : 'idle'
  );
  const [isHost, setIsHost] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Ephemeral emotes displayed above character heads
  const [emotes, setEmotes] = useState<{ boy: EmoteType | null; girl: EmoteType | null }>({
    boy: null,
    girl: null,
  });

  // High-frequency state refs (zero re-render thrashing)
  const remoteStateRef = useRef<CharacterSyncState | null>(null);
  const lastLocalStateRef = useRef<CharacterSyncState | null>(null);
  const lastSentAtRef = useRef<number>(0);
  const lastSentMovingRef = useRef<boolean>(false);
  const lastSentSprintRef = useRef<boolean>(false);

  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);
  const isHostRef = useRef<boolean>(false);
  const activeCharRef = useRef<CharacterType>(activeCharacter);
  const onAssignCharRef = useRef(onAssignCharacter);
  const emoteTimersRef = useRef<{ boy?: number; girl?: number }>({});

  useEffect(() => {
    activeCharRef.current = activeCharacter;
  }, [activeCharacter]);

  useEffect(() => {
    onAssignCharRef.current = onAssignCharacter;
  }, [onAssignCharacter]);

  const triggerLocalEmoteDisplay = useCallback((character: CharacterType, emote: EmoteType) => {
    setEmotes((prev) => ({ ...prev, [character]: emote }));
    const prevTimer = emoteTimersRef.current[character];
    if (prevTimer) window.clearTimeout(prevTimer);
    emoteTimersRef.current[character] = window.setTimeout(() => {
      setEmotes((prev) => ({ ...prev, [character]: null }));
    }, 2600);
  }, []);

  const syncUrlRoom = useCallback((code: string | null) => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (code) {
      url.searchParams.set('room', code);
    } else {
      url.searchParams.delete('room');
    }
    window.history.replaceState({}, '', url.toString());
  }, []);

  const createRoom = useCallback(
    (customCode?: string) => {
      const cleaned = customCode?.trim().toLowerCase();
      const nextCode = cleaned && ROOM_CODE_REGEX.test(cleaned) ? cleaned : generateRoomCode();
      remoteStateRef.current = null;
      setErrorMsg(null);
      setStatus('connecting');
      syncUrlRoom(nextCode);
      setRoomCode(nextCode);
      return nextCode;
    },
    [syncUrlRoom]
  );

  const leaveRoom = useCallback(() => {
    connRef.current?.close();
    connRef.current = null;
    peerRef.current?.destroy();
    peerRef.current = null;
    remoteStateRef.current = null;
    isHostRef.current = false;
    setIsHost(false);
    setErrorMsg(null);
    setStatus('idle');
    syncUrlRoom(null);
    setRoomCode(null);
  }, [syncUrlRoom]);

  // Core PeerJS host/guest lifecycle
  useEffect(() => {
    if (!roomCode) return;

    let cancelled = false;
    let retryTimer: number | null = null;
    const hostPeerId = `hdtm-v1-${roomCode}-host`;

    const cleanupInstances = () => {
      if (retryTimer) {
        window.clearTimeout(retryTimer);
        retryTimer = null;
      }
      connRef.current?.close();
      connRef.current = null;
      peerRef.current?.destroy();
      peerRef.current = null;
    };

    const bindConnection = (conn: DataConnection, asHost: boolean) => {
      if (connRef.current && connRef.current !== conn) {
        connRef.current.close();
      }
      connRef.current = conn;

      conn.on('open', () => {
        if (cancelled) return;
        setErrorMsg(null);
        setStatus('connected');

        if (asHost) {
          conn.send({
            type: 'welcome',
            hostCharacter: activeCharRef.current,
            state: lastLocalStateRef.current ?? undefined,
          });
        } else {
          conn.send({ type: 'hello' });
        }
      });

      conn.on('data', (rawData) => {
        if (cancelled) return;
        const packet = parsePacket(rawData);
        if (!packet) return;

        switch (packet.type) {
          case 'hello':
            if (isHostRef.current) {
              conn.send({
                type: 'welcome',
                hostCharacter: activeCharRef.current,
                state: lastLocalStateRef.current ?? undefined,
              });
            }
            break;

          case 'welcome': {
            const guestChar: CharacterType = packet.hostCharacter === 'boy' ? 'girl' : 'boy';
            onAssignCharRef.current(guestChar);
            if (packet.state) {
              remoteStateRef.current = packet.state;
            }
            setStatus('connected');
            break;
          }

          case 'state':
            remoteStateRef.current = packet.state;
            break;

          case 'emote':
            triggerLocalEmoteDisplay(packet.character, packet.emote);
            break;

          case 'swap_role': {
            const nextChar: CharacterType = isHostRef.current
              ? packet.hostCharacter
              : packet.hostCharacter === 'boy'
              ? 'girl'
              : 'boy';
            onAssignCharRef.current(nextChar);
            remoteStateRef.current = null;
            break;
          }
        }
      });

      conn.on('close', () => {
        if (cancelled) return;
        if (connRef.current === conn) {
          connRef.current = null;
        }
        remoteStateRef.current = null;
        if (isHostRef.current) {
          setStatus('waiting');
        } else {
          // Host disconnected -> retry claiming host or rejoining shortly
          setStatus('connecting');
          retryTimer = window.setTimeout(() => {
            if (!cancelled) startHostOrGuest();
          }, 800);
        }
      });

      conn.on('error', () => {
        if (cancelled) return;
        setErrorMsg('Kết nối với người kia bị gián đoạn, đang thử lại...');
      });
    };

    const startGuest = () => {
      if (cancelled) return;
      cleanupInstances();
      isHostRef.current = false;
      setIsHost(false);
      setStatus('connecting');

      const guestPeer = new Peer(PEER_CONFIG);
      peerRef.current = guestPeer;

      guestPeer.on('open', () => {
        if (cancelled) return;
        const conn = guestPeer.connect(hostPeerId, { reliable: true });
        bindConnection(conn, false);
      });

      guestPeer.on('error', (err) => {
        if (cancelled) return;
        if (err.type === 'peer-unavailable') {
          // Host just left; wait briefly then try becoming host
          retryTimer = window.setTimeout(() => {
            if (!cancelled) startHostOrGuest();
          }, 900);
        } else {
          setStatus('error');
          setErrorMsg('Không thể kết nối máy chủ phòng. Vui lòng thử lại.');
        }
      });
    };

    const startHostOrGuest = () => {
      if (cancelled) return;
      cleanupInstances();
      setStatus('connecting');

      const hostPeer = new Peer(hostPeerId, PEER_CONFIG);
      peerRef.current = hostPeer;

      hostPeer.on('open', () => {
        if (cancelled) return;
        isHostRef.current = true;
        setIsHost(true);
        setErrorMsg(null);
        setStatus('waiting');
      });

      hostPeer.on('connection', (conn) => {
        if (cancelled) return;
        bindConnection(conn, true);
      });

      hostPeer.on('error', (err) => {
        if (cancelled) return;
        if (err.type === 'unavailable-id') {
          // Room host already exists -> join as guest
          startGuest();
        } else {
          setStatus('error');
          setErrorMsg('Lỗi kết nối phòng chơi chung. Hãy kiểm tra mạng và thử lại.');
        }
      });
    };

    startHostOrGuest();

    return () => {
      cancelled = true;
      cleanupInstances();
    };
  }, [roomCode, triggerLocalEmoteDisplay]);

  const sendLocalState = useCallback((state: CharacterSyncState) => {
    lastLocalStateRef.current = state;
    const conn = connRef.current;
    if (!conn || !conn.open) return;

    const now = performance.now();
    const stateChanged =
      state.isMoving !== lastSentMovingRef.current ||
      state.isSprinting !== lastSentSprintRef.current;

    if (!stateChanged && !state.isMoving && now - lastSentAtRef.current < 350) {
      return;
    }
    if (!stateChanged && now - lastSentAtRef.current < 36) {
      return;
    }

    lastSentAtRef.current = now;
    lastSentMovingRef.current = state.isMoving;
    lastSentSprintRef.current = state.isSprinting;

    conn.send({
      type: 'state',
      state: {
        character: state.character,
        x: Number(state.x.toFixed(3)),
        z: Number(state.z.toFixed(3)),
        rotation: Number(state.rotation.toFixed(3)),
        isMoving: state.isMoving,
        isSprinting: state.isSprinting,
      },
    });
  }, []);

  const sendEmote = useCallback(
    (emote: EmoteType) => {
      const char = activeCharRef.current;
      triggerLocalEmoteDisplay(char, emote);
      const conn = connRef.current;
      if (conn && conn.open) {
        conn.send({ type: 'emote', character: char, emote });
      }
    },
    [triggerLocalEmoteDisplay]
  );

  const swapRoles = useCallback(() => {
    const conn = connRef.current;
    const nextLocal: CharacterType = activeCharRef.current === 'boy' ? 'girl' : 'boy';
    onAssignCharRef.current(nextLocal);
    remoteStateRef.current = null;

    if (conn && conn.open) {
      const nextHostChar: CharacterType = isHostRef.current
        ? nextLocal
        : nextLocal === 'boy'
        ? 'girl'
        : 'boy';
      conn.send({ type: 'swap_role', hostCharacter: nextHostChar });
    }
  }, []);

  const inviteUrl =
    typeof window !== 'undefined' && roomCode
      ? `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(roomCode)}`
      : null;

  return {
    roomCode,
    inviteUrl,
    status,
    isHost,
    isPartnerOnline: status === 'connected',
    errorMsg,
    remoteStateRef,
    emotes,
    createRoom,
    leaveRoom,
    sendLocalState,
    sendEmote,
    swapRoles,
  };
};

export default useMultiplayer;
