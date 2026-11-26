import React, { useState, useRef, useEffect, useMemo } from 'react';
import '../../styles/chat.css';
import type { CharacterType } from '../character/types';
import { characterConfig } from '../../data/characterConfig';
import type { ChatMessage } from '../../hooks/useMultiplayer';

interface ChatBoxProps {
  messages: ChatMessage[];
  activeCharacter: CharacterType;
  isPartnerOnline: boolean;
  onSendMessage: (text: string) => boolean;
  onClearHistory: () => void;
  onInputFocusChange: (focused: boolean) => void;
  visible?: boolean;
}

const QUICK_REPLIES = ['❤️', '🥰', 'Lại đây xem ảnh nè!', 'Nhớ quá!', 'Đợi chút nha'];

function normalizeVietnamese(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function formatDayLabel(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfMsgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfToday - startOfMsgDay) / 86400000);
  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Hôm qua';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function renderHighlightedText(text: string, query: string): React.ReactNode {
  const trimmed = query.trim();
  if (!trimmed) return text;

  const normText = normalizeVietnamese(text);
  const normQuery = normalizeVietnamese(trimmed);
  if (!normQuery) return text;

  const parts: React.ReactNode[] = [];
  let cursor = 0;
  let matchIdx = normText.indexOf(normQuery, cursor);

  while (matchIdx !== -1) {
    if (matchIdx > cursor) {
      parts.push(text.slice(cursor, matchIdx));
    }
    parts.push(
      <mark key={`${matchIdx}-${cursor}`} className="chat-highlight">
        {text.slice(matchIdx, matchIdx + normQuery.length)}
      </mark>
    );
    cursor = matchIdx + normQuery.length;
    matchIdx = normText.indexOf(normQuery, cursor);
  }

  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return parts.length > 0 ? parts : text;
}

export const ChatBox: React.FC<ChatBoxProps> = ({
  messages,
  activeCharacter,
  isPartnerOnline,
  onSendMessage,
  onClearHistory,
  onInputFocusChange,
  visible = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [confirmClear, setConfirmClear] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const prevMsgCountRef = useRef<number>(messages.length);

  // Track unread incoming messages while chat drawer is closed
  useEffect(() => {
    const prevCount = prevMsgCountRef.current;
    if (messages.length > prevCount) {
      if (!isOpen) {
        const added = messages.slice(prevCount);
        const incoming = added.filter((m) => m.character !== activeCharacter).length;
        if (incoming > 0) {
          setUnreadCount((c) => c + incoming);
        }
      }
    }
    prevMsgCountRef.current = messages.length;
  }, [messages, isOpen, activeCharacter]);

  // Ensure keyboard controls resume when chat panel is closed
  useEffect(() => {
    if (!isOpen) {
      onInputFocusChange(false);
    }
  }, [isOpen, onInputFocusChange]);

  const filteredMessages = useMemo(() => {
    const q = normalizeVietnamese(searchQuery.trim());
    if (!q) return messages;
    return messages.filter((msg) => {
      const senderName = normalizeVietnamese(characterConfig[msg.character].displayName);
      return normalizeVietnamese(msg.text).includes(q) || senderName.includes(q);
    });
  }, [messages, searchQuery]);

  // Auto-scroll to newest message when open and not filtering by keyword
  useEffect(() => {
    if (!isOpen || searchQuery.trim()) return;
    const el = listRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [filteredMessages.length, isOpen, searchQuery]);

  if (!visible) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    if (onSendMessage(draft)) {
      setDraft('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.currentTarget.blur();
      onInputFocusChange(false);
    }
  };

  const handleToggleSearch = () => {
    setShowSearch((prev) => {
      const next = !prev;
      if (!next) {
        setSearchQuery('');
      } else {
        window.setTimeout(() => searchInputRef.current?.focus(), 40);
      }
      return next;
    });
  };

  const handleClearClick = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      window.setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    onClearHistory();
    setSearchQuery('');
    setConfirmClear(false);
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        className="chat-toggle-btn"
        onClick={() => {
          setIsOpen(true);
          setUnreadCount(0);
        }}
        aria-label="Mở đoạn chat"
      >
        <span aria-hidden="true">💬</span>
        <span>Chat</span>
        {unreadCount > 0 && <span className="chat-unread-badge">{unreadCount}</span>}
      </button>
    );
  }

  return (
    <section className="chat-panel" aria-label="Đoạn chat và lịch sử tin nhắn">
      <header className="chat-header">
        <div className="chat-header-left">
          <span className="chat-title">
            {isPartnerOnline ? '💬 Đang trò chuyện' : '💬 Nhật ký chat'}
          </span>
          <span className="chat-history-count" title="Tổng số tin nhắn đã lưu">
            {messages.length}
          </span>
        </div>

        <div className="chat-header-actions">
          <button
            type="button"
            className={`chat-icon-btn ${showSearch ? 'active' : ''}`}
            onClick={handleToggleSearch}
            title="Tìm kiếm tin nhắn theo từ khóa"
            aria-label="Tìm kiếm tin nhắn"
          >
            🔍
          </button>
          {messages.length > 0 && (
            <button
              type="button"
              className={`chat-icon-btn ${confirmClear ? 'active' : ''}`}
              onClick={handleClearClick}
              title={confirmClear ? 'Bấm lần nữa để xóa toàn bộ lịch sử' : 'Xóa lịch sử chat'}
              aria-label="Xóa lịch sử chat"
            >
              {confirmClear ? '✓' : '🗑️'}
            </button>
          )}
          <button
            type="button"
            className="chat-icon-btn"
            onClick={() => {
              setIsOpen(false);
              setConfirmClear(false);
            }}
            title="Thu gọn chat"
            aria-label="Đóng chat"
          >
            ✕
          </button>
        </div>
      </header>

      {showSearch && (
        <div className="chat-search-bar">
          <div className="chat-search-input-wrap">
            <span aria-hidden="true">🔍</span>
            <input
              ref={searchInputRef}
              type="text"
              className="chat-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => onInputFocusChange(true)}
              onBlur={() => onInputFocusChange(false)}
              onKeyDown={handleKeyDown}
              placeholder="Tìm từ khóa hoặc tên..."
              aria-label="Từ khóa tìm kiếm tin nhắn"
            />
            {searchQuery && (
              <button
                type="button"
                className="chat-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Xóa từ khóa"
              >
                ✕
              </button>
            )}
          </div>
          {searchQuery.trim() && (
            <div className="chat-search-meta">
              Tìm thấy <strong>{filteredMessages.length}</strong> / {messages.length} tin nhắn
            </div>
          )}
        </div>
      )}

      <div ref={listRef} className="chat-messages">
        {filteredMessages.length === 0 ? (
          <div className="chat-empty">
            {searchQuery.trim()
              ? `Không tìm thấy tin nhắn nào khớp "${searchQuery.trim()}".`
              : 'Chưa có tin nhắn nào. Hãy gửi lời chào hoặc kỷ niệm cho nhau nhé!'}
          </div>
        ) : (
          filteredMessages.map((msg, idx) => {
            const cfg = characterConfig[msg.character];
            const isOwn = msg.character === activeCharacter;
            const dayLabel = formatDayLabel(msg.sentAt);
            const prevDayLabel = idx > 0 ? formatDayLabel(filteredMessages[idx - 1].sentAt) : '';
            const showDayDivider = dayLabel !== prevDayLabel;

            return (
              <React.Fragment key={msg.id}>
                {showDayDivider && <div className="chat-date-divider">{dayLabel}</div>}
                <div className={`chat-msg-row ${msg.character} ${isOwn ? 'own' : 'other'}`}>
                  <div className="chat-msg-sender">
                    <span>{cfg.avatarIcon}</span>
                    <span>{cfg.displayName}</span>
                    <span className="chat-msg-time">{formatTime(msg.sentAt)}</span>
                  </div>
                  <div className="chat-bubble">
                    {renderHighlightedText(msg.text, searchQuery)}
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
      </div>

      <div className="chat-quick-row" aria-label="Gửi nhanh">
        {QUICK_REPLIES.map((chip) => (
          <button
            key={chip}
            type="button"
            className="chat-quick-chip"
            onClick={() => onSendMessage(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      <form className="chat-input-form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          className="chat-input"
          value={draft}
          maxLength={240}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={() => onInputFocusChange(true)}
          onBlur={() => onInputFocusChange(false)}
          onKeyDown={handleKeyDown}
          placeholder={`Nhắn với tư cách ${characterConfig[activeCharacter].displayName}...`}
          aria-label="Nhập tin nhắn"
        />
        <button type="submit" className="chat-send-btn" disabled={!draft.trim()}>
          Gửi
        </button>
      </form>
    </section>
  );
};

export default ChatBox;
