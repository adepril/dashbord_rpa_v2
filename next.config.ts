/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config: { module: { rules: { test: RegExp; loader: string; options: { name: string } }[] } }) => {
    config.module.rules.push({
      test: /\.csv$/,
      loader: 'file-loader',
      options: {
        name: '[name].[ext]',
      },
    })
    return config
  },
}

module.exports = nextConfig