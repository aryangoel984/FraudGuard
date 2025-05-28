-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'APPROVED', 'FLAGGED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "FraudAction" AS ENUM ('REVIEW', 'BLOCK', 'OTP_VERIFICATION');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "avgTransaction" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastLocation" TEXT,
    "trustedDevices" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "transaction_date" TIMESTAMP(3) NOT NULL,
    "transaction_amount" DOUBLE PRECISION NOT NULL,
    "transaction_channel" TEXT NOT NULL,
    "transaction_payment_mode" TEXT NOT NULL,
    "payment_gateway_bank" TEXT NOT NULL,
    "payer_email" TEXT NOT NULL,
    "payer_mobile" TEXT NOT NULL,
    "payer_card_brand" TEXT NOT NULL,
    "payer_device" TEXT NOT NULL,
    "payer_browser" TEXT NOT NULL,
    "payee_id" TEXT NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FraudRule" (
    "id" TEXT NOT NULL,
    "ruleName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "threshold" DOUBLE PRECISION,
    "condition" TEXT NOT NULL,
    "action" "FraudAction" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FraudRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FraudAlert" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FraudAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "FraudRule_ruleName_key" ON "FraudRule"("ruleName");

-- CreateIndex
CREATE UNIQUE INDEX "FraudAlert_transactionId_key" ON "FraudAlert"("transactionId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FraudAlert" ADD CONSTRAINT "FraudAlert_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FraudAlert" ADD CONSTRAINT "FraudAlert_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "FraudRule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
