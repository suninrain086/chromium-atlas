// PWA install prompt — appears only when beforeinstallprompt fires.
let deferred: any = null;

export function mountInstallButton(host: HTMLElement) {
  host.innerHTML = `<button id="install-btn" class="install-btn" hidden aria-label="Install chromium-atlas">Install</button>`;
  const btn = host.querySelector<HTMLButtonElement>("#install-btn")!;
  window.addEventListener("beforeinstallprompt", (e: Event) => {
    e.preventDefault();
    deferred = e;
    btn.hidden = false;
  });
  btn.addEventListener("click", async () => {
    if (!deferred) return;
    deferred.prompt();
    try { await deferred.userChoice; } catch { /* ignore */ }
    deferred = null;
    btn.hidden = true;
  });
  window.addEventListener("appinstalled", () => { btn.hidden = true; });
}
