// ======================================
// RUANG RASA CAFE - PAGE LAYOUT
// Logged-in user, logout, mobile menu, dark mode, reset button and full screen. Loaded on every app page.
// ======================================

// ======================================
// 1. LOGOUT + SHOW LOGGED-IN USER
// ======================================

// Any link marked data-logout ends the session first
document.querySelectorAll("[data-logout]").forEach(function(link) {

    link.addEventListener("click", function(event) {
        event.preventDefault();
        endSession();
        // window.top: if we are inside the full-screen frame, leave it too
        window.top.location.href = new URL("index.html?loggedOut=1", location.href).href;
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
// Also used by the kitchen's menu button in full screen (data-menu-toggle).
// ======================================

(function setupMobileMenu() {

    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    const toggles = document.querySelectorAll("#menuToggle, [data-menu-toggle]");

    if (!toggles.length || !sidebar || !overlay) return;

    let openedBy = toggles[0];   // focus goes back here when the menu closes

    function setToggles(open) {
        toggles.forEach(function(toggle) {
            toggle.setAttribute("aria-expanded", String(open));
            toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        });
    }

    function openMenu() {
        sidebar.classList.add("open");
        overlay.classList.add("show");
        document.body.classList.add("menu-open");
        setToggles(true);

        // Move keyboard focus into the menu
        const firstLink = sidebar.querySelector("a");
        if (firstLink) firstLink.focus();
    }

    function closeMenu() {
        sidebar.classList.remove("open");
        overlay.classList.remove("show");
        document.body.classList.remove("menu-open");
        setToggles(false);
    }

    toggles.forEach(function(toggle) {
        toggle.addEventListener("click", function() {
            openedBy = toggle;
            sidebar.classList.contains("open") ? closeMenu() : openMenu();
        });
    });

    // Tap outside the menu to close it
    overlay.addEventListener("click", closeMenu);

    // Esc closes it and puts focus back on the button
    document.addEventListener("keydown", function(event) {
        if (event.key === "Escape" && sidebar.classList.contains("open")) {
            closeMenu();
            openedBy.focus();
        }
    });

    // Close if the screen is resized back to desktop width
    // (not in full screen: the kitchen uses this slide-in menu there on any width)
    window.addEventListener("resize", function() {
        if (window.innerWidth > 768 && !document.body.classList.contains("is-fullscreen")) {
            closeMenu();
        }
    });

    // Going in or out of full screen always starts with the menu closed
    document.addEventListener("ruangrasa:fullscreen", closeMenu);

})();


// The sidebar has no scroll bar of its own (css/style.css):
// - Desktop: if the menu is taller than the window, the page scroll bar
//   takes you down to Logout, then the menu stays put with Logout in view.
// - Slide-in menu: it scrolls by itself; a fade at the bottom shows when
//   there is more below.
(function setupSidebarFit() {

    const sidebar = document.getElementById("sidebar");

    if (!sidebar) return;

    function fit() {
        // How far up the menu may scroll before it stops (0 if it fits)
        const extra = Math.max(0, sidebar.offsetHeight - window.innerHeight);
        sidebar.style.setProperty("--sidebar-top", -extra + "px");

        const moreBelow = sidebar.scrollHeight - sidebar.clientHeight - sidebar.scrollTop > 4;
        sidebar.classList.toggle("more-below", moreBelow);
    }

    window.addEventListener("resize", fit);
    sidebar.addEventListener("scroll", fit, { passive: true });

    // Buttons added later (Sound on/off), fonts loading, the menu opening
    if ("ResizeObserver" in window) new ResizeObserver(fit).observe(sidebar);
    sidebar.addEventListener("transitionend", fit);

    fit();

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


// Sound on/off for order alerts: a sidebar button under Dark mode on every
// page, plus the toolbar button on the kitchen page. playAlertSound() is in js/ui.js.

document.querySelectorAll("[data-theme-toggle]").forEach(function(themeButton) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "sidebar-action";
    button.setAttribute("data-sound-toggle", "");
    button.innerHTML = '<i class="bi" aria-hidden="true"></i> <span></span>';
    themeButton.after(button);
});

function updateSoundButtons() {

    const on = soundEnabled();

    document.querySelectorAll("[data-sound-toggle]").forEach(function(button) {
        button.setAttribute("aria-pressed", String(on));
        button.querySelector(".bi").className = "bi " + (on ? "bi-volume-up" : "bi-volume-mute");
        button.querySelector("span").textContent = on ? "Sound on" : "Sound off";
    });
}

updateSoundButtons();

document.querySelectorAll("[data-sound-toggle]").forEach(function(button) {
    button.addEventListener("click", function() {
        setSoundEnabled(!soundEnabled());
        updateSoundButtons();
        playAlertSound("new");   // a quick test so they know it works
    });
});

// Changed in another tab
window.addEventListener("storage", function(event) {
    if (event.key === ALERT_SOUND_KEY) updateSoundButtons();
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


// ======================================
// 5. FULL SCREEN BUTTON (small icon, top-right corner of every page)
//
// A browser always leaves full screen when a new page loads. To keep it on
// while moving between pages, the page that went full screen stays put and
// shows the next page inside a frame that covers it ("the full-screen frame").
// The page inside the frame talks to the page around it with postMessage.
// ======================================

(function setupFullscreen() {

    const FRAME_NAME = "ruangRasaFullscreenFrame";
    const root = document.documentElement;

    // Older iPads only have the "webkit" versions. iPhone has neither, so no button.
    const canFullscreen = Boolean(root.requestFullscreen || root.webkitRequestFullscreen);
    if (!canFullscreen) return;

    // Are we the page inside the full-screen frame?
    const insideFrame = window.parent !== window && window.name === FRAME_NAME;

    function fullscreenElement() {
        return document.fullscreenElement || document.webkitFullscreenElement || null;
    }

    function requestFullscreen() {
        const request = root.requestFullscreen || root.webkitRequestFullscreen;
        // The webkit version returns nothing instead of a promise
        try {
            return Promise.resolve(request.call(root));
        } catch (error) {
            return Promise.reject(error);
        }
    }

    function exitFullscreen() {
        const exit = document.exitFullscreen || document.webkitExitFullscreen;
        if (fullscreenElement()) exit.call(document);
    }

    function onFullscreenChange(handler) {
        document.addEventListener("fullscreenchange", handler);
        document.addEventListener("webkitfullscreenchange", handler);
    }

    // Only our own app pages may open in the frame: "orders.html", "kitchen.html#x" ...
    function isAppPage(url) {
        const here = new URL(location.href);
        const folder = here.pathname.slice(0, here.pathname.lastIndexOf("/") + 1);
        const file = url.pathname.slice(folder.length);

        return url.protocol === here.protocol &&
            url.host === here.host &&
            url.pathname.startsWith(folder) &&
            /^[a-z]+\.html$/.test(file) &&
            file !== "index.html";
    }

    // ---------- The button ----------

    const button = document.createElement("button");
    button.type = "button";
    button.className = "fullscreen-btn";
    button.innerHTML = '<i class="bi bi-arrows-fullscreen" aria-hidden="true"></i>';

    // Put it near the top of the page, so Tab reaches it early (where it appears)
    const topbar = document.querySelector(".mobile-topbar");
    const skipLink = document.querySelector(".skip-link");
    if (topbar) topbar.after(button);
    else if (skipLink) skipLink.after(button);
    else document.body.prepend(button);

    function showState(full) {
        const label = full ? "Exit full screen" : "Full screen";

        button.querySelector(".bi").className =
            "bi " + (full ? "bi-fullscreen-exit" : "bi-arrows-fullscreen");
        button.setAttribute("aria-label", label);
        button.title = label;

        // The kitchen page hides its sidebar in full screen (see style.css)
        const changed = document.body.classList.contains("is-fullscreen") !== full;
        document.body.classList.toggle("is-fullscreen", full);

        // Lets the menu close itself (section 2)
        if (changed) document.dispatchEvent(new CustomEvent("ruangrasa:fullscreen"));
    }

    // ---------- Hide while scrolling down, show again when scrolling up ----------

    let lastScrollY = window.scrollY;

    window.addEventListener("scroll", function() {
        const y = window.scrollY;

        if (Math.abs(y - lastScrollY) < 8) return;   // ignore tiny wobbles

        const goingDown = y > lastScrollY && y > 60;
        button.classList.toggle("is-hidden", goingDown && document.activeElement !== button);
        lastScrollY = y;
    }, { passive: true });

    // A keyboard user tabbing to it should always see it
    button.addEventListener("focus", function() {
        button.classList.remove("is-hidden");
    });


    // ======================================
    // A) THIS PAGE IS INSIDE THE FULL-SCREEN FRAME
    // ======================================

    if (insideFrame) {

        let full = true;   // the frame only opens while in full screen
        let topLinks = null;

        showState(full);

        // "*": pages opened from file:// have no origin we could name
        function tellParent(message) {
            window.parent.postMessage(message, "*");
        }

        // Out of full screen, links open as normal pages again (whole window)
        function updateLinkTarget() {
            if (full && topLinks) {
                topLinks.remove();
                topLinks = null;
            } else if (!full && !topLinks) {
                topLinks = document.createElement("base");
                topLinks.target = "_top";
                document.head.appendChild(topLinks);
            }
        }

        window.addEventListener("message", function(event) {
            if (event.source !== window.parent) return;
            if (!event.data || event.data.type !== "rr-fs-state") return;

            full = Boolean(event.data.full);
            showState(full);
            updateLinkTarget();
        });

        button.addEventListener("click", function() {
            tellParent({ type: full ? "rr-fs-exit" : "rr-fs-enter" });
        });

        // Say which page we are, so the outer page can update its address and title
        tellParent({
            type: "rr-fs-page",
            page: location.pathname.split("/").pop() + location.search + location.hash,
            title: document.title
        });

        return;
    }


    // ======================================
    // B) A NORMAL PAGE (this is the one that goes full screen)
    // ======================================

    let frame = null;

    function tellFrame(message) {
        if (frame && frame.contentWindow) frame.contentWindow.postMessage(message, "*");
    }

    showState(Boolean(fullscreenElement()));

    button.addEventListener("click", function() {
        if (fullscreenElement()) {
            exitFullscreen();
        } else {
            requestFullscreen().catch(function() {
                showToast("Full screen is not available in this browser.", "info");
            });
        }
    });

    onFullscreenChange(function() {
        const full = Boolean(fullscreenElement());

        showState(full);
        tellFrame({ type: "rr-fs-state", full: full });
    });

    // Open another page inside the frame, so full screen stays on
    function openInFrame(url) {
        if (!frame) {
            frame = document.createElement("iframe");
            frame.name = FRAME_NAME;
            frame.className = "fullscreen-frame";
            frame.title = "Ruang Rasa";
            frame.setAttribute("allow", "fullscreen");
            document.body.appendChild(frame);
            document.body.classList.add("fs-host");   // also mutes the kitchen chime underneath
        }

        frame.src = url;
    }

    // While in full screen, catch clicks on links to our other pages
    document.addEventListener("click", function(event) {

        if (!fullscreenElement() || event.defaultPrevented) return;
        if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;

        const link = event.target.closest("a[href]");
        if (!link || link.target || link.hasAttribute("download")) return;

        const url = new URL(link.href);
        if (!isAppPage(url)) return;

        // A jump inside this same page (e.g. #orderList) needs no frame
        if (url.pathname === location.pathname && url.search === location.search && url.hash) return;

        event.preventDefault();
        openInFrame(url.href);
    });

    // Messages from the page inside the frame
    window.addEventListener("message", function(event) {

        if (!frame || event.source !== frame.contentWindow) return;

        const data = event.data || {};

        if (data.type === "rr-fs-exit") {
            exitFullscreen();
        }

        if (data.type === "rr-fs-enter") {
            // The click inside the frame also counts as a click on this page
            requestFullscreen().catch(function() {
                tellFrame({ type: "rr-fs-state", full: false });
            });
        }

        if (data.type === "rr-fs-page" && typeof data.page === "string") {

            let url;
            try { url = new URL(data.page, location.href); } catch (error) { return; }
            if (!isAppPage(url)) return;

            // Keep the address bar and tab title right, so Refresh opens the page you see
            try { history.replaceState(null, "", url.href); } catch (error) { /* file:// may refuse */ }
            if (typeof data.title === "string") document.title = data.title.slice(0, 120);

            tellFrame({ type: "rr-fs-state", full: Boolean(fullscreenElement()) });
        }
    });

})();


// ======================================
// 6. ORDER ALERTS (every page)
// When another tab or screen places an order or marks one ready,
// pop up a toast here. The tab title also shows a count while
// you are looking at another tab.
// ======================================

(function setupOrderAlerts() {

    const ORDERS_KEY = "ruangRasaOrders";
    const page = location.pathname.split("/").pop();
    const onKitchen = document.body.classList.contains("kds-page");   // kitchen.js has its own new-order alert
    const onOrders = page === "orders.html";     // the list there updates by itself

    let knownStatus = readStatuses();
    let unseen = 0;
    const baseTitle = document.title;

    function readStatuses() {
        const map = new Map();
        loadSavedData(ORDERS_KEY, []).forEach(function(order) { map.set(order.id, order.status); });
        return map;
    }

    function label(order) {
        return "ORD" + String(order.id).padStart(3, "0");
    }

    window.addEventListener("storage", function(event) {

        if (event.key !== ORDERS_KEY) return;

        const before = knownStatus;
        knownStatus = readStatuses();

        // Hidden under the full-screen frame: the page in the frame shows the alert
        if (document.body.classList.contains("fs-host")) return;

        // "Reset demo data" in another tab rewrites everything: not real news
        if (!event.newValue || !event.oldValue) return;

        const orders = loadSavedData(ORDERS_KEY, []);
        const fresh = orders.filter(function(order) {
            return !before.has(order.id) && order.status === "Pending";
        });
        const ready = orders.filter(function(order) {
            return before.has(order.id) && before.get(order.id) !== "Completed" && order.status === "Completed";
        });

        if (fresh.length + ready.length > 5) return;   // a bulk change, e.g. a reset

        if (fresh.length && !onKitchen) {
            const text = fresh.length === 1
                ? "New order " + label(fresh[0]) + " · " + fresh[0].customer +
                  (fresh[0].total ? " · " + formatRM(fresh[0].total) : "")
                : fresh.length + " new orders received.";

            showToast(text, "info", { action: { label: "Kitchen", href: "kitchen.html" } });
        }

        if (!onKitchen) {
            ready.forEach(function(order) {
                showToast(label(order) + " for " + order.customer + " is ready to serve!", "success",
                    onOrders ? {} : { action: { label: "View", href: "orders.html?order=" + Number(order.id) + "#orderList" } });
            });
        }

        // Sound: "ready" wins when both happen at once. kitchen.js rings for new orders
        // on its own page. The signature stops other open pages ringing twice.
        if (ready.length && !onKitchen) {
            playAlertSound("ready", "ready:" + ready.map(function(order) { return order.id; }).sort().join(","));
        } else if (fresh.length && !onKitchen) {
            playAlertSound("new", "new:" + fresh.map(function(order) { return order.id; }).sort().join(","));
        }

        const news = fresh.length + (onKitchen ? 0 : ready.length);

        if (document.hidden && news) {
            unseen += news;
            setTitle("(" + unseen + ") " + baseTitle);
        }
    });

    document.addEventListener("visibilitychange", function() {
        if (!document.hidden && unseen) {
            unseen = 0;
            setTitle(baseTitle);
        }
    });

    function setTitle(title) {
        document.title = title;

        // Inside the full-screen frame, the outer page owns the tab title
        if (window.parent !== window) {
            window.parent.postMessage({
                type: "rr-fs-page",
                page: location.pathname.split("/").pop() + location.search + location.hash,
                title: title
            }, "*");
        }
    }
})();
