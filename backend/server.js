// Load environment variables before anything reads them (the DB pool reads DATABASE_URL on import).
require("dotenv").config();

const app = require("./app");

// A failure nothing else caught (work started outside a request, say) is logged, and the API keeps
// answering: ending the process would take its one instance down for everyone until Render restarts it.
process.on("unhandledRejection", (err) => console.error("Unhandled rejection:", err));

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
