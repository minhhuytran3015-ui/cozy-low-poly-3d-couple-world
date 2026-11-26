import { useEffect, useRef, useState, useCallback } from 'react';
import Peer from 'peerjs';
import type { DataConnection } from 'peerjs';
import { createClient } from '@supabase/supabase-js';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { CharacterType } from '../components/character/types';

export type MultiplayerStatus = 'idle' | 'connecting' | 'waiting' | 'connected' | 'error';
export type EmoteType = 'heart' | 'wave';
export type TransportKind = 'supabase' | 'webrtc';

export interface ChatMessage {
  id: string;
  character: CharacterType;
  text: string;
  sentAt: number;
}

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
  | { type: 'chat'; message: ChatMessage }
  | { type: 'swap_role'; hostCharacter: CharacterType };

const ROOM_CODE_REGEX = /^[a-zA-Z0-9_-]{4,24}$/;
const ALLOWED_EMOTES: readonly EmoteType[] = ['heart', 'wave'];
const CHAT_STORAGE_KEY = 'cozy_couple_chat_history_v1';
const MAX_CHAT_HISTORY = 300;
const MAX_CHAT_LENGTH = 240;

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';
const HAS_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const supabaseClient = HAS_SUPABASE
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    realtime: { params: { eventsPerSecond: 30 } },
  })
  : null;

function buildIceServers(): RTCIceServer[] {
  const servers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
  ];

  const turnUrls = import.meta.env.VITE_TURN_URLS?.trim();
  const turnUser = import.meta.env.VITE_TURN_USERNAME?.trim();
  const turnCred = import.meta.env.VITE_TURN_CREDENTIAL?.trim();

  if (turnUrls && turnUser && turnCred) {
    servers.push({
      urls: turnUrls.split(',').map((u: string) => u.trim()).filter(Boolean),
      username: turnUser,
      credential: turnCred,
    });
  }

  return servers;
}

const PEER_CONFIG = {
  config: {
    iceServers: buildIceServers(),
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

function generateClientId(): string {
  const bytes = new Uint8Array(8);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
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

function sanitizeChatText(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const cleaned = Array.from(raw, (ch) => {
    const code = ch.charCodeAt(0);
    return code < 32 || code === 127 ? ' ' : ch;
  })
    .join('')
    .trim();
  if (!cleaned) return null;
  return cleaned.slice(0, MAX_CHAT_LENGTH);
}

function parseChatMessage(raw: unknown): ChatMessage | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.id !== 'string' || !obj.id.trim() || obj.id.length > 64) return null;
  if (obj.character !== 'boy' && obj.character !== 'girl') return null;
  const text = sanitizeChatText(obj.text);
  if (!text) return null;
  const sentAt =
    typeof obj.sentAt === 'number' && Number.isFinite(obj.sentAt) && obj.sentAt > 0
      ? obj.sentAt
      : Date.now();
  return {
    id: obj.id,
    character: obj.character,
    text,
    sentAt,
  };
}

function loadChatHistory(): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const valid: ChatMessage[] = [];
    for (const item of parsed) {
      const msg = parseChatMessage(item);
      if (msg) valid.push(msg);
    }
    return valid.slice(-MAX_CHAT_HISTORY);
  } catch {
    return [];
  }
}

function saveChatHistory(messages: ChatMessage[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      CHAT_STORAGE_KEY,
      JSON.stringify(messages.slice(-MAX_CHAT_HISTORY))
    );
  } catch {
    // Ignore storage quota errors
  }
}

function formatBubblePreview(text: string): string {
  return text.length > 36 ? `${text.slice(0, 35).trimEnd()}…` : text;
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
    case 'chat': {
      const message = parseChatMessage(obj.message);
      return message ? { type: 'chat', message } : null;
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
  const transport: TransportKind = HAS_SUPABASE ? 'supabase' : 'webrtc';
  const [roomCode, setRoomCode] = useState<string | null>(getInitialRoomFromUrl);
  const [status, setStatus] = useState<MultiplayerStatus>(() =>
    getInitialRoomFromUrl() ? 'connecting' : 'idle'
  );
  const [isHost, setIsHost] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [reconnectTick, setReconnectTick] = useState<number>(0);

  const [emotes, setEmotes] = useState<{ boy: EmoteType | null; girl: EmoteType | null }>({
    boy: null,
    girl: null,
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(loadChatHistory);
  const [chatBubbles, setChatBubbles] = useState<{ boy: string | null; girl: string | null }>({
    boy: null,
    girl: null,
  });

  const remoteStateRef = useRef<CharacterSyncState | null>(null);
  const lastLocalStateRef = useRef<CharacterSyncState | null>(null);
  const lastSentAtRef = useRef<number>(0);
  const lastSentMovingRef = useRef<boolean>(false);
  const lastSentSprintRef = useRef<boolean>(false);
  const lastChatSentAtRef = useRef<number>(0);

  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const clientIdRef = useRef<string>(generateClientId());

  const isHostRef = useRef<boolean>(false);
  const activeCharRef = useRef<CharacterType>(activeCharacter);
  const onAssignCharRef = useRef(onAssignCharacter);
  const emoteTimersRef = useRef<{ boy?: number; girl?: number }>({});
  const chatBubbleTimersRef = useRef<{ boy?: number; girl?: number }>({});

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

  const triggerLocalChatBubble = useCallback((character: CharacterType, text: string) => {
    const preview = formatBubblePreview(text);
    setChatBubbles((prev) => ({ ...prev, [character]: preview }));
    const prevTimer = chatBubbleTimersRef.current[character];
    if (prevTimer) window.clearTimeout(prevTimer);
    chatBubbleTimersRef.current[character] = window.setTimeout(() => {
      setChatBubbles((prev) => ({ ...prev, [character]: null }));
    }, 4500);
  }, []);

  const appendChatMessage = useCallback(
    (msg: ChatMessage) => {
      setChatMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        const next = [...prev, msg].slice(-MAX_CHAT_HISTORY);
        saveChatHistory(next);
        return next;
      });
      triggerLocalChatBubble(msg.character, msg.text);
    },
    [triggerLocalChatBubble]
  );

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
      setReconnectTick((t) => t + 1);
      return nextCode;
    },
    [syncUrlRoom]
  );

  const retryConnection = useCallback(() => {
    if (!roomCode) return;
    setErrorMsg(null);
    setStatus('connecting');
    setReconnectTick((t) => t + 1);
  }, [roomCode]);

  const leaveRoom = useCallback(() => {
    connRef.current?.close();
    connRef.current = null;
    peerRef.current?.destroy();
    peerRef.current = null;
    if (channelRef.current && supabaseClient) {
      supabaseClient.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    remoteStateRef.current = null;
    isHostRef.current = false;
    setIsHost(false);
    setErrorMsg(null);
    setStatus('idle');
    syncUrlRoom(null);
    setRoomCode(null);
  }, [syncUrlRoom]);

  const transmitPacket = useCallback((packet: Record<string, unknown>) => {
    if (supabaseClient && channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'packet',
        payload: { ...packet, senderId: clientIdRef.current },
      });
      return;
    }

    const conn = connRef.current;
    if (conn && conn.open) {
      conn.send(packet);
    }
  }, []);

  // Room connection lifecycle: Supabase Realtime (when configured) OR PeerJS WebRTC fallback
  useEffect(() => {
    if (!roomCode) return;

    let cancelled = false;
    let retryTimer: number | null = null;
    let iceTimeoutTimer: number | null = null;

    const handleIncomingPacket = (packet: IncomingPacket, replyFn: (pkt: Record<string, unknown>) => void) => {
      switch (packet.type) {
        case 'hello':
          if (isHostRef.current) {
            replyFn({
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
          setErrorMsg(null);
          setStatus('connected');
          break;
        }

        case 'state':
          remoteStateRef.current = packet.state;
          break;

        case 'emote':
          triggerLocalEmoteDisplay(packet.character, packet.emote);
          break;

        case 'chat':
          appendChatMessage(packet.message);
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
    };

    // =========================================================================
    // PATH A: Supabase Realtime Broadcast + Presence (Works across 4G/5G/NAT)
    // =========================================================================
    if (supabaseClient) {
      const clientId = clientIdRef.current;
      const joinedAt = Date.now();
      const channel = supabaseClient.channel(`hdtm-room-${roomCode}`, {
        config: {
          broadcast: { self: false },
          presence: { key: clientId },
        },
      });
      channelRef.current = channel;

      const sendViaSupabase = (pkt: Record<string, unknown>) => {
        channel.send({
          type: 'broadcast',
          event: 'packet',
          payload: { ...pkt, senderId: clientId },
        });
      };

      channel.on('broadcast', { event: 'packet' }, ({ payload }) => {
        if (cancelled) return;
        const packet = parsePacket(payload);
        if (!packet) return;
        handleIncomingPacket(packet, sendViaSupabase);
      });

      channel.on('presence', { event: 'sync' }, () => {
        if (cancelled) return;
        const state = channel.presenceState<{ joinedAt: number; clientId: string }>();
        const entries = Object.entries(state)
          .map(([key, metas]) => ({
            key,
            joinedAt: metas[0]?.joinedAt ?? Number.MAX_SAFE_INTEGER,
          }))
          .sort((a, b) => a.joinedAt - b.joinedAt || a.key.localeCompare(b.key));

        if (entries.length === 0) return;

        const amHost = entries[0].key === clientId;
        isHostRef.current = amHost;
        setIsHost(amHost);

        if (entries.length >= 2) {
          setErrorMsg(null);
          setStatus('connected');
          if (amHost) {
            sendViaSupabase({
              type: 'welcome',
              hostCharacter: activeCharRef.current,
              state: lastLocalStateRef.current ?? undefined,
            });
          } else {
            sendViaSupabase({ type: 'hello' });
          }
        } else {
          remoteStateRef.current = null;
          setStatus('waiting');
        }
      });

      channel.subscribe(async (subStatus) => {
        if (cancelled) return;
        if (subStatus === 'SUBSCRIBED') {
          await channel.track({ clientId, joinedAt });
        } else if (subStatus === 'CHANNEL_ERROR' || subStatus === 'TIMED_OUT') {
          setStatus('error');
          setErrorMsg('Không thể kết nối máy chủ Supabase Realtime. Hãy kiểm tra URL/Key.');
        }
      });

      return () => {
        cancelled = true;
        if (channelRef.current) {
          supabaseClient.removeChannel(channelRef.current);
          channelRef.current = null;
        }
      };
    }

    // =========================================================================
    // PATH B: PeerJS WebRTC P2P Fallback (Same Wi-Fi or TURN-enabled)
    // =========================================================================
    const hostPeerId = `hdtm-v1-${roomCode}-host`;

    const cleanupInstances = () => {
      if (retryTimer) {
        window.clearTimeout(retryTimer);
        retryTimer = null;
      }
      if (iceTimeoutTimer) {
        window.clearTimeout(iceTimeoutTimer);
        iceTimeoutTimer = null;
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

      // Monitor WebRTC ICE failure / timeout so distant 4G users aren't stuck silently
      iceTimeoutTimer = window.setTimeout(() => {
        if (cancelled || conn.open) return;
        setStatus('error');
        setErrorMsg(
          '2 thiết bị ở khác mạng/4G nên kết nối P2P bị nhà mạng chặn. Hãy cấu hình Supabase Realtime (miễn phí) hoặc TURN server để chơi xuyên mọi mạng.'
        );
      }, 11000);

      const pc = conn.peerConnection;
      if (pc) {
        pc.addEventListener('iceconnectionstatechange', () => {
          if (cancelled) return;
          if (pc.iceConnectionState === 'failed') {
            if (iceTimeoutTimer) window.clearTimeout(iceTimeoutTimer);
            setStatus('error');
            setErrorMsg(
              'Kết nối P2P bị tường lửa 4G/NAT chặn. Hãy dùng Supabase Realtime để 2 máy ở xa kết nối 100% ổn định.'
            );
          }
        });
      }

      conn.on('open', () => {
        if (cancelled) return;
        if (iceTimeoutTimer) {
          window.clearTimeout(iceTimeoutTimer);
          iceTimeoutTimer = null;
        }
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
        handleIncomingPacket(packet, (pkt) => conn.send(pkt));
      });

      conn.on('close', () => {
        if (cancelled) return;
        if (iceTimeoutTimer) window.clearTimeout(iceTimeoutTimer);
        if (connRef.current === conn) {
          connRef.current = null;
        }
        remoteStateRef.current = null;
        if (isHostRef.current) {
          setStatus('waiting');
        } else {
          setStatus('connecting');
          retryTimer = window.setTimeout(() => {
            if (!cancelled) startHostOrGuest();
          }, 800);
        }
      });

      conn.on('error', () => {
        if (cancelled) return;
        setStatus('error');
        setErrorMsg('Kết nối P2P gặp sự cố. Bấm thử lại hoặc cấu hình Supabase Realtime.');
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
  }, [roomCode, reconnectTick, triggerLocalEmoteDisplay, appendChatMessage]);

  const sendLocalState = useCallback(
    (state: CharacterSyncState) => {
      lastLocalStateRef.current = state;

      if (!supabaseClient && (!connRef.current || !connRef.current.open)) {
        return;
      }
      if (supabaseClient && !channelRef.current) {
        return;
      }

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

      transmitPacket({
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
    },
    [transmitPacket]
  );

  const sendEmote = useCallback(
    (emote: EmoteType) => {
      const char = activeCharRef.current;
      triggerLocalEmoteDisplay(char, emote);
      transmitPacket({ type: 'emote', character: char, emote });
    },
    [triggerLocalEmoteDisplay, transmitPacket]
  );

  const sendChatMessage = useCallback(
    (rawText: string): boolean => {
      const text = sanitizeChatText(rawText);
      if (!text) return false;

      const now = Date.now();
      if (now - lastChatSentAtRef.current < 250) return false;
      lastChatSentAtRef.current = now;

      const msg: ChatMessage = {
        id: `${clientIdRef.current}-${now}-${Math.random().toString(36).slice(2, 6)}`,
        character: activeCharRef.current,
        text,
        sentAt: now,
      };
      appendChatMessage(msg);
      transmitPacket({ type: 'chat', message: msg });
      return true;
    },
    [appendChatMessage, transmitPacket]
  );

  const clearChatHistory = useCallback(() => {
    setChatMessages([]);
    saveChatHistory([]);
  }, []);

  const swapRoles = useCallback(() => {
    const nextLocal: CharacterType = activeCharRef.current === 'boy' ? 'girl' : 'boy';
    onAssignCharRef.current(nextLocal);
    remoteStateRef.current = null;

    const nextHostChar: CharacterType = isHostRef.current
      ? nextLocal
      : nextLocal === 'boy'
        ? 'girl'
        : 'boy';
    transmitPacket({ type: 'swap_role', hostCharacter: nextHostChar });
  }, [transmitPacket]);

  const inviteUrl =
    typeof window !== 'undefined' && roomCode
      ? `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(roomCode)}`
      : null;

  return {
    transport,
    roomCode,
    inviteUrl,
    status,
    isHost,
    isPartnerOnline: status === 'connected',
    errorMsg,
    remoteStateRef,
    emotes,
    chatMessages,
    chatBubbles,
    createRoom,
    retryConnection,
    leaveRoom,
    sendLocalState,
    sendEmote,
    sendChatMessage,
    clearChatHistory,
    swapRoles,
  };
};

export default useMultiplayer;
