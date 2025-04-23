'use client';
import { useSelector } from 'react-redux';
import Allocation from './allocation';
import HorizontalSplitView from '@/app/components/Shared/SplitView';
import { RootState } from '@/app/redux/store';
import ProjectAllocation from '@/app/components/ResourceAllocation/component/ProjectAllocation';
import TeamAllocation from '@/app/components/ResourceAllocation/component/TeamAllocation';
// import TopProjectsView from '@/app/components/AllocationTable/components/TopProjectsView';

const TopContent = () => <ProjectAllocation />;

const BottomContent = () => (
  // <div className="p-4 bg-gray-100">Bottom Panel: Logs, Terminal, etc.</div>
  <TeamAllocation />
);

export default function AllocationInit() {
  const { splitView } = useSelector((state: RootState) => state.allocationView);
  console.log('splitView : ', splitView);
  return splitView ? (
    <HorizontalSplitView
      top={<TopContent />}
      bottom={<BottomContent />}
      initialTopHeight={250}
      syncHorizontalScroll={true}
    />
  ) : (
    <Allocation />
  );
}
