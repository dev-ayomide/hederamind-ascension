import { Client, TopicCreateTransaction } from "@hashgraph/sdk";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const client = Client.forTestnet();
  client.setOperator(process.env.OPERATOR_ID, process.env.OPERATOR_KEY);

  const tx = await new TopicCreateTransaction().execute(client);
  const receipt = await tx.getReceipt(client);
  console.log("✅ Topic created with ID:", receipt.topicId.toString());
}

main().catch(console.error);