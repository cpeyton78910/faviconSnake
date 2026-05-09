// Declare Global Variables
window.game = {
  attributes: null,
  snake: null,
  apple: null,
  ui: null,
  ctx: null,
  canvas: null,
  assets: {}
};

const init = async () => {
  // Create Canvas Element
  game.canvas = document.createElement('canvas');
  game.ctx = game.canvas.getContext('2d');
  game.ctx.imageSmoothingEnabled = false;
  
  // UI Elements
  game.ui = {
    title: document.querySelector('#title'),
    instructions: document.querySelector('#instructions'),
    score: document.querySelector('#score'),
    hsTxt: document.querySelector('#hsTxt'),
    highScore: document.querySelector('#highScore')
  };

  game.attributes = {
    fps: 8,
    size: 16,
    _state: 'start',
    prePauseState: 'start',
    preNoFocusState: 'start',
    get state() {
      return this._state;
    },
    set state(newState) {
      // Skip if already in new state
      if (this._state === newState) return;
      // Set Restore Values
      if (game.attributes.state !== 'outOfFocus') {
        game.attributes.preNoFocusState = game.attributes.state;
      }
      if (game.states.active.includes(game.attributes.state)) {
        game.attributes.prePauseState = game.attributes.state;
      }

      if (game.states.end.includes(newState))
        updateHighScore();

      if (game.states.inactive.includes(newState)) {
        game.attributes.static = true;
        game.attributes.updateStatic = true;
      }
      this._state = newState;
      updateTitle();
    },
    static: false,
    updateStatic: true,
    showOnBody: false,
    _score: 0,
    highScore: 0,
    get score() {
      return this._score;
    },
    set score(score) {
      this._score = score;
      game.ui.score.textContent = score;
    }
  };

  game.states = {
    active: ['start', 'playing'],
    inactive: ['pause', 'end', 'win', 'outOfFocus'],
    showScore: ['pause', 'end'],
    end: ['end', 'win']
  };

  updateHighScore();

  // Set Canvas Size
  game.canvas.width = game.attributes.size;
  game.canvas.height = game.attributes.size;

  game.assets = {
    favicon: null,
    logo: null,
    win: null,
    numbers: null
  };

  // Load Images
  [game.assets.favicon, game.assets.logo, game.assets.win, game.assets.numbers] = await Promise.all([
    loadImage('assets/favicon.svg'),
    loadImage('assets/logo.png'),
    loadImage('assets/win.png'),
    loadImage('assets/numbers.png')
  ]);

  game.faviconLink = document.querySelector('link[rel="shortcut icon"]');

  game.snake = {
    fill: '#17ee17',
    direction: 'right',
    directionQueue: [],
    length: 0,
    head: [0, 0],
    tail: []
  };

  game.apple = {
    fill: '#ee1717',
    pos: [0, 0]
  };

  canvasToggle();
  setupInputs();
  startGame();
  setInterval(gameLoop, 1000 / game.attributes.fps);

}; // End of init

function gameLoop() {
  if (loadStaticFrame()) return;

  moveSnake();
  handleAppleCollision();
  updateSnakeTail();
  handleTailCollision();

  drawCanvas();
}

window.onload = init;
