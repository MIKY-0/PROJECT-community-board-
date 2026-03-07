import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PostWritePage.css";

export default function PostWritePage() {
  const navigate = useNavigate();
  const [title , setTitle] = useState("");
  const [content , setContent] = useState("");
  const [loading , setLoading] = useState(false);
  const [error , setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if(!trimmedTitle) { // 프론트 1차검증.
      alert("제목을 입력하세요.");
      return;
    }
    if(!trimmedContent) {
      alert("내용을 입력하세요.");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8080/posts" , {
        method : "POST" ,
        headers : {"Content-Type" : "application/json"} ,
        body : JSON.stringify({
          title : trimmedTitle ,
          content : trimmedContent
        })
      });
      
      if(!res.ok) throw new Error("게시글 등록 실패 : " + res.status);
      const data = await res.json();
      navigate("/"); // 등록 성공 후 게시글목록으로.
    } catch (e) {setError(e.message);}
    finally {setLoading(false);}
  };

  return (
    <div className="writePage">
      <div className="writeTop">
        <button type="button" className="backBtn" onClick={ () => navigate("/")}> 목록으로</button>
      </div>
      <div className="writeCard">
        <h1 className="writeTitle">게시글 작성</h1>
        <p className="writeSubtitle">제목과 내용 입력.</p>
        
        <form className="writeForm" onSubmit={handleSubmit}>
          <div className="formGroup">
            <label className="label">제목</label>
            <input className="input" type="text" value={title} onChange={ e => setTitle(e.target.value)}
            placeholder="제목을 입력하세요."/>
          </div>
          <div className="formGroup">
            <label className="label">내용</label>
            <textarea className="textarea" value={content} onChange={ e => setContent(e.target.value)}
              placeholder="내용을 입력하세요."/>
          </div> 
          {/* error 있으면 errorBox 표시. */}
          {error && <div className="errorBox">{error}</div>}
          <div className="buttonRow">
            <button type="button" className="cancelBtn" onClick={ () => navigate("/")} disabled={loading}>취소</button>
            <button type="submit" className="submitBtn" disabled={loading}>
              {loading ? "등록 중..." : "등록"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
