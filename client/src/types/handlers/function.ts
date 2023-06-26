/**
 * The BCMS functions API handler.
 */
export interface BCMSClientFunctionHandler {
  /**
   * Call the BCMS function.
   */
  call<Payload, Result>(
    /**
     * Name of the function to call.
     */
    functionName: string,
    /**
     * Payload/body of a function request.
     */
    payload?: Payload,
  ): Promise<{
    success: boolean;
    result: Result;
  }>;
}
