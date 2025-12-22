import React, { useState, useEffect } from "react";
import "../CSS/GameLoading.css";

const GameLoading = ({ onLoadComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + Math.random() * 5;
      });
    }, 50);
    return () => clearInterval(timer);
  }, []);

  // [핵심] progress가 100이 되었을 때 부모의 startGameData를 실행시키는 로직
  useEffect(() => {
    if (progress >= 100) {
      // 0.8초 정도 여유를 주어 사용자가 'SYSTEM READY' 메시지를 볼 시간을 줌
      const delay = setTimeout(() => {
        console.log("로딩 완료! 게임 플레이로 전환합니다.");
        onLoadComplete(); // <--- 여기서 부모의 setStatus("PLAYING")이 실행됨
      }, 800);

      return () => clearTimeout(delay);
    }
  }, [progress, onLoadComplete]);

  return (
    <div className="loading-container">
      {/* 터미널 디자인 및 로딩 바 렌더링... */}
      <div className="loading-text">
        INITIALIZING... {Math.floor(progress)}%
      </div>
      <div className="progress-bar-border">
        <div
          className="progress-bar-fill"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default GameLoading;
