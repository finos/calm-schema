# Control Evaluation Decorator Examples

| Example | Demonstrates |
| --- | --- |
| `ledger-change-not-met.decorator.json` | A change to a service that connects to the Client Ledger, with no human approval: `not-met`, with the finding |
| `ledger-change-met.decorator.json` | The same change after a human approved it: `met`, with the approver |
| `service-dependency-not-applicable.decorator.json` | A scheduled evaluation with nothing in scope: `not-applicable`, no `change`, `applies-to` names the element carrying the control |

All three target an architecture stored in CALM Hub, by the exact path the Hub uses to filter decorators.
