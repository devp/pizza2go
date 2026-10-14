import { LitElement, html, nothing } from "lit";
import * as toolchain from "../lib/toolchain.js";

const mb = (/** @type {number} */ n) => (n / 1048576).toFixed(0) + "MB";

/**
 * Asks before downloading the Go toolchain, and shows the download. The same
 * card offers updates. Renders nothing once the current toolchain is in place.
 */
export class DownloadCard extends LitElement {
  static properties = { status: { attribute: false }, later: { state: true } };

  constructor() {
    super();
    /** @type {import("../lib/toolchain.js").Status} */
    this.status = toolchain.get();
    this.later = false;
    /** @type {() => void} */
    this.unsubscribe = () => {};
  }

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    const off = toolchain.subscribe((s) => (this.status = s));
    this.unsubscribe = () => void off();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe();
  }

  render() {
    const s = this.status;
    const m = s.available;
    const wifi = toolchain.knowsWifi();
    const choices = () => html`<div class="card-actions">
      <button type="button" class="${toolchain.saveData() ? "" : "primary"}" data-act="download" @click=${() => toolchain.download()}>Download now</button>
      ${wifi
        ? html`<button type="button" class="${toolchain.saveData() ? "primary" : ""}" data-act="wifi" @click=${() => this.dispatchEvent(new CustomEvent("wait-wifi"))}>Wait for Wi-Fi</button>`
        : html`<button type="button" data-act="later" @click=${() => (this.later = true)}>Later</button>`}
    </div>`;

    switch (s.state) {
      case "checking":
        return nothing;
      case "offline":
        return html`<div class="card">Go toolchain not downloaded yet, and the server can't be reached. Checking and running tests need it; writing code doesn't.</div>`;
      case "missing":
        if (this.later) return html`<div class="card compact">Go toolchain not downloaded. <button type="button" class="link" @click=${() => (this.later = false)}>Download…</button></div>`;
        return html`<div class="card">
          <p><strong>Download the Go toolchain?</strong> ${m?.go.replace(/^go/, "Go ")}, about ${mb(m?.bytes ?? 0)} on this device. Checking and running tests need it; writing code doesn't.</p>
          ${choices()}
        </div>`;
      case "waiting":
        return html`<div class="card compact">Waiting for Wi-Fi to download the Go toolchain (${mb(m?.bytes ?? 0)}).
          <button type="button" class="link" data-act="download" @click=${() => toolchain.download()}>Download now</button></div>`;
      case "downloading":
        return html`<div class="card">
          <p>Downloading ${m?.go.replace(/^go/, "Go ")}: ${mb(s.progress.done)} of ${mb(s.progress.total)}. Keep the app open.</p>
          <progress max=${s.progress.total} value=${s.progress.done}></progress>
        </div>`;
      case "error":
        return html`<div class="card">
          <p class="error">Download stopped: ${s.error}</p>
          <p>Files already downloaded are kept.</p>
          <div class="card-actions"><button type="button" class="primary" data-act="download" @click=${() => toolchain.download()}>Retry</button></div>
        </div>`;
      case "ready":
        if (!toolchain.updateAvailable() || this.later) return nothing;
        return html`<div class="card">
          <p><strong>${m?.go.replace(/^go/, "Go ")} is available</strong> (${mb(m?.bytes ?? 0)}). ${s.installed?.go.replace(/^go/, "Go ")} keeps working until it's downloaded.</p>
          ${choices()}
        </div>`;
    }
  }
}
