import { v4 as uuidv4 } from 'uuid';
export class Sub {
  private static subs: Array<{
    id: string;
    name: string;
    handler: (...args: any[]) => void;
  }> = [];

  static register(name: string, handler: (...args: any[]) => void): () => void {
    const id = uuidv4();
    Sub.subs.push({
      id,
      name,
      handler,
    });
    return () => {
      for (let i = 0; i < Sub.subs.length; i++) {
        const sub = Sub.subs[i];
        if (sub.id === id) {
          Sub.subs.splice(i, 1);
          break;
        }
      }
    };
  }

  static trigger(name: string, ...args: any[]) {
    for (let i = 0; i < Sub.subs.length; i++) {
      const sub = Sub.subs[i];
      if (sub.name === name) {
        sub.handler(...args);
      }
    }
  }
}
