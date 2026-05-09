function startGame() {
  const ui = game.ui;
  
  // Reset Game
  game.attributes.state = 'start';
  game.snake.direction = 'right';
  game.snake.directionQueue = [];
  game.attributes.score = 0;
  ui.hsTxt.textContent = 'High Score: ';
  ui.hsTxt.classList.remove('newHS');
  ui.highScore.classList.remove('newHS');

  // Set Snake Head and Apple to Random Positions, ensuring they don't start on the same spot
  game.snake.head = [
    randNum(0, game.attributes.size / 2), 
    randNum(game.attributes.size / 2, game.attributes.size - 2)
  ];
  game.snake.tail = [[]];
  game.apple.pos = [
    randNum(2, game.attributes.size - 2), 
    randNum(game.attributes.size / 2, game.attributes.size - 2)
  ];

  // If Apple Spawns on Snake, Move Apple
  if (game.snake.head[1] === game.apple.pos[1]) game.apple.pos[1] -= 1;

} // End of startGame

function eatApple() {
  const snake = game.snake; // Read Only

  // Increase Score
  game.attributes.score += 1;

  // Create Set of Occupied Cells
  const OccupiedCells = new Set(
    snake.tail.map(([x, y]) => `${x},${y}`)
  );

  // Add head to occupied cells
  const headKey = `${snake.head[0]},${snake.head[1]}`;
  OccupiedCells.add(headKey);

  // Build list of free cells
  let freeCells = [];
  for (let x = 0; x < game.attributes.size; x++) {
    for (let y = 0; y < game.attributes.size; y++) {
      const key = `${x},${y}`;
      if (!OccupiedCells.has(key)) {
        freeCells.push([x, y]);
      }
    }
  }

  // Check if Win (no free space left)
  if (freeCells.length <= 0) {
    game.attributes.state = 'win';
    updateHighScore();
    return;
  }

  // Pick a random free cell
  const newPos = Math.floor(Math.random() * freeCells.length);
  game.apple.pos = freeCells[newPos];

} // End of eatApple

function moveSnake() {
  const snake = game.snake;
  // If no queue, add direction
  if (snake.directionQueue.length === 0) {
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
  if (snake.head[0] >= game.attributes.size) {
    snake.head[0] = 0;
  } else if (snake.head[0] < 0) {
    snake.head[0] = game.attributes.size - 1;
  } else if (snake.head[1] >= game.attributes.size) {
    snake.head[1] = 0;
  } else if (snake.head[1] < 0) {
    snake.head[1] = game.attributes.size -1;
  }
}

function handleTailCollision() {
  const snake = game.snake;

  // Check for tail collision
  for (let i = 1; i < snake.tail.length; i++) {
    const tailSegment = snake.tail[i];
    if (!tailSegment) continue;

    if (
      snake.head[0] === tailSegment[0]&& 
      snake.head[1] === tailSegment[1]
    ) {
      game.attributes.state = 'end';
    }
  }

}

function handleAppleCollision() {
  const snake = game.snake;
  const apple = game.apple;

  if (
    snake.head[0] === apple.pos[0] &&
    snake.head[1] === apple.pos[1]
  ) {
    eatApple();
  }
}

function loadStaticFrame() {
  const state = game.attributes.state; // read only
  if (noFocus()) {
    game.attributes.state = 'outOfFocus';  
    drawCanvas();
    return true;
  } else if (state === 'outOfFocus') {
    // If coming back from outOfFocus, return to previous state
    game.attributes.state = game.attributes.preNoFocusState;
    return false;
  } else if (game.states.inactive.includes(state)) {
    drawCanvas();
    return true;
  } else {
    return false;
  }

}

function updateSnakeTail() {
  const snake = game.snake;
  
  // Add Snake X/Y to start of x/y array
  snake.tail.unshift([snake.head[0], snake.head[1]]);

  // Set Array to only be the length of the Snake
  snake.tail.length = game.attributes.score + 1;
}
