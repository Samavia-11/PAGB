# Security Controls
## Pakistan Army Green Book (PAGB) Landing Website

---

## 1. Introduction

This document describes the security controls implemented for the PAGB Landing Website, including **technical safeguards, process considerations, and alignment with military security expectations**. It is intended for information security teams, NOC reviewers, and system owners.

The landing website follows a **defence-in-depth** approach appropriate for a static public site across:

- Transport and hosting security
- Content governance and change control
- Minimal attack surface (no logins, no online submissions)
- Logging, monitoring, and incident response support

---

## 2. Security Architecture Overview

```mermaid
flowchart TD
  User[User Browser] -->|HTTPS| Site[Static Next.js Pages]
  Site --> Assets[Static Assets
  (PAGB PDFs, Images)]
```

- The site is served as static pages and assets over HTTPS.
- Security controls focus on secure transport, hardened hosting, and careful content governance rather than runtime authentication.

---

## 3. Authentication & Session Management

- The PAGB Landing Website does **not** provide login, authentication, or user sessions for public visitors.
- Any authentication for administrators or content managers occurs outside the public site (e.g., on infrastructure management tools) and is handled by GHQ / hosting operations.

---

## 4. Authorization & Access Control

- No application-level RBAC is required for public visitors because only read-only content is exposed.
- Access control is enforced at the **infrastructure** level:
  - Only authorised operations staff may deploy or roll back site releases.
  - Only authorised PAGB Secretariat personnel may approve content changes.

---

## 5. Content Integrity & Output Safety

- All text and media on the landing site are curated and approved by PAGB Secretariat prior to deployment.
- There are **no public input forms**, which greatly reduces the risk of injection and XSS.
- Markdown-based content (e.g., policies) is reviewed and rendered in a controlled fashion during build.

---

## 6. CSRF and Request Protections

- The landing website exposes only static, read-only pages and assets and does not rely on state-changing HTTP requests.
- As a result, CSRF protections for application actions are not required on the public site; however, any management consoles or back-end tooling used by operations should employ strong CSRF protections as per organisational standards.

---

## 7. Abuse Prevention

- Static content can be fronted by an enterprise web application firewall (WAF) or reverse proxy to detect and block abusive patterns.
- Basic connection and bandwidth limits can be configured at the web server or network level.

---

## 8. Transport & Data Protection

### 8.1 Transport Security

- The site is intended to be served **exclusively over HTTPS**.
- TLS termination is handled by GHQ-approved reverse proxy or load balancer.
- HSTS and modern cipher suites should be enforced at the proxy layer in accordance with policy.

### 8.2 Data at Rest

- The primary data at rest comprises static HTML, CSS, JS, images, and PAGB PDFs.
- These are stored in secure storage within a GHQ-controlled or otherwise approved environment.
- Access to storage and deployment mechanisms is restricted to authorised operations staff.

---

## 9. Logging, Monitoring, and Audit Trails

### 9.1 Web Server Logging

- Access logs and error logs for the landing website should be enabled on the hosting platform.
- Logs should capture timestamps, requested URLs, HTTP response codes, and source IPs.

### 9.2 Change & Release History

- Each deployment of the static site should be recorded (version/tag, date, and approver).
- Release records form the audit trail for content and configuration changes.

### 9.3 Monitoring

- Integration with central logging / SIEM (e.g., via syslog or agent) is recommended for:
  - Unusual spikes in traffic.
  - Repeated errors (e.g., 5xx responses).
  - Indicators of scanning or abuse.

---

## 10. Backup, Recovery, and Business Continuity

### 10.1 Site & Asset Backups

- Regular backups of the static site build artifacts and PAGB PDFs should be scheduled and validated.
- Backups stored in secure, access-controlled locations.

### 10.2 Recovery Procedures

- Restore procedures should be tested to ensure that the static site and assets can be restored to a known-good state.
- Recovery runbooks should define RPO (Recovery Point Objective) and RTO (Recovery Time Objective) targets consistent with PAGB expectations.

---

## 11. Server & Infrastructure Hardening

Although outside the application code itself, the following measures are recommended and assumed for NOC clearance:

- Hardened OS images with:
  - Minimal services.
  - Regular patching and security updates.
- Network segmentation isolating web tier from management and other internal networks.
- Strict firewall rules permitting only necessary ports and IP ranges.
- Centralised authentication and authorisation for administrative access.
- Anti-malware and integrity monitoring tools where mandated.

---

## 12. Compliance Considerations

The landing site design supports compliance with **general military web application security expectations** and can be mapped to common control frameworks by ensuring:

- Clear separation between public information delivery and internal editorial or administrative systems.
- Least privilege access for operations and content change approval.
- Auditability of releases and major content changes.
- Protection against common web attack categories relevant to static sites (XSS via content, clickjacking, misconfiguration).

A dedicated security assessment and penetration test should be conducted before production deployment, with findings feeding into remediation and NOC documentation.

---

## 13. Summary

The PAGB Landing Website incorporates a layered set of security controls appropriate for a static public site and relies on **secure deployment practices** (HTTPS, network control, backup/restore, OS hardening, change management) to provide a robust security posture suitable for military use and NOC clearance.
