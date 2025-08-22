export interface AllocationRange {
  id: string;
  Id: string;
  From: string;
  To: string;
  Label: string;
  Color: string;
  DarkColor: string;
}

// Define the type for a ParentEntry
export interface ParentEntry {
  Id: string;
  AllocationRanges: {
    Id: string;
    Label: string;
    From: string;
    To: string;
    Color: string;
    DarkColor: string;
  }[];
}
// Define the type for the action payload
export interface GetAllocationThemeFulfilledPayload {
  result: ParentEntry[];
}

// Payload for updating an allocation theme
export interface AllocationRangePayload {
  Id: string;
  From: string;
  To: string;
  Label: string;
  Color: string;
  DarkColor: string;
}
