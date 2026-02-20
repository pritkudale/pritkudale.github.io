// Dangerous Dave - Pixel Art Sprite System
// All sprites drawn programmatically on offscreen canvases

const Sprites = (() => {
    const cache = {};
    const TILE = 16;

    function createCanvas(w, h) {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        return c;
    }

    function drawPixels(ctx, pixels, palette, ox = 0, oy = 0) {
        for (let y = 0; y < pixels.length; y++) {
            for (let x = 0; x < pixels[y].length; x++) {
                const c = pixels[y][x];
                if (c !== '.' && palette[c]) {
                    ctx.fillStyle = palette[c];
                    ctx.fillRect(ox + x, oy + y, 1, 1);
                }
            }
        }
    }

    // Color palettes matching original Dave
    const PAL = {
        dave: {
            'R': '#ff0000', 'r': '#cc0000', 'W': '#ffffff', 'w': '#cccccc',
            'B': '#0000ff', 'b': '#0000aa', 'S': '#ffaa55', 's': '#cc8844',
            'H': '#ff6644', 'h': '#cc4422', 'G': '#00aa00', 'g': '#008800',
            'Y': '#ffff00', 'P': '#ff88ff', 'K': '#000000', 'D': '#664422',
        },
        tile: {
            'R': '#aa0000', 'r': '#880000', 'B': '#0055aa', 'b': '#003366',
            'G': '#00aa00', 'g': '#008800', 'W': '#aaaaaa', 'w': '#888888',
            'D': '#664422', 'd': '#442200', 'C': '#00aaaa', 'c': '#008888',
            'Y': '#aaaa00', 'y': '#888800', 'K': '#222222', 'k': '#111111',
            'P': '#aa55aa', 'p': '#883388', 'O': '#aa5500', 'o': '#883300',
            'L': '#aaaaff', 'l': '#8888cc', 'T': '#cc8844', 't': '#aa6622',
        },
        item: {
            'R': '#ff0000', 'r': '#cc0000', 'G': '#00ff00', 'g': '#00aa00',
            'B': '#5555ff', 'b': '#3333cc', 'Y': '#ffff00', 'y': '#cccc00',
            'W': '#ffffff', 'w': '#cccccc', 'C': '#00ffff', 'c': '#00cccc',
            'P': '#ff55ff', 'p': '#cc33cc', 'O': '#ff8800', 'o': '#cc6600',
            'D': '#886644', 'd': '#664422', 'K': '#333333', 'S': '#ffaa55',
            'L': '#aaddff',
        },
        enemy: {
            'R': '#ff0000', 'r': '#aa0000', 'G': '#00ff00', 'g': '#00aa00',
            'B': '#0088ff', 'b': '#0055aa', 'Y': '#ffff00', 'y': '#aaaa00',
            'W': '#ffffff', 'w': '#aaaaaa', 'K': '#000000', 'P': '#ff00ff',
            'p': '#aa00aa', 'O': '#ff8800', 'o': '#aa5500', 'D': '#884400',
        }
    };

    // ========== DAVE SPRITES ==========
    function getDave(frame, dir) {
        const key = `dave_${frame}_${dir}`;
        if (cache[key]) return cache[key];

        const frames = {
            stand: [
                '....RRRR....',
                '...RRRRRR...',
                '...SSSSSS...',
                '...SWSWSW...',
                '...SSKSSS...',
                '...SSSSS....',
                '....BBB.....',
                '...BBBBB....',
                '..BBRBBBB...',
                '..BBBBBBB...',
                '..BBBBBBB...',
                '...BB.BB....',
                '...SS.SS....',
                '...SS.SS....',
                '..DD..DD....',
                '..DD..DD....',
            ],
            walk1: [
                '....RRRR....',
                '...RRRRRR...',
                '...SSSSSS...',
                '...SWSWSW...',
                '...SSKSSS...',
                '...SSSSS....',
                '....BBB.....',
                '...BBBBB....',
                '..BBRBBBB...',
                '..BBBBBBB...',
                '..BBBBBBB...',
                '...BB.BB....',
                '..SS...SS...',
                '.SS.....SS..',
                '.DD.....DD..',
                'DD.......DD.',
            ],
            walk2: [
                '....RRRR....',
                '...RRRRRR...',
                '...SSSSSS...',
                '...SWSWSW...',
                '...SSKSSS...',
                '...SSSSS....',
                '....BBB.....',
                '...BBBBB....',
                '..BBRBBBB...',
                '..BBBBBBB...',
                '..BBBBBBB...',
                '...BB.BB....',
                '...SS.SS....',
                '...DD.DD....',
                '..DD..DD....',
                '..DD..DD....',
            ],
            walk3: [
                '....RRRR....',
                '...RRRRRR...',
                '...SSSSSS...',
                '...SWSWSW...',
                '...SSKSSS...',
                '...SSSSS....',
                '....BBB.....',
                '...BBBBB....',
                '..BBRBBBB...',
                '..BBBBBBB...',
                '..BBBBBBB...',
                '...BB.BB....',
                '..SS...SS...',
                '.DD.....DD..',
                '.DD.......DD',
                'DD..........',
            ],
            jump: [
                '....RRRR....',
                '...RRRRRR...',
                '...SSSSSS...',
                '...SWSWSW...',
                '...SSKSSS...',
                '..SSSSS.....',
                '..BBBBB.....',
                '.BBBBBBB....',
                '.BBRBBBB....',
                '.BBBBBBB....',
                '..BBBBB.....',
                '...BB.BB....',
                '...SS..SS...',
                '..SS....SS..',
                '..DD....DD..',
                '..DD....DD..',
            ],
        };

        const px = frames[frame] || frames.stand;
        const c = createCanvas(12, 16);
        const ctx = c.getContext('2d');

        if (dir === 'left') {
            ctx.translate(12, 0);
            ctx.scale(-1, 1);
        }
        drawPixels(ctx, px.map(r => r.split('')), PAL.dave);
        cache[key] = c;
        return c;
    }

    // ========== TILE SPRITES ==========
    function getBrick() {
        if (cache.brick) return cache.brick;
        const c = createCanvas(16, 16);
        const ctx = c.getContext('2d');
        // Red brick pattern
        ctx.fillStyle = '#aa3333';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#882222';
        // Mortar lines
        ctx.fillRect(0, 3, 16, 1);
        ctx.fillRect(0, 7, 16, 1);
        ctx.fillRect(0, 11, 16, 1);
        ctx.fillRect(0, 15, 16, 1);
        // Vertical mortar - offset per row
        ctx.fillRect(7, 0, 1, 3);
        ctx.fillRect(15, 0, 1, 3);
        ctx.fillRect(3, 4, 1, 3);
        ctx.fillRect(11, 4, 1, 3);
        ctx.fillRect(7, 8, 1, 3);
        ctx.fillRect(15, 8, 1, 3);
        ctx.fillRect(3, 12, 1, 3);
        ctx.fillRect(11, 12, 1, 3);
        // Highlight
        ctx.fillStyle = '#cc4444';
        ctx.fillRect(1, 0, 2, 1);
        ctx.fillRect(9, 0, 2, 1);
        ctx.fillRect(5, 4, 2, 1);
        ctx.fillRect(13, 4, 2, 1);
        ctx.fillRect(1, 8, 2, 1);
        ctx.fillRect(9, 8, 2, 1);
        ctx.fillRect(5, 12, 2, 1);
        ctx.fillRect(13, 12, 2, 1);
        cache.brick = c;
        return c;
    }

    function getBlueWall() {
        if (cache.blueWall) return cache.blueWall;
        const c = createCanvas(16, 16);
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#2244aa';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#1a3388';
        for (let y = 0; y < 16; y += 4) {
            ctx.fillRect(0, y + 3, 16, 1);
        }
        ctx.fillRect(7, 0, 1, 16);
        ctx.fillStyle = '#3355cc';
        ctx.fillRect(1, 1, 2, 1);
        ctx.fillRect(9, 1, 2, 1);
        ctx.fillRect(5, 5, 2, 1);
        ctx.fillRect(13, 5, 2, 1);
        cache.blueWall = c;
        return c;
    }

    function getPurpleWall() {
        if (cache.purpleWall) return cache.purpleWall;
        const c = createCanvas(16, 16);
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#663388';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#552277';
        for (let y = 0; y < 16; y += 4) {
            ctx.fillRect(0, y + 3, 16, 1);
        }
        ctx.fillRect(7, 0, 1, 16);
        ctx.fillStyle = '#8855aa';
        ctx.fillRect(2, 1, 2, 1);
        ctx.fillRect(10, 5, 2, 1);
        cache.purpleWall = c;
        return c;
    }

    function getGrayBrick() {
        if (cache.grayBrick) return cache.grayBrick;
        const c = createCanvas(16, 16);
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#777777';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#555555';
        ctx.fillRect(0, 3, 16, 1);
        ctx.fillRect(0, 7, 16, 1);
        ctx.fillRect(0, 11, 16, 1);
        ctx.fillRect(0, 15, 16, 1);
        ctx.fillRect(7, 0, 1, 3);
        ctx.fillRect(3, 4, 1, 3);
        ctx.fillRect(11, 4, 1, 3);
        ctx.fillRect(7, 8, 1, 3);
        ctx.fillRect(3, 12, 1, 3);
        ctx.fillRect(11, 12, 1, 3);
        ctx.fillStyle = '#999999';
        ctx.fillRect(1, 0, 2, 1);
        ctx.fillRect(9, 0, 2, 1);
        cache.grayBrick = c;
        return c;
    }

    function getPlatform() {
        if (cache.platform) return cache.platform;
        const c = createCanvas(16, 16);
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#886644';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#aa8866';
        ctx.fillRect(0, 0, 16, 2);
        ctx.fillStyle = '#664422';
        ctx.fillRect(0, 14, 16, 2);
        // Wood grain
        ctx.fillStyle = '#775533';
        for (let x = 0; x < 16; x += 5) {
            ctx.fillRect(x, 3, 1, 10);
        }
        cache.platform = c;
        return c;
    }

    function getWater(frame) {
        const key = `water_${frame}`;
        if (cache[key]) return cache[key];
        const c = createCanvas(16, 16);
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#0044aa';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#0066cc';
        const off = (frame % 3) * 3;
        for (let x = -2; x < 18; x += 6) {
            ctx.fillRect((x + off) % 18 - 1, 2, 3, 2);
            ctx.fillRect((x + off + 3) % 18 - 1, 8, 3, 2);
            ctx.fillRect((x + off) % 18 - 1, 14, 3, 2);
        }
        ctx.fillStyle = '#0055bb';
        ctx.fillRect(0, 5, 16, 1);
        ctx.fillRect(0, 11, 16, 1);
        cache[key] = c;
        return c;
    }

    function getFire(frame) {
        const key = `fire_${frame}`;
        if (cache[key]) return cache[key];
        const c = createCanvas(16, 16);
        const ctx = c.getContext('2d');

        const firePixels = [
            [
                '......RR.......',
                '.....RRRR......',
                '....RRYYRR.....',
                '...RRYYYYRR....',
                '..RROYYYYORR...',
                '.RROOYYYYOORR..',
                '.RROOYYYOORR...',
                'RRROOYYYYOORRR.',
                'RRROOYYYOOORRR.',
                'RRROOOOOOOORR..',
                '.RRROOOOOORR...',
                '..RRROOOORRR...',
                '...RRROORR.....',
                '....RRRRRR.....',
                '.....RRRR......',
                '......RR.......',
            ],
            [
                '.......RR......',
                '......RRRR.....',
                '.....RRYYRR....',
                '....RRYYYYR....',
                '...RROYYYYORR..',
                '..RROOYYYYOORR.',
                '.RROOYYYYOORR..',
                '.RROOYYYOORRR..',
                'RRROOYYYYOORRR.',
                'RRROOYYYOOORRR.',
                '.RRROOOOOORR...',
                '..RRROOOORRR...',
                '...RRROORRR....',
                '....RRRRRR.....',
                '.....RRRR......',
                '......RR.......',
            ]
        ];
        const pal = { 'R': '#ff2200', 'O': '#ff8800', 'Y': '#ffff00' };
        drawPixels(ctx, firePixels[frame % 2].map(r => r.split('')), pal);
        cache[key] = c;
        return c;
    }

    function getDoor() {
        if (cache.door) return cache.door;
        const c = createCanvas(16, 32);
        const ctx = c.getContext('2d');
        // Door frame
        ctx.fillStyle = '#886644';
        ctx.fillRect(0, 0, 16, 32);
        // Door panel
        ctx.fillStyle = '#aa4400';
        ctx.fillRect(2, 2, 12, 28);
        // Handle
        ctx.fillStyle = '#ffcc00';
        ctx.fillRect(10, 16, 2, 2);
        // Top arch detail
        ctx.fillStyle = '#cc5500';
        ctx.fillRect(3, 3, 10, 2);
        ctx.fillRect(4, 5, 8, 1);
        // Panel lines
        ctx.fillStyle = '#993300';
        ctx.fillRect(7, 6, 1, 24);
        ctx.fillRect(3, 14, 10, 1);
        cache.door = c;
        return c;
    }

    function getSpike() {
        if (cache.spike) return cache.spike;
        const c = createCanvas(16, 16);
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#888888';
        // Triangle spikes
        for (let i = 0; i < 4; i++) {
            const bx = i * 4;
            for (let row = 0; row < 8; row++) {
                const w = row;
                ctx.fillRect(bx + 2 - Math.floor(w / 2), 8 + row, w || 1, 1);
            }
            ctx.fillStyle = '#aaaaaa';
            ctx.fillRect(bx + 2, 8, 1, 8);
            ctx.fillStyle = '#888888';
        }
        // Base
        ctx.fillStyle = '#666666';
        ctx.fillRect(0, 14, 16, 2);
        cache.spike = c;
        return c;
    }

    function getTree() {
        if (cache.tree) return cache.tree;
        const c = createCanvas(16, 32);
        const ctx = c.getContext('2d');
        // Trunk
        ctx.fillStyle = '#664422';
        ctx.fillRect(6, 16, 4, 16);
        // Foliage layers
        ctx.fillStyle = '#008800';
        ctx.fillRect(2, 4, 12, 6);
        ctx.fillRect(4, 1, 8, 4);
        ctx.fillRect(1, 8, 14, 4);
        ctx.fillRect(3, 12, 10, 5);
        ctx.fillStyle = '#00aa00';
        ctx.fillRect(5, 2, 6, 3);
        ctx.fillRect(3, 5, 10, 4);
        ctx.fillRect(4, 9, 8, 3);
        cache.tree = c;
        return c;
    }

    function getPipe() {
        if (cache.pipe) return cache.pipe;
        const c = createCanvas(16, 16);
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#448844';
        ctx.fillRect(2, 0, 12, 16);
        ctx.fillStyle = '#66aa66';
        ctx.fillRect(4, 0, 3, 16);
        ctx.fillStyle = '#336633';
        ctx.fillRect(11, 0, 2, 16);
        cache.pipe = c;
        return c;
    }

    function getPipeTop() {
        if (cache.pipeTop) return cache.pipeTop;
        const c = createCanvas(16, 16);
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#448844';
        ctx.fillRect(0, 4, 16, 12);
        ctx.fillRect(2, 0, 12, 4);
        ctx.fillStyle = '#66aa66';
        ctx.fillRect(2, 4, 3, 12);
        ctx.fillRect(4, 0, 3, 4);
        ctx.fillStyle = '#336633';
        ctx.fillRect(13, 4, 2, 12);
        ctx.fillRect(11, 0, 2, 4);
        cache.pipeTop = c;
        return c;
    }

    // ========== ITEM SPRITES ==========
    function getDiamond() {
        if (cache.diamond) return cache.diamond;
        const c = createCanvas(16, 16);
        const ctx = c.getContext('2d');
        const px = [
            '......BB.......',
            '.....BCBB......',
            '....BCCBBB.....',
            '...BCCCBBBB....',
            '..BCCCCBBBBB...',
            '.BCCCCCBBBBBB..',
            'BBCCCCBBBBBBB..',
            '.BBCCBBBBBBBB..',
            '..BBCBBBBBBB...',
            '...BBBBBBBBB...',
            '....BBBBBBB....',
            '.....BBBBB.....',
            '......BBB......',
            '.......B.......',
        ];
        const pal = { 'B': '#4488ff', 'C': '#88ccff' };
        drawPixels(ctx, px.map(r => r.split('')), pal, 0, 1);
        cache.diamond = c;
        return c;
    }

    function getRing() {
        if (cache.ring) return cache.ring;
        const c = createCanvas(16, 16);
        const ctx = c.getContext('2d');
        // Gold ring
        ctx.fillStyle = '#ffcc00';
        ctx.fillRect(5, 3, 6, 2);
        ctx.fillRect(3, 5, 2, 6);
        ctx.fillRect(11, 5, 2, 6);
        ctx.fillRect(5, 11, 6, 2);
        ctx.fillStyle = '#ffee44';
        ctx.fillRect(6, 4, 4, 1);
        ctx.fillRect(4, 6, 1, 4);
        // Gem
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(6, 2, 4, 2);
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(7, 2, 2, 1);
        cache.ring = c;
        return c;
    }

    function getCrown() {
        if (cache.crown) return cache.crown;
        const c = createCanvas(16, 16);
        const ctx = c.getContext('2d');
        const px = [
            '..Y...Y...Y....',
            '..YY.YYY.YY....',
            '..YYYYYYYYY....',
            '..YYYYYYYYY....',
            '..YRYYYRYY.....',
            '..YYYYYYYYY....',
            '..YYYYYYYYY....',
            '..YYYYYYYYY....',
            '...YYYYYYYYY...',
        ];
        const pal = { 'Y': '#ffcc00', 'R': '#ff0000' };
        drawPixels(ctx, px.map(r => r.split('')), pal, 1, 4);
        cache.crown = c;
        return c;
    }

    function getTrophy() {
        if (cache.trophy) return cache.trophy;
        const c = createCanvas(16, 16);
        const ctx = c.getContext('2d');
        // Cup
        ctx.fillStyle = '#ffcc00';
        ctx.fillRect(4, 2, 8, 7);
        // Handles
        ctx.fillRect(2, 3, 2, 4);
        ctx.fillRect(12, 3, 2, 4);
        // Stem
        ctx.fillRect(7, 9, 2, 3);
        // Base
        ctx.fillRect(5, 12, 6, 2);
        // Shine
        ctx.fillStyle = '#ffee66';
        ctx.fillRect(5, 3, 2, 4);
        cache.trophy = c;
        return c;
    }

    function getGun() {
        if (cache.gun) return cache.gun;
        const c = createCanvas(16, 16);
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#888888';
        ctx.fillRect(2, 5, 12, 3);
        ctx.fillRect(3, 8, 3, 5);
        ctx.fillStyle = '#aaaaaa';
        ctx.fillRect(3, 5, 10, 1);
        ctx.fillStyle = '#666666';
        ctx.fillRect(12, 6, 2, 2);
        // Trigger
        ctx.fillStyle = '#444444';
        ctx.fillRect(7, 8, 1, 3);
        cache.gun = c;
        return c;
    }

    function getJetpack() {
        if (cache.jetpack) return cache.jetpack;
        const c = createCanvas(16, 16);
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#cc6600';
        ctx.fillRect(3, 2, 4, 10);
        ctx.fillRect(9, 2, 4, 10);
        ctx.fillStyle = '#ff8800';
        ctx.fillRect(4, 3, 2, 8);
        ctx.fillRect(10, 3, 2, 8);
        // Straps
        ctx.fillStyle = '#884400';
        ctx.fillRect(7, 3, 2, 2);
        ctx.fillRect(7, 8, 2, 2);
        // Flames
        ctx.fillStyle = '#ff4400';
        ctx.fillRect(4, 12, 2, 2);
        ctx.fillRect(10, 12, 2, 2);
        ctx.fillStyle = '#ffcc00';
        ctx.fillRect(4, 14, 2, 1);
        ctx.fillRect(10, 14, 2, 1);
        cache.jetpack = c;
        return c;
    }

    function getExtraLife() {
        if (cache.extraLife) return cache.extraLife;
        const c = createCanvas(16, 16);
        const ctx = c.getContext('2d');
        // Small Dave head
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(4, 2, 8, 4);
        ctx.fillStyle = '#ffaa55';
        ctx.fillRect(4, 5, 8, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(5, 6, 2, 2);
        ctx.fillRect(9, 6, 2, 2);
        ctx.fillStyle = '#000000';
        ctx.fillRect(6, 7, 1, 1);
        ctx.fillRect(10, 7, 1, 1);
        ctx.fillRect(7, 9, 2, 1);
        cache.extraLife = c;
        return c;
    }

    function getKey() {
        if (cache.key) return cache.key;
        const c = createCanvas(16, 16);
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#ffcc00';
        // Key head (ring)
        ctx.fillRect(3, 3, 6, 2);
        ctx.fillRect(2, 5, 2, 4);
        ctx.fillRect(7, 5, 2, 4);
        ctx.fillRect(3, 9, 6, 2);
        ctx.fillStyle = '#000000';
        ctx.fillRect(4, 5, 3, 4);
        // Key shaft
        ctx.fillStyle = '#ffcc00';
        ctx.fillRect(9, 6, 5, 2);
        // Key teeth
        ctx.fillRect(12, 8, 2, 2);
        ctx.fillRect(10, 8, 1, 2);
        cache.key = c;
        return c;
    }

    function getBullet(dir) {
        const key = `bullet_${dir}`;
        if (cache[key]) return cache[key];
        const c = createCanvas(6, 4);
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(1, 1, 4, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(dir === 'right' ? 4 : 1, 1, 1, 2);
        cache[key] = c;
        return c;
    }

    // ========== ENEMY SPRITES ==========
    function getEnemy(type, frame, dir) {
        const key = `enemy_${type}_${frame}_${dir}`;
        if (cache[key]) return cache[key];

        let px;
        let pal;
        let w = 16, h = 16;

        switch (type) {
            case 'spider':
                px = [
                    [
                        'R..R....R..R',
                        '.R.R....R.R.',
                        '.R.RRRRRR.R.',
                        '.RRRRRRRRRR.',
                        '.RRWRRRRWRR.',
                        '.RRKRRRRKRR.',
                        '.RRRRRRRRRR.',
                        '..RRRRRRRR..',
                        '...RRRRRR...',
                        'RR.RRRRRR.RR',
                        'R.RR.RR.RR.R',
                        'R.R......R.R',
                    ],
                    [
                        '.R.......R..',
                        'R.R.....R.R.',
                        '.R.RRRRRR.R.',
                        '.RRRRRRRRRR.',
                        '.RRWRRRRWRR.',
                        '.RRKRRRRKRR.',
                        '.RRRRRRRRRR.',
                        '..RRRRRRRR..',
                        '...RRRRRR...',
                        '.RRRRRRRRRR.',
                        'R.R.RRRR.R.R',
                        'R..R....R..R',
                    ]
                ];
                w = 12; h = 12;
                pal = { 'R': '#cc0000', 'W': '#ffffff', 'K': '#000000' };
                break;

            case 'snake':
                px = [
                    [
                        '....GGGG....',
                        '...GGGGGG...',
                        '..GWGGWGGG..',
                        '..GKGGKGGG..',
                        '..GGGGGGGG..',
                        '..GGRRGGGG..',
                        '...GGGGGG...',
                        'GGGGGGGGGGGG',
                        'GGGGGGGGGGG.',
                        '.GGGGGGGGG..',
                        '..GGGGGGG...',
                        '.GGG...GGG..',
                    ],
                    [
                        '....GGGG....',
                        '...GGGGGG...',
                        '..GWGGWGGG..',
                        '..GKGGKGGG..',
                        '..GGGGGGGG..',
                        '..GGRRGGGG..',
                        '...GGGGGG...',
                        '.GGGGGGGGG..',
                        'GGGGGGGGGGG.',
                        'GGGGGGGGGGGG',
                        '..GGGGGGG...',
                        '.GGG...GGG..',
                    ]
                ];
                w = 12; h = 12;
                pal = { 'G': '#00aa00', 'W': '#ffffff', 'K': '#000000', 'R': '#ff0000' };
                break;

            case 'fireball':
                px = [
                    [
                        '....OOOO....',
                        '..OOYYYYOO..',
                        '.OOYYYYYYO..',
                        '.OYYYYYYYO..',
                        'OYYYYYYYY.O.',
                        'OYYYYYYYYY.O',
                        'OYYYYYYYYY.O',
                        'OYYYYYYYY.O.',
                        '.OYYYYYYYO..',
                        '.OOYYYYYYO..',
                        '..OOYYYYOO..',
                        '....OOOO....',
                    ],
                    [
                        '....RROO....',
                        '..OORRYYOO..',
                        '.OOYYYYYYY..',
                        '.OYYYYYYYO..',
                        'OYYYY.YYYY.O',
                        'OYYYYYYYYY.O',
                        'OYYYYYYYYY.O',
                        'OYYY.YYYYY.O',
                        '.OYYYYYYYO..',
                        '.OOYYYYYYY..',
                        '..OOYYRR.O..',
                        '....OOOO....',
                    ]
                ];
                w = 12; h = 12;
                pal = { 'O': '#ff4400', 'Y': '#ffcc00', 'R': '#ff0000' };
                break;

            case 'bat':
                px = [
                    [
                        'P..PPPP..P..',
                        'PP.PPPP.PP..',
                        'PPPPPPPPPP..',
                        '.PPWPPWPP...',
                        '.PPKPPKPP...',
                        '..PPPPPP....',
                        '...PPPP.....',
                        '....PP......',
                    ],
                    [
                        '...PPPP.....',
                        '...PPPP.....',
                        '.PPPPPPPP...',
                        'PPPWPPWPPP..',
                        'PPPKPPKPPP..',
                        '.PPPPPPPP...',
                        '...PPPP.....',
                        '....PP......',
                    ]
                ];
                w = 12; h = 8;
                pal = { 'P': '#8800aa', 'W': '#ffffff', 'K': '#000000' };
                break;

            default:
                return getDiamond();
        }

        const f = px[frame % px.length];
        const c = createCanvas(w, h);
        const ctx = c.getContext('2d');
        if (dir === 'left') {
            ctx.translate(w, 0);
            ctx.scale(-1, 1);
        }
        drawPixels(ctx, f.map(r => r.split('')), pal);
        cache[key] = c;
        return c;
    }

    // ========== HUD SPRITES ==========
    function getDaveIcon() {
        if (cache.daveIcon) return cache.daveIcon;
        const c = createCanvas(10, 12);
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(2, 0, 6, 3);
        ctx.fillStyle = '#ffaa55';
        ctx.fillRect(2, 3, 6, 5);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(3, 4, 2, 2);
        ctx.fillRect(6, 4, 2, 2);
        ctx.fillStyle = '#000000';
        ctx.fillRect(4, 5, 1, 1);
        ctx.fillRect(7, 5, 1, 1);
        ctx.fillStyle = '#0000ff';
        ctx.fillRect(2, 8, 6, 4);
        cache.daveIcon = c;
        return c;
    }

    // ========== EXPLOSION ==========
    function getExplosion(frame) {
        const key = `explosion_${frame}`;
        if (cache[key]) return cache[key];
        const c = createCanvas(16, 16);
        const ctx = c.getContext('2d');
        const colors = ['#ffffff', '#ffff00', '#ff8800', '#ff4400', '#ff0000', '#880000'];
        const radius = [2, 4, 6, 7, 6, 4, 2][frame] || 3;
        const col = colors[Math.min(frame, colors.length - 1)];
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(8, 8, radius, 0, Math.PI * 2);
        ctx.fill();
        if (frame < 4) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(8, 8, radius / 2, 0, Math.PI * 2);
            ctx.fill();
        }
        cache[key] = c;
        return c;
    }

    // ========== BACKGROUND ==========
    function getStar() {
        if (cache.star) return cache.star;
        const c = createCanvas(2, 2);
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 1, 1);
        cache.star = c;
        return c;
    }

    return {
        getDave,
        getBrick,
        getBlueWall,
        getPurpleWall,
        getGrayBrick,
        getPlatform,
        getWater,
        getFire,
        getDoor,
        getSpike,
        getTree,
        getPipe,
        getPipeTop,
        getDiamond,
        getRing,
        getCrown,
        getTrophy,
        getGun,
        getJetpack,
        getExtraLife,
        getKey,
        getBullet,
        getEnemy,
        getDaveIcon,
        getExplosion,
        getStar,
        TILE,
    };
})();
