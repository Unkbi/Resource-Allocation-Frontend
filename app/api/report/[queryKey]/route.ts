import { NextRequest } from 'next/server';
import { pool } from '../../../utils/db';
import { allowedQueries } from '../../../utils/queries';

export async function GET(request: { params: { queryKey: string } }, req: NextRequest) {
  const { params } = await request;
  const queryKey = params.queryKey;
  const url = new URL(req.url);
  const bucket = url.searchParams.get("bucket") || "week";
  const team = url.searchParams.get("team") || "";

  if (!allowedQueries[queryKey]) {
    return new Response(JSON.stringify({ error: 'Invalid query key' }), { status: 400 });
  }

  try {
    const rawSQL = allowedQueries[queryKey]
      .replace(/'\{\{bucket\}\}'/, `'${bucket}'`)
      .replace(/'\{\{team\}\}'/, `'${team.replace(/'/g, "''")}'`); // sanitize single quotes

    const result = await pool.query(rawSQL);
    return new Response(JSON.stringify(result.rows), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Query failed' }), { status: 500 });
  }
}
