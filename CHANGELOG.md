# Changelog

## 1.1

CALM v1.1 is a minor revision of 1.0, fixing the definition of flows.

### Flows

The schema for business flows has been revised to correct an error in the 1.0 definition.

Whilst not strictly backwards compatible, the changes are minor and should be straightforward to implement.

Specific changes are:

* Flows may not have any additional properties beyond those defined in the schema.
  * Users may make use of metadata for extensibility.
* Flow transitions MUST contain `relationship-unique-id`, `sequence-number`, and `description` properties.
  * This requirement was incorrectly coded in the 1.0 schema.

## 1.0

CALM v1.0 is the first stable, production-ready version of the Common Architecture Language Model, based on community agreement of the v1.0-rc2 candidate. This release provides a clean, extensible schema for architecture modeling and documentation.

### Core Schema Concepts

**Nodes** - Architecture components (systems, services, databases) with properties, interfaces, and deployments;

**Relationships** - Connections between nodes (`interacts`, `connects`, `deployed-in`, `composed-of`) and how they interact.

**Flows** - Business flows with transitions that reference relationships by sequence number, mapping flows to technical components with control requirements

**Controls** - Security and compliance requirements with domain-based organization; simplified property names (`requirement-url`, `config-url`, `config`) for better readability

**Interfaces** - Modular interface definitions using external schemas (`interface-definition`) or flexible interface types (`interface-type`);

**Metadata** - Flexible metadata support accepting either single objects or arrays, providing extensible annotation capabilities across all schema elements

## 1.0-rc2

This document outlines the changes included in the CALM Schema v1.0-rc2 release candidate.

### Overview

CALM v1.0-rc2 introduces several important schema refinements and simplifications based on community feedback and implementation experience from v1.0-rc1. This release candidate focuses on streamlining the schema structure while maintaining backward compatibility where possible.

### Major Changes

#### 1. Interface Schema Simplification (Breaking Change)

**What Changed:** The interface schema has been significantly simplified with property name changes and removal of built-in interface types.

**Property Name Changes:**
- `interface-definition-url` → `definition-url`
- `configuration` → `config`

**Removed Built-in Interface Types:**
The following built-in interface types have been removed from the schema:
- `host-port-interface`
- `hostname-interface` 
- `path-interface`
- `url-interface`
- `oauth2-audience-interface`
- `rate-limit-interface`
- `container-image-interface`
- `port-interface`
- `node-interface`

**Benefits:**
- Cleaner, more consistent property naming
- Reduced schema complexity by focusing on the modular interface approach
- Encourages use of external interface definitions for better extensibility

**Migration Impact:** Organizations using built-in interface types will need to migrate to custom interface definitions using the `interface-definition` approach.

#### 2. Control Schema Property Renaming (Breaking Change)

**What Changed:** Control schema properties have been renamed for consistency and clarity.

**Property Name Changes:**
- `control-requirement-url` → `requirement-url`
- `control-config-url` → `config-url`
- `control-config` → `config`

**Benefits:**
- Shorter, cleaner property names
- Consistent naming pattern across the schema
- Improved readability and reduced verbosity

**Migration Impact:** Existing control configurations will need to update property names.

#### 3. Core Schema Refinements (Breaking Change)

**What Changed:** Several properties have been removed or simplified in the core schema. Several properties are now explicitly required.

**Removed Properties:**
- `data-classification` enum and property removed from relationships
- `metadata` removed from decision definition
- `run-as` property removed from node definitions

**Interface Reference Changes:**
- Node interface references changed from complex `node-interface` objects to simple strings
- Standardised interface referencing mechanism

**Newly Required Properties:**
- The `detailed-architecture` property of `node/details` is required rather than optional, if `node/details` is provided. It was previously permitted to provide completely empty `details`.
- The `deployed-in` relationship type now requires properties `container` and `nodes`. It was previously permitted to provide completely empty `deployed-in` details.

**Benefits:**
- Reduced schema complexity
- Cleaner node and relationship definitions

#### 4. Schema URL Updates

**What Changed:** All schema references have been updated from `1.0-rc1` to `1.0-rc2`.

**Updated References:**
- All `$schema` and `$ref` URLs now point to `https://calm.finos.org/release/1.0-rc2/meta/`
- Prototype examples updated with new schema references
- Control requirement examples updated

#### 5. Metadata Flexibility (Non‑Breaking Change)
**What Changed:**  
The `metadata` property now accepts **either** a single object **or** an array of objects, rather than only an array.


### Prototype Examples

All existing prototype examples have been updated to use the new v1.0-rc2 schema references:

#### Updated Examples
- `adr-example.json` - Architecture Decision Records integration
- `authentication-as-control.json` - Authentication modeled as controls
- `custom-interface-example.json` - Custom interface definitions
- `custom-node-type-example.json` - User extensible node types
- `example-inline-config.json` - Inline control configurations
- `example-mixed-config.json` - Mixed inline and URL-based configurations
- `throughput-control-prototype.json` - Performance control requirements
- `meta-example.json` - Object based metadata

### Migration Guide

#### From v1.0-rc1 to v1.0-rc2

1. **Update Schema References:**
   - Change all `1.0-rc1` URLs to `1.0-rc2` in `$schema` and `$ref` properties

2. **Update Interface Definitions:**
   - Replace `interface-definition-url` with `definition-url`
   - Replace `configuration` with `config`
   - Migrate built-in interface types to custom interface definitions

3. **Update Control Configurations:**
   - Replace `control-requirement-url` with `requirement-url`
   - Replace `control-config-url` with `config-url`
   - Replace `control-config` with `config`

4. **Review Data Classification Usage:**
   - Remove `data-classification` properties from relationships if present
   - Consider alternative approaches for data classification requirements

5. **Simplify Interface References:**
   - Update node interface references to use simple string identifiers

6. **Metadata Format Flexibility:**
 - You can now use **either** an object or an array for any `metadata` field
 - No changes are required for existing array‑based metadata

### Compatibility Notes

- **Breaking Changes:** This release contains breaking changes that require migration from v1.0-rc1
- **Schema Validation:** Existing v1.0-rc1 documents will not validate against v1.0-rc2 schemas without updates
- **Tooling Impact:** Tools and implementations using v1.0-rc1 will need updates to support v1.0-rc2

### Next Steps

CALM v1.0-rc2 represents continued progress toward a stable v1.0 release. Community feedback on these changes is encouraged to ensure the final v1.0 schema meets the needs of the architecture modeling community.

For questions or feedback, please engage with the CALM community through the appropriate channels.
## 1.0-rc1

This document outlines the changes included in the CALM Schema v1.0-rc1 release candidate.

### Overview

CALM v1.0-rc1 introduces several important enhancements that improve extensibility and flexibility while maintaining backward compatibility with existing schemas. This release candidate consolidates changes from multiple draft proposals and represents a significant step toward a stable v1.0 release.

### Major Changes

#### 1. User Extensible Node Types (Issue #1232)

**What Changed:** The `node-type-definition` schema has been modified to use a `oneOf` structure that allows both predefined enum values and custom string values.

**Benefits:**
- Organizations can define custom architecture component types without requiring schema updates
- Maintains backward compatibility with existing enum values
- Enables more domain-specific architecture modeling

**Example:** See `custom-node-type-example.json` which demonstrates using both standard enum values and custom node types in the same architecture.

#### 2. Inline Control Configurations (Issue #1233)

**What Changed:** The `control-detail` schema now supports an optional `control-config` property as an alternative to the existing `control-config-url`.

**Benefits:**
- Allows inline specification of control configurations within CALM documents
- Reduces dependency on external files for simple configurations
- Makes CALM documents more self-contained while maintaining the option for external references

**Examples:** 
- `example-inline-config.json` - Shows using inline control configuration
- `example-mixed-config.json` - Demonstrates using both inline and URL-based configurations in the same document

#### 3. Architecture Decision Records Support (Issue #1224)

**What Changed:** Added an optional `adrs` property at the document level to reference external Architecture Decision Records.

**Benefits:**
- Improves traceability between design decisions and architectural models
- Enables linking to existing ADR documentation in various formats and locations
- Enhances the documentation value of CALM models

**Example:** `adr-example.json` shows how to reference ADRs in a CALM document.

#### 4. User Extensible Interfaces (Issue #1083)

**What Changed:** 
- Added a new `interface-definition` schema in interface.json
- Modified the interfaces property in nodes to support both standard interfaces and custom interfaces via a `oneOf` structure

**Benefits:**
- Enables domain-specific interfaces to be defined external to the core schema
- Allows referencing external interface schemas through `interface-definition-url`
- Provides a flexible mechanism for extending CALM with specialized interface types

**Example:** `custom-interface-example.json` demonstrates using custom interface definitions for Kafka topics and gRPC services.

#### 5. Authentication as Control Requirement (Issue #1177)

**What Changed:**
- Removed the `authentication` property from relationships
- Removed the `authentication` enum definition
- Authentication is now modeled as a control requirement

**Benefits:**
- Provides more flexible and comprehensive authentication definition
- Enables detailed configuration of authentication mechanisms
- Improves compliance tracking by treating authentication as a control

**Example:** `authentication-as-control.json` demonstrates how to model authentication as a control requirement instead of a simple property.

### Prototype Examples

#### custom-node-type-example.json

This example demonstrates the user extensible node types feature. It includes:
- A standard node using the "service" type from the predefined enum
- Custom nodes using "microservice" and "gateway" types that aren't in the standard enum
- A relationship connecting these nodes

This example shows how organizations can define their own component types while maintaining compatibility with standard types.

#### example-inline-config.json

This example demonstrates inline control configuration. It includes:
- A data security control with an inline encryption configuration
- An access control requirement using a URL reference

This shows how you can embed configuration directly within a CALM document without requiring separate files.

#### example-mixed-config.json

This example shows both inline and URL-based control configurations in the same document:
- Data security controls with inline configuration
- Access control requirements with both inline and URL-based configurations

This demonstrates the flexibility to choose the most appropriate approach for each control.

#### adr-example.json

This example demonstrates ADR support by:
- Defining an API Gateway architecture
- Including references to external ADR documents that explain key decisions
- Showing how to link to ADRs in different locations (GitHub, internal docs)

This helps maintain traceability between architectural decisions and implementations.

#### custom-interface-example.json

This example demonstrates user extensible interfaces with:
- A Kafka service with a custom Kafka topic interface
- A gRPC service with a custom gRPC interface definition
- Each interface referencing an external schema definition and providing appropriate configuration

This showcases how specialized technologies can be modeled in CALM without core schema changes.

#### authentication-as-control.json

This example demonstrates authentication as a control by:
- Defining a relationship between two systems
- Specifying authentication requirements as a control with a detailed schema
- Showing how authentication properties can be more comprehensively defined

This illustrates the improved approach to modeling authentication in CALM.

### Migration Notes

For users of previous drafts, the migration path is straightforward:

1. **Node Types:** Existing enum values continue to work; custom types are now also supported
2. **Controls:** Existing `control-config-url` references continue to work; inline configurations are now also supported
3. **Authentication:** For backward compatibility, relationships can still include an authentication property, but it's recommended to migrate to using control requirements

### Validation

All schema files in this release have been validated against JSON Schema Draft 2020-12. The prototype examples demonstrate the new features and serve as test cases for implementation.

### Status

This is a Release Candidate (RC) that will undergo a 4-week testing period as defined in the CALM governance process:
1. Weeks 1-2: Initial testing by tool maintainers
2. Weeks 3-4: Community testing and feedback
3. End of Week 4: Decision to promote to final release or create a new RC
