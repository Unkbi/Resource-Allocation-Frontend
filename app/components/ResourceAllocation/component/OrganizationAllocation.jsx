"use client"
import AllocationGrid from "@/app/components/AllocationTable/AllocationGrid";
// import AllocationGrid from '@/app/components/AllocationTable/AllocationGrid';
import { demoRows } from '../../AllocationTable/data';
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllOrganizationAllocations } from '@/app/redux/actions/fetchOrganizationAction';
import { resetAllocations } from '@/app/redux/reducers/organizationReducer';

const organizationColumnConfig = [
    {
      field: 'organization',
      headerName: 'Organizaion Name',
      width: 200,
      headerClassName: 'prime-header',
      cellClassName: 'prime-cell',
      primaryColumn: true,
    },
  ];

export default function OrganizationAllocation() {
  const [allocationsFetched, setAllocationsFetched] = useState(false);
  const { organizations, allocations, loading, dataProcessing, error } = useSelector(
    state => state.organizations
  );
  console.log("organizations", organizations);
  const dispatch = useDispatch();
  useEffect(() => {
    setAllocationsFetched(false);
  }, []);

  useEffect(() => {
      if (
        organizations?.result &&
        organizations?.result.length > 0 &&
        !allocationsFetched
      ) {
        dispatch(resetAllocations());
        dispatch(fetchAllOrganizationAllocations(organizations.result));
        setAllocationsFetched(true);
      }
    }, [organizations, allocationsFetched]);

  return (
      <>
        <AllocationGrid 
          groupBy="organization"
          columns={organizationColumnConfig}
          data={demoRows}
          loading={loading || dataProcessing}
        />
      </>
  );
}
