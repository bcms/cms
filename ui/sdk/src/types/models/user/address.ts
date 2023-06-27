export interface BCMSUserAddress {
  country?: string;
  city?: string;
  state?: string;
  zip?: string;
  street?: {
    name: string;
    number: string;
  };
}
