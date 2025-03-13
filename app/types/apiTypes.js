export interface Organization {
    "Id": string,
    "Name": string,
    "Status": string,
    "__parent__": string
}

export interface OrganizationResource {
    "AverageWeeklyHours": number
    "Email": string,
    "__parent__": string,
    "Type": string,
    "EndDate": string,
    "__instmeta__": { },
    "HourlyRate": number
    "Department": string,
    "LocationCategory": string,
    "Status": string,
    "FullName": string,
    "__path__": string,
    "Role": string,
    "HourlyRateCurrency": string,
    "WorkLocation": string,s
    "LastName": string,
    "Manager": string,
    "Id": string,
    "FirstName": string,
    "StartDate": string,
    "HRLevel": string,
    "PhoneNumber": string
}

export interface OrganizationAllocations {
    "Period": string,
    "__parent__": string,
    "__instmeta__": { },
    "__path__": string,
    "AllocationEntered": number,
    "ExUnderAllocated": boolean,
    "Duration": string,
    "Project": string,
    "ExOverAllocated": boolean,
    "Resource": string,
    "ProjectName": string,
    "Notes": string,
    "Id": string
}