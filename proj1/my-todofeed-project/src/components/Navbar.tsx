import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { SignUpModal } from "./SignUpModal";

interface NavbarProps {
  currentPage: "todo" | "feed";
  onNavigate: (page: "todo" | "feed") => void;
}

export function Navbar({ currentPage, onNavigate }: NavbarProps) {
  // 1. 로그인 상태 초기화 (서버 검증 전까지는 false)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  // 2. 컴포넌트 마운트 시 토큰 유효성을 서버에서 검증
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:8080/verify-token', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.msg === 'success') {
            setIsLoggedIn(true);
          } else {
            // 토큰이 유효하지 않으면 삭제
            localStorage.removeItem("authToken");
            setIsLoggedIn(false);
          }
        } else {
          // 401 Unauthorized 등의 에러
          localStorage.removeItem("authToken");
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("토큰 검증 실패:", error);
        localStorage.removeItem("authToken");
        setIsLoggedIn(false);
      }
    };

    verifyToken();
  }, []);

  // 3. 다른 탭/창에서 로그인/로그아웃이 발생했을 때 상태를 동기화
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        // 토큰이 추가되었으면 다시 검증
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // 로그아웃 함수
  const handleLogout = () => {
    if (confirm("정말 로그아웃 하시겠습니까?")) {
      // authToken만 삭제 (유저 완료기록 유지)
      localStorage.removeItem("authToken");
      setIsLoggedIn(false);
      // 필요하면 Todo 페이지로 이동
      // onNavigate("todo");
    }
  };

  const handleAuth = () => {
    if (isLoggedIn) {
      handleLogout(); // 로그인 상태면 로그아웃 처리
    } else {
      setShowSignUp(true); // 비로그인 상태면 로그인/회원가입 모달 열기
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel rounded-b-3xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-300 to-purple-300 flex items-center justify-center shadow-lg">
                <span className="text-white">✨</span>
              </div>
              <span className="text-xl text-gray-800">TodoFEED</span>
            </div>

            <div className="flex items-center gap-6">
              {/* My To-Do 탭 */}
              <button
                onClick={() => onNavigate("todo")}
                className={`px-4 py-2 rounded-xl transition-all ${
                  currentPage === "todo"
                    ? "bg-gradient-to-r from-pink-200 to-purple-200 text-gray-800 shadow-md"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                My To-Do
              </button>
              {/* Feed 탭 */}
              <button
                onClick={() => onNavigate("feed")}
                className={`px-4 py-2 rounded-xl transition-all ${
                  currentPage === "feed"
                    ? "bg-gradient-to-r from-blue-200 to-cyan-200 text-gray-800 shadow-md"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Feed
              </button>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleAuth}
                className="bg-gradient-to-r from-pink-300 to-purple-300 text-white hover:from-pink-400 hover:to-purple-400 rounded-xl shadow-lg border-0"
              >
                {isLoggedIn ? "Logout" : "Sign Up / Login"}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* SignUpModal 컴포넌트 */}
      <SignUpModal
        open={showSignUp}
        onClose={() => setShowSignUp(false)}
        onSuccess={() => {
          // 로그인 성공 시 호출되어 상태 업데이트
          setIsLoggedIn(true);
          setShowSignUp(false);
          // 페이지 새로고침을 통해 To-Do 페이지 등의 인증 상태를 반영하기
          window.location.reload();
        }}
      />
    </>
  );
}