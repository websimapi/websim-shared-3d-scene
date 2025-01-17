import { Peer } from 'https://unpkg.com/peerjs@1.4.7/dist/peerjs.min.js';

export class PeerConnection {
  constructor(onMessage) {
    this.peer = new Peer();
    this.connection = null;
    this.onMessage = onMessage;
    this.callbacks = new Map();

    this.peer.on('open', (id) => {
      this.emit('id', id);
    });

    this.peer.on('connection', (conn) => {
      this.handleConnection(conn);
    });
  }

  connect(peerId) {
    const conn = this.peer.connect(peerId);
    this.handleConnection(conn);
  }

  handleConnection(conn) {
    this.connection = conn;
    this.emit('connection', 'Connected');

    conn.on('data', (data) => {
      this.onMessage(data);
    });

    conn.on('close', () => {
      this.connection = null;
      this.emit('connection', 'Disconnected');
    });
  }

  send(data) {
    if (this.connection && this.connection.open) {
      this.connection.send(data);
    }
  }

  isConnected() {
    return this.connection && this.connection.open;
  }

  on(event, callback) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event).push(callback);
  }

  emit(event, data) {
    const callbacks = this.callbacks.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }
}