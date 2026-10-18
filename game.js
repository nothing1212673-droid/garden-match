(() => {
  'use strict';

  const LEVELS = [
    { pairs: 4, title: 'The first sprouts', description: 'A gentle beginning. Find all 4 pairs.' },
    { pairs: 6, title: 'In full bloom', description: 'A little more to remember. Find all 6 pairs.' },
    { pairs: 8, title: 'The secret garden', description: 'Your final flourish. Find all 8 pairs.' }
  ];
  const ITEMS = [
    { id: 'tulip', name: 'Tulip', color: '#f8e6de' },
    { id: 'carrot', name: 'Carrot', color: '#fbefd6' },
    { id: 'watering', name: 'Watering can', color: '#e4eeea' },
    { id: 'sprout', name: 'Seedling', color: '#eef1dc' },
    { id: 'tomato', name: 'Tomato', color: '#f6e5d8' },
    { id: 'butterfly', name: 'Butterfly', color: '#eee5f0' },
    { id: 'lemon', name: 'Lemon', color: '#f9f1d3' },
    { id: 'bee', name: 'Bumblebee', color: '#f6edd8' }
  ];
  const STORAGE_KEY = 'garden-match.best.v1';
  const $ = id => document.getElementById(id);
  const board = $('board');
  const rulesDialog = $('rules-dialog');
  const levelDialog = $('level-dialog');
  let level = 0;
  let moves = 0;
  let matched = 0;
  let selected = [];
  let locked = false;
  let active = false;
  let cards = [];
  let timeout = null;
  let ticker = null;
  let startedAt = null;
  let elapsed = 0;
  let totalMoves = 0;
  let totalMs = 0;
  let best = readBest();
  let storageAvailable = true;

  function readBest() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (value && Number.isSafeInteger(value.moves) && value.moves >= 18 &&
          Number.isSafeInteger(value.seconds) && value.seconds >= 0) return value;
    } catch { /* An unavailable or malformed store must never prevent play. */ }
    return null;
  }

  function formatTime(seconds) {
    return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  }

  function currentMs() {
    return startedAt === null ? elapsed : elapsed + performance.now() - startedAt;
  }

  function stopTimer() {
    elapsed = currentMs();
    startedAt = null;
    clearInterval(ticker);
    ticker = null;
    $('timer').textContent = formatTime(Math.floor(elapsed / 1000));
  }

  function startTimer() {
    if (startedAt !== null) return;
    startedAt = performance.now();
    ticker = setInterval(() => {
      $('timer').textContent = formatTime(Math.floor(currentMs() / 1000));
    }, 200);
  }

  // Fisher–Yates: each new level and restart gets an independent deck.
  function shuffle(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  function announce(message) {
    $('announcer').textContent = message;
  }

  function updateBest() {
    $('best-score').textContent = best ? `${best.moves} moves · ${formatTime(best.seconds)}` : 'A fresh start';
    $('best-detail').textContent = best ? 'Across all 3 levels. Can you grow a new best?' : 'Complete all 3 levels to set a best.';
  }

  function showScreen(id) {
    ['welcome', 'play-screen', 'victory-screen'].forEach(screen => {
      $(screen).hidden = screen !== id;
    });
  }

  function newGame() {
    if (levelDialog.open) levelDialog.close();
    if (rulesDialog.open) rulesDialog.close();
    clearTimeout(timeout);
    stopTimer();
    totalMoves = 0;
    totalMs = 0;
    level = 0;
    showScreen('play-screen');
    startLevel();
  }

  function startLevel() {
    clearTimeout(timeout);
    stopTimer();
    elapsed = 0;
    moves = 0;
    matched = 0;
    selected = [];
    locked = false;
    active = true;
    const config = LEVELS[level];
    cards = shuffle(ITEMS.slice(0, config.pairs).flatMap(item => [
      { ...item, matched: false, open: false }, { ...item, matched: false, open: false }
    ]));
    $('level-title').textContent = config.title;
    $('level-description').textContent = config.description;
    $('moves').textContent = '0';
    $('timer').textContent = '00:00';
    $('pairs-found').textContent = '0';
    $('pair-total').textContent = config.pairs;
    $('board-note').textContent = '✧ Pick a card. See what grows.';
    LEVELS.forEach((_, i) => {
      const step = $(`step-${i}`);
      step.classList.toggle('current', i === level);
      step.classList.toggle('done', i < level);
      step.querySelector('.step-number').textContent = i < level ? '✓' : i + 1;
      if (i === level) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });
    board.setAttribute('aria-label', `Level ${level + 1}: ${config.pairs} pairs of memory cards`);
    board.replaceChildren(...cards.map((card, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'card';
      button.dataset.index = index;
      button.style.setProperty('--card-color', card.color);
      button.setAttribute('aria-label', `Card ${index + 1}, face down`);
      button.setAttribute('aria-pressed', 'false');
      button.innerHTML = `<span class="card-inner" aria-hidden="true"><span class="card-face card-back"><svg><use href="#sprout"/></svg></span><span class="card-face card-front"><span class="match-check">✓</span><svg><use href="#${card.id}"/></svg><span class="card-name">${card.name}</span></span></span>`;
      return button;
    }));
    updateBest();
    $('level-title').focus();
    announce(`Level ${level + 1}. ${config.pairs} pairs. Turn two cards to find a match.`);
  }

  function syncCard(index) {
    const card = cards[index];
    const button = board.children[index];
    button.classList.toggle('is-open', card.open);
    button.classList.toggle('is-matched', card.matched);
    button.setAttribute('aria-pressed', String(card.open || card.matched));
    button.setAttribute('aria-disabled', String(card.open || card.matched));
    button.setAttribute('aria-label', `Card ${index + 1}, ${card.matched ? `${card.name}, matched` : card.open ? card.name : 'face down'}`);
  }

  function flip(index) {
    const card = cards[index];
    // This guard also blocks fast clicks, key repeats, and input during animations.
    if (!active || locked || !card || card.open || card.matched) return;
    startTimer();
    card.open = true;
    selected.push(index);
    syncCard(index);
    if (selected.length === 1) {
      announce(`${card.name}. Choose one more card.`);
      return;
    }
    locked = true;
    moves++;
    $('moves').textContent = moves;
    const [a, b] = selected;
    if (cards[a].id === cards[b].id) {
      cards[a].matched = cards[b].matched = true;
      syncCard(a);
      syncCard(b);
      matched++;
      $('pairs-found').textContent = matched;
      $('board-note').textContent = '✦ A lovely pair. Keep growing!';
      announce(`${card.name} pair found. ${matched} of ${LEVELS[level].pairs} pairs.`);
      selected = [];
      if (matched === LEVELS[level].pairs) {
        active = false;
        stopTimer();
        totalMoves += moves;
        totalMs += elapsed;
        timeout = setTimeout(finishLevel, 500);
      } else locked = false;
    } else {
      $('board-note').textContent = '✧ Not quite a pair. A little peek to remember.';
      announce(`${cards[a].name} and ${cards[b].name}. No match. Cards will turn back over.`);
      timeout = setTimeout(() => {
        cards[a].open = cards[b].open = false;
        syncCard(a);
        syncCard(b);
        selected = [];
        // Keep input locked for the entire return animation as well as the peek.
        timeout = setTimeout(() => {
          locked = false;
          $('board-note').textContent = '✧ Ready for another little discovery?';
          announce('Cards face down. Choose another pair.');
        }, 330);
      }, 850);
    }
  }

  function finishLevel() {
    if (rulesDialog.open) rulesDialog.close();
    if (level < LEVELS.length - 1) {
      $('level-result').textContent = `Level ${level + 1} complete · ${moves} moves · ${formatTime(Math.floor(elapsed / 1000))}`;
      $('next-description').textContent = `Next: ${LEVELS[level + 1].title.toLowerCase()} — ${LEVELS[level + 1].pairs} pairs to discover.`;
      levelDialog.showModal();
      $('next-button').focus();
    } else finishGame();
  }

  function finishGame() {
    const score = { moves: totalMoves, seconds: Math.floor(totalMs / 1000) };
    // Re-read before saving in case another open tab has set a better record.
    const saved = readBest();
    if (saved) best = saved;
    const isBest = !best || score.moves < best.moves || (score.moves === best.moves && score.seconds < best.seconds);
    if (isBest) {
      best = score;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(best));
        storageAvailable = true;
      } catch { storageAvailable = false; }
    }
    $('final-moves').textContent = score.moves;
    $('final-time').textContent = formatTime(score.seconds);
    $('record-note').textContent = isBest ? (storageAvailable ? '✦ A new personal best. Beautifully grown!' : '✦ A new best for this visit. Browser storage is unavailable.') : 'A lovely garden, all your own.';
    $('victory-best').textContent = `Your best: ${best.moves} moves · ${formatTime(best.seconds)}${storageAvailable ? ' · saved in this browser' : ' · this visit only'}`;
    showScreen('victory-screen');
    $('victory-title').focus();
    announce(`All three levels complete. ${score.moves} total moves in ${formatTime(score.seconds)}. ${$('record-note').textContent}`);
    updateBest();
  }

  board.addEventListener('click', event => {
    const button = event.target.closest('.card');
    if (button) flip(Number(button.dataset.index));
  });

  board.addEventListener('keydown', event => {
    const button = event.target.closest('.card');
    if (!button) return;
    const index = Number(button.dataset.index);
    const columns = getComputedStyle(board).gridTemplateColumns.split(' ').length;
    const offsets = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -columns, ArrowDown: columns };
    let next;
    if (Object.hasOwn(offsets, event.key)) next = (index + offsets[event.key] + cards.length) % cards.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = cards.length - 1;
    else return;
    event.preventDefault();
    board.children[next].focus();
  });

  $('start-button').addEventListener('click', newGame);
  $('play-again-button').addEventListener('click', newGame);
  $('restart-button').addEventListener('click', newGame);
  $('next-button').addEventListener('click', () => {
    levelDialog.close();
    level++;
    startLevel();
  });
  // A completed level is a deliberate checkpoint; the next button continues it.
  levelDialog.addEventListener('cancel', event => event.preventDefault());
  $('rules-button').addEventListener('click', () => rulesDialog.showModal());
  $('close-rules').addEventListener('click', () => rulesDialog.close());
  $('got-it-button').addEventListener('click', () => rulesDialog.close());
  window.addEventListener('pagehide', () => {
    clearInterval(ticker);
    clearTimeout(timeout);
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted) newGame();
  });
  window.addEventListener('storage', event => {
    if (event.key === STORAGE_KEY) { best = readBest(); updateBest(); }
  });
  updateBest();
})();
