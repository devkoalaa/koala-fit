import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Served under devkoala.xyz/koala-fit via a reverse-proxy rewrite in the
  // rayonometro (gateway) project — this makes every internal link, redirect,
  // and asset URL Next.js generates consistently carry the /koala-fit
  // prefix, matching what that rewrite expects. As a result the app is only
  // reachable at that base path now, on any domain (including *.vercel.app).
  basePath: "/koala-fit",
};

export default nextConfig;
