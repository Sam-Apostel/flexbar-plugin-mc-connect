// commands/debug.js
import logger from '../utils/logger.js';

/**
 * Handles the 'debug' command.
 * @param {WebSocketClient} wsClient - The WebSocket client instance.
 * @param {Object} options - The command options.
 */
export default async function debugCommand(wsClient, options) {
  const { uuid } = options;
  const cmd = {
    cmd: 'plugin',
    operation: 'debug',
    debug: options.debug === 'true',
    uuid,
  }

  try {
    const response = await wsClient.sendCommand(cmd);
    if (response.payload.result === 'success') {
      logger.info(`Debug command successful: ${JSON.stringify(response, null, 2)}`);
    } else {
      logger.error(`Debug command failed: ${JSON.stringify(response, null, 2)}`);
    }
  } catch (error) {
    logger.error(`Error in debug command: ${error.message}`);
  }
}
