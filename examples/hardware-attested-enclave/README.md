# Hardware-Attested Execution Environment for Agentic Financial Workflows

**Document Identifier**: `FINOS-CALM-SPEC-2026-01`  
**Working Group**: FINOS Common Architecture Language Model (CALM) / Open Source AI in Finance  
**Classification**: Reference Architecture Model (CALM v1.0 / v1.2)  
**Author**: Corrente Applied Cryptography Group (`standards@correntelabs.com`), Corrente Labs, Inc.  
**License**: Apache-2.0  

---

## Executive Summary

Following the publication of the Linux Foundation & FINOS research report *AI and Open Source in Financial Services* (August/September 2026), regulated financial institutions have recognized an acute architectural paradox: while 78% of institutions are actively accelerating autonomous AI agent adoption, the lack of hardware isolation boundaries and transaction-level micro-metering creates unmanageable exposure to:

1. **The "Token Panic"**: Runaway autonomous execution loops incurring unbounded API and treasury liabilities.
2. **Host & Hypervisor Compromise**: Multi-tenant cloud hypervisors snooping on model weights, customer telemetry, and treasury keys.
3. **Un-Auditable State Drift**: Absence of non-repudiable silicon proofs linking financial transactions to verified model states.

This reference architecture models an isolated, hardware-attested execution boundary for autonomous AI agents executing financial clearing and transaction workloads, equipped with **RFC 9110 HTTP 402 micro-metering** and **IETF SCITT transparency ledger audit receipts**.

---

## Architecture Topology

```
┌────────────────────────────────────────────────────────────────────────┐
│                   COMMODITY MULTI-TENANT HOST                          │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │          HARDWARE-ENFORCED SILICON TRUST DOMAIN                │   │
│   │          (Intel TDX RTMRs / AMD SEV-SNP VMPCKs)                │   │
│   │                                                                │   │
│   │   ┌──────────────────────────┐    ┌────────────────────────┐   │   │
│   │   │ Autonomous Financial     │───►│ Deterministic Spend    │   │   │
│   │   │ Execution Agent          │IPC │ Guard (RFC 9110 x402)  │   │   │
│   │   └──────────────────────────┘    └───────────┬────────────┘   │   │
│   └───────────────────────────────────────────────┼────────────────┘   │
└───────────────────────────────────────────────────┼────────────────────┘
                                                    │
                      ┌─────────────────────────────┴────────────────────────────┐
                      ▼                                                          ▼
       ┌───────────────────────────────┐                          ┌──────────────────────────────┐
       │   SCITT L1 Verifiable Ledger  │                          │  Universal Settlement Rails  │
       │   (x402ev/1 Transparency)     │                          │  (Atomic DvP Clearing)       │
       └──────────────┬────────────────┘                          └──────────────────────────────┘
                      ▲
                      │ Verifies
       ┌──────────────┴────────────────┐
       │ Regulatory & Internal Auditor │
       └───────────────────────────────┘
```

---

## Key Model Nodes

| Node ID | Type | Description |
|---|---|---|
| `untrusted-cloud-host` | `system` | Commodity virtualization host treated as zero-trust. |
| `hardware-enclave-boundary` | `system` | Isolated confidential VM enforced by silicon memory encryption. |
| `autonomous-financial-agent` | `service` | Autonomous AI agent executing trading, rebalancing, or loan risk workflows. |
| `spend-allowance-guard` | `service` | In-enclave policy engine enforcing single-task and cumulative process spend limits. |
| `transparency-notary` | `service` | IETF SCITT append-only ledger recording signed audit receipts (`x402ev/1`). |
| `clearing-and-settlement-rail` | `service` | Multi-rail atomic payment settlement layer (EVM, XRPL, Algorand). |
| `compliance-auditor` | `actor` | External regulatory or internal risk officer inspecting cryptographic proofs. |

---

## Conformance & Schema Validation

This model conforms to the CALM core specification (`schema/core.json`). To validate:

```bash
node -e '
  import Ajv2020 from "ajv/dist/2020.js";
  import addFormats from "ajv-formats";
  import fs from "fs";

  const ajv = new Ajv2020({ strict: false });
  addFormats(ajv);

  const core = JSON.parse(fs.readFileSync("schema/core.json", "utf8"));
  const model = JSON.parse(fs.readFileSync("examples/hardware-attested-enclave/architecture.calm.json", "utf8"));

  const validate = ajv.compile(core);
  const valid = validate(model);
  if (!valid) {
    console.error(validate.errors);
    process.exit(1);
  }
  console.log("CALM Architecture Model conforms to FINOS schema!");
'
```
