import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-hosted in a Docker container on the Oracle server, served at the root
  // of fit.devkoala.com behind Caddy. "standalone" emits a minimal server.js
  // plus only the node_modules it actually needs, keeping the image small.
  output: "standalone",
};

export default nextConfig;
