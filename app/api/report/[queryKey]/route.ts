import { NextRequest } from 'next/server';
import { pool } from '../../../utils/db';
import { allowedQueries } from '../../../utils/queries';

export async function GET(
  req: NextRequest,
  context: { params: Record<string, string> }
) {
  const { queryKey } = context.params;
  if (!allowedQueries[queryKey]) {
    return new Response(JSON.stringify({ error: 'Invalid query key' }), { status: 400 });
  }

  // Parse query parameters
  const searchParams = req.nextUrl.searchParams;
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const bucket = searchParams.get('bucket');
  const projectTypeFilter = searchParams.get('projectTypeFilter') ? searchParams.get('projectTypeFilter')!.split(',') : null;
  const projectTypeGroupFilter = searchParams.get('projectTypeGroupFilter') ? searchParams.get('projectTypeGroupFilter')!.split(',') : null;
  const portfolioFilter = searchParams.get('portfolioFilter') ? searchParams.get('portfolioFilter')!.split(',') : null;
  const teamFilter = searchParams.get('teamFilter') ? searchParams.get('teamFilter')!.split(',') : null;
  const teamAllocMgrFilter = searchParams.get('teamAllocMgrFilter') ? searchParams.get('teamAllocMgrFilter')!.split(',') : null;
  const orgFilter = searchParams.get('orgFilter') ? searchParams.get('orgFilter')!.split(',') : null;

  // Validate required params
  if (!startDate || !endDate || !bucket) {
    return new Response(JSON.stringify({ error: 'Missing startDate, endDate, or bucket' }), {
      status: 400,
    });
  }

  try {
    const rawSQL = allowedQueries[queryKey](
      startDate,
      endDate,
      bucket,
      teamFilter,
      teamAllocMgrFilter,
      orgFilter,
      projectTypeFilter,
      projectTypeGroupFilter,
      portfolioFilter,
    );
    const result = await pool.query(rawSQL);
    let filteredRows = result.rows;
  
    return new Response(JSON.stringify(filteredRows), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Query failed' }), { status: 500 });
  }
}
