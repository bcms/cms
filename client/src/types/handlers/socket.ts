import type { BCMSSocketEvent, BCMSSocketEventName } from '../models';

export type BCMSClientSocketEventName = BCMSSocketEventName | string | 'ANY';

export interface BCMSClientSocketEventCallback<Data = BCMSSocketEvent> {
  (data: { eventName: BCMSClientSocketEventName; data: Data }): Promise<void>;
}

/**
 * The BCMS socket handler.
 */
export interface BCMSClientSocketHandler {
  /**
   * Get the socket ID.
   */
  id(): string | null;
  /**
   * Connect to the BCMS socket server.
   */
  connect(): Promise<void>;
  /**
   * Disconnect from the BCMS socket server.
   */
  disconnect(): void;
  /**
   * Check if socket is connected
   */
  connected(): boolean;
  /**
   * Emit an event to the BCMS socket server.
   */
  emit<Data = BCMSSocketEvent>(event: string, data: Data): void;
  /**
   * Subscribe to the BCMS socket server event.
   */
  subscribe<CallbackData = BCMSSocketEvent>(
    /**
     * Name of the event.
     */
    event: BCMSClientSocketEventName,
    /**
     * Event handler. This function will be called when
     * specified event if triggered.
     */
    callback: BCMSClientSocketEventCallback<CallbackData>,
  ): () => void;
}
