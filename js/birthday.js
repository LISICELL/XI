document.addEventListener('DOMContentLoaded', function () {
    const bgm = document.getElementById('bgm');
    if (bgm.src) {
        bgm.volume = 0.5;
        bgm.play().catch(() => { });
    }
    initCandles();
});

const voiceFiles = [
    '陈.mp3',
    '阿米娅.mp3',
    '煌.mp3',
    '凯尔希.mp3',
    '黍.mp3',
    '铃兰.mp3',
    'CL1.mp3',
    '守岸人.mp3',
    '明日香.mp3',
    '小可爱.mp3',
    '小马.mp3',
    '小羊.mp3',
    '小特.mp3',
    '星熊.mp3',
    '忘了.mp3',
    'CL2.mp3',
    '火陈.mp3'
];

let extinguishedCount = 0;

function initCandles() {
    const candles = document.querySelectorAll('.candle');
    candles.forEach((candle, index) => {
        const flame = document.createElement('div');
        flame.className = 'flame';
        candle.appendChild(flame);

        const smoke = document.createElement('div');
        smoke.className = 'smoke';
        candle.appendChild(smoke);

        // 同时支持点击和触摸
        candle.addEventListener('click', () => extinguish(candle, index));
        candle.addEventListener('touchend', (e) => {
            e.preventDefault();
            extinguish(candle, index);
        });
    });
}

function extinguish(candle, index) {
    if (candle.classList.contains('extinguished')) return;

    candle.classList.add('extinguished');
    extinguishedCount++;

    const progress = document.getElementById('progress');
    progress.textContent = `${extinguishedCount}/17`;

    playVoice(index);

    if (extinguishedCount === 17) {
        progress.classList.add('complete');
        progress.textContent = '🎉 完成！';

        celebrate();

        setTimeout(() => {
            showFinalImageAndVoice();
        }, 3000);
    }
}

function playVoice(index) {
    const audio = new Audio(voiceFiles[index]);
    audio.volume = 1.0;

    const promise = audio.play();
    if (promise !== undefined) {
        promise.catch(err => {
            console.log('播放失败:', voiceFiles[index], err.message);
        });
    }
}

function celebrate() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: ${Math.random() * 10 + 5}px;
                height: ${Math.random() * 10 + 5}px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}vw;
                top: -10px;
                border-radius: 50%;
                z-index: 9999;
                animation: fall ${Math.random() * 3 + 2}s linear forwards;
            `;
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 5000);
        }, i * 30);
    }
}

function showFinalImageAndVoice() {
    const img = document.createElement('img');
    img.src = 'ew.png';
    img.id = 'final-image';
    img.style.cssText = `
        position: fixed;
        bottom: 45%;
        right: 20%;
        transform: none;
        width: 200px;
        height: auto;
        z-index: 1000;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        animation: fadeIn 1s ease-out;
    `;
    document.body.appendChild(img);

    setTimeout(() => {
        const finalAudio = new Audio('ew.mp3');
        finalAudio.volume = 1.0;

        finalAudio.play().then(() => {
            finalAudio.addEventListener('ended', () => {
                window.location.href = '../fireworks.html';
            });
        }).catch(err => {
            console.log('播放失败:', err);
            setTimeout(() => {
                window.location.href = '../fireworks.html';
            }, 2000);
        });
    }, 2000);
}

// 样式
const style = document.createElement('style');
style.textContent = `
    @keyframes fall { 
        to { transform: translateY(100vh) rotate(720deg); opacity: 0; } 
    }
    
`;
document.head.appendChild(style);
