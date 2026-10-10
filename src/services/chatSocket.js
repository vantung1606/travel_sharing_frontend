import { Client } from '@stomp/stompjs';

class ChatSocketService {
  constructor() {
    this.client = null;
    this.subscriptions = new Map();
    this.isConnected = false;
  }

  connect(onConnected) {
    if (this.client && this.isConnected) {
      if (onConnected) onConnected();
      return;
    }

    const host = window.location.hostname || 'localhost';
    const wsUrl = `ws://${host}:8081/ws/chat`;

    this.client = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 2500,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: () => {}, // Tắt log verbose để sạch console
      onConnect: () => {
        this.isConnected = true;
        if (onConnected) onConnected();
      },
      onStompError: (frame) => {
        console.warn('[STOMP Chat] Lỗi broker:', frame.headers['message']);
      },
      onWebSocketClose: () => {
        this.isConnected = false;
      }
    });

    this.client.activate();
  }

  subscribeToRoom(roomId, onMessage) {
    if (!roomId) return () => {};
    this.connect();

    const topic = `/topic/room.${roomId}`;

    // Hủy đăng ký cũ nếu có
    if (this.subscriptions.has(roomId)) {
      try {
        this.subscriptions.get(roomId).unsubscribe();
      } catch (e) {}
    }

    const doSub = () => {
      if (!this.client || !this.client.connected) return;
      const sub = this.client.subscribe(topic, (message) => {
        try {
          const body = JSON.parse(message.body);
          if (onMessage) onMessage(body);
        } catch (e) {
          console.warn('[STOMP Chat] Lỗi parse payload:', e);
        }
      });
      this.subscriptions.set(roomId, sub);
    };

    if (this.client && this.client.connected) {
      doSub();
    } else {
      const checkInterval = setInterval(() => {
        if (this.client && this.client.connected) {
          clearInterval(checkInterval);
          doSub();
        }
      }, 150);
      setTimeout(() => clearInterval(checkInterval), 4000);
    }

    return () => {
      if (this.subscriptions.has(roomId)) {
        try {
          this.subscriptions.get(roomId).unsubscribe();
        } catch (e) {}
        this.subscriptions.delete(roomId);
      }
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
    }
  }
}

export const chatSocket = new ChatSocketService();
export default chatSocket;
