/** Only allow same-site relative redirects after login. */
export function safeNext(next?: string): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}
