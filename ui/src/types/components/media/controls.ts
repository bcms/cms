export interface BCMSMediaControlFiltersOptions {
  label: string;
  dropdown?: {
    items: Array<{
      label: string;
      value: string;
    }>;
    selected: {
      label: string;
      value: string;
    };
  };
  date?: {
    year: number;
    month: number;
    day: number;
  };
}

export interface BCMSMediaControlFiltersSearch {
  name: string;
}

export interface BCMSMediaControlFilters {
  search: BCMSMediaControlFiltersSearch;
  isOpen: boolean;
  options: BCMSMediaControlFiltersOptions[];
  clear: () => BCMSMediaControlFilters;
}
