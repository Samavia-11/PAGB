# Release Notes
## Pakistan Army Green Book (PAGB) Landing Website

---

## 1. Release Overview

- **Product**: Pakistan Army Green Book (PAGB) Landing Website
- **Version**: 1.0.0 – Initial Public Landing Site Release
- **Environment**: Pakistan Army / GHQ-controlled or otherwise approved hosting infrastructure
- **Technology Stack**: Next.js (React, TypeScript), Node.js build toolchain, TailwindCSS, static asset hosting

This initial release delivers a **secure, static public landing website** for the Pakistan Army Green Book, supporting authoritative public information and access to officially released PAGB PDFs.

---

## 2. Summary of Changes

### 2.1 Key Features Included

- Public-facing PAGB landing website with:
  - Home, About PAGB, Current Issue, Archives, Policies, and Contact pages.
  - Journal policies rendered from markdown source (`PAGB_POLICIES.md`) as static content.
- Clear navigation structure enabling visitors to quickly reach desired sections.
- Static integration of PAGB PDFs (current issue and archives) via secure download links.
- Basic hardening and HTTPS-only access suitable for public deployment within GHQ-controlled infrastructure.

### 2.2 Notable Improvements over Manual / Legacy Processes

- Centralised and branded online presence for PAGB, replacing scattered or informal online references.
- Single, authoritative location for publicly released PAGB PDFs and policy documents.
- Improved accessibility of PAGB information for officers, scholars, and policy makers.

---

## 3. New Features by Module

### 3.1 Public Landing Website

- **Home Page** (`/`)
  - PAGB branding, mission statement, and key highlights.
  - Prominent links to Current Issue, Archives, Policies, and Contact sections.

- **Current Issue** (`/current-issue`)
  - Overview of the latest volume/issue, year, and theme.
  - Listing of publicly released PDFs for the current issue.

- **Archives** (`/archives`)
  - Listing of previous issues and/or selected articles grouped by year or volume.
  - Basic search or filtering by year or theme, if configured.

- **Author / Contributor Pages** (`/authors/[slug]`, optional)
  - Static overview of contributors and associated works where appropriate.

- **Policies** (`/policies`, `/policies/[slug]`)
  - Rendering of PAGB policies from `PAGB_POLICIES.md` for visitors to reference.

- **Contact / Secretariat** (`/contact` or in footer)
  - Contact details for PAGB Secretariat or relevant directorate via official channels.

---

## 4. Data & Assets

- PAGB content is primarily served as static HTML and PDF files.
- Policy text is sourced from `PAGB_POLICIES.md` and compiled into the build output.
- PAGB PDFs are organised in a secure directory structure (e.g., by year/volume) and referenced from Current Issue and Archives pages.

---

## 5. Security Features in This Release

- **HTTPS-only access** to the public site with GHQ-approved certificates.
- Deployment on a hardened hosting platform with OS and web server hardening managed by operations teams.
- Security headers (e.g. `X-Frame-Options`, `X-Content-Type-Options`, HSTS) configured at reverse proxy or web server layer.
- Minimal attack surface: no public login forms, no online submission forms, no public API endpoints.

Additional details are documented in **Security_Controls.md**.

---

## 6. Known Limitations / Deferred Enhancements

- Current release focuses on a simple, static landing site; complex search and filtering capabilities are limited.
- No online submission or peer review features are provided; these remain off-platform.
- Integration with centralised analytics or monitoring tools may be added later subject to policy.

---

## 7. Deployment & Configuration Notes

### 7.1 Configuration

The build and deployment pipeline relies on environment-level configuration including but not limited to:

- Base URLs and environment labels (e.g. staging vs production).
- File storage or base path configuration for PDF assets.

### 7.2 Deployment Checklist (High-Level)

- Build the Next.js static site and deploy output (using approved pipeline).
- Configure reverse proxy (e.g., Nginx/Apache) or static hosting to serve under HTTPS with valid certificate.
- Verify that all key pages load and that PDF links resolve correctly.
- Conduct smoke tests using key user flows (home, current issue, archives, policies, downloads).

---

## 8. Compatibility and Browser Support

This release is designed for modern browsers (Chrome, Edge, Firefox) with JavaScript enabled. Legacy browsers may not be fully supported.

---

## 9. Support and Maintenance

- Content change requests should be channelled through PAGB Secretariat and GHQ’s standard IT support/change-management processes.
- Security vulnerabilities or availability incidents should be escalated through Information Security Cell and Operations in accordance with established SOPs.

These release notes should accompany NOC submissions and operational handover documents to clearly describe what is delivered in Version 1.0.0 of the PAGB Landing Website.
