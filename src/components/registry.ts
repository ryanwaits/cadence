import type React from "react";
import { PANEL_SCHEMAS, type PanelKind, type PanelSpec } from "../schema/primitives";
import { FeedPanel } from "./panels/Feed";
import { UploadProgressPanel } from "./panels/UploadProgress";
import { DataTablePanel } from "./panels/DataTable";
import { StatusPanel } from "./panels/Status";
import { StatPanel } from "./panels/Stat";
import { ProofPanel } from "./panels/Proof";
import { StreamResumePanel } from "./panels/StreamResume";
import { ForkPanel } from "./panels/Fork";
import { DiagramPanel } from "./panels/Diagram";
import { BrowserPanel } from "./panels/Browser";
import { QuotePanel } from "./panels/Quote";

/**
 * The PANEL registry — render-side dispatch, one entry per panel kind. Pairs each
 * kind's schema (the SAME object the discriminated union is built from, in
 * `schema/primitives.ts`) with its React component, so schema + dispatch can't drift.
 *
 * The mapped type makes this exhaustive AND type-correct: every `PanelKind` must
 * appear, and each entry's `Component` must accept that kind's narrowed spec — a
 * missing or mismatched entry is a tsc error (replacing the old `assertNever` switch).
 * Adding a panel = a per-kind schema in `primitives.ts` + a component + one line here.
 *
 * This module imports React components, so only the RENDER path pulls it. The CLI
 * validate/`--explain` path enumerates kinds from `PANEL_KINDS` (pure) instead.
 */
type PanelComponent<K extends PanelKind> = React.FC<{ spec: Extract<PanelSpec, { kind: K }>; reveal?: number }>;
type PanelRegistry = { [K in PanelKind]: { schema: (typeof PANEL_SCHEMAS)[K]; Component: PanelComponent<K> } };

export const PANEL_REGISTRY: PanelRegistry = {
  feed: { schema: PANEL_SCHEMAS.feed, Component: FeedPanel },
  "upload-progress": { schema: PANEL_SCHEMAS["upload-progress"], Component: UploadProgressPanel },
  "data-table": { schema: PANEL_SCHEMAS["data-table"], Component: DataTablePanel },
  status: { schema: PANEL_SCHEMAS.status, Component: StatusPanel },
  stat: { schema: PANEL_SCHEMAS.stat, Component: StatPanel },
  proof: { schema: PANEL_SCHEMAS.proof, Component: ProofPanel },
  "stream-resume": { schema: PANEL_SCHEMAS["stream-resume"], Component: StreamResumePanel },
  fork: { schema: PANEL_SCHEMAS.fork, Component: ForkPanel },
  diagram: { schema: PANEL_SCHEMAS.diagram, Component: DiagramPanel },
  browser: { schema: PANEL_SCHEMAS.browser, Component: BrowserPanel },
  quote: { schema: PANEL_SCHEMAS.quote, Component: QuotePanel },
};
