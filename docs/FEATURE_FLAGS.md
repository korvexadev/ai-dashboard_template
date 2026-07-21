# Dashboard Feature Flags

The dashboard consumes the operator's effective flag snapshot through REST for navigation, routes, and actions. A separate permission-protected administration feature manages canonical backend flags.

Management UI must show code, status, platforms, environments, allowlists/cohorts, percentage rollout, client-version range, schedule, owner, expiry/removal issue, and immutable audit history. Every mutation requires an audit reason.

Unknown flags hide dependent UI. Hidden UI never secures REST endpoints or socket rooms. Direct routes and commands must display a clear unavailable/unauthorized result.

Test preview allowed/denied, scheduled and expired flags, direct URLs, unknown flags, optimistic-update failure, concurrent edits, and live status changes.
