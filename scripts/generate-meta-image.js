const path = require("path");
const sharp = require("sharp");

const root = path.join(__dirname, "..");
const inputLogo = path.join(root, "src", "images", "brand", "logo.png");
const outputImage = path.join(root, "static", "meta-image.png");

const backgroundSvg = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="48%" r="70%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="58%" stop-color="#fff0f6"/>
      <stop offset="100%" stop-color="#ffd5e4"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="156" cy="122" r="84" fill="#e8547e" opacity="0.16"/>
  <circle cx="1050" cy="510" r="120" fill="#e8547e" opacity="0.12"/>
  <rect x="70" y="70" width="1060" height="490" rx="36" fill="none" stroke="#e8547e" stroke-width="4" opacity="0.25"/>
</svg>`;

async function generateMetaImage() {
  const logo = await sharp(inputLogo)
    .resize({ width: 520, height: 520, fit: "inside" })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: "#fff4f8",
    },
  })
    .composite([
      { input: Buffer.from(backgroundSvg), left: 0, top: 0 },
      { input: logo, left: 340, top: 55 },
    ])
    .png({ compressionLevel: 9 })
    .toFile(outputImage);
}

generateMetaImage().catch((error) => {
  console.error(error);
  process.exit(1);
});
