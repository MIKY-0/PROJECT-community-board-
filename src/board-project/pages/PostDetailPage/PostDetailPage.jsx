import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./PostDetailPage.css";

function commentAll(flatComments) { // 평평한 댓글간에 부모-자식 댓글 트리구조로 바꿔즈는 함수. 
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
  const pid = Number(postId);
  const [post, setPost] = useState(null); 
  const [loading , setLoading] = useState(false);
  const [error , setError] = useState("");

  // 백엔드에서 댓글 가져오기. + 최신 댓글목록으로 업데이트.
  const loadComments = async () => {
    const res = await fetch(`http://localhost:8080/posts/${pid}/comments`);
    if(!res.ok) throw new Error("댓글 불러오기 실패 : " + res.status);
    const data = await res.json();
    setPost( prev => prev ? ({...prev , comments : data , commentCount : data.length}) : prev);
  }

  // 좋아요는 자주 조작되므로 state로 따로 저장해서 관리. 
  const [like, setLike] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // 댓글입력.
  const [commentInput, setCommentInput] = useState("");

  // 대댓글모드.
  const [replyTo, setReplyTo] = useState(null);

  // 대댓글 입력.
  const [replyInput, setReplyInput] = useState("");

  useEffect( () => {
    const load = async () => {
      setLoading(true);
      setError("");
      try { // 게시글 가져오기 실행.
        // ${pid}떄문에 ``(백틱) 써줘야함. "" 써주면 에러. --> 이거때문에 에러 생겼음.
        const res = await fetch(`http://localhost:8080/posts/${pid}`);
        if(!res.ok) throw new Error("서버 에러 : " + res.status);
        const data = await res.json();
        setPost(data); // 게시글 가져오기.
        await loadComments(); // 그 게시글의 댓글 가져오기.
        setLike(!!data.liked); // truthy(1,"1"...)는 true로 falsy(null,undefined,Nan...)는 false로 강제변환.
        setLikeCount(Number(data.likeCount) || 0); // Number(data.likeCount)가 숫자가 아니거나 이상한 값이면 0으로 안전처리. 
        // 0도 falsy인데 0을 0으로 처리? 이상하니까 전부 Number로 형변환. 
      } catch (e) {
        setError(e.message);
        setPost(null);
      } finally { setLoading(false); }
    };
    load();
  } , [pid]); // pid 바뀔떄마다 실행.

  // post가 null이면 에러 만들지말고 그냥 undefined 반환해서 []로 다시 반환. , post가 객체가 있으면 comments 반환. 
  // 의존성을 post로 한 이유 : 게시글이 댓글도 바뀔 수 있다. -> post가 바뀌면 commentAll함수 재실행. 
  const commentList = useMemo( () => commentAll(post?.comments || []) , [post]);

  const handleClickLike = async () => { // 좋아요 클릭했을때.
    try {
      const method = like ? "DELETE" : "POST"; // like가 true인 상태에서 클릭했으면 false로 변환되니까 DELETE 보냄.

      // method가 DELETE라면 -> DELETE/posts/1/like. 이렇게 보냄.
      const res = await fetch(`http://localhost:8080/posts/${pid}/like` , {method}); // res보내고 받을때까지 기다리자.
      if(!res.ok) throw new Error("좋아요 처리 실패 : " + res.status);
      const data = await res.json(); // 받은 res를 JS객체로 바꿀때까지 기다리자.
      setLike(!!data.liked);
      setLikeCount(data.likeCount);
    } catch (e) { alert(e.message); }
  };

  const handleAddComment = async (e) => { // 댓글 등록할때.
    e.preventDefault(); // form submit하면 브라우저는 새로고침하지만 그걸 막는 코드.
    const content = commentInput.trim(); // 공백만 있는 댓글은 등록 안하는 규칙.
    if (!content) return; // content가 빈문자열(false)이면 무시.(return)

    const res = await fetch(`http://localhost:8080/posts/${pid}/comments` , {
      method : "POST",
      headers : {"Content-Type" : "application/json"} , // 이 데이터가 json이라는걸 알려주려고 사용.
      body : JSON.stringify({content , parentId : null})
    });
    if(!res.ok) return alert("댓글 등록 실패 : " + res.status);
    
    setCommentInput(""); // 댓글 입력하고 등록했으면 다시 댓글입력창을 비워줌.
    await loadComments(); // 최신 댓글목록으로 업데이트.
  };

  const handleAddReply = async (e) => {
    e.preventDefault();
    const content = replyInput.trim();
    if (!content || replyTo == null) return; // 입력한 대댓글이 빈문자열 || 대댓글 대상(replyTo)이 없으면 무시.(return)

    const res = await fetch(`http://localhost:8080/posts/${pid}/comments` , {
      method : "POST" ,
      headers : {"Content-Type" : "application/json"} , 
      body : JSON.stringify({content , parentId : replyTo})
    });
    if(!res.ok) return alert("대댓글 등록 실패 : " + res.status);
  
    setReplyInput("");
    setReplyTo(null); // replyTo를 다시 null로 설정해야 대댓글모드가 종료됨. -> 엉뚱한 부모에 대댓글 달리는 이유도 없고 볼 필요 없는 
    // 대댓글들도 안보임.
    await loadComments(); // 최신 댓글목록으로 업데이트.
  };

  const handleDeleteComment = async (commentId) => { // 댓글 삭제.
    const res = await fetch(`http://localhost:8080/comments/${commentId}` , {
      method : "DELETE" 
    });
    if(!res.ok) return alert("댓글 삭제 실패 : " + res.status);
    await loadComments(); // 최신 댓글목록으로 업데이트.
  };

  const handleDeletePost = async () => {
    const ok = window.confirm("정말 이 게시글을 삭제하시겠습니까?"); // ok는 boolean값임.
    if(!ok) return;

    try {
      const res = await fetch(`http://localhost:8080/posts/${pid}` , {
        method : "DELETE"
      });

      if(!res.ok) throw new Error("게시글 삭제 실패 : " + res.status);
      alert("게시글이 삭제되었습니다.");
      navigate("/");
    } catch (e) { alaert(e.message); }
  }

  // async 함수가 있으니까 화면 불러오는 동안 post는 null -> null이면 error가 뜸. -> 아래 코드를 넣어서 null이어도 화면 오류가 안뜨게 방지. 
  if (loading) return <div className="postPage"><div className="emptyBox">불러오는 중...</div></div>;
  if (error) return <div className="postPage"><div className="emptyBox">에러: {error}</div></div>;
  if (!post) return <div className="postPage"><div className="emptyBox">게시글이 없습니다.</div></div>;

  return (
    <div className="postPage">
      <div className="topButtons">
        <button className="backBtn" type="button" onClick={ () => navigate("/")}>
          목록으로
        </button>

        <button className="editBtn" type="button" onClick={ () => navigate(`/posts/${pid}/edit`)}>
          수정하기
        </button>
      </div>

      <button className="deleteBtn" onClick={handleDeletePost}>
        삭제하기
      </button>

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
                  
                  {/* target="_blank" : 링크를 타고 새 페이지로 이동. 
                  rel="noreferrer" : 사이트주소를 악성사이트 주소로 바꿔버릴 수 있기때문에 보안상 있어야함. */}
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
            <div className="emptyBox">이 게시물에 댓글이 없습니다.</div>
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
  comment , depth , replyTo , setReplyTo , replyInput , setReplyInput , handleAddReply , handleDeleteComment
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

        <div className={`commentContent ${comment.deleted ? "deleted" : ""}`}>
          {comment.deleted ? "삭제된 댓글입니다." : comment.content}
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
