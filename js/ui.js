// ======================================
// RUANG RASA CAFE - UI HELPERS
// Toasts, small helpers, inline form errors and pop-up dialogs. Loaded first on every page.
// ======================================

// ======================================
// 1. TOAST NOTIFICATION
// ======================================

function showToast(message, type = "success") {

    let container = document.getElementById("toastContainer");

    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";

        // Screen readers read new toasts aloud
        container.setAttribute("role", "status");
        container.setAttribute("aria-live", "polite");

        document.body.appendChild(container);
    }

    if (!document.getElementById("toastStyles")) {

        const style = document.createElement("style");
        style.id = "toastStyles";

        style.textContent = `
            #toastContainer {
                position: fixed;
                top: 25px;
                right: 25px;
                z-index: 99999;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .custom-toast {
                min-width: 280px;
                max-width: 350px;
                padding: 16px 20px;
                border-radius: 12px;
                background: white;
                box-shadow: 0 8px 25px rgba(0,0,0,0.13);
                display: flex;
                align-items: center;
                gap: 12px;
                animation: toastSlide 0.4s ease;
                border-left: 5px solid #6b9b72;
                font-family: Poppins, sans-serif;
                transition: 0.4s ease;
            }

            .custom-toast.error {
                border-left-color: #dc6b6b;
            }

            .custom-toast.info {
                border-left-color: #7198c5;
            }

            .toast-icon {
                font-size: 23px;
            }

            .toast-message {
                color: #5c4033;
                font-size: 13px;
                font-weight: 500;
            }

            @keyframes toastSlide {
                from {
                    opacity: 0;
                    transform: translateX(40px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            @media(max-width: 480px) {
                #toastContainer {
                    left: 15px;
                    right: 15px;
                    top: 15px;
                }

                .custom-toast {
                    min-width: auto;
                    max-width: 100%;
                }
            }
        `;

        document.head.appendChild(style);
    }

    const icons = {
        success: "bi-check-circle-fill",
        error: "bi-x-circle-fill",
        info: "bi-info-circle-fill"
    };

    const toast = document.createElement("div");
    toast.className = "custom-toast " + type;

    const icon = document.createElement("i");
    icon.className = "toast-icon bi " + (icons[type] || icons.success);
    icon.setAttribute("aria-hidden", "true");

    const text = document.createElement("span");
    text.className = "toast-message";
    text.textContent = message;

    toast.appendChild(icon);
    toast.appendChild(text);
    container.appendChild(toast);

    setTimeout(function() {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(40px)";

        setTimeout(function() {
            toast.remove();
        }, 400);
    }, 3000);
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

