import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { PeerConnection } from './peer.js';
import { SceneManager } from './scene.js';

class App {
  constructor() {
    this.sceneManager = new SceneManager();
    this.peer = new PeerConnection(this.handlePeerMessage.bind(this));
    
    this.setupUI();
    this.animate();
  }

  setupUI() {
    document.getElementById('connect-btn').addEventListener('click', () => {
      const peerId = document.getElementById('peer-id').value;
      if (peerId) {
        this.peer.connect(peerId);
      }
    });

    this.peer.on('id', (id) => {
      document.getElementById('my-id').textContent = `Your ID: ${id}`;
    });

    this.peer.on('connection', (status) => {
      document.getElementById('connection-status').textContent = `Status: ${status}`;
    });
  }

  handlePeerMessage(data) {
    if (data.type === 'sceneUpdate') {
      this.sceneManager.updateFromPeer(data.objects);
    }
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    
    this.sceneManager.update();
    
    // Send scene state to peer
    if (this.peer.isConnected()) {
      this.peer.send({
        type: 'sceneUpdate',
        objects: this.sceneManager.getSerializableState()
      });
    }
  }
}

new App();