export type BCMSConfirmService = (
  title: string,
  text: string,
  prompt?: string
) => Promise<boolean>;
