require("dotenv").config();
const { default: mongoose } = require("mongoose");
const app = require("./app");

const PORT = process.env.PORT || 3001;
const DB_CONNECTION = process.env.MONGO_URI;

mongoose
  .connect(DB_CONNECTION)
  .then(() => {
    console.log("Connected to MongoDB successfully.");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });

app.listen(PORT, () => {
  console.log("Server running on port: http://localhost:" + PORT);
});
