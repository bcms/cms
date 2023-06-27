export class General {
  static async delay(time: number): Promise<void> {
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, time);
    });
  }
}
