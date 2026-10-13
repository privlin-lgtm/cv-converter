import { readFileSync } from "node:fs";

const { tool_input: t = {} } = JSON.parse(readFileSync(0, "utf8"));
const file = (t.file_path ?? "").replace(/[\\/]+/g, "/");
if (/(^|\/)\.claude\/hooks\//.test(file)) process.exit(0);

// Only the text this edit adds, checked against real secret shapes. Tests that need a fake
// secret build it by string concatenation, so the literal never sits in the repo.
const added = [t.content, t.new_string, ...(t.edits ?? []).map((e) => e.new_string)].filter(Boolean).join("\n");
const postgresWithPassword = [...added.matchAll(/postgres(?:ql)?:\/\/([^:/\s]+):([^@/\s]+)@([^:/\s?]*)/g)]
  .some(([, user, password, host]) => !(user === "postgres" && password === "postgres" && host === "localhost")); // CI's throwaway service container
const found = [
  /sk-ant-(api|admin)[0-9]{2}-[A-Za-z0-9_-]{20,}/.test(added) && "an Anthropic API key",
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(added) && "a private-key header",
  postgresWithPassword && "a Postgres URL with a password",
].filter(Boolean);
if (found.length) {
  console.error(`Blocked: ${file} would contain ${found.join(" and ")}. Real secrets go only in server/.env, which is never committed; build test fakes by string concatenation.`);
  process.exit(2); // PreToolUse + exit 2: the edit never happens
}
