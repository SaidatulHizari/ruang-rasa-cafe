// ======================================
// RUANG RASA CAFE - DATA
// Saved menu items and orders (localStorage). Loaded on every app page after ui.js.
// ======================================

// ======================================
// 1. LOCAL STORAGE
// ======================================

function loadSavedData(key, defaultValue) {

    try {
        const saved = localStorage.getItem(key);

        if (saved !== null) {
            const parsed = JSON.parse(saved);

            if (Array.isArray(parsed)) {
                return parsed;
            }
        }
    } catch (error) {
        console.error("Error loading data:", error);
    }

    return defaultValue;
}

function saveMenuItems() {
    localStorage.setItem(
        "ruangRasaMenuItems",
        JSON.stringify(menuItems)
    );
}

function saveOrders() {
    localStorage.setItem(
        "ruangRasaOrders",
        JSON.stringify(orders)
    );
}

// Everything "Reset demo data" clears
const DEMO_DATA_KEYS = [
    "ruangRasaMenuItems",
    "ruangRasaOrders",
    "ruangRasaKnownDishes",
    "ruangRasaSalesHistory"
];

// Change this when the built-in menu prices or the sample data change.
// A browser holding data from an older version starts fresh once, so it
// picks up the new prices instead of keeping its saved copy.
const DEMO_DATA_VERSION = "2026-11-14-prices";

(function upgradeDemoData() {
    try {
        if (localStorage.getItem("ruangRasaDataVersion") !== DEMO_DATA_VERSION) {
            DEMO_DATA_KEYS.forEach(function(key) { localStorage.removeItem(key); });
            localStorage.setItem("ruangRasaDataVersion", DEMO_DATA_VERSION);
        }
    } catch (error) { /* storage blocked: the samples are used for this visit */ }
})();

// Small repeatable random generator (mulberry32): the same seed always
// gives the same "random" numbers, so the demo data never changes
function makeRandom(seed) {
    return function random() {
        seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}


// ======================================
// 2. MENU CATEGORIES
// ======================================

const menuCategories = [
    "Rice",
    "Noodles",
    "Pasta",
    "Western Food",
    "Cakes",
    "Beverages",
    "Snacks",
    "Desserts"
];


// ======================================
// 3. NEW MENU COLLECTION
// ======================================

const newMenuCollection = [

    // RICE

    {
        name: "Nasi Lemak",
        category: "Rice",
        price: 5.00,
        image: "images/nasi-lemak.webp"
    },
    {
        name: "Nasi Ayam",
        category: "Rice",
        price: 8.00,
        image: "images/nasi-ayam.webp"
    },
    {
        name: "Nasi Goreng Kampung",
        category: "Rice",
        price: 8.00,
        image: "images/nasi-goreng-kampung.webp"
    },
    {
        name: "Nasi Goreng Cina",
        category: "Rice",
        price: 8.00,
        image: "images/nasi-goreng-cina.webp"
    },
    {
        name: "Nasi Goreng Pattaya",
        category: "Rice",
        price: 8.00,
        image: "images/nasi-goreng-pattaya.webp"
    },
    {
        name: "Nasi Goreng Seafood",
        category: "Rice",
        price: 10.00,
        image: "images/nasi-goreng-seafood.webp"
    },
    {
        name: "Nasi Ayam Penyet",
        category: "Rice",
        price: 12.00,
        image: "images/nasi-ayam-penyet.webp"
    },
    {
        name: "Nasi Goreng Tomyam",
        category: "Rice",
        price: 10.00,
        image: "images/nasi-goreng-tomyam.webp"
    },

    // NOODLES

    {
        name: "Mi Goreng",
        category: "Noodles",
        price: 8.00,
        image: "images/mi-goreng.webp"
    },
    {
        name: "Mi Kari",
        category: "Noodles",
        price: 8.00,
        image: "images/mi-kari.webp"
    },
    {
        name: "Kuey Teow Goreng",
        category: "Noodles",
        price: 8.00,
        image: "images/kuey-teow-goreng.webp"
    },

    // PASTA

    {
        name: "Spaghetti Carbonara",
        category: "Pasta",
        price: 15.00,
        image: "images/spaghetti-carbonara.webp"
    },
    {
        name: "Spaghetti Bolognese",
        category: "Pasta",
        price: 15.00,
        image: "images/spaghetti-bolognese.webp"
    },
    {
        name: "Aglio Olio",
        category: "Pasta",
        price: 16.00,
        image: "images/aglio-olio.webp"
    },
    {
        name: "Creamy Chicken Mushroom Pasta",
        category: "Pasta",
        price: 18.00,
        image: "images/creamy-chicken-mushroom-pasta.webp"
    },
    { name: "Rigatoni Pomodoro",      category: "Pasta", price: 15.00, image: "images/rigatoni-pomodoro.webp" },
    { name: "Garlic Caper Casarecce", category: "Pasta", price: 16.00, image: "images/garlic-caper-casarecce.webp" },
    { name: "Beef Ragu Tagliatelle",  category: "Pasta", price: 22.00, image: "images/beef-ragu-tagliatelle.webp" },

    // WESTERN FOOD

    {
        name: "Chicken Chop",
        category: "Western Food",
        price: 18.00,
        image: "images/chicken-chop.webp"
    },
    {
        name: "Crispy Chicken Chop",
        category: "Western Food",
        price: 20.00,
        image: "images/crispy-chicken-chop.webp"
    },
    {
        name: "Fish and Chips",
        category: "Western Food",
        price: 18.00,
        image: "images/fish-and-chips.webp"
    },
    {
        name: "Grilled Salmon",
        category: "Western Food",
        price: 28.00,
        image: "images/grilled-salmon.webp"
    },
    {
        name: "Chicken Grill",
        category: "Western Food",
        price: 18.00,
        image: "images/chicken-grill.webp"
    },
    {
        name: "Beef Steak",
        category: "Western Food",
        price: 28.00,
        image: "images/beef-steak.webp"
    },

    // CAKES

    { name: "Chocolate Indulgence", category: "Cakes", price: 13.00, image: "images/chocolate-indulgence.webp" },
    { name: "New York Cheesecake",  category: "Cakes", price: 13.00, image: "images/new-york-cheesecake.webp" },
    { name: "Blueberry Cheesecake", category: "Cakes", price: 13.00, image: "images/blueberry-cheesecake.webp" },
    { name: "Burnt Cheesecake",     category: "Cakes", price: 13.00, image: "images/burnt-cheesecake.webp" },
    { name: "Oreo Cheesecake",      category: "Cakes", price: 13.00, image: "images/oreo-cheesecake.webp" },
    { name: "Chocolate Fudge",      category: "Cakes", price: 13.00, image: "images/chocolate-fudge.webp" },
    { name: "Carrot Cake",          category: "Cakes", price: 13.00, image: "images/carrot-cake.webp" },
    { name: "Mango Mousse Cake",    category: "Cakes", price: 13.00, image: "images/mango-mousse-cake.webp" },
    { name: "Ondeh-Ondeh Cake",     category: "Cakes", price: 13.00, image: "images/ondeh-ondeh-cake.webp" },
    { name: "Strawberry Shortcake", category: "Cakes", price: 13.00, image: "images/strawberry-shortcake.webp" },

    // BEVERAGES

    { name: "Cappuccino",              category: "Beverages", price: 10.00, image: "images/cappuccino.webp" },
    { name: "Iced Americano",          category: "Beverages", price: 8.00,  image: "images/iced-americano.webp" },
    { name: "Iced Latte",              category: "Beverages", price: 10.00, image: "images/iced-latte.webp" },
    { name: "Spanish Latte",           category: "Beverages", price: 13.00, image: "images/spanish-latte.webp" },
    { name: "Caramel Macchiato",       category: "Beverages", price: 13.00, image: "images/caramel-macchiato.webp" },
    { name: "Iced Chocolate",          category: "Beverages", price: 10.00, image: "images/iced-chocolate.webp" },
    { name: "Iced Matcha Latte",       category: "Beverages", price: 13.00, image: "images/iced-matcha-latte.webp" },
    { name: "Strawberry Matcha Latte", category: "Beverages", price: 15.00, image: "images/strawberry-matcha-latte.webp" },
    { name: "Peach Tea",               category: "Beverages", price: 9.00,  image: "images/peach-tea.webp" },
    { name: "Strawberry Smoothie",     category: "Beverages", price: 15.00, image: "images/strawberry-smoothie.webp" }

];

// Near closing time the popular cakes have run out, so a fresh
// start shows these as sold out ("Make all available" puts them back)
const CLOSING_SOLD_OUT = ["Burnt Cheesecake", "Chocolate Indulgence"];

// Sales targets for the demo data (sections 6 and 7).
// Average RM 50,000 a month for the five full months, then this month
// is on track for about 10% more (RM 55,000 by the end of the month)
const HISTORY_MONTH_TARGETS = [47500, 49000, 50500, 51000, 52000];
const HISTORY_THIS_MONTH_TARGET = 55000;


// ======================================
// 4. LOAD AND PREPARE MENU DATA
// ======================================

let menuItems = loadSavedData("ruangRasaMenuItems", []);

// A dish id no other dish has (many dishes are created in the same millisecond)
function newMenuId() {

    let id = Date.now();

    while (menuItems.some(function(item) { return String(item.id) === String(id); })) {
        id++;
    }

    return id;
}

// The menu photos were "images/<name>.jpg" before they became small .webp files.
// Data saved in the browser still has the old paths, so point those at the new files.
const BUILT_IN_IMAGES = new Set(newMenuCollection.map(function(item) { return item.image; }));

function upgradeImagePath(path) {

    if (typeof path !== "string") return path;

    const webp = path.replace(/^images\/([a-z0-9-]+)\.jpg$/, "images/$1.webp");

    return BUILT_IN_IMAGES.has(webp) ? webp : path;
}

// Built-in dishes this browser has already put on the menu (lower-case names).
// A dish on this list is never added again, so deleting or renaming it sticks.
// "Reset demo data" clears it, which brings every built-in dish back.
const KNOWN_DISHES_KEY = "ruangRasaKnownDishes";

function loadKnownDishes() {
    try {
        const saved = JSON.parse(localStorage.getItem(KNOWN_DISHES_KEY));
        return Array.isArray(saved) ? saved : null;
    } catch (error) {
        return null;
    }
}

function prepareMenuItems() {

    // Remove invalid old data safely

    menuItems = menuItems.filter(function(item) {

        return item &&
            typeof item.name === "string" &&
            item.name.trim() !== "";

    });

    let knownDishes = loadKnownDishes();

    // First run of this version: tidy up data saved by older versions, once.
    // After this the staff's own edits are never overwritten.
    if (knownDishes === null) {

        menuItems.forEach(function(item) {

            if (item.name === "Mee Goreng") {
                item.name = "Mi Goreng";
            }

            if (item.name === "Kek Coklat" || item.name === "Chocolate Cake") {
                item.category = "Desserts";
            }

            // Old saved copies of built-in dishes: use the current photo and category
            const builtIn = newMenuCollection.find(function(newItem) {
                return newItem.name.toLowerCase() === item.name.toLowerCase();
            });

            if (builtIn) {
                item.category = builtIn.category;
                item.image = builtIn.image;
            }
        });

        // Built-in dishes already on the menu count as known
        knownDishes = menuItems.map(function(item) { return item.name.toLowerCase(); });
    }

    menuItems.forEach(function(item) {

        if (!item.id) {
            item.id = newMenuId();
        }

        item.image = upgradeImagePath(item.image);

        if (!item.image) {
            item.image =
                "https://placehold.co/600x400/f2e8df/916541?text=Food";
        }

    });

    // Add built-in dishes this browser has never had (a fresh start,
    // or dishes added to newMenuCollection in a later version)

    newMenuCollection.forEach(function(newItem) {

        const name = newItem.name.toLowerCase();

        if (knownDishes.includes(name)) return;

        knownDishes.push(name);

        const alreadyOnMenu = menuItems.some(function(item) {
            return item.name.toLowerCase() === name;
        });

        if (!alreadyOnMenu) {
            const dish = {
                id: newMenuId(),
                name: newItem.name,
                category: newItem.category,
                price: newItem.price,
                image: newItem.image
            };
            if (CLOSING_SOLD_OUT.includes(newItem.name)) dish.soldOut = true;
            menuItems.push(dish);
        }

    });

    saveMenuItems();

    try {
        localStorage.setItem(KNOWN_DISHES_KEY, JSON.stringify(knownDishes));
    } catch (error) { /* storage blocked */ }
}

prepareMenuItems();



// ======================================
// 5. PAYMENTS
// Each order keeps a list of payments, e.g.
//   [{ method: "Cash", amount: 28, received: 30, change: 2, paidAt: ... }]
// It's a list (not one field) because changing an order can bring
// an extra payment, or a refund (amount below 0).
// ======================================

const PAYMENT_METHODS = [
    { id: "Cash", label: "Cash",          icon: "cash-coin" },
    { id: "Card", label: "Card",          icon: "credit-card" },
    { id: "QR",   label: "QR / e-wallet", icon: "qr-code" }
];

function paymentMethodInfo(id) {
    return PAYMENT_METHODS.find(function(method) { return method.id === id; }) ||
        { id: id, label: id === "Unknown" ? "Not recorded" : String(id), icon: "wallet2" };
}

// Round to the nearest sen, so 0.1 + 0.2 style errors never show up as change
function roundRM(amount) {
    return Math.round(Number(amount) * 100) / 100;
}

function makePayment(method, amount, cashReceived, paidAt) {

    const payment = { method: method, amount: roundRM(amount), paidAt: paidAt || Date.now() };

    if (method === "Cash" && cashReceived !== null && cashReceived !== undefined) {
        payment.received = roundRM(cashReceived);
        payment.change = roundRM(cashReceived - amount);
    }

    return payment;
}

// How much the customer has paid so far (refunds taken off).
// Old orders saved before payments existed count as fully paid.
function amountPaid(order) {

    if (!Array.isArray(order.payments)) return roundRM(order.total || 0);

    return roundRM(order.payments.reduce(function(sum, payment) {
        return sum + Number(payment.amount || 0);
    }, 0));
}

// "Cash", "Cash + Card", or "" for old orders saved before payments existed
function paymentSummary(order) {

    const methods = [];

    (order.payments || []).forEach(function(payment) {
        if (payment.amount > 0 && !methods.includes(payment.method)) {
            methods.push(payment.method);
        }
    });

    return methods.map(function(id) { return paymentMethodInfo(id).label; }).join(" + ");
}

// Small "Paid by" tag for tables. Mixed payments get a wallet icon.
function paymentTagHTML(order) {

    const summary = paymentSummary(order);

    if (!summary) return `<span class="pay-tag muted">Payment not recorded</span>`;

    const methods = (order.payments || []).filter(function(payment) { return payment.amount > 0; });
    const icon = summary.includes("+") ? "wallet2" : paymentMethodInfo(methods[0].method).icon;

    return `<span class="pay-tag"><i class="bi bi-${icon}" aria-hidden="true"></i> ${escapeHTML(summary)}</span>`;
}

// The method of the last real payment: used for refunds and as the
// starting choice when adding dishes to an order
function lastPaymentMethod(order) {

    const paid = (order.payments || []).filter(function(payment) {
        return payment.amount > 0 && payment.method !== "Unknown";
    });

    return paid.length ? paid[paid.length - 1].method : "Cash";
}


// ======================================
// 6. ORDERS DATA
// ======================================

// Built-in dishes, with the favourites listed more than once so they
// sell more often. Used by today's orders and the sales history.
function weightedDishes() {
    const favourites = ["Nasi Lemak", "Spanish Latte", "Chicken Chop", "Iced Latte", "Mi Goreng", "Burnt Cheesecake"];
    return newMenuCollection.concat(
        newMenuCollection.filter(function(dish) { return favourites.includes(dish.name); }),
        newMenuCollection.filter(function(dish) { return favourites.slice(0, 3).includes(dish.name); })
    );
}

// Weekends and Fridays are busier
function dayBusyness(date) {
    const weekday = date.getDay();
    return weekday === 0 || weekday === 6 ? 1.35 : weekday === 5 ? 1.15 : 1;
}

// Today's share of this month's target, so today plus the history
// keeps the month on track (about RM 2,300 on a Saturday)
function todaysSalesTarget() {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    let monthBusyness = 0;
    for (let day = 1; day <= daysInMonth; day++) {
        monthBusyness += dayBusyness(new Date(today.getFullYear(), today.getMonth(), day));
    }
    return HISTORY_THIS_MONTH_TARGET * dayBusyness(today) / monthBusyness;
}

const CAFE_OPENS_AT = 8;   // 8:00 am

// Each name is used once a day (see nextCustomer in sampleOrders),
// so keep this list longer than a busy day's orders (about 80)
const SAMPLE_CUSTOMERS = [
    // Malay
    "Amir", "Aina", "Hafiz", "Nurul", "Farid", "Siti", "Haziq", "Aisyah", "Balqis", "Irfan",
    "Syafiq", "Ahmad", "Iman", "Liyana", "Fatin", "Adam", "Yasmin", "Alya", "Hakim", "Nadia",
    "Rizal", "Zulaikha", "Danish", "Hanis", "Faiz", "Izzati", "Luqman", "Sofea", "Amirul", "Nabila",
    "Khairul", "Azlina", "Firdaus", "Humaira", "Syahmi", "Najwa", "Ikmal", "Wardah", "Aqil", "Puteri",
    // Chinese
    "Mei Ling", "Wei Jie", "Jia Hui", "Kah Wai", "Xin Yi", "Chee Keong", "Siew Lan", "Jun Hao", "Li Ting", "Boon Huat",
    "Pei Shan", "Zhi Hao", "Hui Min", "Wai Kit", "Ying Ying", "Kok Leong", "Shu Fen", "Yong Sheng",
    // Indian
    "Arjun", "Priya", "Kumar", "Deepa", "Ravi", "Kavitha", "Suresh", "Anitha", "Vikram", "Lakshmi",
    "Ganesh", "Meera", "Prakash", "Shalini", "Dinesh", "Revathi",
    // Others
    "Sara", "Daniel", "Jason", "Chloe", "Michelle", "Kevin", "Grace", "Ethan", "Sofia", "Ryan",
    "Natalie", "Marcus", "Joanne", "Aaron", "Vanessa", "Bryan", "Stephanie", "Justin"
];

// Today's orders, as if the café is about to close: a full day's
// sales of completed orders since 8:00 am with a lunch and a dinner
// rush, and the last few orders still in the kitchen. The last orders
// are a few minutes old, so the kitchen timers make sense right after
// a reset. Every total
// matches its items, at today's menu prices.
function sampleOrders() {

    const random = makeRandom(1114);
    const dishes = weightedDishes();
    const minute = 60 * 1000;
    const now = Date.now();
    const today = new Date();
    const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

    // Opened at 8:00 am. Before about 10 am that would leave almost no day,
    // so the orders then start two hours ago (never before midnight).
    let opened = midnight + CAFE_OPENS_AT * 60 * minute;
    if (now - opened < 120 * minute) opened = Math.max(midnight + minute, now - 120 * minute);
    const lastCompleted = Math.max(opened, now - 18 * minute);

    function pick(list) {
        return list[Math.floor(random() * list.length)];
    }

    // Customer names in a shuffled order, each used once. On a day busier
    // than the list, names come round again with an initial ("Amir R.").
    const customers = SAMPLE_CUSTOMERS.slice();
    for (let i = customers.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [customers[i], customers[j]] = [customers[j], customers[i]];
    }
    let customerCount = 0;

    function nextCustomer() {
        const name = customers[customerCount % customers.length];
        const round = Math.floor(customerCount / customers.length);
        customerCount += 1;
        return round === 0 ? name : name + " " + "RSTKMHLBAN"[(round - 1) % 10] + ".";
    }

    // 1 to 3 different dishes, usually one of each
    function pickItems(late) {
        const items = [];
        const count = 1 + Math.floor(random() * 3);
        while (items.length < count) {
            const dish = pick(dishes);
            if (items.some(function(item) { return item.name === dish.name; })) continue;
            if (late && CLOSING_SOLD_OUT.includes(dish.name)) continue;   // sold out by now
            items.push({ name: dish.name, quantity: random() < 0.75 ? 1 : 2, price: dish.price, image: dish.image });
        }
        return items;
    }

    // A time between opening and the last completed order,
    // busier around lunch (12:45) and dinner (7:30 pm)
    function pickTime() {
        for (;;) {
            const time = opened + random() * (lastCompleted - opened);
            const hour = (time - midnight) / (60 * minute);
            const busy = 0.35 +
                Math.exp(-Math.pow((hour - 12.75) / 1.1, 2)) +        // lunch
                0.9 * Math.exp(-Math.pow((hour - 19.5) / 1.2, 2));    // dinner
            if (random() * 2.4 < busy) return Math.round(time);
        }
    }

    function order(createdAt, status, items) {
        const total = roundRM(items.reduce(function(sum, item) { return sum + item.price * item.quantity; }, 0));
        const roll = random();
        const method = roll < 0.4 ? "Cash" : roll < 0.75 ? "QR" : "Card";
        let received = null;

        if (method === "Cash") {   // exact money, or the next RM 10 / RM 50 note
            const choice = random();
            received = choice < 0.2 ? total
                : choice < 0.75 ? Math.ceil((total + 0.01) / 10) * 10
                : Math.ceil((total + 0.01) / 50) * 50;
        }

        return {
            customer: nextCustomer(),
            date: today.toLocaleDateString("en-GB"),
            createdAt: createdAt,
            status: status,
            items: items,
            total: total,
            payments: [makePayment(method, total, received, createdAt)]
        };
    }

    // The last orders of the night, still in the kitchen
    const list = [
        order(now - 13 * minute, "Preparing", pickItems(true)),   // running late
        order(now - 8 * minute,  "Preparing", pickItems(true)),
        order(now - 5 * minute,  "Pending",   pickItems(true)),
        order(now - 2 * minute,  "Pending",   pickItems(true))
    ];

    // Completed orders through the day until it reaches today's target
    const target = todaysSalesTarget();
    let total = list.reduce(function(sum, item) { return sum + item.total; }, 0);

    while (total < target - 15) {
        const createdAt = pickTime();
        const late = createdAt > now - 120 * minute;   // the cakes ran out in the last two hours
        const done = order(createdAt, "Completed", pickItems(late));
        list.push(done);
        total += done.total;
    }

    // Oldest first, numbered ORD001, ORD002...
    return list
        .sort(function(a, b) { return a.createdAt - b.createdAt; })
        .map(function(item, index) { return Object.assign({ id: index + 1 }, item); });
}

let orders = loadSavedData("ruangRasaOrders", null);

// First visit (or after "Reset demo data"): save the samples once,
// so their times stay fixed instead of restarting on every page load
if (orders === null) {
    orders = sampleOrders();
    try { saveOrders(); } catch (error) { /* storage blocked */ }
} else {
    // Older saved orders still point at the old .jpg photos
    let changed = false;

    orders.forEach(function(order) {
        (order.items || []).forEach(function(item) {
            const upgraded = upgradeImagePath(item.image);
            if (upgraded !== item.image) { item.image = upgraded; changed = true; }
        });
    });

    if (changed) {
        try { saveOrders(); } catch (error) { /* storage blocked */ }
    }
}


// ======================================
// 7. SALES HISTORY (demo data for the charts)
// Past days are kept as one summary per day, like a till's
// end-of-day report, instead of thousands of separate orders:
//   { date: "dd/mm/yyyy", orders: 52, total: 1612,
//     payments: { Cash: [amount, orders], Card: [...], QR: [...] },
//     items: { "Nasi Lemak": 9, ... } }
// The charts and report cards add these days to the live orders.
// The order lists only show live orders.
// ======================================


function sampleSalesHistory() {

    const random = makeRandom(20261114);
    const dishes = weightedDishes();

    const today = new Date();
    const targets = HISTORY_MONTH_TARGETS.concat([HISTORY_THIS_MONTH_TARGET]);
    const days = [];

    targets.forEach(function(monthTarget, index) {

        const monthsAgo = targets.length - 1 - index;
        const first = new Date(today.getFullYear(), today.getMonth() - monthsAgo, 1);
        const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();

        // Busier at weekends, plus a little day-to-day variation
        const weights = [];
        for (let day = 1; day <= daysInMonth; day++) {
            const busy = dayBusyness(new Date(first.getFullYear(), first.getMonth(), day));
            weights.push(busy * (0.88 + random() * 0.24));
        }
        const weightSum = weights.reduce(function(sum, w) { return sum + w; }, 0);

        for (let day = 1; day <= daysInMonth; day++) {

            const date = new Date(first.getFullYear(), first.getMonth(), day);
            if (date >= new Date(today.getFullYear(), today.getMonth(), today.getDate())) break;   // up to yesterday

            const dayTarget = monthTarget * weights[day - 1] / weightSum;
            const summary = {
                date: date.toLocaleDateString("en-GB"),
                orders: 0,
                total: 0,
                payments: { Cash: [0, 0], Card: [0, 0], QR: [0, 0] },
                items: {}
            };

            // Ring up orders until the day reaches its target
            while (summary.total < dayTarget - 15) {

                let orderTotal = 0;
                const used = [];
                const dishCount = 1 + Math.floor(random() * 3);

                while (used.length < dishCount) {
                    const dish = dishes[Math.floor(random() * dishes.length)];
                    if (used.includes(dish.name)) continue;
                    used.push(dish.name);
                    const quantity = random() < 0.7 ? 1 : 2;
                    summary.items[dish.name] = (summary.items[dish.name] || 0) + quantity;
                    orderTotal += dish.price * quantity;
                }

                const roll = random();
                const method = roll < 0.45 ? "Cash" : roll < 0.8 ? "QR" : "Card";
                summary.payments[method][0] += orderTotal;
                summary.payments[method][1] += 1;
                summary.orders += 1;
                summary.total += orderTotal;
            }

            days.push(summary);
        }
    });

    return days;
}

function saveSalesHistory() {
    try {
        localStorage.setItem("ruangRasaSalesHistory", JSON.stringify(salesHistory));
    } catch (error) { /* storage full or blocked: the charts still work this visit */ }
}

let salesHistory = loadSavedData("ruangRasaSalesHistory", null);

if (salesHistory === null) {
    salesHistory = sampleSalesHistory();
    saveSalesHistory();
}

// Past days in one calendar month (month is 0-11)
function historyForMonth(year, month) {
    return salesHistory.filter(function(day) {
        const parts = String(day.date).split("/");
        return Number(parts[1]) - 1 === month && Number(parts[2]) === year;
    });
}

// Totals across every past day: { orders, total, payments, items }
function historyTotals() {

    const totals = { orders: 0, total: 0, payments: { Cash: [0, 0], Card: [0, 0], QR: [0, 0] }, items: {} };

    salesHistory.forEach(function(day) {
        totals.orders += day.orders;
        totals.total += day.total;
        Object.keys(day.payments || {}).forEach(function(method) {
            if (!totals.payments[method]) totals.payments[method] = [0, 0];
            totals.payments[method][0] += day.payments[method][0];
            totals.payments[method][1] += day.payments[method][1];
        });
        Object.keys(day.items || {}).forEach(function(name) {
            totals.items[name] = (totals.items[name] || 0) + day.items[name];
        });
    });

    return totals;
}
