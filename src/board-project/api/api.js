
export const API_BASE = "http://localhost:8080";

// if(!res.ok) 시 parseErrorMessage(res)니까 에러시 해당 함수 실행. 요청 실패시 함수 실행. 
// -> message("해당 게시글 없음") 또는 "서버에러 : 500" 같은 메시지 반환.
// 에러 응답을 사용자가 이해하기 쉽게 보여줌.
async function parseErrorMessage(res) {  // 이 함수는 쉽게말해 res객체에 있는 에러메시지를 꺼내줌.
  try {
    const errorData = await res.json(); // 에러있는 res를 JS로 바꿈.
    return errorData.message || ("서버 에러 : " + res.status); // errorData.message 있으면 그거 반환 , 없으면 res.status.
  } catch(e) { return "서버 에러 : " + res.status; } // res.json()하다가 에러가 생기면 그냥 기본 에러메시지 반환.
}


export async function getJson(path) { // Get요청 공통. (조회시 사용)
  const res = await fetch(API_BASE + path); // Get요청 시 받는 응답.

  if(!res.ok) { // Get요청 실패시.(status : 400 , 404....)
    /* 
      res = { 
            status : 400 , 404...
            message : "해당 게시글 / 댓글이 없습니다."
            }
    */
    const message = await parseErrorMessage(res); // (!res.ok)이면 parsErrorMessage에 res보내고 해당 message 가져옴.
    throw new Error(message); // 에러 강제 발생.
  }
  return res.json(); // GET요청 성공했으면 그대로 JS로 변환. -> 성공객체를 프론트가 읽어서 화면에 뿌려줌. 
}

export async function sendJson(path , method , body) { // POST , PUT , PATCH 요청 공통. 얘네들은 body가 필요.
  const res = await fetch(API_BASE + path , {
    method ,
    headers : {"Content-Type" : "application/json"} ,
    body : body ? JSON.stringify(body) : undefined // body없으면 undefined. -> body없어도 가능하게 설계함.
    // -> 좋아요같은 기능은 body가 없으니까.
  });

  if(!res.ok) { 
    const message = await parseErrorMessage(res);
    throw new Error(message);
  }

  return res.json();
}

export async function deleteJson(path) { // DELETE 요청 시. -> sendJson에 같이 넣어도 되긴 하지만 
// 직관적이게 작성하려고 따로 분리함. 내가 이해하기 쉬우려고.
  const res = await fetch(API_BASE + path , {
    method : "DELETE"
  });

  if(!res.ok) {
    const message = await parseErrorMessage(res);
    throw new Error(message);
  }

  // POST/PUT/PATCH 요청들은 내가 백엔드에서 모두 return에 내용을 넣었기 때문에 res.json해도 되지만
  // DELETE요청은 void로 설계해서 body에 내용이 없을수 있음. -> 그대로 res.json하면 오류생길수 있어서 
  // res.text로 문자열 변환후 검사함.  
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}
