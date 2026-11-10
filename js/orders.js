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


// Add one portion of a dish to the cart

function addToCart(menuId) {

    const selectedItem = menuItems.find(function(item) {
        return Number(item.id) === Number(menuId);
    });

    if (!selectedItem) {
        showToast("This menu item is no longer available.", "error");
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
                        <div class="cart-row-price">${formatRM(item.price)} each</div>
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
                        alt=""
                        onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}';">
                    <span>${escapeHTML(item.name)} × ${item.quantity}</span>
                </div>
            `;

        }).join("");

        const statusOptions = ["Pending", "Preparing", "Completed"].map(function(status) {
            return `<option value="${status}" ${order.status === status ? "selected" : ""}>${status}</option>`;
        }).join("");

        return `
            <tr>
                <td>ORD${String(order.id).padStart(3, "0")}</td>

                <td><strong>${escapeHTML(order.customer)}</strong></td>

                <td>${foodItems}</td>

                <td class="text-nowrap">${escapeHTML(order.date)}</td>

                <td class="text-nowrap"><strong>${formatRM(order.total)}</strong></td>

                <td>
                    <select class="form-select status-select ${statusClass}"
                        aria-label="Order status"
                        onchange="updateOrderStatus(${order.id}, this.value)">
                        ${statusOptions}
                    </select>
                </td>

                <td class="text-nowrap">
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
        showToast("Add at least one dish to the cart first.", "info");
        return;
    }

    if (!customerInput.value.trim()) {
        setFieldError(customerInput, "Please enter the customer's name.");
        customerInput.focus();
        return;
    }

    const newOrder = {

        id: Date.now(),
        customer: customerInput.value.trim(),
        date: new Date().toLocaleDateString("en-GB"),
        total: calculateCartTotal(),
        status: "Pending",

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

    saveOrders();

    cart = [];

    displayCart();
    displayOrders();

    customerInput.value = "";
    clearFieldError(customerInput);

    showToast(`Order for ${newOrder.customer} placed · ${formatRM(newOrder.total)}`, "success");

}


// Update Order Status

function updateOrderStatus(id, newStatus) {

    const order = orders.find(function(item) {
        return Number(item.id) === Number(id);
    });

    if (order) {

        order.status = newStatus;

        saveOrders();
        displayOrders();

        showToast(`${order.customer}'s order is now ${newStatus}.`, "success");

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
// START
// ======================================

displayCart();
displayOrders();
populateOrderMenu();
