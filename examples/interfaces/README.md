# CALM Interfaces

Interface definitions that CALM documents can reference by URL. Each file is a JSON Schema whose
`$id` is the URL it is published at.

| Directory | Contents |
|---|---|
| `example/` | Example interface types. They show the shape of a CALM interface definition and may change without warning. |

There are no standardized, FINOS-approved interface definitions yet. A proposal for one starts with
an issue in this repository.

## Publishing

The `publish-site.yml` workflow syncs this directory to `https://calm.finos.org/interfaces/` on
every push to `main` that changes it, and when a release is published. Nothing else writes to that
prefix.

CALM Hub does not read this directory. The seed data of CALM Hub in
[finos/architecture-as-code](https://github.com/finos/architecture-as-code) (`calm-hub/mongo/interfaces/`)
holds a copy of `example/`, which it seeds into the `finos.calm` namespace. Update that copy when a
file here changes.

## Contributing

1. Give the file a `$id` of the form `https://calm.finos.org/interfaces/<directory>/<name>.json`,
   with the same path as the file. The URL must resolve after publication.
2. Add a `title` and a `description`. CALM Hub uses the `title` as the name of the interface.
3. Submit a pull request. Changes need approval from a member of the
   [calm-schema-governance](https://github.com/orgs/finos/teams/calm-schema-governance) team.

## Usage

A CALM document references an interface definition by its published URL:

```json
"interfaces": [
  {
    "unique-id": "service-url",
    "definition-url": "https://calm.finos.org/interfaces/example/url.json",
    "config": { "url": "https://example.com/api" }
  }
]
```
