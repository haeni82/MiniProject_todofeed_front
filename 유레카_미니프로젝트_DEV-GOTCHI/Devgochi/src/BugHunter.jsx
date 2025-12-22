import React, { useState, useEffect } from "react";
// 컴포넌트 임포트
import SortItem from "./components/SortItem.jsx";
import ScoreBoard from "./components/ScoreBoard.jsx";
import GameOver from "./components/GameOver.jsx";
import GameStart from "./components/GameStart.jsx";
import GameLoading from "./components/GameLoading.jsx";
import Decoration from "./components/Decoration.jsx";
// 설정 및 자원 임포트
import { GAME_CONFIG, getStaticY } from "./constants.js";
import "./CSS/BugHunter.css";
import BackgroundImage from "./images/rail_background.png";

// ID 생성을 위한 전역 변수
let nextId = 0;

const BugHunter = () => {
  // [상태 관리]
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState("READY"); // READY, LOADING, PLAYING, GameOver
  const [characters, setCharacters] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [isPausedForGameOver, setIsPausedForGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  // 로딩 화면으로 진입
  const handleStartButtonClick = () => {
    setStatus("LOADING");
  };

  // 실제 게임 데이터 초기화 및 시작 
  const startGameAfterLoading = () => {
    setScore(0);
    setIsPausedForGameOver(false);
    setFeedback(null);
    setTimeLeft(60);

    const initialCharacters = Array.from({ length: 15 }, (_, index) => ({
      id: nextId++,
      type: Math.random() < 0.5 ? "정상코드" : "버그",
      x: GAME_CONFIG.RAIL_CENTER_X,
      y: getStaticY(index),
    }));

    setCharacters(initialCharacters);
    setStatus("PLAYING");
  };

  const endGame = () => setStatus("GameOver");

  //  타이머 로직: PLAYING일 때만 초당 1씩 감소
  useEffect(() => {
    if (status !== "PLAYING") return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [status]);

  // 피드백 효과: 정답/오답 테두리 반짝임 처리
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 500);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  //  오답 처리: 틀렸을 때 2초간 멈춤 효과 후 게임오버 전환
  useEffect(() => {
    if (isPausedForGameOver) {
      const timer = setTimeout(() => {
        endGame();
        setIsPausedForGameOver(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isPausedForGameOver]);

  //  키보드 입력 판정
  useEffect(() => {
    if (status !== "PLAYING" || isPausedForGameOver) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        const target = characters[0];
        const isCorrect =
          (e.key === "ArrowLeft" && target.type === "정상코드") ||
          (e.key === "ArrowRight" && target.type === "버그");

        if (isCorrect) {
          setScore((s) => s + 10);
          setFeedback("correct");
          setCharacters((prev) => {
            const remaining = prev
              .slice(1)
              .map((c, i) => ({ ...c, y: getStaticY(i) }));
            const newChar = {
              id: nextId++,
              type: Math.random() < 0.5 ? "정상코드" : "버그",
              x: GAME_CONFIG.RAIL_CENTER_X,
              y: getStaticY(remaining.length),
            };
            return [...remaining, newChar];
          });
        } else {
          setFeedback("incorrect");
          setIsPausedForGameOver(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status, characters, isPausedForGameOver]);

  return (
    <div className="BugHunterContainer">
      {/* 배경 장식 요소: 배경 레이어 */}
      <Decoration status={status} />

      {/* 상황별 컴포넌트 렌더링 */}
      
      {/* A. 시작 화면 */}
      {status === "READY" && <GameStart onStart={handleStartButtonClick} />}

      {/* B. 로딩 화면: 로딩 완료 시 startGameAfterLoading 실행 */}
      {status === "LOADING" && (
        <GameLoading onLoadComplete={startGameAfterLoading} />
      )}

      {/* C. 게임 중 상단 UI (점수/타이머) */}
      {status === "PLAYING" && (
        <ScoreBoard score={score} timeLeft={timeLeft} status={status} />
      )}

      {/* D. 게임 플레이 영역 (메인 레일) */}
      {status === "PLAYING" && (
        <div
          className={`PlayArea ${feedback || ""}`}
          style={{ "--bg-image": `url(${BackgroundImage})` }}
        >
          {characters.map((char) => (
            <SortItem
              key={char.id}
              data={char}
              style={{ opacity: isPausedForGameOver ? 0.5 : 1 }}
            />
          ))}
        </div>
      )}

      {/* E. 게임 오버 화면 */}
      {status === "GameOver" && (
        <GameOver score={score} onStart={handleStartButtonClick} />
      )}
    </div>
  );
};

export default BugHunter;