import React, { useState, useEffect } from "react";
import "./GameLoading.css";

interface GameLoadingProps {
  onLoadComplete: () => void;
}

const GameLoading: React.FC<GameLoadingProps> = ({ onLoadComplete }) => {
  const [progress, setProgress] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);

  // 로딩 중에 보여줄 시스템 로그들
  const systemMessages = [
    "INITIALIZING_SERVER_V8...",
    "CONNECTING_TO_LOCALHOST...",
    "ALLOCATING_MEMORY_BLOCKS...",
    "CHECKING_GPU_ACCELERATION...",
    "LOADING_SPRITES: [DINO_BUG.PNG]...",
    "OPTIMIZING_RENDER_PATH...",
    "BYPASSING_FIREWALL...",
    "ACCESS_GRANTED: ADMIN_MODE",
    "SYSTEM_READY.",
  ];

  useEffect(() => {
    // 0.05초마다 1~3%씩 랜덤하게 게이지가 참
    const timer = setInterval(() => {
      setProgress((prev) => {
        // 랜덤한 속도로 증가
        const increment = Math.random() * 3;
        const nextProgress = prev + increment;

        // 100% 도달 시
        if (nextProgress >= 100) {
          clearInterval(timer);
          return 100;
        }
        return nextProgress;
      });
    }, 50);

    return () => clearInterval(timer);
  }, []);

  // 진행률(progress)에 따라 로그 메시지 추가
  useEffect(() => {
    // 0~100 사이를 메시지 개수만큼 쪼개서 해당 구간 지날 때마다 로그 추가
    const totalSteps = systemMessages.length;
    const currentStep = Math.floor((progress / 100) * totalSteps);

    // 이미 출력된 로그 개수보다 현재 단계가 높으면 새 로그 추가
    if (currentStep > logs.length && currentStep <= totalSteps) {
      setLogs((prev) => [...prev, systemMessages[prev.length]]);
    }

    // 100%가 되고 로그가 다 떴으면 게임 시작 (0.5초 딜레이)
    if (progress >= 100) {
      setTimeout(() => {
        onLoadComplete();
      }, 500);
    }
  }, [progress, logs.length, onLoadComplete, systemMessages]);

  return (
    <div className="loading-container">
      <div className="terminal-window">
        <div className="terminal-header">
          <span className="dot red"></span>
          <span className="dot yellow"></span>
          <span className="dot green"></span>
          <span className="terminal-title">bash --login_server</span>
        </div>

        <div className="terminal-body">
          {logs.map((log, index) => (
            <div key={index} className="log-line">
              <span className="prompt">{">"}</span> {log}
            </div>
          ))}
          {progress < 100 && (
            <div className="log-line active-line">
              <span className="prompt">{">"}</span>{" "}
              <span className="cursor-block">_</span>
            </div>
          )}
        </div>

        <div className="loading-bar-area">
          <div className="loading-text">LOADING... {Math.floor(progress)}%</div>
          <div className="progress-bar-border">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameLoading;
