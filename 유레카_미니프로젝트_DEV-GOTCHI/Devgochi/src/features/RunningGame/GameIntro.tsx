import { useState, useEffect } from "react";
import styled, { css, keyframes } from "styled-components";
import BackGround from "./assets/serverBack.png";
import GameHelpModal from "./components/HelpModal";

// Props 타입 정의
interface GameIntroProps {
  onStart: () => void;
}

// 최고 기록 Top 5 레코드 객체
interface GameRecord {
  score: number;
  date: string;
}

// --- 네온 효과를 주기위한 애니메이션 ---
// 네온 상태에서 깜빡이도록
const textFlicker = keyframes`
  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
    opacity: 1;
    text-shadow: 
      0 0 5px #fff,
      0 0 10px #4DEEEA,
      0 0 20px #4DEEEA,
      0 0 40px #0055FF,
      0 0 80px #0055FF;
  }
  20%, 24%, 55% {
    opacity: 0.1;
    text-shadow: none;
  }
`;

// 박스 테두리 빛이 퍼졌다 줄어들었다 함
const borderPulse = keyframes`
  0% { 
    box-shadow: 
      -4px 0 0 0 #4DEEEA, 4px 0 0 0 #4DEEEA, 
      0 -4px 0 0 #4DEEEA, 0 4px 0 0 #4DEEEA,
      0 0 10px 0 rgba(0, 85, 255, 0.7); 
  }
  50% { 
    box-shadow: 
      -4px 0 0 0 #4DEEEA, 4px 0 0 0 #4DEEEA, 
      0 -4px 0 0 #4DEEEA, 0 4px 0 0 #4DEEEA,
      0 0 40px 10px rgba(0, 85, 255, 0.9); /* 빛이 제일 강하게 퍼짐 */
  }
  100% { 
    box-shadow: 
      -4px 0 0 0 #4DEEEA, 4px 0 0 0 #4DEEEA, 
      0 -4px 0 0 #4DEEEA, 0 4px 0 0 #4DEEEA,
      0 0 10px 0 rgba(0, 85, 255, 0.7); 
  }
`;

// --- Pixel 박스 스타일 ---
const pixelBorderNeon = css`
  position: relative;
  background: rgba(0, 10, 20, 0.6); /* 아주 어두운 남색 배경 */
  margin: 4px;

  /* 숨쉬는 애니메이션 적용 */
  animation: ${borderPulse} 3s infinite ease-in-out;

  /* 모서리 계단 처리  */
  &::after {
    content: "";
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    box-shadow:
      -4px 0 0 0 #4deeea,
      4px 0 0 0 #4deeea,
      0 -4px 0 0 #4deeea,
      0 4px 0 0 #4deeea;
    z-index: -1;
  }
`;

// --- 컴포넌트 스타일 ---

// 컨테이너
const Container = styled.div`
  width: 100vw;
  height: 100vh;

  // 이미지로 배경
  background-image: url(${BackGround});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  // 픽셀 폰트
  font-family: "Galmuri11", sans-serif;
  color: white;
  overflow: hidden;
  position: relative;

  // 배경을 살짝 어둡게 하기
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 0;
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  max-height: 90vh;
  width: 100%;
  max-width: 600px;
`;

const TitleSection = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

// 메인타이틀 => 깜빡임 + 네온 효과 적용
const MainTitle = styled.h1`
  font-size: 3rem;
  margin: 0;
  line-height: 1.2;
  color: #f0ffff;

  /* 깜빡임 애니메이션 */
  animation: ${textFlicker} 4s infinite;

  // 타이틀 두번째줄 강조
  .highlight {
    display: block;
    font-size: 3.5rem;
    margin-top: 0.5rem;
  }
`;

// 점수판 => 픽셀 느낌 박스
const RecordBox = styled.div`
  width: 100%;
  padding: 2rem;
  box-sizing: border-box;
  ${pixelBorderNeon}
`;

const BoxHeader = styled.div`
  border-bottom: 2px dashed #4deeea;
  padding-bottom: 10px;
  margin-bottom: 15px;
  font-size: 1.2rem;
  color: #4deeea;
  text-align: center;
  text-shadow: 0 0 10px rgba(77, 238, 234, 0.5);
`;

const RecordList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const RecordItem = styled.li`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 1.1rem;
  border-bottom: 1px solid rgba(77, 238, 234, 0.2);

  // 마지막 요소는 border 없앰
  &:last-child {
    border: none;
  }

  // 순위 점수 날짜
  span {
    display: inline-block;
  }
  .rank {
    color: #ffd700;
    width: 100px;
  }
  .score {
    text-align: right;
    flex: 1;
    margin-right: 15px;
  }
  .date {
    color: #888;
    font-size: 0.9rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1.5rem;
  width: 100%;
  justify-content: center;
`;

const PixelButton = styled.button<{ $primary?: boolean }>`
  font-family: "Galmuri11", sans-serif;
  font-size: 1.2rem;
  background: ${(props) =>
    props.$primary ? "rgba(255, 107, 107, 0.1)" : "rgba(77, 238, 234, 0.1)"};
  color: ${(props) => (props.$primary ? "#FF6B6B" : "#4DEEEA")};
  border: 2px solid ${(props) => (props.$primary ? "#FF6B6B" : "#4DEEEA")};
  padding: 15px 30px;
  cursor: pointer;
  position: relative;

  box-shadow:
    inset 0 0 10px
      ${(props) =>
        props.$primary
          ? "rgba(255, 107, 107, 0.3)"
          : "rgba(77, 238, 234, 0.3)"},
    0 0 10px rgba(0, 0, 0, 0.5);
  text-shadow: 0 0 5px
    ${(props) =>
      props.$primary ? "rgba(255, 107, 107, 0.5)" : "rgba(77, 238, 234, 0.5)"};

  transition: all 0.1s;

  &:hover {
    transform: translate(-2px, -2px);
    background: ${(props) => (props.$primary ? "#FF6B6B" : "#4DEEEA")};
    color: #000;
    text-shadow: none;
    box-shadow:
      0 0 20px ${(props) => (props.$primary ? "#FF6B6B" : "#4DEEEA")},
      4px 4px 0px 0px #000;
  }

  &:active {
    transform: translate(2px, 2px);
    box-shadow: none;
  }
`;

const Footer = styled.div`
  position: absolute;
  bottom: 20px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  z-index: 10;
  text-align: center;
`;

// --- 3. Component ---

const GameIntro = ({ onStart }: GameIntroProps) => {
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  useEffect(() => {
    setRecords([
      { score: 12500, date: "23.12.10" },
      { score: 8900, date: "23.12.11" },
      { score: 5400, date: "23.12.12" },
      { score: 1200, date: "23.12.12" },
      { score: 0, date: "-" },
    ]);
  }, []);

  return (
    <Container>
      <ContentWrapper>
        {/* 타이틀 영역 */}
        <TitleSection>
          <MainTitle>
            SERVER ROOM
            <br />
            <span className="highlight">RUNNING MAN</span>
          </MainTitle>
        </TitleSection>

        {/* 픽셀 테두리가 적용된 기록 박스 */}
        <RecordBox>
          <BoxHeader>SYSTEM_RECORDS_TOP_5</BoxHeader>
          <RecordList>
            {records.map((record, index) => (
              <RecordItem key={index}>
                <span className="rank">RANK 0{index + 1}</span>
                <span className="score">
                  {record.score.toLocaleString()} PTS
                </span>
                <span className="date">[{record.date}]</span>
              </RecordItem>
            ))}
          </RecordList>
        </RecordBox>

        {/* 버튼 영역 */}
        <ButtonGroup>
          <PixelButton onClick={() => setIsHelpOpen(true)}>
            SYSTEM HELP
          </PixelButton>
          <PixelButton $primary onClick={onStart}>
            MISSION START
          </PixelButton>
        </ButtonGroup>

        {isHelpOpen && <GameHelpModal onClose={() => setIsHelpOpen(false)} />}
      </ContentWrapper>

      <Footer>PRESS START BUTTON TO CONNECT SERVER...</Footer>
    </Container>
  );
};

export default GameIntro;

