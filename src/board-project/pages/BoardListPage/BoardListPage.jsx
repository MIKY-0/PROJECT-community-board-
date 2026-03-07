import React, { useEffect, useState } from "react";
import "./BoardListPage.css";
import { Link } from "react-router-dom";

export default function BoardListPage() {
  // 검색.
  const [searchField, setSearchField] = useState("title"); 
  const [keyword, setKeyword] = useState("");

  // 실제로 서버에 보낼 검색 조건.(검색 버튼 누를때 확정남.)
  const [query , setQuery] = useState({field : "title" , keyword : ""});

  // 페이지.
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // 서버에서 받아온 원본 posts.
  const [posts , setPosts] = useState([]);
  const [totalPages , setTotalPages] = useState(1);

  // 로딩 / 에러.
  const [loading , setLoading] = useState(false);
  const [error , setError] = useState("");

  // 서버에서 목록 가져오기.
  useEffect( () => {
    const load = async () => {
      setLoading(true); // 서버에서 데이터가져오는중...
      setError(""); // 새로 요청할때 이전 에러메시지 있으면 지운다.
      try {
        let url = `http://localhost:8080/posts?page=${page}&size=${pageSize}`;

        // 검색어 있으면 쿼리 추가.
        if(query.keyword.trim() !== "") {
          url += `&field=${query.field}&keyword=${encodeURIComponent(query.keyword)}`;
        }
        const res = await fetch(url);
        if(!res.ok) throw new Error("서버 응답 에러 : " + res.status); // res.ok : 200번대라면 -> true / 아니면(404,500) -> false.
        const data = await res.json(); // 백엔드에서 받은 JSON 문자열을 JS객체로 변환.

        // 백엔드가 PostListResDto로 보내줌 -> data.posts가 null이면 []로 반환 아니면 그대로 data.posts반환. 그래야 이상한 오류 안생김.
        setPosts(data.posts || []);
        setTotalPages(data.totalPages || 1);

        // 백엔드가 safePage로 보정해서 내려줄 수 있으니 맞춰주기.
        if(typeof data.page === "number") setPage(data.page);
      } catch (e) { // 오류 생겼다면 화면에 오류메시지보여주고 게시글 목록 비움.
        setError(e.message);
        setPosts([]);
        setTotalPages(1);
      } finally { setLoading(false); } 
      };
      load();
    } , [page , query]); // page , query는 사용자가 요청하므로 바뀔때마다 실행.
  
  // 검색 버튼 누르면 1페이지로 , 검색 조건 확정.
  const onSearch = e => {
    e.preventDefault();
    setPage(1); // 검색하면 1페이지로.
    setQuery({
      field : searchField,
      keyword : keyword.trim()
    });
  };

  const safePage = Math.min(page , totalPages);

  return (
    <div className="boardWrap">
      <header className="boardHeader">
        <h1 className="boardTitle">게시판</h1>
        <p className="boardSubtitle">
          게시글 메인화면임
        </p>
      </header>
    
      {/* 검색 */}
      {/* form : 입력값들을 묶어서 한번에 처리. 엔터 -> 자동으로 제출. 버튼클릭이벤트 다 작성할 필요 X. */}
      <form className="searchBox" onSubmit={onSearch}> 
        <select className="searchSelect" value={searchField} onChange={ e => setSearchField(e.target.value)}>
          <option value="title">제목</option>
          <option value="author">작성자</option>
        </select>

        <input className="searchInput" value={keyword} onChange={ e => setKeyword(e.target.value)} 
        placeholder="검색어 입력"/>

        <button className="searchBtn" type="submit">검색</button>
      </form>

      {/* 목록 테이블 */}
      <div className="boardTableWrap">
        <table className="boardTable">
          <thead>
            <tr>
              <th className="colNum">번호</th>
              <th className="colTitle">제목</th>
              <th className="colAuthor">작성자</th>
              <th className="colDate">작성일</th>
              <th className="colView">조회</th>
              <th className="colLike">좋아요</th>
            </tr>
          </thead>

          <tbody>
            {!loading && posts.length === 0 ? 
            (
              <tr>
                <td colSpan={6} className="empty">
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : 
            (
              posts.map( p => ( // posts(서버에서 받은 게시글)가 n개면 -> <tr>행도 n개 생성.
                <tr key={p.postId} className="row">
                  <td className="no">{p.postId}</td>

                  <td className="title">
                    <Link className="titleLink" to={`/posts/${p.postId}`}>
                      {p.title}
                      {p.commentCount > 0 && ( // 댓글0개면 안보임.
                        <span className="commentBadge">[{p.commentCount}]</span>
                      )}
                    </Link>
                  </td>

                  <td className="author">{p.nickname}</td>
                  <td className="date">{p.createdAt}</td>
                  <td className="view">{p.viewCount}</td>
                  <td className="like">{p.likeCount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="boardFooter">
        <div className="pagination">
          <button className="pageBtn" type="button" disabled={page === 1} onClick={() => setPage(page - 1)}>
            이전
          </button>

          {Array.from({ length: totalPages } , (_ , i) => i + 1).map( p => (
            <button key={p} className={`pageNum ${p === page ? "active" : ""}`} type="button"
            onClick={() => setPage(p)}>
              {p}
            </button>
          ))}

          <button className="pageBtn" type="button" disabled={page === totalPages}
          onClick={() => setPage(page + 1)}>
            다음
          </button>
        </div>

        <Link className="writeBtn" to="/posts/new">
          게시글 작성하기
        </Link>
      </div>
    </div>
  );
}
