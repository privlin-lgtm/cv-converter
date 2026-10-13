import { readFileSync } from "node:fs";

const raw = JSON.parse(readFileSync(0, "utf8")).tool_input?.command ?? "";
const cmd = raw.replace(/(["'])(?:\\.|(?!\1)[^\\])*\1/g, '""'); // ignore quoted text: commit messages, PR bodies, grep patterns
const blocked = [
  /\b(vercel|vc)\b.*\s(--prod\b|--target[=\s]+production\b)/i,       // production deploys
  /\b(vercel|vc)\s+(promote|alias|redeploy)\b/i,
  /\brailway\s+(up|redeploy)\b/i,                                     // targets the linked environment
  /\b(fly|flyctl)\s+deploy\b/i,                                       // the app in fly.toml is production
  /\bsupabase\s+db\s+push\b(?!.*--local\b)/i,                         // targets the linked project
  /\bdotnet\s+ef\s+database\s+update\b.*--connection\b/i,             // local dev uses user-secrets, no --connection
  /\bgh\s+pr\s+merge\b/i,                                             // your merge is the release authorization
  /\bgit\s+push\b.*[\s:+](main|master)(\s|$)/i,                       // explicit push to main
  /\bgit\s+push(\s+-{1,2}[\w-]+)*(\s+origin)?(\s+HEAD)?\s*($|[;&|])/i, // bare push / HEAD: pushes main when on main
];
const prodEnv = /\b(ASPNETCORE|DOTNET)_ENVIRONMENT\s*=\s*["']?prod/i.test(raw);
if (prodEnv || blocked.some((p) => p.test(cmd))) {
  console.error("Blocked: production deploys, migrations, merges and pushes to main are yours to run. Push a named branch (git push -u origin <branch>) and open a PR instead.");
  process.exit(2); // PreToolUse + exit 2: the command never runs
}
