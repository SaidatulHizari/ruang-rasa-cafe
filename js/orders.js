// ======================================
// RUANG RASA CAFE - ORDERS PAGE
// Only loaded on orders.html. Needs ui.js and data.js.
// ======================================

// ======================================
// 1. ORDER PAGE: TAP-TO-ADD MENU GRID
// ======================================

let posCategory = "All";
let posKeyword = "";

// Kept with the old name so Add/Edit/Delete Menu can still call it
function populateOrderMenu() {
    renderPosCategories();
    renderPosMenu();
}


// Category chips: "All" + every category that has items

function renderPosCategories() {

    const container = document.getElementById("posCategories");

    if (!container) return;

    const categories = ["All"].concat(menuCategories.filter(function(category) {
        return menuItems.some(function(item) {
            return item.category === category;
        });
    }));

    container.innerHTML = categories.map(function(category) {

        const count = category === "All"
            ? menuItems.length
            : menuItems.filter(function(item) {
                return item.category === category;
            }).length;

        return `
            <button type="button"
                class="chip ${category === posCategory ? "active" : ""}"
                data-category="${escapeHTML(category)}"
                role="tab"
                aria-selected="${category === posCategory}">
                ${escapeHTML(category)}<span class="chip-count">${count}</span>
            </button>
        `;

    }).join("");

    container.querySelectorAll(".chip").forEach(function(chip) {

        chip.addEventListener("click", function() {
            posCategory = chip.dataset.category;
            renderPosCategories();
            renderPosMenu();
        });

    });
}


// Sold out is switched on in Menu Management
function isSoldOut(menuId) {
    const item = menuItems.find(function(menu) {
        return Number(menu.id) === Number(menuId);
    });
    return Boolean(item && item.soldOut);
}


// Dish cards. One tap = add one to the cart.

function renderPosMenu() {

    const grid = document.getElementById("posMenuGrid");

    if (!grid) return;

    const visibleItems = menuItems.filter(function(item) {

        const matchesCategory =
            posCategory === "All" || item.category === posCategory;

        const matchesKeyword =
            item.name.toLowerCase().includes(posKeyword);

        return matchesCategory && matchesKeyword;
    });

    if (visibleItems.length === 0) {

        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="bi bi-search empty-icon" aria-hidden="true"></i>
                <p>No dishes match "${escapeHTML(posKeyword)}".</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = visibleItems.map(function(item) {

        const inCart = cart.find(function(cartItem) {
            return Number(cartItem.id) === Number(item.id);
        });

        if (item.soldOut) {
            return `
                <button type="button" class="pos-item sold-out" data-id="${item.id}"
                    aria-disabled="true"
                    aria-label="${escapeHTML(item.name)}, sold out">

                    <span class="sold-out-badge">Sold out</span>

                    <img src="${escapeHTML(item.image || FALLBACK_IMAGE)}"
                        alt=""
                        loading="lazy"
                        onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}';">

                    <div class="pos-item-info">
                        <div class="pos-item-name">${escapeHTML(item.name)}</div>
                        <div class="pos-item-price">${formatRM(item.price)}</div>
                    </div>
                </button>
            `;
        }

        return `
            <button type="button"
                class="pos-item ${inCart ? "in-cart" : ""}"
                data-id="${item.id}"
                aria-label="Add ${escapeHTML(item.name)}, ${formatRM(item.price)}">

                ${inCart ? `<span class="pos-qty-badge">${inCart.quantity}</span>` : ""}

                <img src="${escapeHTML(item.image || FALLBACK_IMAGE)}"
                    alt=""
                    loading="lazy"
                    onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}';">

                <div class="pos-item-info">
                    <div class="pos-item-name">${escapeHTML(item.name)}</div>
                    <div class="pos-item-price">${formatRM(item.price)}</div>
                </div>

            </button>
        `;

    }).join("");
}


// One click listener for the whole grid (works for re-rendered cards too)

const posMenuGrid = document.getElementById("posMenuGrid");

if (posMenuGrid) {

    posMenuGrid.addEventListener("click", function(event) {

        const card = event.target.closest(".pos-item");

        if (!card) return;

        addToCart(Number(card.dataset.id));
    });
}

const posSearch = document.getElementById("posSearch");

if (posSearch) {

    posSearch.addEventListener("input", function() {
        posKeyword = this.value.trim().toLowerCase();
        renderPosMenu();
    });
}


// ======================================
// 2. SHOPPING CART
// ======================================

let cart = [];

// When changing an order that was already placed (see section 4)
let editingOrderId = null;   // null = making a new order
let editingMode = null;      // "edit" (Pending) or "add" (Preparing)


// A sold-out dish in the cart is a problem, unless it was already
// in the order being edited (that portion was sold before it ran out)
function soldOutProblem(cartItem) {
    return isSoldOut(cartItem.id) && cartItem.quantity > (cartItem.originalQty || 0);
}


// Add one portion of a dish to the cart

function addToCart(menuId) {

    const selectedItem = menuItems.find(function(item) {
        return Number(item.id) === Number(menuId);
    });

    if (!selectedItem) {
        showToast("This menu item is no longer available.", "error");
        return;
    }

    if (selectedItem.soldOut) {
        showToast(`${selectedItem.name} is sold out.`, "info");
        return;
    }

    const existingItem = cart.find(function(item) {
        return Number(item.id) === Number(menuId);
    });

    if (existingItem) {

        existingItem.quantity += 1;

    } else {

        cart.push({
            id: selectedItem.id,
            name: selectedItem.name,
            price: Number(selectedItem.price),
            image: selectedItem.image,
            quantity: 1
        });

    }

    displayCart();

    // Small "bump" so staff can see the tap registered
    const card = document.querySelector(`.pos-item[data-id="${menuId}"]`);

    if (card) {
        card.classList.add("pos-added");
        setTimeout(function() {
            card.classList.remove("pos-added");
        }, 300);
    }
}


// Display Shopping Cart

function displayCart() {

    const cartList = document.getElementById("cartList");
    const cartTotal = document.getElementById("cartTotal");

    if (!cartList || !cartTotal) return;

    const itemCount = cart.reduce(function(sum, item) {
        return sum + item.quantity;
    }, 0);

    const total = calculateCartTotal();
    const countLabel = itemCount + (itemCount === 1 ? " item" : " items");

    // Header pill, total, buttons
    const cartCount = document.getElementById("cartCount");
    const placeOrderBtn = document.getElementById("placeOrderBtn");
    const clearCartBtn = document.getElementById("clearCartBtn");

    if (cartCount) cartCount.textContent = countLabel;
    if (placeOrderBtn) placeOrderBtn.disabled = cart.length === 0;
    if (clearCartBtn) clearCartBtn.style.visibility = cart.length ? "visible" : "hidden";

    cartTotal.textContent = formatRM(total);

    // Mobile floating bar
    const mobileBar = document.getElementById("mobileCartBar");

    if (mobileBar) {
        mobileBar.classList.toggle("hidden", cart.length === 0);
        document.body.classList.toggle("has-cart-bar", cart.length > 0);
        document.getElementById("mobileCartCount").textContent = countLabel;
        document.getElementById("mobileCartTotal").textContent = formatRM(total);
    }

    // Cart rows
    if (cart.length === 0) {

        cartList.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-cart3 empty-icon" aria-hidden="true"></i>
                <p>Cart is empty.<br>Tap a dish on the left to start.</p>
            </div>
        `;

    } else {

        cartList.innerHTML = cart.map(function(item) {

            return `
                <div class="cart-row">

                    <img src="${escapeHTML(item.image || FALLBACK_IMAGE)}"
                        alt=""
                        onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}';">

                    <div class="cart-row-info">
                        <div class="cart-row-name">${escapeHTML(item.name)}</div>
                        ${soldOutProblem(item)
                            ? `<div class="cart-sold-out"><i class="bi bi-exclamation-circle" aria-hidden="true"></i> Sold out, please remove</div>`
                            : `<div class="cart-row-price">${formatRM(item.price)} each</div>`}
                    </div>

                    <div class="qty-stepper">
                        <button type="button"
                            aria-label="Remove one ${escapeHTML(item.name)}"
                            onclick="changeCartQuantity(${item.id}, -1)">−</button>
                        <span>${item.quantity}</span>
                        <button type="button"
                            aria-label="Add one ${escapeHTML(item.name)}"
                            onclick="changeCartQuantity(${item.id}, 1)">+</button>
                    </div>

                    <div class="cart-row-subtotal">
                        ${formatRM(item.price * item.quantity)}
                    </div>

                </div>
            `;

        }).join("");

    }

    updateEditUI();
    updatePaymentUI();

    // Keep the quantity badges on the menu cards in sync
    renderPosMenu();
}


// Empty the whole cart

function clearCart() {

    if (cart.length === 0) return;

    confirmDialog({
        title: "Clear the cart?",
        message: "All items in the current order will be removed.",
        confirmText: "Clear cart",
        danger: true
    }).then(function(confirmed) {

        if (!confirmed) return;

        cart = [];
        displayCart();
    });
}


// Change Cart Quantity

function changeCartQuantity(id, amount) {

    const item = cart.find(function(food) {
        return Number(food.id) === Number(id);
    });

    if (!item) return;

    if (amount > 0 && isSoldOut(id) && item.quantity >= (item.originalQty || 0)) {
        showToast(`${item.name} is sold out.`, "info");
        return;
    }

    item.quantity += amount;

    if (item.quantity <= 0) {
        removeFromCart(id);
        return;
    }

    displayCart();

}


// Remove Item from Cart

function removeFromCart(id) {

    cart = cart.filter(function(item) {
        return Number(item.id) !== Number(id);
    });

    displayCart();

}


// Calculate Cart Total

function calculateCartTotal() {

    return cart.reduce(function(total, item) {
        return total + (item.price * item.quantity);
    }, 0);

}




// ======================================
// 3. ORDER LIST (table, place / update / delete order)
// ======================================

// Display Orders

let orderStatusFilter = "All";
let orderKeyword = "";

function displayOrders(items) {

    const orderTable = document.getElementById("orderTable");

    if (!orderTable) return;

    // Default: apply the current search + status filter
    if (!items) {
        items = orders.filter(function(order) {

            const matchesStatus =
                orderStatusFilter === "All" || order.status === orderStatusFilter;

            const matchesKeyword =
                String(order.customer).toLowerCase().includes(orderKeyword);

            return matchesStatus && matchesKeyword;
        });
    }

    // Newest orders first
    items = items.slice().sort(function(a, b) {
        return Number(b.id) - Number(a.id);
    });

    updateOrderSummary();

    if (items.length === 0) {

        const filtering = orderKeyword || orderStatusFilter !== "All";

        orderTable.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">
                        <i class="bi bi-${filtering ? "search" : "receipt"} empty-icon" aria-hidden="true"></i>
                        <p>${filtering
                            ? "No orders match this filter."
                            : "No orders yet. Create the first one above."}</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    orderTable.innerHTML = items.map(function(order) {

        const statusClass = String(order.status).toLowerCase();

        const foodItems = (order.items || []).map(function(item) {

            return `
                <div class="d-flex align-items-center gap-2 mb-1">
                    <img src="${escapeHTML(item.image || FALLBACK_IMAGE)}"
                        class="food-img"
                        loading="lazy"
                        alt=""
                        onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}';">
                    <span>${escapeHTML(item.name)} × ${item.quantity}</span>
                    ${item.addedAt ? `<span class="added-tag">added</span>` : ""}
                </div>
            `;

        }).join("");

        // Pending: change anything. Preparing: add only. Completed: locked.
        const editButton =
            order.status === "Pending"
                ? `<button class="btn btn-sm btn-outline-secondary"
                        onclick="startEditOrder(${order.id})">
                        <i class="bi bi-pencil" aria-hidden="true"></i> Edit
                    </button>`
            : order.status === "Preparing"
                ? `<button class="btn btn-sm btn-outline-secondary"
                        onclick="startEditOrder(${order.id})">
                        <i class="bi bi-plus-lg" aria-hidden="true"></i> Add items
                    </button>`
            : "";

        const statusOptions = ["Pending", "Preparing", "Completed"].map(function(status) {
            return `<option value="${status}" ${order.status === status ? "selected" : ""}>${status}</option>`;
        }).join("");

        return `
            <tr data-order-id="${order.id}" class="${Number(order.id) === Number(editingOrderId) ? "row-editing" : ""}">
                <td data-label="Order ID">ORD${String(order.id).padStart(3, "0")}</td>

                <td data-label="Customer"><strong>${escapeHTML(order.customer)}</strong></td>

                <td data-label="Food Items" class="td-wide">${foodItems}</td>

                <td data-label="Date" class="text-nowrap">${escapeHTML(order.date)}</td>

                <td data-label="Total" class="text-nowrap">
                    <span>
                        <strong>${formatRM(order.total)}</strong>
                        <span class="d-block">${paymentTagHTML(order)}</span>
                    </span>
                </td>

                <td data-label="Status">
                    <select class="form-select status-select ${statusClass}"
                        aria-label="Order status"
                        onchange="updateOrderStatus(${order.id}, this.value)">
                        ${statusOptions}
                    </select>
                </td>

                <td class="text-nowrap td-actions">
                    ${editButton}

                    <button class="btn btn-sm btn-outline-secondary"
                        onclick="printReceipt(${order.id})">
                        <i class="bi bi-printer" aria-hidden="true"></i> Receipt
                    </button>

                    <button class="btn btn-sm btn-outline-danger"
                        aria-label="Delete order"
                        onclick="deleteOrder(${order.id})">
                        <i class="bi bi-trash3" aria-hidden="true"></i>
                    </button>
                </td>
            </tr>
        `;

    }).join("");
}


// Place Order

function placeOrder() {

    const customerInput = document.getElementById("customerName");

    if (!customerInput) return;

    if (cart.length === 0) {
        showToast(
            editingMode === "edit"
                ? "An order needs at least one dish. To cancel it, delete the order instead."
                : "Add at least one dish to the cart first.",
            "info"
        );
        return;
    }

    // A dish may have sold out after it went into the cart
    const soldOutInCart = cart.filter(soldOutProblem);

    if (soldOutInCart.length > 0) {
        showToast(
            soldOutInCart.map(function(item) { return item.name; }).join(", ") +
            " sold out. Remove it from the cart first.",
            "error"
        );
        return;
    }

    if (!customerInput.value.trim()) {
        setFieldError(customerInput, "Please enter the customer's name.");
        customerInput.focus();
        return;
    }

    // Changing an order that was already placed
    if (editingOrderId !== null) {
        saveOrderChanges();
        return;
    }

    const payment = takePayment();

    if (payment === false) return;   // e.g. not enough cash

    const newOrder = {

        // Next number after the highest id, so it shows as ORD005, ORD006...
        id: orders.reduce(function(max, order) {
            return Math.max(max, Number(order.id) || 0);
        }, 0) + 1,
        customer: customerInput.value.trim(),
        date: new Date().toLocaleDateString("en-GB"),
        createdAt: Date.now(),   // used by the kitchen screen timers
        total: calculateCartTotal(),
        status: "Pending",
        payments: payment ? [payment] : [],

        items: cart.map(function(item) {

            return {
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                image: item.image
            };

        })

    };

    orders.push(newOrder);

    // Before saving, so other open pages see it was already rung (js/ui.js)
    playAlertSound("new", "new:" + newOrder.id);

    saveOrders();

    cart = [];
    resetPayment();

    displayCart();
    displayOrders();

    customerInput.value = "";
    clearFieldError(customerInput);

    showToast(
        `Order for ${newOrder.customer} placed · ${formatRM(newOrder.total)}${paymentToastText(payment)}`,
        "success"
    );

}


// Update Order Status

function updateOrderStatus(id, newStatus) {

    const order = orders.find(function(item) {
        return Number(item.id) === Number(id);
    });

    if (order) {

        order.status = newStatus;

        if (newStatus === "Completed") playAlertSound("ready", "ready:" + order.id);

        saveOrders();
        displayOrders();

        showToast(`${order.customer}'s order is now ${newStatus}.`, "success");

        syncEditWithOrders();

    }

}


// Delete Order

function deleteOrder(id) {

    const order = orders.find(function(item) {
        return Number(item.id) === Number(id);
    });

    if (!order) return;

    confirmDialog({
        title: "Delete this order?",
        message: `${order.customer}'s order (${formatRM(order.total)}) will be permanently removed.`,
        confirmText: "Delete order",
        danger: true
    }).then(function(confirmed) {

        if (!confirmed) return;

        orders = orders.filter(function(item) {
            return Number(item.id) !== Number(id);
        });

        saveOrders();
        displayOrders();

        showToast("Order deleted.", "success");

        syncEditWithOrders();
    });

}


// Search + status filter for the order list

const searchOrder = document.getElementById("searchOrder");

if (searchOrder) {

    searchOrder.addEventListener("input", function() {
        orderKeyword = this.value.trim().toLowerCase();
        displayOrders();
    });

}

const orderStatusChips = document.getElementById("orderStatusFilter");

if (orderStatusChips) {

    orderStatusChips.addEventListener("click", function(event) {

        const chip = event.target.closest(".chip");

        if (!chip) return;

        orderStatusFilter = chip.dataset.status;

        orderStatusChips.querySelectorAll(".chip").forEach(function(button) {
            button.classList.toggle("active", button === chip);
        });

        displayOrders();
    });

}


// ======================================
// 4. PRINT RECEIPT
// ======================================

function printReceipt(id) {

    const order = orders.find(function(item) {
        return Number(item.id) === Number(id);
    });

    if (!order) {
        showToast("Order not found.", "error");
        return;
    }

    const receiptItems = order.items.map(function(item) {

        const price = Number(item.price) || 0;
        const subtotal = price * item.quantity;

        return `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${formatRM(price)}</td>
                <td>${formatRM(subtotal)}</td>
            </tr>
        `;

    }).join("");

    // Payment lines: how it was paid, cash + change, any refund
    const paymentRows = (order.payments || []).map(function(payment) {

        const label = escapeHTML(paymentMethodInfo(payment.method).label);

        if (payment.amount < 0) {
            return `<tr><td>Refund (${label})</td><td>- ${formatRM(-payment.amount)}</td></tr>`;
        }

        let rows = `<tr><td>Paid by ${label}</td><td>${formatRM(payment.amount)}</td></tr>`;

        if (payment.received !== undefined) {
            rows += `
                <tr class="sub"><td>Cash received</td><td>${formatRM(payment.received)}</td></tr>
                <tr class="sub"><td>Change</td><td>${formatRM(payment.change)}</td></tr>
            `;
        }

        return rows;

    }).join("");

    const receiptWindow = window.open(
        "",
        "_blank",
        "width=800,height=700"
    );

    if (!receiptWindow) {
        showToast("Please allow pop-ups to print the receipt.", "error");
        return;
    }

    const receiptHTML = `

        <!DOCTYPE html>
        <html>

        <head>

            <meta charset="UTF-8">
            <!-- Without this a phone shows the receipt as a tiny desktop page -->
            <meta name="viewport" content="width=device-width, initial-scale=1.0">

            <title>Receipt - Ruang Rasa Café</title>

            <style>

                body {
                    font-family: Arial, sans-serif;
                    padding: 35px;
                    color: #333;
                }

                .receipt {
                    max-width: 600px;
                    margin: auto;
                    padding: 30px;
                    border: 1px solid #ddd;
                }

                h1 {
                    text-align: center;
                    color: #795548;
                    margin-bottom: 5px;
                }

                .subtitle {
                    text-align: center;
                    color: #777;
                    margin-bottom: 25px;
                }

                .details {
                    margin-bottom: 25px;
                    line-height: 1.8;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }

                th, td {
                    padding: 12px 5px;
                    border-bottom: 1px solid #ddd;
                    text-align: left;
                }

                th {
                    background: #f1e8dc;
                    color: #5c4033;
                }

                .total {
                    text-align: right;
                    margin-top: 25px;
                    font-size: 20px;
                    font-weight: bold;
                    color: #5c4033;
                }

                .payments {
                    width: auto;
                    margin: 10px 0 0 auto;
                }

                .payments td {
                    padding: 4px 0 4px 30px;
                    border: none;
                    text-align: right;
                }

                .payments .sub td {
                    color: #777;
                    font-size: 14px;
                }

                .thank-you {
                    text-align: center;
                    margin-top: 35px;
                    color: #795548;
                }

                .print-button {
                    display: block;
                    margin: 25px auto 0;
                    padding: 12px 25px;
                    background: #795548;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                }

                @media (max-width: 576px) {
                    body {
                        padding: 12px;
                    }

                    .receipt {
                        padding: 18px 14px;
                    }

                    th, td {
                        padding: 10px 3px;
                        font-size: 14px;
                    }

                    .print-button {
                        width: 100%;
                    }
                }

                @media print {
                    body {
                        padding: 0;
                    }

                    .receipt {
                        border: none;
                    }

                    .print-button {
                        display: none;
                    }
                }

            </style>

        </head>

        <body>

            <div class="receipt">

                <h1>Ruang Rasa Café</h1>

                <p class="subtitle">
                    Thank you for dining with us!
                </p>

                <div class="details">

                    <strong>Order ID:</strong>
                    ORD${String(order.id).padStart(3, "0")}<br>

                    <strong>Customer:</strong>
                    ${order.customer}<br>

                    <strong>Date:</strong>
                    ${order.date}<br>

                    <strong>Status:</strong>
                    ${order.status}

                </div>

                <table>

                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${receiptItems}
                    </tbody>

                </table>

                <div class="total">
                    Total: ${formatRM(order.total)}
                </div>

                ${paymentRows ? `<table class="payments"><tbody>${paymentRows}</tbody></table>` : ""}

                <div class="thank-you">

                    <h3>Thank You!</h3>
                    <p>We hope to serve you again.</p>

                </div>

                <button class="print-button" onclick="window.print()">
                    Print Receipt
                </button>

            </div>

        </body>

        </html>

    `;

    receiptWindow.document.write(receiptHTML);
    receiptWindow.document.close();

}


// ======================================
// 5. ORDER SUMMARY CARDS
// ======================================

function updateOrderSummary() {

    const total = document.getElementById("totalOrders");
    const pending = document.getElementById("pendingOrders");
    const preparing = document.getElementById("preparingOrders");
    const completed = document.getElementById("completedOrders");

    if (total) {
        total.textContent = orders.length;
    }

    if (pending) {
        pending.textContent = orders.filter(function(order) {
            return order.status === "Pending";
        }).length;
    }

    if (preparing) {
        preparing.textContent = orders.filter(function(order) {
            return order.status === "Preparing";
        }).length;
    }

    if (completed) {
        completed.textContent = orders.filter(function(order) {
            return order.status === "Completed";
        }).length;
    }

}



// ======================================
// 6. CHANGE AN ORDER AFTER IT WAS PLACED
// Rule (same as a real café):
//   Pending   -> change anything (kitchen hasn't started)
//   Preparing -> add items only (can't un-cook food);
//                the kitchen ticket marks them NEW
//   Completed -> locked, make a new order
// The normal cart is reused, so there's no extra form.
// ======================================

function findOrder(id) {
    return orders.find(function(order) {
        return Number(order.id) === Number(id);
    });
}

function orderLabel(order) {
    return "ORD" + String(order.id).padStart(3, "0");
}


// Edit / Add items button in the order list
function startEditOrder(id) {

    const order = findOrder(id);

    if (!order || order.status === "Completed") return;

    // Don't throw away a new order that is half-built
    const ask = cart.length > 0 && Number(editingOrderId) !== Number(id)
        ? confirmDialog({
            title: "Replace the current cart?",
            message: "The dishes in the cart will be removed so you can change this order.",
            confirmText: "Continue",
            icon: "pencil-square"
        })
        : Promise.resolve(true);

    ask.then(function(confirmed) {

        if (!confirmed) return;

        editingOrderId = order.id;
        editingMode = order.status === "Pending" ? "edit" : "add";

        // Edit: put the order's dishes in the cart. Add: start empty.
        cart = editingMode === "edit"
            ? (order.items || []).map(function(item, index) {

                // Orders store names, the cart needs menu ids
                const menuItem = menuItems.find(function(menu) {
                    return menu.name.toLowerCase() === String(item.name).toLowerCase();
                });

                return {
                    id: menuItem ? menuItem.id : -(index + 1),   // dish removed from menu
                    name: item.name,
                    price: Number(item.price),
                    image: item.image,
                    quantity: Number(item.quantity),
                    originalQty: Number(item.quantity),
                    addedAt: item.addedAt        // keep the kitchen's NEW mark
                };
            })
            : [];

        const customerInput = document.getElementById("customerName");
        customerInput.value = order.customer;
        clearFieldError(customerInput);

        // Extra dishes are usually paid the same way as the first bill
        resetPayment(lastPaymentMethod(order));

        displayCart();
        displayOrders();   // highlight the row being edited

        document.getElementById("cartPanel").scrollIntoView({ behavior: "smooth", block: "start" });
    });
}


// Back to making a new order
function cancelEdit() {

    editingOrderId = null;
    editingMode = null;
    cart = [];
    resetPayment();

    const customerInput = document.getElementById("customerName");
    if (customerInput) customerInput.value = "";

    displayCart();
    displayOrders();
}


// Banner, read-only list and button text for edit / add mode
function updateEditUI() {

    const banner = document.getElementById("editBanner");
    const bannerText = document.getElementById("editBannerText");
    const locked = document.getElementById("lockedItems");
    const placeOrderBtn = document.getElementById("placeOrderBtn");
    const clearCartBtn = document.getElementById("clearCartBtn");

    if (!banner || !locked || !placeOrderBtn) return;

    const order = editingOrderId !== null ? findOrder(editingOrderId) : null;

    // Add mode: the cart total is only the extra dishes
    const totalLabel = document.getElementById("cartTotalLabel");

    if (totalLabel) {
        totalLabel.innerHTML = order && editingMode === "add"
            ? `Adding<br><small class="text-muted">New total ${formatRM(Number(order.total || 0) + calculateCartTotal())}</small>`
            : "Total";
    }

    banner.hidden = !order;
    locked.hidden = !(order && editingMode === "add");
    document.getElementById("cartPanel").classList.toggle("is-editing", Boolean(order));

    if (!order) {
        placeOrderBtn.textContent = "Place Order";
        return;
    }

    bannerText.innerHTML = editingMode === "edit"
        ? `Editing <strong>${orderLabel(order)}</strong> · ${escapeHTML(order.customer)}`
        : `Adding to <strong>${orderLabel(order)}</strong> · ${escapeHTML(order.customer)}`;

    placeOrderBtn.textContent = editingMode === "edit" ? "Save changes" : "Add to order";

    // Edit mode may save an emptied cart (we explain why not)
    if (editingMode === "edit") placeOrderBtn.disabled = false;

    // Cancel already covers "start over"
    if (clearCartBtn) clearCartBtn.style.visibility = "hidden";

    if (editingMode === "add") {
        locked.innerHTML = `
            <div class="locked-title">
                <span><i class="bi bi-fire" aria-hidden="true"></i> Already cooking</span>
                <span>${formatRM(order.total)}</span>
            </div>
            <ul>
                ${(order.items || []).map(function(item) {
                    return `<li>${Number(item.quantity)}× ${escapeHTML(item.name)}</li>`;
                }).join("")}
            </ul>
            <small>New dishes you tap are added on top.</small>
        `;
    }
}


// Something changed the orders (kitchen tab, status dropdown, delete).
// Make sure the order being edited still allows what we're doing.
function syncEditWithOrders() {

    if (editingOrderId === null) return;

    const order = findOrder(editingOrderId);

    if (!order || order.status === "Completed") {
        cancelEdit();
        showToast(
            order ? "That order was just completed, so it can't be changed. Make a new order instead."
                  : "The order you were changing was deleted.",
            "info"
        );
        return;
    }

    // Kitchen started cooking while we were editing:
    // keep only the extra portions, as add-ons
    if (editingMode === "edit" && order.status === "Preparing") {

        const extras = cart
            .map(function(item) {
                return Object.assign({}, item, {
                    quantity: item.quantity - (item.originalQty || 0),
                    originalQty: 0,
                    addedAt: undefined
                });
            })
            .filter(function(item) { return item.quantity > 0; });

        cart = extras;
        editingMode = "add";

        displayCart();
        showToast("The kitchen just started this order, so you can only add dishes now.", "info");
        return;
    }

    displayCart();
}


// Save button while editing (called from placeOrder)
function saveOrderChanges() {

    // Read the latest copy first: the kitchen may have changed it in another tab
    orders = loadSavedData("ruangRasaOrders", orders);

    const order = findOrder(editingOrderId);
    const modeBefore = editingMode;

    syncEditWithOrders();

    // Status moved on: the cart was adjusted and the user was told.
    // Let them check it before saving.
    if (!order || editingMode !== modeBefore) {
        displayOrders();
        return;
    }

    // Worked out before the order changes: extra to collect, or a refund
    const payment = takePayment();

    if (payment === false) return;

    const customerInput = document.getElementById("customerName");
    const now = Date.now();

    if (payment) {
        payment.paidAt = now;
        if (!Array.isArray(order.payments)) {
            // Old order from before payments existed: record what it was worth
            order.payments = [{ method: "Unknown", amount: roundRM(order.total || 0), paidAt: order.createdAt || now }];
        }
        order.payments.push(payment);
    }

    order.customer = customerInput.value.trim();
    order.updatedAt = now;

    if (editingMode === "edit") {

        order.items = cart.map(function(item) {
            const saved = {
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                image: item.image
            };
            if (item.addedAt) saved.addedAt = item.addedAt;
            return saved;
        });

        order.total = calculateCartTotal();

    } else {

        // Add-ons go in as their own lines so the kitchen sees exactly what's new
        cart.forEach(function(item) {
            order.items.push({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                image: item.image,
                addedAt: now
            });
        });

        order.total = Number(order.total || 0) + calculateCartTotal();
    }

    saveOrders();   // the kitchen screen hears this and updates

    const message = editingMode === "edit"
        ? `${orderLabel(order)} updated · ${formatRM(order.total)}`
        : `Added to ${orderLabel(order)} · new total ${formatRM(order.total)}`;
    const paymentText = paymentToastText(payment);

    cancelEdit();
    showToast(message + paymentText, "success");
}


// ======================================
// 7. PAYMENT
// The customer pays when the order is placed (counter service).
// Changing an order later collects the difference, or refunds it.
// ======================================

let paymentMethod = "Cash";

// Money that changes hands for what's in the cart right now.
// Above 0 = collect, below 0 = give back.
function amountDue() {

    const order = editingOrderId !== null ? findOrder(editingOrderId) : null;

    if (!order) return roundRM(calculateCartTotal());

    const newTotal = editingMode === "edit"
        ? calculateCartTotal()
        : Number(order.total || 0) + calculateCartTotal();

    return roundRM(newTotal - amountPaid(order));
}

// Quick buttons for the notes customers usually hand over
function cashSuggestions(due) {

    const options = [due, Math.ceil(due / 10) * 10, Math.ceil(due / 50) * 50, Math.ceil(due / 100) * 100];

    return options.filter(function(value, index) {
        return options.indexOf(value) === index;
    });
}

function readCashReceived() {

    const input = document.getElementById("cashReceived");
    const value = input ? input.value.trim() : "";

    return value === "" || isNaN(Number(value)) ? null : roundRM(value);
}

function renderPayMethods() {

    const container = document.getElementById("payMethods");

    if (!container) return;

    container.innerHTML = PAYMENT_METHODS.map(function(method) {
        return `
            <label class="pay-method">
                <input type="radio" name="payMethod" value="${method.id}"
                    ${method.id === paymentMethod ? "checked" : ""}>
                <span><i class="bi bi-${method.icon}" aria-hidden="true"></i> ${method.label}</span>
            </label>
        `;
    }).join("");
}

// Called from displayCart(), so it follows every cart change
function updatePaymentUI() {

    const box = document.getElementById("paymentBox");
    const refundNote = document.getElementById("refundNote");

    if (!box || !refundNote) return;

    const order = editingOrderId !== null ? findOrder(editingOrderId) : null;
    const due = amountDue();

    // Changing an order: only show payment when there's more to collect
    box.hidden = Boolean(order) && due <= 0;

    document.getElementById("paymentTitle").textContent =
        order ? `Collect ${formatRM(due)} more` : "Payment";

    refundNote.hidden = !(order && due < 0);

    if (order && due < 0) {
        refundNote.innerHTML = `
            <i class="bi bi-arrow-return-left" aria-hidden="true"></i>
            Give back <strong>${formatRM(-due)}</strong> to the customer
            (${escapeHTML(paymentMethodInfo(lastPaymentMethod(order)).label)}).
        `;
    }

    // Cash: quick buttons + change
    const isCash = paymentMethod === "Cash";
    const received = readCashReceived();
    const changeBox = document.getElementById("cashChange");

    document.getElementById("cashFields").hidden = !isCash;

    document.getElementById("cashQuick").innerHTML = isCash && due > 0
        ? cashSuggestions(due).map(function(value) {
            return `
                <button type="button" class="chip" data-cash="${value}">
                    ${value === due ? "Exact" : formatRM(value)}
                </button>
            `;
        }).join("")
        : "";

    if (!isCash || due <= 0 || received === null) {
        changeBox.innerHTML = "";
    } else if (received < due) {
        changeBox.innerHTML = `<span class="cash-short">Short by ${formatRM(due - received)}</span>`;
    } else {
        changeBox.innerHTML = `Change <strong>${formatRM(received - due)}</strong>`;
    }
}

// Checks the payment and builds the record to save.
// Returns false if something is missing (the field shows why),
// null if no money changes hands, or the payment object.
function takePayment() {

    const order = editingOrderId !== null ? findOrder(editingOrderId) : null;
    const due = amountDue();

    if (due < 0) return makePayment(lastPaymentMethod(order), due);   // refund
    if (due === 0) return null;

    if (paymentMethod !== "Cash") return makePayment(paymentMethod, due);

    const input = document.getElementById("cashReceived");
    const received = readCashReceived();

    if (received === null) {
        setFieldError(input, `Enter the cash received (at least ${formatRM(due)}).`);
        input.focus();
        return false;
    }

    if (received < due) {
        setFieldError(input, `That's ${formatRM(due - received)} short of ${formatRM(due)}.`);
        input.focus();
        return false;
    }

    return makePayment("Cash", due, received);
}

// " · Card", " · Cash, change RM 2.00", " · Refund RM 5.00"
function paymentToastText(payment) {

    if (!payment) return "";
    if (payment.amount < 0) return ` · Refund ${formatRM(-payment.amount)}`;
    if (payment.change > 0) return ` · Cash, change ${formatRM(payment.change)}`;

    return " · " + paymentMethodInfo(payment.method).label;
}

function resetPayment(method) {

    paymentMethod = method || "Cash";

    const input = document.getElementById("cashReceived");

    if (input) {
        input.value = "";
        clearFieldError(input);
    }

    renderPayMethods();
}

(function setupPayment() {

    const methods = document.getElementById("payMethods");
    const quick = document.getElementById("cashQuick");
    const input = document.getElementById("cashReceived");

    if (!methods) return;

    methods.addEventListener("change", function(event) {
        paymentMethod = event.target.value;
        clearFieldError(input);
        updatePaymentUI();
        if (paymentMethod === "Cash") input.focus();
    });

    quick.addEventListener("click", function(event) {

        const button = event.target.closest("[data-cash]");

        if (!button) return;

        input.value = Number(button.dataset.cash).toFixed(2);
        clearFieldError(input);
        updatePaymentUI();
    });

    input.addEventListener("input", updatePaymentUI);

    renderPayMethods();
})();


// ======================================
// START
// ======================================

displayCart();
displayOrders();
populateOrderMenu();

// Links from the dashboard:
//   orders.html#orderList            -> "View All Orders": jump to the list
//   orders.html?order=68#orderList   -> a recent order row: jump to that
//                                       order and flash it so it's easy to spot
(function showLinkedOrder() {

    const params = new URLSearchParams(location.search);
    const id = params.get("order");
    const list = document.getElementById("orderList");

    let target = location.hash === "#orderList" ? list : null;
    let row = null;

    if (id) {
        // Drop "?order=" so a refresh doesn't flash the row again
        history.replaceState(null, "", location.pathname + location.hash);

        row = document.querySelector('#orderTable tr[data-order-id="' + Number(id) + '"]');

        if (row) {
            target = row;
        } else {
            showToast("That order no longer exists.", "info");
        }
    }

    if (!target) return;

    // "instant": the page has smooth scrolling on (from Bootstrap), and a
    // long smooth scroll on page load is slow and easily interrupted
    function scrollToTarget() {
        target.scrollIntoView({
            block: target === row ? "center" : "start",
            behavior: "instant"
        });
    }

    scrollToTarget();

    // Pictures above the list can push it down while loading,
    // so line it up again once the page has finished loading
    if (document.readyState !== "complete") {
        window.addEventListener("load", scrollToTarget, { once: true });
    }

    if (!row) return;

    row.classList.add("row-flash");
    row.addEventListener("animationend", function() {
        row.classList.remove("row-flash");
    }, { once: true });
})();

// The kitchen screen (kitchen.html) changes order statuses in another
// tab. The browser fires a "storage" event here when it does, so the
// list stays up to date without a refresh.
window.addEventListener("storage", function(event) {
    if (event.key === "ruangRasaOrders") {
        orders = loadSavedData("ruangRasaOrders", []);
        displayOrders();
        syncEditWithOrders();   // the kitchen may have started the order we're editing
    }

    // Dishes added, edited, deleted or sold out in Menu Management
    if (event.key === "ruangRasaMenuItems") {
        menuItems = loadSavedData("ruangRasaMenuItems", []);

        // A dish deleted from the menu can't be ordered any more, so take
        // it out of the cart. Dishes already in an order being edited stay,
        // because the customer has already ordered them.
        const removed = cart.filter(function(cartItem) {
            return !cartItem.originalQty && !menuItems.some(function(menu) {
                return Number(menu.id) === Number(cartItem.id);
            });
        });

        if (removed.length) {
            cart = cart.filter(function(cartItem) { return !removed.includes(cartItem); });
            showToast(removed.map(function(item) { return item.name; }).join(", ") +
                " was removed from the menu, so it was taken out of the cart.", "info");
        }

        renderPosCategories();   // chip counts
        displayCart();           // also redraws the dish grid
    }
});
