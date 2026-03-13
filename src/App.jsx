import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import PostDetailPage from "./board-project/pages/PostDetailPage/PostDetailPage";
import BoardListPage from "./board-project/pages/BoardListPage/BoardListPage";
import PostWritePage from "./board-project/pages/PostWritePage/PostWritePage";
import PostEditPage from "./board-project/pages/PostEditPage/PostEditPage";
import LoginPage from "./board-project/pages/LoginPage/LoginPage";
import SignUpPage from "./board-project/pages/SignUpPage/SignUpPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 메인(목록) */}
        <Route path="/" element={<BoardListPage />} />

        {/* 상세 */}
        <Route path="/posts/:postId" element={<PostDetailPage />} />

        {/* 작성 */}
        <Route path="/posts/new" element={<PostWritePage />} />

        {/* 수정 */}
        <Route path="/posts/:postId/edit" element={<PostEditPage />} />

        {/* 로그인 */}
        <Route path="/login" element={<LoginPage />} />

        {/* 회원가입 */}
        <Route path="/signup" element={<SignUpPage />} />

        {/* 그 외 경로: 모두 목록으로 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
