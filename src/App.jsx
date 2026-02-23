import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import PostDetailPage from "./board-project/pages/PostDetailPage/PostDetailPage";
import BoardListPage from "./board-project/pages/BoardListPage/BoardListPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 메인(목록) */}
        <Route path="/" element={<BoardListPage />} />

        {/* 상세 */}
        <Route path="/posts/:postId" element={<PostDetailPage />} />

        {/* (옵션) 글쓰기: 아직 안 만들었으면 임시로 목록으로 보내기 */}
        <Route path="/posts/new" element={<Navigate to="/" replace />} />

        {/* 그 외 경로: 모두 목록으로 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
