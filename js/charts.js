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
