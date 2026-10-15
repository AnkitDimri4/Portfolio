// Load environment variables before anything reads them (the DB pool reads DATABASE_URL on import).
require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
