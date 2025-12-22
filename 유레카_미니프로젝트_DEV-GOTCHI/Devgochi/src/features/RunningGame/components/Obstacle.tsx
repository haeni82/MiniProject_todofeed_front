import React, { forwardRef } from "react";
import styled, { keyframes } from "styled-components";
import obstacleImg from "../assets/Obstacle.png";

// ------------------------------ 이미지 정의 ------------------------------
// 이미지에 대한 계산을 하지 않으면 모니터 비율에 따라서 크기가 조정되지 않음
// 모니터 비율에 따라 이미지 크기가 조절되어야함. 또한 캐릭터의 위치는 변해서는 안됨

// 이미지 정보
const ORIGIN_W = 125; // 원본 이미지 전체 너비 (px)
const ORIGIN_H = 80; // 원본 이미지 높이 (px)
const CHAR_HEIGHT_VH = 8; // 화면에서 보여질 높이 (화면 높이의 8%)

// 비율 계산
// 전체 이미지 비율 (가로/세로)
const ASPECT_RATIO = ORIGIN_W / ORIGIN_H;
// ------------------------------ 끝 ------------------------------

// 장애물이 오른쪽 -> 왼쪽으로 이동하는 애니메이션
const slideLeft = keyframes`
  0% { 
    left: 100%; /* 화면 오른쪽 끝에서 시작 */
  }
  100% { 
    left: -100px; /* 화면 왼쪽 끝으로 완전히 사라짐 */
  }
`;

// 장애물 스타일
const ObstacleDiv = styled.div`
  width: ${CHAR_HEIGHT_VH * ASPECT_RATIO}vh;
  height: ${CHAR_HEIGHT_VH}vh;
  position: absolute;
  z-index: 15; /* 바닥(FloorLayer z-index:10)보다 위로 오게 설정 */

  top: ${80 - CHAR_HEIGHT_VH}vh; /* 캐릭터의 위치 */
  left: 100%; /* 초기 위치 */

  background-image: url(${obstacleImg});
  background-size: contain; /* div 크기에 딱 맞게 */
  background-repeat: no-repeat;

  /* 2s: 2초에 한 번씩 지나감 (속도)
    linear: 일정한 속도로 
    infinite: 무한 반복
  */
  animation: ${slideLeft} 2s linear infinite;
`;

// 컴포넌트 정의
// Props가 딱히 필요 없다면 빈 인터페이스나 생략 가능하지만, 두 번째 인자가 ref이기 때문에 _를 사용한다.
// forwardRef 타입 정의를 위해 HTMLDivElement를 명시합니다.
const Obstacle = forwardRef<HTMLDivElement>((_, ref) => {
  return <ObstacleDiv ref={ref}></ObstacleDiv>;
});

// 부모(GamePlay)가 리렌더링되어도 Obstacle은 다시 그려지지 않도록
export default React.memo(Obstacle);

