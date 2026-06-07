import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, EASE } from "../../brand/tokens";
import { FONTS } from "../../brand/fonts";
import { drawDashoffset } from "../../motion/presets";
import type { PanelSpec } from "../../schema/beats";
import { PanelCard } from "./PanelCard";

type Spec = Extract<PanelSpec, { kind: "diagram" }>;

const W = 620;
const H = 240;
const NW = 132;
const NH = 62;

const NODE_FILL = { default: COLORS.chrome, data: COLORS.signalBlueSoft, api: COLORS.signalBlue } as const;
const NODE_STROKE = { default: COLORS.hairline, data: COLORS.signalBlueBorder, api: COLORS.signalBlue } as const;
const NODE_TEXT = { default: COLORS.ink, data: COLORS.signalBlue, api: COLORS.paper } as const;

export const DiagramPanel: React.FC<{ spec: Spec; reveal?: number }> = ({ spec, reveal = 0 }) => {
  const frame = useCurrentFrame() - reveal;
  const n = spec.nodes.length;
  const gap = (W - NW * n) / (n + 1);
  const cy = H / 2;
  const pos = new Map(spec.nodes.map((node, i) => [node.id, { x: gap + i * (NW + gap), y: cy - NH / 2 }]));

  return (
    <PanelCard motion={spec.motion} style={{ background: "rgba(252,251,247,0.95)" }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block", padding: "8px" }}>
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
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={COLORS.textMuted} strokeWidth={1.5} markerEnd="url(#arrow)" strokeDasharray={len} strokeDashoffset={drawDashoffset(p, len)} />
              {e.label && p > 0.6 && (
                <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 8} textAnchor="middle" fontFamily={FONTS.mono} fontSize={11} fill={COLORS.textMuted} opacity={(p - 0.6) / 0.4}>{e.label}</text>
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
              <rect x={pp.x} y={pp.y} width={NW} height={NH} rx={8} fill={NODE_FILL[node.type]} stroke={NODE_STROKE[node.type]} strokeWidth={1.5} />
              <text x={pp.x + NW / 2} y={pp.y + NH / 2 + 5} textAnchor="middle" fontFamily={FONTS.display} fontSize={15} fontWeight={600} fill={NODE_TEXT[node.type]}>{node.label}</text>
            </g>
          );
        })}
      </svg>
      {spec.note && (
        <div style={{ textAlign: "right", padding: "0 22px 16px", fontFamily: FONTS.note, fontSize: 22, color: COLORS.signalBlue }}>{spec.note}</div>
      )}
    </PanelCard>
  );
};
