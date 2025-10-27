import { Dialog, DialogContent } from "./ui/dialog";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { Button } from "./ui/button";

// @react-three/fiber에서 useFrame을 가져오기
import { Canvas, useFrame } from "@react-three/fiber";
// @react-three/drei에서 GLTF와 Environment를 가져오기
import {
  useGLTF,
  Environment,
  ContactShadows,
  OrbitControls,
} from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three"; // THREE.Group 타입을 사용하기 위해

// 🦆 오리 모델 컴포넌트 
function DuckModel() {
  // THREE.Group 객체에 대한 ref를 생성합니다.
  const groupRef = useRef<THREE.Group>(null!);
  const { scene } = useGLTF("/models/cute_duck.glb");

  // 프레임마다 실행되어 오리를 회전시킵니다.
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.x =
        Math.sin(state.clock.elapsedTime * 2) * 0.15; // 좌우 움직임
    }
  });

  // GLTF 모델을 primitive로 렌더링합니다.
  return (
    <primitive
      object={scene}
      ref={groupRef}
      scale={0.2} //크기
      position={[0, -0.5, 0]} //상하, 위아래, 앞뒤
      rotation={[0, 0, 0]} //회전
    />
  );
}

interface CelebrationDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CelebrationDialog({ open, onClose }: CelebrationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-panel border-white/60 max-w-lg text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* 3D 오리모델 */}
          <div className="w-48 h-48 mx-auto relative">
            {/* Canvas 컴포넌트: 3D 렌더링 영역 */}
            <Canvas
              camera={{ position: [0, 0.5, 3], fov: 45 }}
              className="relative w-full h-full"
            >
              {/* 3D 환경 조명 및 배경 */}
              <ambientLight intensity={1.2} />
              <directionalLight position={[3, 5, 2]} intensity={1.5} />
              <Environment preset="sunset" />

              {/* 실제 오리 모델 컴포넌트 */}
              <DuckModel />

              <ContactShadows
                position={[0, -0.8, 0]} // 또는 -1.0
                opacity={0.5}
                scale={10}
                blur={2}
                far={1.5}
              />
              <OrbitControls enableZoom={false} />
            </Canvas>
          </div>
          {/* 3D 오리 모델 영역 끝 */}
          <div className="space-y-3">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-3xl text-gray-800 flex items-center justify-center gap-2">
                <Sparkles className="w-8 h-8 text-yellow-500" />
                정말 잘했어요!
                <Sparkles className="w-8 h-8 text-yellow-500" />
              </h2>
            </motion.div>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-600"
            >
              당신의 모든 할 일을 완료했어요! 오늘 하루를 칭찬해요!🌟
            </motion.p>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex gap-2 justify-center"
          >
            {["🎊", "✨", "🎈", "⭐", "🌈"].map((emoji, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1,
                  delay: i * 0.2,
                }}
                className="text-2xl"
              >
                {emoji}
              </motion.div>
            ))}
          </motion.div>

          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-pink-300 to-purple-300 text-white hover:from-pink-400 hover:to-purple-400 rounded-xl shadow-lg border-0"
          >
            계속 할 일 하러 가기 💪
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
