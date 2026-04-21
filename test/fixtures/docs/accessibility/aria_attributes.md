# ARIA attribute mapping

How chromium maps ARIA attributes from the DOM to the AXTree and out to platform APIs.

## Mapping table

The full mapping lives in third_party/blink/renderer/modules/accessibility/.

### Computed roles

Many ARIA roles are computed lazily.
