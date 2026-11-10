// ======================================
// RUANG RASA CAFE - LOGIN SESSION
// Loaded in the <head> of every page, BEFORE the page is shown.
//
// - Protected pages (dashboard, menu, orders, sales):
//   no session  ->  sent back to index.html
// - Login page (index.html):
//   already logged in  ->  sent straight to the dashboard
//
// The session lives in sessionStorage, so it ends when the
// browser tab is closed. (This is a front-end demo: a real
// system would check the login on a server.)
// ======================================

const SESSION_KEY = "ruangRasaSession";

function getSession() {
    try {
        const saved = sessionStorage.getItem(SESSION_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch (error) {
        return null;
    }
}

function startSession(username) {
    try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({
            username: username,
            role: "Administrator",
            loginAt: new Date().toISOString()
        }));
    } catch (error) {
        console.error("Could not save the login session:", error);
    }
}

function endSession() {
    try {
        sessionStorage.removeItem(SESSION_KEY);
    } catch (error) {
        // Nothing to clear
    }
}

(function guardPage() {

    const page = location.pathname.split("/").pop() || "index.html";
    const isLoginPage = page === "index.html";
    const session = getSession();

    if (!isLoginPage && !session) {
        // Remember where the user wanted to go, so we can return after login
        location.replace("index.html?next=" + encodeURIComponent(page));
        return;
    }

    if (isLoginPage && session && !location.search.includes("loggedOut")) {
        location.replace("dashboard.html");
    }

})();
