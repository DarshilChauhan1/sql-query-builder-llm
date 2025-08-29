/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `messageId` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `prompt` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `queryResult` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `sqlQuery` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Conversation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Conversation" DROP COLUMN "createdAt",
DROP COLUMN "messageId",
DROP COLUMN "prompt",
DROP COLUMN "queryResult",
DROP COLUMN "role",
DROP COLUMN "sqlQuery",
DROP COLUMN "updatedAt";

-- CreateTable
CREATE TABLE "public"."Messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "public"."ChatRole" NOT NULL,
    "sqlQuery" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "queryResult" TEXT NOT NULL,
    "messageId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Messages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Messages" ADD CONSTRAINT "Messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "public"."Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Messages" ADD CONSTRAINT "Messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
