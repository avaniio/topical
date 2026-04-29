ALTER TABLE "users" ADD COLUMN "username" text;
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_idx" ON "users" ("username");