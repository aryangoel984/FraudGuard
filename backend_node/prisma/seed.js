import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const defaultRules = [
    {
        ruleName: "High Amount Transaction",
        condition: "transaction_amount > 50000",
        description: "Flag transactions with unusually high amounts",
        action: "BLOCK", // Maps to FraudAction enum
    },
    {
        ruleName: "Unusual Spending Pattern",
        condition: "transaction_amount > avg_user_transaction * 5",
        description: "Flag transactions that are 5x higher than user average",
        action: "REVIEW",
    },
    {
        ruleName: "Location Mismatch",
        condition: "user_country != transaction_country",
        description: "Flag transactions where user country differs from transaction country",
        action: "REVIEW",
    },
    {
        ruleName: "New Device",
        condition: "is_new_device == true && transaction_amount > 10000",
        description: "Flag high-value transactions from new devices",
        action: "OTP_VERIFICATION",
    },
    {
        ruleName: "Rapid Transactions",
        condition: "transactions_count_last_hour > 5",
        description: "Flag accounts with more than 5 transactions in the last hour",
        action: "REVIEW",
    },
    {
        ruleName: "Multiple Failed Attempts",
        condition: "failed_transactions_count_last_day > 3",
        description: "Flag accounts with more than 3 failed transactions in the last day",
        action: "BLOCK",
    },
];

async function main() {
    console.log("🌱 Seeding default rules into the database...");
    for (const rule of defaultRules) {
        await prisma.fraudRule.upsert({
            where: { ruleName: rule.ruleName },
            update: {},
            create: rule,
        });
        console.log(`✅ Seeded rule: ${rule.ruleName}`);
    }
    console.log("🌱 Database seeding completed successfully!");
}

main()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });