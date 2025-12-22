import React from "react";
import "../css/ScoreBoard.css";

const ScoreBoard = ({ score, timeLeft, status }) => {
  // 10초 미만 긴박감 상태 확인
  const isCritical = timeLeft > 0 && timeLeft < 10;

  return (
    <div className="ScoreBoardContainer">
      {/* 점수 표시 영역 */}
      <div className="ScoreDisplay">점수 : {score}</div>

      {status === "PLAYING" && (
        <div className={`TimerSection ${isCritical ? "danger" : ""}`}>
          <div className="TimerDisplay">남은 시간 : {timeLeft}초</div>
        </div>
      )}
    </div>
  );
};

export default ScoreBoard;
