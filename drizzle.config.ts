import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: ["./server/db/schema/topics.ts", "./server/db/schema/lessonPlans.ts", "./server/db/schema/users.ts"],
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
