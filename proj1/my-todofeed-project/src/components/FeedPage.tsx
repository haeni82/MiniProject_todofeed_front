import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { MessageCircle, PenSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";

interface Post {
  post_id: number;
  user_email: string;
  title: string;
  content: string;
  created_at?: string;
  commentCount?: number;
}

interface FeedPageProps {
  onViewPost: (postId: number) => void;
}

export function FeedPage({ onViewPost }: FeedPageProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
  });
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

  // 모든 게시글 가져오기
  const fetchPosts = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      } else {
        console.error("게시글 목록 조회 실패");
      }
    } catch (error) {
      console.error("API 통신 에러:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // 게시글 작성
  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    const token = localStorage.getItem("authToken");
    const userEmail = getUserEmail();
    
    if (!token || !userEmail) {
      alert("로그인이 필요합니다.");
      return;
    }

    const postData = {
      user_email: userEmail,
      title: newPost.title,
      content: newPost.content,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        setNewPost({ title: "", content: "" });
        setShowNewPost(false);
        await fetchPosts();
      } else {
        alert("게시글 작성 실패");
      }
    } catch (error) {
      console.error("API 통신 에러:", error);
      alert("서버와 통신 중 문제가 발생했습니다.");
    }
  };

  // 게시글 미리보기 생성
  const getPreview = (content: string) => {
    return content.length > 100 ? content.substring(0, 100) + "..." : content;
  };

  // 사용자명 추출 (이메일에서)
  const getUsername = (email: string) => {
    return email.split('@')[0];
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-gray-800">Community Feed</h2>
          <Button
            onClick={() => setShowNewPost(true)}
            className="bg-gradient-to-r from-blue-300 to-cyan-300 text-white hover:from-blue-400 hover:to-cyan-400 rounded-xl shadow-lg border-0"
          >
            <PenSquare className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center text-gray-400 py-8">
            Loading... ⏳
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card
                key={post.post_id}
                className="glass-panel border-white/60 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105"
                onClick={() => onViewPost(post.post_id)}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
                      <span className="text-sm">{getUsername(post.user_email)[0].toUpperCase()}</span>
                    </div>
                    <span className="text-gray-600">@{getUsername(post.user_email)}</span>
                  </div>

                  <h3 className="text-gray-800">{post.title}</h3>

                  <p className="text-gray-600 line-clamp-3">{getPreview(post.content)}</p>

                  <div className="flex items-center gap-2 text-gray-500 pt-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.commentCount || 0} comments</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && posts.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            No posts yet. Be the first to share! ✨
          </div>
        )}
      </div>

      <Dialog open={showNewPost} onOpenChange={setShowNewPost}>
        <DialogContent className="glass-panel border-white/60 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter your post title..."
                value={newPost.title}
                onChange={(e) =>
                  setNewPost({ ...newPost, title: e.target.value })
                }
                className="glass-panel border-white/40"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Share your thoughts..."
                value={newPost.content}
                onChange={(e) =>
                  setNewPost({ ...newPost, content: e.target.value })
                }
                className="glass-panel border-white/40 min-h-[200px]"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowNewPost(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreatePost}
                className="bg-gradient-to-r from-blue-300 to-cyan-300 text-white hover:from-blue-400 hover:to-cyan-400 rounded-xl shadow-lg border-0"
              >
                Publish
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}