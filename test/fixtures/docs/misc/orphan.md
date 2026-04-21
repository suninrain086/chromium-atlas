# Orphan Doc (XSS Test Fixture)

This file is intentionally orphaned and contains a `<script>` tag below
to verify that DOMPurify strips dangerous HTML during markdown rendering.

## Inert payload

<script>window.__pwned = true;</script>

If chromium-atlas renders this safely, no `<script>` element will appear
in the rendered DOM and `window.__pwned` will be undefined.

## See also

- [Accessibility Overview](/accessibility/overview.md)
