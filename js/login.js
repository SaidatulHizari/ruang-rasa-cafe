// ======================================
// RUANG RASA CAFE - LOGIN PAGE
// Only loaded on index.html. Needs ui.js and auth.js.
// ======================================

// ======================================
// 1. LOGIN FUNCTION
// ======================================

// Pages a user may be sent back to after logging in
const PROTECTED_PAGES = ["dashboard.html", "menu.html", "orders.html", "sales.html"];

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const errorMessage = document.getElementById("errorMessage");
    const loginButton = document.getElementById("loginButton");
    const params = new URLSearchParams(location.search);

    function showLoginError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = "block";

        // Restart the shake animation
        errorMessage.classList.remove("shake");
        void errorMessage.offsetWidth;
        errorMessage.classList.add("shake");
    }

    function hideLoginError() {
        errorMessage.style.display = "none";
    }

    // Messages carried over from other pages
    if (params.has("loggedOut")) {
        showToast("You have been logged out.", "info");
    } else if (params.has("next")) {
        showToast("Please sign in to continue.", "info");
    }

    // ======================================
    // DEMO AUTO-FILL
    // Types the demo account into the fields letter by letter, so the
    // user only has to press Sign In (or Enter). Any click or key press
    // skips to the end. Set DEMO_AUTOFILL to false for empty fields.
    // ======================================

    const DEMO_AUTOFILL = true;
    const DEMO_USERNAME = "admin";
    const DEMO_PASSWORD = "kp3hu9k34Z68Sv&B";
    const TYPING_SPEED = 85;   // ms per letter

    let typingTimer = null;

    // Stop the animation and show the full values straight away
    function finishTyping() {
        if (!typingTimer) return;
        clearTimeout(typingTimer);
        typingTimer = null;
        usernameInput.value = DEMO_USERNAME;
        passwordInput.value = DEMO_PASSWORD;
        usernameInput.classList.remove("is-typing");
        passwordInput.classList.remove("is-typing");
        document.removeEventListener("pointerdown", finishTyping, true);
        document.removeEventListener("keydown", finishTyping, true);
    }

    function typeDemoAccount() {

        const steps = [
            { input: usernameInput, text: DEMO_USERNAME },
            { input: passwordInput, text: DEMO_PASSWORD }
        ];
        let step = 0;
        let letter = 0;

        function next() {

            const current = steps[step];
            current.input.classList.add("is-typing");
            current.input.value = current.text.slice(0, ++letter);

            if (letter < current.text.length) {
                typingTimer = setTimeout(next, TYPING_SPEED + Math.random() * 60);
                return;
            }

            current.input.classList.remove("is-typing");
            step += 1;
            letter = 0;

            if (step < steps.length) {
                typingTimer = setTimeout(next, 250);   // short pause between fields
            } else {
                typingTimer = null;
                document.removeEventListener("pointerdown", finishTyping, true);
                document.removeEventListener("keydown", finishTyping, true);
            }
        }

        // The fields only show letters (they are not focused), so a
        // phone doesn't pop up its keyboard while the demo types
        document.addEventListener("pointerdown", finishTyping, true);
        document.addEventListener("keydown", finishTyping, true);
        typingTimer = setTimeout(next, 400);
    }

    if (DEMO_AUTOFILL && !usernameInput.value && !passwordInput.value) {

        const reduceMotion = window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (reduceMotion) {
            usernameInput.value = DEMO_USERNAME;
            passwordInput.value = DEMO_PASSWORD;
        } else {
            typeDemoAccount();
        }

        // Focus the button so pressing Enter signs in straight away
        loginButton.focus();

    } else {
        usernameInput.focus();
    }

    usernameInput.addEventListener("input", hideLoginError);
    passwordInput.addEventListener("input", hideLoginError);

    loginForm.addEventListener("submit", function(event) {

        event.preventDefault();
        finishTyping();   // Sign In pressed mid-animation: use the full values

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            showLoginError("Please enter both your username and password.");
            (username ? passwordInput : usernameInput).focus();
            return;
        }

        // Loading state: spinner + disabled button
        const originalLabel = loginButton.innerHTML;
        loginButton.disabled = true;
        loginButton.innerHTML =
            '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Signing in...';

        // Short pause so the user sees something happening
        setTimeout(function() {

            if (username === "admin" && password === "kp3hu9k34Z68Sv&B") {

                startSession(username);

                const next = params.get("next");
                const destination =
                    PROTECTED_PAGES.includes(next) ? next : "dashboard.html";

                window.location.href = destination;

            } else {

                loginButton.disabled = false;
                loginButton.innerHTML = originalLabel;

                showLoginError("Incorrect username or password. Please try again.");
                passwordInput.value = "";
                passwordInput.focus();
            }

        }, 600);
    });
}


