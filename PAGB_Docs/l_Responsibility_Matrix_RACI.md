# Responsibility Matrix (RACI)
## Pakistan Army Green Book (PAGB) Landing Website

---

## 1. Introduction

This document defines **roles and responsibilities** for the planning, implementation, operation, and governance of the PAGB Landing Website using a **RACI matrix**:

- **R – Responsible**: Performs the work to complete the task.
- **A – Accountable**: Ultimately answerable for the correct and thorough completion of the task.
- **C – Consulted**: Provides input and expertise; two-way communication.
- **I – Informed**: Kept up to date on progress or decisions; one-way communication.

---

## 2. Stakeholder Roles

| Role ID | Role / Stakeholder                              | Description                                                                                 |
|---------|-------------------------------------------------|---------------------------------------------------------------------------------------------|
| GHQ     | Patron / Patron-in-Chief (GHQ)                  | Senior leadership oversight, final strategic accountability.                               |
| PAGB    | PAGB Secretariat / Concerned Directorate        | Accountable for PAGB content, messaging, and future updates on the landing website.       |
| INO     | Inotech Solutions Pvt Ltd                       | Responsible for design, development, and initial deployment of the PAGB landing website.  |
| SEC     | Information Security / NOC Cell                 | Conducts security review and NOC clearance process.                                        |
| OPS     | Hosting / IT Operations (Army IT / Data Centre) | Operates, monitors, and maintains the hosting platform and deployed landing website.      |

---

## 3. RACI Matrix – Landing Website Lifecycle

### 3.1 Planning & Requirements

| Activity                                             | GHQ | PAGB | INO | SEC | OPS |
|------------------------------------------------------|-----|------|-----|-----|-----|
| Define project vision and strategic objectives       | A   | R    | C   | C   | I   |
| Define content scope and publishing policy           | I   | A/R  | C   | I   | I   |
| Define security and compliance requirements          | I   | C    | C   | A/R | C   |

### 3.2 Design & Development

| Activity                                             | GHQ | PAGB | INO | SEC | OPS |
|------------------------------------------------------|-----|------|-----|-----|-----|
| Information architecture and UX design               | I   | A/R  | R   | C   | I   |
| Visual design and branding alignment                 | I   | A/R  | R   | I   | I   |
| Implement static pages, navigation, and assets       | I   | C    | A/R | I   | I   |
| Functional and usability testing of public pages     | I   | C    | R   | I   | C   |
| Security review of design and implementation         | I   | C    | C   | A/R | C   |

> **Note:** Within design and development activities, **Inotech Solutions Pvt Ltd (INO) is Responsible and sometimes Accountable** for implementing the landing website in accordance with requirements approved by PAGB and GHQ.

### 3.3 Deployment

| Activity                                             | GHQ | PAGB | INO | SEC | OPS |
|------------------------------------------------------|-----|------|-----|-----|-----|
| Prepare hosting environment configuration            | I   | C    | C   | C   | A/R |
| Deploy landing website to production                 | I   | I    | A/R | C   | R   |
| Support NOC submission with technical documentation  | I   | C    | R   | A/R | C   |

After successful initial deployment, **Inotech’s direct responsibilities end** except where specifically re-engaged under a new contract or change request.

### 3.4 Operations, Maintenance, and Content Management

| Activity                                             | GHQ | PAGB | INO | SEC | OPS |
|------------------------------------------------------|-----|------|-----|-----|-----|
| Day-to-day operation and monitoring of the website   | I   | C    | I   | I   | A/R |
| Apply OS / platform patches and security updates     | I   | I    | I   | C   | A/R |
| Content updates (text, images, PDFs)                 | I   | A/R  | I   | I   | C   |
| Periodic review of content accuracy and relevance    | I   | A/R  | I   | I   | C   |
| Incident response and problem management             | I   | C    | I   | A/R | R   |

> **Important:** For Operations, Maintenance, Monitoring, and Content Updates:
>
> - **PAGB Secretariat / Directorate (PAGB)** is **Accountable** for content and future updates.
> - **OPS** (Hosting / IT Operations) is **Responsible and Accountable** for day‑to‑day technical operation.
> - **Inotech Solutions Pvt Ltd (INO) is not Responsible or Accountable** for these activities and is at most *Consulted* or *Informed* if separately engaged.

---

## 4. Narrative Summary

- **GHQ** is ultimately accountable for the existence and strategic direction of the PAGB Landing Website.
- **PAGB Secretariat / Concerned Directorate** is **Accountable** for all web content, messaging, and future updates; it owns the site from a business and editorial perspective once deployed.
- **Inotech Solutions Pvt Ltd** is **Responsible** (and, where delegated, Accountable) for **design, development, and initial deployment only**. It has **no ongoing responsibility** for monitoring, maintenance, or operations after go‑live, unless separately contracted.
- **Information Security / NOC Cell** is accountable for security assessment, recommendations, and clearance decisions prior to and, where required, after deployment.
- **Hosting / IT Operations** is responsible and accountable for day-to-day technical operation, patching, backups, monitoring, and incident handling in the approved hosting environment.

This RACI matrix should be revisited whenever there are changes in organisational structure, hosting arrangements, or contractual responsibilities, especially if Inotech is re-engaged for future enhancements.
