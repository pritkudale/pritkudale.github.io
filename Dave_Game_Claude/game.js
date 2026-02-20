// Dangerous Dave - Main Game Engine
(() => {
    'use strict';

    // ========== CONSTANTS ==========
    const TILE = 16;
    const SCALE = 3;
    const VIEW_W = 20; // tiles visible
    const VIEW_H = 13;
    const CANVAS_W = VIEW_W * TILE;
    const CANVAS_H = VIEW_H * TILE + 24; // extra for HUD
    const HUD_H = 24;
    const GRAVITY = 0.4;
    const JUMP_FORCE = -6.5;
    const MOVE_SPEED = 2;
    const JETPACK_FORCE = -0.5;
    const BULLET_SPEED = 5;
    const MAX_BULLETS = 3;
    const DAVE_W = 12;
    const DAVE_H = 16;
    const INVINCIBLE_TIME = 90; // frames
    const FPS = 60;

    // ========== CANVAS SETUP ==========
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    canvas.style.width = (CANVAS_W * SCALE) + 'px';
    canvas.style.height = (CANVAS_H * SCALE) + 'px';
    ctx.imageSmoothingEnabled = false;

    // ========== GAME STATE ==========
    let gameState = 'title'; // title, playing, levelComplete, dying, gameOver, victory
    let currentLevel = 0;
    let score = 0;
    let lives = 3;
    let hasGun = false;
    let hasJetpack = false;
    let jetpackFuel = 0;
    let hasKey = false;
    let doorOpen = false;

    // Dave
    let dave = {
        x: 32, y: 112,
        vx: 0, vy: 0,
        dir: 'right',
        onGround: false,
        frame: 'stand',
        walkTimer: 0,
        invincible: 0,
        usingJetpack: false,
    };

    // Level data
    let level = null;
    let items = [];
    let enemies = [];
    let bullets = [];
    let explosions = [];
    let camera = { x: 0, y: 0 };
    let frameCount = 0;
    let stateTimer = 0;
    let deathTimer = 0;

    // Stars for background
    let stars = [];
    for (let i = 0; i < 80; i++) {
        stars.push({
            x: Math.random() * 1000,
            y: Math.random() * 300,
            speed: 0.1 + Math.random() * 0.3,
            brightness: 0.3 + Math.random() * 0.7,
        });
    }

    // ========== INPUT ==========
    const keys = {};
    const keysPressed = {};

    document.addEventListener('keydown', (e) => {
        keys[e.code] = true;
        keysPressed[e.code] = true;
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
            e.preventDefault();
        }
        // Resume audio on first interaction
        Sound.resume();
    });
    document.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });

    function isKeyPressed(code) {
        const v = keysPressed[code];
        keysPressed[code] = false;
        return v;
    }

    // Mobile controls
    function setupMobile() {
        const map = {
            btnUp: 'ArrowUp', btnDown: 'ArrowDown',
            btnLeft: 'ArrowLeft', btnRight: 'ArrowRight',
            btnJump: 'Space', btnFire: 'KeyZ',
        };
        for (const [id, code] of Object.entries(map)) {
            const btn = document.getElementById(id);
            if (!btn) continue;
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                keys[code] = true;
                keysPressed[code] = true;
                Sound.resume();
            });
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                keys[code] = false;
            });
            btn.addEventListener('mousedown', (e) => {
                keys[code] = true;
                keysPressed[code] = true;
            });
            btn.addEventListener('mouseup', () => {
                keys[code] = false;
            });
        }
    }

    // ========== LEVEL LOADING ==========
    function loadLevel(idx) {
        level = Levels.parse(idx);
        if (!level) {
            gameState = 'victory';
            return;
        }

        dave.x = level.start.x * TILE;
        dave.y = level.start.y * TILE;
        dave.vx = 0;
        dave.vy = 0;
        dave.dir = 'right';
        dave.onGround = false;
        dave.frame = 'stand';
        dave.invincible = 0;
        dave.usingJetpack = false;

        items = level.items.map(it => ({
            ...it,
            x: it.x * TILE,
            y: it.y * TILE,
            collected: false,
            bobTimer: Math.random() * Math.PI * 2,
        }));

        enemies = level.enemies.map(en => ({
            ...en,
            x: en.x * TILE,
            y: en.y * TILE,
            startX: en.x * TILE,
            startY: en.y * TILE,
            vx: (en.type === 'bat' || en.type === 'fireball') ? 1 : 0.8,
            vy: 0,
            dir: 'right',
            frame: 0,
            alive: true,
            moveRange: 48 + Math.random() * 48,
        }));

        bullets = [];
        explosions = [];
        hasKey = false;
        doorOpen = false;
        // Keep gun/jetpack between levels
        if (idx > 0) {
            hasJetpack = false;
            jetpackFuel = 0;
        }

        camera.x = 0;
        camera.y = 0;

        gameState = 'playing';
    }

    // ========== COLLISION ==========
    function getTile(tx, ty) {
        if (!level) return 0;
        if (ty < 0) return 0; // allow above map
        if (ty >= level.height || tx < 0 || tx >= level.width) return 1; // solid border
        return level.tiles[ty][tx];
    }

    function isSolid(tile) {
        return (tile >= 1 && tile <= 5) || tile === 9 || tile === 10 || tile === 11;
    }

    function isHazard(tile) {
        return tile === 6 || tile === 7 || tile === 8;
    }

    function rectOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
        return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
    }

    function collideWorld(x, y, w, h) {
        const left = Math.floor(x / TILE);
        const right = Math.floor((x + w - 1) / TILE);
        const top = Math.floor(y / TILE);
        const bottom = Math.floor((y + h - 1) / TILE);

        for (let ty = top; ty <= bottom; ty++) {
            for (let tx = left; tx <= right; tx++) {
                const tile = getTile(tx, ty);
                if (isSolid(tile)) {
                    return { hit: true, tile, tx, ty };
                }
                if (isHazard(tile)) {
                    return { hit: false, hazard: true, tile, tx, ty };
                }
            }
        }
        return { hit: false };
    }

    // ========== DAVE UPDATE ==========
    function updateDave() {
        if (gameState !== 'playing') return;

        const prevX = dave.x;
        const prevY = dave.y;

        // Horizontal input
        dave.vx = 0;
        if (keys['ArrowLeft'] || keys['KeyA']) {
            dave.vx = -MOVE_SPEED;
            dave.dir = 'left';
        }
        if (keys['ArrowRight'] || keys['KeyD']) {
            dave.vx = MOVE_SPEED;
            dave.dir = 'right';
        }

        // Jump
        if ((isKeyPressed('Space') || isKeyPressed('ArrowUp') || isKeyPressed('KeyW')) && dave.onGround && !dave.usingJetpack) {
            dave.vy = JUMP_FORCE;
            dave.onGround = false;
            Sound.jump();
        }

        // Jetpack
        if (hasJetpack && jetpackFuel > 0) {
            if (keys['ArrowUp'] || keys['KeyW'] || keys['Space']) {
                dave.usingJetpack = true;
                dave.vy += JETPACK_FORCE;
                if (dave.vy < -3) dave.vy = -3;
                jetpackFuel -= 0.5;
                if (frameCount % 5 === 0) Sound.jetpack();
                if (jetpackFuel <= 0) {
                    dave.usingJetpack = false;
                    hasJetpack = false;
                }
            } else {
                dave.usingJetpack = false;
            }
        }

        // Gravity
        if (!dave.usingJetpack) {
            dave.vy += GRAVITY;
        }
        if (dave.vy > 8) dave.vy = 8;

        // Horizontal movement & collision
        dave.x += dave.vx;
        const hCol = collideWorld(dave.x, dave.y, DAVE_W, DAVE_H);
        if (hCol.hit) {
            dave.x = prevX;
        }
        if (hCol.hazard) {
            killDave();
            return;
        }

        // Vertical movement & collision
        dave.y += dave.vy;
        const vCol = collideWorld(dave.x, dave.y, DAVE_W, DAVE_H);
        if (vCol.hit) {
            if (dave.vy > 0) {
                dave.y = vCol.ty * TILE - DAVE_H;
                dave.onGround = true;
            } else {
                dave.y = (vCol.ty + 1) * TILE;
            }
            dave.vy = 0;
        } else {
            if (dave.vy > 0.5) dave.onGround = false;
        }
        if (vCol.hazard) {
            killDave();
            return;
        }

        // Check ground underneath
        const groundCheck = collideWorld(dave.x, dave.y + 1, DAVE_W, DAVE_H);
        if (!groundCheck.hit && !dave.usingJetpack) {
            dave.onGround = false;
        }

        // Boundary
        if (dave.x < 0) dave.x = 0;
        if (dave.y > level.height * TILE) {
            killDave();
            return;
        }

        // Animation
        if (dave.vx !== 0 && dave.onGround) {
            dave.walkTimer++;
            const walkFrames = ['walk1', 'walk2', 'walk3', 'walk2'];
            dave.frame = walkFrames[Math.floor(dave.walkTimer / 6) % 4];
        } else if (!dave.onGround) {
            dave.frame = 'jump';
        } else {
            dave.frame = 'stand';
            dave.walkTimer = 0;
        }

        // Shooting
        if ((isKeyPressed('KeyZ') || isKeyPressed('ControlLeft') || isKeyPressed('ControlRight') || isKeyPressed('KeyX')) && hasGun && bullets.length < MAX_BULLETS) {
            const bx = dave.dir === 'right' ? dave.x + DAVE_W : dave.x - 6;
            bullets.push({
                x: bx,
                y: dave.y + 6,
                vx: dave.dir === 'right' ? BULLET_SPEED : -BULLET_SPEED,
                dir: dave.dir,
            });
            Sound.shoot();
        }

        // Invincibility timer
        if (dave.invincible > 0) dave.invincible--;

        // Collect items
        for (const item of items) {
            if (item.collected) continue;
            if (rectOverlap(dave.x, dave.y, DAVE_W, DAVE_H, item.x, item.y, TILE, TILE)) {
                item.collected = true;
                score += item.points;

                switch (item.type) {
                    case 'gun':
                        hasGun = true;
                        Sound.gun();
                        break;
                    case 'jetpack':
                        hasJetpack = true;
                        jetpackFuel = 200;
                        Sound.collect();
                        break;
                    case 'extraLife':
                        lives++;
                        Sound.collect();
                        break;
                    case 'key':
                        hasKey = true;
                        doorOpen = true;
                        Sound.key();
                        break;
                    default:
                        Sound.collect();
                }
            }
        }

        // Check door exit
        if (doorOpen && level.door) {
            const doorX = level.door.x * TILE;
            const doorY = level.door.y * TILE;
            if (rectOverlap(dave.x, dave.y, DAVE_W, DAVE_H, doorX - 8, doorY - 16, TILE + 16, TILE + 16)) {
                completeLevelSequence();
            }
        }

        // Enemy collision
        for (const en of enemies) {
            if (!en.alive) continue;
            const ew = en.type === 'bat' ? 12 : 12;
            const eh = en.type === 'bat' ? 8 : 12;
            if (dave.invincible <= 0 && rectOverlap(dave.x, dave.y, DAVE_W, DAVE_H, en.x, en.y, ew, eh)) {
                killDave();
                return;
            }
        }
    }

    function killDave() {
        if (dave.invincible > 0) return;
        Sound.die();
        lives--;
        gameState = 'dying';
        deathTimer = 60;
        explosions.push({ x: dave.x, y: dave.y, frame: 0, maxFrame: 7 });
    }

    function completeLevelSequence() {
        gameState = 'levelComplete';
        stateTimer = 120;
        Sound.levelComplete();
    }

    // ========== ENEMY UPDATE ==========
    function updateEnemies() {
        for (const en of enemies) {
            if (!en.alive) continue;

            en.frame = (en.frame + 0.05);

            switch (en.type) {
                case 'spider':
                    en.x += en.vx;
                    if (Math.abs(en.x - en.startX) > en.moveRange) {
                        en.vx = -en.vx;
                        en.dir = en.vx > 0 ? 'right' : 'left';
                    }
                    // Fall with gravity
                    {
                        const below = collideWorld(en.x, en.y + 1, 12, 12);
                        if (!below.hit) en.y += 1;
                    }
                    break;

                case 'snake':
                    en.x += en.vx;
                    if (Math.abs(en.x - en.startX) > en.moveRange) {
                        en.vx = -en.vx;
                        en.dir = en.vx > 0 ? 'right' : 'left';
                    }
                    {
                        const below = collideWorld(en.x, en.y + 1, 12, 12);
                        if (!below.hit) en.y += 1;
                    }
                    break;

                case 'fireball':
                    en.x += en.vx * 1.2;
                    en.y += Math.sin(en.frame * 0.5) * 0.5;
                    if (Math.abs(en.x - en.startX) > en.moveRange * 1.5) {
                        en.vx = -en.vx;
                        en.dir = en.vx > 0 ? 'right' : 'left';
                    }
                    break;

                case 'bat':
                    en.x += en.vx * 0.8;
                    en.y = en.startY + Math.sin(en.frame * 0.3) * 16;
                    if (Math.abs(en.x - en.startX) > en.moveRange) {
                        en.vx = -en.vx;
                        en.dir = en.vx > 0 ? 'right' : 'left';
                    }
                    break;
            }
        }
    }

    // ========== BULLET UPDATE ==========
    function updateBullets() {
        for (let i = bullets.length - 1; i >= 0; i--) {
            const b = bullets[i];
            b.x += b.vx;

            // World collision
            const tx = Math.floor(b.x / TILE);
            const ty = Math.floor(b.y / TILE);
            const tile = getTile(tx, ty);
            if (isSolid(tile)) {
                bullets.splice(i, 1);
                continue;
            }

            // Off screen
            if (b.x < camera.x - 32 || b.x > camera.x + CANVAS_W + 32) {
                bullets.splice(i, 1);
                continue;
            }

            // Enemy hit
            let hitEnemy = false;
            for (const en of enemies) {
                if (!en.alive) continue;
                const ew = 12, eh = en.type === 'bat' ? 8 : 12;
                if (rectOverlap(b.x, b.y, 6, 4, en.x, en.y, ew, eh)) {
                    en.alive = false;
                    hitEnemy = true;
                    score += 200;
                    explosions.push({ x: en.x, y: en.y, frame: 0, maxFrame: 7 });
                    Sound.enemyDie();
                    break;
                }
            }
            if (hitEnemy) {
                bullets.splice(i, 1);
            }
        }
    }

    // ========== EXPLOSIONS ==========
    function updateExplosions() {
        for (let i = explosions.length - 1; i >= 0; i--) {
            explosions[i].frame += 0.15;
            if (explosions[i].frame >= explosions[i].maxFrame) {
                explosions.splice(i, 1);
            }
        }
    }

    // ========== CAMERA ==========
    function updateCamera() {
        if (!level) return;
        const targetX = dave.x - CANVAS_W / 2 + DAVE_W / 2;
        const targetY = dave.y - (CANVAS_H - HUD_H) / 2 + DAVE_H / 2;

        camera.x += (targetX - camera.x) * 0.1;
        camera.y += (targetY - camera.y) * 0.1;

        // Clamp
        camera.x = Math.max(0, Math.min(camera.x, level.width * TILE - CANVAS_W));
        camera.y = Math.max(0, Math.min(camera.y, level.height * TILE - (CANVAS_H - HUD_H)));
    }

    // ========== RENDERING ==========
    function drawTile(tile, x, y) {
        switch (tile) {
            case 1: ctx.drawImage(Sprites.getBrick(), x, y); break;
            case 2: ctx.drawImage(Sprites.getBlueWall(), x, y); break;
            case 3: ctx.drawImage(Sprites.getPlatform(), x, y); break;
            case 4: ctx.drawImage(Sprites.getGrayBrick(), x, y); break;
            case 5: ctx.drawImage(Sprites.getPurpleWall(), x, y); break;
            case 6: ctx.drawImage(Sprites.getWater(Math.floor(frameCount / 15)), x, y); break;
            case 7: ctx.drawImage(Sprites.getFire(Math.floor(frameCount / 10)), x, y); break;
            case 8: ctx.drawImage(Sprites.getSpike(), x, y); break;
            case 9: ctx.drawImage(Sprites.getPipe(), x, y); break;
            case 10: ctx.drawImage(Sprites.getPipeTop(), x, y); break;
            case 11: ctx.drawImage(Sprites.getDoor(), x, y - 16); break;
        }
    }

    function drawItem(item) {
        if (item.collected) return;
        const bobY = Math.sin(item.bobTimer + frameCount * 0.05) * 2;
        const sx = item.x - camera.x;
        const sy = item.y - camera.y + HUD_H + bobY;

        switch (item.type) {
            case 'diamond': ctx.drawImage(Sprites.getDiamond(), sx, sy); break;
            case 'ring': ctx.drawImage(Sprites.getRing(), sx, sy); break;
            case 'crown': ctx.drawImage(Sprites.getCrown(), sx, sy); break;
            case 'trophy': ctx.drawImage(Sprites.getTrophy(), sx, sy); break;
            case 'gun': ctx.drawImage(Sprites.getGun(), sx, sy); break;
            case 'jetpack': ctx.drawImage(Sprites.getJetpack(), sx, sy); break;
            case 'extraLife': ctx.drawImage(Sprites.getExtraLife(), sx, sy); break;
            case 'key': ctx.drawImage(Sprites.getKey(), sx, sy); break;
        }
    }

    function drawEnemy(en) {
        if (!en.alive) return;
        const sx = en.x - camera.x;
        const sy = en.y - camera.y + HUD_H;
        ctx.drawImage(Sprites.getEnemy(en.type, Math.floor(en.frame) % 2, en.dir), sx, sy);
    }

    function render() {
        // Clear
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        if (gameState === 'title') {
            drawTitleScreen();
            return;
        }

        if (gameState === 'victory') {
            drawVictoryScreen();
            return;
        }

        if (gameState === 'gameOver') {
            drawGameOverScreen();
            return;
        }

        if (!level) return;

        // Background
        ctx.fillStyle = level.bgColor;
        ctx.fillRect(0, HUD_H, CANVAS_W, CANVAS_H - HUD_H);

        // Stars
        for (const s of stars) {
            const sx = ((s.x - camera.x * s.speed) % CANVAS_W + CANVAS_W) % CANVAS_W;
            const sy = ((s.y - camera.y * s.speed * 0.3) % (CANVAS_H - HUD_H) + (CANVAS_H - HUD_H)) % (CANVAS_H - HUD_H);
            ctx.globalAlpha = s.brightness * (0.5 + 0.5 * Math.sin(frameCount * 0.02 + s.x));
            ctx.drawImage(Sprites.getStar(), sx, sy + HUD_H);
            ctx.globalAlpha = 1;
        }

        // Tiles
        const startTX = Math.floor(camera.x / TILE);
        const startTY = Math.floor(camera.y / TILE);
        const endTX = startTX + VIEW_W + 2;
        const endTY = startTY + VIEW_H + 2;

        for (let ty = startTY; ty < endTY; ty++) {
            for (let tx = startTX; tx < endTX; tx++) {
                const tile = getTile(tx, ty);
                if (tile > 0) {
                    drawTile(tile, tx * TILE - camera.x, ty * TILE - camera.y + HUD_H);
                }
            }
        }

        // Door indicator
        if (level.door && doorOpen) {
            const dx = level.door.x * TILE - camera.x;
            const dy = level.door.y * TILE - camera.y + HUD_H;
            ctx.fillStyle = '#00ff00';
            ctx.globalAlpha = 0.5 + 0.3 * Math.sin(frameCount * 0.1);
            ctx.fillRect(dx - 1, dy - 18, 18, 34);
            ctx.globalAlpha = 1;
        }

        // Items
        for (const item of items) {
            drawItem(item);
        }

        // Enemies
        for (const en of enemies) {
            drawEnemy(en);
        }

        // Bullets
        for (const b of bullets) {
            ctx.drawImage(Sprites.getBullet(b.dir), b.x - camera.x, b.y - camera.y + HUD_H);
        }

        // Explosions
        for (const exp of explosions) {
            const f = Math.floor(exp.frame);
            if (f < exp.maxFrame) {
                ctx.drawImage(Sprites.getExplosion(f), exp.x - camera.x, exp.y - camera.y + HUD_H);
            }
        }

        // Dave
        if (gameState === 'playing' || gameState === 'levelComplete') {
            if (dave.invincible <= 0 || Math.floor(dave.invincible / 3) % 2 === 0) {
                ctx.drawImage(
                    Sprites.getDave(dave.frame, dave.dir),
                    dave.x - camera.x,
                    dave.y - camera.y + HUD_H
                );

                // Jetpack flame
                if (dave.usingJetpack) {
                    ctx.fillStyle = frameCount % 4 < 2 ? '#ff4400' : '#ffcc00';
                    ctx.fillRect(dave.x - camera.x + 3, dave.y + DAVE_H - camera.y + HUD_H, 2, 3 + Math.random() * 3);
                    ctx.fillRect(dave.x - camera.x + 7, dave.y + DAVE_H - camera.y + HUD_H, 2, 3 + Math.random() * 3);
                }
            }
        }

        // HUD
        drawHUD();

        // Level name overlay
        if (gameState === 'playing' && frameCount < 120) {
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = Math.max(0, 1 - frameCount / 120);
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(level.name, CANVAS_W / 2, CANVAS_H / 2);
            ctx.globalAlpha = 1;
            ctx.textAlign = 'left';
        }

        // Level complete overlay
        if (gameState === 'levelComplete') {
            ctx.fillStyle = '#000000';
            ctx.globalAlpha = 0.5;
            ctx.fillRect(0, HUD_H, CANVAS_W, CANVAS_H - HUD_H);
            ctx.globalAlpha = 1;
            ctx.fillStyle = '#ffff00';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('LEVEL COMPLETE!', CANVAS_W / 2, CANVAS_H / 2 - 10);
            ctx.fillStyle = '#ffffff';
            ctx.font = '8px monospace';
            ctx.fillText('SCORE: ' + score, CANVAS_W / 2, CANVAS_H / 2 + 5);
            ctx.textAlign = 'left';
        }

        // Dying overlay
        if (gameState === 'dying') {
            // Show game area dimmed
            ctx.fillStyle = '#ff0000';
            ctx.globalAlpha = 0.2;
            ctx.fillRect(0, HUD_H, CANVAS_W, CANVAS_H - HUD_H);
            ctx.globalAlpha = 1;
        }
    }

    function drawHUD() {
        // HUD background
        ctx.fillStyle = '#222222';
        ctx.fillRect(0, 0, CANVAS_W, HUD_H);
        ctx.fillStyle = '#444444';
        ctx.fillRect(0, HUD_H - 1, CANVAS_W, 1);

        // Score
        ctx.fillStyle = '#ffffff';
        ctx.font = '8px monospace';
        ctx.fillText('SCORE', 4, 8);
        ctx.fillStyle = '#ffff00';
        ctx.fillText(String(score).padStart(8, '0'), 4, 18);

        // Level
        ctx.fillStyle = '#ffffff';
        ctx.fillText('LEVEL', 80, 8);
        ctx.fillStyle = '#00ff00';
        ctx.fillText(String(currentLevel + 1), 80, 18);

        // Lives
        ctx.fillStyle = '#ffffff';
        ctx.fillText('LIVES', 120, 8);
        for (let i = 0; i < lives; i++) {
            ctx.drawImage(Sprites.getDaveIcon(), 120 + i * 12, 10);
        }

        // Items
        let ix = 200;
        if (hasGun) {
            ctx.drawImage(Sprites.getGun(), ix, 6);
            ix += 20;
        }
        if (hasJetpack) {
            ctx.drawImage(Sprites.getJetpack(), ix, 4);
            ctx.fillStyle = '#00ffff';
            ctx.fillRect(ix, 18, Math.max(0, (jetpackFuel / 200) * 16), 3);
            ix += 20;
        }
        if (hasKey) {
            ctx.drawImage(Sprites.getKey(), ix, 6);
            ix += 20;
        }

        // Sound icons
        ctx.fillStyle = '#888888';
        ctx.font = '7px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(Sound.isEnabled() ? 'SFX:ON' : 'SFX:OFF', CANVAS_W - 4, 8);
        ctx.fillText(Sound.isMusicEnabled() ? 'MUS:ON' : 'MUS:OFF', CANVAS_W - 4, 18);
        ctx.textAlign = 'left';
    }

    // ========== TITLE SCREEN ==========
    function drawTitleScreen() {
        ctx.fillStyle = '#000022';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        // Stars
        for (const s of stars) {
            const sx = (s.x + frameCount * s.speed * 0.5) % CANVAS_W;
            ctx.globalAlpha = s.brightness * (0.5 + 0.5 * Math.sin(frameCount * 0.03 + s.x));
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(sx, s.y % CANVAS_H, 1, 1);
        }
        ctx.globalAlpha = 1;

        // Title
        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('DANGEROUS', CANVAS_W / 2, 50);

        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 20px monospace';
        ctx.fillText('DAVE', CANVAS_W / 2, 75);

        // Dave sprite
        ctx.drawImage(Sprites.getDave('stand', 'right'),
            CANVAS_W / 2 - 6, 90);

        // Floating items
        const items_show = [
            { fn: 'getDiamond', x: 60, y: 95 },
            { fn: 'getRing', x: 90, y: 100 },
            { fn: 'getCrown', x: 210, y: 95 },
            { fn: 'getTrophy', x: 240, y: 100 },
        ];
        for (const it of items_show) {
            const bob = Math.sin(frameCount * 0.05 + it.x) * 3;
            ctx.drawImage(Sprites[it.fn](), it.x, it.y + bob);
        }

        // Instructions
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '7px monospace';
        ctx.fillText('ARROW KEYS / WASD - MOVE & JUMP', CANVAS_W / 2, 130);
        ctx.fillText('Z / X / CTRL - SHOOT', CANVAS_W / 2, 142);
        ctx.fillText('M - TOGGLE MUSIC  |  N - TOGGLE SFX', CANVAS_W / 2, 154);

        // Blinking text
        if (Math.floor(frameCount / 30) % 2 === 0) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '9px monospace';
            ctx.fillText('PRESS ENTER OR SPACE TO START', CANVAS_W / 2, 180);
        }

        ctx.fillStyle = '#555555';
        ctx.font = '6px monospace';
        ctx.fillText('RECREATION OF THE CLASSIC 1990 GAME BY JOHN ROMERO', CANVAS_W / 2, 200);

        ctx.textAlign = 'left';
    }

    function drawGameOverScreen() {
        ctx.fillStyle = '#110000';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', CANVAS_W / 2, 70);

        ctx.fillStyle = '#ffffff';
        ctx.font = '9px monospace';
        ctx.fillText('FINAL SCORE: ' + score, CANVAS_W / 2, 100);
        ctx.fillText('REACHED LEVEL: ' + (currentLevel + 1), CANVAS_W / 2, 115);

        if (Math.floor(frameCount / 30) % 2 === 0) {
            ctx.fillStyle = '#ffff00';
            ctx.fillText('PRESS ENTER TO TRY AGAIN', CANVAS_W / 2, 150);
        }

        ctx.textAlign = 'left';
    }

    function drawVictoryScreen() {
        ctx.fillStyle = '#001100';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        // Sparkle effect
        for (let i = 0; i < 20; i++) {
            const sx = (Math.sin(frameCount * 0.02 + i * 1.3) * 0.5 + 0.5) * CANVAS_W;
            const sy = (Math.cos(frameCount * 0.015 + i * 0.9) * 0.5 + 0.5) * CANVAS_H;
            ctx.fillStyle = ['#ffff00', '#ff8800', '#00ff00', '#00ffff', '#ff00ff'][i % 5];
            ctx.globalAlpha = 0.3 + 0.7 * Math.sin(frameCount * 0.05 + i);
            ctx.fillRect(sx, sy, 2, 2);
        }
        ctx.globalAlpha = 1;

        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CONGRATULATIONS!', CANVAS_W / 2, 50);

        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('YOU BEAT', CANVAS_W / 2, 75);
        ctx.fillText('DANGEROUS DAVE!', CANVAS_W / 2, 92);

        ctx.drawImage(Sprites.getDave('stand', 'right'), CANVAS_W / 2 - 6, 100);
        ctx.drawImage(Sprites.getTrophy(), CANVAS_W / 2 - 8, 120);
        ctx.drawImage(Sprites.getCrown(), CANVAS_W / 2 + 2, 118);

        ctx.fillStyle = '#ffffff';
        ctx.font = '9px monospace';
        ctx.fillText('FINAL SCORE: ' + score, CANVAS_W / 2, 150);

        if (Math.floor(frameCount / 30) % 2 === 0) {
            ctx.fillStyle = '#ffff00';
            ctx.fillText('PRESS ENTER TO PLAY AGAIN', CANVAS_W / 2, 180);
        }

        ctx.textAlign = 'left';
    }

    // ========== GAME LOOP ==========
    function update() {
        frameCount++;

        switch (gameState) {
            case 'title':
                if (isKeyPressed('Enter') || isKeyPressed('Space') || isKeyPressed('NumpadEnter')) {
                    score = 0;
                    lives = 3;
                    hasGun = false;
                    hasJetpack = false;
                    jetpackFuel = 0;
                    currentLevel = 0;
                    frameCount = 0;
                    Sound.init();
                    Sound.startMusic();
                    loadLevel(0);
                }
                break;

            case 'playing':
                updateDave();
                updateEnemies();
                updateBullets();
                updateExplosions();
                updateCamera();
                break;

            case 'levelComplete':
                stateTimer--;
                updateExplosions();
                if (stateTimer <= 0) {
                    currentLevel++;
                    frameCount = 0;
                    if (currentLevel >= Levels.count) {
                        gameState = 'victory';
                        Sound.stopMusic();
                        Sound.levelComplete();
                    } else {
                        loadLevel(currentLevel);
                    }
                }
                break;

            case 'dying':
                deathTimer--;
                updateExplosions();
                if (deathTimer <= 0) {
                    if (lives <= 0) {
                        gameState = 'gameOver';
                        Sound.stopMusic();
                        Sound.gameOver();
                    } else {
                        dave.invincible = INVINCIBLE_TIME;
                        loadLevel(currentLevel);
                    }
                }
                break;

            case 'gameOver':
                if (isKeyPressed('Enter') || isKeyPressed('Space')) {
                    gameState = 'title';
                    frameCount = 0;
                }
                break;

            case 'victory':
                if (isKeyPressed('Enter') || isKeyPressed('Space')) {
                    gameState = 'title';
                    frameCount = 0;
                }
                break;
        }

        // Global key toggles
        if (isKeyPressed('KeyM')) {
            Sound.toggleMusic();
        }
        if (isKeyPressed('KeyN')) {
            Sound.toggleSound();
        }
    }

    function gameLoop() {
        update();
        render();
        requestAnimationFrame(gameLoop);
    }

    // ========== RESIZE ==========
    function resize() {
        const container = document.getElementById('gameContainer');
        const maxW = window.innerWidth;
        const maxH = window.innerHeight;
        const aspect = CANVAS_W / CANVAS_H;
        let w, h;
        if (maxW / maxH > aspect) {
            h = maxH;
            w = h * aspect;
        } else {
            w = maxW;
            h = w / aspect;
        }
        canvas.style.width = Math.floor(w) + 'px';
        canvas.style.height = Math.floor(h) + 'px';
    }

    window.addEventListener('resize', resize);

    // ========== INIT ==========
    setupMobile();
    resize();
    gameLoop();
})();
