import { useState } from "react";
import { useNavigate , Link } from "react-router-dom";
import { sendJson } from "../../api/api";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [username , setUsername] = useState("");
  const [email , setEmail] = useState("");
  const [nickname , setNickname] = useState("");
  const [password , setPassword] = useState("");
  const [checkPassword , setCheckPassword] = useState("");
  const [loading , setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    const trimmedNickname = nickname.trim();
    const trimmedPassword = password.trim();
    const trimmedCheckPassword = checkPassword.trim();

    if(!trimmedUsername) { alert("아이디를 입력하세요"); return; }
    if(!trimmedEmail) { alert("이메일을 입력하세요."); return; }
    if(!trimmedNickname) { alert("닉네임을 입력하세요."); return;}
    if(!trimmedPassword) { alert("비밀번호를 입력하세요."); return;}
    if(!trimmedCheckPassword) { alert("비밀번호를 다시 입력하세요."); return;}
    if(trimmedCheckPassword !== trimmedPassword) { alert("비밀번호가 일치하지 않습니다."); return; }

    setLoading(true);

    try {
     await sendJson("/auth/signup" , "POST" , {
      nickname : trimmedNickname ,
      username : trimmedUsername ,
      email : trimmedEmail ,
      password : trimmedPassword ,
      passwordConfirm : trimmedCheckPassword
     });

     alert("회원가입을 하였습니다. ");
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
        <h1 className="authTitle">회원가입</h1>
        <p className="authSubtitle">회원 정보를 입력하세요.</p>

        <form className="authForm" onSubmit={handleSubmit}>
          <div className="formGroup">
            <label className="label">아이디</label>
            <input className="input" type = "text" value={username} onChange={ e => setUsername(e.target.value)}
            placeholder="아이디를 입력하세요." />

          </div>

          <div className="formGroup">
            <label className="label">이메일</label>
            <input className="input" type="email" value={email} onChange={ e => setEmail(e.target.value)}
            placeholder="이메일을 입력하세요."/>
          </div>

          <div className="formGroup">
            <label className="label">닉네임</label>
            <input className="input" type="text" value={nickname} onChange={ e => setNickname(e.target.value)}
            placeholder="닉네임을 입력하세요."/>
          </div>

          <div className="formGroup">
            <label className="label">비밀번호</label>
            <input className="input" type="password" value={password} onChange={ e => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요."/>
          </div>

          <div className="formGroup">
            <label className="label">비밀번호 확인</label>
            <input className="input" type="password" value={checkPassword} onChange={ e => setCheckPassword(e.target.value)}
            placeholder="비밀번호를 다시 입력하세요."/>
          </div>

          <div className="buttonRow">
            <button type="button" className="cancelBtn" onClick={ () => navigate("/login")}>
              취소
            </button>
            <button type="submit" className="submitBtn" disabled={loading}>
              {loading ? "가입 중...." : "회원가입"}
            </button>
          </div>
        </form>
        
        <div className="authBottomText"> 이미 계정이 있으신가요? <Link to="/login">로그인</Link></div>
      </div>
    </div>
  )
}