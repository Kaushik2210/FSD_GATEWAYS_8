import mongoose from "mongoose";
import { createApp } from "../server/src/app.js";

// Serverless functions get a fresh cold start often — cache the Mongo
// connection across invocations within the same warm instance instead of
// reconnecting on every request.
let dbConnection = null;
async function ensureDb() {
  if (!dbConnection) {
    dbConnection = mongoose.connect(process.env.MONGODB_URI).catch((err) => {
      dbConnection = null;
      throw err;
    });
  }
  return dbConnection;
}

const app = createApp();

export default async function handler(req, res) {
  await ensureDb();
  return app(req, res);
}
