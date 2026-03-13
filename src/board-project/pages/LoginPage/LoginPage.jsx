import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { sendJson } from "../../api/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username , setUsername] = useState("");
  const [password , setPassword] = useState("");
  const [loading , setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if(!trimmedUsername) { alert("아이디를 입력하세요."); return; }
    if(!trimmedPassword) { alert("비밀번호를 입력하세요."); return; }

    setLoading(true);

    try {
     const data = await sendJson("/auth/login" , "POST" , {
        username : trimmedUsername ,
        password : trimmedPassword
      });

      console.log("로그인 응답 전체 =", JSON.stringify(data, null, 2));
     

     localStorage.setItem("accessToken" , data.accessToken);
     localStorage.setItem("loginUserId" , String(data.userId));
     localStorage.setItem("loginUsername" , data.username);
     localStorage.setItem("loginNickname" , data.nickname);

     alert("로그인 되었습니다.");
     navigate("/");
    } catch(e) { alert(e.message); }
    finally { setLoading(false); }
  };


return (
  <div className="authPage">
    <div className="authTop">
      <button type="button" className="backBtn" onClick={ () => navigate("/")}>
        목록으로
      </button>
    </div>

    <div className="authCard">
      <h1 className="authTitle">로그인</h1>
      <p className="authSubtitle">아이디와 비밀번호를 입력하세요.</p>

      <form className="authForm" onSubmit={handleSubmit}>
        <div className="formGroup">
          <label className="label">아이디</label>
          <input className="input" type="text" value={username} onChange={ e => setUsername(e.target.value)} 
          placeholder="아이디를 입력하세요."/>
        </div>

        <div className="formGroup">
          <label className="label">비밀번호</label>
          <input className="input" type="password" value={password} onChange={ e => setPassword(e.target.value)}
          placeholder="비밀번호를 입력하세요." />
        </div>

        <div className="buttonRow">
          <button type="button" className="cancelBtn" onClick={ () => navigate("/")}>
            취소
          </button>
          <button type="submit" className="submitBtn" disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </div>
      </form>

      <div className="authBottomText">
        계정이 없나요? <Link to="/signup">회원가입</Link>
      </div>
    </div>
  </div>
)
}