import { getDbConnection } from "./db";

function mapSummary(s: any) {
  return { ...s, createdAt: s.created_at };
}

export async function getSummaries(userId: string) {
  const sql = await getDbConnection();
  const summaries =
    await sql`SELECT * FROM pdf_summaries WHERE user_id = ${userId} ORDER BY created_at DESC`;
  return summaries.map(mapSummary);
}

export async function getSummaryById(userId: string, id: string) {
  const sql = await getDbConnection();
  const rows =
    await sql`SELECT * FROM pdf_summaries WHERE user_id = ${userId} AND id = ${id}`;
  if (!rows?.length) return null;
  return mapSummary(rows[0]);
}

export async function getUserUploadCount(userId: string) {
  const sql = await getDbConnection();
  try {
    const [result] =
      await sql`SELECT COUNT(*) as count FROM pdf_summaries WHERE user_id = ${userId}`;
    return result?.count || 0;
  } catch (error) {
    console.error(error);
  }
}
