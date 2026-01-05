# System Requirements Specification (SRS)
## Pakistan Army Green Book (PAGB) Landing Website

---

## 1. Introduction

### 1.1 Purpose

This SRS describes the functional and non‑functional requirements of the Pakistan Army Green Book (PAGB) Landing Website. It is intended for:

- PAGB editorial leadership and GHQ stakeholders.
- The development and QA teams implementing and maintaining the system.
- Information security and NOC reviewers assessing compliance and risk.

### 1.2 System Overview

The PAGB Landing Website:

- Hosts the **public web presence** of the Pakistan Army Green Book.
- Presents authoritative information about PAGB volumes, themes, editorial board, and journal policies.
- Provides **static download links** to officially released PAGB PDFs (volumes, issues, or selected articles).
- Is implemented as a publicly accessible, primarily static website using Next.js and deployed to a hardened hosting environment.

No user accounts, editorial workflows, or online manuscript submission functions are provided by this landing website.

### 1.3 Definitions and Acronyms

- **PAGB** – Pakistan Army Green Book.
- **GHQ** – General Headquarters, Rawalpindi.
- **IGT&E** – Inspector General Training & Evaluation.
- **NOC** – No Objection Certificate for deployment from security authorities.

---

## 2. Overall Description

### 2.1 Product Perspective

The landing website complements existing **print and internal editorial processes** by offering an official public window into PAGB content. Specifically, it:

- Integrates public-facing journal pages (Home, About, Current Issue, Archives, Policies, Contact) into a single, cohesive site.
- Aligns with existing PAGB policies stored in `PAGB_POLICIES.md`, surfaced as static or semi-static content pages.
- Does **not** implement or expose any internal editorial workflows, databases, or user account management.

### 2.2 User Classes

| User Class                         | Description                                                                 |
|------------------------------------|-----------------------------------------------------------------------------|
| **Public Visitor**                 | Any external user browsing PAGB information and downloading approved PDFs. |
| **PAGB Secretariat / Directorate** | Internal stakeholders responsible for approving content and future updates. |
| **Information Security / NOC Cell**| Security reviewers assessing the site for NOC clearance.                   |
| **Hosting / IT Operations**        | Personnel who deploy and operate the landing website infrastructure.       |

Only **Public Visitors** directly interact with the website user interface. Other classes interact with the system through content management and deployment processes outside the scope of this SRS.

### 2.3 User Environment

- Users access the landing website via **modern web browsers** (Chrome, Edge, Firefox) over HTTPS.
- The site is deployed inside Pakistan Army / GHQ infrastructure or another controlled, approved hosting environment.
- There is **no database server** exposed or required for runtime behaviour; the site serves static pages and assets.

---

## 3. System Architecture Overview

- **Presentation Layer**: Next.js/React front-end pages under `src/app` built as static or pre-rendered pages.
- **Static Asset Layer**: PDF files and images stored in secure directories or buckets accessible to the web server.
- **Delivery Layer**: A hardened web server or static hosting platform serving pages and assets over HTTPS.

The runtime system does not rely on an application database or authenticated APIs. Any build-time content processing (e.g., reading policy markdown files) happens during deployment and is not exposed to end users.

---

## 4. Technology Stack and Constraints

### 4.1 Technology Stack

| Layer         | Technology                                                                     |
|--------------|---------------------------------------------------------------------------------|
| Frontend     | React, Next.js (App Router) for statically generated pages.                     |
| Build Tools  | Node.js-based toolchain used at build time only (not exposed to end users).     |
| Styling      | Tailwind CSS and custom CSS via `globals.css`.                                  |
| Assets       | Static PDFs and images hosted on a secure web server or storage service.        |

### 4.2 Constraints

- Must operate within **restricted military networks** or another approved, controlled environment.
- Must be served **exclusively over HTTPS** with GHQ‑approved TLS configuration.
- Must not rely on runtime access to internal databases or application APIs from the public internet.
- All publicly visible content must be cleared for public release by PAGB Secretariat.

---

## 5. Public Access Model

- All content on the PAGB Landing Website is **publicly readable**; there are no login-protected areas.
- The site does not expose any functionality for creating, editing, or deleting content at runtime.
- Content updates are applied through controlled deployment processes managed by PAGB Secretariat and IT teams.

---

## 6. Functional Requirements

### 6.1 Public Journal Browsing

**FR-01** Home Page Content
- The system shall display PAGB branding, hero imagery, and a concise description of the Green Book’s purpose.
- The home page shall provide prominent links to the Current Issue, Archives, About, and Journal Policies sections.

**FR-02** Current Issue View
- The system shall provide a Current Issue page summarising the latest volume/issue (title, year, theme, brief description).
- The page shall list official PDF links associated with the current issue, where provided by PAGB Secretariat.

**FR-03** Archives
- The system shall provide an Archives view listing previous PAGB issues and/or selected articles by year or volume.
- The page shall allow visitors to quickly identify and download the PDF corresponding to a given year/volume.

**FR-04** Policies and Static Pages
- The system shall present journal policies (scope & aims, ethics, submission guidelines, etc.) in a structured, readable format.
- The site shall also provide static pages such as About PAGB, Contact/Secretariat details, Terms of Use, Privacy, and Accessibility.

**FR-05** Author & Editorial Information (Read-only)
- The system shall provide high-level, static information about the editorial board and contributor expectations.
- The site shall not provide any online forms or workflows for submitting or reviewing manuscripts; such processes occur off-platform.

### 6.2 Navigation and Usability

**FR-06** Global Navigation
- The system shall provide a consistent top navigation bar across all pages with clear labels (e.g., Home, About, Current Issue, Archives, Policies, Contact).

**FR-07** Responsive Layout
- The site shall render acceptably on screens ranging from mobile phones to desktop monitors, with navigation and content remaining readable.

**FR-08** Discoverability of PDFs
- Each page that references PAGB issues or articles shall provide clear download links or buttons where a public PDF is available.

---

## 7. Non‑Functional Requirements

### 7.1 Security Requirements

**NFR-S-01 Transport Security**
- The site shall be served exclusively over HTTPS with valid, GHQ-approved certificates.

**NFR-S-02 Content Integrity**
- Only authorised PAGB Secretariat or designated personnel shall be able to update the deployed site content through controlled release processes.

**NFR-S-03 Minimal Attack Surface**
- The site shall not expose login forms, submission forms, or authenticated APIs to the public internet.

**NFR-S-04 Basic Hardening**
- Standard security headers (e.g., `X-Frame-Options`, `X-Content-Type-Options`) shall be configured at the web server or reverse proxy level.

### 7.2 Performance Requirements

- The system shall render public pages within **2 seconds** under normal conditions on standard client hardware and nominal network conditions.

### 7.3 Availability Requirements

- Scheduled maintenance windows shall be coordinated with GHQ / PAGB Secretariat.
- Outside maintenance, the landing website should aim for **99%+ availability** within the hosting environment.

### 7.4 Usability Requirements

- UI shall be responsive from mobile to desktop resolutions.
- Navigation shall remain consistent with clear labelling for military and non-technical users.

### 7.5 Compliance and Data Protection

- Only unclassified or appropriately cleared content shall be hosted on the landing website.
- Personal contact data for editorial staff, if displayed, shall be strictly limited to what is approved for public release.

---

## 8. Assumptions and Dependencies

- GHQ or the designated hosting provider supplies secure hosting, network segmentation, TLS termination, and OS‑level hardening.
- No runtime database is required; only static file storage and web serving capabilities are needed.
- End users use supported modern browsers; legacy browser compatibility is not a requirement.

---

## 9. Future Enhancements (Informational)

These are not in the current SRS but identified as potential future work for the landing website:

- Lightweight, anonymous analytics for aggregate traffic and download statistics (subject to policy approval).
- Optional integration with separate systems for online submission or peer review, linked from but not hosted on the landing site.
- Additional language support or alternate themes for special PAGB editions.
