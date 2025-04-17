import { Suspense } from 'react';
import Allocation from './allocation';

export default function AllocationPage() {
  return (
    <Suspense fallback={<div>Loading allocation...</div>}>
      <Allocation />
    </Suspense>
  );
}
