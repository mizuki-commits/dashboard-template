import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ログイン必須を解除：全パスを通す（認証チェックなし）
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
