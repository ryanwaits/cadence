import type { PanelSpec } from "../../schema/beats";
import { FeedPanel } from "./Feed";
import { UploadProgressPanel } from "./UploadProgress";
import { DataTablePanel } from "./DataTable";
import { StatusPanel } from "./Status";
import { StatPanel } from "./Stat";
import { ProofPanel } from "./Proof";
import { StreamResumePanel } from "./StreamResume";
import { ForkPanel } from "./Fork";
import { DiagramPanel } from "./Diagram";
import { BrowserPanel } from "./Browser";

/** Compile-time exhaustiveness guard: a new panel kind that isn't handled below
 * becomes a tsc error here (the bare switch would otherwise silently render nothing). */
const assertNever = (x: never): never => {
  throw new Error(`Unhandled panel kind: ${JSON.stringify(x)}`);
};

/**
 * Resolve a PanelSpec (by its `kind`) to the right panel component. `reveal` is a
 * frame offset that holds the panel's *content* animations (rows, counters, draws)
 * until the paired code window has finished typing — the card/header still mount
 * immediately, so both components are on screen together.
 */
export const Panel: React.FC<{ spec: PanelSpec; reveal?: number }> = ({ spec, reveal = 0 }) => {
  switch (spec.kind) {
    case "feed":
      return <FeedPanel spec={spec} reveal={reveal} />;
    case "upload-progress":
      return <UploadProgressPanel spec={spec} reveal={reveal} />;
    case "data-table":
      return <DataTablePanel spec={spec} reveal={reveal} />;
    case "status":
      return <StatusPanel spec={spec} reveal={reveal} />;
    case "stat":
      return <StatPanel spec={spec} reveal={reveal} />;
    case "proof":
      return <ProofPanel spec={spec} reveal={reveal} />;
    case "stream-resume":
      return <StreamResumePanel spec={spec} reveal={reveal} />;
    case "fork":
      return <ForkPanel spec={spec} reveal={reveal} />;
    case "diagram":
      return <DiagramPanel spec={spec} reveal={reveal} />;
    case "browser":
      return <BrowserPanel spec={spec} reveal={reveal} />;
    default:
      return assertNever(spec);
  }
};
