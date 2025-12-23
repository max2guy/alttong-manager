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
    SKT: [
        'SK세븐모바일', '헬로모바일', '프리티', '스마텔', '티플러스', '리브모바일', '토스모바일',
        '아이즈모바일', '모빙', '이야기모바일', '에스원 안심모바일', '이마트알뜰폰', '조이텔'
    ],
    KT: [
        'KT엠모바일', '스카이라이프모바일', '헬로모바일', '프리티', '스마텔', '티플러스', 
        '리브모바일', '토스모바일', '아이즈모바일', '모빙', '이야기모바일', '에스원 안심모바일',
        '드림모바일', '파인디지털', 'KT텔레캅', '로카모빌리티', '아이디스파워텔', '장성모바일', 
        '씨앤컴', '제이씨티', '포인트파크', '더피엔엘', '고고팩토리', '아이플러스유', 'M2모바일',
        '핀플레이', '플래시모바일', 'A모바일', '아시아모바일', '앤텔레콤', '이지모바일', 
        '밸류컴', '핀샷', '에르엘', '니즈모바일', '여유알뜰폰', '웰', '스노우맨'
    ],
    LGU: [
        'U+유모바일', '헬로모바일', '프리티', '스마텔', '티플러스', '리브모바일', '토스모바일',
        '아이즈모바일', '모빙', '이야기모바일', '에스원 안심모바일', '폰마블', '슈가모바일', 
        '코나아이', '엔티온텔레콤', '원텔레콤', '셀모바일', '한패스모바일', '화인통신', 
        '사람과연결', '인스코리아', '제주방송', 'KG모바일', '온국민폰', '도시락모바일', 
        '서경모바일', '핀플레이', '플래시모바일', 'A모바일', '아시아모바일', '앤텔레콤', 
        '이지모바일', '밸류컴', '핀샷', '에르엘', '니즈모바일', '여유알뜰폰', '웰', '스노우맨', '조이텔'
    ]
};

const app = {
    db: null,
    attachedFiles: [],
    deferredPrompt: null,

    init: function() {
        console.log('App Initializing...');
        
        // 1. Firebase 초기화
        try {
            firebase.initializeApp(firebaseConfig);
            this.db = firebase.database();
            console.log('Firebase Init Success');
        } catch (e) { console.error('Firebase Error', e); }

        // 2. 이벤트 리스너 연결
        this.addEventListeners();

        // 3. 데이터 로드
        this.loadLocalData();
        
        // 4. 날짜 기본값 설정
        const dateInput = document.getElementById('startDate');
        if(dateInput && !dateInput.value) {
            dateInput.valueAsDate = new Date();
        }

        // 5. 알림 권한 요청 (앱 실행 시 자동 확인)
        this.checkNotificationPermission();

        // 6. PWA 설치 프롬프트
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            const btn = document.getElementById('installBtn');
            if(btn) {
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

    addEventListeners: function() {
        // 통신망 변경 시 MVNO 목록 업데이트
        const networkSelect = document.getElementById('network');
        if (networkSelect) {
            networkSelect.addEventListener('change', () => this.updateMVNOList());
        }
        
        // 파일 선택
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }
        
        // 버튼 연결
        document.getElementById('btnLoadCloud')?.addEventListener('click', () => this.loadFromCloud());
        document.getElementById('btnSave')?.addEventListener('click', () => this.saveData());
        document.getElementById('btnReset')?.addEventListener('click', () => this.resetData());
        document.getElementById('btnEdit')?.addEventListener('click', () => this.showInputForm());
        
        // 월 요금 숫자만 입력
        document.getElementById('monthlyFee')?.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g,'');
        });
    },

    updateMVNOList: function() {
        const net = document.getElementById('network').value;
        const select = document.getElementById('mvnoProvider');
        
        select.innerHTML = '<option value="">선택하세요</option>';
        
        if (!net) {
            select.disabled = true;
            select.innerHTML = '<option value="">통신망 선택 필요</option>';
            return;
        }
        
        select.disabled = false;
        if (mvnoList[net]) {
            mvnoList[net].forEach(name => {
                const opt = document.createElement('option');
                opt.value = name;
                opt.innerText = name;
                select.appendChild(opt);
            });
        }
    },

    compressImage: function(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
            };
        });
    },

    handleFileSelect: async function(e) {
        const files = Array.from(e.target.files);
        const preview = document.getElementById('filePreview');
        
        this.showStatus('이미지 압축 중...');

        for (let file of files) {
            if (file.type.startsWith('image/')) {
                const compressedData = await this.compressImage(file);
                this.attachedFiles.push(compressedData);
                
                const img = document.createElement('img');
                img.src = compressedData;
                img.className = 'preview-thumb';
                img.onclick = () => {
                    if(confirm('이미지를 삭제할까요?')) {
                        this.attachedFiles = this.attachedFiles.filter(f => f !== compressedData);
                        img.remove();
                    }
                };
                preview.appendChild(img);
            }
        }
        this.showStatus('');
    },

    saveData: async function() {
        const network = document.getElementById('network').value;
        if(!network) return alert('통신망을 선택해주세요.');

        const data = {
            network: network,
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
                this.showStatus('✅ 로컬 및 클라우드(PIN) 저장 완료!');
            } catch(e) {
                this.showStatus('⚠️ 로컬 저장 완료 (클라우드 실패)');
                console.error(e);
            }
        } else {
            this.showStatus('💾 로컬 저장 완료');
        }
        
        this.renderResult(data);
        this.checkAndNotify(data); // 저장 후 알림 체크
    },

    loadFromCloud: async function() {
        const pin = document.getElementById('pinInput').value;
        if (!pin || pin.length !== 4) return alert('4자리 PIN을 입력하세요');
        
        try {
            this.showStatus('데이터 찾는 중...');
            const snap = await this.db.ref('users/' + pin).once('value');
            const data = snap.val();
            if (data) {
                this.fillForm(data);
                this.showStatus('☁️ 클라우드에서 불러옴');
                this.renderResult(data);
                this.checkAndNotify(data); // 불러온 후 알림 체크
            } else {
                alert('저장된 데이터가 없습니다.');
                this.showStatus('');
            }
        } catch(e) {
            alert('로드 실패: ' + e.message);
            this.showStatus('');
        }
    },

    loadLocalData: function() {
        const local = localStorage.getItem('alttongData');
        if (local) {
            try {
                const data = JSON.parse(local);
                this.fillForm(data);
                this.renderResult(data);
                setTimeout(() => this.checkAndNotify(data), 1000); // 1초 뒤 알림 체크
            } catch(e) {
                console.error('Local Data Error', e);
            }
        } else {
            this.showInputForm();
        }
    },

    fillForm: function(data) {
        if(data.network) {
            document.getElementById('network').value = data.network;
            this.updateMVNOList(); // 목록 갱신 먼저 수행
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

    renderResult: function(data) {
        if(!data.startDate) return;

        document.getElementById('inputSection').style.display = 'none';
        document.getElementById('results').style.display = 'block';

        const start = new Date(data.startDate);
        const months = parseInt(data.discountMonths) || 0;
        const end = new Date(start);
        end.setMonth(start.getMonth() + months);
        
        const today = new Date();
        today.setHours(0,0,0,0);
        const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));

        document.getElementById('summaryNetwork').innerText = data.network || '-';
        document.getElementById('summaryMVNO').innerText = data.mvnoProvider || '-';
        document.getElementById('summaryPlanName').innerText = data.planName || '요금제명 없음';
        document.getElementById('summaryStartDate').innerText = data.startDate;
        document.getElementById('summaryEndDate').innerText = end.toISOString().split('T')[0];
        document.getElementById('summaryFee').innerText = parseInt(data.monthlyFee || 0).toLocaleString() + '원';
        
        const dDayEl = document.getElementById('daysRemaining');
        const alertBox = document.getElementById('alertBox');
        
        if (diff < 0) {
            dDayEl.innerText = `D+${Math.abs(diff)}`;
            dDayEl.style.color = '#ff4757';
            alertBox.style.display = 'block';
            alertBox.className = 'alert-box alert-urgent';
            alertBox.innerText = '⚠️ 할인 기간이 만료되었습니다!';
        } else {
            dDayEl.innerText = `D-${diff}`;
            dDayEl.style.color = '#333';
            if(diff <= 14) {
                alertBox.style.display = 'block';
                alertBox.className = 'alert-box alert-warn';
                alertBox.innerText = `⚡ 해지/번호이동 준비 기간입니다 (${diff}일 남음)`;
            } else {
                alertBox.style.display = 'none';
            }
        }

        document.getElementById('detailDisplay').innerText = data.planDetails || '메모 없음';
        
        const gallery = document.getElementById('savedFilesDisplay');
        gallery.innerHTML = '';
        if(data.files) {
            data.files.forEach(src => {
                const img = document.createElement('img');
                img.src = src;
                img.onclick = () => {
                    const w = window.open("");
                    w.document.write(`<img src="${src}" style="width:100%">`);
                };
                gallery.appendChild(img);
            });
        }
    },

    // ★ [추가된 기능] 알림 권한 확인
    checkNotificationPermission: function() {
        if (!("Notification" in window)) {
            console.log("이 브라우저는 알림을 지원하지 않습니다.");
            return;
        }

        if (Notification.permission !== "denied" && Notification.permission !== "granted") {
            // 권한이 없으면 요청
            Notification.requestPermission();
        }
    },

    // ★ [추가된 기능] 날짜 체크 및 알림 발송
    checkAndNotify: function(data) {
        if (!("Notification" in window) || Notification.permission !== "granted" || !data.startDate) {
            return;
        }

        const start = new Date(data.startDate);
        const months = parseInt(data.discountMonths) || 0;
        const end = new Date(start);
        end.setMonth(start.getMonth() + months);
        
        const today = new Date();
        today.setHours(0,0,0,0);
        const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));

        // 알림 메시지 설정
        let title = "알뜰폰 관리 알리미";
        let body = "";

        // 이미 하루에 한 번 알림을 보냈는지 확인 (로컬스토리지 사용)
        const lastNotified = localStorage.getItem('lastNotificationDate');
        const todayStr = today.toISOString().split('T')[0];

        if (lastNotified === todayStr) {
            console.log('오늘 이미 알림을 보냈습니다.');
            return;
        }

        if (diff < 0) {
            body = `⚠️ 할인 기간이 지났습니다! (D+${Math.abs(diff)}) 지금 바로 확인하세요.`;
        } else if (diff === 0) {
            body = "🚨 오늘이 할인 종료일입니다! 해지나 이동을 서두르세요!";
        } else if (diff <= 7) {
            body = `⚡ 종료까지 ${diff}일 남았습니다. 다음 통신사를 알아볼 때입니다!`;
        } else if (diff <= 30 && diff % 10 === 0) { // 30일, 20일, 10일에만 알림
            body = `📅 할인이 ${diff}일 뒤에 종료됩니다. 일정을 확인하세요.`;
        }

        // 알림 발송
        if (body) {
            if (navigator.serviceWorker && navigator.serviceWorker.controller) {
                navigator.serviceWorker.ready.then(registration => {
                    registration.showNotification(title, {
                        body: body,
                        icon: 'icon-192.png',
                        vibrate: [200, 100, 200]
                    });
                });
            } else {
                new Notification(title, {
                    body: body,
                    icon: 'icon-192.png'
                });
            }
            // 알림 보낸 날짜 저장 (중복 방지)
            localStorage.setItem('lastNotificationDate', todayStr);
        }
    },

    showInputForm: function() {
        document.getElementById('inputSection').style.display = 'block';
        document.getElementById('results').style.display = 'none';
    },

    resetData: function() {
        if(confirm('데이터를 초기화할까요?')) {
            localStorage.removeItem('alttongData');
            localStorage.removeItem('lastNotificationDate'); // 알림 기록도 초기화
            location.reload();
        }
    },

    showStatus: function(msg) {
        const el = document.getElementById('statusMsg');
        if(el) {
            el.innerText = msg;
            setTimeout(() => el.innerText = '', 3000);
        }
    }
};

window.addEventListener('DOMContentLoaded', () => {
    app.init();
});
