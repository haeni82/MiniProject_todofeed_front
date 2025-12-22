import { useState, useRef, useCallback, useEffect } from "react";
import Character from "./components/Character";
import Obstacle from "./components/Obstacle";
// import Item from './components/Item';
import Background from "./components/BackGround";
import wifi3 from "./assets/wifi3.png"; // 꽉 찬 신호
import wifi2 from "./assets/wifi2.png"; // 중간 신호
import wifi1 from "./assets/wifi1.png"; // 약한 신호
import styled from "styled-components";
import { motion } from "framer-motion";

// Props 타입 정의
const wifiImages: Record<number, string> = {
  3: wifi3,
  2: wifi2,
  1: wifi1,
};

interface GamePlayProps {
  onGameOver: (finalScore: number) => void;
}

// 스타일 정의
const GameContainer = styled.div`
  width: 100%;
  height: 100vh;
  position: relative;
  cursor: pointer;
  overflow: hidden;
`;

const UIHeader = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  z-index: 100;
  box-sizing: border-box;
`;

const HeartContainer = styled(motion.img)`
  width: 100px;
  height: auto;
  display: block;
  object-fit: contain;
  filter: drop-shadow(0 0 3px #00ff737e) drop-shadow(0 0 6px #00ff737e);
`;

const ScoreBoard = styled.div`
  font-family: "Galmuri11";
  font-size: 2rem;
  color: white;
`;

// onGameOver로 finalScore 값을 부모로 넘겨줘야함
const GamePlay = ({ onGameOver }: GamePlayProps) => {
  // Character 컴포넌트에 전달할 점프 상태
  const [isJumping, setIsJumping] = useState<boolean>(false);
  // 시각적 효과를 위한 상태 (캐릭터 깜빡임용)
  const [isInvincible, setIsInvincible] = useState<boolean>(false);
  // 점수 표시를 위한 상태
  const [score, setScore] = useState<number>(0);
  // 생명 (3개)를 위한 상태
  const [hearts, setHearts] = useState<number>(3);
  // 게임이 끝났는지 판별하기 위한 상태
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // ref 생성 (부모에서 생성해야지 자식 컴포넌트의 위치를 확인할 수 있음)
  const playerRef = useRef<HTMLDivElement>(null);
  const obstacleRef = useRef<HTMLDivElement>(null);
  // 충돌 감지
  const isHitRef = useRef<boolean>(false);
  // 점수
  const scoreRef = useRef<number>(0);

  // 점프 함수
  const jump = useCallback(() => {
    // 이미 점프 중이면 무시 (이단 점프 방지)
    if (isJumping) return;

    setIsJumping(true);

    // 캐릭터 애니메이션 시간(0.5s)과 똑같이 맞춰서 false로 되돌림
    setTimeout(() => {
      setIsJumping(false);
    }, 500);
  }, [isJumping]); // isJumping이 바뀔 때만 함수 갱신

  // 스페이스바 눌렀을 때 점프하도록 window 객체에 이벤트 리스너 등록하기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault(); // 스페이스바 누르면 화면 스크롤 내려가는 거 막기
        jump();
      }
    };

    // 마운트 될 때 리스너 붙이기
    window.addEventListener("keydown", handleKeyDown);
    // 언마운트 될 때 리스너 떼기 (메모리 누수 방지)
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [jump]); // jump 함수가 바뀌면 리스너도 다시 등록

  // 0.1초 마다 점수 갱신 로직
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      // state 업데이트 (화면 표시용)
      setScore((prev) => prev + 10);
      // ref 업데이트 (게임 로직 참조용) -> 얘는 즉시 바뀜
      scoreRef.current += 10;
    }, 100);
    return () => clearInterval(timer);
  }, [isPlaying]);

  // setInterval 대신 rAF 사용
  useEffect(() => {
    let animationId: number;

    const loop = () => {
      // 충돌 체크 로직
      if (playerRef.current && obstacleRef.current) {
        // 충돌했고, 현재 무적 상태(충돌 중)가 아니라면
        if (
          checkCollision(playerRef.current, obstacleRef.current) &&
          !isHitRef.current
        ) {
          // (1) 중복 충돌 방지
          isHitRef.current = true;

          // (2) 하트 감소 및 게임 오버 체크
          setHearts((prev) => {
            const newHeart = prev - 1;
            if (newHeart <= 0) {
              setIsPlaying(false);
              onGameOver(scoreRef.current); // 최신 점수로 게임 오버 처리
            }
            return newHeart;
          });

          // (3) 무적 효과
          setIsInvincible(true);

          // (4) 1초 뒤 무적 해제
          setTimeout(() => {
            isHitRef.current = false;
            setIsInvincible(false);
          }, 1000);
        }
      }

      // 충돌 여부와 상관없이 게임이 진행 중이면 다음 프레임을 계속 요청해야 함
      if (isPlaying) {
        animationId = requestAnimationFrame(loop);
      }
    };

    // 게임 시작 시 루프 실행
    if (isPlaying) {
      loop();
    }

    // Cleanup: 언마운트되거나 isPlaying이 false가 되면 루프 중단
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, setIsPlaying, onGameOver]); // 의존성 배열 정리

  // 4. 충돌 계산 함수 (타입 지정)
  const checkCollision = (
    playerNode: HTMLDivElement,
    obstacleNode: HTMLDivElement
  ): boolean => {
    const player = playerNode.getBoundingClientRect();
    const obstacle = obstacleNode.getBoundingClientRect();

    return (
      player.right > obstacle.left + 20 &&
      player.left < obstacle.right - 20 &&
      player.bottom > obstacle.top &&
      player.top < obstacle.bottom
    );
  };

  return (
    <GameContainer onClick={jump}>
      <Background /> {/* 배경은 ref 필요 없음 */}
      {/* 스코어와 생명 */}
      <UIHeader>
        <HeartContainer
          key={hearts}
          src={wifiImages[hearts]}
          alt="wifi-signal"
          // 애니메이션 설정
          initial={{
            scale: 1.3,
            x: 0,
            filter: "brightness(2) sepia(1) saturate(5)",
          }}
          animate={{
            scale: 1,
            x: 0,
            filter:
              "drop-shadow(0 0 3px #26ff007d) drop-shadow(0 0 6px #26ff007d)",
          }} // 원래대로
          transition={{ type: "spring", stiffness: 300, damping: 10 }}
          // 흔들리는 효과 (keyframes)
          whileInView={{
            x: [0, -5, 5, -5, 5, 0], // 좌우로 흔들림
            transition: { duration: 0.4 },
          }}
        ></HeartContainer>
        <ScoreBoard>Data: {score}KB</ScoreBoard>
      </UIHeader>
      {/* 캐릭터 */}
      <Character
        ref={playerRef}
        isJumping={isJumping}
        isInvincible={isInvincible}
      />
      {/* 장애물 */}
      <Obstacle ref={obstacleRef} />
      {/*<Item ... /> */}
    </GameContainer>
  );
};

export default GamePlay;
