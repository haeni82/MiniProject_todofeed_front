import styled, { keyframes } from "styled-components";
import bg from "../assets/background.png";
import bottomBg from "../assets/background-bottom.png";
import React from "react";

// 1. 애니메이션 (2500px 이동)
// 이렇게 애니메이션을 주면 2500px만큼 이동하고 다시 0지점으로 되돌려 무한 스크롤처럼 보이게 한다.
const moveLoop = keyframes`
  from { background-position: 0 0; }
  to { background-position: -2500px 0; }
`;

// 전체 컨테이너
// 전체적인 크기를 조절한다. position은 relative여야함. 그래야 top, left와 같은게 적용됨
const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100vh; /* 컨테이너는 무조건 화면 꽉 채움 */
  overflow: hidden;
`;

// 2. 뒤쪽 배경 (벽)
// 위치를 고정하고 캐릭터보다 뒤에 있어야하기 때문에 z-index는 1로 지정한다.
const WallLayer = styled.div`
  width: 100%;
  height: 100vh; /* 배경은 화면 높이의 100% */
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;

  background-image: url(${bg});
  background-repeat: repeat-x; // 반복하여 무한 스크롤처럼 보여주기

  /* 가로는 2500px 고정, 세로는 100% (화면 높이에 맞춰 늘어남) */
  background-size: 2500px 100%;

  animation: ${moveLoop} 20s linear infinite; // 위에서 정의한 -2500px하는 애니메이션
`;

// 3. 하단 바닥 (파이프)
const FloorLayer = styled.div`
  width: 100%;

  /* 배경 비율 유지 (26vh) : 원본 이미지를 기준으로 계산, px 값으로 지정하면 모니터 비율에 따라 깨짐 */
  height: 26vh;

  border-top: 3px solid #00ffaa;

  /* 테두리가 26vh 높이 안에 포함되도록 설정 */
  box-sizing: border-box;

  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 10;

  background-image: url(${bottomBg});
  background-repeat: repeat-x;
  background-size: 2500px 100%;

  animation: ${moveLoop} 8s linear infinite;

  /* 테두리 위로 올라오는 그라데이션 효과 */
  &::after {
    content: "";
    position: absolute;

    /* 테두리 바로 위에서 시작하도록 위치 설정 */
    /* top: -40px은 '요소의 윗변'보다 40px 위로 올라간다는 뜻 */
    top: -40px;
    left: 0;
    width: 100%;
    height: 40px;

    background: linear-gradient(
      to top,
      rgba(0, 255, 170, 0.39) 0%,
      rgba(0, 0, 0, 0) 100%
    );
  }
`;

const Background = () => {
  return (
    <Container>
      <WallLayer />
      <FloorLayer />
    </Container>
  );
  0;
};

export default React.memo(Background);

