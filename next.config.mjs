// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   /* config options here */
//   images:
//   {
//     remotePatterns: [
//       {
//         protocol: "https" ,
//         hostname: "randomuser.me",
//       },
//     ],
//   },
// };

// export default nextConfig;




/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: false, // ✅ disables Turbopack
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
  },
};

export default nextConfig;


