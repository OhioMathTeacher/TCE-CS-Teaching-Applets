const tabButtons = document.querySelectorAll('.tab-button');
const tabPanels = document.querySelectorAll('.tab-panel');

const tabChatConfig = {
  'decision-studio': {
    greeting: "Hi! I'm here to answer your questions about any aspect of our agentically built teaching applets.",
  },
  'binary-lab': {
    greeting: "Hi! I'm here to answer your questions about any aspect of our agentically built teaching applets.",
  },
  'objects-explorer': {
    greeting: "Hi! I'm here to answer your questions about any aspect of our agentically built teaching applets.",
  },
};

let activeTabId = document.querySelector('.tab-button.is-active')?.dataset.tab || 'decision-studio';
let chatMessages = [{ role: 'ai', text: tabChatConfig[activeTabId].greeting }];

tabButtons.forEach((button) => {
  button.addEventListener('click', () => {
    tabButtons.forEach((item) => item.classList.remove('is-active'));
    tabPanels.forEach((panel) => panel.classList.remove('is-active'));
    button.classList.add('is-active');
    document.getElementById(button.dataset.tab).classList.add('is-active');
    activeTabId = button.dataset.tab;
    renderChatHistory();
  });
});

const textInput = document.getElementById('text-input');
const binaryOutput = document.getElementById('binary-output');
const binaryHorizontalOutput = document.getElementById('binary-horizontal-output');
const codeDisplay = document.getElementById('code-display');
const showDecimal = document.getElementById('show-decimal');
const codeTabs = document.querySelectorAll('[data-code-view]');
const pixelGrid = document.getElementById('pixel-grid');
const clearGridButton = document.getElementById('clear-grid');
const loadPatternButton = document.getElementById('load-pattern');
const invertGridButton = document.getElementById('invert-grid');

const gridSize = 8;
const samplePattern = [
  [0, 1, 1, 0, 0, 1, 1, 0],
  [1, 0, 0, 1, 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 1, 0, 0, 1],
  [0, 1, 1, 0, 0, 1, 1, 0],
];

let selectedCodeView = 'pseudocode';
let pixelState = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));

function toBinary(value) {
  return value.toString(2).padStart(8, '0');
}

function renderBinaryRows() {
  const content = textInput.value || ' ';
  
  // Update horizontal binary representation
  const binaryString = [...content].map(char => toBinary(char.charCodeAt(0))).join(' ');
  binaryHorizontalOutput.value = binaryString;
  
  // Clear and rebuild character breakdown
  binaryOutput.innerHTML = '';

  [...content].forEach((character) => {
    const decimal = character.charCodeAt(0);
    const bits = toBinary(decimal);
    const row = document.createElement('div');
    row.className = 'binary-row';
    row.innerHTML = `
      <strong>${character === ' ' ? '[space]' : character}</strong>
      <span class="binary-bits">${bits} (binary)</span>
      ${showDecimal.checked ? `<span>= ${decimal} (decimal)</span>` : ''}
    `;
    binaryOutput.appendChild(row);
  });

  renderBinaryCode(content);
}

function buildPseudocode(content) {
  const safeText = content.replace(/\n/g, ' ');
  return `SET message TO "${safeText}"
FOR EACH symbol IN message
    LOOK UP the numeric value for symbol
    CONVERT the value to 8-bit binary
    DISPLAY symbol and its bits
END FOR

FOR EACH row IN pixelGrid
    READ 8 on/off values
    JOIN them into one binary string
    DISPLAY the binary row and its hex value
END FOR`;
}

function buildJava(content) {
  const safeText = content.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ');
  return `String message = "${safeText}";

for (int i = 0; i < message.length(); i++) {
    char symbol = message.charAt(i);
    String bits = String.format("%8s",
            Integer.toBinaryString(symbol)).replace(' ', '0');

    System.out.println(symbol + " -> " + bits);
}

for (int row = 0; row < pixelGrid.length; row++) {
    String binaryRow = "";

    for (int col = 0; col < pixelGrid[row].length; col++) {
        binaryRow += pixelGrid[row][col];
    }

    int hexValue = Integer.parseInt(binaryRow, 2);
    System.out.println(binaryRow + " -> 0x" + Integer.toHexString(hexValue).toUpperCase());
}`;
}

function renderBinaryCode(content) {
  codeDisplay.textContent = selectedCodeView === 'pseudocode'
    ? buildPseudocode(content)
    : buildJava(content);
}

codeTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    codeTabs.forEach((item) => item.classList.remove('is-active'));
    tab.classList.add('is-active');
    selectedCodeView = tab.dataset.codeView;
    renderBinaryCode(textInput.value || ' ');
  });
});

function renderGrid() {
  pixelGrid.innerHTML = '';
  
  // Add headers on first render
  const headerRow = document.createElement('div');
  headerRow.className = 'pixel-row pixel-row-header';
  headerRow.innerHTML = `
    <div class="pixel-row-cells"></div>
    <div class="pixel-row-output pixel-output-header">
      <span title="Binary number converted to base-10">Decimal</span>
      <span title="Binary number converted to hexadecimal (base-16)">Hex</span>
    </div>
  `;
  pixelGrid.appendChild(headerRow);
  
  pixelState.forEach((row, rowIndex) => {
    // Create row container
    const pixelRow = document.createElement('div');
    pixelRow.className = 'pixel-row';
    
    // Create cells container
    const cellsContainer = document.createElement('div');
    cellsContainer.className = 'pixel-row-cells';
    
    // Create cells for this row
    row.forEach((value, colIndex) => {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = `pixel-cell${value ? ' is-on' : ''}`;
      cell.setAttribute('aria-label', `Pixel row ${rowIndex + 1}, column ${colIndex + 1}`);
      cell.addEventListener('click', () => {
        pixelState[rowIndex][colIndex] = pixelState[rowIndex][colIndex] ? 0 : 1;
        renderGrid();
      });
      cellsContainer.appendChild(cell);
    });
    
    // Create output for this row
    const bits = row.join('');
    const decimal = parseInt(bits, 2);
    const hex = decimal.toString(16).toUpperCase().padStart(2, '0');
    const rowOutput = document.createElement('div');
    rowOutput.className = 'pixel-row-output';
    rowOutput.innerHTML = `
      <span class="pixel-decimal">${decimal}</span>
      <span class="pixel-hex">0x${hex}</span>
    `;
    
    // Add cells and output to row container
    pixelRow.appendChild(cellsContainer);
    pixelRow.appendChild(rowOutput);
    pixelGrid.appendChild(pixelRow);
  });
  
  renderBinaryCode(textInput.value || ' ');
}

function renderPixelOutput() {
  // This function is now integrated into renderGrid()
  // Keeping it here for compatibility with existing calls
  renderBinaryCode(textInput.value || ' ');
}

clearGridButton.addEventListener('click', () => {
  pixelState = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
  renderGrid();
});

loadPatternButton.addEventListener('click', () => {
  pixelState = samplePattern.map((row) => [...row]);
  renderGrid();
});

invertGridButton.addEventListener('click', () => {
  pixelState = pixelState.map((row) => row.map((value) => (value ? 0 : 1)));
  renderGrid();
});

textInput.addEventListener('input', renderBinaryRows);
showDecimal.addEventListener('change', renderBinaryRows);

const scenarios = {
  sandwich: {
    description: 'A familiar sequencing task that helps you see why precision matters before decision structures arrive.',
    cards: [
      { id: 'gather', text: 'Gather bread, peanut butter, jelly, and a knife.' },
      { id: 'bread-open', text: 'Open the bread bag and place two slices on a plate.' },
      { id: 'spread-pb', text: 'Spread peanut butter on one slice.' },
      { id: 'spread-jelly', text: 'Spread jelly on the other slice.' },
      { id: 'combine', text: 'Put the slices together with the spread sides facing inward.' },
      { id: 'serve', text: 'Cut or serve the sandwich.' },
    ],
    pseudocode: `GET the ingredients
PLACE two slices of bread on a plate
SPREAD peanut butter on slice one
SPREAD jelly on slice two
COMBINE the slices
SERVE the sandwich`,
    java: `List<String> steps = List.of(
    "Gather ingredients",
    "Place two bread slices on a plate",
    "Spread peanut butter on slice one",
    "Spread jelly on slice two",
    "Combine the slices",
    "Serve the sandwich"
);`,
  },
  projector: {
    description: 'A gentle bridge into decisions: if there is no power or no cable, the procedure has to branch.',
    cards: [
      { id: 'power', text: 'Check that the projector has power.' },
      { id: 'connect', text: 'Connect the laptop to the projector cable or adapter.' },
      { id: 'input', text: 'Select the correct input source on the projector.' },
      { id: 'display', text: 'Set the laptop display to mirror or extend as needed.' },
      { id: 'test', text: 'Test the image and adjust focus or volume if needed.' },
      { id: 'blank-one', text: '', editable: true, placeholder: 'Type an extra step students should add...' },
    ],
    pseudocode: `IF projector has no power
    STOP and fix the power issue
END IF

CONNECT the laptop
SELECT the correct input
SET the display mode
TEST the image`,
    java: `boolean hasPower = true;

if (!hasPower) {
    System.out.println("Fix the power issue first.");
    return;
}

connectLaptop();
selectInput();
setDisplayMode();
testImage();`,
  },
  'rainy-day': {
    description: 'This pushes further into decision structures: you need to decide what happens if students are wet, late, or missing materials.',
    cards: [
      { id: 'greet', text: 'Greet students at the door and direct them to the arrival task.' },
      { id: 'wet-items', text: 'If students have wet coats or umbrellas, send them to the drying area.' },
      { id: 'blank-one', text: '', editable: true, placeholder: 'Type a missing step...' },
      { id: 'materials', text: 'If a student is missing materials, hand them a backup set.' },
      { id: 'blank-two', text: '', editable: true, placeholder: 'Type another missing step...' },
      { id: 'begin', text: 'Begin the mini-lesson once students are settled.' },
    ],
    pseudocode: `GREET students
IF coats or umbrellas are wet
    SEND them to the drying area
END IF

IF a student is missing materials
    GIVE the student a backup set
END IF

START the lesson`,
    java: `greetStudents();

if (hasWetItems) {
    sendToDryingArea();
}

if (missingMaterials) {
    giveBackupMaterials();
}

startLesson();`,
  },
};

const scenarioSelect = document.getElementById('scenario-select');
const scenarioDescription = document.getElementById('scenario-description');
const algorithmList = document.getElementById('algorithm-list');
const algorithmFeedback = document.getElementById('algorithm-feedback');
const algorithmPlaceholderCard = document.getElementById('algorithm-placeholder-card');
const algorithmCodeCard = document.getElementById('algorithm-code-card');
const algorithmCodeDisplay = document.getElementById('algorithm-code-display');
const algoCodeTabs = document.querySelectorAll('[data-algo-code-view]');
const algorithmJavaTab = document.getElementById('algorithm-java-tab');
const shuffleCardsButton = document.getElementById('shuffle-cards');
const checkOrderButton = document.getElementById('check-order');
const resetScenarioButton = document.getElementById('reset-scenario');
const questionInput = document.getElementById('question-input');
const sendQuestionButton = document.getElementById('send-question');
const clearChatButton = document.getElementById('clear-chat');
const downloadChatButton = document.getElementById('download-chat');
const chatHistory = document.getElementById('chat-history');
const chatStatus = document.getElementById('chat-status');
const openApiKeyButton = document.getElementById('open-api-key');
const apiKeyModal = document.getElementById('api-key-modal');
const apiKeyInput = document.getElementById('api-key-input');
const apiKeyMessage = document.getElementById('api-key-message');
const saveApiKeyButton = document.getElementById('save-api-key');
const closeApiKeyButton = document.getElementById('close-api-key');

const OPENROUTER_MODEL = 'openai/gpt-4.1-mini';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY_STORAGE_KEY = 'toddgpt-openrouter-key';

let selectedAlgoCodeView = 'pseudocode';
let currentScenarioKey = scenarioSelect.value;
let currentCards = [];
let javaViewUnlocked = false;
let algorithmCheckStatus = 'unchecked';
let apiKeyConfigured = false;

const tabSystemPrompts = {
  'decision-studio': 'You are ToddGPT, a concise and encouraging teaching assistant for a computer science bridge course. You are helping with Decision Studio. Focus on sequencing, missing steps, decision points, pseudocode, and readable Java. Keep answers short, concrete, and student-facing.',
  'binary-lab': 'You are ToddGPT, a concise and encouraging teaching assistant for a computer science bridge course. You are helping with Binary Media Lab. Focus on binary representation, text encoding, images, hex, patterns, and readable Java. Keep answers short, concrete, and student-facing.',
  'objects-explorer': 'You are ToddGPT, a concise and encouraging teaching assistant for a computer science bridge course. You are helping with Objects Explorer. Focus on class vs instance, attributes, methods, state changes, and readable Java classes. Keep answers short, concrete, and student-facing.',
};

function setAlgorithmCodeView(view) {
  selectedAlgoCodeView = view;
  algoCodeTabs.forEach((item) => {
    item.classList.toggle('is-active', item.dataset.algoCodeView === view);
  });
  renderAlgorithmCode();
}

function lockAlgorithmJavaView() {
  javaViewUnlocked = false;
  algorithmCheckStatus = 'unchecked';
  algorithmJavaTab.classList.add('is-locked');
  algorithmPlaceholderCard.classList.remove('is-hidden');
  algorithmCodeCard.classList.add('is-hidden');
  if (selectedAlgoCodeView === 'java') {
    setAlgorithmCodeView('pseudocode');
  } else {
    renderAlgorithmCode();
  }
}

function unlockAlgorithmJavaView() {
  javaViewUnlocked = true;
  algorithmJavaTab.classList.remove('is-locked');
  algorithmPlaceholderCard.classList.add('is-hidden');
  algorithmCodeCard.classList.remove('is-hidden');
  if (selectedAlgoCodeView !== 'pseudocode') {
    selectedAlgoCodeView = 'pseudocode';
    algoCodeTabs.forEach((item) => {
      item.classList.toggle('is-active', item.dataset.algoCodeView === 'pseudocode');
    });
  }
  renderAlgorithmCode();
}

function shuffleArray(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function renderAlgorithmCode() {
  if (algorithmCheckStatus === 'unchecked') {
    if (selectedAlgoCodeView === 'pseudocode') {
      algorithmCodeDisplay.textContent = `PROCEDURE runStudentAlgorithm
    STEP 1: ...
    STEP 2: ...
    STEP 3: ...
    STEP 4: ...
END PROCEDURE

Click Check Order to translate the current popsicle-stick draft into visible pseudocode.`;
      return;
    }

    algorithmCodeDisplay.textContent = 'Java view unlocks after students click Check Order.\n\nThat keeps the sequence work and decision-making upfront, then uses Java as a follow-up scaffold.';
    return;
  }

  if (selectedAlgoCodeView === 'java' && javaViewUnlocked) {
    let statusMessage = '// Checked draft: use this Java view as a scaffold for discussion.\n';

    if (algorithmCheckStatus === 'correct') {
      statusMessage = '// Checked draft: the current sequence is in order, so this Java view shows a strong translation of the algorithm.\n';
    } else if (algorithmCheckStatus === 'missing-steps') {
      statusMessage = '// Checked draft: the sequence still has blank or underspecified steps, so this Java view is a revision scaffold, not a final answer.\n';
    } else if (algorithmCheckStatus === 'needs-revision') {
      statusMessage = '// Checked draft: the order still needs revision, so this Java view shows the current thinking before improvement.\n';
    }

    algorithmCodeDisplay.textContent = `${statusMessage}\n${buildAlgorithmJavaFromCards()}`;
    return;
  }

  algorithmCodeDisplay.textContent = selectedAlgoCodeView === 'pseudocode'
    ? buildAlgorithmPseudocodeFromCards()
    : buildAlgorithmJavaFromCards();
}

function cleanCardText(text, fallbackIndex) {
  const trimmed = (text || '').trim();
  return trimmed.length > 0 ? trimmed : `[Add step ${fallbackIndex}]`;
}

function toMethodName(text, index) {
  const cleaned = cleanCardText(text, index)
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4);

  if (cleaned.length === 0) {
    return `step${index}`;
  }

  return cleaned
    .map((word, wordIndex) => (wordIndex === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join('');
}

function buildAlgorithmPseudocodeFromCards() {
  const lines = ['PROCEDURE runStudentAlgorithm'];

  currentCards.forEach((card, index) => {
    const stepText = cleanCardText(card.text, index + 1);
    lines.push(`    STEP ${index + 1}: ${stepText}`);
  });

  lines.push('END PROCEDURE');
  return lines.join('\n');
}

function buildAlgorithmJavaFromCards() {
  const lines = ['void runStudentAlgorithm() {'];

  currentCards.forEach((card, index) => {
    const stepText = cleanCardText(card.text, index + 1);
    const lower = stepText.toLowerCase();

    if (lower.startsWith('if ')) {
      lines.push(`    // Step ${index + 1}: ${stepText}`);
      lines.push(`    if (checkCondition("${stepText.replace(/"/g, '\\"')}")) {`);
      lines.push('        // TODO: decide what should happen inside this branch');
      lines.push('    }');
    } else {
      lines.push(`    // Step ${index + 1}: ${stepText}`);
      lines.push(`    ${toMethodName(stepText, index + 1)}();`);
    }
  });

  lines.push('}');
  return lines.join('\n');
}

function renderAlgorithmCards() {
  algorithmList.innerHTML = '';

  currentCards.forEach((card, index) => {
    const item = document.createElement('div');
    item.className = `algorithm-card${card.editable ? ' editable-stick' : ''}`;
    item.dataset.cardId = card.id;
    item.innerHTML = `
      <div class="stick-handle">${index + 1}</div>
      <div class="stick-body"></div>
      <div class="stick-controls">
        <button class="move-button" type="button" data-direction="up" aria-label="Move step ${index + 1} up">▲</button>
        <button class="move-button" type="button" data-direction="down" aria-label="Move step ${index + 1} down">▼</button>
      </div>
    `;

    const body = item.querySelector('.stick-body');
    const upButton = item.querySelector('[data-direction="up"]');
    const downButton = item.querySelector('[data-direction="down"]');

    upButton.disabled = index === 0;
    downButton.disabled = index === currentCards.length - 1;

    if (card.editable) {
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = card.placeholder || 'Type a missing step';
      input.value = card.text;
      input.addEventListener('input', (event) => {
        card.text = event.target.value;
        lockAlgorithmJavaView();
        renderAlgorithmCode();
      });
      body.appendChild(input);
    } else {
      body.textContent = card.text;
    }

    upButton.addEventListener('click', () => {
      if (index === 0) {
        return;
      }

      [currentCards[index - 1], currentCards[index]] = [currentCards[index], currentCards[index - 1]];
      renderAlgorithmCards();
      lockAlgorithmJavaView();
      renderAlgorithmCode();
    });

    downButton.addEventListener('click', () => {
      if (index === currentCards.length - 1) {
        return;
      }

      [currentCards[index], currentCards[index + 1]] = [currentCards[index + 1], currentCards[index]];
      renderAlgorithmCards();
      lockAlgorithmJavaView();
      renderAlgorithmCode();
    });

    algorithmList.appendChild(item);
  });
}

function loadScenario(key, shouldShuffle = true) {
  currentScenarioKey = key;
  const scenario = scenarios[key];
  scenarioDescription.textContent = scenario.description;
  currentCards = shouldShuffle
    ? shuffleArray(scenario.cards.map((card) => ({ ...card })))
    : scenario.cards.map((card) => ({ ...card }));
  algorithmFeedback.innerHTML = '';
  lockAlgorithmJavaView();
  renderAlgorithmCards();
  renderAlgorithmCode();
}

function compareOrder() {
  const correct = scenarios[currentScenarioKey].cards;
  const nonEmptyEditable = currentCards
    .filter((card) => card.editable)
    .every((card) => card.text.trim().length > 0);
  const correctOrder = correct.every((card, index) => currentCards[index]?.id === card.id);

  algorithmFeedback.innerHTML = '';
  const message = document.createElement('div');
  message.className = `feedback-message ${correctOrder && nonEmptyEditable ? 'feedback-good' : 'feedback-warn'}`;

  if (correctOrder && nonEmptyEditable) {
    algorithmCheckStatus = 'correct';
    message.innerHTML = '<strong>Nice.</strong> The sequence is in order, and the custom steps are filled in.';
    unlockAlgorithmJavaView();
    renderAlgorithmCode();
  } else if (!nonEmptyEditable) {
    algorithmCheckStatus = 'missing-steps';
    message.innerHTML = '<strong>Almost there.</strong> One or more blank sticks still needs a student-written step. The translation panel stays hidden until the full algorithm is correct.';
    lockAlgorithmJavaView();
  } else {
    algorithmCheckStatus = 'needs-revision';
    message.innerHTML = '<strong>Not yet.</strong> The order still needs revision. Ask students which step truly has to happen first. The translation panel stays hidden until the algorithm is correct.';
    lockAlgorithmJavaView();
  }

  algorithmFeedback.appendChild(message);
}

scenarioSelect.addEventListener('change', () => loadScenario(scenarioSelect.value));
shuffleCardsButton.addEventListener('click', () => loadScenario(currentScenarioKey));
resetScenarioButton.addEventListener('click', () => loadScenario(currentScenarioKey, false));
checkOrderButton.addEventListener('click', compareOrder);

algoCodeTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    if (tab.dataset.algoCodeView === 'java' && !javaViewUnlocked) {
      renderAlgorithmCode();
      return;
    }

    setAlgorithmCodeView(tab.dataset.algoCodeView);
  });
});

function renderChatHistory() {
  chatHistory.innerHTML = '';

  chatMessages.forEach((message) => {
    const item = document.createElement('div');
    item.className = `chat-message ${message.role}`;
    item.textContent = message.text;
    chatHistory.appendChild(item);
  });

  chatHistory.scrollTop = chatHistory.scrollHeight;
}

function setChatPending(isPending) {
  questionInput.disabled = isPending || !apiKeyConfigured;
  sendQuestionButton.disabled = isPending || !apiKeyConfigured;
  sendQuestionButton.textContent = isPending ? '...' : 'Send';
}

function updateChatStatus(message) {
  chatStatus.textContent = message;
}

function toggleApiKeyModal(shouldShow) {
  apiKeyModal.classList.toggle('is-hidden', !shouldShow);
  if (shouldShow) {
    apiKeyInput.focus();
  }
}

async function loadApiKeyStatus() {
  apiKeyConfigured = Boolean(sessionStorage.getItem(API_KEY_STORAGE_KEY));

  if (apiKeyConfigured) {
    updateChatStatus('ToddGPT is connected.');
    openApiKeyButton.textContent = 'Change API Key';
  } else {
    updateChatStatus('Set an API key to enable ToddGPT.');
    openApiKeyButton.textContent = 'Set API Key';
  }

  setChatPending(false);
}

async function saveApiKey() {
  const apiKey = apiKeyInput.value.trim();
  if (!apiKey) {
    apiKeyMessage.textContent = 'Enter an API key first.';
    return;
  }

  saveApiKeyButton.disabled = true;
  apiKeyMessage.textContent = 'Saving key...';

  try {
    sessionStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
    apiKeyConfigured = true;
    apiKeyInput.value = '';
    apiKeyMessage.textContent = '';
    updateChatStatus('ToddGPT is connected.');
    openApiKeyButton.textContent = 'Change API Key';
    toggleApiKeyModal(false);
    setChatPending(false);
  } catch (error) {
    apiKeyMessage.textContent = error.message || 'Could not save the API key.';
  } finally {
    saveApiKeyButton.disabled = false;
  }
}

async function fetchToddGPTReply() {
  const apiKey = sessionStorage.getItem(API_KEY_STORAGE_KEY);
  if (!apiKey) {
    throw new Error('Set an API key to enable ToddGPT.');
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-Title': 'ToddGPT Teaching Applets',
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      temperature: 0.5,
      messages: [
        {
          role: 'system',
          content: tabSystemPrompts[activeTabId] || tabSystemPrompts['decision-studio'],
        },
        ...chatMessages.map((message) => ({
          role: message.role === 'ai' ? 'assistant' : 'user',
          content: message.text,
        })),
      ],
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error?.message || payload.error || 'ToddGPT could not respond right now.');
  }

  return payload.choices?.[0]?.message?.content?.trim() || 'ToddGPT could not respond right now.';
}

async function submitChatMessage() {
  if (!apiKeyConfigured) {
    updateChatStatus('Set an API key to enable ToddGPT.');
    toggleApiKeyModal(true);
    return;
  }

  const question = questionInput.value.trim();
  if (!question) {
    return;
  }

  chatMessages.push({ role: 'user', text: question });
  questionInput.value = '';
  renderChatHistory();

  try {
    setChatPending(true);
    const reply = await fetchToddGPTReply();
    chatMessages.push({ role: 'ai', text: reply });
  } catch (error) {
    chatMessages.push({
      role: 'ai',
      text: error.message || 'ToddGPT could not respond right now.',
    });
  } finally {
    setChatPending(false);
    questionInput.focus();
    renderChatHistory();
  }
}

sendQuestionButton.addEventListener('click', () => {
  submitChatMessage();
});

openApiKeyButton.addEventListener('click', () => {
  apiKeyMessage.textContent = '';
  toggleApiKeyModal(true);
});

saveApiKeyButton.addEventListener('click', () => {
  saveApiKey();
});

closeApiKeyButton.addEventListener('click', () => {
  toggleApiKeyModal(false);
});

apiKeyInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    saveApiKey();
  }
});

questionInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    submitChatMessage();
  }
});

if (clearChatButton) {
  clearChatButton.addEventListener('click', () => {
    chatMessages = [{ role: 'ai', text: tabChatConfig[activeTabId].greeting }];
    questionInput.value = '';
    renderChatHistory();
  });
}

downloadChatButton.addEventListener('click', () => {
  const text = chatMessages
    .map((message) => `${message.role === 'ai' ? 'ToddGPT' : 'You'}: ${message.text}`)
    .join('\n\n');
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'toddgpt-chat.txt';
  link.click();
  URL.revokeObjectURL(url);
});

const objectModels = {
  robot: {
    title: 'Classroom Robot',
    description: 'A friendly object for showing that a class defines what a robot knows and what it can do.',
    attributes: [
      { key: 'name', label: 'Robot name', value: 'Orbit' },
      { key: 'battery', label: 'Battery level', value: '80' },
      { key: 'mood', label: 'Mood', value: 'ready' },
    ],
    methods: [
      { key: 'greet', label: 'greet()', effect: (state) => ({ ...state, mood: 'friendly' }) },
      { key: 'move', label: 'moveForward()', effect: (state) => ({ ...state, battery: String(Math.max(0, Number(state.battery) - 10)) }) },
      { key: 'charge', label: 'charge()', effect: (state) => ({ ...state, battery: '100', mood: 'recharged' }) },
    ],
    pseudocode: `CLASS ClassroomRobot
    ATTRIBUTE name
    ATTRIBUTE battery
    ATTRIBUTE mood

    METHOD greet
        SET mood TO "friendly"

    METHOD moveForward
        DECREASE battery

    METHOD charge
        SET battery TO 100
        SET mood TO "recharged"
END CLASS`,
    java: `class ClassroomRobot {
    String name;
    int battery;
    String mood;

    void greet() {
        mood = "friendly";
    }

    void moveForward() {
        battery = Math.max(0, battery - 10);
    }

    void charge() {
        battery = 100;
        mood = "recharged";
    }
}`,
  },
  book: {
    title: 'Library Book',
    description: 'A familiar school object that makes the difference between state and behavior easy to see.',
    attributes: [
      { key: 'title', label: 'Book title', value: 'Binary for Beginners' },
      { key: 'status', label: 'Status', value: 'on shelf' },
      { key: 'pagesRead', label: 'Pages read', value: '0' },
    ],
    methods: [
      { key: 'checkout', label: 'checkOut()', effect: (state) => ({ ...state, status: 'checked out' }) },
      { key: 'read', label: 'readPages()', effect: (state) => ({ ...state, pagesRead: String(Number(state.pagesRead) + 10) }) },
      { key: 'return', label: 'returnBook()', effect: (state) => ({ ...state, status: 'on shelf' }) },
    ],
    pseudocode: `CLASS LibraryBook
    ATTRIBUTE title
    ATTRIBUTE status
    ATTRIBUTE pagesRead

    METHOD checkOut
        SET status TO "checked out"

    METHOD readPages
        INCREASE pagesRead

    METHOD returnBook
        SET status TO "on shelf"
END CLASS`,
    java: `class LibraryBook {
    String title;
    String status;
    int pagesRead;

    void checkOut() {
        status = "checked out";
    }

    void readPages() {
        pagesRead += 10;
    }

    void returnBook() {
        status = "on shelf";
    }
}`,
  },
  device: {
    title: 'Student Device',
    description: 'A useful bridge object because students can connect it to troubleshooting, networks, and classroom routines.',
    attributes: [
      { key: 'owner', label: 'Owner', value: 'Jamie' },
      { key: 'wifi', label: 'Wi-Fi status', value: 'connected' },
      { key: 'battery', label: 'Battery level', value: '65' },
    ],
    methods: [
      { key: 'disconnect', label: 'disconnectWifi()', effect: (state) => ({ ...state, wifi: 'disconnected' }) },
      { key: 'reconnect', label: 'reconnectWifi()', effect: (state) => ({ ...state, wifi: 'connected' }) },
      { key: 'useApp', label: 'useApp()', effect: (state) => ({ ...state, battery: String(Math.max(0, Number(state.battery) - 15)) }) },
    ],
    pseudocode: `CLASS StudentDevice
    ATTRIBUTE owner
    ATTRIBUTE wifi
    ATTRIBUTE battery

    METHOD disconnectWifi
        SET wifi TO "disconnected"

    METHOD reconnectWifi
        SET wifi TO "connected"

    METHOD useApp
        DECREASE battery
END CLASS`,
    java: `class StudentDevice {
    String owner;
    String wifi;
    int battery;

    void disconnectWifi() {
        wifi = "disconnected";
    }

    void reconnectWifi() {
        wifi = "connected";
    }

    void useApp() {
        battery = Math.max(0, battery - 15);
    }
}`,
  },
};

const objectSelect = document.getElementById('object-select');
const objectDescription = document.getElementById('object-description');
const objectBlueprint = document.getElementById('object-blueprint');
const objectForm = document.getElementById('object-form');
const objectActions = document.getElementById('object-actions');
const objectState = document.getElementById('object-state');
const objectCodeDisplay = document.getElementById('object-code-display');
const objectCodeTabs = document.querySelectorAll('[data-object-code-view]');

let currentObjectKey = objectSelect.value;
let currentObjectState = {};
let selectedObjectCodeView = 'pseudocode';

function renderObjectCode() {
  const objectModel = objectModels[currentObjectKey];
  objectCodeDisplay.textContent = selectedObjectCodeView === 'pseudocode'
    ? objectModel.pseudocode
    : objectModel.java;
}

function renderObjectState() {
  objectState.innerHTML = '';
  const block = document.createElement('div');
  block.className = 'state-block';
  block.innerHTML = `<h4>Current instance state</h4>`;
  const list = document.createElement('ul');
  list.className = 'method-list';

  Object.entries(currentObjectState).forEach(([key, value]) => {
    const item = document.createElement('li');
    item.textContent = `${key}: ${value}`;
    list.appendChild(item);
  });

  block.appendChild(list);
  objectState.appendChild(block);
}

function renderObjectModel() {
  const objectModel = objectModels[currentObjectKey];
  objectDescription.textContent = objectModel.description;

  objectBlueprint.innerHTML = '';
  const attrBlock = document.createElement('div');
  attrBlock.className = 'blueprint-block';
  attrBlock.innerHTML = '<h4>Attributes</h4>';
  const attrList = document.createElement('ul');
  attrList.className = 'method-list';
  objectModel.attributes.forEach((attribute) => {
    const item = document.createElement('li');
    item.textContent = `${attribute.label}`;
    attrList.appendChild(item);
  });
  attrBlock.appendChild(attrList);

  const methodBlock = document.createElement('div');
  methodBlock.className = 'blueprint-block';
  methodBlock.innerHTML = '<h4>Methods</h4>';
  const methodList = document.createElement('ul');
  methodList.className = 'method-list';
  objectModel.methods.forEach((method) => {
    const item = document.createElement('li');
    item.textContent = method.label;
    methodList.appendChild(item);
  });
  methodBlock.appendChild(methodList);

  objectBlueprint.appendChild(attrBlock);
  objectBlueprint.appendChild(methodBlock);

  currentObjectState = {};
  objectForm.innerHTML = '';
  const formGrid = document.createElement('div');
  formGrid.className = 'attribute-grid';

  objectModel.attributes.forEach((attribute) => {
    currentObjectState[attribute.key] = attribute.value;
    const label = document.createElement('label');
    label.textContent = attribute.label;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = attribute.value;
    input.addEventListener('input', (event) => {
      currentObjectState[attribute.key] = event.target.value;
      renderObjectState();
    });
    label.appendChild(input);
    formGrid.appendChild(label);
  });

  objectForm.appendChild(formGrid);

  objectActions.innerHTML = '';
  objectModel.methods.forEach((method) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'soft-button';
    button.textContent = method.label;
    button.addEventListener('click', () => {
      currentObjectState = method.effect({ ...currentObjectState });
      renderObjectState();
    });
    objectActions.appendChild(button);
  });

  renderObjectState();
  renderObjectCode();
}

objectSelect.addEventListener('change', () => {
  currentObjectKey = objectSelect.value;
  renderObjectModel();
});

objectCodeTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    objectCodeTabs.forEach((item) => item.classList.remove('is-active'));
    tab.classList.add('is-active');
    selectedObjectCodeView = tab.dataset.objectCodeView;
    renderObjectCode();
  });
});

renderBinaryRows();
renderGrid();
loadScenario(currentScenarioKey);
renderChatHistory();
renderObjectModel();
loadApiKeyStatus();