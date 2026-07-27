import "dotenv/config";

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

await connectDB();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});