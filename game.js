
const target = "PRODUCTIVE";
let current = 0;
let level = 1;
let startTime = null;
let timerInterval;
let gameContainer = document.getElementById('game-container');
let groupContainer = document.getElementById('group-container');
let info = document.getElementById('info');
let allScores = [];

const levelFeedback = {
  2: "Nice work! We removed numbers and special characters to help declutter.",
  3: "Now we’ve grouped similar letters together — it’s looking neater!",
  4: "All letters are now the same style and size for easier reading.",
  5: "Everything's in clear alphabetical order. Nearly there!",
  6: "The word PRODUCTIVE is perfectly laid out — watch how fast this goes!"
};

function randomStyle(char) {
  const fonts = ['Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia'];
  const weights = ['normal', 'bold'];
  const styles = ['normal', 'italic'];
  const font = fonts[Math.floor(Math.random() * fonts.length)];
  const weight = weights[Math.floor(Math.random() * weights.length)];
  const style = styles[Math.floor(Math.random() * styles.length)];
  const size = 12 + Math.floor(Math.random() * 14);
  const transform = Math.random() > 0.5 ? 'uppercase' : 'lowercase';
  return `font-family:${font}; font-weight:${weight}; font-style:${style}; font-size:${size}px; text-transform:${transform};`;
}

function generateLettersForLevel(level) {
  let pool = [];
  gameContainer.innerHTML = '';
  groupContainer.innerHTML = '';
  document.getElementById('level-display').textContent = `Level: ${level}`;

  if (levelFeedback[level]) {
    info.textContent = levelFeedback[level];
  } else {
    info.textContent = "Click the letters of \"PRODUCTIVE\" in order!";
  }

  switch(level) {
    case 1:
      pool = [...generateRandomChars(70, true, true), ...target];
      renderFlat(shuffle(pool), true);
      break;
    case 2:
      pool = [...generateRandomChars(70, true, false), ...target];
      renderFlat(shuffle(pool), true);
      break;
    case 3:
    case 4:
    case 5:
      pool = [...generateRandomChars(70, true, false), ...target];
      const grouped = groupIntoBuckets(pool);
      renderGrouped(grouped, level === 3);
      break;
    case 6:
      renderFlat(target.split(""), false, true);
      break;
  }

  current = 0;
  resetTimer();
}

function groupIntoBuckets(arr) {
  const buckets = {};
  arr.forEach(char => {
    const key = char.toUpperCase();
    if (!buckets[key]) buckets[key] = [];
    buckets[key].push(char);
  });
  return Object.keys(buckets).sort().reduce((obj, key) => {
    obj[key] = buckets[key];
    return obj;
  }, {});
}

function renderFlat(pool, styled = false, final = false) {
  gameContainer.style.display = 'grid';
  groupContainer.style.display = 'none';
  gameContainer.innerHTML = '';
  pool.forEach(letter => {
    const div = document.createElement('div');
    div.className = 'letter';
    div.textContent = letter;
    if (styled) div.setAttribute('style', randomStyle(letter));
    div.addEventListener('click', () => handleClick(div));
    gameContainer.appendChild(div);
  });
}

function renderGrouped(buckets, allowStyle = false) {
  gameContainer.style.display = 'none';
  groupContainer.style.display = 'flex';
  groupContainer.innerHTML = '';

  Object.entries(buckets).forEach(([group, letters]) => {
    const box = document.createElement('div');
    box.className = 'group-box';
    letters.forEach(letter => {
      const div = document.createElement('div');
      div.className = 'letter';
      div.textContent = letter;
      if (allowStyle) div.setAttribute('style', randomStyle(letter));
      div.addEventListener('click', () => handleClick(div));
      box.appendChild(div);
    });
    groupContainer.appendChild(box);
  });
}

function generateRandomChars(count, lettersOnly, includeSpecials) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const specials = '!@#$%^&*1234567890';
  let set = letters;
  if (!lettersOnly && includeSpecials) set += specials;
  return Array.from({length: count}, () => {
    const c = set[Math.floor(Math.random() * set.length)];
    return Math.random() > 0.5 ? c.toLowerCase() : c;
  });
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function handleClick(div) {
  if (div.textContent.toUpperCase() === target[current]) {
    div.classList.add('clicked');
    current++;
    if (current === 1) startTimer();
    if (current === target.length) stopTimer();
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  document.getElementById('timer').textContent = 'Time: 0.00s';
  startTime = null;
}

function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(() => {
    let elapsed = (Date.now() - startTime) / 1000;
    document.getElementById('timer').textContent = `Time: ${elapsed.toFixed(2)}s`;
  }, 100);
}

function stopTimer() {
  clearInterval(timerInterval);
  const time = (Date.now() - startTime) / 1000;
  allScores.push({ level, time });
  confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  if (level < 6) {
    level++;
    setTimeout(() => generateLettersForLevel(level), 1200);
  } else {
    document.getElementById('score-entry').style.display = 'block';
  }
}

function saveScore() {
  const name = document.getElementById('player-name').value;
  if (!name) return;
  const scoreboard = JSON.parse(localStorage.getItem('5sScoreboard') || '[]');
  scoreboard.push({ name, scores: allScores });
  localStorage.setItem('5sScoreboard', JSON.stringify(scoreboard));
  updateScoreboard();
  document.getElementById('score-entry').style.display = 'none';
}

function updateScoreboard() {
  const scoreboard = JSON.parse(localStorage.getItem('5sScoreboard') || '[]');
  scoreboard.sort((a, b) => {
    const aTime = a.scores.reduce((sum, s) => sum + s.time, 0);
    const bTime = b.scores.reduce((sum, s) => sum + s.time, 0);
    return aTime - bTime;
  });
  const ol = document.getElementById('scores');
  ol.innerHTML = '';
  scoreboard.forEach(player => {
    const total = player.scores.reduce((sum, s) => sum + s.time, 0).toFixed(2);
    let li = document.createElement('li');
    li.textContent = `${player.name}: ${total}s (Levels: ${player.scores.map(s => s.time.toFixed(2)).join('s, ')}s)`;
    ol.appendChild(li);
  });
}

updateScoreboard();
generateLettersForLevel(level);
