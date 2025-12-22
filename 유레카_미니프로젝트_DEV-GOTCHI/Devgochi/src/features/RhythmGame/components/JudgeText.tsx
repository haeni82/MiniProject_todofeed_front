import type { Judge } from "../types/game";

type Props = {
  judge: Judge | null;
};

// 이미지 파일 경로 헬퍼 함수
const getImagePath = (filename: string): string => {
  return new URL(`../assets/image/${filename}`, import.meta.url).href;
};

// 판정별 이미지 경로
const getJudgeImage = (judge: Judge): string => {
  const judgeImages: Record<Judge, string> = {
    Perfect: "perpect2.png",
    Good: "good2.png",
    Miss: "miss2.png",
  };
  return getImagePath(judgeImages[judge]);
};

export default function JudgeText({ judge }: Props) {
  if (!judge) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10,
        whiteSpace: "nowrap",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <img
        src={getJudgeImage(judge)}
        alt={judge}
        style={{
          width: "200px",
          height: "auto",
          imageRendering: "pixelated",
          transform:
            judge === "Good" || judge === "Miss" ? "scaleY(0.7)" : "none",
          transformOrigin: "center",
        }}
      />
    </div>
  );
}
