export class BCMSRouteTracker {
  static connections: {
    [id: string]: string;
  } = {};

  static findByPath(path: string): Array<{
    userId: string;
    sid: string;
  }> {
    const output: Array<{
      userId: string;
      sid: string;
    }> = [];
    for (const id in BCMSRouteTracker.connections) {
      if (BCMSRouteTracker.connections[id] === path) {
        const [userId, sid] = id.split('_');
        output.push({
          userId,
          sid,
        });
      }
    }
    return output;
  }
}
