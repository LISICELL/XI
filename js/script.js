document.addEventListener('DOMContentLoaded', function () {
    const loginBtn = document.getElementById('login-btn');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');
    const particlesContainer = document.getElementById('particles');

    const correctPassword = "0516";

    const birthdayItems = ['🎈', '🎁', '🎊', '✨', '🌟', '💫', '🎀', '🕯️', '🍰', '🎵'];
    function createParticles() {
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.textContent = birthdayItems[Math.floor(Math.random() * birthdayItems.length)];
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
            particle.style.animationDelay = (Math.random() * 10) + 's';
            particle.style.fontSize = (Math.random() * 15 + 15) + 'px';
            particlesContainer.appendChild(particle);
        }
    }
    createParticles();

    function preloadAudio() {
        const audio = new Audio();
        audio.src = 'assets/music/music.mp3';
        audio.preload = 'auto';
        audio.volume = 0;
        audio.play().then(() => {
            audio.pause();
            audio.currentTime = 0;
            console.log('音频权限已解锁');
        }).catch(() => {
            console.log('音频预加载失败，将在过渡页手动触发');
        });
        return audio.src;
    }

    loginBtn.addEventListener('click', login);
    passwordInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') login();
    });

    function login() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            showError('请输入你的名字和启动密钥', 'error');
            return;
        }

        if (password === correctPassword) {
            showError('验证成功，准备生日惊喜...', 'success');
            localStorage.setItem('birthdayUser', username);
            
            const audioSrc = preloadAudio();
            localStorage.setItem('birthdayAudioSrc', audioSrc);
            
            setTimeout(() => {
                document.body.style.transition = 'opacity 0.8s ease';
                document.body.style.opacity = '0';
                
                setTimeout(() => {
                    window.location.href = 'pages/transition.html';
                }, 800);
            }, 1000);
        } else {
            showError('密钥是你的生日哦！', 'error');
            loginBtn.classList.add('shake');
            setTimeout(() => loginBtn.classList.remove('shake'), 500);
        }
    }

    function showError(msg, type) {
        errorMessage.textContent = msg;
        errorMessage.className = 'error-message ' + (type === 'success' ? 'success-text' : 'error-text');
    }

    usernameInput.addEventListener('input', () => {
        errorMessage.textContent = '';
    });
    passwordInput.addEventListener('input', () => {
        errorMessage.textContent = '';
    });

    [usernameInput, passwordInput].forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.style.transform = 'scale(1.02)';
        });
        input.addEventListener('blur', () => {
            input.parentElement.style.transform = 'scale(1)';
        });
    });
});