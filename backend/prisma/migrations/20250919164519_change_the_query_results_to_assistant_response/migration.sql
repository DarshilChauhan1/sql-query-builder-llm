/*
  Warnings:

  - You are about to drop the column `queryResult` on the `Messages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Messages" DROP COLUMN "queryResult",
ADD COLUMN     "assistantResponse" TEXT;
