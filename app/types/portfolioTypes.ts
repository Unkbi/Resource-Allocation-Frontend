export interface Portfolio {
  Id: string;
  SidebarColor: string | null;
  Name: string | null;
  __path__: string | null;
  Description: string | null;
  __parent__: string | null;
  Status: string | null;
}

export interface PortfolioState {
  portfolios: Portfolio[] | null;
  loading: boolean;
  error: string | null;
}
