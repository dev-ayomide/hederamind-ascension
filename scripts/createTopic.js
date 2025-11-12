import { Client, TopicCreateTransaction } from "@hashgraph/sdk";
import dotenv from "dotenv";
dotenv.config();

const operatorId = process.env.OPERATOR_ID;
const operatorKey = process.env.OPERATOR_KEY;

if (!operatorId || !operatorKey) {
  console.error("Missing OPERATOR_ID or OPERATOR_KEY in .env");
  process.exit(1);
}

const client = Client.forTestnet().setOperator(operatorId, operatorKey);

async function createTopic() {
  const transaction = new TopicCreateTransaction();
  const txResponse = await transaction.execute(client);
  const receipt = await txResponse.getReceipt(client);
  console.log(`✅ Topic created with ID: ${receipt.topicId}`);
}

createTopic().catch(console.error);