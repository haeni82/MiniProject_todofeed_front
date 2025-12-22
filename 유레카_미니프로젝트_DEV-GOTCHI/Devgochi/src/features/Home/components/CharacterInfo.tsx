import styled from "styled-components";
import { getLocalStorage } from "@/shared/localStorage";
import { EXP_LIMITS } from "@/hooks/utils/hookUtils";

// 1. 스타일 정의
const WindowContainer = styled.div`
  margin: 20px;
  width: 350px;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #ffffff #808080 #808080 #ffffff;
  padding: 2px;
  font-family: "Courier New", Courier, monospace;
`;

const Content = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const LevelText = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: #333;
`;

const ExpSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const ExpLabel = styled.div`
  font-size: 14px;
  font-weight: bold;
`;

const ProgressBarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ProgressBarTrack = styled.div`
  width: 200px;
  height: 20px;
  background: #ffffff;
  border: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  position: relative;
`;

const ProgressFill = styled.div<{ $percent: number }>`
  height: 100%;
  width: ${(props) => props.$percent}%;
  background: #00ff00; /* 초록색 게이지 */
  /* 도트 느낌을 내기 위한 패턴 (선택사항) */
  background-image: linear-gradient(
    90deg,
    transparent 90%,
    rgba(0, 0, 0, 0.1) 90%
  );
  background-size: 20px 100%;
`;

const PercentText = styled.span`
  font-size: 14px;
  font-weight: bold;
`;

// 2. 컴포넌트 본문
const CharacterInfo = () => {
  // 이제 그냥 호출만 해도 '숫자'가 나옵니다.
  const level = getLocalStorage("level");
  const exp = getLocalStorage("exp");

  const maxExp = EXP_LIMITS[level] || 1000;
  const percent = Math.min(Math.round((exp / maxExp) * 100), 100);

  return (
    <WindowContainer>
      {/* ... 타이틀 바 생략 ... */}
      <Content>
        <InfoRow>
          <div style={{ fontSize: "40px" }}>💻</div>
          {/* level이 숫자이므로 padStart를 쓰려면 문자열로 변환만 해주면 됩니다 */}
          <LevelText>LV.{String(level).padStart(2, "0")} PIXEL</LevelText>
        </InfoRow>

        <ExpSection>
          <ProgressBarContainer>
            <ExpLabel>XP BAR:</ExpLabel>
            <ProgressBarTrack>
              <ProgressFill $percent={percent} />
            </ProgressBarTrack>
            <PercentText>{percent}%</PercentText>
          </ProgressBarContainer>
        </ExpSection>
        {/* ... 아이콘 생략 ... */}
      </Content>
    </WindowContainer>
  );
};

export default CharacterInfo;
