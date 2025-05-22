import { NextRequest } from 'next/server';
import { pool } from '../../../utils/db';
import { allowedQueries } from '../../../utils/queries';

export async function GET(req: NextRequest, context: { params: { queryKey: string } }) {
  const queryKey = context.params?.queryKey;
  const searchParams = req.nextUrl.searchParams;

  const bucket = searchParams.get("bucket") || "week";
  const team = searchParams.get("team") || "";

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
