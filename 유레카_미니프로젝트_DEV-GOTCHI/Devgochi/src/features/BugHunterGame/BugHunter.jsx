import React, { useState, useEffect, useCallback } from "react";

// 컴포넌트
import SortItem from "./components/SortItem.jsx";
import ScoreBoard from "./components/ScoreBoard.jsx";
import GameOver from "./components/Gameover.jsx";
import GameStart from "./components/GameStart.jsx";
import GameLoading from "./components/GameLoading.jsx";
import Decoration from "./components/Decoration.jsx";

import { GAME_CONFIG, getStaticY } from "./constants.js";
import "./CSS/BugHunter.css";
import BackgroundImage from "./images/rail_background.png";

let nextId = 0;

const BugHunter = () => {
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState("READY");
  const [characters, setCharacters] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  // 점수 팝업 관리를 위한 상태
  const [popups, setPopups] = useState([]);

  const startGameData = useCallback(() => {
    setScore(0);
    setIsPaused(false);
    setFeedback(null);
    setTimeLeft(60);
    setPopups([]);

    const initialCharacters = Array.from({ length: 15 }, (_, index) => ({
      id: nextId++,
      type: Math.random() < 0.5 ? "정상코드" : "버그",
      x: GAME_CONFIG.RAIL_CENTER_X,
      y: getStaticY(index),
    }));

    setCharacters(initialCharacters);
    setStatus("PLAYING");
  }, []);

  const handleStartButton = () => setStatus("LOADING");
  const endGame = () => setStatus("GameOver");

  // 타이머 로직
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

  // 키보드 입력 및 판정 로직
  useEffect(() => {
    if (status !== "PLAYING" || isPaused) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        const target = characters[0];
        if (!target) return;

        const isCorrect =
          (e.key === "ArrowLeft" && target.type === "정상코드") ||
          (e.key === "ArrowRight" && target.type === "버그");

        if (isCorrect) {
          setScore((s) => s + 10);
          setFeedback("correct");

          // 점수 팝업 생성
          const newPopup = { id: Date.now(), text: "+10" };
          setPopups((prev) => [...prev, newPopup]);
          setTimeout(() => {
            setPopups((prev) => prev.filter((p) => p.id !== newPopup.id));
          }, 600);

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
          setIsPaused(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status, characters, isPaused]);

  // 피드백/경직 해제 타이머
  useEffect(() => {
    if (feedback === "correct") {
      const timer = setTimeout(() => setFeedback(null), 500);
      return () => clearTimeout(timer);
    }
    if (feedback === "incorrect" && isPaused) {
      const timer = setTimeout(() => {
        setFeedback(null);
        setIsPaused(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [feedback, isPaused]);

  const isTimeCritical = timeLeft > 0 && timeLeft < 10;

  return (
    <div className="BugHunterContainer">
      <Decoration status={status} />

      {status === "READY" && <GameStart onStart={handleStartButton} />}
      {status === "LOADING" && <GameLoading onLoadComplete={startGameData} />}

      {status === "PLAYING" && (
        <>
          <ScoreBoard
            score={score}
            timeLeft={timeLeft}
            status={status}
            isCritical={isTimeCritical}
          />

          <div
            className={`PlayArea ${feedback || ""} ${isTimeCritical ? "danger-mode" : ""}`}
            style={{ "--bg-image": `url(${BackgroundImage})` }}
          >
            {popups.map((popup) => (
              <div key={popup.id} className="score-popup">
                {popup.text}
              </div>
            ))}

            {characters.map((char) => (
              <SortItem key={char.id} data={char} />
            ))}
          </div>
        </>
      )}

      {status === "GameOver" && (
        <GameOver score={score} onStart={handleStartButton} />
      )}
    </div>
  );
};

export default BugHunter;
