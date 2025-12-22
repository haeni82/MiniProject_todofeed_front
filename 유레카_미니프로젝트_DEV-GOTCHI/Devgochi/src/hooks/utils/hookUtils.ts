// utils/levelLogic.ts

export const EXP_LIMITS: Record<number, number> = {
  1: 2000,
  2: 4000,
  3: 6000,
  4: 8000,
  5: 999999, // 만렙 기준
};

export const calculateNewLevelAndExp = (
  currentLevel: number,
  currentExp: number,
  addedExp: number
) => {
  let newLevel = currentLevel;
  let newExp = currentExp + addedExp;

  // 레벨업 조건 체크 (연속 레벨업 가능하도록 while문 사용)
  while (newLevel < 5 && newExp >= EXP_LIMITS[newLevel]) {
    newExp -= EXP_LIMITS[newLevel];
    newLevel += 1;
  }

  // 레벨 5(만렙) 도달 시 경험치가 목표치를 넘지 않도록 제한
  if (newLevel >= 5) {
    newLevel = 5;
    // 만렙 이후 경험치 처리 로직은 서비스 기획에 따라 조절 가능
  }

  return { newLevel, newExp };
};
