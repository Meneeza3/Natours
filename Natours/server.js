const mongoose = require("mongoose");
const dotenv = require("dotenv");

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

const app = require("./app");

dotenv.config({ path: "./config.env" });

// process.env is accessible all over the project
const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASS);

mongoose.connect(DB);

const port = 3000;

const server = app.listen(port, () => {
  console.log(`start listen to ${port}.....`);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION 💥 Shutting down...");
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
