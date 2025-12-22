type Props = {
  count: number | null;
};

export default function Countdown({ count }: Props) {
  if (count === null) return null;

  return (
    <div style={overlayStyle}>
      <div style={textStyle}>{count}</div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2000,
};

const textStyle: React.CSSProperties = {
  fontSize: 120,
  fontWeight: 900,
  color: "white",
  textShadow: "0 0 20px rgba(255,255,255,0.5)",
};

