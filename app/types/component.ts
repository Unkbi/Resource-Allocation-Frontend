// Here the Component Types are defined

export interface ProjectsTableRow {
  ProjectManager: string | null;
  CostCurrency: string | null;
  StartDate: string | null;
  Id: string;
  Owner: {
    name: string | null;
    bgColor: string | null;
    initials: string | null;
  };
  AllowOvertime: boolean | null;
  Name: string | null;
  __path__: string | null;
  Description: string | null;
  Type: string | null;
  EndDate: string | null;
  Cost: number | null;
  Location: string | null;
  __parent__: string | null;
  Status: string | null;
  id: string;
}
