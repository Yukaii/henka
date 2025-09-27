# Repository Guidelines

## Project Structure & Module Organization
- `app/` contains Next.js pages and layout shells. Client components live under `components/`, with UI primitives in `components/ui/` and feature modules (e.g., audio controls, training session) beside them.
- Reusable logic resides in `lib/` (`audio-engine.ts`, `chord-generator.ts`, `progress-tracker.ts`, etc.). Tests are placed in `tests/` and compiled into `dist-tests/` when running the test suite.
- Static assets and configuration files sit in `public/`, `styles/`, and root-level configs like `tsconfig.json`, `.eslintrc.json`, and `next.config.mjs`.

## Build, Test, and Development Commands
- `npm run dev` – start the local Next.js dev server with hot reload.
- `npm run build` – create the production build (used by CI/deploy).
- `npm run lint` – run ESLint with the Next.js rule set; fixes must be applied manually.
- `npm run test` – compile tests via `tsc -p tsconfig.test.json` and execute Node’s test runner on `dist-tests/tests`.

## Coding Style & Naming Conventions
- TypeScript is required for shared logic; prefer functional React components. Use 2-space indentation and keep files ASCII unless domain data mandates otherwise.
- Follow descriptive camelCase for variables/functions (`generateProgressionFromRoman`), PascalCase for components (`AudioControls`), and kebab-case for file names in `components/`.
- ESLint enforces strict typing and React best practices; run `npm run lint` before pushing.

## Testing Guidelines
- Unit tests rely on Node’s built-in `node:test` runner. Place specs in `tests/` named `<feature>.test.ts` (e.g., `tests/chord-generator.test.ts`).
- Ensure new features that manipulate chord logic or audio scheduling include assertions around MIDI note output and progression metadata.
- Execute `npm run test` locally; commit only after both lint and test commands pass.

## Commit & Pull Request Guidelines
- Use concise, imperative commit subjects (e.g., `Fix chord inversion parsing`). Group related changes into a single commit when possible.
- Pull requests should describe the problem, summarize the solution, list new commands or tests, and attach relevant screenshots or debug-mode captures if UI changes are involved.
- Reference tracking issues with `Fixes #<id>` or `Closes #<id>` when applicable, and note any manual QA steps in the PR description.
