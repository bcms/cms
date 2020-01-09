export class WidgetUtil {
  public static nameEncode(name: string): string {
    return name
      .toLowerCase()
      .replace(/ /g, '_')
      .replace(/-/g, '_')
      .replace(/[^0-9a-z_-_]+/g, '');
  }
}
