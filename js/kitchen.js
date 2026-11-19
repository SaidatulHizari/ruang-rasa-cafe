// ======================================
// RUANG RASA CAFE - KITCHEN DISPLAY
// Shows Pending and Preparing orders as tickets for the kitchen.
//
// How the "live" update works without a server:
// when the order page saves to localStorage in another tab,
// the browser fires a "storage" event in this tab. We reload
// the orders and redraw, so new orders appear straight away.
// ======================================

const LATE_AFTER_MINUTES = 10;            // ticket turns red after this

// What each order's dishes looked like last time, so we can tell
// brand-new orders from orders that were changed on the order page
function snapshotOrders() {
    return new Map(orders.map(function(order) {
        return [order.id, JSON.stringify(order.items || [])];
    }));
}

let knownOrders = snapshotOrders();


// ======================================
// 1. SMALL HELPERS
// ======================================

function orderNumber(order) {
    return "ORD" + String(order.id).padStart(3, "0");
}

// "4 min", "1 h 05 min" - or null for old orders saved without a time
function elapsedText(createdAt) {

    if (!createdAt) return null;

    const minutes = Math.max(0, Math.floor((Date.now() - createdAt) / 60000));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return minutes + " min";

    return Math.floor(minutes / 60) + " h " + String(minutes % 60).padStart(2, "0") + " min";
}

function isLate(order) {
    return Boolean(order.createdAt) &&
        Date.now() - order.createdAt > LATE_AFTER_MINUTES * 60000;
}

// Oldest first, so the kitchen works through orders in order.
// Old orders without a time go by their id instead.
function byOldest(a, b) {
    return (a.createdAt || a.id) - (b.createdAt || b.id);
}


// ======================================
// 2. DRAW THE TICKETS
// ======================================

function ticketHTML(order, isNew) {

    const elapsed = elapsedText(order.createdAt);
    const pending = order.status === "Pending";

    // Dishes added after the kitchen started get a NEW tag
    const items = (order.items || []).map(function(item) {
        return `
            <li class="${item.addedAt ? "kds-added" : ""}">
                <span class="kds-qty">${Number(item.quantity) || 0}×</span>
                ${escapeHTML(item.name)}
                ${item.addedAt ? `<span class="kds-new-tag">New</span>` : ""}
            </li>
        `;
    }).join("");

    const updated = order.updatedAt && order.updatedAt > (order.createdAt || 0);

    return `
        <article class="kds-ticket ${isLate(order) ? "late" : ""} ${isNew ? "is-new" : ""}"
            data-created="${order.createdAt || ""}"
            aria-label="${orderNumber(order)} for ${escapeHTML(order.customer)}">

            <header class="kds-ticket-head">
                <div>
                    <span class="kds-order-no">${orderNumber(order)}</span>
                    <strong class="kds-customer">${escapeHTML(order.customer)}</strong>
                    ${updated ? `<span class="kds-updated"><i class="bi bi-pencil" aria-hidden="true"></i> Updated</span>` : ""}
                </div>
                <span class="kds-timer">
                    <i class="bi bi-clock" aria-hidden="true"></i>
                    <span data-elapsed>${elapsed || escapeHTML(order.date)}</span>
                </span>
            </header>

            <ul class="kds-items">${items}</ul>

            <button type="button" class="btn btn-brand w-100"
                onclick="moveOrder(${Number(order.id)}, '${pending ? "Preparing" : "Completed"}')">
                <i class="bi bi-${pending ? "fire" : "check-lg"}" aria-hidden="true"></i>
                ${pending ? "Start cooking" : "Mark ready"}
            </button>
        </article>
    `;
}

function renderKitchen(newIds = new Set()) {

    const pending = orders.filter(function(o) { return o.status === "Pending"; }).sort(byOldest);
    const preparing = orders.filter(function(o) { return o.status === "Preparing"; }).sort(byOldest);

    // Newest finished first; ids are timestamps for real orders
    const completed = orders
        .filter(function(o) { return o.status === "Completed"; })
        .sort(function(a, b) { return byOldest(b, a); })
        .slice(0, 6);

    document.getElementById("pendingCount").textContent = pending.length;
    document.getElementById("preparingCount").textContent = preparing.length;

    document.getElementById("pendingList").innerHTML = pending.length
        ? pending.map(function(o) { return ticketHTML(o, newIds.has(o.id)); }).join("")
        : emptyStateHTML("cup-hot", "No new orders. Nice and quiet.");

    document.getElementById("preparingList").innerHTML = preparing.length
        ? preparing.map(function(o) { return ticketHTML(o, newIds.has(o.id)); }).join("")
        : emptyStateHTML("fire", "Nothing cooking right now.");

    document.getElementById("completedList").innerHTML = completed.length
        ? completed.map(function(order) {
            return `
                <div class="kds-done-item">
                    <span><strong>${orderNumber(order)}</strong> ${escapeHTML(order.customer)}</span>
                    <button type="button" class="btn btn-sm btn-outline-secondary"
                        onclick="moveOrder(${Number(order.id)}, 'Preparing')"
                        aria-label="Send ${orderNumber(order)} back to cooking">
                        <i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i> Undo
                    </button>
                </div>
            `;
        }).join("")
        : `<p class="text-muted small m-0">Finished orders will show here.</p>`;
}


// ======================================
// 3. MOVE AN ORDER TO THE NEXT STATUS
// ======================================

function moveOrder(id, newStatus) {

    const order = orders.find(function(item) { return Number(item.id) === Number(id); });

    if (!order) return;

    order.status = newStatus;

    // Before saving, so other open pages see it was already rung (js/ui.js)
    if (newStatus === "Completed") playAlertSound("ready", "ready:" + order.id);

    saveOrders();          // the order page hears this and updates too
    renderKitchen();

    const messages = {
        Preparing: `Cooking ${order.customer}'s order.`,
        Completed: `${order.customer}'s order is ready!`
    };

    showToast(messages[newStatus], "success");
}


// ======================================
// 4. LIVE UPDATES FROM OTHER TABS
// ======================================

window.addEventListener("storage", function(event) {

    if (event.key !== "ruangRasaOrders") return;

    orders = loadSavedData("ruangRasaOrders", []);

    // Brand-new Pending orders, and active orders whose dishes changed
    const newIds = new Set();
    const changed = [];

    orders.forEach(function(order) {

        const before = knownOrders.get(order.id);
        const active = order.status === "Pending" || order.status === "Preparing";

        if (before === undefined && order.status === "Pending") {
            newIds.add(order.id);
        } else if (before !== undefined && active &&
                   before !== JSON.stringify(order.items || [])) {
            newIds.add(order.id);    // flash the ticket too
            changed.push(order);
        }
    });

    knownOrders = snapshotOrders();

    renderKitchen(newIds);

    const brandNew = newIds.size - changed.length;
    const messages = [];

    if (brandNew === 1) {
        const order = orders.find(function(item) { return newIds.has(item.id) && !changed.includes(item); });
        messages.push("New order " + orderNumber(order) + " for " + order.customer + ".");
    } else if (brandNew > 1) {
        messages.push(brandNew + " new orders received.");
    }

    changed.forEach(function(order) {
        messages.push(orderNumber(order) + " (" + order.customer + ") was updated.");
    });

    if (messages.length > 0) {
        const text = messages.join(" ");

        document.getElementById("kdsAnnouncer").textContent = text;
        showToast(text, "info");

        // Muted while hidden under the full-screen frame (js/layout.js):
        // the page inside the frame rings instead.
        // The same signature as js/layout.js, so other open pages don't ring twice.
        if (!document.body.classList.contains("fs-host")) {
            const freshIds = Array.from(newIds).filter(function(id) {
                return !changed.some(function(order) { return order.id === id; });
            });
            playAlertSound("new", freshIds.length
                ? "new:" + freshIds.sort().join(",")
                : "upd:" + changed.map(function(order) { return order.id; }).join(",") + ":" + Date.now());
        }
    }
});


// ======================================
// 5. TIMERS + CLOCK (every 15 seconds)
// Only the time text changes, so we don't redraw the tickets.
// ======================================

function updateTimers() {

    document.querySelectorAll(".kds-ticket[data-created]").forEach(function(ticket) {

        const createdAt = Number(ticket.dataset.created);

        if (!createdAt) return;

        ticket.querySelector("[data-elapsed]").textContent = elapsedText(createdAt);
        ticket.classList.toggle("late", Date.now() - createdAt > LATE_AFTER_MINUTES * 60000);
    });

    document.getElementById("kdsClock").textContent =
        new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

setInterval(updateTimers, 15000);


// ======================================
// START
// ======================================

renderKitchen();
updateTimers();
