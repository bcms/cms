import { StringUtility } from '@banez/string-utility';

export class StringUtil extends StringUtility {
  static toPretty(s: string): string {
    const output: string[] = [];
    let buffer = '';
    for (let i = 0; i < s.length; i++) {
      if (i > 0) {
        const code = s.codePointAt(i) as number;
        if (code > 64 && code < 92) {
          output.push(buffer);
          buffer = '' + s[i];
        } else if (code === 45) {
          output.push(buffer);
          buffer = '';
        } else if (code === 95) {
          output.push(buffer);
          buffer = '';
        } else {
          buffer += s[i];
        }
      } else {
        buffer += s[i];
      }
    }
    output.push(buffer);
    return output
      .map(
        (e) => e.substring(0, 1).toUpperCase() + e.substring(1).toLowerCase()
      )
      .join(' ');
  }
}
