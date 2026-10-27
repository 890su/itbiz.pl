# Telegram delivery and contact layout

ITBIZ enquiries are saved to D1 and sent through the authenticated NaSerwis
notification endpoint to its existing Telegram bot and recipient. The bot token
remains in NaSerwis Cloudflare secrets; the shared relay credential is server-only.
Preview environments do not send notifications. Both sites retain their existing
public offers and forms.

New enquiries enter a durable notification queue. Successful Telegram delivery
marks them sent; failures retry every five minutes. Concurrent delivery claims
prevent routine duplicate sends. Delivery is at least once: a provider success
followed by a storage failure can cause a duplicate. Existing rows are marked
legacy by the migration and are not automatically forwarded.

Apply `migrations/0003_add_telegram_outbox.sql` to the production D1 database
before publishing the worker. Production requires `TELEGRAM_RELAY_TOKEN` and
`TELEGRAM_RELAY_URL`; the receiving Pages project requires
`ITBIZ_NOTIFICATION_TOKEN` and its existing Telegram bindings. Never commit
credential values. Privacy notices in all four languages disclose Telegram
notification processing.

The call button is centred below the enquiry form, the decorative animation
has no pause control, and the full-width footer stays dark in both themes.
Automatic reduced-motion, offscreen and form-focus pauses remain supported.

Validation covers notification retries and failures using SQLite, multilingual
desktop/mobile contact layout, form behaviour, animation and reduced motion.
Production acceptance requires a labelled test enquiry and its stored `sent`
notification status after Telegram acknowledgement.
