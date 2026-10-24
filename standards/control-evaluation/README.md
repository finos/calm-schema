# Control Evaluation Decorator Standard

`control-evaluation.decorator.standard.json` records the result of evaluating one control from a CALM
architecture: whether the control was met, and if not, why. For example, a policy engine that checks a change
before it merges writes one decorator per control per change. The architecture then holds its own compliance
history.

The standard does not depend on one engine. Any engine that can say which control it evaluated, whether the
control passed and which checks failed can write it.

It extends the [CALM 1.3 decorator](../../schema/decorators.json).

## Fields

| Field | Required | Meaning |
| --- | --- | --- |
| `type` | yes | Always `control-evaluation` |
| `target-type` | yes | Always `["architecture"]` |
| `target` | yes | The architecture evaluated, at its version. In CALM Hub, the path `/api/calm/namespaces/{namespace}/architectures/{id}/versions/{major-minor-patch}` |
| `applies-to` | yes | The elements the evaluation was about: the nodes and relationships in scope. When nothing was in scope, the element that carries the control |
| `data.control.unique-id` | yes | The key of the control in the `controls` of the architecture |
| `data.control.requirement-url` | yes | The fully qualified URL of the control requirement that the control configuration conforms to |
| `data.control.control-id` | no | The identifier of the control in an external catalog, for example `SDLC-PREV-001` |
| `data.control.attached-to` | no | The element that carries the control |
| `data.status` | yes | `met`, `not-met` or `not-applicable` |
| `data.evaluated-at` | yes | When the engine evaluated the control |
| `data.findings` | when `not-met` | One entry per failed check: `subject` and `description` (required), `check`, `expression`, `cause` |
| `data.change` | no | The change evaluated: `commit` (required), `diff-sha256`, `spec` |
| `data.actors` | no | The identities involved, for example `author`, `reviewer`, `approver` |
| `data.engine` | no | What evaluated the control: `name` (required), `version`, `policy-sha256` |
| `data.report-sha256`, `data.report-uri` | no | The full report of the engine, kept as evidence |

A `not-met` evaluation must say why: `findings` is required and must not be empty.

## Status

| Status | Meaning |
| --- | --- |
| `met` | Every check in scope passed |
| `not-met` | A check failed, or the engine could not do it |
| `not-applicable` | Nothing was in scope |

## Examples

See [`examples/`](examples/).
