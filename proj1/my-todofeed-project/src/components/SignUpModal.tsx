import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";

interface SignUpModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SignUpModal({ open, onClose, onSuccess }: SignUpModalProps) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
  });

  const handleSubmit = async (e: React.FormEvent) => { // async 추가
    e.preventDefault();

    // 1. 유효성 검사
    if (isSignUp && formData.password !== formData.confirmPassword) {
      alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    const payload = {
      email: formData.email,
      pw: formData.password,
      name: formData.username, // 회원가입 시에만 필요
    };
    
    // API 엔드포인트 설정: 8080 포트를 명시
    const baseUrl = 'http://localhost:8080';
    const url = isSignUp ? `${baseUrl}/signup` : `${baseUrl}/login`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // 로그인 시에는 name 필드를 제외하고 email, pw만 보내기
        body: JSON.stringify(isSignUp ? payload : { email: payload.email, pw: payload.pw }),
      });

      const data = await response.json();
      
      if (data.msg === 'success') {
        if (isSignUp) {
          alert('회원가입 성공! 이제 로그인해주세요.');
          setIsSignUp(false); // 로그인 폼으로 전환
          // 회원가입 성공 후 폼 초기화
          setFormData({ email: formData.email, password: '', confirmPassword: '', username: formData.username });
        } else {
          // 로그인 성공: JWT 저장 및 상태 업데이트
          if (data.jwt) {
            localStorage.setItem('authToken', data.jwt); 
            alert('로그인 성공!');
            onSuccess(); // Navbar의 setIsLoggedIn(true) 호출
            onClose(); // 모달 닫기
          } else {
            alert('로그인 성공했으나 JWT를 받지 못했습니다.');
          }
        }
      } else {
        // 백엔드에서 온 에러 메시지 표시 (예: "이미 등록된 이메일입니다.")
        alert(`${isSignUp ? "회원가입" : "로그인"} 실패: ${data.msg || "요청 실패"}`);
      }
    } catch (error) {
      console.error('API 통신 에러:', error);
      alert('서버와 통신 중 문제가 발생했습니다.');
    }
  };


  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-panel border-white/60 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="glass-panel border-white/40"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="glass-panel border-white/40"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="glass-panel border-white/40"
              required
            />
          </div>

          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="glass-panel border-white/40"
                required
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-300 to-purple-300 text-white hover:from-pink-400 hover:to-purple-400 rounded-xl shadow-lg border-0"
          >
            {isSignUp ? "Sign Up" : "Login"}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              {isSignUp
                ? "Already have an account? Login"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
