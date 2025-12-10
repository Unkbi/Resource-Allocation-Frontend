
export interface BusinessImpact {
  Id: string;
  ProjectUUID: string;
  BusinessImpactType: string;
  AnnualizedAmount: number;
  Currency: string;
  Description: string;
  Status: string;
  __created: string,
  __created_by: string,
  __last_modified: string,
  __last_modified_by: string,
  __path__: string,
  __parent__: string | null,
}
export interface BusinessImpactType {
  Id: string;
  Name: string;
  Description?: string;
  Status: string;
  __created?: string;
  __created_by?: string;
  __last_modified?: string;
  __last_modified_by?: string;
  __path__?: string;
  __parent__?: string;
}

export interface BusinessImpactState {
  businessImpact: BusinessImpact[] | null;
  businessImpactType: BusinessImpactType[] | null;
  loading: boolean;
  error: string | null;
}