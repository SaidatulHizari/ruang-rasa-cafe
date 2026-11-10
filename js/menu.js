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
                <div class="menu-card">

                    <img
                        src="${escapeHTML(imagePath)}"
                        alt="${escapeHTML(item.name)}"
                        loading="lazy"
                        onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}';"
                    >

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
}


// ======================================
// 2. ADD MENU
// ======================================

const menuForm = document.getElementById("menuForm");

if (menuForm) {

    menuForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const nameInput = document.getElementById("menuName");
        const categoryInput = document.getElementById("menuCategory");
        const priceInput = document.getElementById("menuPrice");

        const name = nameInput.value.trim();
        const category = categoryInput.value;
        const price = parseFloat(priceInput.value);

        // Show each problem under its own field
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
            menuForm.querySelector(".is-invalid").focus();
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

        menuForm.reset();

        showToast("New menu added successfully!", "success");

    });

}


// ======================================
// 3. EDIT MENU
// ======================================

// Opens one pop-up form with every field filled in,
// instead of two separate prompt() boxes.

function editMenu(id) {

    const item = menuItems.find(function(menu) {
        return String(menu.id) === String(id);
    });

    if (!item) return;

    const categoryOptions = menuCategories.map(function(category) {
        return `<option value="${escapeHTML(category)}"
            ${category === item.category ? "selected" : ""}>
            ${escapeHTML(category)}
        </option>`;
    }).join("");

    const modal = openModal(`
        <form id="editMenuForm" novalidate>

            <div class="rr-modal-header">
                <div class="rr-modal-icon"><i class="bi bi-pencil-square" aria-hidden="true"></i></div>
                <div>
                    <h5>Edit Menu Item</h5>
                    <p>Update the details, then save your changes.</p>
                </div>
            </div>

            <div class="rr-modal-body">

                <img id="editImagePreview"
                    class="image-preview mb-3"
                    src="${escapeHTML(item.image || FALLBACK_IMAGE)}"
                    alt="Preview"
                    onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}';">

                <div class="mb-3">
                    <label class="form-label" for="editName">Menu Name</label>
                    <input type="text" id="editName" class="form-control"
                        value="${escapeHTML(item.name)}">
                </div>

                <div class="row g-3 mb-3">
                    <div class="col-sm-7">
                        <label class="form-label" for="editCategory">Category</label>
                        <select id="editCategory" class="form-select">
                            ${categoryOptions}
                        </select>
                    </div>

                    <div class="col-sm-5">
                        <label class="form-label" for="editPrice">Price (RM)</label>
                        <input type="number" id="editPrice" class="form-control"
                            min="0.01" step="0.01"
                            value="${Number(item.price).toFixed(2)}">
                    </div>
                </div>

                <div>
                    <label class="form-label" for="editImage">Image path or URL</label>
                    <input type="text" id="editImage" class="form-control"
                        placeholder="images/nasi-lemak.jpg"
                        value="${escapeHTML(item.image || "")}">
                </div>

            </div>

            <div class="rr-modal-footer">
                <button type="button" class="btn-ghost" data-close>Cancel</button>
                <button type="submit" class="btn btn-brand">Save Changes</button>
            </div>

        </form>
    `, { wide: true });

    const form = modal.element.querySelector("#editMenuForm");
    const nameInput = form.querySelector("#editName");
    const categoryInput = form.querySelector("#editCategory");
    const priceInput = form.querySelector("#editPrice");
    const imageInput = form.querySelector("#editImage");
    const preview = form.querySelector("#editImagePreview");

    // Live image preview while typing
    imageInput.addEventListener("input", function() {
        preview.src = imageInput.value.trim() || FALLBACK_IMAGE;
    });

    nameInput.focus();
    nameInput.select();

    form.addEventListener("submit", function(event) {

        event.preventDefault();

        const newName = nameInput.value.trim();
        const newPrice = parseFloat(priceInput.value);
        let isValid = true;

        if (!newName) {
            setFieldError(nameInput, "Please enter a menu name.");
            isValid = false;
        }

        if (isNaN(newPrice) || newPrice <= 0) {
            setFieldError(priceInput, "Price must be more than RM 0.00.");
            isValid = false;
        }

        if (!isValid) {
            form.querySelector(".is-invalid").focus();
            return;
        }

        item.name = newName;
        item.category = categoryInput.value;
        item.price = newPrice;
        item.image = imageInput.value.trim() || FALLBACK_IMAGE;

        saveMenuItems();
        displayMenu();

        modal.close();

        showToast(`"${newName}" updated successfully!`, "success");
    });
}


// ======================================
// 4. DELETE MENU
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
// 5. SEARCH MENU
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
// START
// ======================================

displayMenu();
