# Dashboard Real-Time Communication

Use one authenticated socket connection for live operational state, chat, presence, locations, notifications, and long-running operation progress.

The shared provider owns handshake authentication, connection health, exponential reconnect with jitter, room restoration, typed decoding, sequence tracking, and cleanup. Features subscribe through adapters and update the REST cache only with validated events.

REST is authoritative. After reconnect, sequence gaps, or unknown event versions, refetch affected resources. Never use sockets for ordinary page reads or as the only confirmation of a financial or destructive command.
