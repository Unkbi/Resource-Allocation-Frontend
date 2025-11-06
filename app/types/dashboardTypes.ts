export interface ChartParams {
  chartKey: string;
  queryKey: string;
  startDate: string;
  endDate: string;
  bucket: string;
  projectTypeFilter?: string[] | null;
  projectTypeGroupFilter?: string[] | null;
  portfolioFilter?: string[] | null;
  teamFilter?: string[] | null;
  teamAllocMgrFilter?: string[] | null;
  orgFilter?: string[] | null;
}
