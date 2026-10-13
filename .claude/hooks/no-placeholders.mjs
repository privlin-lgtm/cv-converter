import { readFileSync } from "node:fs";

const { tool_input: t = {} } = JSON.parse(readFileSync(0, "utf8"));
const file = (t.file_path ?? "").replace(/[\\/]+/g, "/");
if (!/\.(ts|tsx|js|jsx|mjs|cs|cshtml|razor|sql|py)$/i.test(file) || /(^|\/)\.claude\/hooks\//.test(file)) process.exit(0);

// Only the text this edit added, so an old TODO elsewhere in the file doesn't block unrelated edits.
const added = [t.content, t.new_string, ...(t.edits ?? []).map((e) => e.new_string)].filter(Boolean).join("\n");
const hit =
  added.match(/(\/\/|\/\*|#|--|@\*)\s*(TODO|FIXME)\b/) ??          // a TODO/FIXME comment, not a `TODO` enum value
  added.match(/NotImplementedException|not implemented|implement (this )?later/i);
if (hit) {
  console.error(`${file}: added code contains "${hit[0]}". Finish the implementation instead of leaving a placeholder.`);
  process.exit(2); // PostToolUse + exit 2: the edit stays, and this message goes back to Claude to fix it
}
