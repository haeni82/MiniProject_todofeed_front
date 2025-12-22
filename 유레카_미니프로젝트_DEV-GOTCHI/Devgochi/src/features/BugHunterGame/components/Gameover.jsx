import React from "react";
import "../css/GameOver.css";

const GameOver = ({ score, onStart }) => {
  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="game-over-container">
      <div className="error-box">
        <h1 className="error-title">시스템 중지</h1>
        <p className="error-code">ERROR_CODE: BUG_OVERLOAD_DETECTION</p>

        {/* 점수판 */}
        <div className="score-report">
          <div className="score-row">
            <span>FINAL_SCORE:</span>
            <span className="score-value">{score.toLocaleString()} Point</span>
          </div>
          <div className="score-row">
            <span>STATUS:</span>
            <span className="score-value">TERMINATED</span>
          </div>
        </div>

        <p className="message">
          모든 시스템 프로세스가 중단되었습니다.
          <br />
          재부팅이 필요합니다.
        </p>

        {/* 버튼 그룹 */}
        <div className="button-group">
          <button className="reboot-button" onClick={onStart}>
            SYSTEM REBOOT
          </button>
          <button className="home-exit-button" onClick={handleGoHome}>
            EXIT TO HOME
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOver;
