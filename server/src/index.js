import "dotenv/config";
import { createApp } from "./app.js";
import { connectDb } from "./config/db.js";

const port = Number(process.env.PORT) || 4000;

await connectDb();
const app = createApp();
app.listen(port, () => console.log(`[server] listening on http://localhost:${port}`));
