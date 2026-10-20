// Text and styling for each practice mode
const modes = {
  listening: {
    bodyClass: 'hsk1-body',
    generateText: 'Random Audio',
    characterText: 'characters',
  },
  reading: {
    bodyClass: 'hsk1-read-body',
    generateText: 'Random Word',
    characterText: 'play audio',
  },
};

let mode = 'listening';
let remaining = [...HSK1_WORDS];
let currentWord = null;
let currentAudio = null;

const listenButton = document.querySelector('.listen-button');
const readButton = document.querySelector('.read-button');
const generateButton = document.querySelector('.generate-button');
const replayButton = document.querySelector('.replay-button');
const characterButton = document.querySelector('.character-button');

// Pick a random word, without repeats until every word has come up once
function nextWord() {
  if (remaining.length === 0) {
    remaining = [...HSK1_WORDS];
  }

  const index = Math.floor(Math.random() * remaining.length);
  return remaining.splice(index, 1)[0];
}

function playCurrentAudio() {
  if (!currentAudio) {
    console.warn('No word has been generated yet.');
    return;
  }

  currentAudio.currentTime = 0;
  currentAudio.play().catch((error) => {
    console.error('Audio failed to play:', error);
  });
}

// Matches the color transition in styles.css
const TEXT_FADE_MS = 200;
let textSwapTimer = null;

function showModeText() {
  clearTimeout(textSwapTimer);
  generateButton.textContent = modes[mode].generateText;
  characterButton.textContent = modes[mode].characterText;
  generateButton.classList.remove('text-hidden');
  characterButton.classList.remove('text-hidden');
}

function setMode(newMode, animate) {
  mode = newMode;

  document.body.className = modes[mode].bodyClass;
  listenButton.classList.toggle('active', mode === 'listening');
  readButton.classList.toggle('active', mode === 'reading');
  replayButton.classList.toggle('collapsed', mode === 'reading');
  replayButton.inert = mode === 'reading';

  // Start fresh so a word from the other mode isn't left on screen
  currentWord = null;
  currentAudio = null;

  // Fade the button text out, swap it, then fade it back in
  if (animate) {
    generateButton.classList.add('text-hidden');
    characterButton.classList.add('text-hidden');
    clearTimeout(textSwapTimer);
    textSwapTimer = setTimeout(showModeText, TEXT_FADE_MS);
  } else {
    showModeText();
  }

  try {
    localStorage.setItem('mode', mode);
  } catch (error) {
    // Storage can be unavailable (e.g. private browsing); the mode just won't be remembered
  }
}

generateButton.addEventListener('click', () => {
  // Also finishes any text fade still in progress from a mode switch
  showModeText();
  currentWord = nextWord();
  currentAudio = new Audio(`audio/${currentWord}.mp3`);

  if (mode === 'listening') {
    playCurrentAudio();
  } else {
    generateButton.textContent = currentWord;
  }
});

replayButton.addEventListener('click', playCurrentAudio);

characterButton.addEventListener('click', () => {
  if (mode === 'reading') {
    playCurrentAudio();
  } else if (currentWord) {
    characterButton.textContent = currentWord;
  } else {
    console.warn('No characters to display.');
  }
});

listenButton.addEventListener('click', () => setMode('listening', true));
readButton.addEventListener('click', () => setMode('reading', true));

let savedMode = null;
try {
  savedMode = localStorage.getItem('mode');
} catch (error) {
  // Fall back to listening mode
}
setMode(savedMode in modes ? savedMode : 'listening');

// Turn on the mode-switch animations only after the first frames, so opening the page doesn't animate
requestAnimationFrame(() => {
  requestAnimationFrame(() => document.documentElement.classList.add('animate'));
});
