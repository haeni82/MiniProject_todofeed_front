export type Judge = "Perfect" | "Good" | "Miss";

export interface JudgeResult {
  judge: Judge;
  deltaMs: number;
}

export interface Note {
  time: number; // 노트가 히트라인에 도달해야 하는 시간 (ms)
  lane: 0 | 1 | 2 | 3; // 레인 번호 (0=D, 1=F, 2=J, 3=K)
}

export type LaneIndex = 0 | 1 | 2 | 3;
