// ============================================================
// Pac-Man – speelbare basis
// ============================================================

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const messageEl = document.getElementById('message');

// --- Sound Effects (Web Audio API) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    switch (type) {
        case 'chomp': {
            // Waka — quick pitch bend
            osc.type = 'square';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.linearRampToValueAtTime(200, now + 0.07);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.07);
            osc.start(now);
            osc.stop(now + 0.07);
            break;
        }
        case 'power': {
            // Power pellet — rising arpeggio
            osc.type = 'square';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.linearRampToValueAtTime(600, now + 0.1);
            osc.frequency.linearRampToValueAtTime(400, now + 0.2);
            osc.frequency.linearRampToValueAtTime(800, now + 0.3);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.35);
            osc.start(now);
            osc.stop(now + 0.35);
            break;
        }
        case 'ghost_eat': {
            // Eat ghost — rising sweep
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, now);
            osc.frequency.exponentialRampToValueAtTime(1500, now + 0.3);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.35);
            osc.start(now);
            osc.stop(now + 0.35);
            break;
        }
        case 'death': {
            // Death — descending sweep
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.6);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.7);
            osc.start(now);
            osc.stop(now + 0.7);
            break;
        }
        case 'bomb_place': {
            // Bomb place — dull thud
            osc.type = 'sine';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.linearRampToValueAtTime(60, now + 0.1);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.12);
            osc.start(now);
            osc.stop(now + 0.12);
            break;
        }
        case 'bomb_explode': {
            // Explosion — noise burst + low rumble
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(80, now);
            osc.frequency.linearRampToValueAtTime(20, now + 0.4);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
            // Extra high crackle
            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);
            osc2.type = 'square';
            osc2.frequency.setValueAtTime(800, now);
            osc2.frequency.linearRampToValueAtTime(100, now + 0.15);
            gain2.gain.setValueAtTime(0.1, now);
            gain2.gain.linearRampToValueAtTime(0, now + 0.2);
            osc2.start(now);
            osc2.stop(now + 0.2);
            break;
        }
        case 'win': {
            // Win jingle
            osc.type = 'square';
            const notes = [523, 659, 784, 1047];
            notes.forEach((freq, i) => {
                osc.frequency.setValueAtTime(freq, now + i * 0.15);
            });
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.7);
            osc.start(now);
            osc.stop(now + 0.7);
            break;
        }
    }
}

// --- Background music — mysterious bass loop ---
let bgMusicStarted = false;

function startBgMusic() {
    if (bgMusicStarted) return;
    bgMusicStarted = true;

    // Upbeat bass line (major key, bouncy feel)
    const notes = [
        130.81, // C3
        130.81, // C3
        164.81, // E3
        196.00, // G3
        164.81, // E3
        130.81, // C3
        196.00, // G3
        196.00, // G3
        174.61, // F3
        174.61, // F3
        220.00, // A3
        261.63, // C4
        220.00, // A3
        196.00, // G3
        164.81, // E3
        146.83, // D3
    ];
    const noteLength = 0.22;  // seconds per note (sneller)
    const loopLength = notes.length * noteLength;

    function playLoop() {
        const startTime = audioCtx.currentTime + 0.05;
        notes.forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, startTime + i * noteLength);

            // Punchy envelope
            const t = startTime + i * noteLength;
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
            gain.gain.setValueAtTime(0.14, t + noteLength * 0.5);
            gain.gain.linearRampToValueAtTime(0, t + noteLength * 0.9);

            osc.start(t);
            osc.stop(t + noteLength);

            // Beat: kick on every note, snare on even beats
            const kickOsc = audioCtx.createOscillator();
            const kickGain = audioCtx.createGain();
            kickOsc.connect(kickGain);
            kickGain.connect(audioCtx.destination);
            kickOsc.type = 'sine';
            kickOsc.frequency.setValueAtTime(120, t);
            kickOsc.frequency.exponentialRampToValueAtTime(30, t + 0.08);
            kickGain.gain.setValueAtTime(0.18, t);
            kickGain.gain.linearRampToValueAtTime(0, t + 0.1);
            kickOsc.start(t);
            kickOsc.stop(t + 0.1);

            // Hi-hat on off-beats
            if (i % 2 === 1) {
                const hatOsc = audioCtx.createOscillator();
                const hatGain = audioCtx.createGain();
                hatOsc.connect(hatGain);
                hatGain.connect(audioCtx.destination);
                hatOsc.type = 'square';
                hatOsc.frequency.setValueAtTime(1200, t);
                hatGain.gain.setValueAtTime(0.04, t);
                hatGain.gain.linearRampToValueAtTime(0, t + 0.03);
                hatOsc.start(t);
                hatOsc.stop(t + 0.03);
            }

            // Snare on beats 4, 8, 12, 16
            if (i % 4 === 3) {
                const snareOsc = audioCtx.createOscillator();
                const snareGain = audioCtx.createGain();
                snareOsc.connect(snareGain);
                snareGain.connect(audioCtx.destination);
                snareOsc.type = 'square';
                snareOsc.frequency.setValueAtTime(250, t);
                snareOsc.frequency.linearRampToValueAtTime(120, t + 0.06);
                snareGain.gain.setValueAtTime(0.12, t);
                snareGain.gain.linearRampToValueAtTime(0, t + 0.08);
                snareOsc.start(t);
                snareOsc.stop(t + 0.08);
            }
        });

        // Schedule next loop
        setTimeout(playLoop, loopLength * 1000);
    }

    playLoop();
}

// Resume audio context on first user interaction & start music
document.addEventListener('keydown', () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    startBgMusic();
}, { once: true });

// --- Constants ---
const TILE = 32;
const COLS = 21;
const ROWS = 23;
canvas.width = COLS * TILE;
canvas.height = ROWS * TILE;

// Map legend:
// 1 = wall, 0 = dot, 2 = empty, 3 = power pellet, 4 = ghost house
const MAP = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,1,0,0,1,0,0,1,1,1,0,1,1,0,1],
    [1,3,1,1,0,1,1,1,0,0,1,0,0,1,1,1,0,1,1,3,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,1,0,1],
    [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
    [1,1,1,1,0,1,1,1,0,0,1,0,0,1,1,1,0,1,1,1,1],
    [2,2,2,1,0,1,0,0,0,0,0,0,0,0,0,1,0,1,2,2,2],
    [1,1,1,1,0,1,0,1,1,4,4,4,1,1,0,1,0,1,1,1,1],
    [0,0,0,0,0,0,0,1,4,4,4,4,4,1,0,0,0,0,0,0,0],
    [1,1,1,1,0,1,0,1,4,4,4,4,4,1,0,1,0,1,1,1,1],
    [2,2,2,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,2,2,2],
    [1,1,1,1,0,1,0,0,0,0,0,0,0,0,0,1,0,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,1,0,0,1,0,0,1,1,1,0,1,1,0,1],
    [1,3,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,3,1],
    [1,1,0,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,0,1,1],
    [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,0,0,1,0,0,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

// Deep-copy for resets
function cloneMap() { return MAP.map(r => [...r]); }
let map = cloneMap();

// --- Sprites ---
const pacOpenImg = new Image();
pacOpenImg.src = 'assets/pacman-open.png';
const pacClosedImg = new Image();
pacClosedImg.src = 'assets/pacman-dicht.png';

const ghostBlueImg = new Image();
ghostBlueImg.src = 'assets/ghost_blue.png';

const ghostRedImg = new Image();
ghostRedImg.src = 'assets/ghost_red.png';

const dotImg = new Image();
dotImg.src = 'assets/dot.png';

// --- Game state ---
let score = 0;
let lives = 3;
let gameOver = false;
let gameWon = false;
let totalDots = 0;
let dotsEaten = 0;
let powerMode = false;
let powerTimer = 0;
const POWER_DURATION = 300; // frames (~5 sec at 60fps)

// --- Bombs ---
let bombs = [];
const BOMB_FUSE = 300;          // frames until explosion (~5 sec at 60fps)
const BOMB_BLAST_RADIUS = 3;    // tiles
const BOMB_EXPLODE_DURATION = 30; // frames for explosion animation
const BOMB_COOLDOWN = 60;       // frames between bomb placements
let bombCooldownTimer = 0;
let screenShake = 0;

// Count dots
for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
        if (MAP[r][c] === 0 || MAP[r][c] === 3) totalDots++;

// --- Pac-Man ---
const pacman = {
    x: 10, y: 16,       // tile position
    px: 10 * TILE, py: 16 * TILE, // pixel position
    dir: { x: 0, y: 0 },
    nextDir: { x: 0, y: 0 },
    speed: 2,
    angle: 0, // rotation for sprite direction
    mouthOpen: true,
    mouthTimer: 0,
};

// --- Ghosts ---
const GHOST_COLORS = ['#ff0000', '#ffb8ff', '#00ffff', '#ffb852'];
const GHOST_NAMES = ['Blinky', 'Pinky', 'Inky', 'Clyde'];

function createGhosts() {
    return [
        { x: 9,  y: 10, px: 9 * TILE,  py: 10 * TILE, color: GHOST_COLORS[0], img: ghostRedImg,  dir: { x: 1, y: 0 },  speed: 1.5, scared: false },
        { x: 10, y: 10, px: 10 * TILE, py: 10 * TILE, color: GHOST_COLORS[1], img: ghostBlueImg, dir: { x: -1, y: 0 }, speed: 1.4, scared: false },
        { x: 11, y: 10, px: 11 * TILE, py: 10 * TILE, color: GHOST_COLORS[2], img: ghostRedImg,  dir: { x: 0, y: -1 }, speed: 1.3, scared: false },
        { x: 10, y: 11, px: 10 * TILE, py: 11 * TILE, color: GHOST_COLORS[3], img: ghostBlueImg, dir: { x: 0, y: 1 },  speed: 1.2, scared: false },
    ];
}
let ghosts = createGhosts();

// --- Input ---
const keys = {};
window.addEventListener('keydown', e => {
    keys[e.key] = true;
    // Prevent scrolling
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.key] = false; });

function getInputDir() {
    if (keys['ArrowLeft']  || keys['a'] || keys['A']) return { x: -1, y: 0 };
    if (keys['ArrowRight'] || keys['d'] || keys['D']) return { x: 1,  y: 0 };
    if (keys['ArrowUp']    || keys['w'] || keys['W']) return { x: 0,  y: -1 };
    if (keys['ArrowDown']  || keys['s'] || keys['S']) return { x: 0,  y: 1 };
    return null;
}

// --- Helpers ---
function tileAt(col, row) {
    // Wrap for tunnel
    if (col < 0) col = COLS - 1;
    if (col >= COLS) col = 0;
    if (row < 0 || row >= ROWS) return 1;
    return map[row][col];
}

function isWalkable(col, row) {
    const t = tileAt(col, row);
    return t !== 1;
}

function isWalkablePacman(col, row) {
    const t = tileAt(col, row);
    return t !== 1 && t !== 4;
}

function alignedToTile(px, py) {
    return px % TILE === 0 && py % TILE === 0;
}

// --- Pac-Man movement ---
function updatePacman() {
    const input = getInputDir();
    if (input) pacman.nextDir = input;

    if (alignedToTile(pacman.px, pacman.py)) {
        const tileX = pacman.px / TILE;
        const tileY = pacman.py / TILE;

        // Try next direction
        const nx = tileX + pacman.nextDir.x;
        const ny = tileY + pacman.nextDir.y;
        if (isWalkablePacman(nx, ny)) {
            pacman.dir = { ...pacman.nextDir };
        }

        // Check if current direction is still valid
        const cx = tileX + pacman.dir.x;
        const cy = tileY + pacman.dir.y;
        if (!isWalkablePacman(cx, cy)) {
            pacman.dir = { x: 0, y: 0 };
        }

        // Eat dot
        const tile = tileAt(tileX, tileY);
        if (tile === 0) {
            map[tileY][tileX] = 2;
            score += 10;
            dotsEaten++;
            playSound('chomp');
        } else if (tile === 3) {
            map[tileY][tileX] = 2;
            score += 50;
            dotsEaten++;
            activatePowerMode();
            playSound('power');
        }

        // Win check
        if (dotsEaten >= totalDots) {
            gameWon = true;
            messageEl.textContent = 'JE HEBT GEWONNEN! Druk op spatie om opnieuw te spelen.';
            playSound('win');
            return;
        }
    }

    // Move
    pacman.px += pacman.dir.x * pacman.speed;
    pacman.py += pacman.dir.y * pacman.speed;

    // Tunnel wrap
    if (pacman.px < -TILE) pacman.px = COLS * TILE;
    if (pacman.px > COLS * TILE) pacman.px = -TILE;

    // Update tile position
    pacman.x = Math.round(pacman.px / TILE);
    pacman.y = Math.round(pacman.py / TILE);

    // Rotation for sprite
    if (pacman.dir.x === 1) pacman.angle = 0;
    else if (pacman.dir.x === -1) pacman.angle = Math.PI;
    else if (pacman.dir.y === -1) pacman.angle = -Math.PI / 2;
    else if (pacman.dir.y === 1) pacman.angle = Math.PI / 2;

    // Mouth animation
    pacman.mouthTimer++;
    if (pacman.mouthTimer > 6) {
        pacman.mouthOpen = !pacman.mouthOpen;
        pacman.mouthTimer = 0;
    }
}

// --- Power mode ---
function activatePowerMode() {
    powerMode = true;
    powerTimer = POWER_DURATION;
    ghosts.forEach(g => g.scared = true);
}

// --- Ghost AI ---
function updateGhosts() {
    if (powerMode) {
        powerTimer--;
        if (powerTimer <= 0) {
            powerMode = false;
            ghosts.forEach(g => g.scared = false);
        }
    }

    ghosts.forEach(ghost => {
        if (!alignedToTile(ghost.px, ghost.py)) {
            ghost.px += ghost.dir.x * ghost.speed;
            ghost.py += ghost.dir.y * ghost.speed;

            // Snap to grid when close
            if (Math.abs(ghost.px - Math.round(ghost.px / TILE) * TILE) < ghost.speed &&
                Math.abs(ghost.py - Math.round(ghost.py / TILE) * TILE) < ghost.speed) {
                ghost.px = Math.round(ghost.px / TILE) * TILE;
                ghost.py = Math.round(ghost.py / TILE) * TILE;
            }
            return;
        }

        const tileX = ghost.px / TILE;
        const tileY = ghost.py / TILE;

        // Tunnel wrap
        if (tileX < 0) { ghost.px = (COLS - 1) * TILE; return; }
        if (tileX >= COLS) { ghost.px = 0; return; }

        // Collect possible directions (no reversal unless stuck)
        const dirs = [
            { x: 0, y: -1 }, { x: 0, y: 1 },
            { x: -1, y: 0 }, { x: 1, y: 0 }
        ];

        const reverse = { x: -ghost.dir.x, y: -ghost.dir.y };
        const possible = dirs.filter(d => {
            if (d.x === reverse.x && d.y === reverse.y) return false;
            return isWalkable(tileX + d.x, tileY + d.y);
        });

        if (possible.length === 0) {
            // Stuck – reverse
            ghost.dir = reverse;
        } else if (possible.length === 1) {
            ghost.dir = possible[0];
        } else {
            // Chase or flee
            const targetX = ghost.scared ? (COLS - pacman.x) : pacman.x;
            const targetY = ghost.scared ? (ROWS - pacman.y) : pacman.y;

            // Pick direction that brings closest to target (with some randomness)
            let best = possible[0];
            let bestDist = Infinity;
            for (const d of possible) {
                const nx = tileX + d.x;
                const ny = tileY + d.y;
                const dist = (nx - targetX) ** 2 + (ny - targetY) ** 2;
                // Small random factor for variety
                const r = dist + (Math.random() * 4 - 2);
                if (r < bestDist) {
                    bestDist = r;
                    best = d;
                }
            }
            ghost.dir = best;
        }

        ghost.px += ghost.dir.x * ghost.speed;
        ghost.py += ghost.dir.y * ghost.speed;
    });
}

// --- Collision ---
function checkCollisions() {
    const pr = TILE * 0.4; // collision radius
    ghosts.forEach((ghost, i) => {
        const dx = pacman.px - ghost.px;
        const dy = pacman.py - ghost.py;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < pr * 2) {
            if (ghost.scared) {
                // Eat ghost
                score += 200;
                ghost.px = 10 * TILE;
                ghost.py = 10 * TILE;
                ghost.dir = { x: 0, y: -1 };
                ghost.scared = false;
                playSound('ghost_eat');
            } else {
                // Lose life
                lives--;
                livesEl.textContent = '❤️'.repeat(lives);
                playSound('death');
                if (lives <= 0) {
                    gameOver = true;
                    messageEl.textContent = 'GAME OVER! Druk op spatie om opnieuw te spelen.';
                } else {
                    resetPositions();
                }
            }
        }
    });
}

function resetPositions() {
    pacman.px = 10 * TILE;
    pacman.py = 16 * TILE;
    pacman.dir = { x: 0, y: 0 };
    pacman.nextDir = { x: 0, y: 0 };
    ghosts = createGhosts();
}

function restartGame() {
    map = cloneMap();
    score = 0;
    lives = 3;
    dotsEaten = 0;
    gameOver = false;
    gameWon = false;
    powerMode = false;
    powerTimer = 0;
    bombs = [];
    bombCooldownTimer = 0;
    screenShake = 0;
    canvas.style.transform = '';
    scoreEl.textContent = 0;
    livesEl.textContent = '❤️❤️❤️';
    messageEl.textContent = 'Pijltjestoetsen of WASD om te bewegen';
    resetPositions();
}

window.addEventListener('keydown', e => {
    if (e.key === ' ') {
        if (gameOver || gameWon) restartGame();
        else placeBomb();
    }
});

// --- Bombs ---
function placeBomb() {
    if (bombCooldownTimer > 0) return;

    // Place bomb behind pacman (opposite of movement direction)
    let bombTileX = Math.round(pacman.px / TILE);
    let bombTileY = Math.round(pacman.py / TILE);

    // If pacman is moving, place bomb one tile behind
    if (pacman.dir.x !== 0 || pacman.dir.y !== 0) {
        bombTileX -= pacman.dir.x;
        bombTileY -= pacman.dir.y;
    }

    // Don't place on walls or ghost house
    const t = tileAt(bombTileX, bombTileY);
    if (t === 1 || t === 4) return;

    // Don't stack bombs on same tile
    if (bombs.some(b => b.tileX === bombTileX && b.tileY === bombTileY && !b.exploding)) return;

    bombs.push({
        tileX: bombTileX,
        tileY: bombTileY,
        timer: BOMB_FUSE,
        exploding: false,
        explodeTimer: 0,
    });

    bombCooldownTimer = BOMB_COOLDOWN;
    playSound('bomb_place');
}

function updateBombs() {
    if (bombCooldownTimer > 0) bombCooldownTimer--;

    bombs.forEach(bomb => {
        if (bomb.exploding) {
            bomb.explodeTimer--;
            if (bomb.explodeTimer <= 0) {
                bomb.done = true;
            }
        } else {
            bomb.timer--;
            if (bomb.timer <= 0) {
                // BOOM! Explode
                bomb.exploding = true;
                bomb.explodeTimer = BOMB_EXPLODE_DURATION;
                screenShake = 12;
                playSound('bomb_explode');

                // Check ghosts in blast radius
                ghosts.forEach(ghost => {
                    const gx = Math.round(ghost.px / TILE);
                    const gy = Math.round(ghost.py / TILE);
                    const dx = gx - bomb.tileX;
                    const dy = gy - bomb.tileY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist <= BOMB_BLAST_RADIUS) {
                        // Send ghost back to ghost house
                        score += 200;
                        ghost.px = 10 * TILE;
                        ghost.py = 10 * TILE;
                        ghost.dir = { x: 0, y: -1 };
                        ghost.scared = false;
                    }
                });

                // Check if pacman is in blast radius
                const px = Math.round(pacman.px / TILE);
                const py = Math.round(pacman.py / TILE);
                const pdx = px - bomb.tileX;
                const pdy = py - bomb.tileY;
                const pDist = Math.sqrt(pdx * pdx + pdy * pdy);
                if (pDist <= BOMB_BLAST_RADIUS) {
                    lives--;
                    livesEl.textContent = '❤️'.repeat(lives);
                    playSound('death');
                    if (lives <= 0) {
                        gameOver = true;
                        messageEl.textContent = 'GAME OVER! Druk op spatie om opnieuw te spelen.';
                    } else {
                        resetPositions();
                    }
                }
            }
        }
    });

    // Remove finished bombs
    bombs = bombs.filter(b => !b.done);

    if (screenShake > 0) screenShake--;
}

function drawBombs() {
    bombs.forEach(bomb => {
        const cx = bomb.tileX * TILE + TILE / 2;
        const cy = bomb.tileY * TILE + TILE / 2;

        if (bomb.exploding) {
            const progress = 1 - (bomb.explodeTimer / BOMB_EXPLODE_DURATION);
            const maxRadius = BOMB_BLAST_RADIUS * TILE;
            const radius = maxRadius * progress;
            const alpha = 1 - progress;

            // Outer glow
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#ff4500';
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();

            // Inner bright core
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(cx, cy, radius * 0.4, 0, Math.PI * 2);
            ctx.fill();

            // White center
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(cx, cy, radius * 0.15, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        } else {
            // Bomb ticking — pulsing black circle with fuse
            const pulse = 1 + Math.sin(Date.now() / 100) * 0.1;
            const bombSize = 10 * pulse;

            // Bomb body
            ctx.fillStyle = '#222';
            ctx.beginPath();
            ctx.arc(cx, cy, bombSize, 0, Math.PI * 2);
            ctx.fill();

            // Highlight
            ctx.fillStyle = '#555';
            ctx.beginPath();
            ctx.arc(cx - 3, cy - 3, 3, 0, Math.PI * 2);
            ctx.fill();

            // Fuse spark — blinks faster as timer runs out
            const blinkRate = Math.max(50, bomb.timer * 2);
            if (Math.floor(Date.now() / blinkRate) % 2 === 0) {
                ctx.fillStyle = '#ff4500';
                ctx.beginPath();
                ctx.arc(cx, cy - bombSize - 2, 4, 0, Math.PI * 2);
                ctx.fill();
            }

            // Timer text
            const secondsLeft = Math.ceil(bomb.timer / 60);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(secondsLeft, cx, cy);
        }
    });
}

// --- Drawing ---
function drawMap() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const tile = map[r][c];
            const x = c * TILE;
            const y = r * TILE;

            if (tile === 1) {
                // Wall — twee kleurvlakken diagonaal 45°
                // Outer border
                ctx.fillStyle = '#7b3f9e';
                ctx.fillRect(x, y, TILE, TILE);
                // Inner block met diagonale split
                ctx.save();
                ctx.beginPath();
                ctx.rect(x + 2, y + 2, TILE - 4, TILE - 4);
                ctx.clip();
                // Lila driehoek (linksboven)
                ctx.fillStyle = '#b07cc6';
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + TILE, y);
                ctx.lineTo(x, y + TILE);
                ctx.closePath();
                ctx.fill();
                // Groen driehoek (rechtsonder)
                ctx.fillStyle = '#2ecc71';
                ctx.beginPath();
                ctx.moveTo(x + TILE, y);
                ctx.lineTo(x + TILE, y + TILE);
                ctx.lineTo(x, y + TILE);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            } else if (tile === 0) {
                // Dot – use sprite
                if (dotImg.complete && dotImg.naturalWidth > 0) {
                    const dotSize = 12;
                    ctx.drawImage(dotImg, x + (TILE - dotSize) / 2, y + (TILE - dotSize) / 2, dotSize, dotSize);
                } else {
                    ctx.fillStyle = '#ffb8ae';
                    ctx.beginPath();
                    ctx.arc(x + TILE / 2, y + TILE / 2, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else if (tile === 3) {
                // Power pellet (blinking) – bigger dot sprite
                if (Math.floor(Date.now() / 200) % 2 === 0) {
                    if (dotImg.complete && dotImg.naturalWidth > 0) {
                        const pelletSize = 22;
                        ctx.drawImage(dotImg, x + (TILE - pelletSize) / 2, y + (TILE - pelletSize) / 2, pelletSize, pelletSize);
                    } else {
                        ctx.fillStyle = '#ffb8ae';
                        ctx.beginPath();
                        ctx.arc(x + TILE / 2, y + TILE / 2, 8, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            } else if (tile === 4) {
                // Ghost house – dark fill
                ctx.fillStyle = '#111';
                ctx.fillRect(x, y, TILE, TILE);
            }
            // tile === 2: empty, draw nothing (black bg)
        }
    }

    // Ghost house gate
    ctx.fillStyle = '#ff1493';
    ctx.fillRect(9 * TILE, 9 * TILE, 3 * TILE, 3);
}

function drawPacman() {
    const cx = pacman.px + TILE / 2;
    const cy = pacman.py + TILE / 2;
    const size = TILE - 4;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(pacman.angle);

    const pacImg = pacman.mouthOpen ? pacOpenImg : pacClosedImg;
    if (pacImg.complete && pacImg.naturalWidth > 0) {
        ctx.drawImage(pacImg, -size / 2, -size / 2, size, size);
    } else {
        // Fallback
        const mouthAngle = pacman.mouthOpen ? 0.25 : 0.05;
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, mouthAngle * Math.PI, (2 - mouthAngle) * Math.PI);
        ctx.lineTo(0, 0);
        ctx.fill();
    }

    ctx.restore();
}

function drawGhosts() {
    ghosts.forEach(ghost => {
        const x = ghost.px;
        const y = ghost.py;
        const size = TILE + 4; // slightly larger than tile for hand-drawn feel
        const offset = (TILE - size) / 2;

        if (ghost.scared) {
            // Scared mode: draw blue tinted, blinking when almost over
            const blinking = powerTimer < 60 && Math.floor(Date.now() / 150) % 2 === 0;

            ctx.save();
            ctx.globalAlpha = blinking ? 0.5 : 0.9;
            // Draw a blue-tinted version
            if (ghostBlueImg.complete && ghostBlueImg.naturalWidth > 0) {
                ctx.drawImage(ghostBlueImg, x + offset, y + offset, size, size);
            }
            ctx.restore();
        } else {
            // Normal: use the ghost's assigned sprite
            const img = ghost.img;
            if (img && img.complete && img.naturalWidth > 0) {
                ctx.drawImage(img, x + offset, y + offset, size, size);
            } else {
                // Fallback: colored square
                ctx.fillStyle = ghost.color;
                ctx.fillRect(x + 2, y + 2, TILE - 4, TILE - 4);
            }
        }
    });
}

// --- Game loop ---
function gameLoop() {
    // Update logic first (before any drawing)
    if (!gameOver && !gameWon) {
        updatePacman();
        updateGhosts();
        updateBombs();
        checkCollisions();
    }

    // Clear screen
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Screen shake via CSS transform (no ctx state issues)
    if (screenShake > 0) {
        const sx = (Math.random() - 0.5) * screenShake * 2;
        const sy = (Math.random() - 0.5) * screenShake * 2;
        canvas.style.transform = `translate(${sx}px, ${sy}px)`;
    } else {
        canvas.style.transform = '';
    }

    drawMap();
    drawBombs();
    drawPacman();
    drawGhosts();

    // Game over / win overlay
    if (gameOver) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 72px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 30);
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px monospace';
        ctx.fillText('Druk op spatie om opnieuw te spelen', canvas.width / 2, canvas.height / 2 + 30);
        ctx.restore();
    } else if (gameWon) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 44px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('JE HEBT GEWONNEN!', canvas.width / 2, canvas.height / 2 - 30);
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px monospace';
        ctx.fillText('Druk op spatie om opnieuw te spelen', canvas.width / 2, canvas.height / 2 + 30);
        ctx.restore();
    }

    scoreEl.textContent = score;

    requestAnimationFrame(gameLoop);
}

// Start
gameLoop();
