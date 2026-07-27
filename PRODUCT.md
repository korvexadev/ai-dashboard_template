# Mikozi Dashboard Product

The dashboard is Mikozi's secure newsroom, commercial, and administrative
workspace. It uses the backend's versioned REST/OpenAPI contract and never
duplicates authorization or editorial rules.

## Primary operators

- Reporters draft and submit stories.
- Editors review, curate, schedule, publish, correct, and archive.
- Media producers manage assets, rights, captions, and accessibility metadata.
- Commercial operators manage approved advertising inventory and campaigns.
- Administrators manage staff access, feature rollout, and audit review.

## Product outcomes

- A permission-scoped newsroom from idea to attributable publication.
- Fast editorial queues and calm, recoverable high-stakes actions.
- Commercial tools structurally separated from editorial ranking.
- Clear preview, audit, validation, empty, loading, and failure states.
- A handcrafted, accessible visual system with strong typography, restrained
  motion, intentional density, and no decorative gradient dependence.

## Delivery relationship

Dashboard work follows the shared module order in
`../backend/docs/DELIVERY_WORKFLOW.md`. Each module consumes a reviewed OpenAPI
artifact and is complete only after its applicable cross-application journey
passes.

## Initial journeys

1. Phone OTP admin authentication and protected workspace.
2. Permission and role administration.
3. Taxonomy and media management.
4. Article drafting, review, scheduling, publishing, and correction.
5. Homepage/feed curation and audience-policy preview.
6. Advertising campaign, creative, placement, approval, and reporting.
7. Distribution, notification, analytics, audit, and operational tooling.

Environment URLs, public domains, and provider selections remain configuration,
not source-code constants.
