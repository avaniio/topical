import postgres from "postgres";
import { z } from "zod";

const PostgresEnv = z.object({
  DATABASE_URL: z.string().url(),
});
const ProcessEnv = PostgresEnv.parse({ DATABASE_URL: process.env.DATABASE_URL });

const sql = postgres(ProcessEnv.DATABASE_URL);

async function main() {
  try {
    await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "username" text;`;
    await sql`ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");`;
    console.log("Success");
  } catch(e) {
    console.error(e);
  } finally {
    await sql.end();
  }
}
main();
