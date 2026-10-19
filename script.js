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

function setMode(newMode) {
  mode = newMode;
  const config = modes[mode];

  document.body.className = config.bodyClass;
  listenButton.classList.toggle('active', mode === 'listening');
  readButton.classList.toggle('active', mode === 'reading');
  replayButton.hidden = mode === 'reading';

  // Start fresh so a word from the other mode isn't left on screen
  currentWord = null;
  currentAudio = null;
  generateButton.textContent = config.generateText;
  characterButton.textContent = config.characterText;

  try {
    localStorage.setItem('mode', mode);
  } catch (error) {
    // Storage can be unavailable (e.g. private browsing); the mode just won't be remembered
  }
}

generateButton.addEventListener('click', () => {
  currentWord = nextWord();
  currentAudio = new Audio(`audio/${currentWord}.mp3`);

  if (mode === 'listening') {
    characterButton.textContent = modes.listening.characterText;
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

listenButton.addEventListener('click', () => setMode('listening'));
readButton.addEventListener('click', () => setMode('reading'));

let savedMode = null;
try {
  savedMode = localStorage.getItem('mode');
} catch (error) {
  // Fall back to listening mode
}
setMode(savedMode in modes ? savedMode : 'listening');
