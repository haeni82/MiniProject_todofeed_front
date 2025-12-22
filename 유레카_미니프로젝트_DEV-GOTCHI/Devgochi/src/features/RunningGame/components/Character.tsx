import { forwardRef } from "react";
import styled, { keyframes, css } from "styled-components";
import spriteImg from "../assets/character-sprite.png";

// ------------------------------ 이미지 정의 ------------------------------
// 이미지에 대한 계산을 하지 않으면 모니터 비율에 따라서 크기가 조정되지 않음
// 모니터 비율에 따라 이미지 크기가 조절되어야함. 또한 캐릭터의 위치는 변해서는 안됨

// 이미지 정보
const ORIGIN_W = 555; // 원본 이미지 전체 너비 (px)
const ORIGIN_H = 75; // 원본 이미지 높이 (px)
const FRAMES = 7; // 총 프레임 수
const CHAR_HEIGHT_VH = 12; // 화면에서 보여질 캐릭터 높이 (화면 높이의 8%)

// 비율 계산
// 전체 이미지 비율 (가로/세로)
const ASPECT_RATIO = ORIGIN_W / ORIGIN_H;
// 1프레임의 너비 비율 (전체비율 / 프레임수)
const FRAME_RATIO = ASPECT_RATIO / FRAMES;
// ------------------------------ 끝 ------------------------------

// ------------------------------ 애니메이션 정의 ------------------------------
// 1. 달리기 애니메이션 정의
// 무한 스크롤 원리, 스프라이트 구현 ( 캐릭터가 달리는 것처럼 보이도록 )
const runAnimation = keyframes`
  from { background-position: 0px; }
  to { background-position: -${CHAR_HEIGHT_VH * ASPECT_RATIO}vh; } /* 전체 이미지 너비만큼 이동 */
`;

// 2. 점프 애니메이션 정의
// transition을 사용하면 쿠키런 같은 점프를 구현할 수 없음.
// top 속성은 성능 저하를 유발하기 때문에 transform으로 접근하는 것이 좋음
const jumpAnimation = keyframes`
  0% { 
    transform: translateY(0);         /* 바닥 */
  }
  40% { 
    transform: translateY(-200px);    /* 정점 (빠르게 올라감) */
    animation-timing-function: ease-out; 
  }
  50% { 
    transform: translateY(-200px);    /* 공중 체류 (잠깐 멈춤) */
  }
  100% { 
    transform: translateY(0);         /* 착지 (가속도 붙으며 내려옴) */
    animation-timing-function: ease-in;
  }
`;

// 3. 무적 상태 애니메이션
const blinkAnimation = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.4; } /* 반투명 */
  100% { opacity: 1; }
`;
// ------------------------------ 끝 ------------------------------

// 캐릭터 스타일 정의
const CharacterDiv = styled.div<{
  $isJumping: boolean;
  $isInvincible: boolean;
}>`
  width: ${CHAR_HEIGHT_VH * FRAME_RATIO}vh; /* 프레임 한 칸의 가로 크기 */
  height: ${CHAR_HEIGHT_VH}vh;
  position: absolute;
  top: ${80 - CHAR_HEIGHT_VH}vh; /* 캐릭터의 위치 */
  left: 15%;
  z-index: 15;

  /* 이미지 테두리에 노란색 네온 효과 적용 */
  filter: drop-shadow(0 0 8px #ffd700) drop-shadow(0 0 16px #ffd700);

  /* 스프라이트 구현
  달리는 모습을 7단계로 쪼개서 하나의 긴 이미지로 만들어서 사용한다. */
  background-image: url(${spriteImg});
  background-size: ${CHAR_HEIGHT_VH * ASPECT_RATIO}vh ${CHAR_HEIGHT_VH}vh; /* 전체 이미지 크기 */
  background-repeat: no-repeat;

  /* 달리기 애니메이션 적용 */
  /* steps(7): 7프레임짜리니까 7단계로 끊어서 보여주기 */
  /* 따라서 하나의 긴 이미지를 7단계로 끊어서 보여주고 다 보여줬다면 runAnimation을 통해 다시 0지점으로 되돌린다. */
  animation: ${runAnimation} 0.7s steps(7) infinite;

  /* 점프 중일 때 처리 */
  ${(props) =>
    props.$isJumping &&
    css`
      animation: ${jumpAnimation} 0.7s;
    `}

  /* 무적 상태일 때 처리 */
  ${(props) =>
    props.$isInvincible &&
    css`
      animation:
        ${runAnimation} 0.4s steps(7) infinite,
        ${blinkAnimation} 0.2s infinite;
      /* 흑백 처리하기 */
      filter: grayscale(100%);
    `}
`;
// ------------------------------ 끝 ------------------------------

interface CharacterProps {
  isJumping: boolean;
  isInvincible: boolean;
}

// forwardRef<참조할태그, Props타입>
const Character = forwardRef<HTMLDivElement, CharacterProps>(
  ({ isJumping, isInvincible }, ref) => {
    return (
      <CharacterDiv
        ref={ref}
        $isJumping={isJumping}
        $isInvincible={isInvincible}
      ></CharacterDiv>
    );
  }
);

export default Character;
