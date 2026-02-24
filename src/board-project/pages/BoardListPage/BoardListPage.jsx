import React, { useState } from "react";
import "./BoardListPage.css";
import { mockPosts } from "../../mockData/mock";
import { Link } from "react-router-dom";

export default function BoardListPage() {
  // 검색
  const [searchField, setSearchField] = useState("title"); 
  const [keyword, setKeyword] = useState("");

  // 페이지
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // 최신순 정렬(posts에 복사)
  let posts = [...mockPosts].sort( (a , b) => b.postId - a.postId);

  // 검색 필터
  const k = keyword.trim().toLowerCase();
  if (k) { // 검색창에 무언가 검색했다면.
    posts = posts.filter( p => { 
      if (searchField === "title") return p.title . toLowerCase() . includes(k);
      if (searchField === "author") return p.nickname . toLowerCase() . includes(k);
      return true;
    });
  }

  // 3) 페이지네이션
  const totalPages = Math.max(1 , Math.ceil(posts.length / pageSize));
  const searchPage = Math.min(page , totalPages); // ex. 현재페이지(page) 10 , 검색결과 페이지(여기선 totalPages)가 
  // 총 2페이지라면 -> 10을 2로 강제로 낮춰줌. 

  const startIndex = (searchPage - 1) * pageSize; 
  const pagePosts = posts.slice(startIndex , startIndex + pageSize); // 현재화면에 출력할 목록.

  // 검색 버튼 누르면 1페이지로
  const onSearch = e => {
    e.preventDefault();
    setPage(1);
  };

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
            {pagePosts.length === 0 ? 
            (
              <tr>
                <td colSpan={6} className="empty">
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : 
            (
              pagePosts.map( p => ( // pagePosts가 n개면 -> <tr>행도 n개 생성.
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
          <button className="pageBtn" type="button" disabled={searchPage === 1} onClick={() => setPage(searchPage - 1)}>
            이전
          </button>

          {Array.from({ length: totalPages } , (_ , i) => i + 1).map( p => (
            <button key={p} className={`pageNum ${p === searchPage ? "active" : ""}`} type="button"
            onClick={() => setPage(p)}>
              {p}
            </button>
          ))}

          <button className="pageBtn" type="button" disabled={searchPage === totalPages}
          onClick={() => setPage(searchPage + 1)}>
            다음
          </button>
        </div>

        <Link className="writeBtn" to="/posts/new">
          글쓰기
        </Link>
      </div>
    </div>
  );
}
