[![FINOS - Incubating](https://cdn.jsdelivr.net/gh/finos/contrib-toolbox@master/images/badge-incubating.svg)](https://community.finos.org/docs/governance/lifecycle-stages/incubating)

# CALM Schema

This repository holds the CALM Meta Schema — the JSON Schema definitions that describe the CALM
(Common Architecture Language Model) document format — along with its documentation and validation
test suite. The schema is the artefact that defines the contract between all CALM tools, including the
CLI, CALM Hub, the VS Code extension, and any third-party tooling built against CALM.

The `main` branch holds the current, unreleased state of the schema; there are no draft or release
folders — individual changes are developed on feature branches and merged to `main` via pull request.
Merging to `main` does not itself publish anything: it produces a release candidate that can accumulate
further merged changes before a release is cut. Publishing to npm as
[`@finos/calm-schema`](https://www.npmjs.com/package/@finos/calm-schema) is a separate, manually
triggered step, so a schema version is only ever released deliberately — never as a side effect of
merging a PR — and multiple changes can be bundled into a single release. Each release is tagged with a
semantic version; previous versions remain available on npm and as git tags.

## Project repositories

CALM Schema is one of three repositories that make up the FINOS Architecture as Code project, also
known as CALM:

| Repository | Contents |
|------------|----------|
| [calm-governance](https://github.com/finos/calm-governance) | The governance home — project-wide governance, contribution guidelines, and Code of Conduct. Holds no code. |
| **calm-schema** | This repository. The CALM Meta Schema, its documentation, and validation test suite. |
| [architecture-as-code](https://github.com/finos/architecture-as-code) | The main repository — CLI, server, shared libraries, data models, widgets, CALM Hub and its UI, the VS Code extension, and the documentation site. Depends on `@finos/calm-schema` published from this repository. |

## Proposing a schema change

1. Open a GitHub Issue using the Schema Change Proposal template, describing the motivation, the
   proposed change, and the impact on existing tooling.
2. Once agreed, develop the change on a feature branch alongside updated validation tests. CI runs the
   schema test suite on every push.
3. Open a pull request to `main`. It requires approval from a member of the
   [calm-schema-governance](https://github.com/orgs/finos/teams/calm-schema-governance) team — see
   [CONTRIBUTING.md](CONTRIBUTING.md#review-and-approval).
4. On merge, the change lands on `main` as part of the next release candidate. It is **not**
   automatically published — `main` can accumulate several merged changes before a release is cut.
5. When maintainers decide to cut a release, publishing to npm and tagging the release is a separate,
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
