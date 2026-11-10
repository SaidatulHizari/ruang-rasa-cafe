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

    usernameInput.focus();

    usernameInput.addEventListener("input", hideLoginError);
    passwordInput.addEventListener("input", hideLoginError);

    loginForm.addEventListener("submit", function(event) {

        event.preventDefault();

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

            if (username === "admin" && password === "12345") {

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


