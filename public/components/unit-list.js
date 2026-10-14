import { LitElement, html } from "lit";
import { repeat } from "lit/directives/repeat.js";

const LABEL = { done: "done", pass: "passing", fail: "failing", stale: "edited", new: "not run" };

/**
 * The unit list. Fed by property; fires `open` with a unit id.
 *   el.units = [{id, name, updatedAt, status}]  el.activeId = id
 */
export class UnitList extends LitElement {
  static properties = { units: { attribute: false }, activeId: { attribute: false } };

  constructor() {
    super();
    /** @type {{id: string, name: string, updatedAt: number, status: keyof typeof LABEL}[]} */
    this.units = [];
    /** @type {string|null} */
    this.activeId = null;
  }

  createRenderRoot() {
    return this;
  }

  render() {
    if (this.units.length === 0) return html`<p class="hint">No units yet. Name a package above to start one.</p>`;
    const sorted = [...this.units].sort((a, b) => b.updatedAt - a.updatedAt);
    return repeat(
      sorted,
      (u) => u.id,
      (u) => html`<button type="button" class="unit-row ${u.id === this.activeId ? "current" : ""}"
        @click=${() => this.dispatchEvent(new CustomEvent("open", { detail: u.id }))}>
        <span class="unit-name">${u.name}</span>
        <span class="badge ${u.status}">${LABEL[u.status]}</span>
        <span class="unit-meta">${new Date(u.updatedAt).toLocaleString()}</span>
      </button>`
    );
  }
}
