# UI 리디자인 v7.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 알뜰폰 매니저를 밝은 클린(화이트 + 블루/시안) 테마로 리디자인하고, 헤더 슬림화(A), 메인 카드 개선(B), 폼 UX 개선(C), 진행 바 추가(D)를 적용해 v7.0으로 릴리스한다.

**Architecture:** 빌드 시스템 없는 순수 HTML/CSS/JS PWA. `index.html`(구조) + `style.css`(스타일) + `app.js`(로직) 3파일을 순서대로 수정하고, 마지막에 `service-worker.js` 캐시 버전을 올린다. 기존 Firebase 연동·알림·이미지 로직은 건드리지 않는다.

**Tech Stack:** Vanilla JS, CSS Custom Properties, Firebase Realtime DB (기존 유지)

---

## File Map

| 파일 | 역할 | 변경 내용 |
|------|------|-----------|
| `index.html` | HTML 구조 | 헤더 재구성, PIN 슬라이드 패널, 통신망 탭 버튼, 폼 섹션 구분, 버전 7.0 |
| `style.css` | 전체 스타일 | 색상 변수 교체, 카드 상태 클래스, 탭 버튼, PIN 패널 애니메이션, 진행 바 |
| `app.js` | 앱 로직 | 카드 상태 색상, 진행 바 계산, PIN 패널 토글, 통신망 탭 이벤트, 버전 7.0 |
| `service-worker.js` | PWA 캐시 | CACHE_NAME + ASSETS 버전 7.0으로 업데이트 |

---

## Task 1: CSS 색상 변수 및 기본 테마 교체

**Files:**
- Modify: `style.css`

- [ ] **Step 1: `:root` 변수 교체**

`style.css` 상단 `:root` 블록 전체를 아래로 교체한다.

```css
:root {
    --primary: #3b82f6;
    --primary-dark: #1d4ed8;
    --secondary: #06b6d4;
    --accent-warn: #f59e0b;
    --accent-warn-dark: #f97316;
    --accent-danger: #ef4444;
    --accent-danger-dark: #dc2626;
    --bg: #f1f5f9;
    --text: #1e293b;
    --text-muted: #64748b;
    --border: #e2e8f0;
    --white: #ffffff;
}
```

- [ ] **Step 2: summary-card 기본 그라디언트 교체**

`style.css`에서 `.summary-card` 의 `background` 줄을 찾아 교체한다.

```css
/* 찾을 줄 */
background: linear-gradient(135deg, var(--primary), var(--secondary));

/* 교체 후 — 이미 변수가 바뀌었으므로 선언만 유지하면 됨 */
background: linear-gradient(135deg, var(--primary), var(--secondary));
box-shadow: 0 10px 20px rgba(59, 130, 246, 0.35);
```

- [ ] **Step 3: body 배경색 확인**

`style.css`에서 `body { ... background: var(--bg); ... }` 가 있는지 확인. 없으면 `background: #f4f6f8;` 줄을 `background: var(--bg);` 로 교체.

- [ ] **Step 4: 브라우저에서 시각 확인**

`index.html`을 브라우저로 열고 (파일 직접 열기 또는 `npx serve .`) 배경색과 카드 색이 블루/시안 계열로 바뀌었는지 확인.

- [ ] **Step 5: 커밋**

```bash
git add style.css
git commit -m "style: update color theme to blue/cyan for v7.0"
```

---

## Task 2: 카드 상태 CSS 클래스 추가 (B)

**Files:**
- Modify: `style.css`

- [ ] **Step 1: 상태별 카드 클래스 추가**

`style.css` 하단에 아래 블록을 추가한다.

```css
/* 카드 상태 변형 */
.summary-card.card-warn {
    background: linear-gradient(135deg, var(--accent-warn), var(--accent-warn-dark));
    box-shadow: 0 10px 20px rgba(245, 158, 11, 0.35);
}
.summary-card.card-danger {
    background: linear-gradient(135deg, var(--accent-danger), var(--accent-danger-dark));
    box-shadow: 0 10px 20px rgba(239, 68, 68, 0.35);
}
```

- [ ] **Step 2: D-day 텍스트 크기 확대**

`style.css`에서 `.d-day-text` 의 `font-size` 를 찾아 교체한다.

```css
/* 전 */
.d-day-text { font-size: 2.5rem; font-weight: 900; line-height: 1; }

/* 후 */
.d-day-text { font-size: 3rem; font-weight: 900; line-height: 1; letter-spacing: -1px; }
```

- [ ] **Step 3: 정보 그리드 칩 스타일 추가**

`.info-grid` 와 `.info-row` 아래에 아래 클래스를 추가한다.

```css
.info-chips {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
    padding-top: 12px;
    border-top: 1px solid rgba(255,255,255,0.2);
}
.info-chip {
    background: rgba(255,255,255,0.15);
    border-radius: 10px;
    padding: 8px 6px;
    text-align: center;
}
.info-chip .chip-label {
    font-size: 0.6rem;
    opacity: 0.85;
    display: block;
    margin-bottom: 3px;
}
.info-chip .chip-value {
    font-size: 0.8rem;
    font-weight: 700;
}
```

- [ ] **Step 4: 커밋**

```bash
git add style.css
git commit -m "style: add card state classes and info chip grid for v7.0 (B)"
```

---

## Task 3: 진행 바 CSS 추가 (D)

**Files:**
- Modify: `style.css`

- [ ] **Step 1: 진행 바 스타일 추가**

`style.css` 하단에 추가한다.

```css
/* 진행 바 (D) */
.progress-wrap {
    margin: 10px 0 4px;
}
.progress-track {
    background: rgba(255,255,255,0.2);
    border-radius: 4px;
    height: 6px;
    overflow: hidden;
}
.progress-fill {
    height: 100%;
    border-radius: 4px;
    background: rgba(255,255,255,0.85);
    transition: width 0.4s ease;
}
.progress-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.6rem;
    opacity: 0.75;
    margin-top: 3px;
}
```

- [ ] **Step 2: 커밋**

```bash
git add style.css
git commit -m "style: add progress bar styles for v7.0 (D)"
```

---

## Task 4: 헤더 슬림화 + PIN 슬라이드 패널 CSS (A)

**Files:**
- Modify: `style.css`

- [ ] **Step 1: PIN 슬라이드 패널 CSS 추가**

`style.css` 하단에 추가한다.

```css
/* PIN 슬라이드 패널 (A) */
.pin-panel {
    overflow: hidden;
    max-height: 0;
    transition: max-height 0.3s ease, opacity 0.3s ease;
    opacity: 0;
}
.pin-panel.open {
    max-height: 120px;
    opacity: 1;
}

/* 헤더 아이콘 버튼 */
.header-icon-btn {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 4px 6px;
    border-radius: 8px;
    transition: background 0.15s;
}
.header-icon-btn:hover { background: rgba(0,0,0,0.06); }
.header-icons { display: flex; align-items: center; gap: 4px; }
```

- [ ] **Step 2: 커밋**

```bash
git add style.css
git commit -m "style: add PIN slide panel and header icon styles for v7.0 (A)"
```

---

## Task 5: 폼 탭 버튼 + 섹션 구분 CSS (C)

**Files:**
- Modify: `style.css`

- [ ] **Step 1: 통신망 탭 버튼 스타일 추가**

`style.css` 하단에 추가한다.

```css
/* 통신망 탭 버튼 (C) */
.network-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 15px;
}
.network-tab {
    flex: 1;
    padding: 10px 0;
    border: 2px solid var(--border);
    border-radius: 10px;
    background: var(--white);
    color: var(--text-muted);
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
}
.network-tab.active {
    border-color: var(--primary);
    background: #eff6ff;
    color: var(--primary);
}

/* 폼 섹션 구분 */
.form-section-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 18px 0 10px;
    display: flex;
    align-items: center;
    gap: 6px;
}
.form-section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
}

/* 오늘 퀵 버튼 */
.date-wrap { display: flex; gap: 8px; align-items: flex-end; }
.date-wrap input { flex: 1; }
.btn-today {
    padding: 12px 10px;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 10px;
    color: var(--primary);
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
}
```

- [ ] **Step 2: 커밋**

```bash
git add style.css
git commit -m "style: add network tab and form section styles for v7.0 (C)"
```

---

## Task 6: index.html 구조 재작성

**Files:**
- Modify: `index.html`

모든 HTML 구조 변경을 한 번에 적용한다. 아래의 전체 내용으로 `index.html`을 교체한다.

- [ ] **Step 1: index.html 전체 교체**

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#3b82f6">
    <meta name="description" content="알뜰폰 요금제 관리 및 해지일 알림 앱">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="알뜰폰 매니저">
    <link rel="apple-touch-icon" href="icon-192.png">
    <title>알뜰폰 관리 알리미</title>
    <link rel="manifest" href="./manifest.json?v=7.0">
    <link rel="stylesheet" href="./style.css?v=7.0">
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='0.9em' font-size='90'>📱</text></svg>">
</head>
<body>
    <div class="container">
        <!-- 헤더 (A: 슬림화) -->
        <header class="app-header">
            <h1 style="display:flex; align-items:center; gap:6px; font-size:1.2rem;">
                📱 알뜰폰 관리 <span style="font-size:0.8rem; color:#94a3b8; font-weight:400;">v<span class="app-version">7.0</span></span>
            </h1>
            <div class="header-icons">
                <button id="installBtn" class="install-btn" style="display:none;">설치</button>
                <button id="btnCloudToggle" class="header-icon-btn" title="클라우드 동기화">☁️</button>
                <button id="btnHardRefresh" class="header-icon-btn" title="강제 업데이트">🔄</button>
            </div>
        </header>

        <!-- PIN 슬라이드 패널 (A) -->
        <div id="pinPanel" class="pin-panel">
            <div class="pin-section">
                <div class="pin-input-group">
                    <input type="tel" id="pinInput" class="pin-input" placeholder="PIN (4자리)" maxlength="4" inputmode="numeric">
                    <button class="pin-btn" id="btnLoadCloud">불러오기</button>
                </div>
                <p class="pin-info">PIN을 입력하여 기기 간 데이터를 동기화하세요.</p>
            </div>
        </div>

        <!-- 입력 폼 -->
        <div id="inputSection">
            <!-- 섹션 A: 요금제 정보 (C) -->
            <div class="form-section-label">📋 요금제 정보</div>

            <!-- 통신망 탭 버튼 (C) -->
            <div class="network-tabs">
                <button class="network-tab" data-net="SKT">SKT</button>
                <button class="network-tab" data-net="KT">KT</button>
                <button class="network-tab" data-net="LGU">LG U+</button>
            </div>

            <div class="input-group">
                <label>통신사(MVNO)</label>
                <select id="mvnoProvider" disabled><option value="">통신망을 선택하세요</option></select>
            </div>
            <div class="input-group">
                <label>요금제명</label>
                <input type="text" id="planName" placeholder="예: 7GB+1Mbps">
            </div>

            <!-- 섹션 B: 기간·비용 정보 (C) -->
            <div class="form-section-label">📅 기간 · 비용</div>

            <div class="input-group">
                <label>가입일</label>
                <div class="date-wrap">
                    <input type="date" id="startDate">
                    <button id="btnToday" class="btn-today">오늘</button>
                </div>
            </div>
            <div class="form-grid">
                <div class="input-group">
                    <label>할인 기간 (개월)</label>
                    <input type="number" id="discountMonths" placeholder="7" min="0" inputmode="numeric">
                </div>
                <div class="input-group">
                    <label>월 요금 (원)</label>
                    <input type="tel" id="monthlyFee" placeholder="0" inputmode="numeric">
                </div>
            </div>

            <!-- 섹션 C: 부가 정보 (C) -->
            <div class="form-section-label">📝 부가 정보</div>

            <div class="input-group">
                <label>상세 정보</label>
                <textarea id="planDetails" placeholder="메모 입력"></textarea>
            </div>
            <div class="input-group">
                <label>첨부 파일</label>
                <div class="file-input-wrapper">
                    <input type="file" id="fileInput" accept="image/*" multiple>
                    <label for="fileInput" class="file-input-label">📸 이미지 추가</label>
                </div>
                <div id="filePreview" class="file-preview"></div>
            </div>

            <div class="button-group">
                <button class="btn-save" id="btnSave">저장하기</button>
                <button class="btn-reset" id="btnReset">초기화</button>
            </div>
            <div id="statusMsg" class="status-msg"></div>
        </div>

        <!-- 결과 카드 -->
        <div id="results" style="display: none;">
            <div class="result-header">
                <h2>내 요금제 현황</h2>
                <button id="btnEdit" class="edit-btn">수정</button>
            </div>
            <div class="summary-card" id="summaryCard">
                <div class="card-top">
                    <span id="summaryNetwork" class="badge">-</span>
                    <span id="summaryMVNO" class="provider-name">-</span>
                </div>
                <div class="plan-title" id="summaryPlanName">-</div>
                <div class="d-day-container">
                    <span class="d-day-label">할인 종료까지</span>
                    <div id="daysRemaining" class="d-day-text">-</div>
                </div>

                <!-- 진행 바 (D) -->
                <div class="progress-wrap">
                    <div class="progress-track">
                        <div id="progressFill" class="progress-fill" style="width:0%"></div>
                    </div>
                    <div class="progress-labels">
                        <span id="progressStart">-</span>
                        <span id="progressEnd">-</span>
                    </div>
                </div>

                <!-- 정보 칩 그리드 (B) -->
                <div class="info-chips">
                    <div class="info-chip">
                        <span class="chip-label">가입일</span>
                        <span class="chip-value" id="summaryStartDate">-</span>
                    </div>
                    <div class="info-chip">
                        <span class="chip-label">종료 예정</span>
                        <span class="chip-value" id="summaryEndDate">-</span>
                    </div>
                    <div class="info-chip">
                        <span class="chip-label">월 요금</span>
                        <span class="chip-value" id="summaryFee">-</span>
                    </div>
                </div>
            </div>

            <div id="alertBox" class="alert-box"></div>
            <div class="detail-section">
                <h4>📝 상세 메모</h4>
                <div id="detailDisplay" class="detail-content"></div>
            </div>
            <div id="savedFilesDisplay" class="gallery-grid"></div>
        </div>

        <footer style="text-align:center; margin-top:30px; color:#94a3b8; font-size:0.75rem;">
            Ver <span class="app-version">7.0</span> | Alttong Manager
        </footer>
    </div>

    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-database-compat.js"></script>
    <script src="./app.js?v=7.0"></script>
</body>
</html>
```

- [ ] **Step 2: 브라우저에서 구조 확인**

파일을 열어 레이아웃이 깨지지 않는지, PIN 패널 영역이 보이지 않는지(기본 숨김), 통신망 탭 3개가 보이는지, 폼 섹션 구분선이 표시되는지 확인.

- [ ] **Step 3: 커밋**

```bash
git add index.html
git commit -m "feat: redesign HTML structure for v7.0 (A/B/C/D)"
```

---

## Task 7: app.js 로직 업데이트

**Files:**
- Modify: `app.js`

기존 `app.js`의 전체 내용을 아래로 교체한다. Firebase 설정·MVNO 목록·이미지 압축·알림 로직은 그대로 유지하고, 변경된 HTML ID에 맞춰 이벤트와 렌더 로직을 업데이트한다.

- [ ] **Step 1: app.js 전체 교체**

```js
const APP_VERSION = '7.0';

const firebaseConfig = {
    apiKey: "AIzaSyDpilSKN7l7ubKTyrIEdmK_ukA_TpgWNP8",
    authDomain: "alttong-manager-v2.firebaseapp.com",
    databaseURL: "https://alttong-manager-v2-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "alttong-manager-v2",
    storageBucket: "alttong-manager-v2.firebasestorage.app",
    messagingSenderId: "146529111294",
    appId: "1:146529111294:web:93fff3a092c1c5d72aa9af",
    measurementId: "G-N3NJQ7H75T"
};

const mvnoList = {
    SKT: ['SK세븐모바일', '헬로모바일', '프리티', '스마텔', '티플러스', '리브모바일', '토스모바일', '아이즈모바일', '모빙', '이야기모바일', '에스원 안심모바일', '이마트알뜰폰', '조이텔'],
    KT: ['KT엠모바일', '스카이라이프모바일', '헬로모바일', '프리티', '스마텔', '티플러스', '리브모바일', '토스모바일', '아이즈모바일', '모빙', '이야기모바일', '에스원 안심모바일', '드림모바일', '파인디지털', 'KT텔레캅', '로카모빌리티', '아이디스파워텔', '장성모바일', '씨앤컴', '제이씨티', '포인트파크', '더피엔엘', '고고팩토리', '아이플러스유', 'M2모바일', '핀플레이', '플래시모바일', 'A모바일', '아시아모바일', '앤텔레콤', '이지모바일', '밸류컴', '핀샷', '에르엘', '니즈모바일', '여유알뜰폰', '웰', '스노우맨'],
    LGU: ['U+유모바일', '헬로모바일', '프리티', '스마텔', '티플러스', '리브모바일', '토스모바일', '아이즈모바일', '모빙', '이야기모바일', '에스원 안심모바일', '폰마블', '슈가모바일', '코나아이', '엔티온텔레콤', '원텔레콤', '셀모바일', '한패스모바일', '화인통신', '사람과연결', '인스코리아', '제주방송', 'KG모바일', '온국민폰', '도시락모바일', '서경모바일', '핀플레이', '플래시모바일', 'A모바일', '아시아모바일', '앤텔레콤', '이지모바일', '밸류컴', '핀샷', '에르엘', '니즈모바일', '여유알뜰폰', '웰', '스노우맨', '조이텔']
};

const app = {
    db: null,
    attachedFiles: [],
    deferredPrompt: null,
    selectedNetwork: '',

    init() {
        document.querySelectorAll('.app-version').forEach(el => el.innerText = APP_VERSION);
        try {
            firebase.initializeApp(firebaseConfig);
            this.db = firebase.database();
        } catch (e) { console.error('Firebase Error', e); }

        this.addEventListeners();
        this.loadLocalData();

        const dateInput = document.getElementById('startDate');
        if (dateInput && !dateInput.value) dateInput.valueAsDate = new Date();

        this.checkNotificationPermission();

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            const btn = document.getElementById('installBtn');
            if (btn) {
                btn.style.display = 'block';
                btn.addEventListener('click', () => {
                    this.deferredPrompt.prompt();
                    this.deferredPrompt.userChoice.then((result) => {
                        if (result.outcome === 'accepted') btn.style.display = 'none';
                        this.deferredPrompt = null;
                    });
                });
            }
        });
    },

    addEventListeners() {
        // 헤더 버튼 (A)
        document.getElementById('btnHardRefresh')?.addEventListener('click', () => this.hardRefresh());
        document.getElementById('btnCloudToggle')?.addEventListener('click', () => this.togglePinPanel());

        // 통신망 탭 버튼 (C)
        document.querySelectorAll('.network-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectedNetwork = btn.dataset.net;
                document.querySelectorAll('.network-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.updateMVNOList();
            });
        });

        // 오늘 버튼 (C)
        document.getElementById('btnToday')?.addEventListener('click', () => {
            document.getElementById('startDate').valueAsDate = new Date();
        });

        document.getElementById('fileInput')?.addEventListener('change', (e) => this.handleFileSelect(e));
        document.getElementById('btnLoadCloud')?.addEventListener('click', () => this.loadFromCloud());
        document.getElementById('btnSave')?.addEventListener('click', () => this.saveData());
        document.getElementById('btnReset')?.addEventListener('click', () => this.resetData());
        document.getElementById('btnEdit')?.addEventListener('click', () => this.showInputForm());
        document.getElementById('monthlyFee')?.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
    },

    // PIN 패널 토글 (A)
    togglePinPanel() {
        const panel = document.getElementById('pinPanel');
        if (panel) panel.classList.toggle('open');
    },

    hardRefresh: async function () {
        if (!confirm(`앱을 초기화하고 업데이트 하시겠습니까?\n(오류 해결을 위해 모든 캐시를 삭제합니다)`)) return;
        this.showStatus('🔄 초기화 중...');
        try {
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (let r of registrations) await r.unregister();
            }
            if ('caches' in window) {
                const keys = await caches.keys();
                await Promise.all(keys.map(k => caches.delete(k)));
            }
            window.location.reload(true);
        } catch (e) { window.location.reload(); }
    },

    updateMVNOList() {
        const select = document.getElementById('mvnoProvider');
        select.innerHTML = '<option value="">선택하세요</option>';
        if (!this.selectedNetwork) {
            select.disabled = true;
            select.innerHTML = '<option value="">통신망을 선택하세요</option>';
            return;
        }
        select.disabled = false;
        (mvnoList[this.selectedNetwork] || []).forEach(name => {
            const opt = document.createElement('option');
            opt.value = name;
            opt.innerText = name;
            select.appendChild(opt);
        });
    },

    compressImage(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    let width = img.width, height = img.height;
                    if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                    canvas.width = width; canvas.height = height;
                    canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
            };
        });
    },

    handleFileSelect: async function (e) {
        const files = Array.from(e.target.files);
        const preview = document.getElementById('filePreview');
        this.showStatus('이미지 처리 중...');
        for (let file of files) {
            if (file.type.startsWith('image/')) {
                const compressed = await this.compressImage(file);
                this.attachedFiles.push(compressed);
                const img = document.createElement('img');
                img.src = compressed;
                img.className = 'preview-thumb';
                img.onclick = () => {
                    if (confirm('삭제하시겠습니까?')) {
                        this.attachedFiles = this.attachedFiles.filter(f => f !== compressed);
                        img.remove();
                    }
                };
                preview.appendChild(img);
            }
        }
        this.showStatus('');
    },

    saveData: async function () {
        if (!this.selectedNetwork) return alert('통신망을 선택해주세요.');
        const data = {
            network: this.selectedNetwork,
            mvnoProvider: document.getElementById('mvnoProvider').value,
            planName: document.getElementById('planName').value,
            startDate: document.getElementById('startDate').value,
            discountMonths: document.getElementById('discountMonths').value,
            monthlyFee: document.getElementById('monthlyFee').value,
            planDetails: document.getElementById('planDetails').value,
            files: this.attachedFiles,
            updatedAt: Date.now()
        };
        localStorage.setItem('alttongData', JSON.stringify(data));
        const pin = document.getElementById('pinInput').value;
        if (pin && pin.length === 4 && this.db) {
            try {
                this.showStatus('☁️ 업로드 중...');
                await this.db.ref('users/' + pin).set(data);
                this.showStatus('✅ 저장 완료! (PIN: ' + pin + ')');
            } catch (e) { this.showStatus('⚠️ 로컬 저장 완료 (클라우드 실패)'); }
        } else { this.showStatus('💾 로컬 저장 완료'); }
        this.renderResult(data);
        this.checkAndNotify(data);
    },

    loadFromCloud: async function () {
        const pin = document.getElementById('pinInput').value;
        if (!pin || pin.length !== 4) return alert('4자리 PIN을 입력하세요');
        try {
            this.showStatus('데이터 찾는 중...');
            const snap = await this.db.ref('users/' + pin).once('value');
            const data = snap.val();
            if (data) {
                this.fillForm(data);
                this.showStatus('☁️ 불러오기 성공');
                this.renderResult(data);
                this.checkAndNotify(data);
            } else { alert('데이터가 없습니다.'); this.showStatus(''); }
        } catch (e) { alert('오류: ' + e.message); this.showStatus(''); }
    },

    loadLocalData() {
        const local = localStorage.getItem('alttongData');
        if (local) {
            try {
                const data = JSON.parse(local);
                this.fillForm(data);
                this.renderResult(data);
                setTimeout(() => this.checkAndNotify(data), 1000);
            } catch (e) { console.error(e); }
        } else { this.showInputForm(); }
    },

    fillForm(data) {
        // 통신망 탭 복원 (C)
        if (data.network) {
            this.selectedNetwork = data.network;
            document.querySelectorAll('.network-tab').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.net === data.network);
            });
            this.updateMVNOList();
        }
        document.getElementById('mvnoProvider').value = data.mvnoProvider || '';
        document.getElementById('planName').value = data.planName || '';
        document.getElementById('startDate').value = data.startDate || '';
        document.getElementById('discountMonths').value = data.discountMonths || '';
        document.getElementById('monthlyFee').value = data.monthlyFee || '';
        document.getElementById('planDetails').value = data.planDetails || '';
        this.attachedFiles = data.files || [];
        const preview = document.getElementById('filePreview');
        preview.innerHTML = '';
        this.attachedFiles.forEach(src => {
            const img = document.createElement('img');
            img.className = 'preview-thumb';
            img.src = src;
            preview.appendChild(img);
        });
    },

    renderResult(data) {
        if (!data.startDate) return;
        document.getElementById('inputSection').style.display = 'none';
        document.getElementById('results').style.display = 'block';

        const start = new Date(data.startDate);
        const months = parseInt(data.discountMonths) || 0;
        const end = new Date(start);
        end.setMonth(start.getMonth() + months);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));

        // 카드 상태 색상 (B)
        const card = document.getElementById('summaryCard');
        card.classList.remove('card-warn', 'card-danger');
        if (diff < 0) card.classList.add('card-danger');
        else if (diff <= 14) card.classList.add('card-warn');

        document.getElementById('summaryNetwork').innerText = data.network || '-';
        document.getElementById('summaryMVNO').innerText = data.mvnoProvider || '-';
        document.getElementById('summaryPlanName').innerText = data.planName || '-';

        // 날짜 포맷 MM-DD (칩에 맞게 짧게)
        const fmt = d => d.toISOString().split('T')[0].slice(5);
        document.getElementById('summaryStartDate').innerText = fmt(start);
        document.getElementById('summaryEndDate').innerText = fmt(end);
        document.getElementById('summaryFee').innerText = parseInt(data.monthlyFee || 0).toLocaleString() + '원';

        const dDayEl = document.getElementById('daysRemaining');
        dDayEl.innerText = diff < 0 ? `D+${Math.abs(diff)}` : `D-${diff}`;
        dDayEl.style.color = diff < 0 ? '#fca5a5' : 'white';

        // 진행 바 (D)
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        const elapsed = Math.ceil((today - start) / (1000 * 60 * 60 * 24));
        const pct = totalDays > 0 ? Math.min(100, Math.max(0, Math.round(elapsed / totalDays * 100))) : 0;
        document.getElementById('progressFill').style.width = pct + '%';
        document.getElementById('progressStart').innerText = data.startDate;
        document.getElementById('progressEnd').innerText = end.toISOString().split('T')[0];

        const alertBox = document.getElementById('alertBox');
        if (diff < 0) {
            alertBox.style.display = 'block'; alertBox.className = 'alert-box alert-urgent';
            alertBox.innerText = '⚠️ 기간 만료!';
        } else if (diff <= 14) {
            alertBox.style.display = 'block'; alertBox.className = 'alert-box alert-warn';
            alertBox.innerText = `⚡ 번호이동 준비하세요 (${diff}일 남음)`;
        } else {
            alertBox.style.display = 'none';
        }

        document.getElementById('detailDisplay').innerText = data.planDetails || '메모 없음';

        const gallery = document.getElementById('savedFilesDisplay');
        gallery.innerHTML = '';
        (data.files || []).forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            img.onclick = () => { const w = window.open(''); w.document.write(`<img src="${src}" style="width:100%">`); };
            gallery.appendChild(img);
        });
    },

    checkNotificationPermission() {
        if (!('Notification' in window)) return;
        if (Notification.permission !== 'denied' && Notification.permission !== 'granted')
            Notification.requestPermission();
    },

    checkAndNotify(data) {
        if (!('Notification' in window) || Notification.permission !== 'granted' || !data.startDate) return;
        const start = new Date(data.startDate);
        const end = new Date(start);
        end.setMonth(start.getMonth() + (parseInt(data.discountMonths) || 0));
        const diff = Math.ceil((end - new Date()) / (1000 * 60 * 60 * 24));
        const todayStr = new Date().toISOString().split('T')[0];
        if (localStorage.getItem('lastNotificationDate') === todayStr) return;
        let body = '';
        if (diff < 0) body = `⚠️ 할인 기간이 지났습니다! (D+${Math.abs(diff)})`;
        else if (diff <= 7) body = `⚡ 종료까지 ${diff}일 남았습니다. 갈아타세요!`;
        if (body) {
            if (navigator.serviceWorker?.controller)
                navigator.serviceWorker.ready.then(reg => reg.showNotification('알뜰폰 알림', { body, icon: 'icon-192.png' }));
            else new Notification('알뜰폰 알림', { body, icon: 'icon-192.png' });
            localStorage.setItem('lastNotificationDate', todayStr);
        }
    },

    showInputForm() {
        document.getElementById('inputSection').style.display = 'block';
        document.getElementById('results').style.display = 'none';
    },

    resetData() {
        if (confirm('초기화 하시겠습니까?')) {
            localStorage.removeItem('alttongData');
            location.reload();
        }
    },

    showStatus(msg) {
        const el = document.getElementById('statusMsg');
        if (el) { el.innerText = msg; if (msg) setTimeout(() => el.innerText = '', 3000); }
    }
};

window.addEventListener('DOMContentLoaded', () => app.init());
```

- [ ] **Step 2: 브라우저에서 동작 확인**

`index.html`을 브라우저에서 열고:
1. ☁️ 버튼 클릭 → PIN 패널 슬라이드 다운 확인
2. SKT/KT/LG U+ 탭 클릭 → MVNO 드롭다운 활성화 확인
3. "오늘" 버튼 클릭 → 가입일에 오늘 날짜 입력 확인
4. 데이터 저장 후 결과 카드에 진행 바 표시 확인
5. 카드 색상이 D-day에 따라 파란색/주황색/빨간색으로 변하는지 확인 (discountMonths를 0으로 설정해 만료 케이스 테스트)

- [ ] **Step 3: 커밋**

```bash
git add app.js
git commit -m "feat: update app logic for v7.0 (A/B/C/D)"
```

---

## Task 8: service-worker.js 캐시 버전 업데이트

**Files:**
- Modify: `service-worker.js`

- [ ] **Step 1: 캐시 버전 및 ASSETS 업데이트**

`service-worker.js` 전체를 아래로 교체한다.

```js
const CACHE_NAME = 'v7.0';
const ASSETS = [
  './',
  './index.html?v=7.0',
  './style.css?v=7.0',
  './app.js?v=7.0',
  './manifest.json?v=7.0',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-database-compat.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => { if (key !== CACHE_NAME) return caches.delete(key); })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
```

- [ ] **Step 2: 커밋**

```bash
git add service-worker.js
git commit -m "chore: bump service worker cache to v7.0"
```

---

## Task 9: 전체 통합 확인 및 최종 커밋

- [ ] **Step 1: 브라우저 전체 플로우 확인**

1. 브라우저 캐시 삭제 후 `index.html` 열기
2. 폼 입력 → 저장 → 결과 카드 확인 (진행 바, 칩 그리드, 카드 색상)
3. 🔄 버튼으로 하드 리프레시 확인
4. ☁️ 버튼으로 PIN 패널 열기/닫기 확인
5. `discountMonths = 0` 으로 저장해 만료(빨간) 카드 확인
6. `discountMonths = 1`, 가입일을 20일 전으로 설정해 임박(주황) 카드 확인

- [ ] **Step 2: docs 커밋**

```bash
git add docs/
git commit -m "docs: add UI redesign spec and plan for v7.0"
```

- [ ] **Step 3: GitHub push**

```bash
git push origin main
```
