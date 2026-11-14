# C4 Mapping Standard

This standard gives one set of rules to show a CALM architecture as a [C4 model](https://c4model.com). With
these rules, every CALM tool shows the same C4 model for the same architecture. An organisation can map its
own node types to C4 kinds with a custom mapping.

The standard does not change the CALM schema. It is published at `https://calm.finos.org/standards/c4/1.0/`.

| File | Contents |
| --- | --- |
| `c4-mapping.json` | The JSON Schema of a C4 mapping document |
| `calm-default.c4-mapping.json` | The default mapping for the CALM node types |
| [`examples/`](examples/) | A custom mapping that extends the default mapping |

## The mapping document

| Field | Required | Meaning |
| --- | --- | --- |
| `unique-id` | yes | The identifier of the mapping |
| `extends` | no | The URL of the mapping that this mapping extends, usually the default mapping |
| `node-types` | no | A map from a CALM `node-type` to a C4 kind, or to `{ "kind", "external" }` |
| `nesting` | no | `demote` or `strict`. See [Nesting](#nesting). Default `demote` |
| `description` | no | What the mapping is for |
| `$id` | no | The URL where the mapping is published, for a mapping that other mappings extend |

A node type with `external: true` is outside the enterprise (rule E4).

### C4 kinds

| Kind | Meaning |
| --- | --- |
| `person` | A C4 person |
| `software-system` | A C4 software system |
| `container` | A C4 container |
| `component` | A C4 component |
| `deployment-node` | A C4 deployment node. It shows on deployment diagrams only |
| `enterprise-boundary` | The boundary of the enterprise. See rule E2 |
| `hidden` | The tool does not show the node or its relationships. The children of the node take its place in the hierarchy |

### The default mapping

| CALM `node-type` | C4 kind |
| --- | --- |
| `actor` | `person` |
| `system` | `software-system` |
| `service`, `database`, `webclient`, `data-asset`, `ldap` | `container` |
| `ecosystem` | `enterprise-boundary` |
| `network` | `deployment-node` |

## How a tool uses a mapping

1. When no mapping is set, the tool uses the default mapping.
2. When a mapping has `extends`, the tool loads that mapping first. The entries of the mapping replace the
   entries of the mapping it extends. A mapping that does not set `nesting` uses the `nesting` of the mapping it
   extends. A chain of `extends` is permitted. A tool stops with an error on a cycle.
3. A mapping with no `extends` replaces the default mapping.

The tool gets the kind of a node from the mapping. When the mapping does not name the node type, the tool uses
the structural rules. For a custom mapping that extends the default mapping, the order is: the custom mapping,
the default mapping, the structural rules.

A tool can show which kinds came from the structural rules. A team then sees which node types to map.

## Structural rules

These rules apply to a node whose type the mapping does not name.

1. A top-level node with `composed-of` children is a software system.
2. A child of a software system is a container. A child of a container is a component.
3. A top-level node with no children is a software system.
4. `deployed-in` gives deployment diagrams only. It does not set a C4 level.
5. `details.detailed-architecture` links to the next level down: the architecture it names holds the
   containers or components of the node.
6. A container that no software system holds belongs to one implicit software system. The tool names it after
   the architecture's `title` when it has one, and shows that it is implicit. The implicit system is inside the
   enterprise when any of its containers is inside it.

"Parent", "child" and "top-level" refer to `composed-of` relationships. For rules 1–3 and 6, a parent of kind
`enterprise-boundary`, `deployment-node` or `hidden` does not count: the tool uses the nearest ancestor of
another kind. A node with no such ancestor is top-level. The kind of a parent is its kind after all the rules.

## Nesting

The C4 levels are, from the top: software system, container, component. A mapped node can be at the level of its
parent or above it, for example a `service` inside a `service`. `nesting` sets what the tool does.

| `nesting` | The node shows as |
| --- | --- |
| `demote` | One level below its parent. A software system inside a software system is a container. A container inside a container is a component. Below a component, the tool reports a conflict |
| `strict` | Its mapped kind. The tool reports a conflict |

### Conflicts

A tool reports these conflicts. It can also show the architecture.

| Conflict | Example |
| --- | --- |
| A person inside a software system, container or component | An `actor` in the `composed-of` of a `system` |
| A component with no container above it | A component at the top level, or directly inside a software system |
| A software system, container or component inside a component | A `service` inside a `service` inside a `service` |
| With `strict`, a mapped node at the level of its parent or above it | A `service` inside a `service` |

## External rules

C4 has two meanings of external. These rules keep them apart.

| Rule | A node is external when | How a tool shows it |
| --- | --- | --- |
| E1. Outside the system in scope | It is a software system other than the one the diagram is about. This is the C4 convention | Outside the boundary of the system in scope |
| E2. Outside the enterprise | The architecture has a node of kind `enterprise-boundary` (`ecosystem` in the default mapping), and the node is not inside one through `composed-of`. With no such node, this rule does not apply | Outside the enterprise boundary, in grey |
| E3. Owned by another team | Its `details.detailed-architecture` is a CALM Hub architecture in a namespace that is not this architecture's namespace or below it | As a software system outside the boundary of the system in scope, also when it is nested inside that system. The tool does not expand it in place |
| E4. Mapped external | Its type has `external: true` in the mapping | As E2 |

A node is external when any rule applies. No rule makes a node internal again.

E3 applies only when the tool knows the CALM Hub namespace of the architecture, and only to CALM Hub URLs. Other
references wait for [finos/calm-schema#27](https://github.com/finos/calm-schema/issues/27).

## Examples

See [`examples/`](examples/).
