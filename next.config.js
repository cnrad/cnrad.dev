/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/github',
        destination: 'https://github.com/cnrad',
        permanent: true,
      },
      {
        source: '/twitter',
        destination: 'https://twitter.com/notcnrad',
        permanent: true,
      },
      {
        source: '/linkedin',
        destination: 'https://linkedin.com/in/cnrad',
        permanent: true,
      },
      {
        source: '/new',
        destination: 'https://h-cnrad.vercel.app/?pinned=https://raw.githubusercontent.com/cnrad/h.cnrad.dev/master/src/bookmarks.json&background=https://source.unsplash.com/random/1920x1080/?sunset,blue,pink',
        permanent: true,
      },
    ]
  },
}
