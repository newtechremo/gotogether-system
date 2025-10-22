export default function HomePage() {
  // middleware에서 인증 상태에 따라 /login 또는 /dashboard로 리다이렉트하므로
  // 이 페이지는 실제로 렌더링되지 않습니다
  return null;
}
