/*
  Warnings:

  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `messageId` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prompt` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `queryResult` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sqlQuery` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Conversation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_conversationId_fkey";

-- AlterTable
ALTER TABLE "public"."Conversation" ADD COLUMN     "messageId" INTEGER NOT NULL,
ADD COLUMN     "prompt" TEXT NOT NULL,
ADD COLUMN     "queryResult" TEXT NOT NULL,
ADD COLUMN     "role" "public"."ChatRole" NOT NULL,
ADD COLUMN     "sqlQuery" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."Message";

-- AddForeignKey
ALTER TABLE "public"."Conversation" ADD CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
