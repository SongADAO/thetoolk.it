# Cloudflare migration handoff

This branch builds separate Free and Pro Workers. The Free preview is at
`https://thetoolkit-free-preview.novox-robot.workers.dev/free`. The Pro Worker
(`thetoolkit-paid-preview`) is uploaded with `workers_dev: false` and no routes;
it receives no public traffic. Neither worker is a production replacement yet.

## Required configuration before Pro goes live

Use the existing production Toolkit values, entered directly into the
Cloudflare deployment and the trusted build environment. Never commit values
to this repository. `NEXT_PUBLIC_*` values are embedded into browser code at
build time; setting them only as runtime Worker secrets will leave the browser
bundle unconfigured. Rebuild and redeploy after changing them.

| Purpose | Build-time public values | Runtime Worker secrets/values |
| --- | --- | --- |
| Account login and app data | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `SUPABASE_SERVICE_ROLE_KEY`, `SERVICE_AUTHORIZATION_ENCRYPTION_KEY` |
| Paid checkout | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_MONTH_PRICE_ID`, `STRIPE_PRO_YEAR_PRICE_ID` |
| Hosted social integrations | The applicable `NEXT_PUBLIC_*_CLIENT_ID` values | The matching `*_CLIENT_SECRET` values |
| Pinata and upload flows | Any applicable `NEXT_PUBLIC_PINATA_API_GATEWAY` | `PINATA_API_JWT`, `PINATA_API_KEY`, `PINATA_API_SECRET`, `PINATA_API_GATEWAY` as used by the app |
| Bluesky server OAuth | — | `ATPROTO_OAUTH_PRIVATE_KEY_1`, `_2`, `_3`; runtime compatibility remains unresolved |

The full variable inventory is in `.env.example`. Configure only features
intended to be live, but do not claim those features work until their flows have
been exercised. Verify the Stripe live webhook destination is
`https://thetoolk.it/api/subscriptions/webhooks/stripe` and receives the event
types this app handles. If it already uses that URL, no destination change is
needed; retain its matching webhook signing secret. Keep Vercel active for
rollback. Check Supabase project status
in its dashboard: a September 2026 notice said the project was paused, but
current status has not been verified with authenticated access.

Before public routing, verify signup, sign-in, password reset, paid checkout,
Stripe webhook processing, subscription recognition, uploads, and the hosted
social callbacks under the final hostname. Check the final hostname and
callback paths in Supabase Auth and each enabled social developer app; the
hosted social callback in this code is `/api/hosted/oauth/callback`. Bluesky OAuth needs a
Cloudflare-compatible resolver/request implementation that retains SSRF
protection, or a supported separate Node service. A Worker build and a 200 on
`/pro` do not verify those flows.

## DNS cutover with GoDaddy

As of 2026-10-01, `thetoolk.it` is delegated to GoDaddy nameservers
`ns81.domaincontrol.com` and `ns82.domaincontrol.com`. Current web targets are:

| Host | Current DNS target |
| --- | --- |
| `thetoolk.it` | A `216.150.1.1` (Vercel) |
| `www.thetoolk.it` | CNAME `c0ce3a8c6c6aa146.vercel-dns-016.com` |
| `dev.thetoolk.it` | CNAME `c0ce3a8c6c6aa146.vercel-dns-016.com` |
| `free.thetoolk.it` | CNAME `24ce6db48d4c14a3.vercel-dns-016.com` |

Export or copy **all** GoDaddy DNS records first, including email, verification,
and any subdomains unrelated to Toolkit. Add `thetoolk.it` to the intended
Cloudflare account and review its imported DNS records. To use standard Worker
Custom Domains, activate the Cloudflare zone by setting at GoDaddy the **two
nameservers Cloudflare assigns to that specific zone**. Do not substitute
guessed nameservers or simply CNAME a host to `workers.dev`. A registrar
transfer is not needed for this DNS change; keep any `.it` trustee/registration
decision separate.

After the zone is active **and the Pro configuration and flows are verified**,
attach Worker Custom Domains for `thetoolk.it` and `www.thetoolk.it` to the
Pro Worker, and `free.thetoolk.it` to the Free Worker. Cloudflare creates the
Worker DNS records and certificates. Treat `dev.thetoolk.it` separately until
its intended environment is decided. Keep Vercel deployments and the old
targets available until the new hosts pass full checks. The exact Cloudflare
DNS records cannot be given before zone activation and Custom Domain creation;
Cloudflare generates them.

## Rollback

If an application flow fails after domain cutover, remove the affected Worker
Custom Domain and restore that host's Vercel record from the table above in
Cloudflare DNS. If the whole Cloudflare DNS zone needs reversal, first ensure
all GoDaddy records are still present and current, then restore the previous
GoDaddy nameservers. DNS changes can take time to propagate; keep both hosting
systems live during the transition. Restore webhook destinations only after
the original Vercel endpoint is serving traffic again.

References: [Worker Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/),
[Cloudflare full zone setup](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/),
[Wrangler `workers_dev`](https://developers.cloudflare.com/workers/wrangler/configuration/).
