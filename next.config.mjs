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
  turbopack: {
    root: "c:/Users/LENOVO/aspai",
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
