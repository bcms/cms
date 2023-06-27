export interface BCMSClientConsole {
  info(place: string, message: unknown): void;
  warn(place: string, message: unknown): void;
  error(place: string, message: unknown): void;
}
