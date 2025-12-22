// hooks/useCharacter.ts
import { useState, useCallback } from "react";
import { getLocalStorage, setLocalStorage } from "@/shared/localStorage";
import { calculateNewLevelAndExp, EXP_LIMITS } from "@/hooks/utils/hookUtils";

export const useCharacter = () => {
  // 초기값 로드 (함수형 업데이트를 사용하여 초기 1회만 실행)
  const [character, setCharacter] = useState(() => ({
    level: Number(getLocalStorage("level")) || 1,
    exp: Number(getLocalStorage("exp")) || 0,
  }));

  const gainExp = useCallback((amount: number) => {
    setCharacter((prev) => {
      // 1. 새로운 레벨과 경험치 계산
      const { newLevel, newExp } = calculateNewLevelAndExp(
        prev.level,
        prev.exp,
        amount
      );

      // 2. 저장소 업데이트 (사이드 이펙트)
      setLocalStorage("level", newLevel);
      setLocalStorage("exp", newExp);

      // 3. 상태 업데이트
      return { level: newLevel, exp: newExp };
    });
  }, []);

  return {
    level: character.level,
    exp: character.exp,
    maxExp: EXP_LIMITS[character.level], // 현재 레벨의 목표 경험치
    gainExp, // 팀원들이 쓸 함수
    isMaxLevel: character.level === 5,
  };
};
