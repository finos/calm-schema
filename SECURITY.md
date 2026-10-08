# Security Policy

This project supports responsible disclosure of security vulnerabilities and adheres to the [FINOS Security Vulnerabilities Responsible Disclosure Policy](https://community.finos.org/docs/governance/software-projects/cve-responsible-disclosure). If you believe you have found a security vulnerability in this project, we encourage and appreciate your report. Please report it privately using one of the methods below — **do not** open a public GitHub Issue or otherwise disclose it publicly.

## Reporting a Vulnerability

- **GitHub private vulnerability reporting (preferred):** Use the ["Report a vulnerability"](../../security/advisories/new) button under this repository's **Security** tab. This opens a private advisory and communication channel with the maintainers.
- **Email:** If you're unable to use GitHub's private reporting, email [security@finos.org](mailto:security@finos.org) with a description of the issue. If maintainers are listed in [MAINTAINERS.md](MAINTAINERS.md), you may also email them and cc [security@finos.org](mailto:security@finos.org).

## Vulnerability Process

1. **Report the vulnerability privately** using one of the methods above.
2. The project team will acknowledge receipt, triage the report, and — if confirmed — work with you to investigate and develop a fix.
3. Once a fix is available, it will be released and the vulnerability will be publicly disclosed in accordance with the [FINOS Security Vulnerabilities Responsible Disclosure Policy](https://community.finos.org/docs/governance/software-projects/cve-responsible-disclosure).

## Supported Versions

Security fixes are always delivered as a new release. Which releases of the CALM schema are supported, and when a release stops receiving security updates, is stated in the project's [SUPPORT.md](https://github.com/finos/architecture-as-code/blob/main/SUPPORT.md).

## Threat Model

The project's threat model and attack surface analysis, which covers the CALM schema, is maintained in [THREAT_MODEL.md](https://github.com/finos/architecture-as-code/blob/main/THREAT_MODEL.md).

## Dependency and Code Scanning Policy

This section is the policy for findings from software composition analysis (SCA) and static application security testing (SAST) in this repository. It follows the project-wide policy in [finos/architecture-as-code](https://github.com/finos/architecture-as-code/blob/main/SECURITY.md#dependency-and-code-scanning-policy).

The `dependency-review` SCA check must pass on every pull request and blocks the merge of any change that adds known vulnerabilities of moderate severity or higher or malicious dependencies. Dependabot raises alerts and security update pull requests for the dependencies already in the tree.

Critical and high severity vulnerabilities must be fixed within 7 days of being reported. Medium severity vulnerabilities must be fixed within 30 days. Low severity vulnerabilities must be fixed in the next scheduled release. A dependency whose license is incompatible with Apache-2.0 must be removed or replaced before the change is merged, so that only dependencies with an approved permissive license are used.

All SCA findings above these thresholds must be addressed before any release of the schema, and the release is blocked until each finding is fixed or declared non-exploitable as described below. Before running the publish workflow, the releasing maintainer must confirm that no Dependabot alert above these thresholds is open. The published package contains only the schema files and has no runtime dependencies.

A finding may be suppressed only when a maintainer declares it non-exploitable for this project and dismisses the alert with a written justification recorded on the alert.

CodeQL runs SAST on every pull request and weekly against `main`. Code scanning results of high severity or above block the merge. Critical and high severity SAST findings must be fixed before merge. Medium and low severity SAST findings must be fixed, or dismissed with a documented justification, within 30 days of being raised.

## Secrets and Credentials

This repository stores no long-lived credentials. Releases are published to npm through npm trusted publishing: the publish workflow authenticates with a short-lived GitHub OIDC token, so there is no npm token to store, rotate or leak. Any secret added in future must be stored only as a GitHub Actions secret, scoped to the workflow that needs it, and rotated when a maintainer with access leaves the project or on any suspicion of exposure. GitHub secret scanning and push protection are enabled to stop secrets being committed.

## Verifying Release Integrity and Authenticity

The schema is published to npm as [`@finos/calm-schema`](https://www.npmjs.com/package/@finos/calm-schema) only by the `publish.yml` workflow in this repository. Each version carries a [SLSA provenance attestation](https://slsa.dev/provenance/v1) that names `finos/calm-schema` and that workflow. To verify an installed copy:

```bash
npm audit signatures
```

The command reports `verified attestations` when the registry signature and provenance attestation are valid. The *Provenance* panel on the package's npmjs.com version page shows the repository and workflow that built it.

## CRA Escalation (For Maintainers)

CRA stewardship: This project is supported under the Linux Foundation CRA stewardship framework. Security vulnerabilities should be reported through the mechanisms described in this file, which we will coordinate with our CRA steward. For actively exploited vulnerabilities and severe incidents that may require CRA escalation, please use the project's emergency security reporting mechanisms as appropriate. Read more at https://www.linuxfoundation.org/security .

**Project maintainers MUST escalate** the issue to the LF steward at [steward@linuxfoundation.org](mailto:steward@linuxfoundation.org) if the project experiences either of the following:

- **Actively exploited vulnerabilities:** a security vulnerability where the project has reliable evidence that a malicious actor has exploited it.
- **Severe incident:** a security compromise of the project’s own IT infrastructure.

Ordinary vulnerabilities with no evidence of exploitation are not CRA escalation events. Escalate those that are actively exploited.

---

Thank you for helping keep FINOS projects and their users secure.
