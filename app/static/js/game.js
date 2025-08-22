const canvas = document.getElementById("pacman");
const ctx = canvas.getContext("2d");

const TILE_SIZE = canvas.width / 28;
const ROWS = 31;
const COLS = 28;
let score = 0;
let lives = 3;
let pacmanAngle = 0;
let mouthOpen = true;
let powerMode = false;
let powerModeTimer = null;
let gameStartTime = Date.now();

// Position de la maison des fantômes
const GHOST_HOUSE = {
  x: 13,
  y: 11,
  width: 4,
  height: 3,
  door: { x: 13, y: 11 }
};

// Délais plus courts pour que les fantômes sortent plus rapidement
const GHOST_EXIT_DELAYS = [0, 1000, 2000, 3000];

const map = [
  "############################",
  "#............##............#",
  "#.####.#####.##.#####.####.#",
  "#o####.#####.##.#####.####o#",
  "#.####.#####.##.#####.####.#",
  "#..........................#",
  "#.####.##.########.##.####.#",
  "#......##....##....##......#",
  "######.##### ## #####.######",
  "     #.##### ## #####.#     ",
  "     #.##          ##.#     ",
  "     #.## ###--### ##.#     ",
  "######.## #      # ##.######",
  "      .   #      #   .      ",
  "######.## #      # ##.######",
  "     #.## ######## ##.#     ",
  "     #.##          ##.#     ",
  "     #.## ######## ##.#     ",
  "######.## ######## ##.######",
  "#............##............#",
  "#.####.#####.##.#####.####.#",
  "#o..##................##..o#",
  "###.##.##.########.##.##.###",
  "#......##....##....##......#",
  "#.##########.##.##########.#",
  "#..........................#",
  "############################"
];

const INITIAL_PLAYER_POS = { x: 13, y: 23 };
const player = {
  x: INITIAL_PLAYER_POS.x,
  y: INITIAL_PLAYER_POS.y,
  dir: { x: 0, y: -1 },
  nextDir: { x: 0, y: 0 },
  moveDelay: 0
};

const INITIAL_GHOST_POSITIONS = [
  { x: 11, y: 13, color: "red" },
  { x: 13, y: 13, color: "pink" },
  { x: 15, y: 13, color: "cyan" },
  { x: 17, y: 13, color: "orange" }
];

const enemies = INITIAL_GHOST_POSITIONS.map((ghost, index) => ({
  ...ghost,
  dir: randomDir(),
  moveDelay: 0,
  eaten: false,
  respawnTimer: 0,
  exitDelay: GHOST_EXIT_DELAYS[index],
  inHouse: true,
  visible: true
}));

function resetGame() {
  player.x = INITIAL_PLAYER_POS.x;
  player.y = INITIAL_PLAYER_POS.y;
  player.dir = { x: 0, y: -1 };
  player.nextDir = { x: 0, y: 0 };

  enemies.forEach((ghost, index) => {
    const initialPos = INITIAL_GHOST_POSITIONS[index];
    ghost.x = initialPos.x;
    ghost.y = initialPos.y;
    ghost.dir = randomDir();
    ghost.eaten = false;
    ghost.respawnTimer = 0;
    ghost.inHouse = true;
    ghost.exitDelay = GHOST_EXIT_DELAYS[index];
    ghost.visible = true;
  });

  powerMode = false;
  if (powerModeTimer) clearTimeout(powerModeTimer);
}

function updateLives(newLives) {
  lives = newLives;
  const livesContainer = document.getElementById("lives");
  livesContainer.innerHTML = "";
  for (let i = 0; i < lives; i++) {
    const life = document.createElement("div");
    life.className = "life";
    livesContainer.appendChild(life);
  }
}

document.addEventListener("keydown", e => {
  const dirs = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 }
  };
  if (dirs[e.key]) player.nextDir = dirs[e.key];
});

function randomDir() {
  const dirs = [{x:1,y:0}, {x:-1,y:0}, {x:0,y:1}, {x:0,y:-1}];
  return dirs[Math.floor(Math.random() * dirs.length)];
}

function canMove(x, y) {
  const row = map[y];
  if (!row) return false;
  const tile = row[x];
  return tile && tile !== "#" && tile !== undefined;
}

function move(ghost) {
  // Si le fantôme est dans la maison
  if (ghost.inHouse) {
    // Vérifier si c'est le moment de sortir
    if (Date.now() - gameStartTime > ghost.exitDelay) {
      // Déplacement vers la porte de sortie
      if (ghost.x < GHOST_HOUSE.door.x) {
        ghost.x += 0.5;
      } else if (ghost.x > GHOST_HOUSE.door.x) {
        ghost.x -= 0.5;
      } else if (ghost.y > GHOST_HOUSE.door.y) {
        ghost.y -= 0.5;
      } else {
        // À la porte, sortir
        ghost.inHouse = false;
        ghost.dir = { x: 0, y: -1 };
      }
    }
    return;
  }

  // Pour les fantômes hors de la maison
  ghost.moveDelay++;
  if (ghost.moveDelay < 2) return; // Plus rapide
  ghost.moveDelay = 0;

  // Comportement en mode power
  if (powerMode && !ghost.eaten) {
    const dx = ghost.x - player.x;
    const dy = ghost.y - player.y;
    const possibleDirs = [];

    if (Math.abs(dx) > Math.abs(dy)) {
      possibleDirs.push({x: Math.sign(dx), y: 0});
      possibleDirs.push({x: 0, y: Math.sign(dy)});
    } else {
      possibleDirs.push({x: 0, y: Math.sign(dy)});
      possibleDirs.push({x: Math.sign(dx), y: 0});
    }

    // Essayer de fuir
    for (const dir of possibleDirs) {
      const nx = ghost.x + dir.x;
      const ny = ghost.y + dir.y;
      if (canMove(nx, ny)) {
        ghost.dir = dir;
        break;
      }
    }
  } else if (Math.random() < 0.1) { // Moins de changements aléatoires
    ghost.dir = randomDir();
  }

  const nx = ghost.x + ghost.dir.x;
  const ny = ghost.y + ghost.dir.y;

  if (canMove(nx, ny)) {
    ghost.x = nx;
    ghost.y = ny;
  } else {
    const possibleDirs = [{x:1,y:0}, {x:-1,y:0}, {x:0,y:1}, {x:0,y:-1}]
      .filter(dir => {
        const nx = ghost.x + dir.x;
        const ny = ghost.y + dir.y;
        return canMove(nx, ny);
      });

    if (possibleDirs.length > 0) {
      ghost.dir = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
    }
  }
}

function drawGhost(x, y, color, isScared) {
  ctx.fillStyle = isScared ? "#2121ff" : color;

  // Corps du fantôme
  ctx.beginPath();
  ctx.arc(x, y, TILE_SIZE/2 - 2, Math.PI, 0, false);
  ctx.lineTo(x + TILE_SIZE/2 - 2, y + TILE_SIZE/2 - 2);

  // Base ondulée
  const waves = 4;
  const waveHeight = TILE_SIZE/8;
  for(let i = 0; i <= waves; i++) {
    const curve = Math.sin(i * Math.PI / waves) * waveHeight;
    if(i === 0) {
      ctx.lineTo(x + TILE_SIZE/2 - 2 - (TILE_SIZE/waves * i), y + TILE_SIZE/2 - 2 + curve);
    } else {
      ctx.quadraticCurveTo(
        x + TILE_SIZE/2 - 2 - (TILE_SIZE/waves * (i-0.5)), y + TILE_SIZE/2 - 2 + (curve < 0 ? -waveHeight : waveHeight),
        x + TILE_SIZE/2 - 2 - (TILE_SIZE/waves * i), y + TILE_SIZE/2 - 2 + curve
      );
    }
  }

  ctx.lineTo(x - TILE_SIZE/2 + 2, y);
  ctx.fill();

  if (isScared) {
    // Yeux effrayés
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(x - TILE_SIZE/6, y - TILE_SIZE/6, TILE_SIZE/8, 0, Math.PI * 2);
    ctx.arc(x + TILE_SIZE/6, y - TILE_SIZE/6, TILE_SIZE/8, 0, Math.PI * 2);
    ctx.fill();

    // Bouche effrayée
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - TILE_SIZE/4, y + TILE_SIZE/6);
    for(let i = 0; i < 4; i++) {
      ctx.lineTo(x - TILE_SIZE/4 + (i * TILE_SIZE/6), y + TILE_SIZE/6 + (i % 2 ? -TILE_SIZE/8 : TILE_SIZE/8));
    }
    ctx.stroke();
  } else {
    // Yeux normaux
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(x - TILE_SIZE/6, y - TILE_SIZE/6, TILE_SIZE/8, 0, Math.PI * 2);
    ctx.arc(x + TILE_SIZE/6, y - TILE_SIZE/6, TILE_SIZE/8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(x - TILE_SIZE/6, y - TILE_SIZE/6, TILE_SIZE/16, 0, Math.PI * 2);
    ctx.arc(x + TILE_SIZE/6, y - TILE_SIZE/6, TILE_SIZE/16, 0, Math.PI * 2);
    ctx.fill();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Dessiner le labyrinthe
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] === "#") {
        ctx.fillStyle = "#0066FF";
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

        const gradient = ctx.createLinearGradient(
          x * TILE_SIZE, y * TILE_SIZE,
          (x + 1) * TILE_SIZE, (y + 1) * TILE_SIZE
        );
        gradient.addColorStop(0, "rgba(0, 255, 255, 0.2)");
        gradient.addColorStop(0.5, "rgba(0, 255, 255, 0)");
        gradient.addColorStop(1, "rgba(0, 255, 255, 0.2)");
        ctx.fillStyle = gradient;
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      } else if (map[y][x] === "." || map[y][x] === "o") {
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(
          x * TILE_SIZE + TILE_SIZE / 2,
          y * TILE_SIZE + TILE_SIZE / 2,
          map[y][x] === "o" ? TILE_SIZE/4 : TILE_SIZE/10,
          0, Math.PI * 2
        );
        ctx.fill();

        ctx.shadowColor = "#fff";
        ctx.shadowBlur = map[y][x] === "o" ? 10 : 5;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  }

  // Animation de la bouche de Pacman
  pacmanAngle += mouthOpen ? 0.15 : -0.15;
  if (pacmanAngle >= Math.PI/4) mouthOpen = false;
  else if (pacmanAngle <= 0) mouthOpen = true;

  // Calcul de la rotation de Pacman
  let rotation = 0;
  if (player.dir.x === 1) rotation = 0;
  else if (player.dir.x === -1) rotation = Math.PI;
  else if (player.dir.y === -1) rotation = -Math.PI/2;
  else if (player.dir.y === 1) rotation = Math.PI/2;

  // Dessiner Pacman
  ctx.save();
  ctx.translate(
    player.x * TILE_SIZE + TILE_SIZE / 2,
    player.y * TILE_SIZE + TILE_SIZE / 2
  );
  ctx.rotate(rotation);

  ctx.fillStyle = "#FFFF00";
  ctx.beginPath();
  ctx.arc(0, 0, TILE_SIZE/2 - 2, pacmanAngle, Math.PI * 2 - pacmanAngle);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();

  ctx.shadowColor = "#FFFF00";
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.restore();

  // Dessiner les fantômes visibles uniquement
  for (const ghost of enemies) {
    if (ghost.visible && (!ghost.eaten || ghost.inHouse)) {
      drawGhost(
        ghost.x * TILE_SIZE + TILE_SIZE / 2,
        ghost.y * TILE_SIZE + TILE_SIZE / 2,
        ghost.color,
        powerMode && !ghost.eaten
      );
    }
  }

  document.getElementById("score").textContent = score;
}

function update() {
  // Mouvement de Pacman
  player.moveDelay++;
  if (player.moveDelay < 2) return;
  player.moveDelay = 0;

  const nx = player.x + player.nextDir.x;
  const ny = player.y + player.nextDir.y;
  if (canMove(nx, ny)) player.dir = player.nextDir;

  const px = player.x + player.dir.x;
  const py = player.y + player.dir.y;
  if (canMove(px, py)) {
    player.x = px;
    player.y = py;

    const row = map[player.y].split("");
    if (row[player.x] === "." || row[player.x] === "o") {
      if (row[player.x] === "o") {
        score += 50;
        powerMode = true;
        if (powerModeTimer) clearTimeout(powerModeTimer);
        powerModeTimer = setTimeout(() => {
          powerMode = false;
          enemies.forEach(ghost => {
            if (ghost.eaten) {
              ghost.visible = true;
              ghost.eaten = false;
              ghost.inHouse = true;
              ghost.exitDelay = Date.now() - gameStartTime + 3000;
            }
          });
        }, 10000);
      } else {
        score += 10;
      }
      row[player.x] = " ";
      map[player.y] = row.join("");
    }
  }

  // Mouvement et collision des fantômes
  for (const ghost of enemies) {
    if (!ghost.eaten) {
      move(ghost);

      if (ghost.x === player.x && ghost.y === player.y) {
        if (powerMode) {
          ghost.eaten = true;
          ghost.visible = false;
          score += 200;

          setTimeout(() => {
            ghost.x = GHOST_HOUSE.x;
            ghost.y = GHOST_HOUSE.y;
            ghost.inHouse = true;
            ghost.visible = true;
            ghost.exitDelay = Date.now() - gameStartTime + 3000;
          }, 1000);
        } else {
          lives--;
          updateLives(lives);

          if (lives <= 0) {
            ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            setTimeout(() => {
              alert("Game Over! Score: " + score);
              document.location.reload();
            }, 300);
            return;
          } else {
            resetGame();
            return;
          }
        }
      }
    }
  }
}

function gameLoop() {
  update();
  draw();
}

updateLives(lives);
setInterval(gameLoop, 50);
