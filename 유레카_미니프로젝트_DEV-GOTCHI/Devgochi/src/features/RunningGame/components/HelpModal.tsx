import styled, { keyframes } from "styled-components";

const MAIN_CYAN = "#60FFFF";
const NEON_BLUE = "rgba(0, 85, 255, 0.7)";

// --- 애니메이션 ---

// 장애물 이동
const obstacleMove = keyframes`
  0% { left: 100%; }
  50% { left: 25%; }
  100% { left: -30%; }
`;

// 캐릭터 점프
const playerJump = keyframes`
  0% { bottom: 10px; transform: scaleY(1); }
  50% { bottom: 60px; transform: scaleY(0.95); } /* 점프 정점 */
  100% { bottom: 10px; transform: scaleY(1); } /* 착지 */
`;

// 점프 타이밍에 맞춰서 키가 눌림
const keyPress = keyframes`
  0%, 20% { transform: translateY(0); box-shadow: 0 4px 0 #444; }
  25% { transform: translateY(4px); box-shadow: 0 0 0 #444; color: ${MAIN_CYAN}; } /* 눌림 */
  50%, 100% { transform: translateY(0); box-shadow: 0 4px 0 #444; }
`;

// 텍스트 타이핑 효과
const typing = keyframes`
  from { width: 0 }
  to { width: 100% }
`;

const blink = keyframes`
  50% { border-color: transparent }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 200; /* Intro보다 높게 */
`;

// 네온 픽셀 박스
const ModalBox = styled.div`
  position: relative;
  width: 90%;
  max-width: 600px;
  background: rgba(0, 10, 20, 0.95);
  padding: 2rem;
  font-family: "Galmuri11", sans-serif;
  color: #fff;

  /* 박스 테두리 */
  box-shadow:
    -4px 0 0 0 ${MAIN_CYAN},
    4px 0 0 0 ${MAIN_CYAN},
    0 -4px 0 0 ${MAIN_CYAN},
    0 4px 0 0 ${MAIN_CYAN},
    0 0 20px ${NEON_BLUE};

  &::after {
    content: "";
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    box-shadow:
      -4px 0 0 0 ${MAIN_CYAN},
      4px 0 0 0 ${MAIN_CYAN},
      0 -4px 0 0 ${MAIN_CYAN},
      0 4px 0 0 ${MAIN_CYAN};
    z-index: -1;
  }
`;

const Header = styled.h2`
  text-align: center;
  font-size: 2rem;
  color: ${MAIN_CYAN};
  text-shadow: 0 0 10px ${NEON_BLUE};
  margin-bottom: 2rem;
  border-bottom: 2px dashed rgba(96, 255, 255, 0.3);
  padding-bottom: 1rem;
`;

// --- 게임 시뮬레이션 화면 ---
const DemoStage = styled.div`
  width: 100%;
  height: 150px;
  background: #111;
  border: 2px solid #333;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  border-bottom: 4px solid #fff;
`;

const DemoPlayer = styled.div`
  position: absolute;
  left: 20%;
  bottom: 10px;
  width: 40px;
  height: 40px;
  background: #33ccff;
  border-radius: 50% 50% 10% 10%;
  box-shadow: 0 0 10px #33ccff;

  animation: ${playerJump} 2s infinite ease-in-out;

  &::before,
  &::after {
    content: "";
    position: absolute;
    top: 12px;
    width: 6px;
    height: 6px;
    background: #000;
    border-radius: 50%;
  }
  &::before {
    left: 10px;
  }
  &::after {
    right: 10px;
  }
`;

const DemoObstacle = styled.div`
  position: absolute;
  left: 100%; /* 시작은 화면 오른쪽 밖 */
  bottom: 10px;
  width: 30px;
  height: 40px;
  background: #ff4444;
  border: 2px solid #fff;
  box-shadow: 0 0 10px #ff4444;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;

  /* 장애물 이동 애니메이션 반복 (2초 주기 - 플레이어 점프 정점과 싱크) */
  animation: ${obstacleMove} 2s infinite linear;

  &::before,
  &::after {
    content: "";
    width: 80%;
    height: 2px;
    background: rgba(255, 255, 255, 0.5);
  }
`;

// --- [Controls] 키보드 설명 ---
const ControlSection = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 2rem;
`;

const KeyCap = styled.div`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 10px 20px;
  font-family: monospace;
  font-weight: bold;
  font-size: 1.2rem;
  color: #ccc;
  border: 2px solid #666;
  border-radius: 6px;
  border-bottom-width: 6px; /* 입체감 */
  background: #222;
  animation: ${keyPress} 2s infinite;

  span {
    margin-left: 10px;
    font-size: 0.9rem;
    color: #888;
    border: none;
    font-family: "Galmuri11", sans-serif;
  }
`;

const Description = styled.div`
  font-size: 1rem;
  line-height: 1.6;
  color: #ddd;
  text-align: center;

  p {
    margin-bottom: 0.5rem;
    overflow: hidden;
    white-space: nowrap;
    margin: 0 auto;
    letter-spacing: 0.05em;
  }

  .typing-effect {
    animation:
      ${typing} 2.5s steps(20, end),
      ${blink} 0.75s step-end infinite;
    border-right: 3px solid ${MAIN_CYAN};
    width: 100%;
    max-width: fit-content;
  }
`;

const CloseButton = styled.button`
  display: block;
  margin: 2rem auto 0;
  background: transparent;
  color: ${MAIN_CYAN};
  border: 2px solid ${MAIN_CYAN};
  padding: 10px 30px;
  font-family: inherit;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);

  &:hover {
    background: ${MAIN_CYAN};
    color: #000;
    box-shadow: 0 0 15px ${MAIN_CYAN};
  }
`;

interface HelpModalProps {
  onClose: () => void;
}

const GameHelpModal = ({ onClose }: HelpModalProps) => {
  return (
    <Overlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <Header>SYSTEM MANUAL</Header>

        {/* 1. 시뮬레이션 화면 */}
        <DemoStage>
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              fontSize: "0.8rem",
              color: "#666",
            }}
          >
            :: TRAINING_SIMULATION.exe ::
          </div>
          <DemoPlayer />
          <DemoObstacle />
        </DemoStage>

        {/* 2. 조작법 */}
        <ControlSection>
          <div style={{ textAlign: "center" }}>
            <KeyCap>SPACE BAR</KeyCap>
            <div
              style={{
                marginTop: "10px",
                fontSize: "0.9rem",
                color: MAIN_CYAN,
              }}
            >
              JUMP / START
            </div>
          </div>
        </ControlSection>

        {/* 3. 설명 텍스트 */}
        <Description>
          <p className="typing-effect">서버 랙을 회피하여 생존하십시오.</p>

          <p style={{ marginTop: "5px", fontSize: "0.9rem", color: "#888" }}>
            점수가 높을수록 획득 경험치 증가
          </p>
        </Description>

        <CloseButton onClick={onClose}>닫기 (CLOSE)</CloseButton>
      </ModalBox>
    </Overlay>
  );
};

export default GameHelpModal;

