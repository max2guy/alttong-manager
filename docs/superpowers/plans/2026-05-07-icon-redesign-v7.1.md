# 아이콘 리디자인 v7.1 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 블루/시안 테마의 새 앱 아이콘(PNG)으로 교체하고, Badging API로 홈 화면에 D-day 숫자 뱃지를 표시한다.

**Architecture:** Node.js 스크립트로 SVG를 192×512 PNG 두 장으로 변환 후 기존 아이콘 파일을 덮어쓴다. app.js의 `renderResult()` 끝에 `updateBadge(diff)` 호출을 추가하고, 데이터 없을 때는 `init()`에서 뱃지를 지운다. manifest의 `theme_color`와 서비스 워커 캐시 버전을 v7.1로 올린다.

**Tech Stack:** Node.js + sharp (PNG 변환), Vanilla JS (Badging API), PWA manifest

---

## 파일 변경 목록

| 파일 | 변경 내용 |
|------|-----------|
| `icon-192.png` | SVG → 192×192 PNG 재생성 |
| `icon-512.png` | SVG → 512×512 PNG 재생성 |
| `app.js` | `updateBadge()` 추가, `renderResult()` + `init()`에서 호출 |
| `manifest.json` | `theme_color` 수정 |
| `service-worker.js` | `CACHE_NAME` v7.0 → v7.1 |
| `index.html` | asset 쿼리 파라미터 v7.0 → v7.1 |

---

## Task 1: PNG 아이콘 생성

**Files:**
- Create: `scripts/generate-icon.mjs`
- Modify: `icon-192.png`, `icon-512.png`

이 태스크에는 테스트가 없다 — 생성된 PNG를 눈으로 확인하는 것이 검증이다.

- [ ] **Step 1: sharp 설치 확인**

```bash
cd /Users/kimwoojung/Projects/alttong-manager
node -e "require('sharp')" 2>/dev/null && echo "sharp ok" || npm install sharp --save-dev
```

Expected: `sharp ok` 또는 설치 완료 메시지

- [ ] **Step 2: SVG → PNG 변환 스크립트 작성**

`scripts/generate-icon.mjs` 파일을 생성한다:

```js
import sharp from 'sharp';
import { writeFileSync } from 'fs';

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
        font-family="'Noto Sans KR','Black Han Sans',sans-serif"
        font-size="19" fill="white" font-weight="900" letter-spacing="1">알뜰</text>
</svg>`;

const buf = Buffer.from(svgSource);

await sharp(buf).resize(192, 192).png().toFile('icon-192.png');
console.log('icon-192.png 생성 완료');

await sharp(buf).resize(512, 512).png().toFile('icon-512.png');
console.log('icon-512.png 생성 완료');
```

- [ ] **Step 3: 스크립트 실행**

```bash
node scripts/generate-icon.mjs
```

Expected:
```
icon-192.png 생성 완료
icon-512.png 생성 완료
```

- [ ] **Step 4: 생성된 PNG 크기 및 텍스트 렌더링 확인**

```bash
file icon-192.png icon-512.png
```

Expected: `192 x 192`, `512 x 512` PNG 파일 확인.

**텍스트 깨짐 확인:** `icon-512.png`를 미리보기 앱으로 열어 "알뜰" 텍스트가 올바르게 보이는지 확인한다.

```bash
open icon-512.png
```

**텍스트가 깨진 경우(폴백):** `scripts/generate-icon.mjs`의 `svgSource`에서 `<text>` 요소를 아래 경로 기반 렌더링으로 교체한다. 아래는 "알뜰" 두 글자를 path로 대체하지 않고, 대신 시스템 한글 폰트 우선순위를 높여 재시도:

```js
// svgSource의 font-family를 아래로 교체
font-family="'Apple SD Gothic Neo','Malgun Gothic','NanumGothic',sans-serif"
```

교체 후 `node scripts/generate-icon.mjs` 재실행 → `open icon-512.png` 재확인.

- [ ] **Step 5: 커밋**

```bash
git add icon-192.png icon-512.png scripts/generate-icon.mjs
git commit -m "feat: generate new app icon (blue/cyan gradient + 알뜰 badge)"
```

---

## Task 2: Badging API 구현

**Files:**
- Modify: `app.js` (lines 266–320 `renderResult`, lines 47–75 `init`)

- [ ] **Step 1: `updateBadge` 함수 추가**

`app.js`에서 `renderResult(data) {` 바로 위에 다음 함수를 추가한다:

```js
async updateBadge(diff) {
    if (!('setAppBadge' in navigator)) return;
    try {
        if (diff > 0) await navigator.setAppBadge(diff);
        else await navigator.setAppBadge(0);
    } catch (e) {}
},
```

- [ ] **Step 2: `renderResult()` 끝에 updateBadge 호출 추가**

`renderResult(data)` 함수 내부, `alertBox` 처리 블록 바로 뒤(함수 끝 근처)에 추가한다:

```js
this.updateBadge(diff);
```

정확한 위치: `alertBox.style.display = 'none';` 블록 직후, `document.getElementById('detailDisplay')` 줄 이전.

- [ ] **Step 3: `init()`에서 데이터 없을 때 뱃지 지우기**

`init()` 함수 내 `this.loadLocalData();` 호출 바로 뒤에 추가한다:

```js
if (!localStorage.getItem('alttong_data')) {
    navigator.clearAppBadge?.();
}
```

- [ ] **Step 4: 브라우저에서 수동 확인**

로컬 서버를 실행하고 앱을 열어 데이터를 입력한 뒤 Android 또는 데스크탑 Chrome에서 뱃지가 표시되는지 확인한다.

```bash
npx serve . -p 8080
# 브라우저에서 http://localhost:8080 접속
```

- [ ] **Step 5: 커밋**

```bash
git add app.js
git commit -m "feat: add Badging API — show D-day count on app icon"
```

---

## Task 3: manifest + 캐시 버전 업데이트

**Files:**
- Modify: `manifest.json`
- Modify: `service-worker.js`
- Modify: `index.html`

- [ ] **Step 1: manifest.json `theme_color` 수정**

`manifest.json`의 `"theme_color": "#667eea"` 를 다음으로 교체한다:

```json
"theme_color": "#3b82f6"
```

- [ ] **Step 2: service-worker.js 캐시 버전 업데이트**

`service-worker.js` 1번째 줄:

```js
const CACHE_NAME = 'v7.1';
```

- [ ] **Step 3: index.html asset 쿼리 파라미터 업데이트**

`index.html`의 `?v=7.0` 세 곳을 모두 `?v=7.1`로 교체한다:

```html
<link rel="manifest" href="./manifest.json?v=7.1">
<link rel="stylesheet" href="./style.css?v=7.1">
<script src="./app.js?v=7.1"></script>
```

- [ ] **Step 4: 커밋**

```bash
git add manifest.json service-worker.js index.html
git commit -m "chore: bump to v7.1 — update theme_color and cache version"
```

---

## Task 4: GitHub 푸시

- [ ] **Step 1: 전체 변경사항 확인**

```bash
git log --oneline -5
git status
```

Expected: 워킹 디렉토리 clean, 3개 신규 커밋 확인

- [ ] **Step 2: 푸시**

```bash
git push origin main
```
