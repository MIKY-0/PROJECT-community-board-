import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./PostDetailPage.css";
import { getMockPostDetail } from "../../mockData/mock";

function buildCommentTree(flatComments) {
  const map = new Map();
  const roots = [];

  flatComments.forEach((c) => map.set(c.commentId, { ...c, children: [] }));
  map.forEach((c) => {
    if (c.parentId == null) roots.push(c);
    else {
      const parent = map.get(c.parentId);
      if (parent) parent.children.push(c);
      else roots.push(c);
    }
  });

  return roots;
}

function formatDate(dateStr) {
  return dateStr ?? "-";
}

export default function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const pid = useMemo(() => Number(postId), [postId]);

  const [post, setPost] = useState(() => getMockPostDetail(pid));
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount);

  const [commentInput, setCommentInput] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [replyInput, setReplyInput] = useState("");

  const commentTree = useMemo(() => buildCommentTree(post.comments), [post.comments]);

  const onToggleLike = () => {
    setIsLiked((prev) => {
      const next = !prev;
      setLikeCount((c) => (next ? c + 1 : Math.max(0, c - 1)));
      return next;
    });
  };

  const onAddComment = (e) => {
    e.preventDefault();
    const content = commentInput.trim();
    if (!content) return;

    const newComment = {
      commentId: Date.now(),
      parentId: null,
      nickname: "나(임시)",
      createdAt: new Date().toISOString().slice(0, 10),
      content,
      isDeleted: false,
    };

    setPost((prev) => ({
      ...prev,
      comments: [newComment, ...prev.comments],
      commentCount: prev.commentCount + 1,
    }));
    setCommentInput("");
  };

  const onAddReply = (e) => {
    e.preventDefault();
    const content = replyInput.trim();
    if (!content || replyTo == null) return;

    const newReply = {
      commentId: Date.now(),
      parentId: replyTo,
      nickname: "나(임시)",
      createdAt: new Date().toISOString().slice(0, 10),
      content,
      isDeleted: false,
    };

    setPost((prev) => ({
      ...prev,
      comments: [newReply, ...prev.comments],
      commentCount: prev.commentCount + 1,
    }));
    setReplyInput("");
    setReplyTo(null);
  };

  const onDeleteCommentMock = (commentId) => {
    setPost((prev) => ({
      ...prev,
      comments: prev.comments.map((c) =>
        c.commentId === commentId ? { ...c, isDeleted: true, content: "" } : c
      ),
    }));
  };

  return (
    <div className="postWrap">
      <div className="topBar">
        <button className="backBtn" type="button" onClick={() => navigate(-1)}>
          ← 뒤로
        </button>

        <button className="backBtn" type="button" onClick={() => navigate("/")}>
          목록
        </button>
      </div>

      <header className="postHeader">
        <h1 className="postTitle">{post.title}</h1>

        <div className="postMetaRow">
          <div className="postMetaLeft">
            <div className="author">
              <div className="avatar" aria-hidden />
              <span className="nickname">{post.nickname}</span>
            </div>

            <div className="dates">
              <span className="dateItem">작성: {formatDate(post.createdAt)}</span>
              {post.updatedAt && (
                <span className="dateItem">수정: {formatDate(post.updatedAt)}</span>
              )}
            </div>
          </div>

          <div className="postMetaRight">
            <div className="stats">
              <span className="stat">조회 {post.viewCount}</span>
              <span className="stat">댓글 {post.commentCount}</span>
              <span className="stat">좋아요 {likeCount}</span>
            </div>

            <button
              type="button"
              className={`likeBtn ${isLiked ? "active" : ""}`}
              onClick={onToggleLike}
            >
              {isLiked ? "♥ 좋아요" : "♡ 좋아요"}
            </button>
          </div>
        </div>
      </header>

      <section className="postBody">
        <div className="content">{post.content}</div>
      </section>

      <section className="attachSection">
        <div className="sectionTitle">첨부파일</div>

        {post.attachments.length === 0 ? (
          <div className="emptyBox">첨부파일이 없습니다.</div>
        ) : (
          <ul className="attachList">
            {[...post.attachments]
              .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
              .map((f) => (
                <li key={f.id} className="attachItem">
                  <span className="fileName">{f.originalFileName}</span>
                  <a className="downloadBtn" href={f.fileUrl} target="_blank" rel="noreferrer">
                    다운로드
                  </a>
                </li>
              ))}
          </ul>
        )}
      </section>

      <section className="commentSection">
        <div className="sectionTitle">댓글</div>

        <form className="commentForm" onSubmit={onAddComment}>
          <textarea
            className="commentInput"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="댓글을 입력하세요"
          />
          <button className="commentSubmit" type="submit">
            등록
          </button>
        </form>

        <div className="commentList">
          {commentTree.length === 0 ? (
            <div className="emptyBox">첫 댓글을 작성해보세요.</div>
          ) : (
            commentTree.map((c) => (
              <CommentItem
                key={c.commentId}
                comment={c}
                depth={0}
                replyTo={replyTo}
                setReplyTo={setReplyTo}
                replyInput={replyInput}
                setReplyInput={setReplyInput}
                onAddReply={onAddReply}
                onDelete={onDeleteCommentMock}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function CommentItem({
  comment,
  depth,
  replyTo,
  setReplyTo,
  replyInput,
  setReplyInput,
  onAddReply,
  onDelete,
}) {
  const isReplying = replyTo === comment.commentId;

  return (
    <div className={`commentItem depth-${depth}`}>
      <div className="commentCard">
        <div className="commentTop">
          <div className="commentAuthor">
            <div className="avatar small" aria-hidden />
            <span className="nickname">{comment.nickname}</span>
            <span className="commentDate">{comment.createdAt}</span>
          </div>

          <div className="commentActions">
            <button
              type="button"
              className="linkBtn"
              onClick={() => setReplyTo(isReplying ? null : comment.commentId)}
            >
              답글
            </button>
            <button
              type="button"
              className="linkBtn danger"
              onClick={() => onDelete(comment.commentId)}
            >
              삭제
            </button>
          </div>
        </div>

        <div className={`commentContent ${comment.isDeleted ? "deleted" : ""}`}>
          {comment.isDeleted ? "삭제된 댓글입니다." : comment.content}
        </div>

        {isReplying && (
          <form className="replyForm" onSubmit={onAddReply}>
            <textarea
              className="replyInput"
              value={replyInput}
              onChange={(e) => setReplyInput(e.target.value)}
              placeholder="답글을 입력하세요"
            />
            <div className="replyBtns">
              <button className="replySubmit" type="submit">
                등록
              </button>
              <button className="replyCancel" type="button" onClick={() => setReplyTo(null)}>
                취소
              </button>
            </div>
          </form>
        )}
      </div>

      {comment.children?.length > 0 && (
        <div className="commentChildren">
          {comment.children.map((child) => (
            <CommentItem
              key={child.commentId}
              comment={child}
              depth={Math.min(6, depth + 1)}
              replyTo={replyTo}
              setReplyTo={setReplyTo}
              replyInput={replyInput}
              setReplyInput={setReplyInput}
              onAddReply={onAddReply}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
