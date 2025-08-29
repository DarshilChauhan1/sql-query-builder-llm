-- AlterTable
ALTER TABLE "public"."Messages" ALTER COLUMN "sqlQuery" DROP NOT NULL,
ALTER COLUMN "prompt" DROP NOT NULL,
ALTER COLUMN "queryResult" DROP NOT NULL;
