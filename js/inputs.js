const setupInputs = () => {

  // Keyboard Control Listeners
  document.addEventListener('keydown', (e) => {

    // If game is active => Set Direction Based on Key Press
    if (game.states.active.includes(game.attributes.state)) {

      // Set Snake Direction Based on Key Press
      setSnakeDirection(e.key);

      // If game is on start screen, start game when direction key is pressed
      if (game.snake.directionQueue.length > 0 && (game.attributes.state === 'start')) {
        game.attributes.state = 'playing';
      }

    }

    // Pause Menu via Escape Key
    if (e.key === 'Escape') {
      if (game.attributes.state === 'pause') {
        game.attributes.state = game.attributes.prePauseState;
      } else if (game.states.active.includes(game.attributes.state)) {
        game.attributes.state = 'pause';
      } 
    }

    // Restart Game via Space Key
    if (e.code === 'Space' && (game.attributes.state === 'end' || game.attributes.state === 'win'))
      startGame();

  });

  const directions = {
    up: ['arrowup', 'w'],
    down: ['arrowdown', 's'],
    left: ['arrowleft', 'a'],
    right: ['arrowright', 'd']
  };
  const opposite = {
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left'
  };

  // Set Snake Direction Function
  function setSnakeDirection(key) {
    const lowerKey = key.toLowerCase();
    for (const direction in directions) {
      if (directions[direction].includes(lowerKey)) {
        const newDirection = direction;
        const lastDir = game.snake.directionQueue.at(-1) || game.snake.direction;
        // Prevent Opposite or Same Direction from being added to Queue
        if (lastDir !== opposite[newDirection] && lastDir !== newDirection) {
          game.snake.directionQueue.push(newDirection);
        }
      }
    }
  }

};
