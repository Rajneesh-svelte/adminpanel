import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
  
    domains: [
      "homeivf-patient.s3.amazonaws.com",
      "images.unsplash.com",
      "homeivf-test.s3.amazonaws.com",
      "d37dlckkw93aq.cloudfront.net",
      "images.unsplash.com"
    ],
  },
};

export default nextConfig;
