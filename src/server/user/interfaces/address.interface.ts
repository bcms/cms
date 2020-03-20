export interface Address {
  country?: string;
  city?: string;
  state?: string;
  zip?: string;
  street?: {
    name: string;
    number: string;
  };
}
