function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

const init = async () => {
  // Create Canvas Element
  canvas = document.createElement("canvas");
  ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  // Set Canvas Size
  canvas.width = 16;
  canvas.height = 16;

  game = {
    fps: 8,
    state: 'start',
    previousState: 'start',
    showOnBody: false
  };

  // Load Images
  [favicon, logo, win, numbers] = await Promise.all([
    loadImage('assets/favicon.svg'),
    loadImage('assets/logo.png'),
    loadImage('assets/win.png'),
    loadImage('assets/numbers.png')
  ]);

  faviconLink = document.querySelector('link[rel="shortcut icon"]');

  previousFrame = '';

  snake = {
    fill: '#17ee17',
    direction: 'right',
    directionQueue: [],
    length: 0,
    head: [0, 0],
    tail: [[]]
  };

  apple = {
    fill: '#ee1717',
    pos: [0, 0]
  };

  setupInputs();
  startGame();
  setInterval(gameLoop, 1000 / game.fps);

}; // End of Init

const setupInputs = () => {

  // Keyboard Control Listers
  document.addEventListener('keydown', (e) => {

    if (game.state === 'playing' || game.state === 'start') {

      // Up
      if (e.key === 'ArrowUp' || e.key === 'w') setSnakeDirection('up');
      // Down
      if (e.key === 'ArrowDown' || e.key === 's') setSnakeDirection('down');
      // Left
      if (e.key === 'ArrowLeft' || e.key === 'a') setSnakeDirection('left');
      // Right
      if (e.key === 'ArrowRight' || e.key === 'd') setSnakeDirection('right');
      // Start Game if haven't
      if (snake.directionQueue.length > 0 && (game.state == 'start')) {
        game.state = 'playing';
        game.previousState = 'playing';
      }

    }

    // Pause Menu via Escape Key
    if (e.key === 'Escape' && game.state != 'end' && game.state != 'win' && game.state != 'outOfFocus') {

      if (game.state == 'pause') {
        game.state = game.previousState;
      } else {
        game.previousState = game.state;
        game.state = "pause";
      }

    }

    // Restart Game via Space Key
    if (e.code === 'Space' && (game.state == 'end' || game.state == 'win')) {
      startGame();
    }

  });

  // Set Snake Direction Function
  function setSnakeDirection(newDirection) {
    const lastDir = snake.directionQueue.at(-1) || snake.direction;
    const opposite = {
      up: 'down',
      down: 'up',
      left: 'right',
      right: 'left'
    };

    if (lastDir !== opposite[newDirection] && lastDir !== newDirection) {
      snake.directionQueue.push(newDirection);
    }
  }

};

function randNum(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function startGame() {
  game.state = 'start';
  game.previousState = 'start';

  snake.direction = 'right';
  snake.directionQueue = [];
  snake.length = 0;
  snake.head = [
    randNum(0, canvas.width / 2), 
    randNum(canvas.height / 2, canvas.height - 2)
  ];
  snake.tail = [[]];

  apple.pos = [
    randNum(2, canvas.width - 2), 
    randNum(canvas.height / 2, canvas.height - 2)
  ];

  if (snake.head[1] == apple.pos[1]) apple.pos[1] -= 1;

}

function moveApple() {
  // Check if Game Over
  if (snake.length >= (canvas.width * canvas.height) - 1) {
    game.state = 'win';
    return;
  }

  // Move Apple to New Random Position where snake isn't
  let newPos = [];

  do {
    newPos = [
      randNum(0, canvas.width - 1), 
      randNum(0, canvas.height - 1)
    ];
  } while (isCellInSnake(newPos));

  apple.pos = newPos;

  function isCellInSnake(newPos) {
    // Check if the cell is part of the snake's body
    for (let i = 0; i < snake.length; i++) {
      if (
        snake.tail[i][0] === newPos[0] &&
        snake.tail[i][1] === newPos[1]
      ) {
        return true;
      }
    }
    return false;
  }

}

let gameLoop = () => {

  if (
    (!document.hasFocus() || document.hidden) && 
  	game.state != 'pause' &&
  	game.state != 'end' &&
    game.state != 'win'
  ) {
    if (game.state != 'outOfFocus') game.previousState = game.state;
    game.state = 'outOfFocus';
  } else if (game.state == 'outOfFocus') {
    game.state = game.previousState;
  } else if (game.state == 'start' || game.state == 'playing') {

    // If no queue, add direction
    if (snake.directionQueue.length == 0) {
      snake.directionQueue.push(snake.direction);
    }

    // Move Snake Based on Queue
    switch(snake.directionQueue[0]) {
      case 'up':
        snake.head[1] -= 1;
        break;
      case 'down':
        snake.head[1] += 1;
        break;
      case 'left':
        snake.head[0] -= 1;
        break;
      case 'right':
        snake.head[0] += 1;
        break;
    }

    snake.direction = snake.directionQueue[0];
    snake.directionQueue.shift();

    // Keep Snake in Bounds
    if (snake.head[0] >= canvas.width) {
      snake.head[0] = 0;
    } else if (snake.head[0] < 0) {
      snake.head[0] = canvas.width - 1;
    } else if (snake.head[1] >= canvas.height) {
      snake.head[1] = 0;
    } else if (snake.head[1] < 0) {
      snake.head[1] = canvas.height - 1;
    }

    // Check if Snake intersects apple
    if (snake.head[0] == apple.pos[0] && snake.head[1] == apple.pos[1]) {
      snake.length += 1;
      moveApple();
    }

    // Create Tail
    // Add Snake X/Y to start of x/y array
    snake.tail.unshift([snake.head[0], snake.head[1]]);

    // Set Array to only be the length of the Snake
    snake.tail.length = snake.length + 1;

    // Check for tail collision
    for (let i = 1; i < snake.length + 1; i++) {
      if (
        snake.head[0] == snake.tail[i][0]&& 
        snake.head[1] == snake.tail[i][1]
      ) {
        game.state = 'end';
      }
    }

  }

  drawCanvas();

};

function drawCell(x, y, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, 1, 1);
}

function drawNumber(num, x, w = 6) {
  let sourceW = 6;
  let sourceX = num * sourceW;
  console.log(num, x, w);
  
  if ((num == 1 || num == 2) && w <= 4) {
    sourceX = num == 1 ? 60 : 64;
    sourceW = 4;
  }
  ctx.drawImage(
    numbers,
    sourceX, 0, // Source X, Y
    sourceW, 14, // Source Width, Height
    x, 1, // Destination X, Y
    w, 14 // Destination Width, Height
  );
}

function drawCanvas() {

  // Clear Canvas
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (game.state === 'end' || game.state === 'pause') {
    if (snake.length < 10) {
      drawNumber(snake.length, 5);
    } else if (snake.length >= 100) {
      drawNumber(Math.floor(snake.length / 100), 0, 4);
      drawNumber(Math.floor((snake.length % 100) / 10), 5, 5);
      drawNumber(snake.length % 10, 11, 5);
    } else {
      drawNumber(Math.floor(snake.length / 10), 1);
      drawNumber(snake.length % 10, 9);
    }
    updateFavicon(true);
    return;
  } else if (game.state === 'win') {
    ctx.drawImage(
      win, 
      0, 0, 
      16, 16
    );
    updateFavicon();
    return;
  } else if (game.state === 'outOfFocus') {
    ctx.drawImage(
      favicon, 
      0, 0, 
      16, 16
    );
    updateFavicon();
    return;
  } else if (game.state === 'start') {
    ctx.drawImage(
      logo, 
      1, 1, 
      14, 5);
  }
  // Draw Apple
  drawCell(apple.pos[0], apple.pos[1], apple.fill);

  // Draw Snake
  for (let i = 0; i < snake.length + 1; i++) {
    drawCell(snake.tail[i][0], snake.tail[i][1], snake.fill);
  }

  updateFavicon();

}

function updateFavicon(onlyWB = false) {

  // Update Document Title with Score
  let title = 'Favicon Snake - ';

  if (game.state === 'end') {
    title += 'Game Over';
  } else if (game.state === 'win') {
    title += 'You Win!';
  } else if (game.state === 'pause') {
    title += 'Paused';
  } else if (snake.length > 0) {
    title += `Score: ${snake.length}`;
  } else {
    title = 'Favicon Snake';
  }

  document.title = title;

  // If onlyWB is true, convert canvas to black and white pixels (no gray)
  if (onlyWB) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;

      // const color = brightness > 96 ? 255 : brightness > 48 ? brightness : 0;
      const color = brightness > 96 ? 255 : 0;

      data[i] = color;
      data[i + 1] = color;
      data[i + 2] = color;
    }

    ctx.putImageData(imageData, 0, 0);

  }

  // Create DataURL
  dataURL = canvas.toDataURL("image/png");

  // Compare to Previous Frame DataURL, if same, don't update
  if (dataURL === previousFrame) return;
  previousFrame = dataURL;

  // Update Favicon link
  faviconLink.href = dataURL;

}

// Show Scaled Canvas if h1 is Clicked
document.querySelector('h1').addEventListener('click', () => {
  if (game.showOnBody) {
    document.body.removeChild(canvas);
    game.showOnBody = false;
  } else {
    document.body.appendChild(canvas);
    game.showOnBody = true;
  }
});

window.onload = init;
