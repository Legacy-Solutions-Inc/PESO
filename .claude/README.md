# .claude/

Claude Code configuration for **PESO Lambunao**. Committed to the repo so every contributor gets the same permissions, slash commands, and subagents.

## What's in here

- `settings.json` — team-shared permissions (`allow` / `ask` / `deny`) and MCP tool access. Edit with care; changes affect every contributor.
- `commands/` — custom slash commands. Each `*.md` file becomes a `/<filename>` command.
- `agents/` — project-specific subagents invoked via `@<name>`.

## What's NOT here (intentionally)

- `settings.local.json` — personal overrides, gitignored. Create your own if you need looser or stricter local rules.
- `.credentials.json` — any Claude Code auth artifact, gitignored.
- Framework conventions — those live in `../AGENTS.md` and `../.cursor/*.mdc`. This folder references them; it does not duplicate them.

## Docs

- Claude Code: <https://docs.claude.com/en/docs/claude-code>
- Project SRS (source of truth): `../docs/requirements.md`
- Project memory Claude auto-loads: `../CLAUDE.md`

## Editing tips

- JSON comments aren't allowed in `settings.json`; put rationale in commit messages instead.
- Run `claude` in the repo root and type `/` — if a new command doesn't appear, its frontmatter is probably malformed.
- A subagent with no `tools:` key inherits the parent's tools. If you intend read-only, list tools explicitly.
