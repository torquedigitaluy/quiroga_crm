-- CreateTable
CREATE TABLE "LoginVerification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "codeExpiresAt" TIMESTAMP(3) NOT NULL,
    "codeUsedAt" TIMESTAMP(3),
    "otpTicketHash" TEXT,
    "otpTicketExpiresAt" TIMESTAMP(3),
    "otpTicketUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LoginVerification_userId_idx" ON "LoginVerification"("userId");

-- CreateIndex
CREATE INDEX "LoginVerification_otpTicketHash_idx" ON "LoginVerification"("otpTicketHash");

-- AddForeignKey
ALTER TABLE "LoginVerification" ADD CONSTRAINT "LoginVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
