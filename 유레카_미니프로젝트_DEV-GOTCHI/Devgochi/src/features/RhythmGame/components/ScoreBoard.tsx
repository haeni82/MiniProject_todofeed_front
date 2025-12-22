type Props = {
  score: number;
  combo: number;
  bestCombo: number;
};

export default function ScoreBoard({ score, combo, bestCombo }: Props) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        justifyContent: "center",
        marginTop: 10,
      }}
    >
      <Badge label="Score" value={score} />
      <Badge label="Combo" value={combo} />0
      <Badge label="Best" value={bestCombo} />
    </div>
  );
}

function Badge({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        minWidth: 110,
        padding: "10px 12px",
        borderRadius: 14,
        background: "rgba(255,255,255,0.06)",
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.75 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>{value}</div>
    </div>
  );
}
