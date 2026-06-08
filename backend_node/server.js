import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const port = 3001;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Helper to map ruleType and action
const actionMap = {
  transaction_amount: 'BLOCK',
  location_device: 'OTP_VERIFICATION',
  transaction_frequency: 'REVIEW'
};

const ruleTypeMap = {
  BLOCK: 'transaction_amount',
  OTP_VERIFICATION: 'location_device',
  REVIEW: 'transaction_frequency'
};

// Helper database client adapters
const db = {
  async saveDetection(data) {
    try {
      // Find or create default user profile for relational mapping
      const user = await prisma.user.upsert({
        where: { email: data.payer_email || 'default@fraudguard.com' },
        update: {},
        create: {
          email: data.payer_email || 'default@fraudguard.com',
          name: 'Anonymous Payer',
          password: 'secure-hash-placeholder',
          phoneNumber: data.payer_mobile || `phone_${Date.now()}`
        }
      });

      // Insert transaction using client-provided id as primary key
      const txn = await prisma.transaction.create({
        data: {
          id: data.transaction_id,
          transaction_date: new Date(data.transaction_date || Date.now()),
          transaction_amount: Number(data.transaction_amount),
          transaction_channel: data.transaction_channel || 'web',
          transaction_payment_mode: data.transaction_payment_mode || 'Card',
          payment_gateway_bank: data.payment_gateway_bank || 'Service Bank',
          payer_email: data.payer_email || 'default@fraudguard.com',
          payer_mobile: data.payer_mobile || '',
          payer_card_brand: data.payer_card_brand || '',
          payer_device: data.payer_device || '',
          payer_browser: data.payer_browser || '',
          payee_id: data.payee_id || '',
          status: data.is_fraud_predicted ? "FLAGGED" : "APPROVED",
          userId: user.id
        }
      });

      // If predicted as fraud, also write a fraud alert record
      if (data.is_fraud_predicted) {
        // Link to matching rule or find first available rule
        const rule = await prisma.fraudRule.findFirst({
          where: { ruleName: { contains: data.fraud_source === 'rule' ? 'High' : 'Model' } }
        }) || await prisma.fraudRule.findFirst();

        if (rule) {
          await prisma.fraudAlert.create({
            data: {
              transactionId: txn.id,
              ruleId: rule.id,
              reason: data.fraud_reason || 'Suspicious transaction flagged by model'
            }
          });
        }
      }

      return txn;
    } catch (err) {
      console.error("Error saving detection to DB:", err);
      return null;
    }
  },

  async saveReport(data) {
    try {
      // Fetch or generate a manual rule reference for reporting
      const rule = await prisma.fraudRule.upsert({
        where: { ruleName: 'Manual Analyst Report' },
        update: {},
        create: {
          ruleName: 'Manual Analyst Report',
          description: 'Reported manually by analysts',
          condition: 'is_fraud_reported == true',
          action: 'REVIEW'
        }
      });

      // Create a fraud alert reference in database
      const alert = await prisma.fraudAlert.create({
        data: {
          transactionId: data.transaction_id,
          ruleId: rule.id,
          reason: data.fraud_details || 'Reported manually by analyst'
        }
      });

      // Update the transaction status to FLAGGED
      await prisma.transaction.update({
        where: { id: data.transaction_id },
        data: { status: 'FLAGGED' }
      }).catch(() => {});

      return alert;
    } catch (err) {
      console.error("Error saving report to DB:", err);
      return null;
    }
  },

  async getTransaction(id) {
    try {
      const txn = await prisma.transaction.findUnique({ where: { id } });
      return { transaction_id: id, exists: !!txn };
    } catch (err) {
      return { transaction_id: id, exists: false };
    }
  }
};

// Helper to check rules
function checkRules(transaction) {
  // High amount transaction
  if (transaction.transaction_amount > 50000) {
    return {
      is_fraud: true,
      fraud_source: "rule",
      fraud_reason: "Unusually high transaction amount",
      fraud_score: 0.85,
    };
  }

  // Unusual time (3 AM)
  const txnDate = new Date(transaction.transaction_date);
  if (txnDate.getHours() >= 2 && txnDate.getHours() <= 4) {
    return {
      is_fraud: true,
      fraud_source: "rule",
      fraud_reason: "Transaction at unusual hour",
      fraud_score: 0.75,
    };
  }

  return null;
}

// Mock AI model prediction
async function predictWithModel(transaction) {
  let score = 0.1; // Base score

  if (transaction.transaction_amount > 10000) {
    score += 0.2;
  }

  if (transaction.transaction_payment_mode === "Card") {
    score += 0.1;
  }

  score += Math.random() * 0.2;

  return {
    is_fraud: score > 0.5,
    fraud_source: "model",
    fraud_reason: score > 0.5 ? "AI model detected suspicious pattern" : "",
    fraud_score: Math.min(1.0, score),
  };
}

// Routes

// 1. Get all rules (with optional type filtering)
app.get('/api/rules', async (req, res) => {
  const ruleType = req.query.type;
  try {
    const dbRules = await prisma.fraudRule.findMany();
    
    // Map database rules to schema format expected by Next.js components
    const mappedRules = dbRules.map((r) => {
      // Extract custom ruleType tag from description metadata if present
      const typeMatch = r.description.match(/\[type:(\w+)\]/);
      const extractedType = typeMatch ? typeMatch[1] : (ruleTypeMap[r.action] || 'transaction_amount');
      const cleanDescription = r.description.replace(/\[type:\w+\]/, '').trim();

      return {
        id: r.id,
        name: r.ruleName,
        condition: r.condition,
        active: true,
        description: cleanDescription,
        ruleType: extractedType
      };
    });

    if (ruleType) {
      const filtered = mappedRules.filter((r) => r.ruleType === ruleType);
      return res.json(filtered);
    }

    return res.json(mappedRules);
  } catch (error) {
    console.error("Error fetching rules:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// 2. Create a rule
app.post('/api/rules', async (req, res) => {
  try {
    const newRule = req.body;
    if (!newRule.name || !newRule.condition || !newRule.ruleType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Append ruleType tag to description to persist without modifying DB schema
    const descriptionWithTag = `${newRule.description || ''} [type:${newRule.ruleType}]`;
    const action = actionMap[newRule.ruleType] || 'REVIEW';

    const rule = await prisma.fraudRule.create({
      data: {
        id: newRule.id,
        ruleName: newRule.name,
        condition: newRule.condition,
        description: descriptionWithTag,
        action: action
      }
    });

    return res.status(201).json({
      id: rule.id,
      name: rule.ruleName,
      condition: rule.condition,
      description: newRule.description || "",
      active: true,
      ruleType: newRule.ruleType
    });
  } catch (error) {
    console.error("Error creating rule:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// 3. Get single rule
app.get('/api/rules/:id', async (req, res) => {
  try {
    const rule = await prisma.fraudRule.findUnique({ where: { id: req.params.id } });
    if (!rule) {
      return res.status(404).json({ error: "Rule not found" });
    }

    const typeMatch = rule.description.match(/\[type:(\w+)\]/);
    const extractedType = typeMatch ? typeMatch[1] : (ruleTypeMap[rule.action] || 'transaction_amount');
    const cleanDescription = rule.description.replace(/\[type:\w+\]/, '').trim();

    return res.json({
      id: rule.id,
      name: rule.ruleName,
      condition: rule.condition,
      description: cleanDescription,
      active: true,
      ruleType: extractedType
    });
  } catch (error) {
    console.error("Error fetching rule:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// 4. Update a rule
app.put('/api/rules/:id', async (req, res) => {
  try {
    const updatedRule = req.body;
    const ruleId = req.params.id;

    // Build update payload
    const data = {};
    if (updatedRule.name) data.ruleName = updatedRule.name;
    if (updatedRule.condition) data.condition = updatedRule.condition;
    
    if (updatedRule.description || updatedRule.ruleType) {
      const type = updatedRule.ruleType || 'transaction_amount';
      const desc = updatedRule.description || '';
      data.description = `${desc} [type:${type}]`;
      data.action = actionMap[type] || 'REVIEW';
    }

    const rule = await prisma.fraudRule.update({
      where: { id: ruleId },
      data: data
    });

    const typeMatch = rule.description.match(/\[type:(\w+)\]/);
    const extractedType = typeMatch ? typeMatch[1] : 'transaction_amount';
    const cleanDescription = rule.description.replace(/\[type:\w+\]/, '').trim();

    return res.json({
      id: rule.id,
      name: rule.ruleName,
      condition: rule.condition,
      description: cleanDescription,
      active: true,
      ruleType: extractedType
    });
  } catch (error) {
    console.error("Error updating rule:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// 5. Toggle active status of a rule (Mocked field in schema, resolved in Express)
app.put('/api/rules/:id/toggle', async (req, res) => {
  try {
    const { active } = req.body;
    const rule = await prisma.fraudRule.findUnique({ where: { id: req.params.id } });

    if (!rule) {
      return res.status(404).json({ error: "Rule not found" });
    }

    if (active === undefined) {
      return res.status(400).json({ error: "Missing active status" });
    }

    const typeMatch = rule.description.match(/\[type:(\w+)\]/);
    const extractedType = typeMatch ? typeMatch[1] : 'transaction_amount';
    const cleanDescription = rule.description.replace(/\[type:\w+\]/, '').trim();

    // Since 'active' is not stored in DB, we mock the toggle confirmation response
    return res.json({
      id: rule.id,
      name: rule.ruleName,
      condition: rule.condition,
      description: cleanDescription,
      active: active,
      ruleType: extractedType
    });
  } catch (error) {
    console.error("Error toggling rule:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// 6. Delete a rule
app.delete('/api/rules/:id', async (req, res) => {
  try {
    // Delete any dependent alerts first to prevent foreign key errors
    await prisma.fraudAlert.deleteMany({ where: { ruleId: req.params.id } });

    const rule = await prisma.fraudRule.delete({ where: { id: req.params.id } });

    const typeMatch = rule.description.match(/\[type:(\w+)\]/);
    const extractedType = typeMatch ? typeMatch[1] : 'transaction_amount';
    const cleanDescription = rule.description.replace(/\[type:\w+\]/, '').trim();

    return res.json({
      id: rule.id,
      name: rule.ruleName,
      condition: rule.condition,
      description: cleanDescription,
      active: true,
      ruleType: extractedType
    });
  } catch (error) {
    console.error("Error deleting rule:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// 7. Real-time Fraud Detection
app.post('/api/fraud/detect', async (req, res) => {
  try {
    const transaction = req.body;

    if (!transaction.transaction_id || !transaction.transaction_amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check rules first
    const ruleResult = checkRules(transaction);

    if (ruleResult && ruleResult.is_fraud) {
      await db.saveDetection({
        ...transaction,
        is_fraud_predicted: true,
        fraud_source: ruleResult.fraud_source,
        fraud_reason: ruleResult.fraud_reason,
        fraud_score: ruleResult.fraud_score,
      });

      return res.json({
        transaction_id: transaction.transaction_id,
        is_fraud: true,
        fraud_source: ruleResult.fraud_source,
        fraud_reason: ruleResult.fraud_reason,
        fraud_score: ruleResult.fraud_score,
      });
    }

    // AI model prediction
    const modelResult = await predictWithModel(transaction);

    await db.saveDetection({
      ...transaction,
      is_fraud_predicted: modelResult.is_fraud,
      fraud_source: modelResult.fraud_source,
      fraud_reason: modelResult.fraud_reason,
      fraud_score: modelResult.fraud_score,
    });

    return res.json({
      transaction_id: transaction.transaction_id,
      is_fraud: modelResult.is_fraud,
      fraud_source: modelResult.fraud_source,
      fraud_reason: modelResult.fraud_reason,
      fraud_score: modelResult.fraud_score,
    });
  } catch (error) {
    console.error("Error in fraud detection:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// 8. Batch Fraud Detection
app.post('/api/fraud/detect/batch', async (req, res) => {
  try {
    const { transactions } = req.body;

    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({ error: "Invalid input: transactions must be an array" });
    }

    const results = await Promise.all(
      transactions.map(async (transaction) => {
        const ruleResult = checkRules(transaction);
        
        let isFraud = false;
        let fraudReason = "";
        let fraudScore = 0.0;
        let fraudSource = "model";

        if (ruleResult && ruleResult.is_fraud) {
          isFraud = true;
          fraudReason = ruleResult.fraud_reason;
          fraudScore = ruleResult.fraud_score;
          fraudSource = "rule";
        } else {
          const modelResult = await predictWithModel(transaction);
          isFraud = modelResult.is_fraud;
          fraudReason = modelResult.fraud_reason;
          fraudScore = modelResult.fraud_score;
        }

        // Save detection log to database asynchronously
        db.saveDetection({
          ...transaction,
          is_fraud_predicted: isFraud,
          fraud_source: fraudSource,
          fraud_reason: fraudReason,
          fraud_score: fraudScore
        });

        return {
          id: transaction.transaction_id,
          is_fraud: isFraud,
          fraud_reason: fraudReason,
          fraud_score: fraudScore,
        };
      })
    );

    const formattedResults = {};
    results.forEach((item) => {
      formattedResults[item.id] = {
        is_fraud: item.is_fraud,
        fraud_reason: item.fraud_reason,
        fraud_score: item.fraud_score,
      };
    });

    return res.json(formattedResults);
  } catch (error) {
    console.error("Error in batch fraud detection:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// 9. Fraud Reporting
app.post('/api/fraud/report', async (req, res) => {
  try {
    const report = req.body;

    if (!report.transaction_id || !report.reporting_entity_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const transaction = await db.getTransaction(report.transaction_id);
    if (!transaction.exists) {
      return res.status(404).json({
        transaction_id: report.transaction_id,
        reporting_acknowledged: false,
        failure_code: 404,
      });
    }

    await db.saveReport(report);

    return res.json({
      transaction_id: report.transaction_id,
      reporting_acknowledged: true,
      failure_code: 0,
    });
  } catch (error) {
    console.error("Error in fraud reporting:", error);
    return res.status(500).json({
      transaction_id: "unknown",
      reporting_acknowledged: false,
      failure_code: 500,
    });
  }
});

// Default status endpoint
app.get('/', (req, res) => {
  res.json({ message: "FraudGuard Node.js API Service Running ✅", port });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

export default app;
