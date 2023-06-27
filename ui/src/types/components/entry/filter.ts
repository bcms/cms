export interface BCMSEntryFiltersOption {
  label: string;
  fromDate?: {
    year: number;
    month: number;
    day: number;
  };
  toDate?: {
    year: number;
    month: number;
    day: number;
  };
}
export interface BCMSEntryFiltersSearch {
  name: string;
}
export interface BCMSEntryFilters {
  search: BCMSEntryFiltersSearch;
  isOpen: boolean;
  options: BCMSEntryFiltersOption[];
}
