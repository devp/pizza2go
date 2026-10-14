// This app's state, in one place.
//
// Components that belong to *this* app import from here directly. Components
// meant to travel between apps (see components/append-log.js) take plain
// properties instead and know nothing about any of this.

import { persistedValue, recordStore } from "./lib/store.js";

// localStorage key prefix, from <meta name="app-ns"> in index.html.
const NS = document.querySelector('meta[name="app-ns"]')?.getAttribute("content") ?? "app";

export const theme = persistedValue(NS + ":theme", "dusk");
export const font = persistedValue(NS + ":font", "mono");
export const tab = persistedValue(NS + ":tab", "units");
/** Comma-separated; blank means the defaults (DEFAULT_SHORTCUTS in app.js). */
export const shortcutsPref = persistedValue(NS + ":shortcuts", "");
/** "ask" until you pick Wait for Wi-Fi on the download card. */
export const downloadPref = persistedValue(NS + ":download", "ask");
/** Which file of the open unit is in the editor: "go" or "test". */
export const fileTab = persistedValue(NS + ":file", "test");
/** The problems/output pane under the editor: "problems", "output" or "closed". */
export const paneTab = persistedValue(NS + ":pane", "problems");
/** Shown once: the first-run memory warning for iOS Safari. */
export const iosWarned = persistedValue(NS + ":ios-warned", "");

/**
 * Units: one record per package, named by its package name. Its two items are
 * the files: {kind: "go"|"test", src}. The active record is the open unit.
 */
export const units = recordStore(NS + ":units");

/** Check and run results per unit id (see lib/units.js Results), as JSON. */
export const results = persistedValue(NS + ":results", "{}");
