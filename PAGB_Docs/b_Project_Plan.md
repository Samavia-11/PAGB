# PAGB Landing Website – Project Plan

## 1. Project Overview

The Pakistan Army Green Book (PAGB) Landing Website is a secure, public-facing information site for presenting the annual Pakistan Army Green Book journal. It provides:

- **Public journal presence** for officers, scholars, and policy makers to explore PAGB themes, volumes, editorial board, and publication policies.
- **Centralised access to official PDFs** of PAGB volumes and selected articles hosted on secure static storage.
- **Security and governance controls** suitable for deployment within a Pakistan Army / GHQ-controlled environment for a public-facing site.

The site is implemented as a primarily **static Next.js front-end** with pre-rendered pages and links to PDF assets. There is **no application database or user account system** in scope for this landing website.

## 2. Scope

### 2.1 In Scope

- **Public Landing Website**
  - Home, About PAGB, Current Issue, Archives, Journal Policies, Contact/Secretariat details, Terms, Privacy, Accessibility.
  - Public browsing and download links for officially released PAGB PDFs (volumes, issues, or selected articles), sourced from static storage.
- **Information Architecture & UX**
  - Clear navigation structure, consistent branding, mobile-responsive layout, and accessibility-conscious design.
- **Content Presentation**
  - Structured presentation of PAGB themes, editorial board snapshot, citation/ISSN information, and calls for papers or submissions (where applicable), without collecting submissions on the site.
- **Hosting & Deployment of Static Assets**
  - Build and deployment pipeline for static pages and assets into a GHQ-controlled or otherwise approved hosting environment.
- **Basic Security & NOC Readiness**
  - HTTPS-only access, hardened hosting environment, and static-site hardening (security headers, minimal attack surface) appropriate for a public landing website.

### 2.2 Out of Scope

- General‑purpose learning management, HR, or personnel systems.
- Non‑PAGB publications and non‑journal content management.
- Public user accounts, authentication, and role-based dashboards (authors, reviewers, editors, administrators).
- Online manuscript submission, editorial workflows, or peer review processing.
- In-app messaging, notifications, or data-heavy analytics; any such workflows remain off-platform.
- Full digital rights management (DRM); the site will provide secure but straightforward download links for approved PDFs.

## 3. Stakeholders

| Stakeholder                                   | Role / Interest                                                                 |
|----------------------------------------------|-------------------------------------------------------------------------------|
| **Patron / Patron-in-Chief (GHQ)**           | Strategic oversight, reputational risk, and compliance.                       |
| **IGT&E, GHQ**                               | Owner of PAGB publication; accountable for content, messaging, and policy.    |
| **PAGB Secretariat / Concerned Directorate** | Maintains PAGB content, approves updates, and coordinates future releases.    |
| **Information Security Cell**               | Reviews and approves security posture for NOC clearance of the public site.   |
| **Inotech Solutions Pvt Ltd**               | Designs, develops, and initially deploys the PAGB landing website only.       |
| **Hosting / IT Operations Team**            | Operates the hosting platform and underlying infrastructure post-deployment.  |
| **Public Visitors / Readers**               | Consume PAGB information and download approved PDFs through the landing site. |

## 4. Objectives and Success Criteria

- **O1 – Digital PAGB presence**: Provide a modern, mobile‑friendly landing website for communicating PAGB themes, issues, and policies.
- **O2 – Authoritative information source**: Ensure that all publicly visible PAGB information (volumes, themes, editorial board, policies) is accurate, current, and consistent with approved print editions.
- **O3 – Security & NOC Compliance**: Implement controls that meet Pakistan Army security policies for public-facing web sites, with no unnecessary attack surface (no login, no database).
- **O4 – Ease of maintenance**: Enable PAGB Secretariat and technical teams to update static content and assets with minimal effort via controlled deployment processes.

**Success is measured by:**

- Stable operation in GHQ or approved hosting environment for at least one full PAGB cycle.
- Zero critical security findings during security / NOC review of the public site.
- Published web content that consistently matches approved PAGB print content with no unauthorised modifications.

## 5. Major Deliverables

| ID  | Deliverable                                   | Description                                                                                     |
|-----|-----------------------------------------------|-------------------------------------------------------------------------------------------------|
| D1  | Public PAGB Landing Website                   | Next.js-based static site with Home, About, Current Issue, Archives, Policies, Contact, etc.   |
| D2  | Information Architecture & UX Design          | Site map, navigation model, wireframes, and visual design system for the landing website.      |
| D3  | Content Templates & Static Pages              | Structured content sections and page templates for PAGB themes, issues, policies, and profiles.|
| D4  | PDF Integration & Asset Library               | Organised structure and links for officially released PAGB PDFs and related static assets.     |
| D5  | Deployment Pipeline & Hosting Configuration   | Build scripts and configuration for deploying static assets to the approved hosting platform.  |
| D6  | Security & Hardening Checklist                | Practical checklist for HTTPS configuration, security headers, and static-site hardening.      |
| D7  | Documentation Set                             | Updated SRS, Design, Prototype, Use Cases, Test Cases, Security Controls, and RACI documents.  |

## 6. Milestones and Timeline

Times are indicative and can be mapped to calendar weeks/quarters in GHQ’s project schedule.

| Phase ID | Phase                                   | Key Activities                                                                                       | Duration |
|----------|-----------------------------------------|------------------------------------------------------------------------------------------------------|----------|
| M1       | Initiation & Content Inventory          | Confirm scope, gather content (text, images, PDFs), and clarify security & compliance expectations. | 2 weeks  |
| M2       | IA & UX Design                          | Develop site map, wireframes, and visual design aligned with PAGB branding.                         | 3 weeks  |
| M3       | Static Site Implementation              | Implement landing pages, navigation, and PDF integration using Next.js.                             | 6 weeks  |
| M4       | Review & UAT                            | Content proofreading, usability checks, cross-browser/device testing with PAGB stakeholders.       | 3 weeks  |
| M5       | Security Review & NOC                   | Static-site security review, remediation, NOC submission and clearance.                             | 3 weeks  |
| M6       | Go-Live & Initial Handover              | Production deployment of the landing website and handover to PAGB Secretariat / IT Operations.      | 2 weeks  |

A typical initial implementation can be delivered in **~18–20 weeks** including buffer for security and NOC cycles.

## 7. Approach and Methodology

- **Iterative development** with short internal sprints and frequent demos of the landing site to PAGB stakeholders.
- **Environment separation**: development, staging/UAT, and production environments for the static site build and hosting.
- **Configuration by environment** via environment variables or configuration files for URLs, asset locations, and environment-specific banners.
- **Static build and deployment pipeline** for Next.js pages and assets; no application database migrations are required.
- **Version control** via Git; branch strategy aligned with GHQ change management policy.

## 8. Dependencies and Assumptions

- Availability of **secure web hosting** (e.g., hardened web server or static hosting platform) within the Army network or an approved environment.
- Availability of **file storage or web server directories** for PAGB PDF assets, secured within the same security domain.
- Defined **classification and release policy** for which PAGB content may be exposed publicly (e.g., unclassified but sensitive).
- GHQ provides **primary domain name**, TLS certificates, and reverse proxy configuration for HTTPS-only access.
- Network environment allows HTTPS traffic between users and the website within applicable security controls (no direct database connectivity is required).

## 9. Risk Assessment

| Risk ID | Description                                                       | Impact | Likelihood | Mitigation                                                                                      |
|---------|-------------------------------------------------------------------|--------|-----------|-------------------------------------------------------------------------------------------------|
| R1      | Security vulnerabilities identified during NOC review.           | High   | Medium    | Apply secure coding practices for the static site, harden hosting, and conduct pre‑NOC testing.|
| R2      | Accidental publication of misclassified or unapproved content.   | High   | Low       | Enforce content approval workflows outside the site, with clear sign-off from PAGB Secretariat.|
| R3      | Performance degradation under peak traffic (launch / campaigns). | Medium | Medium    | Use caching and efficient static asset delivery; tune web server configuration.                 |
| R4      | Key personnel rotation / postings.                               | Medium | High      | Maintain complete documentation, handover checklists, and up-to-date runbooks.                 |
| R5      | Dependency or framework vulnerabilities.                         | Medium | Medium    | Track advisories for Next.js/Node; patch and redeploy as per GHQ change policy.                |
| R6      | Loss or corruption of static site or PDF assets.                 | High   | Low       | Implement regular backups, backup verification, and DR runbooks for static content and assets. |

## 10. Resource Allocation

| Role                     | Responsibility                                                                 | Allocation |
|--------------------------|-------------------------------------------------------------------------------|-----------|
| Project Sponsor (GHQ)    | Approvals, budget, strategic direction.                                       | 0.1 FTE   |
| Product Owner (PAGB)     | Prioritise content, approve UX, validate messaging.                           | 0.3 FTE   |
| Solution Architect       | Landing site architecture, security model, technology decisions.              | 0.2 FTE   |
| Front-end Developer(s)   | Implement static pages, navigation, styling, and PDF integration.             | 1–2 FTE   |
| QA / Test Engineer       | Plan and execute functional and regression tests for public pages.            | 0.5 FTE   |
| Security Analyst         | Threat modelling for public site, security testing, NOC documentation support.| 0.2 FTE   |
| System Administrator     | Deployment, backups, monitoring, incident handling for hosting platform.      | 0.3 FTE   |

## 11. Governance, Communication, and Reporting

- **Weekly project meeting** between IT team and editorial representative.
- **Bi‑weekly status to GHQ/IGT&E** summarizing progress, risks, and upcoming milestones.
- **Formal change control** for production changes, aligned with GHQ change management SOPs.
- **Incident reporting workflow** for security or availability incidents, including escalation paths.
