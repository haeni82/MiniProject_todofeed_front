import React, { useState, useEffect } from "react";
import "../css/GameStart.css";

const GameStart = ({ onStart }) => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    // 랭킹 더미 데이터
    const dummyRecords = [
      { score: 12500, date: "25.12.10" },
      { score: 8900, date: "25.12.11" },
      { score: 5400, date: "25.12.12" },
      { score: 1200, date: "25.12.12" },
      { score: 0, date: "-" },
    ];
    setRecords(dummyRecords.slice(0, 5));
  }, []);

  return (
    <div className="server-room-intro-container">
      {/* CRT 모니터 스캔라인 효과 */}
      <div className="scanline-overlay"></div>

      <h1 className="game-title neon-flicker">
        Bug Hunter <br />
        <span className="title-highlight">SYSTEM ACCESS</span>
      </h1>

      <div className="intro-content-box">
        {/* 기록 보드 모니터 */}
        <div className="monitor-screen">
          <h2 className="board-title">SYSTEM_RECORDS_TOP_5</h2>
          <ul className="record-list">
            {records.map((record, index) => (
              <li key={index} className="record-item">
                <span className="rank">RANK 0{index + 1}</span>
                <span className="score">{record.score.toLocaleString()} PTS</span>
                <span className="date">[{record.date}]</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 조작법 안내 모니터 */}
        <div className="monitor-screen instruction-board">
          <h2 className="board-title">조작 방법</h2>
          <div className="record-list">
             <div className="record-item"><span>⬅️ 정상 코드(키보드 왼쪽)</span> <span>보관</span></div>
             <div className="record-item"><span>➡️ 악성 버그(키보드 오른쪽)</span> <span>삭제</span></div>
          </div>
        </div>

        {/* 버튼 그룹 */}
        <div className="button-group-container">
          <button className="cyber-button start-button" onClick={onStart}>
            MISSION START
          </button>
        </div>
      </div>

      <footer className="intro-footer">
        STATUS: WAITING FOR PLAYER INPUT... // KERNEL_INTEGRITY: 99%
      </footer>
    </div>
  );
};

export default GameStart;