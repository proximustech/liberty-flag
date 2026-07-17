# 🚩 Liberty Flag

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/Platform-Liberty%20Platform-blue)](https://github.com/proximustech/liberty-platform)
[![TypeScript](https://img.shields.io/badge/TypeScript-60.5%25-3178c6)](https://www.typescriptlang.org/)
[![HTML](https://img.shields.io/badge/HTML-39.5%25-e34c26)](https://developer.mozilla.org/en-US/docs/Web/HTML)

> **Everything teams expect from modern feature flag software, but better.**

**Liberty Flag** is an open-source, enterprise-grade feature flag platform designed to centralize targeting, rollouts, experimentation, governance, and observability. It empowers engineering and product teams to ship faster, safer, and with lower risk by decoupling feature releases from code deployments.

Liberty Flag is designed to run seamlessly inside the [Liberty Platform](https://github.com/proximustech/liberty-platform).

---

## 🌟 Key Capabilities

### 🛡️ Feature Control & Release Safety
- **Feature Flag Management**: Create boolean, multivariate, and JSON flags with clear ownership, tags, and naming standards.
- **Advanced Targeting Rules**: Target users by attributes, segments, geography, tenant, plan, or custom context properties.
- **Progressive Rollouts**: Roll out changes gradually by percentage using canary and ring strategies to minimize blast radius.
- **Instant Off Switch**: Disable risky behavior in seconds without redeploying applications or rolling back binaries.
- **Experiments & A/B Testing**: Run controlled experiments and compare variants with measurable business or technical outcomes.
- **Change Workflows**: Enforce approval flows and peer review for sensitive production changes via the Liberty Flag API integrating with Azure DevOps, GitLab, etc.).

### 🔄 Lifecycle Management
- **Create**: Define purpose, owner, type, and rollout plan at creation time.
- **Rollout**: Release by stages (internal, canary, cohort, full exposure) with built-in guardrails.

### 🌍 Environments & Release Orchestration
- **Multi-Environment Controls**: Separate development, staging, and production behavior with environment-specific defaults.
- **Dependency-Aware Rollouts**: Coordinate flag changes with deployments and apply order/dependencies when multiple services must change together. This can be done integrating with tools like Azure Devops or GitLab
- **Migration Support**: Safely migrate databases, APIs, and UI behavior over time using flags as guardrails.

### ⚡ SDKs & APIs
- **Client/Server-Side SDKs**: Low-latency evaluations for backend services with local caching and resilient fallback values.
- **Management API**: Automate creation and updates, trough the API using tools like Azure Devops or GitLab

### 🔐 Security & Governance (only in the premium version)
- **Role-Based Access Control (RBAC)**: Use the Liberty platform default permissions schema by Projects/Buckets and Flags Modules.


### 🔗 Integrations
Seamlessly connect with your existing toolchain:
- CI/CD systems and deployment pipelines
- Source control and pull request workflows
- Identity providers and access platforms

---

## 🏗️ Architecture

Liberty Flag is built for scale and reliability, structured around three core components:

1. **Control Plane**: The UI and API for managing flags, environments, and governance operations.
2. **Evaluation Engine**: A deterministic rules engine for fast, consistent flag decisions across all SDKs.
3. **Distribution Layer**: A robust streaming and caching strategy to propagate updates reliably at scale.

---

## 🎯 Typical Use Cases

- **Progressive Delivery**: Canary releases and staged rollouts to reduce deployment risk.
- **Targeted Launches**: Feature launches restricted to specific customer segments or plan tiers.
- **Emergency Response**: Instant off-switch for unstable features in production.
- **Safe Migrations**: Gradual migration of infrastructure, databases, and APIs.
- **Experimentation**: Data-driven decisions for pricing, UX, and AI-powered capability rollouts.

---

## 🚀 Getting Started

### Prerequisites
Liberty Flag runs inside the **Liberty Platform**. Ensure you have the Liberty Platform installed and running in your environment.
- [Liberty Platform Repository](https://github.com/proximustech/liberty-platform)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/proximustech/liberty-flag.git
   cd liberty-flag