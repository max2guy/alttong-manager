import sharp from 'sharp';

const svgSource = `<svg width="512" height="512" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
  </defs>
  <rect width="160" height="160" rx="36" fill="url(#bg)"/>
  <rect x="42" y="22" width="76" height="116" rx="14" fill="rgba(0,0,0,0.12)"/>
  <rect x="40" y="20" width="76" height="116" rx="14" fill="white"/>
  <rect x="48" y="30" width="60" height="90" rx="8" fill="#dbeafe"/>
  <rect x="64" y="33" width="28" height="4" rx="2" fill="#93c5fd"/>
  <rect x="64" y="125" width="28" height="3.5" rx="1.75" fill="#bfdbfe"/>
  <rect x="52" y="64" width="52" height="30" rx="10" fill="#3b82f6"/>
  <text x="78" y="85" text-anchor="middle"
        font-family="'Apple SD Gothic Neo','Malgun Gothic','NanumGothic',sans-serif"
        font-size="19" fill="white" font-weight="900" letter-spacing="1">알뜰</text>
</svg>`;

const buf = Buffer.from(svgSource);

await sharp(buf).resize(192, 192).png().toFile('icon-192.png');
console.log('icon-192.png 생성 완료');

await sharp(buf).resize(512, 512).png().toFile('icon-512.png');
console.log('icon-512.png 생성 완료');
