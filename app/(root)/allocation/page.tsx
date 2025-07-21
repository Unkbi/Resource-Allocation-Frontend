import { Suspense } from 'react';
import AllocationInit from './init';

export default function AllocationPage() {
  return (
    <Suspense fallback={<div>Loading allocation...</div>}>
      <AllocationInit />
    </Suspense>
  );
}
