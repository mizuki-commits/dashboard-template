import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  // 認証を要求するパス（/api, /login は除外）
  matcher: ["/((?!api|login|_next/static|_next/image|favicon.ico).*)"],
};
