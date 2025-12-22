import type { Music } from "../types/music";

type Props = {
  musics: Music[];
  onSelect: (music: Music) => void;
  onGoHome: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
};

export default function MusicSelect({
  musics,
  onSelect,
  onGoHome,
  speed,
  onSpeedChange,
}: Props) {
  const speedOptions = [1.0, 1.5, 2.0, 3.0, 4.0];

  return (
    <div className="server-room-intro-container">
      {/* CRT 스캔라인 효과 */}
      <div className="scanline-overlay" />

      {/* 게임 제목 */}
      <h1 className="game-title neon-flicker">
        <span className="title-highlight" style={{ fontSize: "3.5rem" }}>
          RHYTHM CODE<span className="music-note-pink">🎵</span>
        </span>{" "}
        <br /> MUSIC SELECT
      </h1>

      {/* 컨텐츠 박스 */}
      <div className="intro-content-box">
        {/* 배속 선택 모니터 */}
        <div className="monitor-screen">
          <div className="board-title">NOTE SPEED SETTING</div>
          <div style={speedButtonsStyle}>
            {speedOptions.map((option) => (
              <button
                key={option}
                onClick={() => onSpeedChange(option)}
                className={`cyber-button help-button ${
                  speed === option ? "speed-button-active" : ""
                }`}
              >
                {option}x
              </button>
            ))}
          </div>
        </div>

        {/* 음악 목록 모니터 */}
        <div className="monitor-screen" style={{ minWidth: "500px" }}>
          <div className="board-title">MUSIC LIST</div>
          {musics.length === 0 ? (
            <div className="no-record">등록된 음악이 없습니다</div>
          ) : (
            <ul className="record-list">
              {musics.map((music) => (
                <li
                  key={music.id}
                  className="record-item"
                  onClick={() => onSelect(music)}
                >
                  <div>
                    <span style={{ color: "#ffcc00", fontWeight: "bold" }}>
                      {music.title}
                    </span>
                    {music.artist && (
                      <span
                        style={{
                          color: "#fff",
                          fontWeight: "bold",
                          marginLeft: "10px",
                        }}
                      >
                        - {music.artist}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="date">
                      NOTE: {music.notes.length}
                      {music.bpm && ` • BPM: ${music.bpm}`}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 버튼 그룹 */}
        <div className="button-group-container">
          <button onClick={onGoHome} className="cyber-button start-button">
            HOME
          </button>
        </div>
      </div>

      {/* 푸터 */}
      <div className="intro-footer">
        RHYTHM GAME v1.0 Ureca Frontend developer fighting!
      </div>
    </div>
  );
}

const speedButtonsStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
  justifyContent: "center",
  flexWrap: "wrap",
};
