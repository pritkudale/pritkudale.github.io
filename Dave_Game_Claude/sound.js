// Dangerous Dave - Sound System (Web Audio API)
const Sound = (() => {
    let ctx = null;
    let enabled = true;
    let musicEnabled = true;
    let musicOsc = null;
    let musicGain = null;
    let musicInterval = null;

    function init() {
        try {
            ctx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            enabled = false;
        }
    }

    function resume() {
        if (ctx && ctx.state === 'suspended') {
            ctx.resume();
        }
    }

    function playTone(freq, duration, type = 'square', volume = 0.15) {
        if (!ctx || !enabled) return;
        resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
    }

    function playNoise(duration, volume = 0.1) {
        if (!ctx || !enabled) return;
        resume();
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        source.connect(gain);
        gain.connect(ctx.destination);
        source.start();
    }

    // Sound effects
    function jump() {
        playTone(300, 0.1, 'square', 0.12);
        setTimeout(() => playTone(400, 0.1, 'square', 0.10), 50);
        setTimeout(() => playTone(500, 0.1, 'square', 0.08), 100);
    }

    function collect() {
        playTone(800, 0.08, 'square', 0.12);
        setTimeout(() => playTone(1000, 0.08, 'square', 0.10), 60);
        setTimeout(() => playTone(1200, 0.12, 'square', 0.08), 120);
    }

    function key() {
        playTone(600, 0.1, 'square', 0.12);
        setTimeout(() => playTone(800, 0.1, 'square', 0.12), 100);
        setTimeout(() => playTone(1000, 0.1, 'square', 0.12), 200);
        setTimeout(() => playTone(1200, 0.15, 'square', 0.10), 300);
    }

    function gun() {
        playTone(200, 0.1, 'square', 0.15);
        setTimeout(() => playTone(300, 0.1, 'square', 0.12), 80);
    }

    function shoot() {
        playNoise(0.08, 0.15);
        playTone(800, 0.05, 'sawtooth', 0.1);
    }

    function enemyDie() {
        playTone(400, 0.1, 'square', 0.15);
        setTimeout(() => playTone(300, 0.1, 'square', 0.12), 80);
        setTimeout(() => playTone(200, 0.15, 'square', 0.10), 160);
    }

    function die() {
        playTone(400, 0.15, 'square', 0.2);
        setTimeout(() => playTone(300, 0.15, 'square', 0.18), 150);
        setTimeout(() => playTone(200, 0.15, 'square', 0.15), 300);
        setTimeout(() => playTone(100, 0.3, 'square', 0.12), 450);
    }

    function levelComplete() {
        const notes = [523, 587, 659, 784, 880, 1047];
        notes.forEach((n, i) => {
            setTimeout(() => playTone(n, 0.15, 'square', 0.12), i * 100);
        });
    }

    function gameOver() {
        const notes = [400, 350, 300, 250, 200, 150];
        notes.forEach((n, i) => {
            setTimeout(() => playTone(n, 0.25, 'square', 0.15), i * 200);
        });
    }

    function doorOpen() {
        playTone(500, 0.1, 'square', 0.12);
        setTimeout(() => playTone(600, 0.1, 'square', 0.12), 100);
        setTimeout(() => playTone(700, 0.15, 'square', 0.10), 200);
    }

    function jetpack() {
        playNoise(0.05, 0.05);
    }

    // Background music - simple melody loop
    function startMusic() {
        if (!ctx || !musicEnabled) return;
        stopMusic();
        resume();

        // Simple Dangerous Dave-style melody
        const melody = [
            262, 294, 330, 262, 330, 349, 392, 0,
            392, 440, 392, 349, 330, 294, 262, 0,
            330, 349, 392, 440, 392, 349, 330, 294,
            262, 294, 330, 349, 330, 294, 262, 0,
        ];
        let noteIndex = 0;
        const tempo = 180; // ms per note

        musicInterval = setInterval(() => {
            if (!musicEnabled) return;
            const freq = melody[noteIndex % melody.length];
            if (freq > 0) {
                playTone(freq, tempo / 1200, 'square', 0.06);
            }
            noteIndex++;
        }, tempo);
    }

    function stopMusic() {
        if (musicInterval) {
            clearInterval(musicInterval);
            musicInterval = null;
        }
    }

    function toggleSound() {
        enabled = !enabled;
        if (!enabled) stopMusic();
        return enabled;
    }

    function toggleMusic() {
        musicEnabled = !musicEnabled;
        if (!musicEnabled) stopMusic();
        else startMusic();
        return musicEnabled;
    }

    return {
        init,
        resume,
        jump,
        collect,
        key,
        gun,
        shoot,
        enemyDie,
        die,
        levelComplete,
        gameOver,
        doorOpen,
        jetpack,
        startMusic,
        stopMusic,
        toggleSound,
        toggleMusic,
        isEnabled: () => enabled,
        isMusicEnabled: () => musicEnabled,
    };
})();
