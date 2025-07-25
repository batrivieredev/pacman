const canvas = document.getElementById("pacman");
const ctx = canvas.getContext("2d");

const TILE_SIZE = 25;
const ROWS = 31;
const COLS = 28;
let score = 0;

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

const player = {
  x: 13,
  y: 23,
  dir: { x: 0, y: -1 },
  nextDir: { x: 0, y: 0 }
};

const enemies = [
  { x: 13, y: 11, color: "red", dir: randomDir() },
  { x: 14, y: 11, color: "pink", dir: randomDir() },
  { x: 13, y: 13, color: "cyan", dir: randomDir() },
  { x: 14, y: 13, color: "orange", dir: randomDir() }
];

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
  const dirs = [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}];
  return dirs[Math.floor(Math.random() * dirs.length)];
}

function canMove(x, y) {
  const row = map[y];
  if (!row) return false;
  const tile = row[x];
  return tile && tile !== "#" && tile !== undefined;
}

function move(entity) {
  const nx = entity.x + entity.dir.x;
  const ny = entity.y + entity.dir.y;
  if (canMove(nx, ny)) {
    entity.x = nx;
    entity.y = ny;
  } else {
    entity.dir = randomDir();
  }
}

function drawTile(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] === "#") {
        drawTile(x, y, "blue");
      } else if (map[y][x] === "." || map[y][x] === "o") {
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(
          x * TILE_SIZE + TILE_SIZE / 2,
          y * TILE_SIZE + TILE_SIZE / 2,
          map[y][x] === "o" ? 5 : 2,
          0, Math.PI * 2
        );
        ctx.fill();
      }
    }
  }

  // Draw player as yellow circle
  ctx.fillStyle = "yellow";
  ctx.beginPath();
  ctx.arc(
    player.x * TILE_SIZE + TILE_SIZE / 2,
    player.y * TILE_SIZE + TILE_SIZE / 2,
    TILE_SIZE / 2 - 2, 0, Math.PI * 2
  );
  ctx.fill();

  // Draw enemies as colored circles
  for (const ghost of enemies) {
    ctx.fillStyle = ghost.color;
    ctx.beginPath();
    ctx.arc(
      ghost.x * TILE_SIZE + TILE_SIZE / 2,
      ghost.y * TILE_SIZE + TILE_SIZE / 2,
      TILE_SIZE / 2 - 2, 0, Math.PI * 2
    );
    ctx.fill();
  }

  document.getElementById("score").textContent = score;
}

function update() {
  // Update player direction if possible
  const nx = player.x + player.nextDir.x;
  const ny = player.y + player.nextDir.y;
  if (canMove(nx, ny)) player.dir = player.nextDir;

  // Move player
  const px = player.x + player.dir.x;
  const py = player.y + player.dir.y;
  if (canMove(px, py)) {
    player.x = px;
    player.y = py;

    // Eat dot
    const row = map[player.y].split("");
    if (row[player.x] === "." || row[player.x] === "o") {
      score += (row[player.x] === "o") ? 10 : 1;
      row[player.x] = " ";
      map[player.y] = row.join("");
    }
  }

  // Move enemies
  for (const ghost of enemies) {
    move(ghost);

    if (ghost.x === player.x && ghost.y === player.y) {
      alert("Game Over! Score: " + score);
      document.location.reload();
    }
  }
}

function gameLoop() {
  update();
  draw();
}

setInterval(gameLoop, 180);
