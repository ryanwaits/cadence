import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, EASE } from "../../brand/tokens";
import { FONTS } from "../../brand/fonts";
import { drawDashoffset } from "../../motion/presets";
import type { PanelSpec } from "../../schema/beats";
import { STYLES, resolveRole } from "../../templates/active";
import type { ColorRole } from "../../templates/types";
import { PanelCard } from "./PanelCard";

type Spec = Extract<PanelSpec, { kind: "diagram" }>;
type NodeType = Spec["nodes"][number]["type"];

const S = STYLES.panel.byKind.diagram as {
  surface: string;
  geom: { W: number; H: number; NW: number; NH: number };
  svgPadding: string;
  edge: { strokeWidth: number; labelOffset: number; labelSize: number };
  nodeRx: number;
  nodeStroke: number;
  nodeLabel: { fontSize: number; fontWeight: number; yOffset: number };
  nodeFill: Record<NodeType, ColorRole>;
  nodeStrokeColor: Record<NodeType, ColorRole>;
  nodeText: Record<NodeType, ColorRole>;
  note: { padding: string; fontSize: number };
};

const W = S.geom.W;
const H = S.geom.H;
const NW = S.geom.NW;
const NH = S.geom.NH;

const NODE_FILL = { default: resolveRole(S.nodeFill.default), data: resolveRole(S.nodeFill.data), api: resolveRole(S.nodeFill.api) } as const;
const NODE_STROKE = { default: resolveRole(S.nodeStrokeColor.default), data: resolveRole(S.nodeStrokeColor.data), api: resolveRole(S.nodeStrokeColor.api) } as const;
const NODE_TEXT = { default: resolveRole(S.nodeText.default), data: resolveRole(S.nodeText.data), api: resolveRole(S.nodeText.api) } as const;

export const DiagramPanel: React.FC<{ spec: Spec; reveal?: number }> = ({ spec, reveal = 0 }) => {
  const frame = useCurrentFrame() - reveal;
  const n = spec.nodes.length;
  const gap = (W - NW * n) / (n + 1);
  const cy = H / 2;
  const pos = new Map(spec.nodes.map((node, i) => [node.id, { x: gap + i * (NW + gap), y: cy - NH / 2 }]));

  return (
    <PanelCard motion={spec.motion} style={{ background: S.surface }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block", padding: S.svgPadding }}>
        <defs>
          <marker id="arrow" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
            <path d="M0,0 L7,3 L0,6 Z" fill={COLORS.textMuted} />
          </marker>
        </defs>
        {spec.edges.map((e, i) => {
          const a = pos.get(e.from)!;
          const b = pos.get(e.to)!;
          const x1 = a.x + NW, y1 = a.y + NH / 2, x2 = b.x - 4, y2 = b.y + NH / 2;
          const len = Math.hypot(x2 - x1, y2 - y1);
          const start = 16 + i * 8;
          const p = interpolate(frame, [start, start + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.smooth });
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={COLORS.textMuted} strokeWidth={S.edge.strokeWidth} markerEnd="url(#arrow)" strokeDasharray={len} strokeDashoffset={drawDashoffset(p, len)} />
              {e.label && p > 0.6 && (
                <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - S.edge.labelOffset} textAnchor="middle" fontFamily={FONTS.mono} fontSize={S.edge.labelSize} fill={COLORS.textMuted} opacity={(p - 0.6) / 0.4}>{e.label}</text>
              )}
            </g>
          );
        })}
        {spec.nodes.map((node, i) => {
          const pp = pos.get(node.id)!;
          const start = 10 + i * 7;
          const p = interpolate(frame, [start, start + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.smooth });
          return (
            <g key={node.id} opacity={p} transform={`translate(0 ${(1 - p) * 8})`}>
              <rect x={pp.x} y={pp.y} width={NW} height={NH} rx={S.nodeRx} fill={NODE_FILL[node.type]} stroke={NODE_STROKE[node.type]} strokeWidth={S.nodeStroke} />
              <text x={pp.x + NW / 2} y={pp.y + NH / 2 + S.nodeLabel.yOffset} textAnchor="middle" fontFamily={FONTS.display} fontSize={S.nodeLabel.fontSize} fontWeight={S.nodeLabel.fontWeight} fill={NODE_TEXT[node.type]}>{node.label}</text>
            </g>
          );
        })}
      </svg>
      {spec.note && (
        <div style={{ textAlign: "right", padding: S.note.padding, fontFamily: FONTS.note, fontSize: S.note.fontSize, color: COLORS.signalBlue }}>{spec.note}</div>
      )}
    </PanelCard>
  );
};
