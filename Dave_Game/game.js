const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const hud = {
  level: document.getElementById("levelLabel"),
  score: document.getElementById("scoreLabel"),
  lives: document.getElementById("livesLabel"),
  items: document.getElementById("itemLabel"),
  ammo: document.getElementById("ammoLabel")
};

const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const actionBtn = document.getElementById("actionBtn");

const btnLeft = document.getElementById("btnLeft");
const btnRight = document.getElementById("btnRight");
const btnJump = document.getElementById("btnJump");
const btnShoot = document.getElementById("btnShoot");

const TILE = 16;
const VIEW_WIDTH = canvas.width;
const VIEW_HEIGHT = canvas.height;
const START_LIVES = 3;

const GRAVITY = 0.38;
const MAX_FALL_SPEED = 6.4;
const PLAYER_ACCEL = 0.45;
const MAX_RUN_SPEED = 2.45;
const GROUND_DRAG = 0.78;
const AIR_DRAG = 0.92;
const JUMP_VELOCITY = -7.2;
const LADDER_SPEED = 1.35;
const JETPACK_THRUST = 0.45;
const JETPACK_DRAIN = 1;
const MONSTER_SPEED = 0.95;
const BULLET_SPEED = 5.8;

const LEVELS = [
  {
    name: "Stage 1",
    map: [
      "################################################################################",
      "#P....T...............M.............T..............G......................K..D#",
      "#........######.............###########.............#####......................#",
      "#............................H.................................................#",
      "#.............T..............H................M...............................#",
      "#.........##########.........H..............######...........########..........#",
      "#............................H.................................................#",
      "#...M........................H............T.........................M..........#",
      "#..##########.............#########..............###########...................#",
      "#...........................................J..................................#",
      "#.................T...............M............................................#",
      "#...........##########.......#############...................###########.......#",
      "#........................................................T.....................#",
      "#..S......S......S.......S.............S...................S...........S.......#",
      "#..............................................................................#",
      "#.....................M......................T..................................#",
      "#..............................................................................#",
      "################################################################################"
    ]
  },
  {
    name: "Stage 2",
    map: [
      "################################################################################",
      "#P.......T...................M..........T...............G.................K..D#",
      "#.............#########.............#########.................#########........#",
      "#.......................H..........................H...........................#",
      "#......M................H........T.................H.............M.............#",
      "#....######.............H......######..............H...........######..........#",
      "#.......................H..........................H...........................#",
      "#...............S.......H............S.............H...............S...........#",
      "#..########........##########....##########....##########....##########........#",
      "#.............................................J................................#",
      "#.............T..............M...........T.....................................#",
      "#......#############.....#############....................#############.........#",
      "#..............................................................................#",
      "#....S.......S........S........S........S........S........S........S...........#",
      "#..............................................................................#",
      "#...................M...........................T...................M..........#",
      "#..............................................................................#",
      "################################################################################"
    ]
  },
  {
    name: "Stage 3",
    map: [
      "################################################################################",
      "#P.....T..........M....................T....................G..............K.D#",
      "#...........##########............###########...........###########............#",
      "#......................H........................................H...............#",
      "#........M.............H.............T..................M......H...............#",
      "#....##########........H......###########..........#########....H..............#",
      "#......................H........................................H...............#",
      "#...............S......H......S...............S.................H......S.......#",
      "#..##########..###########..##########..##########..##########..##########.....#",
      "#...............................................J...............................#",
      "#.....T....................M.........................T.........................#",
      "#..#############.....#############.....#############.....#############..........#",
      "#..............................................................................#",
      "#....S....S....S....S....S....S....S....S....S....S....S....S....S............#",
      "#..............................................................................#",
      "#............M...............T......................M.........................#",
      "#..............................................................................#",
      "################################################################################"
    ]
  }
];

const state = {
  mode: "start",
  levelIndex: 0,
  score: 0,
  lives: START_LIVES,
  frame: 0,
  world: null,
  player: null,
  bullets: [],
  input: {
    left: false,
    right: false,
    up: false,
    down: false,
    shoot: false,
    jetpack: false,
    jumpQueued: false,
    shootQueued: false
  }
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function normalizeRows(rows) {
  const width = rows.reduce((max, row) => Math.max(max, row.length), 0);
  const height = rows.length;

  return rows.map((row, y) => {
    const padded = row.padEnd(width, ".").split("");
    if (y === 0 || y === height - 1) {
      for (let x = 0; x < width; x += 1) padded[x] = "#";
    }
    padded[0] = "#";
    padded[width - 1] = "#";
    return padded;
  });
}

function buildWorld(level) {
  const grid = normalizeRows(level.map);
  const height = grid.length;
  const width = grid[0].length;

  const collectibles = [];
  const monsters = [];
  let spawn = { tx: 1, ty: 1 };
  let door = null;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const ch = grid[y][x];

      if (ch === "P") {
        spawn = { tx: x, ty: y };
        grid[y][x] = ".";
      }

      if (ch === "T") {
        collectibles.push({ type: "trophy", x: x * TILE + 2, y: y * TILE + 2, w: 12, h: 12, collected: false });
        grid[y][x] = ".";
      }

      if (ch === "K") {
        collectibles.push({ type: "key", x: x * TILE + 2, y: y * TILE + 2, w: 12, h: 12, collected: false });
        grid[y][x] = ".";
      }

      if (ch === "G") {
        collectibles.push({ type: "gun", x: x * TILE + 2, y: y * TILE + 2, w: 12, h: 12, collected: false });
        grid[y][x] = ".";
      }

      if (ch === "J") {
        collectibles.push({ type: "jetpack", x: x * TILE + 2, y: y * TILE + 2, w: 12, h: 12, collected: false });
        grid[y][x] = ".";
      }

      if (ch === "M") {
        monsters.push({
          x: x * TILE + 2,
          y: y * TILE + 1,
          w: 12,
          h: 14,
          vx: (x % 2 === 0 ? 1 : -1) * MONSTER_SPEED,
          vy: 0,
          onGround: false,
          alive: true
        });
        grid[y][x] = ".";
      }

      if (ch === "D") {
        door = { x: x * TILE + 1, y: y * TILE - 8, w: 14, h: 22, locked: true };
        grid[y][x] = ".";
      }
    }
  }

  return {
    name: level.name,
    grid,
    width,
    height,
    pixelWidth: width * TILE,
    pixelHeight: height * TILE,
    cameraX: 0,
    cameraY: 0,
    spawn,
    door,
    collectibles,
    monsters,
    trophiesRequired: collectibles.filter((item) => item.type === "trophy").length,
    trophiesCollected: 0,
    stars: Array.from({ length: 90 }, (_, i) => ({
      x: ((i * 97) % (width * TILE - 2)) + 1,
      y: ((i * 53) % (height * TILE - 2)) + 1,
      bright: i % 3 === 0
    }))
  };
}

function createPlayer(spawn) {
  return {
    x: spawn.tx * TILE + 2,
    y: spawn.ty * TILE + 1,
    w: 12,
    h: 14,
    vx: 0,
    vy: 0,
    onGround: false,
    onLadder: false,
    facing: 1,
    hasKey: false,
    hasGun: false,
    ammo: 0,
    jetpackFuel: 0,
    invuln: 0,
    shootCooldown: 0
  };
}

function tileAt(world, tx, ty) {
  if (tx < 0 || ty < 0 || tx >= world.width || ty >= world.height) return "#";
  return world.grid[ty][tx];
}

function isSolidTile(world, tx, ty) {
  return tileAt(world, tx, ty) === "#";
}

function isLadderTile(world, tx, ty) {
  return tileAt(world, tx, ty) === "H";
}

function isHazardTile(world, tx, ty) {
  return tileAt(world, tx, ty) === "S";
}

function forEachTileInRect(rect, cb) {
  const minTx = Math.floor(rect.x / TILE);
  const maxTx = Math.floor((rect.x + rect.w - 1) / TILE);
  const minTy = Math.floor(rect.y / TILE);
  const maxTy = Math.floor((rect.y + rect.h - 1) / TILE);

  for (let ty = minTy; ty <= maxTy; ty += 1) {
    for (let tx = minTx; tx <= maxTx; tx += 1) {
      cb(tx, ty);
    }
  }
}

function rectTouches(world, rect, predicate) {
  let hit = false;
  forEachTileInRect(rect, (tx, ty) => {
    if (!hit && predicate(tx, ty)) hit = true;
  });
  return hit;
}

function moveEntityX(entity, dx, world) {
  if (dx === 0) return false;

  entity.x += dx;

  const minTy = Math.floor(entity.y / TILE);
  const maxTy = Math.floor((entity.y + entity.h - 1) / TILE);
  let collided = false;

  if (dx > 0) {
    const tx = Math.floor((entity.x + entity.w - 1) / TILE);
    for (let ty = minTy; ty <= maxTy; ty += 1) {
      if (!isSolidTile(world, tx, ty)) continue;
      entity.x = tx * TILE - entity.w;
      entity.vx = 0;
      collided = true;
      break;
    }
  } else {
    const tx = Math.floor(entity.x / TILE);
    for (let ty = minTy; ty <= maxTy; ty += 1) {
      if (!isSolidTile(world, tx, ty)) continue;
      entity.x = tx * TILE + TILE;
      entity.vx = 0;
      collided = true;
      break;
    }
  }

  return collided;
}

function moveEntityY(entity, dy, world) {
  if (dy === 0) {
    entity.onGround = rectTouches(world, { ...entity, y: entity.y + 1 }, (tx, ty) => isSolidTile(world, tx, ty));
    return false;
  }

  entity.onGround = false;
  entity.y += dy;

  const minTx = Math.floor(entity.x / TILE);
  const maxTx = Math.floor((entity.x + entity.w - 1) / TILE);
  let collided = false;

  if (dy > 0) {
    const ty = Math.floor((entity.y + entity.h - 1) / TILE);
    for (let tx = minTx; tx <= maxTx; tx += 1) {
      if (!isSolidTile(world, tx, ty)) continue;
      entity.y = ty * TILE - entity.h;
      entity.vy = 0;
      entity.onGround = true;
      collided = true;
      break;
    }
  } else {
    const ty = Math.floor(entity.y / TILE);
    for (let tx = minTx; tx <= maxTx; tx += 1) {
      if (!isSolidTile(world, tx, ty)) continue;
      entity.y = ty * TILE + TILE;
      entity.vy = 0;
      collided = true;
      break;
    }
  }

  return collided;
}

function setOverlay(title, text, buttonText) {
  overlayTitle.textContent = title;
  overlayText.textContent = text;
  actionBtn.textContent = buttonText;
  overlay.classList.remove("hidden");
}

function hideOverlay() {
  overlay.classList.add("hidden");
}

function updateHud() {
  const world = state.world;
  const player = state.player;

  hud.level.textContent = `Level ${state.levelIndex + 1}/${LEVELS.length}`;
  hud.score.textContent = `Score ${state.score}`;
  hud.lives.textContent = `Lives ${state.lives}`;

  if (world && player) {
    hud.items.textContent = `Trophies ${world.trophiesCollected}/${world.trophiesRequired} | Key ${player.hasKey ? "Yes" : "No"}`;
    hud.ammo.textContent = `Ammo ${player.ammo}`;
  } else {
    hud.items.textContent = "Trophies 0/0 | Key No";
    hud.ammo.textContent = "Ammo 0";
  }
}

function updateCamera() {
  const world = state.world;
  const player = state.player;

  if (!world || !player) return;

  const maxX = Math.max(0, world.pixelWidth - VIEW_WIDTH);
  const maxY = Math.max(0, world.pixelHeight - VIEW_HEIGHT);

  world.cameraX = clamp(player.x + player.w / 2 - VIEW_WIDTH / 2, 0, maxX);
  world.cameraY = clamp(player.y + player.h / 2 - VIEW_HEIGHT / 2, 0, maxY);
}

function loadLevel(levelIndex, keepOverlay = false) {
  state.world = buildWorld(LEVELS[levelIndex]);
  state.player = createPlayer(state.world.spawn);
  state.bullets = [];
  updateCamera();
  updateHud();
  if (!keepOverlay) hideOverlay();
}

function startNewGame() {
  state.mode = "playing";
  state.levelIndex = 0;
  state.score = 0;
  state.lives = START_LIVES;
  state.frame = 0;
  loadLevel(0);
}

function loseLife(reason) {
  if (state.mode !== "playing") return true;

  state.lives -= 1;

  if (state.lives <= 0) {
    state.mode = "gameover";
    setOverlay("Game Over", `You were defeated by ${reason}. Final score: ${state.score}.`, "Restart");
    updateHud();
    return true;
  }

  loadLevel(state.levelIndex);
  state.player.invuln = 50;
  updateHud();
  return true;
}

function completeLevel() {
  state.score += 1000;
  state.levelIndex += 1;

  if (state.levelIndex >= LEVELS.length) {
    state.mode = "win";
    setOverlay("You Win", `All stages cleared. Final score: ${state.score}.`, "Play Again");
    updateHud();
    return;
  }

  loadLevel(state.levelIndex);
  updateHud();
}

function collectPickup(item) {
  const world = state.world;
  const player = state.player;

  item.collected = true;

  if (item.type === "trophy") {
    world.trophiesCollected += 1;
    state.score += 100;
  }

  if (item.type === "key") {
    player.hasKey = true;
    state.score += 400;
  }

  if (item.type === "gun") {
    player.hasGun = true;
    player.ammo += 8;
    state.score += 200;
  }

  if (item.type === "jetpack") {
    player.jetpackFuel = Math.min(900, player.jetpackFuel + 500);
    state.score += 150;
  }

  updateHud();
}

function tryShoot() {
  const player = state.player;

  if (!player.hasGun || player.ammo <= 0 || player.shootCooldown > 0) return;

  player.ammo -= 1;
  player.shootCooldown = 12;

  state.bullets.push({
    x: player.facing > 0 ? player.x + player.w : player.x - 4,
    y: player.y + Math.floor(player.h / 2),
    w: 4,
    h: 2,
    vx: player.facing * BULLET_SPEED,
    life: 95
  });

  updateHud();
}

function updatePlayer() {
  const input = state.input;
  const player = state.player;
  const world = state.world;

  if (player.shootCooldown > 0) player.shootCooldown -= 1;
  if (player.invuln > 0) player.invuln -= 1;

  if (input.left) {
    player.vx -= PLAYER_ACCEL;
    player.facing = -1;
  }

  if (input.right) {
    player.vx += PLAYER_ACCEL;
    player.facing = 1;
  }

  if (!input.left && !input.right) {
    player.vx *= player.onGround ? GROUND_DRAG : AIR_DRAG;
    if (Math.abs(player.vx) < 0.05) player.vx = 0;
  }

  player.vx = clamp(player.vx, -MAX_RUN_SPEED, MAX_RUN_SPEED);

  player.onLadder = rectTouches(world, player, (tx, ty) => isLadderTile(world, tx, ty));

  if (input.jumpQueued && (player.onGround || player.onLadder)) {
    player.vy = JUMP_VELOCITY;
    player.onGround = false;
    player.onLadder = false;
  }

  let climbed = false;

  if (player.onLadder && (input.up || input.down)) {
    player.vy = 0;
    if (input.up) player.vy -= LADDER_SPEED;
    if (input.down) player.vy += LADDER_SPEED;
    climbed = true;
  }

  if (!climbed) player.vy += GRAVITY;

  if (input.jetpack && player.jetpackFuel > 0) {
    player.vy -= JETPACK_THRUST;
    player.jetpackFuel = Math.max(0, player.jetpackFuel - JETPACK_DRAIN);
  }

  player.vy = clamp(player.vy, -9, MAX_FALL_SPEED);

  moveEntityX(player, player.vx, world);
  moveEntityY(player, player.vy, world);

  if (rectTouches(world, player, (tx, ty) => isHazardTile(world, tx, ty))) {
    return loseLife("spikes");
  }

  if (player.y > world.pixelHeight + 30) {
    return loseLife("a long fall");
  }

  for (const item of world.collectibles) {
    if (item.collected) continue;
    if (!rectsOverlap(player, item)) continue;
    collectPickup(item);
  }

  if ((input.shoot || input.shootQueued) && player.shootCooldown === 0) {
    tryShoot();
  }

  if (world.door) {
    world.door.locked = !(player.hasKey && world.trophiesCollected >= world.trophiesRequired);
    if (!world.door.locked && rectsOverlap(player, world.door)) {
      completeLevel();
      return true;
    }
  }

  for (const monster of world.monsters) {
    if (!monster.alive) continue;
    if (rectsOverlap(player, monster) && player.invuln <= 0) {
      return loseLife("a monster");
    }
  }

  input.jumpQueued = false;
  input.shootQueued = false;

  return false;
}

function updateMonsters() {
  const world = state.world;
  const player = state.player;

  for (const monster of world.monsters) {
    if (!monster.alive) continue;

    monster.vy += GRAVITY;
    monster.vy = clamp(monster.vy, -8, MAX_FALL_SPEED);

    const hitWall = moveEntityX(monster, monster.vx, world);
    moveEntityY(monster, monster.vy, world);

    if (hitWall) monster.vx *= -1;

    const leadX = monster.vx > 0 ? monster.x + monster.w + 1 : monster.x - 1;
    const footY = monster.y + monster.h + 1;
    const footTx = Math.floor(leadX / TILE);
    const footTy = Math.floor(footY / TILE);

    if (!isSolidTile(world, footTx, footTy)) monster.vx *= -1;

    if (rectTouches(world, monster, (tx, ty) => isHazardTile(world, tx, ty))) {
      monster.alive = false;
      continue;
    }

    if (rectsOverlap(monster, player) && player.invuln <= 0) {
      return loseLife("a monster");
    }
  }

  return false;
}

function updateBullets() {
  const world = state.world;
  let scoreChanged = false;

  state.bullets = state.bullets.filter((bullet) => {
    bullet.x += bullet.vx;
    bullet.life -= 1;

    if (bullet.life <= 0) return false;
    if (bullet.x + bullet.w < 0 || bullet.x > world.pixelWidth) return false;

    const tx = Math.floor((bullet.vx >= 0 ? bullet.x + bullet.w : bullet.x) / TILE);
    const ty = Math.floor((bullet.y + bullet.h / 2) / TILE);
    if (isSolidTile(world, tx, ty)) return false;

    for (const monster of world.monsters) {
      if (!monster.alive) continue;
      if (!rectsOverlap(bullet, monster)) continue;
      monster.alive = false;
      state.score += 250;
      scoreChanged = true;
      return false;
    }

    return true;
  });

  if (scoreChanged) updateHud();
}

function updateGame() {
  if (state.mode !== "playing") return;

  state.frame += 1;

  if (updatePlayer()) {
    state.input.jumpQueued = false;
    state.input.shootQueued = false;
    return;
  }

  if (updateMonsters()) {
    state.input.jumpQueued = false;
    state.input.shootQueued = false;
    return;
  }

  updateBullets();
  updateCamera();

  state.input.jumpQueued = false;
  state.input.shootQueued = false;

  updateHud();
}

function drawBackground(world) {
  const sky = ctx.createLinearGradient(0, 0, 0, VIEW_HEIGHT);
  sky.addColorStop(0, "#0e2a58");
  sky.addColorStop(1, "#02060f");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

  for (const star of world.stars) {
    const sx = star.x - world.cameraX * 0.25;
    const sy = star.y - world.cameraY * 0.15;
    if (sx < 0 || sx > VIEW_WIDTH || sy < 0 || sy > VIEW_HEIGHT) continue;
    ctx.fillStyle = star.bright ? "#d6ecff" : "#8ba6d1";
    ctx.fillRect(sx, sy, star.bright ? 2 : 1, star.bright ? 2 : 1);
  }
}

function drawSolidTile(sx, sy) {
  ctx.fillStyle = "#0f4b95";
  ctx.fillRect(sx, sy, TILE, TILE);
  ctx.fillStyle = "#2f79c6";
  ctx.fillRect(sx + 1, sy + 1, TILE - 2, 3);
  ctx.fillStyle = "#1d5cab";
  ctx.fillRect(sx + 1, sy + 8, TILE - 2, 1);
  ctx.strokeStyle = "#08254f";
  ctx.strokeRect(sx + 0.5, sy + 0.5, TILE - 1, TILE - 1);
}

function drawLadderTile(sx, sy) {
  ctx.fillStyle = "#6f4420";
  ctx.fillRect(sx + 3, sy, 2, TILE);
  ctx.fillRect(sx + TILE - 5, sy, 2, TILE);
  ctx.fillStyle = "#d8ab68";
  for (let y = 2; y < TILE; y += 4) {
    ctx.fillRect(sx + 4, sy + y, TILE - 8, 1);
  }
}

function drawSpikeTile(sx, sy) {
  ctx.fillStyle = "#354c79";
  ctx.fillRect(sx, sy, TILE, TILE);

  ctx.fillStyle = "#c8d5ef";
  for (let i = 0; i < 4; i += 1) {
    const baseX = sx + i * 4;
    ctx.beginPath();
    ctx.moveTo(baseX, sy + TILE);
    ctx.lineTo(baseX + 2, sy + TILE - 8);
    ctx.lineTo(baseX + 4, sy + TILE);
    ctx.closePath();
    ctx.fill();
  }
}

function drawDoor(world) {
  if (!world.door) return;

  const x = world.door.x - world.cameraX;
  const y = world.door.y - world.cameraY;

  ctx.fillStyle = world.door.locked ? "#602726" : "#2f7e44";
  ctx.fillRect(x, y, world.door.w, world.door.h);
  ctx.fillStyle = world.door.locked ? "#a74b4a" : "#5fd58b";
  ctx.fillRect(x + 2, y + 2, world.door.w - 4, 4);

  if (world.door.locked) {
    ctx.fillStyle = "#f4d16c";
    ctx.fillRect(x + 4, y + 10, world.door.w - 8, 3);
  }
}

function drawPickup(item, world) {
  const x = item.x - world.cameraX;
  const y = item.y - world.cameraY;

  if (item.type === "trophy") {
    ctx.fillStyle = "#f6d16a";
    ctx.fillRect(x + 3, y + 1, 6, 4);
    ctx.fillRect(x + 2, y + 5, 8, 2);
    ctx.fillRect(x + 5, y + 7, 2, 3);
    ctx.fillRect(x + 3, y + 10, 6, 2);
  }

  if (item.type === "key") {
    ctx.fillStyle = "#f8e087";
    ctx.fillRect(x + 2, y + 5, 8, 2);
    ctx.fillRect(x + 8, y + 3, 2, 6);
    ctx.fillRect(x + 4, y + 7, 2, 2);
    ctx.fillRect(x + 2, y + 7, 1, 2);
  }

  if (item.type === "gun") {
    ctx.fillStyle = "#a6bddf";
    ctx.fillRect(x + 1, y + 5, 9, 3);
    ctx.fillRect(x + 7, y + 8, 2, 3);
    ctx.fillStyle = "#2f3f55";
    ctx.fillRect(x + 9, y + 5, 2, 2);
  }

  if (item.type === "jetpack") {
    ctx.fillStyle = "#67d7d6";
    ctx.fillRect(x + 3, y + 2, 3, 8);
    ctx.fillRect(x + 7, y + 2, 3, 8);
    ctx.fillStyle = "#ff8d5b";
    ctx.fillRect(x + 3, y + 10, 3, 2);
    ctx.fillRect(x + 7, y + 10, 3, 2);
  }
}

function drawMonster(monster, world) {
  const x = monster.x - world.cameraX;
  const y = monster.y - world.cameraY;

  ctx.fillStyle = "#dc5e69";
  ctx.fillRect(x, y + 2, monster.w, monster.h - 2);
  ctx.fillStyle = "#8b232d";
  ctx.fillRect(x, y + monster.h - 3, monster.w, 2);
  ctx.fillStyle = "#f9f6ff";
  ctx.fillRect(x + 3, y + 5, 2, 2);
  ctx.fillRect(x + 7, y + 5, 2, 2);
}

function drawPlayer(player, world) {
  if (player.invuln > 0 && Math.floor(player.invuln / 4) % 2 === 0) return;

  const x = Math.floor(player.x - world.cameraX);
  const y = Math.floor(player.y - world.cameraY);

  const running = player.onGround && Math.abs(player.vx) > 0.2;
  const legOffset = running && Math.floor(state.frame / 6) % 2 === 0 ? 1 : 0;

  ctx.fillStyle = "#ffd6a0";
  ctx.fillRect(x + 4, y + 1, 4, 3);

  ctx.fillStyle = "#5ab4ff";
  ctx.fillRect(x + 3, y + 4, 6, 6);

  ctx.fillStyle = "#2f5f98";
  ctx.fillRect(x + 3, y + 10, 2, 4 + legOffset);
  ctx.fillRect(x + 7, y + 10, 2, 4 - legOffset);

  ctx.fillStyle = "#f4d16c";
  ctx.fillRect(x + 4, y + 4, 4, 1);

  if (player.hasGun) {
    ctx.fillStyle = "#dce6f8";
    const barrelX = player.facing > 0 ? x + 9 : x + 1;
    ctx.fillRect(barrelX, y + 7, 3, 2);
  }

  if (player.jetpackFuel > 0) {
    ctx.fillStyle = "#5be4d3";
    ctx.fillRect(x + 1, y + 5, 2, 5);
  }
}

function drawBullets(world) {
  ctx.fillStyle = "#ffffff";
  for (const bullet of state.bullets) {
    ctx.fillRect(bullet.x - world.cameraX, bullet.y - world.cameraY, bullet.w, bullet.h);
  }
}

function renderGame() {
  const world = state.world;
  if (!world) return;

  drawBackground(world);

  const startTx = Math.floor(world.cameraX / TILE);
  const endTx = Math.ceil((world.cameraX + VIEW_WIDTH) / TILE);
  const startTy = Math.floor(world.cameraY / TILE);
  const endTy = Math.ceil((world.cameraY + VIEW_HEIGHT) / TILE);

  for (let ty = startTy; ty <= endTy; ty += 1) {
    for (let tx = startTx; tx <= endTx; tx += 1) {
      const tile = tileAt(world, tx, ty);
      const sx = tx * TILE - world.cameraX;
      const sy = ty * TILE - world.cameraY;

      if (tile === "#") drawSolidTile(sx, sy);
      if (tile === "H") drawLadderTile(sx, sy);
      if (tile === "S") drawSpikeTile(sx, sy);
    }
  }

  for (const item of world.collectibles) {
    if (!item.collected) drawPickup(item, world);
  }

  drawDoor(world);

  for (const monster of world.monsters) {
    if (monster.alive) drawMonster(monster, world);
  }

  drawBullets(world);
  drawPlayer(state.player, world);

  ctx.fillStyle = "rgba(2, 7, 16, 0.7)";
  ctx.fillRect(0, VIEW_HEIGHT - 13, VIEW_WIDTH, 13);
  ctx.fillStyle = "#cfe6ff";
  ctx.font = "8px monospace";
  ctx.fillText(`Jetpack Fuel: ${Math.floor(state.player.jetpackFuel / 10)}`, 4, VIEW_HEIGHT - 4);

  if (world.door && world.door.locked) {
    const distance = Math.abs(world.door.x - state.player.x);
    if (distance < 140) {
      ctx.fillStyle = "#f6d16a";
      ctx.fillText("Door locked: collect all trophies and key", 108, VIEW_HEIGHT - 4);
    }
  }
}

function render() {
  ctx.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

  if (state.world) {
    renderGame();
    return;
  }

  ctx.fillStyle = "#04070f";
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
}

const blockedCodes = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space"]);

function setKeyState(code, pressed) {
  if (code === "ArrowLeft" || code === "KeyA") state.input.left = pressed;
  if (code === "ArrowRight" || code === "KeyD") state.input.right = pressed;

  if (code === "ArrowUp" || code === "KeyW") {
    state.input.up = pressed;
    if (pressed) state.input.jumpQueued = true;
  }

  if (code === "ArrowDown" || code === "KeyS") state.input.down = pressed;

  if (code === "Space" && pressed) state.input.jumpQueued = true;

  if (code === "KeyF" || code === "KeyK") {
    state.input.shoot = pressed;
    if (pressed) state.input.shootQueued = true;
  }

  if (code === "ShiftLeft" || code === "ShiftRight") {
    state.input.jetpack = pressed;
  }
}

window.addEventListener("keydown", (event) => {
  if (blockedCodes.has(event.code)) event.preventDefault();
  setKeyState(event.code, true);
});

window.addEventListener("keyup", (event) => {
  setKeyState(event.code, false);
});

function bindHoldButton(element, onPress, onRelease) {
  const start = (event) => {
    event.preventDefault();
    onPress();
  };

  const end = (event) => {
    event.preventDefault();
    onRelease();
  };

  element.addEventListener("pointerdown", start);
  element.addEventListener("pointerup", end);
  element.addEventListener("pointerleave", end);
  element.addEventListener("pointercancel", end);
}

bindHoldButton(
  btnLeft,
  () => {
    state.input.left = true;
  },
  () => {
    state.input.left = false;
  }
);

bindHoldButton(
  btnRight,
  () => {
    state.input.right = true;
  },
  () => {
    state.input.right = false;
  }
);

bindHoldButton(
  btnJump,
  () => {
    state.input.up = true;
    state.input.jumpQueued = true;
  },
  () => {
    state.input.up = false;
  }
);

bindHoldButton(
  btnShoot,
  () => {
    state.input.shoot = true;
    state.input.shootQueued = true;
  },
  () => {
    state.input.shoot = false;
  }
);

actionBtn.addEventListener("click", () => {
  startNewGame();
});

let lastTime = 0;
let accumulator = 0;
const STEP = 1000 / 60;

function loop(timestamp) {
  if (!lastTime) lastTime = timestamp;

  const delta = Math.min(100, timestamp - lastTime);
  lastTime = timestamp;
  accumulator += delta;

  while (accumulator >= STEP) {
    updateGame();
    accumulator -= STEP;
  }

  render();
  requestAnimationFrame(loop);
}

loadLevel(0, true);
setOverlay(
  "Dangerous Dave Web Edition",
  "Collect all trophies, find the key, then reach the exit door. Pick up the gun and jetpack to survive.",
  "Start Game"
);
updateHud();
requestAnimationFrame(loop);
