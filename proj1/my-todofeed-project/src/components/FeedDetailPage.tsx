import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ArrowLeft, Send } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

interface Comment {
  comment_id: number;
  post_id: number;
  user_email: string;
  content: string;
  created_at: string;
}

interface Post {
  post_id: number;
  user_email: string;
  title: string;
  content: string;
  created_at: string;
}

interface FeedDetailPageProps {
  postId: number;
  onBack: () => void;
}

export function FeedDetailPage({ postId, onBack }: FeedDetailPageProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = "http://localhost:8080";

  // 사용자 이메일 추출
  const getUserEmail = () => {
    const token = localStorage.getItem("authToken");
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.email || payload.id;
    } catch (e) {
      console.error("토큰 파싱 실패:", e);
      return null;
    }
  };

  // 사용자명 추출
  const getUsername = (email: string) => {
    return email.split('@')[0];
  };

  // 시간 포맷팅
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // 초 단위

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  // 게시글 상세 조회
  const fetchPost = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPost(data);
      }
    } catch (error) {
      console.error("API 통신 에러:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 댓글 목록 조회
  const fetchComments = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error("API 통신 에러:", error);
    }
  };

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [postId]);

  // 댓글 추가
  const addComment = async () => {
    if (!newComment.trim()) return;

    const token = localStorage.getItem("authToken");
    const userEmail = getUserEmail();
    
    if (!token || !userEmail) {
      alert("로그인이 필요합니다.");
      return;
    }

    const commentData = {
      post_id: postId,
      user_email: userEmail,
      content: newComment,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commentData),
      });

      if (response.ok) {
        setNewComment("");
        await fetchComments();
      } else {
        alert("댓글 작성 실패");
      }
    } catch (error) {
      console.error("API 통신 에러:", error);
      alert("서버와 통신 중 문제가 발생했습니다.");
    }
  };

  if (isLoading || !post) {
    return (
      <div className="text-center text-gray-400 py-8">
        Loading... ⏳
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        onClick={onBack}
        variant="outline"
        className="glass-panel border-white/40 rounded-xl"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Feed
      </Button>

      <div className="glass-panel rounded-3xl p-8 shadow-xl">
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/30">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
              <span>{getUsername(post.user_email)[0].toUpperCase()}</span>
            </div>
            <div>
              <p className="text-gray-800">@{getUsername(post.user_email)}</p>
              <p className="text-gray-500">{formatTime(post.created_at)}</p>
            </div>
          </div>

          <div>
            <h1 className="text-gray-800 mb-4">{post.title}</h1>
            <div className="text-gray-700 whitespace-pre-line leading-relaxed">
              {post.content}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-6 shadow-xl">
        <h3 className="mb-4 text-gray-800">
          Comments ({comments.length})
        </h3>

        <div className="space-y-4 mb-6">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.comment_id}
                  className="glass-panel rounded-xl p-4 shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-200 to-cyan-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs">{getUsername(comment.user_email)[0].toUpperCase()}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-700">@{getUsername(comment.user_email)}</span>
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-500">
                          {formatTime(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-600">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {comments.length === 0 && (
          <div className="text-center text-gray-400 py-8 mb-6">
            No comments yet. Be the first to comment! 💬
          </div>
        )}

        <div className="flex gap-3">
          <Input
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addComment()}
            className="glass-panel border-white/40 rounded-xl"
          />
          <Button
            onClick={addComment}
            className="bg-gradient-to-r from-blue-300 to-cyan-300 text-white hover:from-blue-400 hover:to-cyan-400 rounded-xl shadow-lg border-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}