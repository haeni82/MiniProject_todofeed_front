import { useState } from "react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { TodoPage } from "./components/TodoPage";
import { FeedPage } from "./components/FeedPage";
import { FeedDetailPage } from "./components/FeedDetailPage";

type PageType = "todo" | "feed" | "feed-detail";

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>("todo");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const handleNavigate = (page: "todo" | "feed") => {
    setCurrentPage(page);
    setSelectedPostId(null);
  };

  const handleViewPost = (postId: string) => {
    setSelectedPostId(postId);
    setCurrentPage("feed-detail");
  };

  const handleBackToFeed = () => {
    setCurrentPage("feed");
    setSelectedPostId(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        currentPage={currentPage === "feed-detail" ? "feed" : currentPage}
        onNavigate={handleNavigate}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 mt-24 mb-8">
        {currentPage === "todo" && <TodoPage />}
        {currentPage === "feed" && <FeedPage onViewPost={handleViewPost} />}
        {currentPage === "feed-detail" && selectedPostId && (
          <FeedDetailPage postId={selectedPostId} onBack={handleBackToFeed} />
        )}
      </main>

      <Footer />
    </div>
  );
}
