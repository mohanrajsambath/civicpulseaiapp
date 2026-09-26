# CivicPulse AI Security Specification & Access Control Matrix

## 1. System Access Control Pillars
- **Zero-Barrier Public Read (DPI Tier)**: Anyone (authenticated or public) can view public grievances (`/grievances/{grievanceId}`) to track civic issues, map pins, and resolutions transparently.
- **Citizen Write / Reporting**: Anyone authenticated or anonymous (DPI tier) can lodge initial grievances.
- **Contractor Accountability (`provider`)**: Only authenticated users with `provider` or `policymaker` role can update a grievance status to `work_allocated`, `resolved`, or attach resolution proof photographs and contractor IDs.
- **Admin Full Authority (`policymaker`)**: Verified administrators can triage, sanction, or re-allocate tickets.
- **User Profile Isolation (`/users/{userId}`)**: Users can read and write only their own profile document (`request.auth.uid == userId`). Public profile reads are restricted to necessary fields.

## 2. Invariants & Guardrails
1. Users may only create/update their own profile in `/users/{userId}` where `request.auth.uid == userId`.
2. Public users cannot overwrite `resolutionPhotoUrl`, `resolvedAt`, or status to `resolved` without being an authorized contractor or admin.
3. Path variables are bounded and validated to prevent injection.
