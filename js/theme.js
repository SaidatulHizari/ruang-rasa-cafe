// ======================================
// RUANG RASA CAFE - LIGHT / DARK THEME
// Loaded in the <head> so the right colours apply
// before the page is drawn (no white flash).
//
// The choice is saved in localStorage. If the user never
// chose, we follow the computer's own light/dark setting.
// ======================================

const THEME_KEY = "ruangRasaTheme";

function getSavedTheme() {
    try {
        return localStorage.getItem(THEME_KEY);
    } catch (error) {
        return null;
    }
}

function getPreferredTheme() {
    const saved = getSavedTheme();

    if (saved === "light" || saved === "dark") return saved;

    return window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

function applyTheme(theme) {
    const root = document.documentElement;

    // data-theme drives our own CSS variables,
    // data-bs-theme switches Bootstrap's tables, inputs, etc.
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-bs-theme", theme);
}

function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark"
        ? "dark"
        : "light";
}

function saveTheme(theme) {
    try {
        localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
        // Private mode etc. - the theme still works for this page
    }
}

applyTheme(getPreferredTheme());
