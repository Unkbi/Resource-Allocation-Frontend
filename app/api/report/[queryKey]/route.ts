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

  try {
    const rawSQL = allowedQueries[queryKey]
    const result = await pool.query(rawSQL);
    let filteredRows = result.rows;
  
    return new Response(JSON.stringify(filteredRows), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Query failed' }), { status: 500 });
  }
}
