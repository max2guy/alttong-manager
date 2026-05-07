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
        document.getElementById('btnHardRefresh')?.addEventListener('click', () => this.hardRefresh());
        document.getElementById('btnCloudToggle')?.addEventListener('click', () => this.togglePinPanel());

        document.querySelectorAll('.network-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectedNetwork = btn.dataset.net;
                document.querySelectorAll('.network-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.updateMVNOList();
            });
        });

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
