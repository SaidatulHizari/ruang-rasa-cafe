// ======================================
// RUANG RASA CAFE - UI HELPERS
// Toasts, small helpers, inline form errors and pop-up dialogs. Loaded first on every page.
// ======================================

// ======================================
// 1. TOAST NOTIFICATION
// Styles live in css/style.css (section 20).
// ======================================

const TOAST_LIMIT = 3;   // older toasts close when a 4th arrives

const TOAST_ICONS = {
    success: "bi-check-circle-fill",
    error: "bi-x-circle-fill",
    info: "bi-info-circle-fill"
};

// options.action = { label: "View", href: "orders.html" } adds a link button
function showToast(message, type = "success", options = {}) {

    if (!TOAST_ICONS[type]) type = "success";

    const container = toastContainer();
    const open = Array.from(container.querySelectorAll(".custom-toast:not(.leaving)"));

    // The same message again: count it and restart its timer instead of stacking a copy
    const same = open.find(function(toast) {
        return toast.dataset.type === type && toast.dataset.message === message;
    });

    if (same) {
        const count = Number(same.dataset.count) + 1;

        same.dataset.count = count;
        same.querySelector(".toast-count").textContent = "×" + count;
        same.classList.remove("bump");
        void same.offsetWidth;                // restart the bump animation
        same.classList.add("bump");
        startToastTimer(same, toastDuration(message, type));
        return;
    }

    open.slice(0, Math.max(0, open.length - TOAST_LIMIT + 1)).forEach(closeToast);

    const toast = document.createElement("div");
    toast.className = "custom-toast " + type;
    toast.dataset.type = type;
    toast.dataset.message = message;
    toast.dataset.count = 1;

    // Errors interrupt the screen reader; the others wait their turn
    if (type === "error") toast.setAttribute("role", "alert");

    toast.innerHTML =
        '<i class="toast-icon bi ' + TOAST_ICONS[type] + '" aria-hidden="true"></i>' +
        '<span class="toast-message"></span>' +
        '<span class="toast-count" aria-hidden="true"></span>' +
        '<button type="button" class="toast-close" aria-label="Dismiss notification">' +
            '<i class="bi bi-x-lg" aria-hidden="true"></i>' +
        '</button>';

    toast.querySelector(".toast-message").textContent = message;
    toast.querySelector(".toast-close").addEventListener("click", function() { closeToast(toast); });

    if (options.action && options.action.href) {
        const link = document.createElement("a");
        link.className = "toast-action";
        link.href = options.action.href;
        link.textContent = options.action.label || "View";
        toast.insertBefore(link, toast.querySelector(".toast-close"));
    }

    // Stay open while the mouse or keyboard focus is on it
    toast.addEventListener("mouseenter", function() { pauseToast(toast); });
    toast.addEventListener("mouseleave", function() { resumeToast(toast); });
    toast.addEventListener("focusin", function() { pauseToast(toast); });
    toast.addEventListener("focusout", function() { resumeToast(toast); });

    container.appendChild(toast);
    startToastTimer(toast, toastDuration(message, type) + (options.action ? 2000 : 0));
}

function toastContainer() {

    let container = document.getElementById("toastContainer");

    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";

        // Screen readers read new toasts aloud
        container.setAttribute("role", "status");
        container.setAttribute("aria-live", "polite");

        document.body.appendChild(container);

        // Hold every toast while this tab is in the background, so none are missed
        document.addEventListener("visibilitychange", function() {
            container.querySelectorAll(".custom-toast:not(.leaving)").forEach(function(toast) {
                if (document.hidden) pauseToast(toast);
                else resumeToast(toast);
            });
        });
    }

    return container;
}

// About 4 seconds, longer for long messages, and errors stay longer
function toastDuration(message, type) {
    const base = type === "error" ? 6000 : 4000;
    return Math.min(base + Math.max(0, message.length - 50) * 50, 10000);
}

function startToastTimer(toast, ms) {
    clearTimeout(toast.toastTimer);
    toast.toastLeft = ms;
    toast.toastEnds = Date.now() + ms;
    toast.toastPaused = false;

    if (document.hidden) {
        pauseToast(toast);
        return;
    }

    toast.toastTimer = setTimeout(function() { closeToast(toast); }, ms);
}

function pauseToast(toast) {
    if (toast.toastPaused) return;
    clearTimeout(toast.toastTimer);
    toast.toastLeft = Math.max(0, toast.toastEnds - Date.now());
    toast.toastPaused = true;
}

function resumeToast(toast) {
    if (!toast.toastPaused || toast.classList.contains("leaving")) return;
    if (toast.matches(":hover") || toast.contains(document.activeElement) || document.hidden) return;

    // At least 2 seconds left so the user can finish reading
    startToastTimer(toast, Math.max(toast.toastLeft, 2000));
}

function closeToast(toast) {
    if (toast.classList.contains("leaving")) return;

    clearTimeout(toast.toastTimer);
    toast.classList.add("leaving");

    // Don't lose keyboard focus when the toast being used goes away
    if (toast.contains(document.activeElement)) document.activeElement.blur();

    setTimeout(function() { toast.remove(); }, 300);
}


// ======================================
// 2. SMALL HELPERS
// ======================================

// Stop names like "<b>Cake</b>" from breaking the page when put into innerHTML
function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// One money format everywhere: "RM 12.50"
function formatRM(amount) {
    // 1234.5 -> "RM 1,234.50"
    return "RM " + (Number(amount) || 0).toLocaleString("en-MY", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Friendly "nothing here yet" box with an optional next-step link
// Example: emptyStateHTML("receipt", "No orders yet.", "orders.html", "Create an order →")
function emptyStateHTML(icon, message, linkHref, linkText) {
    return `
        <div class="empty-state">
            <i class="bi bi-${icon} empty-icon" aria-hidden="true"></i>
            <p>${escapeHTML(message)}</p>
            ${linkHref
                ? `<a href="${linkHref}" class="empty-action">${escapeHTML(linkText)}</a>`
                : ""}
        </div>
    `;
}

const FALLBACK_IMAGE =
    "https://placehold.co/600x400/f3e9df/7a5640?text=Ruang+Rasa";


// ======================================
// 3. INLINE FORM ERRORS
// Shows a red message under the field instead of alert()
// ======================================

function setFieldError(input, message) {

    if (!input) return;

    input.classList.add("is-invalid");

    let feedback = input.parentElement.querySelector(".invalid-feedback");

    if (!feedback) {
        feedback = document.createElement("div");
        feedback.className = "invalid-feedback";
        input.insertAdjacentElement("afterend", feedback);
    }

    feedback.textContent = message;

    // Clear the error as soon as the user fixes the field
    const clear = function() {
        clearFieldError(input);
        input.removeEventListener("input", clear);
        input.removeEventListener("change", clear);
    };

    input.addEventListener("input", clear);
    input.addEventListener("change", clear);
}

function clearFieldError(input) {

    if (!input) return;

    input.classList.remove("is-invalid");

    const feedback = input.parentElement.querySelector(".invalid-feedback");

    if (feedback) feedback.remove();
}


// ======================================
// 4. MODAL DIALOGS
// Replaces confirm() and prompt() with styled pop-ups
// ======================================

// Builds the modal shell and handles closing (Esc, backdrop click, Cancel)
function openModal(contentHTML, options = {}) {

    const backdrop = document.createElement("div");
    backdrop.className = "rr-modal-backdrop";

    backdrop.innerHTML = `
        <div class="rr-modal ${options.wide ? "wide" : ""}"
            role="dialog" aria-modal="true">
            ${contentHTML}
        </div>
    `;

    const previousFocus = document.activeElement;

    function close() {
        document.removeEventListener("keydown", onKey);
        backdrop.remove();
        if (previousFocus && previousFocus.focus) previousFocus.focus();
        if (options.onClose) options.onClose();
    }

    function onKey(event) {

        if (event.key === "Escape") {
            close();
            return;
        }

        // Keep Tab / Shift+Tab inside the pop-up (focus trap)
        if (event.key === "Tab") {

            const focusable = backdrop.querySelectorAll(
                "button, input, select, textarea, a[href]"
            );

            if (focusable.length === 0) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
    }

    backdrop.addEventListener("mousedown", function(event) {
        if (event.target === backdrop) close();
    });

    backdrop.querySelectorAll("[data-close]").forEach(function(button) {
        button.addEventListener("click", close);
    });

    document.addEventListener("keydown", onKey);
    document.body.appendChild(backdrop);

    return { element: backdrop, close: close };
}


// Usage: confirmDialog({ title, message, confirmText, danger }).then(ok => ...)
function confirmDialog(options) {

    return new Promise(function(resolve) {

        let answered = false;

        const modal = openModal(`
            <div class="rr-modal-header">
                <div class="rr-modal-icon ${options.danger ? "danger" : ""}">
                    <i class="bi bi-${options.icon || (options.danger ? "trash3" : "question-circle")}" aria-hidden="true"></i>
                </div>
                <div>
                    <h5>${escapeHTML(options.title)}</h5>
                    <p>${escapeHTML(options.message)}</p>
                </div>
            </div>

            <div class="rr-modal-footer">
                <button type="button" class="btn-ghost" data-close>
                    Cancel
                </button>
                <button type="button"
                    class="${options.danger ? "btn-danger-solid" : "btn btn-brand"}"
                    data-confirm>
                    ${escapeHTML(options.confirmText || "Confirm")}
                </button>
            </div>
        `, {
            onClose: function() {
                if (!answered) resolve(false);
            }
        });

        const confirmButton = modal.element.querySelector("[data-confirm]");

        confirmButton.addEventListener("click", function() {
            answered = true;
            resolve(true);
            modal.close();
        });

        confirmButton.focus();
    });
}



// ======================================
// 5. ALERT SOUND (new order / order ready)
// Made in the browser, so no sound file is needed.
// On by default; the "Sound" button in the sidebar turns it off.
// ======================================

const ALERT_SOUND_KEY = "ruangRasaSound";
const LAST_ALERT_KEY = "ruangRasaLastAlert";
let alertAudio = null;

function soundEnabled() {
    try { return localStorage.getItem(ALERT_SOUND_KEY) !== "off"; } catch (error) { return true; }
}

function setSoundEnabled(on) {
    try { localStorage.setItem(ALERT_SOUND_KEY, on ? "on" : "off"); } catch (error) { /* ignore */ }
}

function getAlertAudio() {
    const AudioClass = window.AudioContext || window.webkitAudioContext;
    if (!alertAudio && AudioClass) alertAudio = new AudioClass();
    if (alertAudio && alertAudio.state === "suspended") alertAudio.resume();
    return alertAudio;
}

// Browsers only allow sound after a click or key press on the page,
// so wake the audio on the first one. Later alerts can then ring.
["pointerdown", "keydown"].forEach(function(type) {
    document.addEventListener(type, function() {
        try { getAlertAudio(); } catch (error) { /* no audio support */ }
    }, { once: true, capture: true });
});

// kind: "new" (two notes going up) or "ready" (three brighter notes)
// signature: when several tabs hear the same alert, only the first one rings
function playAlertSound(kind, signature) {

    if (!soundEnabled()) return;

    if (signature) {
        try {
            if (localStorage.getItem(LAST_ALERT_KEY) === signature) return;
            localStorage.setItem(LAST_ALERT_KEY, signature);
        } catch (error) { /* ring anyway */ }
    }

    try {
        const audio = getAlertAudio();
        if (!audio) return;

        const notes = kind === "ready" ? [784, 988, 1319] : [880, 1175];

        notes.forEach(function(frequency, index) {

            const start = audio.currentTime + index * 0.16;
            const oscillator = audio.createOscillator();
            const volume = audio.createGain();

            oscillator.type = kind === "ready" ? "triangle" : "sine";
            oscillator.frequency.value = frequency;
            volume.gain.setValueAtTime(0.22, start);
            volume.gain.exponentialRampToValueAtTime(0.001, start + 0.4);

            oscillator.connect(volume).connect(audio.destination);
            oscillator.start(start);
            oscillator.stop(start + 0.4);
        });
    } catch (error) {
        // No audio support - the toast is still shown
    }
}
