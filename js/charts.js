// ======================================
// RUANG RASA CAFE - CHART HELPERS
// Shared by dashboard.html and sales.html.
// Needs Chart.js, ui.js, data.js and theme.js to be loaded first.
// ======================================


// ======================================
// 1. COLOURS (light + dark theme)
// ======================================

const IS_DARK = currentTheme() === "dark";

const CHART_COLORS = {
    text:    IS_DARK ? "#cbbcae" : "#6d5a4c",
    grid:    IS_DARK ? "rgba(255,255,255,0.08)" : "#f0ebe5",
    surface: IS_DARK ? "#26201b" : "#ffffff",   // same as the card background
    accent:  IS_DARK ? "#c99a72" : "#a77c5b",
    accentStrong: IS_DARK ? "#e0b994" : "#49372d",

    // Bar charts that pick out one bar (busiest hour, busiest weekday).
    // Dark mode: calmer bars + a bright highlight, so the gap stays clear
    // (#8f6f58 is 3.5:1 on the card, the highlight is 3.1:1 against it).
    barNormal:    IS_DARK ? "#8f6f58" : "#a77c5b",
    barHighlight: IS_DARK ? "#f0cfa8" : "#49372d",
    barHover:     IS_DARK ? "#b48a6a" : "#8f6749",   // a normal bar under the mouse

    // Dashed "usual day" line drawn over today's bars (muted text colour)
    compareLine:  IS_DARK ? "#b5a596" : "#75665b",

    status: {
        Completed: "#6b9b72",
        Pending:   "#e5ad55",
        Preparing: "#7198c5"
    },

    // Five shades for the best-seller bars (lighter set for dark mode)
    browns: IS_DARK
        ? ["#e0b994", "#c99a72", "#b07f5a", "#d8b99b", "#9a6f50"]
        : ["#49372d", "#795548", "#a77c5b", "#c49a78", "#d8b99b"]
};

// Defaults for every Chart.js chart on the page
Chart.defaults.font.family = "Poppins, sans-serif";
Chart.defaults.color = CHART_COLORS.text;
Chart.defaults.borderColor = CHART_COLORS.grid;
Chart.defaults.plugins.legend.labels.usePointStyle = true;

// Charts measure their labels when first drawn. If the Poppins font is
// still loading, they measure the narrower fallback font and long labels
// get cut off ("urnt Cheesecake"). Chart.js remembers those widths by font
// name, so a plain redraw keeps the wrong size: forget them, then redraw.
if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function() {
        Object.values(Chart.instances).forEach(function(chart) {
            Object.values(chart.scales || {}).forEach(function(scale) {
                scale._longestTextCache = {};
                scale._labelSizes = null;
            });
            chart.update("none");
        });
    });
}


// ======================================
// 2. DATA HELPERS
// ======================================

// Orders store dates as "dd/mm/yyyy"
function parseOrderDate(dateString) {

    if (!dateString) return null;

    const parts = String(dateString).split("/");

    if (parts.length !== 3) return null;

    const date = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));

    return isNaN(date.getTime()) ? null : date;
}


// Sales total for each of the last `monthCount` months
// (live orders passed in, plus the past days in salesHistory)
// Returns { labels: ["Jun 26", ...], values: [0, 12.5, ...] }
function getMonthlySales(orderList, monthCount = 6) {

    const today = new Date();
    const labels = [];
    const values = [];

    for (let i = monthCount - 1; i >= 0; i--) {

        const month = new Date(today.getFullYear(), today.getMonth() - i, 1);

        labels.push(month.toLocaleDateString("en-GB", { month: "short", year: "2-digit" }));

        const total = orderList.reduce(function(sum, order) {

            const date = parseOrderDate(order.date);

            const sameMonth = date &&
                date.getMonth() === month.getMonth() &&
                date.getFullYear() === month.getFullYear();

            return sameMonth ? sum + Number(order.total || 0) : sum;

        }, 0);

        values.push(total + historyForMonth(month.getFullYear(), month.getMonth()).reduce(function(sum, day) {
            return sum + day.total;
        }, 0));
    }

    return { labels: labels, values: values };
}


// { Completed: 1, Pending: 1, Preparing: 1 }
function countByStatus(orderList) {

    const counts = { Completed: 0, Pending: 0, Preparing: 0 };

    orderList.forEach(function(order) {
        if (counts[order.status] !== undefined) counts[order.status] += 1;
    });

    return counts;
}


// Top dishes by quantity: [["Nasi Lemak", 2], ["Mi Goreng", 2], ...]
// (live orders plus the past days in salesHistory)
function getBestSellers(orderList, limit = 5) {

    const totals = {};

    orderList.forEach(function(order) {
        (order.items || []).forEach(function(item) {
            totals[item.name] = (totals[item.name] || 0) + Number(item.quantity || 0);
        });
    });

    const past = historyTotals().items;

    Object.keys(past).forEach(function(name) {
        totals[name] = (totals[name] || 0) + past[name];
    });

    return Object.entries(totals)
        .sort(function(a, b) { return b[1] - a[1]; })
        .slice(0, limit);
}


// ======================================
// 3. ORDER STATUS DONUT (used on both pages)
// ======================================

// Status counts for one month (month is 0-11).
// Past days in salesHistory were all completed and paid.
function statusCountsForMonth(orderList, year, month) {

    const counts = countByStatus(orderList.filter(function(order) {
        const date = parseOrderDate(order.date);
        return date && date.getFullYear() === year && date.getMonth() === month;
    }));

    historyForMonth(year, month).forEach(function(day) {
        counts.Completed += day.orders;
    });

    return counts;
}

// Donut of Completed / Pending / Preparing for one month,
// with a month picker (last 6 months, this month first)
function renderStatusDonut(containerId, orderList, monthCount = 6) {

    const container = document.getElementById(containerId);

    if (!container) return;

    const today = new Date();
    const months = [];

    for (let i = 0; i < monthCount; i++) {
        const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
        months.push({
            year: month.getFullYear(),
            month: month.getMonth(),
            label: month.toLocaleDateString("en-GB", { month: "long", year: "numeric" })
        });
    }

    const pickerId = containerId + "Month";

    container.innerHTML = `
        <div class="donut-month">
            <label class="visually-hidden" for="${pickerId}">Month</label>
            <select id="${pickerId}" class="form-select form-select-sm">
                ${months.map(function(m, index) {
                    return `<option value="${index}">${m.label}</option>`;
                }).join("")}
            </select>
        </div>
        <div class="donut-body" aria-live="polite"></div>
    `;

    const picker = container.querySelector("select");
    const body = container.querySelector(".donut-body");
    let chart = null;

    function draw() {

        const chosen = months[Number(picker.value)];
        const counts = statusCountsForMonth(orderList, chosen.year, chosen.month);
        const labels = Object.keys(counts);
        const total = labels.reduce(function(sum, status) { return sum + counts[status]; }, 0);

        if (chart) {
            chart.destroy();
            chart = null;
        }

        // An empty donut looks broken, so show a message instead
        if (total === 0) {
            body.innerHTML = emptyStateHTML("pie-chart", "No orders in " + chosen.label + ".");
            return;
        }

        // Canvas + "Total Orders" label in the middle of the ring,
        // and our own legend underneath (keeps the label centred)
        const legend = labels.map(function(status) {
            return `
                <span>
                    <i style="background:${CHART_COLORS.status[status]}"></i>
                    ${status} <b>${counts[status].toLocaleString("en-MY")}</b>
                </span>
            `;
        }).join("");

        body.innerHTML = `
            <div class="donut-wrap">
                <canvas role="img"
                    aria-label="Order status in ${chosen.label}: ${labels.map(function(s) { return counts[s] + " " + s; }).join(", ")}"></canvas>
                <div class="donut-center">
                    <strong>${total.toLocaleString("en-MY")}</strong>
                    <span>Orders in ${chosen.label.split(" ")[0]}</span>
                </div>
            </div>
            <div class="donut-legend">${legend}</div>
        `;

        chart = new Chart(body.querySelector("canvas"), {

            type: "doughnut",

            data: {
                labels: labels,
                datasets: [{
                    data: labels.map(function(status) { return counts[status]; }),
                    backgroundColor: labels.map(function(status) { return CHART_COLORS.status[status]; }),
                    borderColor: CHART_COLORS.surface,
                    borderWidth: 3,
                    hoverOffset: 6
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "68%",

                plugins: {
                    legend: {
                        display: false   // drawn in HTML above
                    },

                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const percent = Math.round(context.parsed / total * 100);
                                return " " + context.label + ": " + context.parsed.toLocaleString("en-MY") +
                                    " orders (" + percent + "%)";
                            }
                        }
                    }
                }
            }
        });
    }

    picker.addEventListener("change", draw);
    draw();
}


// ======================================
// 4. DAY-BY-DAY HELPERS (new charts on both pages)
// ======================================

// "dd/mm/yyyy" - the same format orders and salesHistory use
function dayKey(date) {
    return date.toLocaleDateString("en-GB");
}

// Every day we know about: { "17/11/2026": { total: 1234.5, orders: 40 }, ... }
// total = completed sales only; orders = every order placed.
// Past days come from salesHistory (all completed), today from live orders.
function salesByDay(orderList) {

    const days = {};

    function day(key) {
        if (!days[key]) days[key] = { total: 0, orders: 0 };
        return days[key];
    }

    salesHistory.forEach(function(past) {
        const entry = day(past.date);
        entry.total += past.total;
        entry.orders += past.orders;
    });

    orderList.forEach(function(order) {
        if (!parseOrderDate(order.date)) return;
        const entry = day(order.date);
        entry.orders += 1;
        if (order.status === "Completed") entry.total += Number(order.total || 0);
    });

    return days;
}

// The last `count` days, oldest first, today last
function lastDays(orderList, count = 7) {

    const days = salesByDay(orderList);
    const today = new Date();
    const result = [];

    for (let i = count - 1; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
        const entry = days[dayKey(date)] || { total: 0, orders: 0 };
        result.push({ date: date, total: entry.total, orders: entry.orders });
    }

    return result;
}

// Each day of one month (month is 0-11), up to today for the current month
function daysOfMonth(orderList, year, month) {

    const days = salesByDay(orderList);
    const today = new Date();
    const lastDay = (year === today.getFullYear() && month === today.getMonth())
        ? today.getDate()
        : new Date(year, month + 1, 0).getDate();

    const result = [];

    for (let d = 1; d <= lastDay; d++) {
        const date = new Date(year, month, d);
        const entry = days[dayKey(date)] || { total: 0, orders: 0 };
        result.push({ date: date, total: entry.total, orders: entry.orders });
    }

    return result;
}

// The café's opening hours: [8, 9, ... 21] (21 = 9pm-10pm)
function openingHours() {
    const hours = [];
    for (let h = CAFE_OPENS_AT; h < CAFE_CLOSES_AT; h++) hours.push(h);
    return hours;
}

// Orders placed in each opening hour today:
// { hours: [8, ...], counts: [3, ...], total: 55, afterHours: 0 }
// afterHours = today's orders outside opening hours (shown as a note)
function ordersByHourToday(orderList) {

    const today = dayKey(new Date());
    const hours = openingHours();
    const counts = {};
    let total = 0;
    let afterHours = 0;

    orderList.forEach(function(order) {
        if (order.date !== today || !order.createdAt) return;
        const hour = new Date(order.createdAt).getHours();
        total += 1;
        if (hour < CAFE_OPENS_AT || hour >= CAFE_CLOSES_AT) afterHours += 1;
        else counts[hour] = (counts[hour] || 0) + 1;
    });

    return {
        hours: hours,
        counts: hours.map(function(h) { return counts[h] || 0; }),
        total: total,
        afterHours: afterHours
    };
}

// A usual day: average orders in each opening hour over the last
// `dayCount` past days that have hourly figures (salesHistory).
// Returns { averages: [1.4, ...] } or null when there is no hourly history.
function usualDayByHour(dayCount = 28) {

    const recent = salesHistory
        .filter(function(day) { return day.hours; })
        .slice(-dayCount);

    if (recent.length === 0) return null;

    return {
        days: recent.length,
        averages: openingHours().map(function(h) {
            const sum = recent.reduce(function(total, day) { return total + (day.hours[h] || 0); }, 0);
            return Math.round(sum / recent.length * 10) / 10;
        })
    };
}

// 13 -> "1pm", 0 -> "12am"
function hourLabel(hour) {
    const h = hour % 12 === 0 ? 12 : hour % 12;
    return h + (hour < 12 ? "am" : "pm");
}

// Sales per menu category in one month: [["Rice", 12345.6], ...], biggest first.
// Past days only store how many of each dish sold, so they are priced
// at today's menu price. Dishes no longer on the menu go to "Other".
function salesByCategory(orderList, year, month) {

    const dishes = {};
    newMenuCollection.concat(menuItems).forEach(function(item) {
        dishes[item.name] = item;   // the saved menu wins over the built-in one
    });

    const totals = {};

    function add(name, amount) {
        const category = dishes[name] ? dishes[name].category : "Other";
        totals[category] = (totals[category] || 0) + amount;
    }

    orderList.forEach(function(order) {
        const date = parseOrderDate(order.date);
        if (order.status !== "Completed" || !date) return;
        if (date.getFullYear() !== year || date.getMonth() !== month) return;

        (order.items || []).forEach(function(item) {
            add(item.name, Number(item.price || 0) * Number(item.quantity || 0));
        });
    });

    historyForMonth(year, month).forEach(function(day) {
        Object.keys(day.items || {}).forEach(function(name) {
            const price = dishes[name] ? Number(dishes[name].price || 0) : 0;
            add(name, price * day.items[name]);
        });
    });

    return Object.entries(totals)
        .filter(function(entry) { return entry[1] > 0; })
        .sort(function(a, b) { return b[1] - a[1]; });
}

// Average sales for each weekday, Monday first:
// [{ label: "Mon", name: "Monday", average, days }, ...]
function weekdayAverages(dayList) {

    const names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const fullNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const sums = names.map(function() { return { total: 0, days: 0 }; });

    dayList.forEach(function(day) {
        const index = (day.date.getDay() + 6) % 7;   // getDay(): Sunday = 0
        sums[index].total += day.total;
        sums[index].days += 1;
    });

    return names.map(function(label, index) {
        const s = sums[index];
        return { label: label, name: fullNames[index], average: s.days ? s.total / s.days : 0, days: s.days };
    });
}

// "RM 12.3k" for tight axis labels
function shortRM(value) {
    return value >= 1000
        ? "RM " + (value / 1000).toLocaleString("en-MY", { maximumFractionDigits: 1 }) + "k"
        : "RM " + Math.round(value).toLocaleString("en-MY");
}


// ======================================
// 5. SPARKLINE (tiny 7-day trend inside a summary card)
// ======================================

// days: from lastDays(); field: "total" (RM) or "orders"
function drawSparkline(canvas, days, field) {

    if (!canvas) return null;

    const values = days.map(function(day) { return day[field]; });
    const isMoney = field === "total";

    function format(value) {
        return isMoney ? formatRM(value) : value.toLocaleString("en-MY") + " orders";
    }

    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", "Last 7 days: " + days.map(function(day, i) {
        return day.date.toLocaleDateString("en-GB", { weekday: "short" }) + " " + format(values[i]);
    }).join(", "));

    return new Chart(canvas, {

        type: "line",

        data: {
            labels: days.map(function(day, i) {
                return i === days.length - 1
                    ? "Today"
                    : day.date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
            }),
            datasets: [{
                data: values,
                borderColor: CHART_COLORS.accent,
                borderWidth: 2,
                tension: 0.35,
                fill: false,
                // Only the last point (today) gets a dot
                pointRadius: values.map(function(v, i) { return i === values.length - 1 ? 3 : 0; }),
                pointBackgroundColor: CHART_COLORS.accent,
                pointHoverRadius: 4,
                pointHitRadius: 12
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            layout: { padding: { top: 4, bottom: 4, left: 2, right: 4 } },
            interaction: { mode: "index", intersect: false },

            plugins: {
                legend: { display: false },
                tooltip: {
                    displayColors: false,
                    callbacks: {
                        label: function(context) { return format(context.parsed.y); }
                    }
                }
            },

            scales: {
                x: { display: false },
                y: { display: false }
            }
        }
    });
}
