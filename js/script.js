
// ======================================
// RUANG RASA CAFE MANAGEMENT SYSTEM
// ======================================


// ======================================
// 1. TOAST NOTIFICATION
// ======================================

function showToast(message, type = "success") {

    let container = document.getElementById("toastContainer");

    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";
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
        success: "✓",
        error: "✕",
        info: "ℹ"
    };

    const toast = document.createElement("div");
    toast.className = "custom-toast " + type;

    const icon = document.createElement("span");
    icon.className = "toast-icon";
    icon.textContent = icons[type] || "✓";

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
// 2. LOCAL STORAGE
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


// ======================================
// 3. LOGIN FUNCTION
// ======================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const errorMessage = document.getElementById("errorMessage");

        if (username === "admin" && password === "12345") {
            window.location.href = "dashboard.html";
        } else if (errorMessage) {
            errorMessage.textContent =
                "Invalid username or password. Please try again.";
        }
    });
}


// ======================================
// 4. MENU CATEGORIES
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
// 5. NEW MENU COLLECTION
// ======================================

const newMenuCollection = [

    // RICE

    {
        name: "Nasi Lemak",
        category: "Rice",
        price: 8.00,
        image: "images/nasi-lemak.jpg"
    },
    {
        name: "Nasi Ayam",
        category: "Rice",
        price: 10.00,
        image: "images/nasi-ayam.jpg"
    },
    {
        name: "Nasi Goreng Kampung",
        category: "Rice",
        price: 9.00,
        image: "images/nasi-goreng-kampung.jpg"
    },
    {
        name: "Nasi Goreng Cina",
        category: "Rice",
        price: 9.00,
        image: "images/nasi-goreng-cina.jpg"
    },
    {
        name: "Nasi Goreng Pattaya",
        category: "Rice",
        price: 10.00,
        image: "images/nasi-goreng-pattaya.jpg"
    },
    {
        name: "Nasi Goreng Seafood",
        category: "Rice",
        price: 13.00,
        image: "images/nasi-goreng-seafood.jpg"
    },
    {
        name: "Nasi Ayam Penyet",
        category: "Rice",
        price: 12.00,
        image: "images/nasi-ayam-penyet.jpg"
    },
    {
        name: "Nasi Goreng Tomyam",
        category: "Rice",
        price: 10.00,
        image: "images/nasi-goreng-tomyam.jpg"
    },

    // NOODLES

    {
        name: "Mi Goreng",
        category: "Noodles",
        price: 8.00,
        image: "images/mi-goreng.jpg"
    },
    {
        name: "Mi Kari",
        category: "Noodles",
        price: 9.00,
        image: "images/mi-kari.jpg"
    },
    {
        name: "Kuey Teow Goreng",
        category: "Noodles",
        price: 9.00,
        image: "images/kuey-teow-goreng.jpg"
    },

    // PASTA

    {
        name: "Spaghetti Carbonara",
        category: "Pasta",
        price: 16.00,
        image: "images/spaghetti-carbonara.jpg"
    },
    {
        name: "Spaghetti Bolognese",
        category: "Pasta",
        price: 15.00,
        image: "images/spaghetti-bolognese.jpg"
    },
    {
        name: "Aglio Olio",
        category: "Pasta",
        price: 16.00,
        image: "images/aglio-olio.jpg"
    },
    {
        name: "Creamy Chicken Mushroom Pasta",
        category: "Pasta",
        price: 18.00,
        image: "images/creamy-chicken-mushroom-pasta.jpg"
    },

    // WESTERN FOOD

    {
        name: "Chicken Chop",
        category: "Western Food",
        price: 18.00,
        image: "images/chicken-chop.jpg"
    },
    {
        name: "Crispy Chicken Chop",
        category: "Western Food",
        price: 19.00,
        image: "images/crispy-chicken-chop.jpg"
    },
    {
        name: "Fish and Chips",
        category: "Western Food",
        price: 18.00,
        image: "images/fish-and-chips.jpg"
    },
    {
        name: "Grilled Salmon",
        category: "Western Food",
        price: 28.00,
        image: "images/grilled-salmon.jpg"
    },
    {
        name: "Chicken Grill",
        category: "Western Food",
        price: 18.00,
        image: "images/chicken-grill.jpg"
    },
    {
        name: "Beef Steak",
        category: "Western Food",
        price: 30.00,
        image: "images/beef-steak.jpg"
    },

    // CAKES

    {
        name: "Chocolate Indulgence",
        category: "Cakes",
        price: 13.00,
        image: "images/chocolate-indulgence.jpg"
    },
    {
        name: "Red Velvet",
        category: "Cakes",
        price: 12.00,
        image: "images/red-velvet.jpg"
    },
    {
        name: "New York Cheesecake",
        category: "Cakes",
        price: 13.00,
        image: "images/new-york-cheesecake.jpg"
    }

];


// ======================================
// 6. LOAD AND PREPARE MENU DATA
// ======================================

let menuItems = loadSavedData("ruangRasaMenuItems", []);

function prepareMenuItems() {

    // Remove invalid old data safely

    menuItems = menuItems.filter(function(item) {

        return item &&
            typeof item.name === "string" &&
            item.name.trim() !== "";

    });

    // Fix old menu information

    menuItems.forEach(function(item) {

        if (
            item.name === "Mi Goreng" ||
            item.name === "Mee Goreng"
        ) {
            item.name = "Mi Goreng";
            item.image = "images/mi-goreng.jpg";
            item.category = "Noodles";
        }

        if (item.name === "Nasi Lemak") {
            item.image = "images/nasi-lemak.jpg";
            item.category = "Rice";
        }

        if (
            item.name === "Kek Coklat" ||
            item.name === "Chocolate Cake"
        ) {
            item.category = "Desserts";
        }

        if (!item.id) {
            item.id = Date.now() + Math.floor(Math.random() * 100000);
        }

        if (!item.image) {
            item.image =
                "https://placehold.co/600x400/f2e8df/916541?text=Food";
        }

    });

    // Add or update new menu collection

    newMenuCollection.forEach(function(newItem) {

        const existingItem = menuItems.find(function(item) {

            return item.name.toLowerCase() ===
                newItem.name.toLowerCase();

        });

        if (existingItem) {

            existingItem.category = newItem.category;
            existingItem.image = newItem.image;

        } else {

            menuItems.push({

                id: Date.now() + Math.floor(Math.random() * 100000),
                name: newItem.name,
                category: newItem.category,
                price: newItem.price,
                image: newItem.image

            });

        }

    });

    saveMenuItems();
}

prepareMenuItems();


// ======================================
// 7. DISPLAY MENU BY CATEGORY
// ======================================

function displayMenu(items = menuItems) {

    const menuTable = document.getElementById("menuTable");

    if (!menuTable) {
        console.error("Menu container #menuTable was not found.");
        return;
    }

    menuTable.innerHTML = "";

    const validItems = items.filter(function(item) {

        return item &&
            typeof item.name === "string" &&
            item.name.trim() !== "";

    });

    menuCategories.forEach(function(categoryName) {

        const categoryItems = validItems.filter(function(item) {

            return item.category === categoryName;

        });

        if (categoryItems.length === 0) return;

        const categorySection = document.createElement("section");
        categorySection.className = "category-section";

        categorySection.innerHTML = `
            <div class="category-heading">
                <h4>${categoryName}</h4>
                <span class="category-count">
                    ${categoryItems.length} items
                </span>
            </div>

            <div class="row g-4"></div>
        `;

        const categoryContainer =
            categorySection.querySelector(".row");

        categoryItems.forEach(function(item) {

            const imagePath = item.image ||
                "https://placehold.co/600x400/f2e8df/916541?text=Food";

            const price = Number(item.price) || 0;

            const menuCard = document.createElement("div");

            menuCard.className = "col-6 col-lg-4 col-xl-3";

            menuCard.innerHTML = `
                <div class="menu-card">

                    <img
                        src="${imagePath}"
                        alt="${item.name}"
                        loading="lazy"
                        onerror="this.onerror=null; this.src='https://placehold.co/600x400/f2e8df/916541?text=Image+Unavailable';"
                    >

                    <div class="menu-info">

                        <span class="category">
                            ${item.category}
                        </span>

                        <h5>${item.name}</h5>

                        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">

                            <span class="price">
                                RM ${price.toFixed(2)}
                            </span>

                            <div>

                                <button
                                    class="btn btn-sm btn-outline-secondary edit-btn"
                                    onclick="editMenu(${item.id})">
                                    Edit
                                </button>

                                <button
                                    class="btn btn-sm btn-outline-danger delete-btn"
                                    onclick="deleteMenu(${item.id})">
                                    Delete
                                </button>

                            </div>

                        </div>

                    </div>
                </div>
            `;

            categoryContainer.appendChild(menuCard);

        });

        menuTable.appendChild(categorySection);

    });

    if (validItems.length === 0) {

        menuTable.innerHTML = `
            <div class="empty-menu text-center py-5">
                <h5>No menu items found.</h5>
                <p class="mb-0">Try another search.</p>
            </div>
        `;

    }

    const totalMenu = document.getElementById("totalMenu");

    if (totalMenu) {
        totalMenu.textContent = menuItems.length;
    }
}


// ======================================
// 8. ADD MENU
// ======================================

const menuForm = document.getElementById("menuForm");

if (menuForm) {

    menuForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const name =
            document.getElementById("menuName").value.trim();

        const category =
            document.getElementById("menuCategory").value;

        const price =
            parseFloat(document.getElementById("menuPrice").value);

        if (!name || !category || isNaN(price) || price <= 0) {

            alert("Please enter valid menu details.");
            return;

        }

        menuItems.push({

            id: Date.now(),
            name: name,
            category: category,
            price: price,

            image:
                "https://placehold.co/600x400/f2e8df/916541?text=" +
                encodeURIComponent(name)

        });

        saveMenuItems();
        displayMenu();
        populateOrderMenu();

        menuForm.reset();

        showToast("New menu added successfully!", "success");

    });

}


// ======================================
// 9. EDIT MENU
// ======================================

function editMenu(id) {

    const item = menuItems.find(function(menu) {
        return String(menu.id) === String(id);
    });

    if (!item) return;

    const newName = prompt("Enter new menu name:", item.name);

    if (newName === null || newName.trim() === "") return;

    const newPrice = prompt("Enter new price:", item.price);

    if (newPrice === null || newPrice.trim() === "") return;

    if (isNaN(newPrice) || Number(newPrice) <= 0) {

        alert("Please enter a valid price.");
        return;

    }

    item.name = newName.trim();
    item.price = Number(newPrice);

    saveMenuItems();
    displayMenu();
    populateOrderMenu();

    showToast("Menu updated successfully!", "success");
}


// ======================================
// 10. DELETE MENU
// ======================================

function deleteMenu(id) {

    if (confirm("Are you sure you want to delete this menu?")) {

        menuItems = menuItems.filter(function(item) {
            return String(item.id) !== String(id);
        });

        saveMenuItems();
        displayMenu();
        populateOrderMenu();

        showToast("Menu deleted successfully!", "success");

    }
}


// ======================================
// 11. SEARCH MENU
// ======================================

const searchMenu = document.getElementById("searchMenu");

if (searchMenu) {

    searchMenu.addEventListener("input", function() {

        const keyword = this.value.toLowerCase();

        const filteredMenu = menuItems.filter(function(item) {

            return item.name.toLowerCase().includes(keyword) ||
                item.category.toLowerCase().includes(keyword);

        });

        displayMenu(filteredMenu);

    });

}


// ======================================
// 12. UPDATE FOOD SELECTION IN ORDER PAGE
// ======================================

function populateOrderMenu() {

    const selectedMenu = document.getElementById("selectedMenu");

    if (!selectedMenu) return;

    const currentValue = selectedMenu.value;

    selectedMenu.innerHTML =
        '<option value="">Select Food Item</option>';

    menuItems.forEach(function(item) {

        const option = document.createElement("option");

        option.value = item.id;

        option.textContent =
            `${item.name} - RM ${Number(item.price).toFixed(2)}`;

        selectedMenu.appendChild(option);

    });

    if (menuItems.some(function(item) {
        return String(item.id) === currentValue;
    })) {
        selectedMenu.value = currentValue;
    }

}


// ======================================
// 13. SHOPPING CART
// ======================================

let cart = [];


// Add Food to Cart

function addToCart() {

    const selectedMenu = document.getElementById("selectedMenu");
    const quantityInput = document.getElementById("itemQuantity");

    if (!selectedMenu || !quantityInput) return;

    const menuId = Number(selectedMenu.value);
    const quantity = Number(quantityInput.value);

    if (!menuId) {
        alert("Please select a food item.");
        return;
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
        alert("Please enter a valid quantity.");
        return;
    }

    const selectedItem = menuItems.find(function(item) {
        return Number(item.id) === menuId;
    });

    if (!selectedItem) {
        alert("This menu item is not available.");
        return;
    }

    const existingItem = cart.find(function(item) {
        return Number(item.id) === menuId;
    });

    if (existingItem) {

        existingItem.quantity += quantity;

    } else {

        cart.push({
            id: selectedItem.id,
            name: selectedItem.name,
            price: Number(selectedItem.price),
            image: selectedItem.image,
            quantity: quantity
        });

    }

    displayCart();

    showToast("Item added to cart!", "success");

    selectedMenu.value = "";
    quantityInput.value = 1;

}


// Display Shopping Cart

function displayCart() {

    const cartTable = document.getElementById("cartTable");
    const cartTotal = document.getElementById("cartTotal");

    if (!cartTable || !cartTotal) return;

    cartTable.innerHTML = "";

    if (cart.length === 0) {

        cartTable.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted">
                    Your cart is empty.
                </td>
            </tr>
        `;

        cartTotal.textContent = "RM 0.00";
        return;

    }

    let total = 0;

    cart.forEach(function(item) {

        const subtotal = item.price * item.quantity;

        total += subtotal;

        cartTable.innerHTML += `
            <tr>

                <td>
                    <div class="d-flex align-items-center gap-2">

                        <img
                            src="${item.image || ''}"
                            class="food-img"
                            alt="${item.name}"
                            onerror="this.onerror=null; this.src='https://placehold.co/100x100?text=Food';"
                        >

                        <strong>${item.name}</strong>

                    </div>
                </td>

                <td>RM ${item.price.toFixed(2)}</td>

                <td>
                    <div class="d-flex align-items-center gap-2">

                        <button
                            class="btn btn-sm btn-outline-secondary"
                            onclick="changeCartQuantity(${item.id}, -1)">
                            −
                        </button>

                        <strong>${item.quantity}</strong>

                        <button
                            class="btn btn-sm btn-outline-secondary"
                            onclick="changeCartQuantity(${item.id}, 1)">
                            +
                        </button>

                    </div>
                </td>

                <td>RM ${subtotal.toFixed(2)}</td>

                <td>
                    <button
                        class="btn btn-sm btn-outline-danger"
                        onclick="removeFromCart(${item.id})">
                        Remove
                    </button>
                </td>

            </tr>
        `;

    });

    cartTotal.textContent = "RM " + total.toFixed(2);

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
// 14. ORDER MANAGEMENT
// ======================================

let orders = loadSavedData("ruangRasaOrders", [

    {
        id: 1,
        customer: "Aina",
        date: "07/11/2026",
        total: 15.00,
        status: "Pending",

        items: [
            {
                name: "Nasi Lemak",
                quantity: 2,
                price: 5.00,
                image: "images/nasi-lemak.jpg"
            },
            {
                name: "Teh Ais",
                quantity: 1,
                price: 3.00,
                image: "images/teh-ais.jpg"
            }
        ]
    },

    {
        id: 2,
        customer: "Amir",
        date: "07/11/2026",
        total: 22.50,
        status: "Completed",

        items: [
            {
                name: "Mi Goreng",
                quantity: 2,
                price: 6.00,
                image: "images/mi-goreng.jpg"
            },
            {
                name: "Milo Ais",
                quantity: 3,
                price: 3.50,
                image: "images/milo-ais.jpg"
            }
        ]
    },

    {
        id: 3,
        customer: "Sara",
        date: "07/11/2026",
        total: 10.00,
        status: "Preparing",

        items: [
            {
                name: "Kek Coklat",
                quantity: 1,
                price: 7.00,
                image: "images/chocolate-cake.jpg"
            },
            {
                name: "Karipap",
                quantity: 2,
                price: 1.50,
                image: "images/karipap.jpg"
            }
        ]
    }

]);


// Display Orders

function displayOrders(items = orders) {

    const orderTable = document.getElementById("orderTable");

    if (!orderTable) return;

    orderTable.innerHTML = "";

    if (items.length === 0) {

        orderTable.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">
                    No orders found.
                </td>
            </tr>
        `;

        updateOrderSummary();
        return;

    }

    items.forEach(function(order) {

        let statusColor = "secondary";

        if (order.status === "Pending") {
            statusColor = "warning";
        } else if (order.status === "Preparing") {
            statusColor = "primary";
        } else if (order.status === "Completed") {
            statusColor = "success";
        }

        const foodItems = (order.items || []).map(function(item) {

            return `
                <div class="d-flex align-items-center gap-2 mb-2">

                    <img
                        src="${item.image || ''}"
                        class="food-img"
                        alt="${item.name}"
                        onerror="this.onerror=null; this.src='https://placehold.co/100x100?text=Food';"
                    >

                    <span>${item.name} × ${item.quantity}</span>

                </div>
            `;

        }).join("");

        orderTable.innerHTML += `
            <tr>

                <td>
                    ORD${String(order.id).padStart(3, "0")}
                </td>

                <td>
                    <strong>${order.customer}</strong>
                </td>

                <td>${foodItems}</td>

                <td>${order.date}</td>

                <td>
                    <strong>RM ${Number(order.total).toFixed(2)}</strong>
                </td>

                <td>

                    <select
                        class="form-select status-select text-${statusColor}"
                        onchange="updateOrderStatus(${order.id}, this.value)">

                        <option value="Pending"
                            ${order.status === "Pending" ? "selected" : ""}>
                            Pending
                        </option>

                        <option value="Preparing"
                            ${order.status === "Preparing" ? "selected" : ""}>
                            Preparing
                        </option>

                        <option value="Completed"
                            ${order.status === "Completed" ? "selected" : ""}>
                            Completed
                        </option>

                    </select>

                </td>

                <td>

                    <button
                        class="btn btn-sm btn-outline-primary mb-1"
                        onclick="printReceipt(${order.id})">
                        Receipt
                    </button>

                    <button
                        class="btn btn-sm btn-outline-danger"
                        onclick="deleteOrder(${order.id})">
                        Delete
                    </button>

                </td>

            </tr>
        `;

    });

    updateOrderSummary();

}


// Place Order

function placeOrder() {

    const customerInput = document.getElementById("customerName");

    if (!customerInput) return;

    if (!customerInput.value.trim()) {

        alert("Please enter customer name.");
        customerInput.focus();
        return;

    }

    if (cart.length === 0) {

        alert("Please add food items to the cart first.");
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

    showToast("Order placed successfully!", "success");

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

        showToast("Order status updated successfully!", "success");

    }

}


// Delete Order

function deleteOrder(id) {

    if (confirm("Are you sure you want to delete this order?")) {

        orders = orders.filter(function(order) {
            return Number(order.id) !== Number(id);
        });

        saveOrders();
        displayOrders();

        showToast("Order deleted successfully!", "success");

    }

}


// Search Order

const searchOrder = document.getElementById("searchOrder");

if (searchOrder) {

    searchOrder.addEventListener("input", function() {

        const keyword = this.value.toLowerCase();

        const filteredOrders = orders.filter(function(order) {

            return order.customer.toLowerCase().includes(keyword);

        });

        displayOrders(filteredOrders);

    });

}


// ======================================
// 15. PRINT RECEIPT
// ======================================

function printReceipt(id) {

    const order = orders.find(function(item) {
        return Number(item.id) === Number(id);
    });

    if (!order) {
        alert("Order not found.");
        return;
    }

    const receiptItems = order.items.map(function(item) {

        const price = Number(item.price) || 0;
        const subtotal = price * item.quantity;

        return `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>RM ${price.toFixed(2)}</td>
                <td>RM ${subtotal.toFixed(2)}</td>
            </tr>
        `;

    }).join("");

    const receiptWindow = window.open(
        "",
        "_blank",
        "width=800,height=700"
    );

    if (!receiptWindow) {
        alert("Please allow pop-ups to print the receipt.");
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
                    Total: RM ${Number(order.total).toFixed(2)}
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
// 16. ORDER SUMMARY CARDS
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
// 17. INITIALIZE PAGES
// ======================================

displayMenu();
displayCart();
displayOrders();
populateOrderMenu();
