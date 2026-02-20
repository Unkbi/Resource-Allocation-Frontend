import { clearFiltersForPage, FilterItem, resetAllFilters, updateFiltersForPage } from "../reducers/filterReducer";


export const updatePageFilters = (
  page: 'Resource' | 'Project' | 'Teams' | 'Organisations' | 'Rates' | 'Portfolio' | 'BusinessImpact',
  filters: FilterItem[]
) => updateFiltersForPage({ page, filters });


export const clearPageFilters = (
  page: 'Resource' | 'Project' | 'Teams' | 'Organisations' | 'Rates' | 'Portfolio' | 'BusinessImpact',
) => clearFiltersForPage(page);


export const resetFilters = () => resetAllFilters();
