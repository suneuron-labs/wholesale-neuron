# Output Presentation Rules & Communication Protocol & Human Notification Anchor
- strictly follow these rules no exception, if you are in doubt the ask
clearly

1. Whenever you speak directly to me (asking a question, providing an update, reporting a completion, or requesting attention), ALWAYS prefix that text block with:
   🚨 **[FOR SUNIL]** 🚨
   (or on its own distinct heading line: `### 🚨 [FOR SUNIL] 🚨`)

2. Never put this prefix on internal step updates, tool executions, or intermediate progress notes. Reserve it strictly for direct human-facing messages.

3. Keep any text following this header extremely concise (1–3 bullet points maximum). Eliminate all filler and pleasantries.

4. NEVER repeat or quote raw command outputs, stdout, or JSON dumps in your chat messages. 
5. Summarize findings strictly in 1 to 3 concise bullet points.
6. If you run a command to inspect configuration (e.g., package.json, schema), do not echo the file contents. State only the extracted facts (e.g., "Prisma 5.x detected with Neon connection string").
7. Keep the final response separated from tool cards so it is immediately legible.

- Be concise and direct. Eliminate conversational filler, pleasantries, and unnecessary explanations.
- Do NOT provide pre-action narration (e.g., avoid "Now I will read the file...", "Let's check the schema...").
- Execute tool calls directly without prior conversational commentary.
- Post-action summaries must be minimal: state only what was modified, added, or deleted, in 1 to 3 bullet points.
- If a task finishes without error, simply state the outcome in one sentence. Do not lecture on how the code works unless explicitly asked.
- Omit boilerplate code in chat responses; perform file edits directly using the file tools rather than echoing full code blocks in chat.
- NEVER use terminal commands (PowerShell, bash, cmd) to read, search, or edit code. 
- Use the built-in `read_file`, `write_to_file`, and `replace_in_file` tools only.
- Run terminal commands ONLY for package management (`npm`), database syncing (`prisma`), or starting the server.

# Plan & Progress Tracking Protocol
- The project tracker is located at `.cline/spec-plans/plan-and-tracker.md`.
- Do NOT read, touch, or update this file automatically on routine turns.
- When explicitly asked to log, update, or plan (e.g., "update tracker", "log progress", "update plan"):
  1. Inspect or modify `.cline/spec_plans/plan-and-tracker.md` using the file tools.
  2. Keep updates structured: clearly separate Completed Tasks, In-Progress Work, and Next Steps.
  3. Mark finished items with dates/checkmarks and record key architecture or environment decisions briefly.
  4. Once written, confirm the update in 1 bullet point under the `### 🚨 [FOR SUNIL] 🚨` heading.
- Status sync rule: whenever project status changes (commit, push, deploy, database or environment change, scope or config change, completed task), update `.cline/spec-plans/plan-and-tracker.md` in the same turn so it reflects the current state. This overrides the "do not update on routine turns" restriction for status changes. Remove or correct any stale status line the change makes wrong.