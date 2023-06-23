import type { SocketConnection } from "@becomes/purple-cheetah-mod-socket/types";

export interface BCMSSocketEntrySyncManagerConnInfo {
  sid: string;
  uid: string;
  age: number;
  conn: SocketConnection<unknown>;
  lastCheck: number;
}
