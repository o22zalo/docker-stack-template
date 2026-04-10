const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { OmniRoute } = require("./omniroute");

const app = new OmniRoute();
const PORT = Number(process.env.PORT || 3000);
const LOG_DIR = process.env.LOG_DIR || "./logs";
const DB_PATH = process.env.SQLITE_PATH || "/data/app.db";

fs.mkdirSync(LOG_DIR, { recursive: true });
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const logFile = path.join(LOG_DIR, "app.log");
const logStream = fs.createWriteStream(logFile, { flags: "a" });

function writeLog(level, message) {
  const line = `[${new Date().toISOString()}] [${level}] ${message}`;
  console.log(line);
  logStream.write(`${line}\n`);
}

function runSql(sql, fallback = "") {
  try {
    return execFileSync("sqlite3", [DB_PATH, sql], { encoding: "utf-8" }).trim();
  } catch (error) {
    writeLog("ERROR", `SQLite error: ${error.message}`);
    return fallback;
  }
}

function bootstrapSqlite() {
  runSql(
    "CREATE TABLE IF NOT EXISTS visits (id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);",
  );
}

bootstrapSqlite();

app.use((req, _res, next) => {
  writeLog("INFO", `${req.method} ${req.url}`);
  next();
});

app.get("/", (_req, res) => {
  runSql("INSERT INTO visits DEFAULT VALUES;");
  const visits = runSql("SELECT COUNT(*) FROM visits;", "0");
  res.json({
    message: "Node.js app running with OmniRoute",
    sqlite: DB_PATH,
    visits: Number(visits || 0),
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (_req, res) => {
  const health = runSql("PRAGMA quick_check;", "failed");
  const ok = health === "ok";
  res.json({ status: ok ? "ok" : "degraded", sqlite_check: health, uptime: process.uptime() }, ok ? 200 : 503);
});

app.listen(PORT, () => {
  writeLog("INFO", `Server started on ${PORT} with db ${DB_PATH}`);
});
