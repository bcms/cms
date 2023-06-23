export class BCMSColorService {
  static check(color: string): boolean {
    const checkHex = /^#[0-9A-Fa-f]{6}(?:[0-9A-Fa-f]{2})?$/g;
    return color.match(checkHex) ? true : false;
  }
}
