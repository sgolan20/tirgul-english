const categories = [
    {
        name: "חיות",
        words: [
            {english: "Dog", hebrew: "כלב"},
            {english: "Cat", hebrew: "חתול"},
            {english: "Fish", hebrew: "דג"},
            {english: "Bird", hebrew: "ציפור"},
            {english: "Elephant", hebrew: "פיל"}
        ]
    },
    // ניתן להוסיף קטגוריות נוספות כאן
];

let currentWord;
let score = 0;
let questionCounter = 0;
let currentCategoryIndex = 0;
let customWordsMode = false;

const startButton = document.getElementById('startButton');
const customWordsButton = document.getElementById('customWordsButton');
const customWordsForm = document.getElementById('customWordsForm');
const submitCustomWords = document.getElementById('submitCustomWords');
const addWordPairButton = document.getElementById('addWordPair');
const wordPairsContainer = document.getElementById('wordPairs');
const gameArea = document.getElementById('gameArea');
const categoryDisplay = document.getElementById('categoryDisplay');
const wordDisplay = document.getElementById('wordDisplay');
const optionsContainer = document.getElementById('options');
const scoreDisplay = document.getElementById('score');
const questionCounterDisplay = document.getElementById('questionCounter');
const loadFileInput = document.getElementById('loadFile');
const saveToFileButton = document.getElementById('saveToFile');

startButton.addEventListener('click', () => startGame(false));
customWordsButton.addEventListener('click', showCustomWordsForm);
submitCustomWords.addEventListener('click', submitCustomWordsAndStart);
addWordPairButton.addEventListener('click', addWordPairInputs);
loadFileInput.addEventListener('change', loadWordsFromFile);
saveToFileButton.addEventListener('click', saveWordsToFile);

function showCustomWordsForm() {
    console.log("מציג טופס מילים מותאמות אישית");
    document.getElementById('startMenu').style.display = 'none';
    customWordsForm.style.display = 'block';
    wordPairsContainer.style.display = 'block';
    console.log("מצב תצוגה של הטופס:", customWordsForm.style.display);
    console.log("מצב תצוגה של wordPairsContainer:", wordPairsContainer.style.display);
}

function addWordPairInputs() {
    const wordPairDiv = document.createElement('div');
    wordPairDiv.className = 'word-pair';
    wordPairDiv.innerHTML = `
        <input type="text" placeholder="מילה באנגלית" class="english-word">
        <input type="text" placeholder="תרגום לעברית" class="hebrew-word">
    `;
    wordPairsContainer.appendChild(wordPairDiv);
}

function submitCustomWordsAndStart() {
    const wordPairs = document.querySelectorAll('.word-pair');
    const customWords = Array.from(wordPairs).map(pair => {
        const englishWord = pair.querySelector('.english-word').value.trim();
        const hebrewWord = pair.querySelector('.hebrew-word').value.trim();
        return { english: englishWord, hebrew: hebrewWord };
    }).filter(pair => pair.english && pair.hebrew);

    if (customWords.length > 0) {
        categories[0] = { name: "מילים מותאמות אישית", words: customWords };
        customWordsMode = true;
        startGame(true);
    } else {
        alert('נא להזין לפחות זוג מילים אחד');
    }
}

function startGame(isCustom) {
    document.getElementById('startMenu').style.display = 'none';
    customWordsForm.style.display = 'none';
    gameArea.style.display = 'block';
    
    currentCategoryIndex = isCustom ? 0 : Math.floor(Math.random() * categories.length);
    score = 0;
    questionCounter = 0;
    
    updateScoreDisplay();
    updateQuestionCounterDisplay();
    nextWord();
}

function nextWord() {
    if (!customWordsMode && questionCounter % 10 === 0 && questionCounter > 0) {
        currentCategoryIndex = (currentCategoryIndex + 1) % categories.length;
    }

    const currentCategory = categories[currentCategoryIndex];
    categoryDisplay.textContent = `קטגוריה: ${currentCategory.name}`;

    if (currentCategory.words.length === 0) {
        console.error("No words in category");
        alert("אין מילים בקטגוריה הנוכחית. אנא נסה שוב.");
        return;
    }

    currentWord = currentCategory.words[Math.floor(Math.random() * currentCategory.words.length)];
    wordDisplay.textContent = currentWord.english;
    
    const options = [currentWord.hebrew];
    while (options.length < 4 && options.length < currentCategory.words.length) {
        const randomWord = currentCategory.words[Math.floor(Math.random() * currentCategory.words.length)];
        if (!options.includes(randomWord.hebrew) && randomWord.hebrew !== currentWord.hebrew) {
            options.push(randomWord.hebrew);
        }
    }
    
    optionsContainer.innerHTML = '';
    options.sort(() => Math.random() - 0.5).forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.classList.add('option');
        button.addEventListener('click', () => checkAnswer(button, option));
        optionsContainer.appendChild(button);
    });

    questionCounter++;
    updateQuestionCounterDisplay();
}

function playTone(frequency, duration) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.connect(audioContext.destination);
    oscillator.start();
    setTimeout(() => {
        oscillator.stop();
    }, duration);
}

function checkAnswer(button, selectedOption) {
    const isCorrect = selectedOption === currentWord.hebrew;
    
    if (isCorrect) {
        score++;
        updateScoreDisplay();
        button.classList.add('correct');
        playTone(800, 1000); // צליל גבוה למשך שנייה
    } else {
        button.classList.add('incorrect');
        const correctButton = Array.from(optionsContainer.children).find(b => b.textContent === currentWord.hebrew);
        if (correctButton) correctButton.classList.add('correct');
        playTone(300, 1000); // צליל נמוך למשך שנייה
    }

    optionsContainer.childNodes.forEach(btn => btn.disabled = true);

    setTimeout(() => {
        nextWord();
    }, 1500);
}

function updateScoreDisplay() {
    scoreDisplay.textContent = `ניקוד: ${score}`;
}

function updateQuestionCounterDisplay() {
    questionCounterDisplay.textContent = `שאלה: ${questionCounter % 10 === 0 ? 10 : questionCounter % 10}/10`;
}

function loadWordsFromFile(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                console.log("תוכן הקובץ שנטען:", e.target.result);
                const customWords = JSON.parse(e.target.result);
                console.log("מילים שנטענו (אחרי parsing):", customWords);

                if (!Array.isArray(customWords) || customWords.length === 0) {
                    throw new Error("הקובץ אינו מכיל מערך תקין של מילים");
                }

                customWords.forEach((word, index) => {
                    if (!word.english || !word.hebrew) {
                        throw new Error(`מילה לא תקינה בשורה ${index + 1}`);
                    }
                });

                categories[0] = { name: "מילים מותאמות אישית", words: customWords };
                customWordsMode = true;
                
                // קריאה לפונקציות בסדר הנכון
                showCustomWordsForm();
                populateCustomWordsForm(customWords);
                
                console.log(`${customWords.length} מילים נטענו בהצלחה`);
                
                // בדיקת נראות הטופס אחרי טעינה
                setTimeout(checkFormVisibility, 100);
            } catch (error) {
                console.error("שגיאה בטעינת הקובץ:", error);
                alert(`שגיאה בטעינת הקובץ: ${error.message}`);
            }
        };
        reader.onerror = function(e) {
            console.error("שגיאה בקריאת הקובץ:", e);
            alert("שגיאה בקריאת הקובץ. אנא נסה שוב.");
        };
        reader.readAsText(file);
    }
}

function saveWordsToFile() {
    const wordPairs = document.querySelectorAll('.word-pair');
    const customWords = Array.from(wordPairs).map(pair => {
        const englishWord = pair.querySelector('.english-word').value.trim();
        const hebrewWord = pair.querySelector('.hebrew-word').value.trim();
        return { english: englishWord, hebrew: hebrewWord };
    }).filter(pair => pair.english && pair.hebrew);

    if (customWords.length > 0) {
        const jsonStr = JSON.stringify(customWords, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'custom_words.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } else {
        alert('אין מילים לשמירה. אנא הזן לפחות זוג מילים אחד.');
    }
}

function populateCustomWordsForm(words) {
    console.log("מנסה למלא את הטופס עם המילים:", words);
    if (!wordPairsContainer) {
        console.error("wordPairsContainer לא נמצא!");
        return;
    }
    wordPairsContainer.innerHTML = ''; // ניקוי הטופס הקיים
    words.forEach((word, index) => {
        const wordPairDiv = document.createElement('div');
        wordPairDiv.className = 'word-pair';
        wordPairDiv.innerHTML = `
            <input type="text" value="${word.english}" class="english-word">
            <input type="text" value="${word.hebrew}" class="hebrew-word">
        `;
        wordPairsContainer.appendChild(wordPairDiv);
        console.log(`הוספה לטופס: מילה ${index + 1}`, word);
    });
    console.log("סיום מילוי הטופס. מספר זוגות מילים:", wordPairsContainer.children.length);
    
    // בדיקת נראות הטופס
    setTimeout(() => {
        console.log("בדיקת נראות הטופס לאחר מילוי:");
        console.log("customWordsForm style.display:", customWordsForm.style.display);
        console.log("wordPairsContainer style.display:", window.getComputedStyle(wordPairsContainer).display);
        console.log("wordPairsContainer innerHTML:", wordPairsContainer.innerHTML);
        console.log("מספר ילדים של wordPairsContainer:", wordPairsContainer.children.length);
        
        // בדיקת תוכן השדות
        const englishInputs = wordPairsContainer.querySelectorAll('.english-word');
        const hebrewInputs = wordPairsContainer.querySelectorAll('.hebrew-word');
        console.log("מספר שדות אנגלית:", englishInputs.length);
        console.log("מספר שדות עברית:", hebrewInputs.length);
        englishInputs.forEach((input, i) => console.log(`שדה אנגלית ${i + 1}:`, input.value));
        hebrewInputs.forEach((input, i) => console.log(`שדה עברית ${i + 1}:`, input.value));
    }, 0);
}

function checkFormVisibility() {
    console.log("בדיקת נראות הטופס:");
    console.log("customWordsForm קיים:", !!customWordsForm);
    console.log("customWordsForm style.display:", customWordsForm.style.display);
    console.log("wordPairsContainer קיים:", !!wordPairsContainer);
    console.log("wordPairsContainer style.display:", window.getComputedStyle(wordPairsContainer).display);
    console.log("מספר ילדים של wordPairsContainer:", wordPairsContainer.children.length);
    console.log("תוכן של wordPairsContainer:", wordPairsContainer.innerHTML);
}

// הוספת זוג מילים ראשון בטעינת הדף
addWordPairInputs();
