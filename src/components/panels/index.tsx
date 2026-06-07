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

/** Resolve a PanelSpec (by its `kind`) to the right panel component. */
export const Panel: React.FC<{ spec: PanelSpec }> = ({ spec }) => {
  switch (spec.kind) {
    case "feed":
      return <FeedPanel spec={spec} />;
    case "upload-progress":
      return <UploadProgressPanel spec={spec} />;
    case "data-table":
      return <DataTablePanel spec={spec} />;
    case "status":
      return <StatusPanel spec={spec} />;
    case "stat":
      return <StatPanel spec={spec} />;
    case "proof":
      return <ProofPanel spec={spec} />;
    case "stream-resume":
      return <StreamResumePanel spec={spec} />;
    case "fork":
      return <ForkPanel spec={spec} />;
    case "diagram":
      return <DiagramPanel spec={spec} />;
    case "browser":
      return <BrowserPanel spec={spec} />;
    default:
      return assertNever(spec);
  }
};
