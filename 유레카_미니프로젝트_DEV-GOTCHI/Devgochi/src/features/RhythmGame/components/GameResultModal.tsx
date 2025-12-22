type Props = {
  score: number;
  combo: number;
  bestCombo: number;
  onRestart: () => void;
  onSelectMusic: () => void;
  onGoHome: () => void;
};

export default function GameResultModal({
  score,
  bestCombo,
  onRestart,
  onSelectMusic,
  onGoHome,
}: Props) {
  return (
    <div style={overlayStyle}>
      <div style={modalStyle} className="game-result-box">
        <h2 style={titleStyle}>SYSTEM CLEAR</h2>

        <div style={resultContainerStyle} className="score-report">
          <div style={resultItemStyle} className="score-row">
            <div style={resultLabelStyle}>Score</div>
            <div style={resultValueStyle} className="score-value">
              {score.toLocaleString()}
            </div>
          </div>
          <div style={resultItemStyle} className="score-row">
            <div style={resultLabelStyle}>Best Combo</div>
            <div style={resultValueStyle} className="score-value">
              {bestCombo}
            </div>
          </div>
        </div>

        <div style={buttonGroupStyle}>
          <button
            onClick={onRestart}
            className="game-result-button"
            style={buttonStyle}
          >
            Restart
          </button>
          <button
            onClick={onSelectMusic}
            className="game-result-button"
            style={buttonStyle}
          >
            MUSIC SELECT
          </button>
          <button
            onClick={onGoHome}
            className="game-result-button"
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
  backgroundColor: "#1a1a05",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: "'Courier New', Courier, monospace",
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  backgroundColor: "rgba(20, 20, 0, 0.9)",
  border: "2px solid #ffcc00",
  padding: "40px",
  textAlign: "center",
  boxShadow: "0 0 30px rgba(255, 204, 0, 0.4)",
  maxWidth: "500px",
  width: "90%",
  animation: "shake 0.5s ease-out",
};

const titleStyle: React.CSSProperties = {
  color: "#ffcc00",
  fontSize: "3rem",
  margin: "0 0 30px 0",
  textShadow: "2px 2px 0px #554400",
  letterSpacing: "-2px",
  fontFamily: "inherit",
};

const resultContainerStyle: React.CSSProperties = {
  borderTop: "1px dashed #ffcc00",
  borderBottom: "1px dashed #ffcc00",
  padding: "20px 0",
  marginBottom: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const resultItemStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  color: "#fff",
  fontSize: "1.2rem",
  margin: "10px 0",
};

const resultLabelStyle: React.CSSProperties = {
  fontSize: "1.2rem",
  color: "#fff",
  fontWeight: 600,
};

const resultValueStyle: React.CSSProperties = {
  fontSize: "1.2rem",
  fontWeight: "bold",
  color: "#ffccaa",
};

const buttonGroupStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: "#ffcc00",
  color: "#000",
  border: "none",
  padding: "15px 30px",
  fontSize: "1.2rem",
  fontWeight: "bold",
  fontFamily: "inherit",
  cursor: "pointer",
  boxShadow: "0 0 15px rgba(255, 204, 0, 0.6)",
  transition: "all 0.2s",
};
