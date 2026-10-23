import { Client } from '@stomp/stompjs';

class ChatSocketService {
  constructor() {
    this.client = null;
    this.subscriptions = new Map();
    this.roomCallbacks = new Map(); // roomId -> Set of callbacks
    this.notifListeners = new Map(); // key -> { userId, userEmail, callback, subs: [] }
    this.isConnected = false;
  }

  connect(onConnected) {
    if (this.client && this.client.active) {
      if (this.isConnected && onConnected) onConnected();
      return;
    }

    const getWsUrl = () => {
      if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;
      if (import.meta.env.VITE_API_URL) {
        const clean = import.meta.env.VITE_API_URL.replace(/^http/, 'ws').replace(/\/api\/?$/, '');
        return `${clean}/ws/chat`;
      }
      const host = window.location.hostname || 'localhost';
      return `ws://${host}:8081/ws/chat`;
    };
    const wsUrl = getWsUrl();

    this.client = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 2500,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: () => {}, // Tắt log verbose để sạch console
      onConnect: () => {
        this.isConnected = true;
        // Tự động re-subscribe lại toàn bộ các room và kênh thông báo đang active khi reconnect thành công
        this.reapplyAllSubscriptions();
        if (onConnected) onConnected();
      },
      onWebSocketError: () => {},
      onStompError: () => {},
      onWebSocketClose: () => {
        this.isConnected = false;
        // Dọn dẹp con trỏ subscription cũ vì socket đã đóng, broker đã hủy session
        this.subscriptions.clear();
      }
    });

    this.client.activate();
  }

  reapplyAllSubscriptions() {
    if (!this.client || !this.client.connected) return;

    // 1. Re-subscribe các phòng chat đang mở
    for (const [roomId, callbacks] of this.roomCallbacks.entries()) {
      if (!callbacks || callbacks.size === 0) continue;
      const topic = `/topic/room.${roomId}`;
      try {
        const sub = this.client.subscribe(topic, (message) => {
          try {
            const body = JSON.parse(message.body);
            callbacks.forEach(cb => {
              try { cb(body); } catch {}
            });
          } catch {}
        });
        this.subscriptions.set(roomId, sub);
      } catch {}
    }

    // 2. Re-subscribe các kênh thông báo
    for (const [key, item] of this.notifListeners.entries()) {
      if (!item || !item.callback) continue;
      item.subs = [];
      const { userId, userEmail, callback } = item;

      if (userId) {
        try {
          const subId = this.client.subscribe(`/topic/notifications.${userId}`, (msg) => {
            try { callback(JSON.parse(msg.body)); } catch (e) {}
          });
          item.subs.push(subId);
        } catch (e) {}
      } else if (userEmail) {
        try {
          const subEmail = this.client.subscribe(`/topic/notifications.${userEmail.toLowerCase().trim()}`, (msg) => {
            try { callback(JSON.parse(msg.body)); } catch (e) {}
          });
          item.subs.push(subEmail);
        } catch (e) {}
      }

      try {
        const subBc = this.client.subscribe(`/topic/notifications.broadcast`, (msg) => {
          try { callback(JSON.parse(msg.body)); } catch (e) {}
        });
        item.subs.push(subBc);
      } catch (e) {}
    }
  }

  subscribeToRoom(roomId, onMessage) {
    if (!roomId || !onMessage) return () => {};
    this.connect();

    if (!this.roomCallbacks.has(roomId)) {
      this.roomCallbacks.set(roomId, new Set());
    }
    const cbs = this.roomCallbacks.get(roomId);
    cbs.add(onMessage);

    const topic = `/topic/room.${roomId}`;

    const setupSub = () => {
      if (!this.client || !this.client.connected) return;
      if (this.subscriptions.has(roomId)) return; // Đã subscribe topic này rồi

      try {
        const sub = this.client.subscribe(topic, (message) => {
          try {
            const body = JSON.parse(message.body);
            const activeCbs = this.roomCallbacks.get(roomId);
            if (activeCbs) {
              activeCbs.forEach(cb => {
                try { cb(body); } catch {}
              });
            }
          } catch {}
        });
        this.subscriptions.set(roomId, sub);
      } catch {}
    };

    if (this.client && this.client.connected) {
      setupSub();
    } else {
      const checkInterval = setInterval(() => {
        if (this.client && this.client.connected) {
          clearInterval(checkInterval);
          setupSub();
        }
      }, 150);
      setTimeout(() => clearInterval(checkInterval), 4000);
    }

    return () => {
      const activeCbs = this.roomCallbacks.get(roomId);
      if (activeCbs) {
        activeCbs.delete(onMessage);
        if (activeCbs.size === 0) {
          this.roomCallbacks.delete(roomId);
          if (this.subscriptions.has(roomId)) {
            try {
              this.subscriptions.get(roomId).unsubscribe();
            } catch (e) {}
            this.subscriptions.delete(roomId);
          }
        }
      }
    };
  }

  subscribeToNotifications(userId, userEmail, onNotification) {
    if (!onNotification) return () => {};
    this.connect();

    const listenerKey = `${userId || 'anon'}_${userEmail || 'anon'}_${Date.now()}`;
    const listenerItem = {
      userId,
      userEmail,
      callback: onNotification,
      subs: []
    };
    this.notifListeners.set(listenerKey, listenerItem);

    const doSub = () => {
      if (!this.client || !this.client.connected) return;

      if (userId) {
        try {
          const subId = this.client.subscribe(`/topic/notifications.${userId}`, (msg) => {
            try { onNotification(JSON.parse(msg.body)); } catch (e) {}
          });
          listenerItem.subs.push(subId);
        } catch (e) {}
      } else if (userEmail) {
        try {
          const subEmail = this.client.subscribe(`/topic/notifications.${userEmail.toLowerCase().trim()}`, (msg) => {
            try { onNotification(JSON.parse(msg.body)); } catch (e) {}
          });
          listenerItem.subs.push(subEmail);
        } catch (e) {}
      }

      try {
        const subBc = this.client.subscribe(`/topic/notifications.broadcast`, (msg) => {
          try { onNotification(JSON.parse(msg.body)); } catch (e) {}
        });
        listenerItem.subs.push(subBc);
      } catch (e) {}
    };

    let checkInterval = null;
    if (this.client && this.client.connected) {
      doSub();
    } else {
      checkInterval = setInterval(() => {
        if (this.client && this.client.connected) {
          clearInterval(checkInterval);
          checkInterval = null;
          doSub();
        }
      }, 150);
      setTimeout(() => {
        if (checkInterval) {
          clearInterval(checkInterval);
          checkInterval = null;
        }
      }, 5000);
    }

    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
        checkInterval = null;
      }
      if (listenerItem.subs) {
        listenerItem.subs.forEach(s => {
          try { s.unsubscribe(); } catch (e) {}
        });
      }
      this.notifListeners.delete(listenerKey);
    };
  }

  disconnect() {
    if (this.client) {
      try {
        this.client.deactivate();
      } catch (e) {}
      this.client = null;
      this.isConnected = false;
      this.subscriptions.clear();
      this.roomCallbacks.clear();
      this.notifListeners.clear();
    }
  }
}

export const chatSocket = new ChatSocketService();
export default chatSocket;
