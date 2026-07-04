import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/auth/login" },
  callbacks: {
    authorized: ({ token, req }) => {
      const path = req.nextUrl.pathname;
      if (path.startsWith("/admin")) return token?.role === "ADMIN";
      return !!token; // /account/*
    },
  },
});

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};