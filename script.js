document.addEventListener("DOMContentLoaded", () => {

    // -------- PRELOAD BACKGROUNDS FOR GAME --------
    const bgFiles = [
        "bg1.jpg","bg2.jpg","bg3.jpg",
        "bg4.jpg","bg5.jpg","bg6.jpg"
    ];

    const backgrounds = [];

    bgFiles.forEach(file => {
        const img = new Image();
        img.src = `assets/backgrounds/${file}`;
        img.onload = () => backgrounds.push(img.src);
    });

    function setBG(src) {
        document.body.style.opacity = "0";
        setTimeout(() => {
            document.body.style.background =
                `linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.55)),
                url('${src}') center/cover no-repeat`;
            document.body.style.opacity = "1";
        }, 250);
    }

    // -------- LEVELS --------
    const levels = ["Bronze","Silver","Gold"];

    // -------- SOUNDS --------
    const sounds = {
        correct: new Audio("assets/sounds/correct.mp3"),
        wrong: new Audio("assets/sounds/wrong.mp3"),
        beep: new Audio("assets/sounds/beep.mp3"),
        levelup: new Audio("assets/sounds/levelup.mp3"),
        complete: new Audio("assets/sounds/complete.mp3")
    };

    function playSound(name) {
        if (sounds[name]) { sounds[name].currentTime = 0; sounds[name].play(); }
    }

    const bgMusic = new Audio("assets/sounds/bgmusic.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.15;

    // -------- QUESTIONS --------
    const questions = [
    { q: "What has cities but no houses, rivers but no water, and mountains but no rocks?", a: "globe", hint: "Similar to map"},
    { q: "I can be cracked, made, told, and played. What am I?", a: "joke", hint: "Makes people laugh" },
    { q: "A truck weighs 2000 kg + half its own weight. What is the total weight?", a: "4000 kg", hint: "X = 2000 + X/2" },
    { q: "Unscramble: tarimhtgo", a: "algorithm", hint: "Subject in school" },
    { q: "If √x = 15, what is x?", a: "225", hint: "Square it" },
    { q: "I follow you everywhere but disappear in darkness. What am I?", a: "shadow", hint: "Light needed" },
    { q: "If 8 workers build a wall in 12 days, how long do 4 workers take?", a: "24 days", hint: "Half workers → double time" },
    { q: "A man pushes his car to a hotel and loses all his money. Why?", a: "monopoly", hint: "Board game" },
    { q: "If 12 men finish a job in 8 days, how many in 4 days?", a: "24 men", hint: "Inverse proportion" },
    { q: "Born near the sea, he helped a nation touch the sky. Who is this?", a: "apj abdul kalam", hint: "Missile Man of India." }
  ];

    // -------- GAME VARIABLES --------
    let current = 0;
    let score = 0;
    let timer = 60;
    let countdown = null;
    let hintTimeout = null;
    let startTime = 0;

    // -------- ELEMENTS --------
    const startScreen = document.getElementById("startScreen");
    const gameScreen  = document.getElementById("gameScreen");

    const qLabel = document.getElementById("questionLabel");
    const input  = document.getElementById("answerInput");
    const feedback = document.getElementById("feedback");
    const hintBox = document.getElementById("hint");

    const scoreBox = document.getElementById("score");
    const levelBox = document.getElementById("level");
    const timerBox = document.getElementById("timer");

    const startBtn = document.getElementById("startBtn");
    const nextBtn  = document.getElementById("nextBtn");
    const hintBtn  = document.getElementById("hintBtn");
    const helpBtn  = document.getElementById("helpBtn");

    function animateIn(el) {
        el.classList.remove("slide-in-up");
        void el.offsetWidth;
        el.classList.add("slide-in-up");
    }

    function showQuestion() {
        qLabel.textContent = questions[current].q;
        input.value = "";
        feedback.textContent = "";
        hintBox.textContent = "";
        hintBtn.hidden = true;
        helpBtn.hidden = true;

        animateIn(qLabel);
    }

    function updateLevel() {
        let idx = Math.floor(current / 3);
        if (idx > 2) idx = 2;
        levelBox.textContent = "Level: " + levels[idx];

        if (backgrounds.length > 0) {
            const pick = backgrounds[Math.floor(Math.random()*backgrounds.length)];
            setBG(pick);
        }

        playSound("levelup");
    }

    function startTimer() {
        timer = 60;
        timerBox.textContent = "01:00";
        clearInterval(countdown);
        clearTimeout(hintTimeout);

        countdown = setInterval(() => {
            timer--;
            timerBox.textContent = `00:${timer < 10 ? "0"+timer : timer}`;

            if (timer === 30) hintBtn.hidden = false;
            if (timer === 5) { helpBtn.hidden = false; playSound("beep"); }

            if (timer <= 0) {
                clearInterval(countdown);
                hintBox.textContent = "Answer: " + questions[current].a;
                setTimeout(nextQuestion, 1500);
            }

        }, 1000);
    }

    hintBtn.addEventListener("click", () => {
        hintBox.textContent = "Hint: " + questions[current].hint;
        clearInterval(countdown);
        startTimer();

        clearTimeout(hintTimeout);
        hintTimeout = setTimeout(() => {
            hintBox.textContent = "Answer: " + questions[current].a;
            setTimeout(nextQuestion, 1500);
        }, 60000);
    });

    helpBtn.addEventListener("click", () => {
        input.value = questions[current].a;
        hintBox.textContent = "Answer filled!";
    });

    startBtn.addEventListener("click", () => {
        startScreen.hidden = true;
        gameScreen.hidden = false;

        animateIn(gameScreen);

        score = 0;
        current = 0;
        startTime = Date.now();

        scoreBox.textContent = "Score: 0";
        bgMusic.play();

        updateLevel();
        showQuestion();
        startTimer();
    });

    document.getElementById("answerForm").addEventListener("submit", (e) => {
        e.preventDefault();

        const ans = input.value.trim().toLowerCase();
        const correct = questions[current].a.toLowerCase();

        if (ans === correct) {
            score += 10;
            scoreBox.textContent = "Score: " + score;

            feedback.textContent = "Correct!";
            playSound("correct");

            nextBtn.hidden = false;
            clearInterval(countdown);
            clearTimeout(hintTimeout);

        } else {
            feedback.textContent = "Wrong! Try again.";
            playSound("wrong");
        }
    });

    nextBtn.addEventListener("click", nextQuestion);

    function nextQuestion() {
        current++;
        clearTimeout(hintTimeout);

        if (current >= questions.length) {
            playSound("complete");
            qLabel.textContent = "🎉 Game Completed!";
            const total = Math.floor((Date.now()-startTime)/1000);
            feedback.innerHTML = `Score: ${score}<br>Time: ${Math.floor(total/60)}m ${total%60}s`;
            nextBtn.hidden = true;
            return;
        }

        updateLevel();
        showQuestion();
        startTimer();
        nextBtn.hidden = true;
    }
});
