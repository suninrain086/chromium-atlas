# ChromeVox on ChromeOS

ChromeVox is the built-in screen reader for ChromeOS. This page documents the development setup and architecture.

## Architecture

ChromeVox runs as a chrome extension with private API access to the AXTree.

```js
chrome.automation.getDesktop(function(desktop) {
  desktop.find({attributes: {role: 'button'}});
});
```

## Development build

Use the chromevox panel to enable from chrome://extensions.

### Testing

See [tests](tests.md) for the e2e setup.
