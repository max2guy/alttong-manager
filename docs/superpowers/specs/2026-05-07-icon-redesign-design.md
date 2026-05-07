# 알뜰폰 매니저 아이콘 리디자인 — v7.1

**날짜:** 2026-05-07
**범위:** 앱 아이콘 교체 + Badging API 구현 (기존 UI/기능 변경 없음)

---

## 목표

v7.0 블루/시안 테마에 맞는 새 앱 아이콘으로 교체하고, Badging API로 홈 화면 아이콘에 D-day 숫자 뱃지를 표시한다.

---

## 아이콘 디자인

### 시각 구성

- **배경:** 블루→시안 그라디언트 (`#3b82f6` → `#06b6d4`), 라운드 코너 `rx=36` (512px 기준)
- **폰 실루엣:** 흰색 (`#ffffff`) 사각형 `rx=14`, 그림자 레이어로 입체감
- **화면 영역:** 연한 블루 (`#dbeafe`) 내부 영역
- **노치:** `#93c5fd` 작은 직사각형
- **뱃지 박스:** 블루(`#3b82f6`) 둥근 사각형 `rx=10`, 폰 화면 중앙에 배치
- **텍스트:** `알뜰` — Noto Sans KR Black(900), 흰색, `letter-spacing: 1`
- **홈 바:** `#bfdbfe` 작은 직사각형

### SVG 소스 (512×512 기준, viewBox="0 0 160 160")

```svg
<svg width="512" height="512" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
  </defs>
  <rect width="160" height="160" rx="36" fill="url(#bg)"/>
  <!-- 폰 그림자 -->
  <rect x="42" y="22" width="76" height="116" rx="14" fill="rgba(0,0,0,0.12)"/>
  <!-- 폰 바디 -->
  <rect x="40" y="20" width="76" height="116" rx="14" fill="white"/>
  <!-- 화면 -->
  <rect x="48" y="30" width="60" height="90" rx="8" fill="#dbeafe"/>
  <!-- 노치 -->
  <rect x="64" y="33" width="28" height="4" rx="2" fill="#93c5fd"/>
  <!-- 홈 바 -->
  <rect x="64" y="125" width="28" height="3.5" rx="1.75" fill="#bfdbfe"/>
  <!-- 알뜰 뱃지 -->
  <rect x="52" y="64" width="52" height="30" rx="10" fill="#3b82f6"/>
  <text x="78" y="85" text-anchor="middle"
        font-family="'Noto Sans KR','Black Han Sans',sans-serif"
        font-size="19" fill="white" font-weight="900" letter-spacing="1">알뜰</text>
</svg>
```

### 출력 파일

| 파일 | 크기 | 용도 |
|------|------|------|
| `icon-192.png` | 192×192 | PWA 홈 화면 아이콘 |
| `icon-512.png` | 512×512 | PWA 스플래시 / 스토어 |

기존 `ico-192.png`, `ico-512.png`(중복 파일)는 건드리지 않는다.

---

## Badging API

### 동작

- 앱 실행 시 `navigator.setAppBadge(daysLeft)` 호출
- `daysLeft`: D-day 값 (`diff` — 종료일까지 남은 일수)
  - 양수(정상): 남은 일수 숫자
  - 0 또는 음수(만료): `navigator.setAppBadge(0)` — 플랫폼 기본 뱃지 점 표시
- 데이터 없음(미설정): `navigator.clearAppBadge()` 호출

### 플랫폼별 동작

| 플랫폼 | 동작 |
|--------|------|
| Android Chrome | 숫자 뱃지 표시 |
| macOS/Windows Chrome | 숫자 뱃지 표시 |
| iOS Safari | 점(●) 뱃지만 표시 (숫자 미지원) |
| 미지원 브라우저 | API 없으면 조용히 무시 (try/catch) |

### 구현 위치

`app.js`의 `renderResult()` 함수 내부 — 카드 렌더링 직후 호출.

```js
async function updateBadge(diff) {
    if (!('setAppBadge' in navigator)) return;
    try {
        if (diff > 0) await navigator.setAppBadge(diff);
        else await navigator.setAppBadge(0);
    } catch (e) {}
}
```

데이터 없을 때(앱 초기화 시): `navigator.clearAppBadge?.()`.

---

## 기타 변경

### manifest.json

- `theme_color`: `#667eea` → `#3b82f6`
- `background_color`: `#f4f6f8` 유지

### 버전 및 캐시

- 서비스 워커 `CACHE_NAME`: `v7.0` → `v7.1`
- `index.html` 내 asset 쿼리 파라미터: `?v=7.1`

---

## 비변경 사항

- 기존 UI (index.html, style.css) 변경 없음
- Firebase 연동 로직 변경 없음
- PWA manifest의 아이콘 파일명(`icon-192.png`, `icon-512.png`) 유지 — 파일 내용만 교체
