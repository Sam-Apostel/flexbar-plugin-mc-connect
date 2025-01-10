// commands/debug.js
import logger from '../utils/logger.js';

/**
 * Handles the 'debug' command.
 * @param {WebSocketClient} wsClient - The WebSocket client instance.
 * @param {Object} options - The command options.
 */
export default async function debugCommand(wsClient, options) {
  const { uuid } = options;
  const cmd = `plugin operation=debug --uuid=${uuid}`;

  try {
    const response = await wsClient.sendCommand(cmd);
    if (response.result === 'success') {
      const payload = JSON.parse(response.payload);
      logger.info(`Debug command successful: Port ${payload.port}`);
    } else {
      logger.error(`Debug command failed: ${response.payload}`);
    }
  } catch (error) {
    logger.error(`Error in debug command: ${error.message}`);
  }
}
