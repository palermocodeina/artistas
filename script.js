// script.js — Palermo Codeina 2.0

document.addEventListener('DOMContentLoaded', () => {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const groups = document.querySelectorAll('.level-group');
  const canvas = document.getElementById('fightCanvas');
  const ctx = canvas.getContext('2d');
  let player1 = null, player2 = null, selectingSlot = null;

  function setActiveFilter(filter) {
    filterBtns.forEach(b => b.classList.toggle('active', b.dataset.filter === filter));
    groups.forEach(g => {
      g.style.display = (filter === 'all' || g.dataset.level === filter) ? 'grid' : 'none';
    });
  }

  filterBtns.forEach(btn => btn.addEventListener('click', () => setActiveFilter(btn.dataset.filter)));
  setActiveFilter('all');

  // Selección de personajes
  function enableSelection(slot) {
    selectingSlot = slot;
    document.querySelectorAll('#grids-container .item').forEach(it => {
      it.classList.add('selectable');
      it.addEventListener('click', onSelectCharacter);
    });
    document.getElementById('catalogo').scrollIntoView({ behavior: 'smooth' });
  }

  function disableSelection() {
    document.querySelectorAll('#grids-container .item').forEach(it => {
      it.classList.remove('selectable');
      it.removeEventListener('click', onSelectCharacter);
    });
  }

  function onSelectCharacter(e) {
    const item = e.currentTarget;
    const name = item.querySelector('.meta h3').textContent.trim();
    const img = item.querySelector('.thumb img').src;
    const character = { name, img };
    if (selectingSlot === 'left') {
      player1 = character;
      const slot = document.getElementById('slot-left');
      slot.style.background = `url(${img}) center/cover no-repeat`;
      slot.textContent = '';
    } else {
      player2 = character;
      const slot = document.getElementById('slot-right');
      slot.style.background = `url(${img}) center/cover no-repeat`;
      slot.textContent = '';
    }
    disableSelection();
    selectingSlot = null;
    drawScene();
    if (player1 && player2) startPingPong();
  }

  document.getElementById('slot-left').addEventListener('click', () => enableSelection('left'));
  document.getElementById('slot-right').addEventListener('click', () => enableSelection('right'));

  function drawScene() {
    ctx.fillStyle = '#07060a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (player1) {
      ctx.fillStyle = '#3afca4';
      ctx.fillRect(50, canvas.height - 80, 60, 60);
    }
    if (player2) {
      ctx.fillStyle = '#b974ff';
      ctx.fillRect(canvas.width - 110, canvas.height - 80, 60, 60);
    }
  }
  drawScene();

  let keys = {};
  let mobileInput = { p1: 0, p2: 0 };
  window.addEventListener('keydown', e => keys[e.key] = true);
  window.addEventListener('keyup', e => keys[e.key] = false);

  function startPingPong() {
    let paddleSize = 60;
    let paddle1 = { x: 40, y: canvas.height / 2 - paddleSize / 2, w: paddleSize, h: paddleSize };
    let paddle2 = { x: canvas.width - 40 - paddleSize, y: canvas.height / 2 - paddleSize / 2, w: paddleSize, h: paddleSize };
    let ball = { x: canvas.width / 2, y: canvas.height / 2, r: 10, dx: 4, dy: 3 };
    const img1 = new Image(); img1.src = player1.img;
    const img2 = new Image(); img2.src = player2.img;

    function draw() {
      ctx.fillStyle = '#07060a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img1, paddle1.x, paddle1.y, paddle1.w, paddle1.h);
      ctx.drawImage(img2, paddle2.x, paddle2.y, paddle2.w, paddle2.h);
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
      ctx.fill();
    }

    function update() {
      if (keys['w']) paddle1.y -= 5;
      if (keys['s']) paddle1.y += 5;
      if (keys['i']) paddle2.y -= 5;
      if (keys['k']) paddle2.y += 5;
      ball.x += ball.dx;
      ball.y += ball.dy;
      if (ball.y - ball.r < 0 || ball.y + ball.r > canvas.height) ball.dy *= -1;
      if (ball.x - ball.r < paddle1.x + paddle1.w && ball.y > paddle1.y && ball.y < paddle1.y + paddle1.h) ball.dx *= -1;
      if (ball.x + ball.r > paddle2.x && ball.y > paddle2.y && ball.y < paddle2.y + paddle2.h) ball.dx *= -1;
      if (ball.x - ball.r < 0 || ball.x + ball.r > canvas.width) {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.dx *= -1;
      }
    }

    function loop() { update(); draw(); requestAnimationFrame(loop); }
    loop();
  }
});
