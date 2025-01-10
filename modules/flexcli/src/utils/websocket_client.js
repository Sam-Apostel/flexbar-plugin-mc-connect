// utils/websocket_client.js
import WebSocket from 'ws';
import logger from './logger.js';

export default class WebSocketClient {
  /**
   * Initializes the WebSocket client.
   * @param {number} port - The port to connect to.
   */
  constructor(port) {
    this.port = port;
    this.ws = null;
    this.responseHandlers = new Map();
  }

  /**
   * Connects to the WebSocket server.
   * @returns {Promise<void>}
   */
  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(`ws://localhost:${this.port}`);

      this.ws.on('open', () => {
        logger.info(`Connected to WebSocket server on port ${this.port}`);
        resolve();
      });

      this.ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          if (message.type === 'command-response' && message.uuid) {
            const handler = this.responseHandlers.get(message.uuid);
            if (handler) {
              handler.resolve(message);
              this.responseHandlers.delete(message.uuid);
            }
          }
        } catch (error) {
          logger.error(`Failed to parse message: ${error.message}`);
        }
      });

      this.ws.on('error', (error) => {
        logger.error(`WebSocket error: ${error.message}`);
        reject(error);
      });

      this.ws.on('close', () => {
        logger.info('WebSocket connection closed');
      });
    });
  }

  /**
   * Sends a command and waits for the response.
   * @param {string} payload - The command payload.
   * @returns {Promise<Object>} - The response from the server.
   */
  sendCommand(payload) {
    const uuid = Date.now().toString();
    const message = {
      type: 'plugin-command',
      payload,
      uuid,
    };

    return new Promise((resolve, reject) => {
      this.responseHandlers.set(uuid, { resolve, reject });
      this.ws.send(JSON.stringify(message), (error) => {
        if (error) {
          logger.error(`Failed to send command: ${error.message}`);
          this.responseHandlers.delete(uuid);
          reject(error);
        } else {
          logger.info(`Sent command: ${payload} with UUID: ${uuid}`);
        }
      });

      // 设置响应超时
      setTimeout(() => {
        if (this.responseHandlers.has(uuid)) {
          logger.warn(`Timeout waiting for response for UUID: ${uuid}`);
          this.responseHandlers.delete(uuid);
          reject(new Error('Response timeout'));
        }
      }, 5000);
    });
  }

  /**
   * Closes the WebSocket connection.
   */
  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}
