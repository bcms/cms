export interface BCMSColorUtility {
  check(color: string): boolean;
  checkWithAlpha(color: string): boolean;
  colors: Array<{
    main: string;
    class: {
      bg: string;
      text: string;
    };
  }>;
}
