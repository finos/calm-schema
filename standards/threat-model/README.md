# Threat Model Decorator Standard

A threat model decorator records one threat model on one CALM flow: the trust boundaries that the flow
crosses, the threats to its nodes and relationships, and the controls that mitigate each threat. A decorator
keeps the assessment apart from the architecture, so the assessment can change when the architecture does not.

The standards extend the [CALM 1.3 decorator](../../schema/decorators.json).

| Standard | Use |
| --- | --- |
| `threat-model.decorator.standard.json` | Any method. Fields, statuses and the rules for each status |
| `stride.threat-model.decorator.standard.json` | Extends the base for STRIDE. `methodology` is `STRIDE`, and each threat has a classification with `scheme` exactly `STRIDE` and one of the six categories |

```
decorators.json (base decorator)
  └── threat-model.decorator.standard.json
        └── stride.threat-model.decorator.standard.json
```

Another method, for example LINDDUN, adds its own standard that extends the base in the same way.

## Fields

| Field | Required | Meaning |
| --- | --- | --- |
| `type` | yes | Always `threat-model` |
| `target-type` | yes | Always `["architecture"]` |
| `target` | yes | The architecture that holds the flow in its `flows`. In CALM Hub, the path `/api/calm/namespaces/{namespace}/architectures/{id}/versions/{major-minor-patch}` |
| `applies-to` | yes | The `unique-id` of the flow, and every node and relationship that a boundary or a threat names |
| `data.flow` | yes | The `unique-id` of the flow |
| `data.methodology` | yes | The method, for example `STRIDE`, `PASTA`, `LINDDUN` or the method of a firm |
| `data.assessed-on` | yes | The date of the assessment |
| `data.assessor` | no | The person or team that did the assessment |
| `data.trust-boundaries[]` | no | `unique-id`, `name` and `elements` (required), `description`. `elements` holds the nodes and relationships that the boundary marks |
| `data.threats[]` | yes | `unique-id`, `name`, `applies-to` and `status` (required). An empty list records that no threat was found |
| `threats[].applies-to` | yes | The nodes and relationships that the threat applies to |
| `threats[].sequence-numbers` | no | The transitions of the flow that the threat applies to. With none, all transitions of its relationships |
| `threats[].classification[]` | no | `scheme` and `value` (required), `reference`. Any taxonomy, for example STRIDE, CWE or MITRE ATT&CK |
| `threats[].likelihood`, `impact` | no | `low`, `medium`, `high` or `critical` |
| `threats[].justification` | when `accepted`, `transferred` or `not-applicable` | Why the status is correct |
| `threats[].mitigations[]` | when `mitigated` or `partially-mitigated` | `control` and `state` (required), `attached-to`, `note`, `evidence` |
| `threats[].residual-risk` | when `accepted` or `transferred` | `rating` (required), `accepted-by` (required for these statuses), `review-by` |

In `data`, no string can be empty, a list of ids has no duplicates, and every object accepts more fields, so a
firm or a method standard can add its own.

A boundary on a node that holds other nodes marks all of them. A tool finds them from the `deployed-in`
and `composed-of` relationships of the architecture.

## Status

| Status | Meaning | Needs |
| --- | --- | --- |
| `identified` | Found, with no decision yet | Nothing |
| `mitigated` | Controls stop the threat | A mitigation that is `implemented` or `verified` |
| `partially-mitigated` | Controls stop part of the threat | A mitigation |
| `accepted` | The owner accepts the risk | `residual-risk` with `rating` and `accepted-by`, and `justification` |
| `transferred` | Another party owns the risk, for example a provider | `residual-risk` with `rating` and `accepted-by`, and `justification` |
| `not-applicable` | The threat cannot occur here | `justification` |

## Mitigation state

| State | Meaning |
| --- | --- |
| `planned` | The control is not in place |
| `implemented` | The control is in place |
| `verified` | There is evidence that the control works. Put it in `evidence` |

## Rules that JSON Schema cannot check

A tool must check these rules.

- The flow in `data.flow` is in the `flows` of the target.
- Each id in `elements`, `threats[].applies-to` and `attached-to` is a node or relationship of the target.
- `applies-to` lists the flow and each id in `elements` and `threats[].applies-to`. CALM Hub draws a decorator
  on the elements in `applies-to`.
- Each sequence number is a transition of the flow.
- Boundary ids are unique, and threat ids are unique.

A tool finds the control of a mitigation in this order: the element in `attached-to`; the nodes and
relationships in `threats[].applies-to`; the source and destination nodes of those relationships; the
`controls` of the flow; the `controls` of the architecture. A control that it does not find is a gap. A gap is
a finding, not an error.

## Next version

When the CALM schema lets a decorator target a flow document, version 1.1 of this standard allows
`target-type: ["flow"]`. `target` is then the flow document, and `data` does not change.

## Examples

See [`examples/`](examples/).
