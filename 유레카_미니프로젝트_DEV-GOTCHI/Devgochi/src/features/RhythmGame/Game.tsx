import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import type { Judge, Note, LaneIndex } from "./types/game";
import type { Music } from "./types/music";
import { judgeHit, JUDGE_WINDOWS } from "./utils/judge";
import JudgeText from "./components/JudgeText";
import MusicSelect from "./components/MusicSelect";
import PauseModal from "./components/PauseModal";
import Countdown from "./components/Countdown";
import GameResultModal from "./components/GameResultModal";

// 오디오 파일 경로 헬퍼 함수 (Vite에서 src/ 폴더 내 파일을 동적으로 로드)
const getAudioPath = (filename: string): string => {
  return new URL(`./assets/audio/${filename}`, import.meta.url).href;
};

// 이미지 파일 경로 헬퍼 함수
const getImagePath = (filename: string): string => {
  return new URL(`./assets/image/${filename}`, import.meta.url).href;
};

// 노트가 화면 위에서 히트라인까지 내려오는 데 걸리는 시간(연출 속도)
const TRAVEL_MS = 1800;

// 노트 시작 위치
const START_Y = 20;

// 레인 설정
const LANE_COUNT = 4;
const LANE_KEYS: Record<string, LaneIndex> = {
  KeyD: 0,
  KeyF: 1,
  KeyJ: 2,
  KeyK: 3,
};

export default function Game() {
  const navigate = useNavigate();
  const rafId = useRef<number | null>(null);
  const fieldRef = useRef<HTMLDivElement | null>(null);

  // Web Audio API 관련 refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const audioStartTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0); // 일시정지 시점의 오디오 시간

  // 음악 선택 상태
  const [selectedMusic, setSelectedMusic] = useState<Music | null>(null);
  const notes = useMemo(() => selectedMusic?.notes ?? [], [selectedMusic]);

  // 배속 설정 (1.0, 1.5, 2.0, 3.0)
  const [speed, setSpeed] = useState<number>(1.0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);
  const hasStartedRef = useRef<boolean>(false); // 게임이 한 번이라도 시작되었는지 추적
  const [audioEnded, setAudioEnded] = useState(false); // 오디오가 끝났는지 추적

  // 각 레인별로 다음 노트 인덱스 추적
  const [laneIndices, setLaneIndices] = useState<
    [number, number, number, number]
  >([0, 0, 0, 0]);

  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);

  const [lastJudge, setLastJudge] = useState<Judge | null>(null);

  // 각 레인의 빛나는 효과 상태
  const [activeLanes, setActiveLanes] = useState<Set<LaneIndex>>(new Set());

  // 게임 종료 결과 모달 표시 여부
  const [showResultModal, setShowResultModal] = useState(false);

  const [musics, setMusics] = useState<Music[]>([]);

  // JSON 파일에서 음악 데이터 로드
  useEffect(() => {
    const loadMusicsFromJSON = async () => {
      try {
        // assets 폴더에서 모든 JSON 파일 찾기 (동적 import는 제한적이므로 fetch 사용)
        // 대신 특정 JSON 파일들을 직접 로드하거나, 하나의 JSON 파일에 모든 데이터를 넣는 방식 사용
        // 예: musics.json 파일 하나에 모든 음악 데이터를 배열로 저장
        const response = await fetch(
          new URL("./assets/musics.json", import.meta.url).href
        );
        if (response.ok) {
          const data = await response.json();
          // JSON이 배열이면 그대로, 객체면 배열로 변환
          const loadedMusics: Music[] = Array.isArray(data) ? data : [data];

          // audioPath를 올바른 경로로 변환
          const processedMusics = loadedMusics.map((music) => ({
            ...music,
            audioPath: music.audioPath.startsWith("./")
              ? getAudioPath(music.audioPath.replace("./assets/audio/", ""))
              : music.audioPath.startsWith("http") ||
                  music.audioPath.includes("/")
                ? music.audioPath
                : getAudioPath(music.audioPath), // 파일명만 있는 경우 getAudioPath 사용
          }));

          setMusics((prev) => {
            // 기존 음악과 병합 (id 기준으로 중복 제거)
            const merged = [...prev];
            processedMusics.forEach((newMusic) => {
              const index = merged.findIndex((m) => m.id === newMusic.id);
              if (index >= 0) {
                merged[index] = newMusic;
              } else {
                merged.push(newMusic);
              }
            });
            return merged;
          });
        }
      } catch {
        // JSON 파일이 없어도 에러 무시
        console.log("JSON 파일을 로드할 수 없습니다.");
      }
    };

    loadMusicsFromJSON();
  }, []);

  // 각 레인별로 다음 노트 찾기
  const getNextNote = useCallback(
    (lane: LaneIndex): Note | null => {
      const idx = laneIndices[lane];
      const laneNotes = notes.filter((n) => n.lane === lane);
      return laneNotes[idx] ?? null;
    },
    [laneIndices, notes]
  );

  // 게임 종료 조건: 오디오가 끝났을 때 (노트를 다 쳐도 오디오가 끝날 때까지 계속)
  const ended = audioEnded;

  // AudioContext 초기화 (한 번만 생성)
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      )();
    }

    return () => {
      // 컴포넌트 언마운트 시 정리
      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.stop();
        } catch {
          // 이미 정지된 경우 무시
        }
        sourceNodeRef.current = null;
      }
      audioBufferRef.current = null;
      pausedTimeRef.current = 0;
      audioStartTimeRef.current = null;
    };
  }, []);

  // 오디오 파일 로드
  useEffect(() => {
    if (!selectedMusic || !audioContextRef.current) {
      audioBufferRef.current = null;
      return;
    }

    let cancelled = false;

    const loadAudio = async () => {
      try {
        console.log("오디오 로드 시작:", selectedMusic.audioPath);
        const response = await fetch(selectedMusic.audioPath);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        if (cancelled) return;

        const audioBuffer =
          await audioContextRef.current!.decodeAudioData(arrayBuffer);
        if (cancelled) return;

        audioBufferRef.current = audioBuffer;
        console.log("오디오 로드 완료:", audioBuffer.duration, "초");
      } catch (error) {
        console.error("오디오 로드 실패:", error);
        console.error("경로 확인:", selectedMusic.audioPath);
        audioBufferRef.current = null;
      }
    };

    loadAudio();

    return () => {
      cancelled = true;
    };
  }, [selectedMusic]);

  const reset = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setStartTime(null);
    setNowMs(0);
    setLaneIndices([0, 0, 0, 0]);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setLastJudge(null);
    setCountdown(null);
    setAudioEnded(false); // 오디오 종료 플래그 초기화
    setShowResultModal(false); // 결과 모달 닫기
    if (rafId.current) cancelAnimationFrame(rafId.current);
    if (countdownIntervalRef.current)
      clearInterval(countdownIntervalRef.current);

    // Web Audio API 정리
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch {
        // 이미 정지된 경우 무시
      }
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    pausedTimeRef.current = 0;
    audioStartTimeRef.current = null;

    rafId.current = null;
    countdownIntervalRef.current = null;
  };

  const startGame = useCallback(() => {
    // selectedMusic이 없으면 재생 불가
    if (!selectedMusic) {
      console.warn("음악이 선택되지 않았습니다.");
      return;
    }

    // reset() 대신 필요한 것만 초기화 (오디오는 유지)
    setIsPlaying(false);
    setIsPaused(false);
    setStartTime(null);
    setNowMs(0);
    setLaneIndices([0, 0, 0, 0]);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setLastJudge(null);
    setCountdown(null);
    setAudioEnded(false); // 오디오 종료 플래그 초기화
    if (rafId.current) cancelAnimationFrame(rafId.current);
    if (countdownIntervalRef.current)
      clearInterval(countdownIntervalRef.current);

    // Web Audio API 정리 (기존 재생 중지)
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch {
        // 이미 정지된 경우 무시
      }
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    pausedTimeRef.current = 0;
    audioStartTimeRef.current = null;
    rafId.current = null;
    countdownIntervalRef.current = null;

    const t0 = performance.now();
    setStartTime(t0);
    setIsPlaying(true);
    setIsPaused(false);

    // Web Audio API로 오디오 재생 시작
    if (audioContextRef.current && audioBufferRef.current && selectedMusic) {
      const context = audioContextRef.current;

      // AudioContext가 suspended 상태면 resume
      if (context.state === "suspended") {
        context.resume().catch((err) => {
          console.error("AudioContext resume 실패:", err);
        });
      }

      // GainNode 생성 (볼륨 제어용)
      if (!gainNodeRef.current) {
        gainNodeRef.current = context.createGain();
        gainNodeRef.current.connect(context.destination);
      }

      // AudioBufferSourceNode 생성
      const source = context.createBufferSource();
      source.buffer = audioBufferRef.current;
      source.connect(gainNodeRef.current);

      const offset = selectedMusic.offset ?? 0;
      const startOffset = Math.max(0, offset / 1000); // ms를 초로 변환, 음수 방지

      // 오디오 버퍼의 길이 확인
      const bufferDuration = audioBufferRef.current?.duration ?? 0;
      if (startOffset >= bufferDuration) {
        console.warn("시작 오프셋이 버퍼 길이를 초과:", {
          startOffset,
          bufferDuration,
          offset,
        });
        // 버퍼 끝에서 재생하면 즉시 종료되므로, 버퍼 길이보다 작게 조정
        return;
      }

      // 오디오 재생 시작
      const startTime = context.currentTime;
      try {
        source.start(startTime, startOffset);
        audioStartTimeRef.current = startTime - startOffset;
        console.log("오디오 재생 시작:", {
          startTime,
          startOffset,
          bufferDuration,
          audioStartTimeRef: audioStartTimeRef.current,
        });
        sourceNodeRef.current = source;

        // 재생 종료 이벤트
        source.onended = () => {
          console.log("오디오 재생 종료");
          sourceNodeRef.current = null;
          setAudioEnded(true); // 오디오 종료 플래그 설정
        };
      } catch (error) {
        console.error("오디오 재생 시작 실패:", error);
      }
    } else {
      console.warn("오디오 재생 불가:", {
        hasContext: !!audioContextRef.current,
        hasBuffer: !!audioBufferRef.current,
        hasMusic: !!selectedMusic,
      });
    }

    const tick = () => {
      rafId.current = requestAnimationFrame(tick);
      // Web Audio API의 currentTime 사용 (오프셋 고려)
      if (
        audioContextRef.current &&
        audioStartTimeRef.current !== null &&
        selectedMusic
      ) {
        const audioTime =
          (audioContextRef.current.currentTime - audioStartTimeRef.current) *
          1000; // 초를 ms로 변환
        const offset = selectedMusic.offset ?? 0;
        setNowMs(audioTime - offset);
      } else {
        setNowMs(performance.now() - t0);
      }
    };
    rafId.current = requestAnimationFrame(tick);
  }, [selectedMusic]);

  const startCountdown = useCallback(() => {
    if (!selectedMusic) {
      console.warn("음악이 선택되지 않아 카운트다운을 시작할 수 없습니다.");
      return;
    }

    setCountdown(3);
    let current = 3;

    countdownIntervalRef.current = window.setInterval(() => {
      current--;
      if (current > 0) {
        setCountdown(current);
      } else {
        setCountdown(null);
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        startGame();
      }
    }, 1000);
  }, [selectedMusic, startGame]);

  const handleMusicSelect = (music: Music) => {
    reset();
    hasStartedRef.current = false; // 새 음악 선택 시 플래그 초기화
    setSelectedMusic(music);
  };

  // 음악 선택 시 자동으로 카운트다운 시작 (한 번만)
  useEffect(() => {
    if (
      selectedMusic &&
      !isPlaying &&
      !countdown &&
      !hasStartedRef.current &&
      !isPaused &&
      !showResultModal // 결과 모달이 표시되지 않았을 때만
    ) {
      // 음악이 선택되고 게임이 시작되지 않았고, 아직 시작한 적이 없고, 일시정지 상태가 아닐 때만 카운트다운 시작
      hasStartedRef.current = true;
      const timer = setTimeout(() => {
        startCountdown();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [
    selectedMusic,
    isPlaying,
    countdown,
    isPaused,
    showResultModal,
    startCountdown,
  ]);

  const backToSelect = () => {
    setSelectedMusic(null);
    reset();
  };

  const pause = useCallback(() => {
    setIsPaused(true);
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }

    // Web Audio API 일시정지
    if (audioContextRef.current && audioStartTimeRef.current !== null) {
      // 현재 오디오 시간 저장
      pausedTimeRef.current =
        (audioContextRef.current.currentTime - audioStartTimeRef.current) *
        1000;

      // SourceNode 정지
      if (sourceNodeRef.current) {
        // onended 이벤트 핸들러 제거 (일시정지 시 게임 종료로 인식되지 않도록)
        sourceNodeRef.current.onended = null;
        try {
          sourceNodeRef.current.stop();
        } catch {
          // 이미 정지된 경우 무시
        }
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      }
    }
  }, []);

  const resume = useCallback(() => {
    if (!selectedMusic || !audioContextRef.current || !audioBufferRef.current) {
      console.warn("재개 불가:", {
        hasMusic: !!selectedMusic,
        hasContext: !!audioContextRef.current,
        hasBuffer: !!audioBufferRef.current,
      });
      return;
    }

    console.log("재개 시작:", {
      pausedTime: pausedTimeRef.current,
      hasSourceNode: !!sourceNodeRef.current,
      isPlaying,
      isPaused,
      audioEnded,
    });

    // 상태 업데이트 (비동기이므로 먼저 호출)
    // 중요한 순서: 먼저 isPaused를 false로, 그 다음 isPlaying을 true로
    setIsPaused(false);
    setIsPlaying(true); // 게임 재개
    // audioEnded를 false로 초기화 (재개 시에는 오디오가 끝나지 않았으므로)
    // 이렇게 하면 ended useEffect가 트리거되지 않음
    setAudioEnded(false);

    // Web Audio API 재개
    const context = audioContextRef.current;
    if (context.state === "suspended") {
      context.resume();
    }

    // GainNode 생성
    if (!gainNodeRef.current) {
      gainNodeRef.current = context.createGain();
      gainNodeRef.current.connect(context.destination);
    }

    // 새 SourceNode 생성하여 일시정지 시점부터 재생
    const source = context.createBufferSource();
    source.buffer = audioBufferRef.current;
    source.connect(gainNodeRef.current);

    const offset = selectedMusic.offset ?? 0;
    // pausedTimeRef.current는 이미 오디오가 재생된 시간(ms, offset 포함)
    // 오디오 버퍼의 시작점부터의 오프셋을 계산하려면 offset을 빼야 함
    // resumeOffset은 오디오 버퍼의 시작점부터의 오프셋(초 단위)
    const resumeOffset = Math.max(0, (pausedTimeRef.current - offset) / 1000);

    // 오디오 버퍼의 길이 확인
    const bufferDuration = audioBufferRef.current?.duration ?? 0;
    if (resumeOffset >= bufferDuration) {
      console.warn("재개 오프셋이 버퍼 길이를 초과:", {
        resumeOffset,
        bufferDuration,
        pausedTime: pausedTimeRef.current,
        offset,
      });
      // 버퍼 끝에서 재생하면 즉시 종료되므로, 버퍼 길이보다 작게 조정
      return;
    }

    const audioStartTime = context.currentTime;
    try {
      source.start(audioStartTime, resumeOffset);
      // audioStartTimeRef는 startGame()과 동일한 방식으로 계산해야 함
      // startGame()에서는: audioStartTimeRef.current = startTime - startOffset;
      // 여기서는: audioStartTimeRef.current = audioStartTime - resumeOffset;
      // 이렇게 하면 nowMs 계산 시 일관성이 유지됨
      audioStartTimeRef.current = audioStartTime - resumeOffset;

      console.log("오디오 재개:", {
        resumeOffset,
        audioStartTime,
        audioStartTimeRef: audioStartTimeRef.current,
        pausedTime: pausedTimeRef.current,
        bufferDuration,
      });

      sourceNodeRef.current = source;

      source.onended = () => {
        sourceNodeRef.current = null;
        setAudioEnded(true); // 오디오 종료 플래그 설정
      };

      // startTime 업데이트 (일시정지 시점의 시간 기준)
      const currentNowMs = pausedTimeRef.current;
      const t0 = performance.now() - currentNowMs;
      setStartTime(t0);

      // requestAnimationFrame 시작 (기존 루프가 있으면 먼저 정리)
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }

      const tick = () => {
        // isPlaying이나 isPaused 상태가 변경되면 루프 중단
        // 하지만 이건 클로저로 캡처되므로 ref를 사용해야 함
        if (!rafId.current) return; // 이미 취소된 경우

        rafId.current = requestAnimationFrame(tick);
        // Web Audio API의 currentTime 사용
        if (
          audioContextRef.current &&
          audioStartTimeRef.current !== null &&
          selectedMusic
        ) {
          const audioTime =
            (audioContextRef.current.currentTime - audioStartTimeRef.current) *
            1000;
          const offset = selectedMusic.offset ?? 0;
          setNowMs(audioTime - offset);
        } else {
          // startTime이 없으면 t0 사용 (클로저로 캡처된 값)
          setNowMs(performance.now() - t0);
        }
      };
      rafId.current = requestAnimationFrame(tick);
      console.log("재개 완료:", {
        rafId: rafId.current,
        audioStartTimeRef: audioStartTimeRef.current,
        resumeOffset,
      });
    } catch (error) {
      console.error("오디오 재개 실패:", error);
    }
  }, [selectedMusic, audioEnded, isPaused, isPlaying]);

  const restart = () => {
    reset();
    hasStartedRef.current = false; // 재시작 시 플래그 초기화
    startCountdown();
  };

  const goHome = () => {
    reset();
    navigate("/");
  };

  const applyJudge = (judge: Judge) => {
    setLastJudge(judge);

    if (judge === "Perfect") {
      setScore((s) => s + 100);
      setCombo((c) => {
        const nc = c + 1;
        setBestCombo((b) => Math.max(b, nc));
        return nc;
      });
      return;
    }

    if (judge === "Good") {
      setScore((s) => s + 60);
      setCombo((c) => {
        const nc = c + 1;
        setBestCombo((b) => Math.max(b, nc));
        return nc;
      });
      return;
    }

    setCombo(0);
  };

  // ✅ 각 레인별 자동 Miss 처리
  useEffect(() => {
    if (!isPlaying || isPaused) return;
    if (ended) return;

    const newIndices: [number, number, number, number] = [...laneIndices] as [
      number,
      number,
      number,
      number,
    ];
    let changed = false;

    for (let lane = 0; lane < LANE_COUNT; lane++) {
      const nextNote = getNextNote(lane as LaneIndex);
      if (nextNote === null) continue;

      const missLine = nextNote.time + JUDGE_WINDOWS.good;
      if (nowMs > missLine) {
        applyJudge("Miss");
        newIndices[lane]++;
        changed = true;
      }
    }

    if (changed) {
      setLaneIndices(newIndices);
    }
  }, [isPlaying, ended, nowMs, laneIndices, isPaused, getNextNote]);

  // ✅ ESC 키로 일시정지
  useEffect(() => {
    // 게임이 시작되지 않았거나 일시정지 중이 아닐 때는 ESC 키 무시
    if (!isPlaying && !isPaused) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        e.preventDefault();
        if (isPaused) {
          resume();
        } else if (isPlaying) {
          pause();
        }
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isPlaying, isPaused, pause, resume]);

  // ✅ DFJK 키 입력 처리
  useEffect(() => {
    if (!isPlaying || isPaused) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const lane = LANE_KEYS[e.code];
      if (lane === undefined) return;
      e.preventDefault();

      // 키 입력 시 레인 빛나는 효과
      setActiveLanes((prev) => new Set([...prev, lane]));
      setTimeout(() => {
        setActiveLanes((prev) => {
          const newSet = new Set(prev);
          newSet.delete(lane);
          return newSet;
        });
      }, 150); // 150ms 후 효과 제거

      if (ended) return;
      if (startTime === null) return;

      const nextNote = getNextNote(lane);
      if (nextNote === null) return;

      // 노트가 화면에 나타났는지 확인 (화면에 보일 때만 처리)
      const travelMs = TRAVEL_MS / speed;
      const appearAt = nextNote.time - travelMs;
      if (nowMs < appearAt) {
        // 노트가 아직 화면에 나타나지 않았으면 무시
        return;
      }

      const { judge } = judgeHit(nowMs, nextNote.time);
      applyJudge(judge);

      setLaneIndices((prev) => {
        const newIndices = [...prev] as [number, number, number, number];
        newIndices[lane]++;
        return newIndices;
      });
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    isPlaying,
    isPaused,
    startTime,
    nowMs,
    ended,
    laneIndices,
    speed,
    getNextNote,
  ]);

  // ✅ 끝나면 정지 및 결과 모달 표시
  useEffect(() => {
    if (!isPlaying) return;
    if (!ended) return;
    if (isPaused) return; // 일시정지 상태에서는 게임 종료로 인식하지 않음

    const id = window.setTimeout(() => {
      setIsPlaying(false);
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = null;
      // Web Audio API 정지
      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.stop();
        } catch {
          // 이미 정지된 경우 무시
        }
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      }
      // 결과 모달 표시
      setShowResultModal(true);
    }, 800);

    return () => window.clearTimeout(id);
  }, [isPlaying, ended, isPaused]);

  // 노트 Y좌표 계산 (배속 적용)
  const getNoteY = (noteTime: number) => {
    const travelMs = TRAVEL_MS / speed; // 배속에 따라 속도 조절
    const appearAt = noteTime - travelMs;
    const t = (nowMs - appearAt) / travelMs; // 0~1
    // 필드 높이의 80% 지점을 히트라인으로 사용
    const fieldHeight = fieldRef.current?.clientHeight || 800;
    const hitY = fieldHeight * 0.8;
    return START_Y + t * (hitY - START_Y);
  };

  // 음악 선택 화면
  if (!selectedMusic) {
    return (
      <MusicSelect
        musics={musics}
        onSelect={handleMusicSelect}
        onGoHome={goHome}
        speed={speed}
        onSpeedChange={setSpeed}
      />
    );
  }

  return (
    <div
      style={{
        textAlign: "center",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundImage: `url(${getImagePath("playBackground.png")})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        overflow: "auto",
      }}
    >
      <Countdown count={countdown} />

      {isPaused && (
        <PauseModal
          onResume={resume}
          onRestart={restart}
          onSelectMusic={backToSelect}
          onGoHome={goHome}
        />
      )}

      {showResultModal && (
        <GameResultModal
          score={score}
          combo={combo}
          bestCombo={bestCombo}
          onRestart={restart}
          onSelectMusic={backToSelect}
          onGoHome={goHome}
        />
      )}

      {/* 좌측 정보 패널 */}
      <div style={infoPanelStyle}>
        {selectedMusic && (
          <>
            <div style={infoItemStyle}>
              <span style={infoLabelStyle}>Title:</span>{" "}
              <span style={infoValueStyle}>{selectedMusic.title}</span>
            </div>
            {selectedMusic.artist && (
              <div style={infoItemStyle}>
                <span style={infoLabelStyle}>Artist:</span>{" "}
                <span style={infoValueStyle}>{selectedMusic.artist}</span>
              </div>
            )}
          </>
        )}
        <div style={infoItemStyle}>
          <span style={infoLabelStyle}>Score:</span>{" "}
          <span style={infoValueStyle}>{score.toLocaleString()}</span>
        </div>
        <div style={infoItemStyle}>
          <span style={infoLabelStyle}>Best Combo:</span>{" "}
          <span style={infoValueStyle}>{bestCombo}</span>
        </div>
      </div>

      {/* ✅ 게임 필드 - 중앙 배치 */}
      <div style={fieldContainerStyle}>
        <div ref={fieldRef} style={fieldStyle}>
          <JudgeText judge={lastJudge} />

          {/* 콤보 표시 - 상단 20% 지점 */}
          {combo > 0 && (
            <div style={comboStyle}>
              <div style={comboNumberStyle}>{combo}</div>
              <div style={comboLabelStyle}>COMBO</div>
            </div>
          )}

          {/* 히트라인 */}
          <div style={hitLineStyle} />

          {/* 4개 레인 */}
          {Array.from({ length: LANE_COUNT }).map((_, laneIdx) => {
            const lane = laneIdx as LaneIndex;
            const laneNotes = notes.filter((n) => n.lane === lane);
            const currentIdx = laneIndices[lane];
            const isActive = activeLanes.has(lane);

            return (
              <div
                key={lane}
                style={{
                  ...laneStyle,
                  left: `${(lane / LANE_COUNT) * 100}%`,
                  width: `${100 / LANE_COUNT}%`,
                  boxShadow: isActive
                    ? "inset 0 0 50px rgba(135, 206, 250, 0.4), 0 0 30px rgba(135, 206, 250, 0.3)"
                    : "none",
                  transition: "box-shadow 0.1s ease-out",
                }}
              >
                {/* 레인 라벨 - 키 이미지 */}
                <div
                  style={{
                    position: "absolute",
                    top: "calc(80% + 5px)",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "60px",
                    height: "60px",
                    backgroundImage: `url(${getImagePath(
                      `lane_${["D", "F", "J", "K"][lane]}key.png`
                    )})`,
                    backgroundSize: "contain",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                />

                {/* 노트 렌더 */}
                {laneNotes.map((note, i) => {
                  // 이미 처리된 노트는 렌더하지 않음
                  if (i < currentIdx) return null;

                  const y = getNoteY(note.time);

                  // 화면 안에 보이는 구간만 그리기
                  const fieldHeight = fieldRef.current?.clientHeight || 800;
                  const hitY = fieldHeight * 0.8;
                  if (y < -30 || y > hitY + 80) return null;

                  const isNext = i === currentIdx;

                  return (
                    <div
                      key={`${note.time}-${lane}-${i}`}
                      style={{
                        ...noteStyle,
                        left: "50%",
                        transform: `translate(-50%, ${y}px)`,
                        opacity: isNext ? 1 : 0.75,
                        backgroundImage: `url(${getNoteImage(lane)})`,
                      }}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const fieldContainerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  width: "100%",
};

const fieldStyle: React.CSSProperties = {
  position: "relative",
  width: "min(420px, 92vw)",
  height: "100vh",
  margin: "0 auto",
  borderRadius: 0,
  border: "1px solid rgba(0,0,0,0.12)",
  backgroundImage: `url(${getImagePath("laneline3.png")})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  overflow: "hidden",
};

const infoPanelStyle: React.CSSProperties = {
  position: "absolute",
  left: "2vw",
  top: "2vh",
  display: "flex",
  flexDirection: "column",
  gap: "1vh",
  zIndex: 100,
  maxWidth: "calc((100vw - min(420px, 92vw)) / 2 - 2vw)",
};

const infoItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  gap: "0.5vw",
  fontSize: "clamp(20px, 3vw, 40px)",
  color: "#fff",
  textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 0, 0, 0.5)",
};

const infoLabelStyle: React.CSSProperties = {
  fontWeight: 700,
  color: "#ffffff",
  textShadow:
    "2px 2px 4px rgba(0, 0, 0, 0.8), 0 0 8px rgba(255, 255, 255, 0.3)",
};

const infoValueStyle: React.CSSProperties = {
  fontWeight: 800,
  color: "#ffffff",
  textShadow:
    "2px 2px 4px rgba(0, 0, 0, 0.8), 0 0 8px rgba(255, 255, 255, 0.3)",
};

const laneStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  bottom: 0,
  backgroundImage: `url(${getImagePath("laneline2.png")})`,
  backgroundSize: "95% 100%",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
};

const hitLineStyle: React.CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  top: "80%",
  height: "4px",
  backgroundColor: "rgba(0, 191, 255, 0.7)",
  boxShadow:
    "0 0 10px rgba(0, 191, 255, 1), " +
    "0 0 20px rgba(0, 191, 255, 0.8), " +
    "0 0 30px rgba(0, 191, 255, 0.6), " +
    "0 0 40px rgba(0, 191, 255, 0.4)",
  zIndex: 10,
  backdropFilter: "blur(1px)",
};

// 레인별 노트 이미지 경로
const getNoteImage = (lane: LaneIndex): string => {
  const noteImages = ["Dnote.png", "Fnote.png", "Jnote.png", "Knote.png"];
  return getImagePath(noteImages[lane]);
};

const noteStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  width: 64,
  height: 64,
  backgroundSize: "contain",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
};

const comboStyle: React.CSSProperties = {
  position: "absolute",
  top: "15%",
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 50,
};

const comboNumberStyle: React.CSSProperties = {
  fontSize: "120px",
  fontWeight: 900,
  color: "rgba(135, 206, 250, 0.5)",
  textShadow:
    "0 0 20px rgba(135, 206, 250, 0.6), " +
    "0 0 40px rgba(135, 206, 250, 0.4), " +
    "0 0 60px rgba(135, 206, 250, 0.3)",
  lineHeight: 1,
  fontFamily: "Arial, sans-serif",
};

const comboLabelStyle: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: 700,
  color: "rgba(135, 206, 250, 0.4)",
  textShadow: "0 0 10px rgba(135, 206, 250, 0.3)",
  letterSpacing: "4px",
  marginTop: "8px",
};
