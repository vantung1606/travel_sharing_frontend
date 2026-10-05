import { useEffect, useRef } from 'react';
import { BASE_URL } from '../services/api';

/**
 * Shared realtime connection to the community SSE stream.
 * A single EventSource is shared by every component that uses the hook
 * (feed, comment drawer, post detail modal) and is closed when nobody listens.
 *
 * Events: { type: 'COMMENT_ADDED' | 'COMMENT_DELETED' | 'LIKE_CHANGED', postId, actorEmail, commentCount?, likeCount?, ... }
 */
const STREAM_URL = `${BASE_URL}/realtime/community/stream`;
const listeners = new Set();
let source = null;

const dispatch = (raw) => {
  try {
    const event = JSON.parse(raw.data);
    listeners.forEach((fn) => {
      try {
        fn(event);
      } catch (err) {
        console.error('[Realtime] Listener error:', err);
      }
    });
  } catch (err) {
    console.warn('[Realtime] Invalid event payload:', err);
  }
};

const ensureConnection = () => {
  if (source || typeof window === 'undefined' || !window.EventSource) return;
  source = new EventSource(STREAM_URL);
  source.addEventListener('comment', dispatch);
  source.addEventListener('like', dispatch);
  source.addEventListener('connected', () => console.info('[Realtime] Community stream connected'));
  // EventSource auto-reconnects on network errors; we only log here.
  source.onerror = () => console.warn('[Realtime] Community stream interrupted, browser will retry...');
};

const closeIfIdle = () => {
  if (listeners.size === 0 && source) {
    source.close();
    source = null;
  }
};

export const useCommunityRealtime = (handler) => {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const listener = (event) => handlerRef.current?.(event);
    listeners.add(listener);
    ensureConnection();
    return () => {
      listeners.delete(listener);
      closeIfIdle();
    };
  }, []);
};

export default useCommunityRealtime;
