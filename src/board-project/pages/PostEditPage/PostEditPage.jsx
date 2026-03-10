import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getJson, sendJson } from "../../api/api";

export default function PostEditPage() {
  const {postId} = useParams();
  const navigate = useNavigate();
  const pid = Number(postId);
  
  const [title , setTitle] = useState("");
  const [content , setContent] = useState("");
  const [loading , setLoading] = useState(false);
  const [saving , setSaving] = useState(false);
  const [error , setError] = useState("");

  useEffect( () => { // 수정할 기존 게시글 조회.
    const loadPost = async () => {
      setLoading(true);
      setError("");

      try { 
        const data = await getJson(`/posts/${pid}`);
        setTitle(data.title || ""); // title없으면 빈문자열로.
        setContent(data.content || "");
      } catch (e) {setError(e.message);}
      finally {setLoading(false);}
    };
    loadPost();
  } , [pid]);

  const handleSubmit = async (e) => { // 게시글 수정.
    e.preventDefault();
    const trimmedTitle = title.trim(); // trim해줘야 공백만 입력한 경우를 거를수 있음.
    const trimmedContent = content.trim();

    if(!trimmedTitle) { alert("제목을 입력하세요."); return; }
    if(!trimmedContent) { alert("내용을 입력하세요."); return; }
    
    setSaving(true);
    setError("");
 
    try { 
    await sendJson(`/posts/${pid}` , "PUT" , {
      title : trimmedTitle , content : trimmedContent
    });
      navigate(`/posts/${pid}`);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  if(loading) { return (
    <div className="editPage">
      <div className="emptyBox">
        불러오는 중....
      </div>
    </div> )
  }

  if(error) { return (
    <div className="editPage">
      <div className="emptyBox">
        에러 : {error}
      </div>
    </div> )
  }

  return (
    <div className="editPage">
      <div className="editTop">
        <button type="button" className="backBtn" onClick={ () => navigate(`/posts/${pid}`)}>
          게시글 상세로
        </button>
      </div>

      <div className="editCard">
        <h1 className="editTitle">게시글 수정</h1>
        <p className="editSubtitle">제목과 내용은 수정할 수 있습니다.</p>
        <form className="editForm" onSubmit={handleSubmit}>
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

          <div className="buttonRow">
            <button type="button" className="cancelBtn" onClick={ () => navigate(`/posts/${pid}`)} disabled={saving}>
              취소
            </button>

            <button type="submit" className="submitBtn" disabled={saving}>
              {saving ? "수정 중..." : "수정 완료"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );


}