type Props = {
  onResume: () => void;
  onRestart: () => void;
  onSelectMusic: () => void;
  onGoHome: () => void;
};

export default function PauseModal({
  onResume,
  onRestart,
  onSelectMusic,
  onGoHome,
}: Props) {
  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2 style={titleStyle}>SYSTEM STOP</h2>
        <div style={buttonGroupStyle}>
          <button
            onClick={onResume}
            className="pause-modal-button"
            style={buttonStyle}
          >
            CONTINUE
          </button>
          <button
            onClick={onRestart}
            className="pause-modal-button"
            style={buttonStyle}
          >
            Restart
          </button>
          <button
            onClick={onSelectMusic}
            className="pause-modal-button"
            style={buttonStyle}
          >
            MUSIC SELECT
          </button>
          <button
            onClick={onGoHome}
            className="pause-modal-button"
            style={buttonStyle}
          >
            HOME
          </button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: "100%",
  height: "100vh",
  backgroundColor: "#1a0505",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: "'Courier New', Courier, monospace",
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  backgroundColor: "rgba(20, 0, 0, 0.9)",
  border: "2px solid #ff3333",
  padding: "40px",
  textAlign: "center",
  boxShadow: "0 0 30px rgba(255, 51, 51, 0.4)",
  maxWidth: "500px",
  width: "90%",
  animation: "shake 0.5s ease-out",
};

const titleStyle: React.CSSProperties = {
  color: "#ff3333",
  fontSize: "3rem",
  margin: "0 0 30px 0",
  textShadow: "2px 2px 0px #550000",
  letterSpacing: "-2px",
  fontFamily: "inherit",
};

const buttonGroupStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: "#ff3333",
  color: "#000",
  border: "none",
  padding: "15px 30px",
  fontSize: "1.2rem",
  fontWeight: "bold",
  fontFamily: "inherit",
  cursor: "pointer",
  boxShadow: "0 0 15px rgba(255, 51, 51, 0.6)",
  transition: "all 0.2s",
};
