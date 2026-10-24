# CALM Schema - AI Assistant Guide

## What this repository owns

The CALM Meta Schema: the JSON Schema documents that every CALM document validates against.

| Path | Contents |
|---|---|
| `schema/*.json` | The current, unreleased schema, edited in place. No version folders. |
| `standards/<name>/` | Standards that extend a schema definition, with their examples. Each standard has its own version. See [Changing a standard](#changing-a-standard). |
| `tests/` | `npm test`: every schema is valid JSON, compiles as JSON Schema 2020-12, every `$ref` resolves, every `$id` is unique. Every standard compiles, and every example of a standard is valid. |
| `CHANGELOG.md` | One entry per release. |
| `examples/interfaces/` | Interface definitions, published to `https://calm.finos.org/interfaces/`. See its README. |
| `.github/workflows/` | `ci.yml` runs the tests. `publish.yml` releases: npm, then the site, then the compatibility tests in architecture-as-code. |

Releases are git tags `v<major>.<minor>` and npm versions of `@finos/calm-schema`. Every release is
immutable: the tag, the npm version and the files at `https://calm.finos.org/release/<version>/meta/`
all hold the same content.

## Which repository owns what

| Repository | Owns | Send here |
|---|---|---|
| [calm-governance](https://github.com/finos/calm-governance) | Project-wide governance, the Maintainer roster, contribution guidelines, the Code of Conduct. No code | Governance and roster changes |
| [calm-schema](https://github.com/finos/calm-schema) | This repository | Schema changes, schema releases, interface definitions |
| [architecture-as-code](https://github.com/finos/architecture-as-code) | The tools: CLI, server, shared libraries, data models, widgets, CALM Hub and its UI, the VS Code extension, CALM Studio, CALM Guard, the docs site and CALM Lab. They get the schema from the npm package | Tool changes, the documentation site, examples that the tools use |

## Working across the repositories

Clone the three repositories side by side, with the same parent directory:

```
<parent>/
├── architecture-as-code/
├── calm-schema/
└── calm-governance/
```

- Start the agent in `architecture-as-code`, and add the other two repositories as additional
  directories. Each repository has its own `AGENTS.md`; read the one for the repository you change.
- Target commands at the correct repository: `git -C ../calm-schema ...` and
  `gh ... --repo finos/calm-schema`. A command run in the wrong repository branches, commits or
  opens a pull request in the wrong place.
- Each repository is a fork clone: `origin` is the contributor's fork and `upstream` is the FINOS
  repository. Branch from `upstream/main` and open pull requests against `finos/<repo>`.

## Changing the schema

1. Open an issue with the Schema Change Proposal template. Say what changes and what it does to
   the tools.
2. Edit `schema/*.json` on a branch. Keep the `$id` of each file as
   `https://calm.finos.org/release/<version>/meta/<file>`, where `<version>` is the next release.
   `publish-site.yml` refuses a release whose `$id` does not match its URL.
3. Run `npm ci` and `npm test` with the Node version in `.nvmrc`. A new kind of check needs a test
   in `tests/`.
4. Open a pull request. Every change needs approval from a member of
   `@finos/calm-schema-governance` (`.github/CODEOWNERS`).

A merge to `main` publishes nothing. A Maintainer cuts a release by running `publish.yml` by hand.
After the npm publish, the workflow publishes the site and starts the
[compatibility workflow](https://github.com/finos/architecture-as-code/actions/workflows/calm-schema-compatibility.yml)
in architecture-as-code, which tests every tool against the new version and opens an issue there
that names the tools that fail.

### Rules

- Never change a released version. A fix is a new release.
- A tighter constraint (a new `required` field, `additionalProperties: false`, a narrower type) is a
  breaking change. It needs a new major version and a migration note in `CHANGELOG.md`.
- The tools in architecture-as-code validate by structure, not by name. A change that adds a
  reference between documents (for example, "the interface exists on the target node") usually needs a
  Spectral rule there too. Say so in the proposal.
- Write documentation in Simplified Technical English where possible, as concise as possible. Prefer
  tables to long lists of options.

## Changing a standard

A standard extends a schema definition. For example, the deployment decorator standard in
`standards/deployment/` extends the decorator. Each standard has its own version, separate from the
schema version. The npm package does not include the standards, and CALM Hub keeps its own copy as
seed data.

1. Edit `standards/<name>/` on a branch. Keep the `$id` of each standard as
   `https://calm.finos.org/standards/<name>/<version>/<file>`, where `<version>` is the next release
   of the standard. All the standards in one directory have the same version.
2. A `$ref` to the schema names a release, for example `release/1.3/meta/decorators.json`. A
   standard can stay on that release when `schema/` moves to the next one: `npm test` takes an
   earlier release from its `v<major>.<minor>` tag. In a fork, run `git fetch upstream --tags`.
3. Add or update an example in `standards/<name>/examples/`. `npm test` validates each example
   against the standard in its `$schema`.
4. To release, tag `standard-<name>-v<major>.<minor>`, then run `publish-site.yml`. The schema
   release that the standard references must be on calm.finos.org first, or in the same run.
   `publish-site.yml` publishes only the JSON files at the top of `standards/<name>/`, not the
   examples.

The [Rules](#rules) for the schema also apply to a standard.
