[![FINOS - Incubating](https://cdn.jsdelivr.net/gh/finos/contrib-toolbox@master/images/badge-incubating.svg)](https://community.finos.org/docs/governance/lifecycle-stages/incubating)

# CALM Schema

CALM (the Common Architecture Language Model) is a JSON Schema vocabulary for describing software
architecture as data: the nodes that make up a system, the relationships between them, the interfaces
they expose, the business flows that run across them, and the controls that govern them. A CALM document
is a plain JSON file that validates against this schema, so it can be produced and consumed by tooling —
generated from code, rendered as diagrams, checked in CI, or used to enforce architectural and compliance
rules — rather than living only as a diagram in a slide deck.

* **Nodes** — architecture components (systems, services, databases, actors) with properties, interfaces,
  and deployments
* **Relationships** — connections between nodes (`interacts`, `connects`, `deployed-in`, `composed-of`)
* **Flows** — business flows composed of ordered transitions across relationships, mapping business
  processes onto technical components
* **Controls** — security and compliance requirements attached to nodes, relationships, or flows
* **Interfaces** — modular interface definitions, either built in or externally defined
* **Metadata** — free-form annotations on any schema element

## Using the schema

The schema is published to npm as [`@finos/calm-schema`](https://www.npmjs.com/package/@finos/calm-schema):

```sh
npm install @finos/calm-schema
```

Each published version is immutable and corresponds to a git tag in this repository (e.g. `v1.2`). See
[CHANGELOG.md](CHANGELOG.md) for what changed in each release. CALM tooling — including the
[CLI](https://github.com/finos/architecture-as-code), CALM Hub, and the VS Code extension — depends on a
specific published version of this package to validate CALM documents.

## Project repositories

CALM Schema is one of three repositories that make up the FINOS Architecture as Code project, also
known as CALM:

| Repository | Contents |
|------------|----------|
| [calm-governance](https://github.com/finos/calm-governance) | The governance home — project-wide governance, contribution guidelines, and Code of Conduct. Holds no code. |
| **calm-schema** | This repository. The CALM Meta Schema, its documentation, and validation test suite. |
| [architecture-as-code](https://github.com/finos/architecture-as-code) | The main repository — CLI, server, shared libraries, data models, widgets, CALM Hub and its UI, the VS Code extension, and the documentation site. Depends on `@finos/calm-schema` published from this repository. |

## Proposing a schema change

Schema changes are developed on feature branches and merged to `main` via pull request; `main` always
holds the current, unreleased state of the schema. Merging to `main` does not publish anything by
itself — it produces a release candidate that can accumulate further merged changes before a release is
deliberately cut and published to npm as a separate, manually triggered step.

1. Open a GitHub Issue using the Schema Change Proposal template, describing the motivation, the
   proposed change, and the impact on existing tooling.
2. Once agreed, develop the change on a feature branch alongside updated validation tests. CI runs the
   schema test suite on every push.
3. Open a pull request to `main`. It requires approval from a member of the
   [calm-schema-governance](https://github.com/orgs/finos/teams/calm-schema-governance) team — see
   [CONTRIBUTING.md](CONTRIBUTING.md#review-and-approval).
4. When maintainers decide to cut a release, publishing to npm and tagging the release is a separate,
   manually triggered step, kept deliberately outside of the merge process to avoid publishing a schema
   version prematurely.

## Contributing
For any questions, bugs or feature requests please open an [issue](https://github.com/finos/calm-schema/issues)
For anything else please send an email to {project mailing list}.

To submit a contribution:
1. Fork it (<https://github.com/finos/calm-schema/fork>)
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Read this repository's [contribution guidelines](CONTRIBUTING.md), the project-wide
   [contribution guidelines](https://github.com/finos/calm-governance/blob/main/CONTRIBUTING.md)
   and the [Community Code of Conduct](https://www.finos.org/code-of-conduct)
4. Commit your changes (`git commit -am 'Add some fooBar'`)
5. Push to the branch (`git push origin feature/fooBar`)
6. Create a new Pull Request

Changes to the schema require approval from a member of the
[calm-schema-governance](https://github.com/orgs/finos/teams/calm-schema-governance) team — see
[CONTRIBUTING.md](CONTRIBUTING.md#review-and-approval).

_NOTE:_ Pull requests must follow this repository’s contribution policy. FINOS projects typically use **DCO** (signed commits) and/or **CLA** via [EasyCLA](https://community.finos.org/docs/governance/Software-Projects/easycla), depending on configuration. Read [FINOS Contribution Requirements](https://community.finos.org/docs/governance/Software-Projects/contribution-compliance-requirements) before contributing.

*Questions about CLA, DCO, or EasyCLA? Email [help@finos.org](mailto:help@finos.org)*

## Governance

The project's governance policies, Maintainer roster and Code of Conduct are maintained in
[finos/calm-governance](https://github.com/finos/calm-governance) and apply across every repository
in the project.

| Document | Covers |
|---|---|
| [GOVERNANCE.md](https://github.com/finos/calm-governance/blob/main/GOVERNANCE.md) | Roles, contribution rules, Maintainer voting, and how Maintainers are added and removed |
| [MAINTAINERS.md](https://github.com/finos/calm-governance/blob/main/MAINTAINERS.md) | The project-wide Maintainer roster and the Lead Maintainer |
| [CONTRIBUTING.md](https://github.com/finos/calm-governance/blob/main/CONTRIBUTING.md) | Project-wide contribution guidelines |
| [CODE_OF_CONDUCT.md](https://github.com/finos/calm-governance/blob/main/CODE_OF_CONDUCT.md) | The Code of Conduct all participants are subject to |

## License

Copyright 2026 FINOS

Distributed under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0).

SPDX-License-Identifier: [Apache-2.0](https://spdx.org/licenses/Apache-2.0)
