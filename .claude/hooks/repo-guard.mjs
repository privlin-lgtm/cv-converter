import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const { tool_input: t = {}, cwd = process.cwd() } = JSON.parse(readFileSync(0, "utf8"));
const cmd = t.command ?? "";
const MARKER = "FICTIONAL TEST CV — NOT A REAL PERSON";
const block = (msg) => {
  console.error(`Blocked: ${msg}`);
  process.exit(2); // PreToolUse + exit 2: the command never runs
};

const isCommit = /\bgit\s+commit\b/.test(cmd);
if (!isCommit && /(^|[\s'"=:/\\<>(])\.env(\.(?!example\b)[\w.-]+)?(?=$|[\s'";|&)>])/m.test(cmd)) {
  block("this command touches a .env file. Secrets in .env stay unread; use server/.env.example for the variable names.");
}

if (/\b(db:migrate|db:seed|knex\s+(migrate|seed))\b/.test(cmd)) {
  const local = (url) => URL.canParse(url) && ["localhost", "127.0.0.1", "[::1]"].includes(new URL(url).hostname);
  const inline = /DATABASE_URL\s*=|\$env:DATABASE_URL|neon\.tech/i.test(cmd);
  const shellUrl = process.env.DATABASE_URL;
  if (inline || (shellUrl && !local(shellUrl))) {
    block("migrations and seeds against a non-local database are Paul's to run. Run them only against the local dev database from server/.env.");
  }
}

if (isCommit) {
  const git = (...args) => execFileSync("git", args, { cwd, encoding: "utf8" }).split("\n").filter(Boolean);
  const root = git("rev-parse", "--show-toplevel")[0];
  const files = new Set([
    ...git("diff", "--cached", "--name-only", "--diff-filter=ACMR"),
    ...(/\s(-a|--all|-\w*a\w*)\b/.test(cmd) ? git("diff", "--name-only", "--diff-filter=ACMR") : []),
  ]);
  const bad = [...files].filter((f) => {
    if (/\.(pdf|docx?|rtf|odt|pages)$/i.test(f)) return true;
    if (!/\.txt$/i.test(f)) return false;
    return readFileSync(join(root, f), "utf8").split(/\r?\n/, 1)[0].trim() !== MARKER;
  });
  if (bad.length) {
    block(`${bad.join(", ")} could be a real CV. CV documents are never committed; .txt fixtures must start with the line "${MARKER}".`);
  }
}
