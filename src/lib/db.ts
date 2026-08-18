import mongoose from "mongoose";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/gateways";

// Route Handlers can be re-invoked across hot reloads in dev (and across
// warm serverless instances in prod) — cache the connection promise on
// `global` instead of reconnecting on every request.
let cached = global._mongoose;
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

export async function connectDb() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    mongoose.connection.on("error", (err) => console.error("[mongo] connection error:", err.message));
    cached.promise = mongoose.connect(uri).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
