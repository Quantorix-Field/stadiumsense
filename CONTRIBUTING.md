# Contributing to StadiumSense

## Development setup

```bash
npm install
npm run dev
```

## Before committing

Run the full verification suite — this mirrors exactly what CI checks on every push:

```bash
npm run typecheck   # TypeScript compiles with no errors
npm run lint         # ESLint passes with no warnings
npm run format:check # Code matches Prettier formatting
npm run test         # All tests pass
```

To auto-fix formatting issues:

```bash
npm run format
```

## Code style

- Full TypeScript — no `any` types, `noUnusedLocals` and `noUnusedParameters` are enforced.
- Business logic lives in `src/utils/` and `src/hooks/`, kept separate from presentational components in `src/components/`.
- Every exported function that isn't self-explanatory should have a JSDoc comment explaining *why*, not just *what*.
- New features that touch user-facing behavior should include a corresponding test in `tests/`.

## Commit messages

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — a new feature
- `fix:` — a bug fix
- `test:` — adding or updating tests
- `docs:` — documentation only
- `chore:` — tooling, dependencies, or config
- `perf:` — a performance improvement
- `style:` — formatting or CSS changes with no logic change
