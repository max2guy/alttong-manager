const firebaseConfig = {
    // 기존 config 유지
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
    SKT: ['SK세븐모바일', '헬로모바일', '프리티', '모빙', '이야기모바일', '아이즈모바일', '티플러스', '스마텔', '토스모바일'],
    KT: ['KT엠모바일', '스카이라이프', '헬로모바일', '프리티', '모빙', '이야기모바일', '앤텔레콤', '스노우맨', '이지모바일'],
    LGU: ['U+유모바일', '헬로모바일', '프리티', '모빙', '이야기모바일', '인스모바일', '슈가모바일', '마블링', 'KG모바일']
};

const app = {
    db: null,
    attachedFiles: [],
    deferredPrompt: null,

    init: function() {
        // Firebase Init
        try {
            firebase.initializeApp(firebaseConfig);
            this.db = firebase.database();
            console.log('Firebase Init Success');
        } catch (e) { console.error('Firebase Error', e); }

        // Load Data
        this.loadLocalData();
        
        // PWA Install Prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            const btn = document.getElementById('installBtn');
            btn.style.display = 'block';
            btn.addEventListener('click', () => {
                this.deferredPrompt.prompt();
                this.deferredPrompt.userChoice.then((result) => {
                    if (result.outcome === 'accepted') btn.style.display = 'none';
                    this.deferredPrompt = null;
                });
            });
        });

        // Set Date to Today if empty
        if(!document.getElementById('startDate').value) {
            document.getElementById('startDate').valueAsDate = new Date();
        }
    },

    updateMVNOList: function() {
        const net = document.getElementById('network').value;
        const select = document.getElementById('mvnoProvider');
        select.innerHTML = '<option value="">선택하세요</option>';
        select.disabled = !net;
        
        if (net && mvnoList[net]) {
            mvnoList[net].forEach(name => {
                const opt = document.createElement('option');
                opt.value = name;
                opt.innerText = name;
                select.appendChild(opt);
            });
        }
    },

    // 핵심: 이미지 압축 로직
    compressImage: function(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800; // 최대 너비 제한
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
                    // JPEG로 압축 (품질 0.7)
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
            };
        });
    },

    handleFileSelect: async function(e) {
        const files = Array.from(e.target.files);
        const preview = document.getElementById('filePreview');
        
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
    },

    saveData: async function() {
        const data = {
            network: document.getElementById('network').value,
            mvnoProvider: document.getElementById('mvnoProvider').value,
            planName: document.getElementById('planName').value,
            startDate: document.getElementById('startDate').value,
            discountMonths: document.getElementById('discountMonths').value,
            monthlyFee: document.getElementById('monthlyFee').value,
            planDetails: document.getElementById('planDetails').value,
            files: this.attachedFiles,
            updatedAt: Date.now()
        };

        // 로컬 저장
        localStorage.setItem('alttongData', JSON.stringify(data));
        
        // 클라우드 저장
        const pin = document.getElementById('pinInput').value;
        if (pin && pin.length === 4 && this.db) {
            try {
                await this.db.ref('users/' + pin).set(data);
                this.showStatus('✅ 로컬 및 클라우드(PIN) 저장 완료!');
            } catch(e) {
                this.showStatus('⚠️ 로컬 저장 완료 (클라우드 실패)');
            }
        } else {
            this.showStatus('💾 로컬 저장 완료');
        }
        
        this.renderResult(data);
    },

    loadFromCloud: async function() {
        const pin = document.getElementById('pinInput').value;
        if (!pin || pin.length !== 4) return alert('4자리 PIN을 입력하세요');
        
        try {
            const snap = await this.db.ref('users/' + pin).once('value');
            const data = snap.val();
            if (data) {
                this.fillForm(data);
                this.showStatus('☁️ 클라우드에서 불러옴');
                this.renderResult(data);
            } else {
                alert('저장된 데이터가 없습니다.');
            }
        } catch(e) {
            alert('로드 실패: ' + e.message);
        }
    },

    loadLocalData: function() {
        const local = localStorage.getItem('alttongData');
        if (local) {
            const data = JSON.parse(local);
            this.fillForm(data);
            this.renderResult(data);
        } else {
            this.showInputForm();
        }
    },

    fillForm: function(data) {
        document.getElementById('network').value = data.network || '';
        this.updateMVNOList();
        document.getElementById('mvnoProvider').value = data.mvnoProvider || '';
        document.getElementById('planName').value = data.planName || '';
        document.getElementById('startDate').value = data.startDate || '';
        document.getElementById('discountMonths').value = data.discountMonths || '';
        document.getElementById('monthlyFee').value = data.monthlyFee || '';
        document.getElementById('planDetails').value = data.planDetails || '';
        this.attachedFiles = data.files || [];
        
        // 파일 미리보기 복원
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

        // 계산 로직
        const start = new Date(data.startDate);
        const months = parseInt(data.discountMonths) || 0;
        const end = new Date(start);
        end.setMonth(start.getMonth() + months);
        
        const today = new Date();
        today.setHours(0,0,0,0);
        const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));

        // UI 바인딩
        document.getElementById('summaryNetwork').innerText = data.network;
        document.getElementById('summaryMVNO').innerText = data.mvnoProvider;
        document.getElementById('summaryPlanName').innerText = data.planName;
        document.getElementById('summaryStartDate').innerText = data.startDate;
        document.getElementById('summaryEndDate').innerText = end.toISOString().split('T')[0];
        document.getElementById('summaryFee').innerText = parseInt(data.monthlyFee || 0).toLocaleString() + '원';
        
        // D-Day
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
        
        // 이미지 렌더링
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

    showInputForm: function() {
        document.getElementById('inputSection').style.display = 'block';
        document.getElementById('results').style.display = 'none';
    },

    resetData: function() {
        if(confirm('데이터를 초기화할까요?')) {
            localStorage.removeItem('alttongData');
            location.reload();
        }
    },

    showStatus: function(msg) {
        const el = document.getElementById('statusMsg');
        el.innerText = msg;
        setTimeout(() => el.innerText = '', 3000);
    }
};

window.onload = () => app.init();