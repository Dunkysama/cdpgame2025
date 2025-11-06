import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Si on visite la page d'accueil et qu'aucune session n'existe, rediriger vers /connexion
  if (pathname === "/") {
    const hasSession = request.cookies.get("session")?.value;
    if (!hasSession) {
      const url = new URL("/connexion", request.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// N'appliquer le middleware qu'à la page d'accueil
export const config = {
  matcher: ["/"],
};
