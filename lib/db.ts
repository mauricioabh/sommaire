import { neon } from "@neondatabase/serverless";

export async function getDbConnection() {
  if (!process.env.DATABASE_URL) {
    throw new Error("Neon database URL is not defined");
  }
  const sql = neon(process.env.DATABASE_URL);
  return sql;
  //const response = await sql`SELECT version()`;
  //return response[0].version;
}
