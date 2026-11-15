// ======================================
// RUANG RASA CAFE - MENU PAGE
// Only loaded on menu.html. Needs ui.js and data.js.
// ======================================

// ======================================
// 1. DISPLAY MENU BY CATEGORY
// ======================================

function displayMenu(items = menuItems) {

    const menuTable = document.getElementById("menuTable");

    // Only the Menu page has this container
    if (!menuTable) return;

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
                <div class="menu-card ${item.soldOut ? "sold-out" : ""}">

                    <div class="menu-img-wrap">
                    ${item.soldOut ? `<span class="sold-out-badge">Sold out</span>` : ""}
                    <img
                        src="${escapeHTML(imagePath)}"
                        alt="${escapeHTML(item.name)}"
                        width="600" height="600"
                        loading="lazy" decoding="async"
                        onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}';"
                    >
                    </div>

                    <div class="menu-info">

                        <span class="category">
                            ${escapeHTML(item.category)}
                        </span>

                        <h5>${escapeHTML(item.name)}</h5>

                        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">

                            <span class="price">
                                ${formatRM(price)}
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

                        <!-- Sold out switch: saves straight away -->
                        <div class="form-check form-switch availability-switch">
                            <input class="form-check-input" type="checkbox" role="switch"
                                id="available-${item.id}"
                                ${item.soldOut ? "" : "checked"}
                                onchange="setSoldOut(${item.id}, !this.checked)">
                            <label class="form-check-label" for="available-${item.id}">
                                ${item.soldOut ? "Sold out" : "Available"}
                            </label>
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
            <div class="empty-menu empty-state">
                <i class="bi bi-search empty-icon" aria-hidden="true"></i>
                <h5>No menu items found</h5>
                <p>Try another name or category.</p>
            </div>
        `;

    }

    const totalMenu = document.getElementById("totalMenu");

    if (totalMenu) {
        totalMenu.textContent = menuItems.length;
    }

    // Count categories from the data instead of hardcoding "8"
    const totalCategories = document.getElementById("totalCategories");

    if (totalCategories) {
        totalCategories.textContent = menuCategories.length;
    }

    // Sold out summary card
    const soldOutCount = menuItems.filter(function(item) { return item.soldOut; }).length;
    const soldOutTotal = document.getElementById("soldOutCount");
    const makeAllAvailable = document.getElementById("makeAllAvailable");

    if (soldOutTotal) {
        soldOutTotal.textContent = soldOutCount;
    }

    if (makeAllAvailable) {
        makeAllAvailable.hidden = soldOutCount === 0;
    }
}


// ======================================
// 2. ADD / EDIT MENU (one pop-up form for both)
// ======================================

// "+ Add Menu" opens the form empty; the Edit button opens it filled in.
function addMenu() {
    openMenuForm(null);
}

function editMenu(id) {

    const item = menuItems.find(function(menu) {
        return String(menu.id) === String(id);
    });

    if (item) openMenuForm(item);
}

function openMenuForm(item) {

    const isNew = !item;

    const categoryOptions =
        (isNew ? `<option value="" selected>Select category</option>` : "") +
        menuCategories.map(function(category) {
            return `<option value="${escapeHTML(category)}"
                ${!isNew && category === item.category ? "selected" : ""}>
                ${escapeHTML(category)}
            </option>`;
        }).join("");

    const modal = openModal(`
        <form id="menuItemForm" novalidate>

            <div class="rr-modal-header">
                <div class="rr-modal-icon"><i class="bi bi-${isNew ? "plus-circle" : "pencil-square"}" aria-hidden="true"></i></div>
                <div>
                    <h5>${isNew ? "Add Menu Item" : "Edit Menu Item"}</h5>
                    <p>${isNew ? "Fill in the details of the new dish." : "Update the details, then save your changes."}</p>
                </div>
            </div>

            <div class="rr-modal-body">

                <img id="menuImagePreview"
                    class="image-preview mb-3"
                    src="${escapeHTML((item && item.image) || FALLBACK_IMAGE)}"
                    alt="Preview"
                    onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}';">

                <div class="mb-3">
                    <label class="form-label" for="menuName">Menu Name</label>
                    <input type="text" id="menuName" class="form-control"
                        placeholder="Example: Nasi Goreng Kampung"
                        value="${isNew ? "" : escapeHTML(item.name)}">
                </div>

                <div class="row g-3 mb-3">
                    <div class="col-sm-7">
                        <label class="form-label" for="menuCategory">Category</label>
                        <select id="menuCategory" class="form-select">
                            ${categoryOptions}
                        </select>
                    </div>

                    <div class="col-sm-5">
                        <label class="form-label" for="menuPrice">Price (RM)</label>
                        <input type="number" id="menuPrice" class="form-control"
                            min="0.01" step="0.01" inputmode="decimal" placeholder="0.00"
                            value="${isNew ? "" : Number(item.price).toFixed(2)}">
                    </div>
                </div>

                <div>
                    <label class="form-label" for="menuImage">Image path or URL${isNew ? ` <span class="text-secondary small">(optional)</span>` : ""}</label>
                    <input type="text" id="menuImage" class="form-control"
                        placeholder="images/nasi-lemak.webp"
                        value="${isNew ? "" : escapeHTML(item.image || "")}">
                </div>

            </div>

            <div class="rr-modal-footer">
                <button type="button" class="btn-ghost" data-close>Cancel</button>
                <button type="submit" class="btn btn-brand">${isNew ? "Add Item" : "Save Changes"}</button>
            </div>

        </form>
    `, { wide: true });

    const form = modal.element.querySelector("#menuItemForm");
    const nameInput = form.querySelector("#menuName");
    const categoryInput = form.querySelector("#menuCategory");
    const priceInput = form.querySelector("#menuPrice");
    const imageInput = form.querySelector("#menuImage");
    const preview = form.querySelector("#menuImagePreview");

    // Live image preview while typing
    imageInput.addEventListener("input", function() {
        preview.src = imageInput.value.trim() || FALLBACK_IMAGE;
    });

    nameInput.focus();
    if (!isNew) nameInput.select();

    form.addEventListener("submit", function(event) {

        event.preventDefault();

        const name = nameInput.value.trim();
        const category = categoryInput.value;
        const price = parseFloat(priceInput.value);
        let isValid = true;

        if (!name) {
            setFieldError(nameInput, "Please enter a menu name.");
            isValid = false;
        }

        if (!category) {
            setFieldError(categoryInput, "Please choose a category.");
            isValid = false;
        }

        if (isNaN(price) || price <= 0) {
            setFieldError(priceInput, "Price must be more than RM 0.00.");
            isValid = false;
        }

        if (!isValid) {
            form.querySelector(".is-invalid").focus();
            return;
        }

        const image = imageInput.value.trim();

        if (isNew) {

            menuItems.push({
                id: newMenuId(),
                name: name,
                category: category,
                price: price,
                image: image ||
                    "https://placehold.co/600x400/f2e8df/916541?text=" + encodeURIComponent(name)
            });

        } else {

            item.name = name;
            item.category = category;
            item.price = price;
            item.image = image || FALLBACK_IMAGE;
        }

        saveMenuItems();
        displayMenu();

        modal.close();

        showToast(isNew ? `"${name}" added to the menu!` : `"${name}" updated successfully!`, "success");
    });
}



// ======================================
// 3. DELETE MENU
// ======================================

function deleteMenu(id) {

    const item = menuItems.find(function(menu) {
        return String(menu.id) === String(id);
    });

    if (!item) return;

    confirmDialog({
        title: "Delete this menu item?",
        message: `"${item.name}" will be removed from the menu. This cannot be undone.`,
        confirmText: "Delete",
        danger: true
    }).then(function(confirmed) {

        if (!confirmed) return;

        menuItems = menuItems.filter(function(menu) {
            return String(menu.id) !== String(id);
        });

        saveMenuItems();
        displayMenu();

        showToast(`"${item.name}" deleted.`, "success");
    });
}


// ======================================
// 4. SEARCH MENU
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
// 5. SOLD OUT
// A sold-out dish stays on the menu, but the order page
// greys it out so staff cannot add it to a cart.
// ======================================

// Redraw with the current search still applied
function refreshMenu() {
    if (searchMenu && searchMenu.value) {
        searchMenu.dispatchEvent(new Event("input"));
    } else {
        displayMenu();
    }
}

function setSoldOut(id, soldOut) {

    const item = menuItems.find(function(menu) {
        return String(menu.id) === String(id);
    });

    if (!item) return;

    item.soldOut = soldOut;

    saveMenuItems();
    refreshMenu();

    showToast(
        soldOut
            ? `"${item.name}" is marked as sold out.`
            : `"${item.name}" is available again.`,
        soldOut ? "info" : "success"
    );
}

// Start of a new day: everything back on sale
const makeAllAvailableButton = document.getElementById("makeAllAvailable");

if (makeAllAvailableButton) {

    makeAllAvailableButton.addEventListener("click", function() {

        menuItems.forEach(function(item) { item.soldOut = false; });

        saveMenuItems();
        refreshMenu();

        showToast("All dishes are available again.", "success");
    });
}




// ======================================
// START
// ======================================

displayMenu();
