# Network-light hero and scope bands

Date: 2026-10-26. Scope: approved compact-site refinement and publication, with
targeted seo-landing validation. Preserve page inventory, content, forms,
operator identity and SEO.

## Changes

- Service scope/result/conditions/request sections now have an explicit
  full-width section-band background in both themes. Their color no longer
  depends on the section's position in the document.
- Home and service heroes use one decorative SVG grid with rectilinear
  connections and a soft moving light mask. This is an abstract illustration,
  not real monitoring, telemetry or a customer network.
- A 28-second pair of opposite CSS transforms moves the highlight while keeping
  the network geometry stationary. Static CSS masks and separate compositor
  layers replace the original animated SVG mask after measured mobile rendering
  overhead. Text and forms do not move. No canvas, WebGL, image asset,
  third-party dependency or mouse tracking was added.
- A native, localized 44px switch pauses the animation. It pauses automatically
  while editing the inline lead form, when the hero is offscreen or the tab is hidden.
- Reduced-motion users receive a static grid; forced-color mode omits the
  decorative surface. Without JavaScript, the grid stays static and its
  inoperative control stays hidden.
- A small first-party script supplies visibility/focus control. It is served
  from `/scripts/hero-network.js` under the existing CSP. The initial Astro
  inline-module version was blocked during verification and replaced; CSP was
  not weakened.

## Verification notes

Impeccable animate and UI/UX reduced-motion guidance informed the implementation.
The existing visual identity and the user's explicit grid request take
precedence over generic background-pattern avoidance.

One batched inspection and one confirmation covered light/dark, 320px, 390px,
1440px and 1920px. Captures and measured geometry are under the ignored
`reports/network-light-2026-10-26/` directory. No horizontal overflow was found.
Measured heights remain 1077px for the 1440px homepage and 1724px for the 390px
CCTV page, matching the compact release before this refinement.

The manual detector returned `[]`. A physical iPhone/Safari and low-end device
frame rates were not tested. No production enquiry was submitted and no campaign
was changed.

Final checks: Astro check had zero errors/warnings/hints; 46 unit tests and
17 focused browser cases passed. The latter cover all 48 service translations,
compact-page geometry, color bands in both themes, pointer and keyboard pause,
form-focus pause, offscreen suspension and reduced motion. The 12-page-per-locale
traversal retains its individual assertions and has a 90-second case budget;
the previous 30-second whole-loop timeout was too short during concurrent
screenshot capture. Production build and link/SEO checks cover 85 HTML files.

Preview deployed as `587cbb4e-0b0a-4ba5-8d1d-599a81833c09` to
<https://itbiz-pl-preview.iharszasciuk.workers.dev/>. Remote smoke checks passed
for the four homepages and four CCTV translations. The served script matches
the checked local file, preview remains noindex, and its CSP matches production.
This was the initially approved preview, before the publication audit.

## Publication audit

The seo-landing pass corrected the single-line address autocomplete token,
declared UTF-8 on HTML responses only, moved the service-filter script inside
the document, replaced two unheaded section wrappers with divs, and included
the visible language abbreviation in accessible link names. These fixes preserve
the visible content and interaction design.

Raw W3C Nu, schema.org, Lighthouse, negative-fixture and viewport artifacts are
kept locally under `reports/seo-landing-2026-10-26/`. Lab results and validation
limitations are recorded there. SVG decoration, the existing script architecture,
the owner's existing animated enquiry examples and consent UI are retained as
existing-site exceptions to the skill's new-page generation recipe. No claim of
field Core Web Vitals, complete WCAG certification or Google rich-result
eligibility is made.
