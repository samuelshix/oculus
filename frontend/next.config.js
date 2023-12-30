/** @type {import('next').NextConfig} */
var webpack = require('webpack');
const env = process.env.NODE_ENV

let API_URL;
if(env == "development") {
  API_URL = "http://localhost:3001/api/:path*"
} else if (env == "production") {
  API_URL = "https://portfolio-snapshot-checker.onrender.com/api/:path*"
}

const nextConfig = {
  env: {
    NEXT_PUBLIC_HELIUS_API_KEY: process.env.NEXT_PUBLIC_HELIUS_API_KEY,
  },
  // webpack: (config, options) => {
  //   config.module.rules.push({
  //     test: /\.m?js/,
  //     resolve: {
  //       fullySpecified: false,
  //     },
  //   })
  //   config.ignoreWarnings = [/Failed to parse source map/]
  //   config.plugins.push(
  //     new webpack.ProvidePlugin({ Buffer: ["buffer", "Buffer"] })
  //   )
  //   config.resolve.fallback = {
  //     crypto: require.resolve("crypto-browserify"),
  //     stream: require.resolve("stream-browserify"),
  //     util: require.resolve("util"),
  //     assert: require.resolve("assert"),
  //     fs: false,
  //     process: false,
  //     path: false,
  //     zlib: false,
  //     // http: false,
  //     // https: false,
  //     // querystring: false,
  //   };
  //   return config
  // },
  reactStrictMode: false,
  experimental: { esmExternals: 'loose' },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: API_URL
      }
    ]
  },
}

module.exports = nextConfig
