import { redirect } from "next/navigation";

/**
 * TODO(A): 로그인 여부에 따라 분기한다.
 *   - 액세스 토큰 있으면 /rooms
 *   - 없으면 /login
 * 지금은 목업이라 방 목록으로 바로 보낸다.
 */
export default function Home() {
  redirect("/rooms");
}
