import { useState, useEffect } from "react";
import { Calendar } from "./ui/calendar";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { CelebrationDialog } from "./CelebrationDialog";

interface Todo {
  todo_id?: number;
  user_email: string;
  content: string;
  is_done: boolean;
  todo_date: string; // "YYYY-MM-DD" 형식
}

export function TodoPage() {
  //Date 타입 또는 undefined를 가질 수 있도록 상태 정의
  const [date, setDate] = useState<Date | undefined>(new Date());
  //모든 할일을 저장하는 상태
  const [allTodos, setAllTodos] = useState<Todo[]>([]);
  //새로운 할일을 저장하는 상태
  const [newTodo, setNewTodo] = useState("");
  //편집 중인 할일 ID 상태
  const [editingId, setEditingId] = useState<number | null>(null);
  //편진 중인 할일 텍스트 상태
  const [editText, setEditText] = useState("");
  //성공 모달 상태
  const [showCelebration, setShowCelebration] = useState(false);
  //로딩 상태
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = "http://localhost:8080";

  //필요한 이유: 새로고침시 모달이 다시 뜨지 않게 하도록, 그러나 성공 모달이 뜬 이후에 할 일이 추가되었을 때 완료하면 모달이 다시 떠야함.
  // localStorage에서 날짜별 완료된 할일 개수를 가져옴
  // const getCompletedCountForDate = (dateString: string): number => {
  //   const stored = localStorage.getItem(`completed_${dateString}`);
  //   return stored ? parseInt(stored) : 0;
  // };

  // localStorage에 날짜별 완료된 할일 개수를 저장
  // const saveCompletedCount = (dateString: string, count: number) => {
  //   localStorage.setItem(`completed_${dateString}`, count.toString());
  // };

  // 날짜를 YYYY-MM-DD 형식으로 포맷팅
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // JWT 토큰에서 사용자 이메일 추출 (간단한 디코딩)
  const getUserEmail = () => {
    const token = localStorage.getItem("authToken");
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.email || payload.id; // JWT에 저장된 이메일 추출
    } catch (e) {
      console.error("토큰 파싱 실패:", e);
      return null;
    }
  };

  // 백엔드에서 모든 할일 가져오기
  const fetchTodos = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/todos`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAllTodos(data);
      } else {
        console.error("할일 목록 조회 실패");
      }
    } catch (error) {
      console.error("API 통신 에러:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 할일 목록 가져오기
  useEffect(() => {
    fetchTodos();
  }, []);

  // 현재 선택된 날짜의 할일만 필터링
  const currentDateString = date ? formatDate(date) : formatDate(new Date());
  const todosForSelectedDate = allTodos.filter(
    (todo) => todo.todo_date === currentDateString
  );
{/*
  useEffect(() => {
    // 현재 선택된 날짜의 할 일중 완료되지 않은 할 일 필터링
    const incompleteTodos = todosForSelectedDate.filter(
      (todo) => !todo.is_done
    );
    
    const currentTotalCount = todosForSelectedDate.length;
    const lastCelebratedCount = getCompletedCountForDate(currentDateString);
    
    // 모든 할일이 완료되었고, 이전에 축하받은 개수보다 많을 때 모달 열기
    // 할 일이 존재하고, 완료하지 않은 할 일이 없으며, 현재 완료한 할 일의 갯수가 lastCelebratedCount 보다 클 때(즉, 새로운 완료 할 일이 있을 때)
    if (todosForSelectedDate.length > 0 && 
        incompleteTodos.length === 0 && 
        currentTotalCount > lastCelebratedCount) {
      setShowCelebration(true); // 축하 모달 열기
      saveCompletedCount(currentDateString, currentTotalCount); // 현재 완료한 할 일 개수 저장
    }
  }, [todosForSelectedDate, currentDateString]);
*/}

useEffect(() => {
  if (isLoading) return; // 로딩 중일 때 실행하지 않기

  const userEmail = getUserEmail();
  if (!userEmail) return; // 유저 없으면 실행 X

  const incompleteTodos = todosForSelectedDate.filter(todo => !todo.is_done);
  const currentTotalCount = todosForSelectedDate.length;

  // 날짜+유저 기준으로 저장/조회
  const key = `completed_${userEmail}_${currentDateString}`;
  const lastCelebratedCount = parseInt(localStorage.getItem(key) || "0");


  if (
    currentTotalCount > 0 &&
    incompleteTodos.length === 0 &&
    currentTotalCount > lastCelebratedCount
  ) {
    setShowCelebration(true);
    localStorage.setItem(key, currentTotalCount.toString()); // 날짜별 유저별로 기록
  }
}, [todosForSelectedDate, currentDateString, isLoading]);




  // 할일 추가
  const addTodo = async () => {
    if (!newTodo.trim()) return;

    const token = localStorage.getItem("authToken");
    const userEmail = getUserEmail();
    
    if (!token || !userEmail) {
      alert("로그인이 필요합니다.");
      return;
    }

    const newTodoItem = {
      user_email: userEmail,
      content: newTodo,
      is_done: false,
      todo_date: currentDateString,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/todos`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTodoItem),
      });

      if (response.ok) {
        setNewTodo("");
        await fetchTodos(); // 할일 목록 새로고침
      } else {
        alert("할일 추가 실패");
      }
    } catch (error) {
      console.error("API 통신 에러:", error);
      alert("서버와 통신 중 문제가 발생했습니다.");
    }
  };

  // 할일 완료 토글
  const toggleTodo = async (id: number, currentStatus: boolean) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/todos/${id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_done: !currentStatus }),
      });

      if (response.ok) {
        await fetchTodos();
      }
    } catch (error) {
      console.error("API 통신 에러:", error);
    }
  };

  // 할일 삭제
  const deleteTodo = async (id: number) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/todos/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchTodos();
      }
    } catch (error) {
      console.error("API 통신 에러:", error);
    }
  };

  // 할일 수정 시작
  const startEdit = (id: number, text: string) => {
    setEditingId(id);
    setEditText(text);
  };

  // 할일 수정 저장
  const saveEdit = async (id: number) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/todos/${id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: editText }),
      });

      if (response.ok) {
        setEditingId(null);
        setEditText("");
        await fetchTodos();
      }
    } catch (error) {
      console.error("API 통신 에러:", error);
    }
  };

  // 특정 날짜에 할일이 있는지 체크
  const getDatesWithTodos = () => {
    const dates = new Set(allTodos.map((todo) => todo.todo_date));
    return Array.from(dates).map((dateString) => new Date(dateString));
  };

  return (
    <>
      <div className="space-y-6">
        <div className="glass-panel rounded-3xl p-6 shadow-xl">
          <h2 className="mb-4 text-gray-800">Calendar</h2>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-2xl"
              modifiers={{
                hasTodos: getDatesWithTodos(),
              }}
              modifiersClassNames={{
                hasTodos:
                  "font-bold relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-emerald-500 after:rounded-full",
              }}
            />
          </div>
          {date && (
            <p className="mt-4 text-center text-sm text-gray-600">
              Selected: {formatDate(date)}
            </p>
          )}
        </div>

        <div className="glass-panel rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-800">My Tasks</h2>
            <span className="text-sm text-gray-500">
              {formatDate(date || new Date())}
            </span>
          </div>

          <div className="flex gap-3 mb-6">
            <Input
              placeholder="Add a new task..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addTodo()}
              className="glass-panel border-white/40 rounded-xl"
              disabled={isLoading}
            />
            <Button
              onClick={addTodo}
              disabled={isLoading}
              className="bg-gradient-to-r from-mint-300 to-cyan-300 text-white hover:from-mint-400 hover:to-cyan-400 rounded-xl shadow-lg border-0"
              style={{
                background: "linear-gradient(135deg, #a7f3d0 0%, #67e8f9 100%)",
              }}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center text-gray-400 py-8">
              Loading... ⏳
            </div>
          ) : (
            <div className="space-y-3">
              {todosForSelectedDate.map((todo) => (
                <div
                  key={todo.todo_id}
                  className={`glass-panel rounded-xl p-4 shadow-md transition-all ${
                    todo.is_done
                      ? "bg-gradient-to-r from-green-100/50 to-emerald-100/50"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={todo.is_done}
                      onCheckedChange={() => toggleTodo(todo.todo_id!, todo.is_done)}
                      className="border-gray-300"
                    />

                    {editingId === todo.todo_id ? (
                      <Input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && saveEdit(todo.todo_id!)
                        }
                        onBlur={() => saveEdit(todo.todo_id!)}
                        className="flex-1 glass-panel border-white/40 rounded-lg"
                        autoFocus
                      />
                    ) : (
                      <span
                        className={`flex-1 ${
                          todo.is_done
                            ? "line-through text-gray-400"
                            : "text-gray-700"
                        }`}
                      >
                        {todo.content}
                      </span>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(todo.todo_id!, todo.content)}
                        className="p-2 hover:bg-white/50 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTodo(todo.todo_id!)}
                        className="p-2 hover:bg-white/50 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && todosForSelectedDate.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              No tasks for this day. Add one to get started! ✨
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200/50 text-center">
            <p className="text-xs text-gray-500">
              Total tasks: {allTodos.length} | Today:{" "}
              {todosForSelectedDate.length}
              {todosForSelectedDate.length > 0 && (
                <span className="ml-2">
                  (Completed:{" "}
                  {todosForSelectedDate.filter((t) => t.is_done).length}/
                  {todosForSelectedDate.length})
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <CelebrationDialog
        open={showCelebration}
        onClose={() => setShowCelebration(false)}
      />
    </>
  );
}