// ======================================
// RUANG RASA CAFE - PAGE LAYOUT
// Logged-in user, logout, mobile menu, dark mode and reset button. Loaded on every app page.
// ======================================

// ======================================
// 1. LOGOUT + SHOW LOGGED-IN USER
// ======================================

// Any link marked data-logout ends the session first
document.querySelectorAll("[data-logout]").forEach(function(link) {

    link.addEventListener("click", function(event) {
        event.preventDefault();
        endSession();
        window.location.href = "index.html?loggedOut=1";
    });

});

// Fill in the user's name wherever the page asks for it
(function showCurrentUser() {

    const session = typeof getSession === "function" ? getSession() : null;

    if (!session) return;

    const displayName =
        session.username.charAt(0).toUpperCase() + session.username.slice(1);

    document.querySelectorAll("[data-username]").forEach(function(element) {
        element.textContent = displayName;
    });

    document.querySelectorAll("[data-user-role]").forEach(function(element) {
        element.textContent = session.role || "Administrator";
    });

    document.querySelectorAll("[data-user-initial]").forEach(function(element) {
        element.textContent = displayName.charAt(0);
    });

    // "Good morning / afternoon / evening" based on the time
    const hour = new Date().getHours();
    const greeting =
        hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

    document.querySelectorAll("[data-greeting]").forEach(function(element) {
        element.textContent = greeting + ", " + displayName + "!";
    });

})();


// ======================================
// 2. MOBILE MENU (hamburger + slide-in sidebar)
// ======================================

(function setupMobileMenu() {

    const toggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");

    if (!toggle || !sidebar || !overlay) return;

    function openMenu() {
        sidebar.classList.add("open");
        overlay.classList.add("show");
        document.body.classList.add("menu-open");
        toggle.setAttribute("aria-expanded", "true");
        toggle.setAttribute("aria-label", "Close menu");

        // Move keyboard focus into the menu
        const firstLink = sidebar.querySelector("a");
        if (firstLink) firstLink.focus();
    }

    function closeMenu() {
        sidebar.classList.remove("open");
        overlay.classList.remove("show");
        document.body.classList.remove("menu-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
    }

    toggle.addEventListener("click", function() {
        sidebar.classList.contains("open") ? closeMenu() : openMenu();
    });

    // Tap outside the menu to close it
    overlay.addEventListener("click", closeMenu);

    // Esc closes it and puts focus back on the button
    document.addEventListener("keydown", function(event) {
        if (event.key === "Escape" && sidebar.classList.contains("open")) {
            closeMenu();
            toggle.focus();
        }
    });

    // Close if the screen is resized back to desktop width
    window.addEventListener("resize", function() {
        if (window.innerWidth > 768) closeMenu();
    });

})();


// ======================================
// 3. DARK MODE TOGGLE
// (the saved theme is applied earlier by js/theme.js)
// ======================================

// currentTheme() lives in js/theme.js; chart colours in js/charts.js

function updateThemeButtons() {

    const dark = currentTheme() === "dark";

    document.querySelectorAll("[data-theme-toggle]").forEach(function(button) {
        button.setAttribute("aria-pressed", String(dark));
        button.querySelector(".bi").className =
            "bi " + (dark ? "bi-sun" : "bi-moon-stars");
        button.querySelector("span").textContent =
            dark ? "Light mode" : "Dark mode";
    });
}

updateThemeButtons();

document.querySelectorAll("[data-theme-toggle]").forEach(function(button) {

    button.addEventListener("click", function() {

        const next = currentTheme() === "dark" ? "light" : "dark";

        applyTheme(next);
        saveTheme(next);
        updateThemeButtons();

        // Charts are drawn once with fixed colours, so redraw the page
        if (document.querySelector("canvas")) {
            location.reload();
        }
    });
});


// ======================================
// 4. RESET DEMO DATA
// Puts the original menu and sample orders back.
// Handy before a presentation.
// ======================================

document.querySelectorAll("[data-reset-demo]").forEach(function(button) {

    button.addEventListener("click", function() {

        confirmDialog({
            title: "Reset demo data?",
            message: "All orders and menu changes will be deleted and the original sample data restored.",
            confirmText: "Reset data",
            icon: "arrow-counterclockwise",
            danger: true
        }).then(function(confirmed) {

            if (!confirmed) return;

            try {
                DEMO_DATA_KEYS.forEach(function(key) { localStorage.removeItem(key); });
                sessionStorage.setItem("ruangRasaFlash", "Demo data has been reset.");
            } catch (error) {
                showToast("Could not reset the data in this browser.", "error");
                return;
            }

            location.reload();
        });
    });
});

// Show a message that was saved just before a page reload
(function showFlashMessage() {
    try {
        const message = sessionStorage.getItem("ruangRasaFlash");

        if (message) {
            sessionStorage.removeItem("ruangRasaFlash");
            showToast(message, "success");
        }
    } catch (error) {
        // Storage blocked - nothing to show
    }
})();


