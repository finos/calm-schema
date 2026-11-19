# Threat Model Examples

Each decorator targets an architecture in this folder. The tests check each architecture against CALM 1.3,
and check that each decorator names the flow, elements and sequence numbers of its architecture.

| Example | Standard | Shows |
| --- | --- | --- |
| `payments-api.architecture.json` | CALM 1.3 | A mobile app, an API gateway, a payments service and a database, with the Submit Payment flow and controls on nodes, relationships and the architecture |
| `submit-payment.stride.threat-model.decorator.json` | STRIDE | Three trust boundaries and six threats: two mitigated, two partly mitigated, one identified with a gap, one accepted. One threat is also classified as a CWE |
| `agent-gateway.architecture.json` | CALM 1.3 | A slice of the FINOS multi-agent reference architecture: an orchestrator, an agent gateway, an agent registry and a research agent inside an agent platform |
| `route-agent-request.threat-model.decorator.json` | Base | Three threats from the FINOS multi-agent threat model, by catalog id: partly mitigated, transferred to a provider, and not applicable. A boundary on a container node |

The payments threats use these controls. `rate-limiting` is not declared, so a tool shows a gap.

| Control | Declared on |
| --- | --- |
| `oauth2-authentication` | `api-gateway` |
| `authorization-checks` | `payments-api` |
| `encryption-at-rest` | `payments-db` |
| `transport-security`, `mutual-tls` | relationships |
| `audit-logging` | the architecture |
| `rate-limiting` | nowhere (gap) |

The agent gateway threats and controls come from the
[FINOS multi-agent reference architecture threat model](https://github.com/finos/ai-reference-architecture-library/blob/main/Library/reference_architecture/agentic_ai/multi_agent/tm/tm_ma_ref_arch_apr_2026.md).
Only `C9` is declared in the architecture, so `C8` and `C10` are gaps.
