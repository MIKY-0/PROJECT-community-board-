
export const API_BASE = "http://localhost:8080";

export async function getJson(path) {
  const res = await fetch(API_BASE + path);
  if(!res.ok) throw new Error("서버 에러 : " + res.status);
  return res.json(); 
}