import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./PostDetailPage.css";
import { getMockPostDetail } from "../../mockData/mock";

function commentAll(flatComments) {
  const map = new Map();
  const roots = [];

  flatComments.forEach( c => map.set(c.commentId , { ...c, children : [] })); // map에 데이터들 등록.
  map.forEach( c => { // map 돌면서
    if (c.parentId == null) roots.push(c); // 부모가 없으면 얘는 최상위댓글로 등록.
    else { // 부모가 있으면
      const parent = map.get(c.parentId); // 그 부모의 id를 가져옴.
      if (parent) parent.children.push(c); // 부모id가 실제 존재하면 대댓글로 등록.
      else roots.push(c); // 부모id는 있는데 실제 존재하지않으면 -> 비정상 데이터라는말 -> 그럼 얘를 부모로 등록.
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
  const pid = useMemo( () => Number(postId) , [postId]); // postId의 변환이 있을때 시행. -> 여기서 성능 최적화보단 postId변화에만 
  // 시행하겠다는 의도를 나타내려고. 
  const [post, setPost] = useState( () => getMockPostDetail(pid)); // 초기값만 설정.

  // 좋아요는 자주 조작되므로 state로 따로 저장해서 관리. 
  const [like, setLike] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState( () => Number(post.likeCount) || 0);

  // 댓글입력.
  const [commentInput, setCommentInput] = useState("");

  // 대댓글모드.
  const [replyTo, setReplyTo] = useState(null);

  // 대댓글 입력.
  const [replyInput, setReplyInput] = useState("");

  const commentList = useMemo(() => commentAll(post.comments) , [post.comments]);

  const handleClickLike = () => { // 좋아요 클릭했을때.
    setLike( prev => { // 이전값을 들고와서(내가 좋아요가 눌린 상태인지 , 눌려있지 않은 상태인지를 가져옴.)
      const next = !prev;  // 좋아요가 눌려있었다면(true) false로 , 안눌려있었다면(false) true로 변환.
      setLikeCount( c => (next ? c + 1 : Math.max(0 , c - 1))); // true면 좋아요수 +1 , false면 -1.
      return next; // 이 결과를 새로 저장.
    });
  };

  const handleAddComment = e => {
    e.preventDefault();
    const content = commentInput.trim(); // 공백만 있는 댓글은 등록 안하는 규칙.
    if (!content) return; // content가 빈문자열이면 무시(return)

    const newComment = { // 새댓글.(임시)
      commentId : Date.now(), // 임시id.
      parentId : null,
      nickname : "나",
      createdAt : new Date().toISOString().slice(0, 10) , content,
      isDeleted : false,
    };

    setPost( prev => ({ // 새댓글 , 댓글 수만 등록.
      ...prev,
      //push나 unshift 안쓰는 이유 : 배열을 직접 수정해버리면 배열의 주소값은 그대로. -> react가 변경을 감지 못하고 버그 생길 가능성.
      // 그래서 새 배열을 만들어서 이전 주소값이 아닌 새로 생성된 주소값으로 인해 react가 변경을 감지. -> 갱신.
      comments : [newComment , ...prev.comments], // 최신댓글을 제일 앞으로. 
      commentCount : prev.commentCount + 1,
    }));
    setCommentInput(""); // 댓글 입력하고 등록했으면 다시 댓글입력창을 비워줌.
  };

  const handleAddReply = e => {
    e.preventDefault();
    const content = replyInput.trim();
    if (!content || replyTo == null) return; // 입력한 대댓글이 빈문자열 || 대댓글 대상(replyTo)이 없으면 무시.(return)

    const newReply = { // 새 대댓글.(임시)
      commentId : Date.now(),
      parentId : replyTo, // A댓글에 대댓글 달기를 눌렀을때 그 A댓글(부모)의 id가 parentId가 됨. --> replyTo : 어떤 댓글에 대댓글 다는지 알려줌. 
      nickname : "나",
      createdAt : new Date().toISOString().slice(0 , 10) , content,
      isDeleted : false,
    };

    setPost( prev => ({
      ...prev,
      comments : [newReply , ...prev.comments],
      commentCount : prev.commentCount + 1,
    }));
    setReplyInput("");
    setReplyTo(null); // replyTo를 다시 null로 설정해야 대댓글모드가 종료됨. -> 엉뚱한 부모에 대댓글 달리는 이유도 없고 볼 필요 없는 
    // 대댓글들도 안보임.
  };

  const handleDeleteComment = commentId => {
    setPost( prev => ({
      ...prev,
      comments : prev.comments.map( c => // 게시글에 달린 댓글들만 순회.
        c.commentId === commentId ? { ...c , isDeleted : true , content : "" } : c 
      ),
    }));
  };

  return (
    <div className="postPage">
      <div className="topButtons">

        <button className="backBtn" type="button" onClick={ () => navigate("/")}>
          목록으로
        </button>
      </div>

      <header className="postHeader">
        <h1 className="postTitle">{post.title}</h1>

        <div className="postRow">
          <div className="postLeft">
            <div className="author">
              <div className="profile" aria-hidden />
              <span className="nickname">{post.nickname}</span>
            </div>

            <div className="dates">
              <span className="dateItem">작성: {formatDate(post.createdAt)}</span>
              {post.updatedAt && (
                <span className="dateItem">수정: {formatDate(post.updatedAt)}</span>
              )}
            </div>
          </div>

          <div className="postRight">
            <div className="stats">
              <span className="stat">조회 {post.viewCount}</span>
              <span className="stat">댓글 {post.commentCount}</span>
              <span className="stat">좋아요 {likeCount}</span>
            </div>

            <button
              type="button"
              className={`likeBtn ${like ? "active" : ""}`}
              onClick={handleClickLike}
            >
              {like ? "♥ 좋아요" : "♡ 좋아요"}
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
        ) 
        : 
        (
          <ul className="attachList">
            {[...post.attachments]
              .sort( (a , b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
              .map( f => (
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

        <form className="commentForm" onSubmit={handleAddComment}>
          <textarea
            className="commentInput"
            value={commentInput}
            onChange={ e => setCommentInput(e.target.value)}
            placeholder="댓글을 입력하세요"
          />
          <button className="commentSubmit" type="submit">
            등록
          </button>
        </form>

        <div className="commentList">
          {commentList.length === 0 ? ( // 댓글개수가 0개면?
            <div className="emptyBox">첫 댓글을 작성해보세요.</div>
          ) 
          : 
          ( // 댓글n개가 달려있다면 그 댓글들을 하나씩 꺼내서 n개의 CommentItem으로 생성.
            commentList.map( c => (
              <CommentItem
                key={c.commentId}
                comment={c}
                depth={0}
                replyTo={replyTo}
                setReplyTo={setReplyTo}
                replyInput={replyInput}
                setReplyInput={setReplyInput}
                handleAddReply={handleAddReply}
                handleDeleteComment={handleDeleteComment}
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
  handleAddReply,
  handleDeleteComment,
}) {
  const isReplying = replyTo === comment.commentId;

  return (
    <div className={`commentItem depth-${depth}`}>
      <div className="commentCard">
        <div className="commentTop">
          <div className="commentAuthor">
            <div className="profile small" aria-hidden />
            <span className="nickname">{comment.nickname}</span>
            <span className="commentDate">{comment.createdAt}</span>
          </div>

          <div className="commentActions">
            <button
              type="button"
              className="linkBtn"
              onClick={ () => setReplyTo(isReplying ? null : comment.commentId)}
            >
              답글
            </button>
            <button
              type="button"
              className="linkBtn danger"
              onClick={ () => handleDeleteComment(comment.commentId)}
            >
              삭제
            </button>
          </div>
        </div>

        <div className={`commentContent ${comment.isDeleted ? "deleted" : ""}`}>
          {comment.isDeleted ? "삭제된 댓글입니다." : comment.content}
        </div>

        {isReplying && (
          <form className="replyForm" onSubmit={handleAddReply}>
            <textarea
              className="replyInput"
              value={replyInput}
              onChange={ e => setReplyInput(e.target.value)}
              placeholder="답글을 입력하세요"
            />
            <div className="replyBtns">
              <button className="replySubmit" type="submit">
                등록
              </button>
              <button className="replyCancel" type="button" onClick={ () => setReplyTo(null)}>
                취소
              </button>
            </div>
          </form>
        )}
      </div>

      {comment.children?.length > 0 && (
        <div className="commentChildren">
          {comment.children.map( child => (
            <CommentItem
              key={child.commentId}
              comment={child}
              depth={Math.min(6 , depth + 1)}
              replyTo={replyTo}
              setReplyTo={setReplyTo}
              replyInput={replyInput}
              setReplyInput={setReplyInput}
              handleAddReply={handleAddReply}
              handleDeleteComment={handleDeleteComment}
            />
          ))}
        </div>
      )}
    </div>
  );
}
