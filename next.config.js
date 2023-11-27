/** @type {import('next').NextConfig} */
var webpack = require('webpack');

const nextConfig = {
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
        destination: "http://localhost:3001/api/:path*"
      }
    ]
  },
}

module.exports = nextConfig
