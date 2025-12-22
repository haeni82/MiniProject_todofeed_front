import type { JudgeResult, Judge } from "../types/game";

export const JUDGE_WINDOWS = {
  perfect: 60,
  good: 140,
} as const;

export function judgeHit(inputMs: number, targetMs: number): JudgeResult {
  const deltaMs = Math.round(inputMs - targetMs);
  const abs = Math.abs(deltaMs);

  let judge: Judge = "Miss";
  if (abs <= JUDGE_WINDOWS.perfect) judge = "Perfect";
  else if (abs <= JUDGE_WINDOWS.good) judge = "Good";

  return { judge, deltaMs };
}
