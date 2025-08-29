/*
  Warnings:

  - Added the required column `title` to the `Conversation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Conversation" ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Workspace" ADD COLUMN     "isSchemaValidated" BOOLEAN NOT NULL DEFAULT false;
