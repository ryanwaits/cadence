import { useEffect, useState } from "react";
import { AbsoluteFill, Img, continueRender, delayRender, staticFile } from "remotion";
import { COLORS, RADIUS } from "../brand/tokens";
import { FONTS } from "../brand/fonts";

type Entry = { file: string; subject: string; level: string; format: string; name: string };

/**
 * Review board for generated backgrounds. Reads the candidates manifest written
 * by `cadence art` and lays them out in a labeled grid. Render with
 * `remotion still ContactSheet out/contact.png` to pick winners, then promote the
 * chosen files from _candidates/ to backgrounds/ (`cadence art --promote`).
 */
export const ContactSheet: React.FC = () => {
  const [handle] = useState(() => delayRender("manifest"));
  const [items, setItems] = useState<Entry[]>([]);

  useEffect(() => {
    fetch(staticFile("backgrounds/_candidates/manifest.json"))
      .then((r) => (r.ok ? r.json() : []))
      .then((d: Entry[]) => { setItems(d); continueRender(handle); })
      .catch(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{ background: COLORS.paper, padding: 64, fontFamily: FONTS.body }}>
      <div style={{ fontFamily: FONTS.display, fontSize: 44, fontWeight: 600, letterSpacing: "-0.02em", color: COLORS.ink }}>Background candidates</div>
      <div style={{ fontFamily: FONTS.note, fontSize: 26, color: COLORS.signalBlue, marginBottom: 32 }}>
        {items.length ? `${items.length} candidates — pick winners → backgrounds/` : "no candidates yet — run `cadence art --prompt … --name …`"}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
        {items.map((it) => (
          <div key={it.name} style={{ borderRadius: RADIUS.lg, overflow: "hidden", border: `1px solid ${COLORS.hairline}`, background: COLORS.paperElevated }}>
            <Img src={staticFile(it.file)} style={{ width: "100%", aspectRatio: "16 / 9", objectFit: "cover", display: "block" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 16px" }}>
              <span style={{ fontSize: 18, fontWeight: 600, color: COLORS.ink }}>{it.subject}</span>
              <span style={{ fontFamily: FONTS.mono, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", color: COLORS.textMuted }}>{it.level} · {it.format}</span>
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
