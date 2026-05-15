document.addEventListener('DOMContentLoaded', function () {
    const audio = document.getElementById('birthday-song');
    const subtitleText = document.getElementById('subtitle-text');
    const cursor = document.getElementById('cursor');
    const progressBar = document.getElementById('progress-bar');
    const visualizer = document.getElementById('visualizer');
    const particlesContainer = document.getElementById('transition-particles');

    const username = localStorage.getItem('birthdayUser') || '寿星';

    const subtitles = [
        { time: 0.5, text: '🎵 祝你生日快乐~', type: 'fade' },
        { time: 5.5, text: '祝你生日快乐~', type: 'fade' },
        { time: 10.5, text: '亲爱的 ' + username + '，祝你生日快乐~', type: 'typewriter' },
        { time: 16.0, text: '愿你的每一天都闪闪发光 ✨', type: 'fade' },
        { time: 21.0, text: '许下心愿，吹灭蜡烛吧 🎂', type: 'typewriter' },
        { time: 25.5, text: '3... 2... 1... 🎉', type: 'countdown' },
    ];

    let currentSubtitleIndex = -1;
    let isFinished = false;
    let audioDuration = 28;
    let subtitleInterval = null;
    let progressInterval = null;

    function createParticles() {
        const items = ['✨', '🌟', '💫', '🎵', '🎶', '💖', '🎊', '🎈'];
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'transition-particle';
            particle.textContent = items[Math.floor(Math.random() * items.length)];
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 5 + 's';
            particle.style.animationDuration = (Math.random() * 4 + 6) + 's';
            particlesContainer.appendChild(particle);
        }
    }
    createParticles();

    const savedAudioSrc = localStorage.getItem('birthdayAudioSrc');
    audio.src = savedAudioSrc || '../assets/music/music.mp3';
    audio.preload = 'auto';

    function startPlayback() {
        audio.volume = 0.8;
        audio.play().then(() => {
            startSubtitleLoop();
            startProgressLoop();
            startVisualizer();
        }).catch(() => { showPlayButton(); });
    }

    function showPlayButton() {
        const btn = document.createElement('div');
        btn.className = 'play-button';
        btn.innerHTML = '<span class="play-icon">▶</span><span>点击播放祝福曲</span>';
        btn.addEventListener('click', () => {
            btn.style.transform = 'scale(0.9)';
            setTimeout(() => btn.remove(), 200);
            audio.play().then(() => {
                startSubtitleLoop();
                startProgressLoop();
                startVisualizer();
            });
        });
        document.body.appendChild(btn);
    }

    function startSubtitleLoop() {
        subtitleInterval = setInterval(() => {
            if (isFinished) return;
            const currentTime = audio.currentTime;
            let activeIndex = -1;
            for (let i = subtitles.length - 1; i >= 0; i--) {
                if (currentTime >= subtitles[i].time) { activeIndex = i; break; }
            }
            if (activeIndex !== -1 && currentSubtitleIndex !== activeIndex) {
                currentSubtitleIndex = activeIndex;
                showSubtitle(subtitles[activeIndex]);
            }
            if (audio.ended || currentTime >= audioDuration - 0.3) {
                clearInterval(subtitleInterval);
                clearInterval(progressInterval);
                setTimeout(() => goToBirthday(), 600);
            }
        }, 100);
    }

    function showSubtitle(subtitle) {
        subtitleText.style.opacity = '0';
        subtitleText.style.transform = 'translateY(20px) scale(0.95)';
        cursor.style.display = 'none';
        setTimeout(() => {
            if (subtitle.type === 'typewriter') {
                typewriterEffect(subtitle.text);
            } else if (subtitle.type === 'countdown') {
                countdownEffect(subtitle.text);
            } else {
                subtitleText.textContent = subtitle.text;
                subtitleText.style.opacity = '1';
                subtitleText.style.transform = 'translateY(0) scale(1)';
            }
        }, 350);
    }

    function typewriterEffect(text) {
        subtitleText.textContent = '';
        subtitleText.style.opacity = '1';
        subtitleText.style.transform = 'translateY(0) scale(1)';
        cursor.style.display = 'inline-block';
        let i = 0;
        const typeInterval = setInterval(() => {
            if (isFinished) { clearInterval(typeInterval); return; }
            if (i < text.length) { subtitleText.textContent += text[i]; i++; }
            else { clearInterval(typeInterval); cursor.style.display = 'none'; }
        }, 70);
    }

    function countdownEffect(text) {
        subtitleText.textContent = text;
        subtitleText.style.opacity = '1';
        subtitleText.style.transform = 'translateY(0) scale(1.3)';
        subtitleText.style.fontWeight = '700';
        subtitleText.style.letterSpacing = '4px';
        setTimeout(() => {
            subtitleText.style.transform = 'translateY(0) scale(1)';
            subtitleText.style.letterSpacing = '2px';
        }, 400);
    }

    function startProgressLoop() {
        progressInterval = setInterval(() => {
            if (isFinished) return;
            const progress = Math.min((audio.currentTime / audioDuration) * 100, 100);
            progressBar.style.width = progress + '%';
        }, 50);
    }

    function startVisualizer() {
        const bars = visualizer.querySelectorAll('.bar');
        bars.forEach((bar, index) => {
            bar.style.animation = 'musicBar ' + (0.4 + index * 0.08) + 's ease-in-out infinite alternate';
            bar.style.animationDelay = (index * 0.08) + 's';
        });
        visualizer.style.opacity = '1';
    }

    function goToBirthday() {
        if (isFinished) return;
        isFinished = true;
        clearInterval(subtitleInterval);
        clearInterval(progressInterval);
        document.body.style.transition = 'opacity 1.2s ease-in-out';
        document.body.style.opacity = '0';
        const fadeOut = setInterval(() => {
            if (audio.volume > 0.05) { audio.volume -= 0.05; }
            else { clearInterval(fadeOut); audio.pause(); }
        }, 60);
        setTimeout(() => { window.location.href = 'birthday.html'; }, 1200);
    }

    setTimeout(startPlayback, 300);
});