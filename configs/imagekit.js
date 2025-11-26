import ImageKit from "@imagekit/nodejs";

var imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVAT_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});
