/* ============================================
   MAIN CONTROLLER
   Landing Page, Transitions, AR Integration
   ============================================ */

(function () {
    'use strict';

    // Elements
    const preloader = document.getElementById('preloader');
    const floatingHeartsContainer = document.getElementById('floating-hearts');
    const petalRainContainer = document.getElementById('petal-rain');
    const landing = document.getElementById('landing');
    const envelope = document.getElementById('envelope');
    const messageSection = document.getElementById('message-section');
    const arSection = document.getElementById('ar-section');
    const arOverlay = document.getElementById('ar-overlay');
    const arUI = document.getElementById('ar-ui');
    const startARBtn = document.getElementById('startARBtn');
    const skipARBtn = document.getElementById('skipARBtn');
    const resetBtn = document.getElementById('resetBtn');
    const openGiftBtn = document.getElementById('openGiftBtn');
    const musicToggle = document.getElementById('musicToggle');
    const typewriterEl = document.getElementById('typewriter');
    const crosshair = document.getElementById('crosshair');
    const tapHint = document.getElementById('tapHint');
    const finaleOverlay = document.getElementById('finale-overlay');
    const replayBtn = document.getElementById('replayBtn');
    const cameraFeed = document.getElementById('camera-feed');

    // State
    let arScene = null;
    let music = null;
    let cameraStream = null;
    let currentSection = 'landing';

    // ========== INIT ==========

    function init() {
        music = new RomanticMusic();

        createFloatingHearts();
        createPetalRain();

        // Hide preloader
        setTimeout(() => {
            preloader.classList.add('hidden');
        }, 2000);

        // Envelope click
        envelope.addEventListener('click', openEnvelope);
        envelope.addEventListener('touchend', (e) => {
            e.preventDefault();
            openEnvelope();
        });

        // Gift button
        openGiftBtn.addEventListener('click', goToAR);

        // AR buttons
        startARBtn.addEventListener('click', startWithCamera);
        skipARBtn.addEventListener('click', startWithoutCamera);
        resetBtn.addEventListener('click', resetAR);

        // Music toggle
        musicToggle.addEventListener('click', toggleMusic);

        // Replay
        replayBtn.addEventListener('click', replayExperience);

        // Canvas tap for placing
        const arCanvas = document.getElementById('ar-canvas');
        arCanvas.addEventListener('click', onCanvasTap);
        arCanvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            onCanvasTap();
        });
    }

    // ========== FLOATING HEARTS ==========

    function createFloatingHearts() {
        const hearts = ['&#10084;', '&#10085;', '&#9829;'];
        for (let i = 0; i < 15; i++) {
            const heart = document.createElement('div');
            heart.className = 'floating-heart';
            heart.innerHTML = hearts[Math.floor(Math.random() * hearts.length)];
            heart.style.setProperty('--left', Math.random() * 100 + '%');
            heart.style.setProperty('--size', (12 + Math.random() * 20) + 'px');
            heart.style.setProperty('--duration', (6 + Math.random() * 8) + 's');
            heart.style.setProperty('--delay', (Math.random() * 8) + 's');
            heart.style.setProperty('--sway', ((Math.random() - 0.5) * 80) + 'px');
            heart.style.setProperty('--sway-end', ((Math.random() - 0.5) * 60) + 'px');
            heart.style.setProperty('--max-opacity', (0.3 + Math.random() * 0.4).toFixed(2));
            heart.style.setProperty('--blur', (Math.random() > 0.7 ? '1px' : '0px'));
            floatingHeartsContainer.appendChild(heart);
        }
    }

    // ========== PETAL RAIN ==========

    function createPetalRain() {
        const colors = ['#E8849A', '#FFD6E0', '#C41E3A', '#ff69b4', '#E74C6F'];
        for (let i = 0; i < 20; i++) {
            const petal = document.createElement('div');
            petal.className = 'petal';
            petal.style.setProperty('--petal-left', Math.random() * 100 + '%');
            petal.style.setProperty('--petal-w', (8 + Math.random() * 10) + 'px');
            petal.style.setProperty('--petal-h', (10 + Math.random() * 12) + 'px');
            petal.style.setProperty('--petal-color', colors[Math.floor(Math.random() * colors.length)]);
            petal.style.setProperty('--fall-dur', (5 + Math.random() * 6) + 's');
            petal.style.setProperty('--fall-delay', (Math.random() * 10) + 's');
            petal.style.setProperty('--petal-rot', (360 + Math.random() * 720) + 'deg');
            petal.style.setProperty('--petal-drift', ((Math.random() - 0.5) * 150) + 'px');
            petalRainContainer.appendChild(petal);
        }
    }

    // ========== ENVELOPE OPEN ==========

    function openEnvelope() {
        if (envelope.classList.contains('open')) return;

        // Start music on first interaction
        startMusic();

        envelope.classList.add('open');

        // Transition to message after letter animates
        setTimeout(() => {
            switchSection('message');
        }, 1200);
    }

    // ========== MESSAGE SECTION ANIMATIONS ==========

    function showMessageAnimations() {
        const titleFor = document.querySelector('.title-for');
        const titleName = document.querySelector('.title-name');
        const divider = document.querySelector('.heart-divider');
        const poemLines = document.querySelectorAll('.poem-line, .poem-signature');
        const giftBtn = document.querySelector('.gift-btn');

        // Stagger animations
        setTimeout(() => titleFor.classList.add('visible'), 300);
        setTimeout(() => titleName.classList.add('visible'), 800);
        setTimeout(() => divider.classList.add('visible'), 1500);

        // Typewriter
        setTimeout(() => {
            typewriterEffect('Every love story is beautiful, but ours is my favorite...');
        }, 2000);

        // Poem lines
        setTimeout(() => {
            poemLines.forEach(line => line.classList.add('visible'));
        }, 5000);

        // Gift button
        setTimeout(() => giftBtn.classList.add('visible'), 8000);
    }

    function typewriterEffect(text) {
        let i = 0;
        typewriterEl.innerHTML = '';
        const cursor = document.createElement('span');
        cursor.className = 'typewriter-cursor';

        function type() {
            if (i < text.length) {
                typewriterEl.textContent = text.substring(0, i + 1);
                typewriterEl.appendChild(cursor);
                i++;
                setTimeout(type, 50 + Math.random() * 30);
            }
        }
        type();
    }

    // ========== SECTION TRANSITIONS ==========

    function switchSection(name) {
        // Fade out current
        const current = document.querySelector('section.active');
        if (current) {
            current.classList.remove('active');
        }

        currentSection = name;

        setTimeout(() => {
            if (name === 'message') {
                messageSection.classList.add('active');
                showMessageAnimations();
            } else if (name === 'ar') {
                arSection.classList.add('active');
            }
        }, 500);
    }

    // ========== AR SECTION ==========

    function goToAR() {
        switchSection('ar');
    }

    async function startWithCamera() {
        arOverlay.classList.add('hidden');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false,
            });
            cameraStream = stream;
            cameraFeed.srcObject = stream;
            cameraFeed.style.display = 'block';

            // Init AR scene with camera background
            initARScene(true);
        } catch (err) {
            console.warn('Camera not available, falling back:', err);
            // Fallback to non-camera mode
            startWithoutCamera();
        }
    }

    function startWithoutCamera() {
        arOverlay.classList.add('hidden');
        initARScene(false);
    }

    function initARScene(withCamera) {
        arScene = new ARScene();
        arScene.init(document.getElementById('scene-container'), withCamera);

        // Show UI
        arUI.classList.remove('hidden');

        // Set finale callback
        arScene.onFinale = showFinale;
    }

    function onCanvasTap() {
        if (!arScene || arScene.placed) return;

        // Place the gift and start animation
        arScene.placeAndStart();

        // Hide crosshair and tap hint
        crosshair.classList.add('hidden');
        tapHint.classList.add('hidden');
    }

    function resetAR() {
        if (arScene) {
            arScene.reset();
            crosshair.classList.remove('hidden');
            tapHint.classList.remove('hidden');
            finaleOverlay.classList.add('hidden');
            finaleOverlay.classList.remove('visible');
        }
    }

    // ========== FINALE ==========

    function showFinale() {
        finaleOverlay.classList.remove('hidden');
        // Trigger reflow
        void finaleOverlay.offsetHeight;
        finaleOverlay.classList.add('visible');

        // Spawn finale hearts
        spawnFinaleHearts();
    }

    function spawnFinaleHearts() {
        const container = finaleOverlay.querySelector('.finale-hearts');
        const hearts = ['&#10084;', '&#10085;', '&#9829;'];
        for (let i = 0; i < 30; i++) {
            const heart = document.createElement('div');
            heart.className = 'floating-heart';
            heart.innerHTML = hearts[Math.floor(Math.random() * hearts.length)];
            heart.style.setProperty('--left', Math.random() * 100 + '%');
            heart.style.setProperty('--size', (15 + Math.random() * 25) + 'px');
            heart.style.setProperty('--duration', (5 + Math.random() * 6) + 's');
            heart.style.setProperty('--delay', (Math.random() * 4) + 's');
            heart.style.setProperty('--sway', ((Math.random() - 0.5) * 100) + 'px');
            heart.style.setProperty('--sway-end', ((Math.random() - 0.5) * 80) + 'px');
            heart.style.setProperty('--max-opacity', (0.4 + Math.random() * 0.4).toFixed(2));
            heart.style.setProperty('--blur', '0px');
            container.appendChild(heart);
        }
    }

    function replayExperience() {
        // Reset everything
        finaleOverlay.classList.add('hidden');
        finaleOverlay.classList.remove('visible');

        // Stop camera
        if (cameraStream) {
            cameraStream.getTracks().forEach(t => t.stop());
            cameraStream = null;
            cameraFeed.style.display = 'none';
            cameraFeed.srcObject = null;
        }

        // Reset AR
        if (arScene) {
            arScene.reset();
        }

        // Clean up DOM
        arUI.classList.add('hidden');
        arOverlay.classList.remove('hidden');

        // Clear finale hearts
        const fh = finaleOverlay.querySelector('.finale-hearts');
        fh.innerHTML = '';

        // Reset classes
        arSection.classList.remove('active');
        messageSection.classList.remove('active');
        landing.classList.add('active');
        envelope.classList.remove('open');

        // Reset message animations
        document.querySelectorAll('.title-line, .heart-divider, .poem-line, .poem-signature, .gift-btn')
            .forEach(el => el.classList.remove('visible'));
        typewriterEl.innerHTML = '';

        currentSection = 'landing';
    }

    // ========== MUSIC ==========

    function startMusic() {
        if (music && !music.playing) {
            music.start();
        }
    }

    function toggleMusic() {
        if (!music) return;

        if (!music.playing) {
            music.start();
            musicToggle.classList.remove('muted');
        } else {
            const isMuted = music.toggleMute();
            musicToggle.classList.toggle('muted', isMuted);
        }
    }

    // ========== GO ==========

    document.addEventListener('DOMContentLoaded', init);

})();
