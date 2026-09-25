import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  logging: {
    // Do not mirror the browser console into the terminal: extensions such as
    // wallet providers inject noisy scripts that have nothing to do with the app.
    browserToTerminal: false,
  },
};

export default nextConfig;
