/* ============================================
   ROMANTIC MUSIC - Web Audio API Synthesizer
   Plays a gentle romantic melody with piano,
   strings pad, and soft bass
   ============================================ */

class RomanticMusic {
    constructor() {
        this.ctx = null;
        this.playing = false;
        this.muted = false;
        this.masterGain = null;
        this.initialized = false;
        this.scheduledNotes = [];
        this.loopInterval = null;
        this.tempo = 72; // BPM
        this.beatDuration = 60 / this.tempo;
    }

    init() {
        if (this.initialized) return;

        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0;
            this.masterGain.connect(this.ctx.destination);

            // Reverb
            this.reverb = this.createReverb();
            this.reverbGain = this.ctx.createGain();
            this.reverbGain.gain.value = 0.3;
            this.reverbGain.connect(this.reverb);
            this.reverb.connect(this.masterGain);

            // Dry
            this.dryGain = this.ctx.createGain();
            this.dryGain.gain.value = 0.7;
            this.dryGain.connect(this.masterGain);

            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio not supported:', e);
        }
    }

    createReverb() {
        const length = this.ctx.sampleRate * 2.5;
        const impulse = this.ctx.createBuffer(2, length, this.ctx.sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const data = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
            }
        }

        const convolver = this.ctx.createConvolver();
        convolver.buffer = impulse;
        return convolver;
    }

    // Piano-like tone using multiple oscillators
    playPianoNote(freq, time, duration, velocity = 0.15) {
        if (!this.initialized || !this.ctx) return;

        const now = this.ctx.currentTime;
        const startTime = now + time;

        // Fundamental
        const osc1 = this.ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.value = freq;

        // 2nd harmonic
        const osc2 = this.ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.value = freq * 2;

        // 3rd harmonic (soft)
        const osc3 = this.ctx.createOscillator();
        osc3.type = 'sine';
        osc3.frequency.value = freq * 3;

        // Gain envelopes
        const gain1 = this.ctx.createGain();
        const gain2 = this.ctx.createGain();
        const gain3 = this.ctx.createGain();

        // Piano-like envelope: fast attack, sustained decay
        const attack = 0.01;
        const decay = duration * 0.3;
        const sustain = velocity * 0.6;
        const release = duration * 0.5;

        [gain1, gain2, gain3].forEach((gain, idx) => {
            const vol = velocity * [1, 0.25, 0.08][idx];
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(vol, startTime + attack);
            gain.gain.exponentialRampToValueAtTime(
                Math.max(sustain * [1, 0.25, 0.08][idx], 0.001),
                startTime + attack + decay
            );
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        });

        osc1.connect(gain1);
        osc2.connect(gain2);
        osc3.connect(gain3);

        gain1.connect(this.dryGain);
        gain1.connect(this.reverbGain);
        gain2.connect(this.dryGain);
        gain3.connect(this.dryGain);

        osc1.start(startTime);
        osc2.start(startTime);
        osc3.start(startTime);
        osc1.stop(startTime + duration + 0.1);
        osc2.stop(startTime + duration + 0.1);
        osc3.stop(startTime + duration + 0.1);
    }

    // Warm string pad
    playStringPad(freq, time, duration, velocity = 0.06) {
        if (!this.initialized || !this.ctx) return;

        const now = this.ctx.currentTime;
        const startTime = now + time;

        // Detuned oscillators for warmth
        for (let d = -1; d <= 1; d++) {
            const osc = this.ctx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.value = freq * Math.pow(2, d * 3 / 1200); // +-3 cents detune

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 800;
            filter.Q.value = 0.5;

            const gain = this.ctx.createGain();
            const vol = velocity / 3;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(vol, startTime + duration * 0.3);
            gain.gain.setValueAtTime(vol, startTime + duration * 0.7);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.dryGain);
            gain.connect(this.reverbGain);

            osc.start(startTime);
            osc.stop(startTime + duration + 0.1);
        }
    }

    // Soft bass note
    playBass(freq, time, duration, velocity = 0.1) {
        if (!this.initialized || !this.ctx) return;

        const now = this.ctx.currentTime;
        const startTime = now + time;

        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 200;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(velocity, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.dryGain);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.1);
    }

    // Note name to frequency
    noteToFreq(note) {
        const notes = {
            'C3': 130.81, 'D3': 146.83, 'Eb3': 155.56, 'E3': 164.81, 'F3': 174.61,
            'G3': 196.00, 'Ab3': 207.65, 'A3': 220.00, 'Bb3': 233.08, 'B3': 246.94,
            'C4': 261.63, 'D4': 293.66, 'Eb4': 311.13, 'E4': 329.63, 'F4': 349.23,
            'G4': 392.00, 'Ab4': 415.30, 'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88,
            'C5': 523.25, 'D5': 587.33, 'Eb5': 622.25, 'E5': 659.26, 'F5': 698.46,
            'G5': 783.99, 'Ab5': 830.61, 'A5': 880.00,
            'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00,
            'A2': 110.00, 'B2': 123.47, 'Ab2': 103.83, 'Bb2': 116.54, 'Eb2': 77.78,
        };
        return notes[note] || 440;
    }

    // Play the romantic melody loop
    playMelodyLoop() {
        const b = this.beatDuration;

        // Melody in Eb Major - gentle romantic feel
        // "Thinking Out Loud"-style gentle progression
        const melody = [
            // Bar 1 - Eb major
            { note: 'Eb4', time: 0, dur: b },
            { note: 'G4', time: b, dur: b },
            { note: 'Bb4', time: b * 2, dur: b * 1.5 },
            { note: 'Ab4', time: b * 3.5, dur: b * 0.5 },
            // Bar 2 - Ab major
            { note: 'Ab4', time: b * 4, dur: b },
            { note: 'G4', time: b * 5, dur: b },
            { note: 'F4', time: b * 6, dur: b * 1.5 },
            { note: 'Eb4', time: b * 7.5, dur: b * 0.5 },
            // Bar 3 - Bb
            { note: 'G4', time: b * 8, dur: b },
            { note: 'Bb4', time: b * 9, dur: b * 1.5 },
            { note: 'C5', time: b * 10.5, dur: b * 0.5 },
            { note: 'Bb4', time: b * 11, dur: b },
            // Bar 4 - Eb resolve
            { note: 'Ab4', time: b * 12, dur: b },
            { note: 'G4', time: b * 13, dur: b * 1.5 },
            { note: 'Eb4', time: b * 14.5, dur: b * 1.5 },

            // Bar 5 - variation
            { note: 'Eb5', time: b * 16, dur: b },
            { note: 'D5', time: b * 17, dur: b * 0.5 },
            { note: 'Eb5', time: b * 17.5, dur: b * 0.5 },
            { note: 'C5', time: b * 18, dur: b * 1.5 },
            { note: 'Bb4', time: b * 19.5, dur: b * 0.5 },
            // Bar 6
            { note: 'Ab4', time: b * 20, dur: b },
            { note: 'Bb4', time: b * 21, dur: b },
            { note: 'G4', time: b * 22, dur: b * 2 },
            // Bar 7
            { note: 'Eb4', time: b * 24, dur: b * 1.5 },
            { note: 'F4', time: b * 25.5, dur: b * 0.5 },
            { note: 'G4', time: b * 26, dur: b },
            { note: 'Ab4', time: b * 27, dur: b },
            // Bar 8 - resolve
            { note: 'G4', time: b * 28, dur: b * 1.5 },
            { note: 'Eb4', time: b * 29.5, dur: b * 2.5 },
        ];

        // String pad chords
        const chords = [
            { notes: ['Eb3', 'G3', 'Bb3'], time: 0, dur: b * 4 },
            { notes: ['Ab3', 'C4', 'Eb4'], time: b * 4, dur: b * 4 },
            { notes: ['Bb3', 'D4', 'F4'], time: b * 8, dur: b * 4 },
            { notes: ['Eb3', 'G3', 'Bb3'], time: b * 12, dur: b * 4 },
            { notes: ['Ab3', 'C4', 'Eb4'], time: b * 16, dur: b * 4 },
            { notes: ['Bb3', 'D4', 'F4'], time: b * 20, dur: b * 4 },
            { notes: ['G3', 'Bb3', 'D4'], time: b * 24, dur: b * 4 },
            { notes: ['Ab3', 'Bb3', 'Eb4'], time: b * 28, dur: b * 4 },
        ];

        // Bass line
        const bass = [
            { note: 'Eb2', time: 0, dur: b * 4 },
            { note: 'Ab2', time: b * 4, dur: b * 4 },
            { note: 'Bb2', time: b * 8, dur: b * 4 },
            { note: 'Eb2', time: b * 12, dur: b * 4 },
            { note: 'Ab2', time: b * 16, dur: b * 4 },
            { note: 'Bb2', time: b * 20, dur: b * 4 },
            { note: 'G2', time: b * 24, dur: b * 4 },
            { note: 'Bb2', time: b * 28, dur: b * 4 },
        ];

        // Schedule melody
        melody.forEach(n => {
            this.playPianoNote(this.noteToFreq(n.note), n.time, n.dur, 0.12);
        });

        // Schedule strings
        chords.forEach(c => {
            c.notes.forEach(note => {
                this.playStringPad(this.noteToFreq(note), c.time, c.dur, 0.04);
            });
        });

        // Schedule bass
        bass.forEach(n => {
            this.playBass(this.noteToFreq(n.note), n.time, n.dur, 0.08);
        });
    }

    start() {
        if (!this.initialized) this.init();
        if (!this.ctx) return;

        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        this.playing = true;

        // Fade in
        this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
        this.masterGain.gain.linearRampToValueAtTime(0.8, this.ctx.currentTime + 2);

        // Play first loop
        this.playMelodyLoop();

        // Loop every 32 beats
        const loopDuration = this.beatDuration * 32 * 1000;
        this.loopInterval = setInterval(() => {
            if (this.playing && !this.muted) {
                this.playMelodyLoop();
            }
        }, loopDuration);
    }

    stop() {
        this.playing = false;
        if (this.loopInterval) {
            clearInterval(this.loopInterval);
            this.loopInterval = null;
        }
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
            this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
            this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        if (!this.ctx) return;

        if (this.muted) {
            this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
            this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
            this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
        } else {
            this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
            this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
            this.masterGain.gain.linearRampToValueAtTime(0.8, this.ctx.currentTime + 0.3);
            // Restart loop if needed
            if (this.playing && !this.loopInterval) {
                this.playMelodyLoop();
                const loopDuration = this.beatDuration * 32 * 1000;
                this.loopInterval = setInterval(() => {
                    if (this.playing && !this.muted) this.playMelodyLoop();
                }, loopDuration);
            }
        }
        return this.muted;
    }
}

window.RomanticMusic = RomanticMusic;
