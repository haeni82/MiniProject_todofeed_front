import type { Note } from "./game";

export interface Music {
  id: string;
  title: string;
  artist?: string;
  audioPath: string; // 오디오 파일 경로
  notes: Note[]; // 노트 데이터
  bpm?: number; // BPM (선택사항)
  offset?: number; // 오디오 오프셋 (ms, 선택사항)
}

