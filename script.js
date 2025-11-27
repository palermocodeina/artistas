// -----------------------------
//  VARIABLES GLOBALES Y CANVAS
// -----------------------------
const canvas = document.getElementById("fightCanvas");
const ctx = canvas.getContext("2d");

let player1 = null;
let player2 = null;
let selectingSlot = null;

// -----------------------------
//  EXTRAER PERSONAJES DEL CATÁLOGO
// -----------------------------
const characters = Array.from(document.querySelectorAll(".catalogo .item")).map(item => {
  const name = item.querySelector("h3").textContent.trim();
  const img = item.querySelector("img").getAttribute("src");
  return {
    name,
    img,
    color: getRandomColor()
  };
});

function getRandomColor() {
  const colors = ["#3afca4", "#b974ff", "#ff4d4d", "#4da6ff", "#f7ff3a"];
  return colors[Math.floor(Math.random() * colors.length)];
}

// -----------------------------
//  SELECCIÓN DIRECTA EN EL CATÁLOGO
// -----------------------------
function enableSelection(slot) {
  selectingSlot = slot;

  // Agregar la clase selectable a todos los items
  document.querySelectorAll(".catalogo .item").forEach(item => {
    item.classList.add("selectable");
    item.addEventListener("click", onSelectCharacter);
  });

  // Scroll automático hacia el catálogo
  document.getElementById("catalogo").scrollIntoView({ behavior: "smooth" });
}

function onSelectCharacter(e) {
  const item = e.currentTarget;
  const name = item.querySelector("h3").textContent.trim();
  const img = item.querySelector("img").getAttribute("src");

  const character = { name, img, color: getRandomColor() };

  if (selectingSlot === "left") {
    player1 = character;
    const slot = document.getElementById("slot-left");
    slot.style.background = `url(${character.img}) center/cover no-repeat`;
    slot.textContent = "";
  } else if (selectingSlot === "right") {
    player2 = character;
    const slot = document.getElementById("slot-right");
    slot.style.background = `url(${character.img}) center/cover no-repeat`;
    slot.textContent = "";
  }

  // Desactivar modo selección
  disableSelection();
  selectingSlot = null;
  drawScene();

  // 👇 Desplazar suavemente hacia el canvas
  document.getElementById("fightCanvas").scrollIntoView({ 
    behavior: "smooth", 
    block: "center" 
  });

  // Si ambos ya están elegidos → arrancar juego
  if (player1 && player2) {
    startPingPong();
  }
}


function disableSelection() {
  document.querySelectorAll(".catalogo .item").forEach(item => {
    item.classList.remove("selectable");
    item.removeEventListener("click", onSelectCharacter);
  });
}

// -----------------------------
//  EVENTOS DE LOS SLOTS
// -----------------------------
document.getElementById("slot-left").addEventListener("click", () => enableSelection("left"));
document.getElementById("slot-right").addEventListener("click", () => enableSelection("right"));

// -----------------------------
//  ESCENA INICIAL (VACÍA)
// -----------------------------
function drawScene() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (player1) {
    ctx.fillStyle = player1.color;
    ctx.fillRect(50, 200, 40, 40);
  }

  if (player2) {
    ctx.fillStyle = player2.color;
    ctx.fillRect(500, 200, 40, 40);
  }
}

drawScene();

// -----------------------------
//  JUEGO PONG
// -----------------------------
function startPingPong() {
  // Paletas cuadradas más chicas
  let paddleSize = 60; // tamaño cuadrado
  let paddle1 = { x: 40, y: canvas.height / 2 - paddleSize / 2, w: paddleSize, h: paddleSize };
  let paddle2 = { x: canvas.width - 40 - paddleSize, y: canvas.height / 2 - paddleSize / 2, w: paddleSize, h: paddleSize };

  // Pelota
  let ball = { x: canvas.width / 2, y: canvas.height / 2, r: 10, dx: 4, dy: 3 };

  // Imágenes de jugadores
  const img1 = new Image();
  img1.src = player1.img;

  const img2 = new Image();
  img2.src = player2.img;

  function draw() {
    // Fondo
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Paleta izquierda (imagen cuadrada)
    ctx.drawImage(img1, paddle1.x, paddle1.y, paddle1.w, paddle1.h);

    // Paleta derecha (imagen cuadrada)
    ctx.drawImage(img2, paddle2.x, paddle2.y, paddle2.w, paddle2.h);

    // Pelota
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();
  }


  function update() {
    // Movimiento de la pelota
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Rebote en techo/suelo
    if (ball.y - ball.r < 0 || ball.y + ball.r > canvas.height) {
      ball.dy *= -1;
    }

    // Rebote con paleta izquierda
    if (
      ball.x - ball.r < paddle1.x + paddle1.w &&
      ball.y > paddle1.y &&
      ball.y < paddle1.y + paddle1.h
    ) {
      ball.dx *= -1;
    }

    // Rebote con paleta derecha
    if (
      ball.x + ball.r > paddle2.x &&
      ball.y > paddle2.y &&
      ball.y < paddle2.y + paddle2.h
    ) {
      ball.dx *= -1;
    }

    // Si alguien falla → reinicio
    if (ball.x - ball.r < 0 || ball.x + ball.r > canvas.width) {
      ball.x = canvas.width / 2;
      ball.y = canvas.height / 2;
      ball.dx *= -1;
      ball.dy = Math.random() > 0.5 ? 3 : -3;
    }

    // Movimiento automático de paletas siguiendo la pelota

paddle1.y += (ball.y - (paddle1.y + paddle1.h / 2)) * 0.15;
paddle2.y += (ball.y - (paddle2.y + paddle2.h / 2)) * 0.15;

  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  loop();
}
let paddle1, paddle2, ball;
let keys = {}; // teclas presionadas
let mobileInput = { p1: 0, p2: 0 }; // dirección de cada jugador

// Detectar móvil → mostrar controles
if ('ontouchstart' in window) {
  document.getElementById("mobile-controls").classList.remove("hidden");

  document.querySelectorAll("#mobile-controls button").forEach(btn => {
    btn.addEventListener("touchstart", () => {
      const player = btn.dataset.player;
      const dir = btn.dataset.dir;
      if (player === "1") mobileInput.p1 = dir === "up" ? -5 : 5;
      if (player === "2") mobileInput.p2 = dir === "up" ? -5 : 5;
    });
    btn.addEventListener("touchend", () => {
      const player = btn.dataset.player;
      if (player === "1") mobileInput.p1 = 0;
      if (player === "2") mobileInput.p2 = 0;
    });
  });
}

// Eventos teclado
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

function startPingPong() {
  let paddleSize = 60;
  paddle1 = { x: 40, y: canvas.height / 2 - paddleSize / 2, w: paddleSize, h: paddleSize };
  paddle2 = { x: canvas.width - 40 - paddleSize, y: canvas.height / 2 - paddleSize / 2, w: paddleSize, h: paddleSize };

  ball = { x: canvas.width / 2, y: canvas.height / 2, r: 10, dx: 4, dy: 3 };

  const img1 = new Image(); img1.src = player1.img;
  const img2 = new Image(); img2.src = player2.img;

  function draw() {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(img1, paddle1.x, paddle1.y, paddle1.w, paddle1.h);
    ctx.drawImage(img2, paddle2.x, paddle2.y, paddle2.w, paddle2.h);

    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();
  }

  function update() {
    // Movimiento teclado PC
    if (keys["w"]) paddle1.y -= 5;
    if (keys["s"]) paddle1.y += 5;
    if (keys["i"]) paddle2.y -= 5;
    if (keys["k"]) paddle2.y += 5;

    // Movimiento táctil móvil
    paddle1.y += mobileInput.p1;
    paddle2.y += mobileInput.p2;

    // Movimiento de la pelota
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.y - ball.r < 0 || ball.y + ball.r > canvas.height) {
      ball.dy *= -1;
    }

    if (ball.x - ball.r < paddle1.x + paddle1.w &&
        ball.y > paddle1.y &&
        ball.y < paddle1.y + paddle1.h) {
      ball.dx *= -1;
    }

    if (ball.x + ball.r > paddle2.x &&
        ball.y > paddle2.y &&
        ball.y < paddle2.y + paddle2.h) {
      ball.dx *= -1;
    }

    if (ball.x - ball.r < 0 || ball.x + ball.r > canvas.width) {
      ball.x = canvas.width / 2;
      ball.y = canvas.height / 2;
      ball.dx *= -1;
    }
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  loop();
}
