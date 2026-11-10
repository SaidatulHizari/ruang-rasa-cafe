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
// 4. LOAD AND PREPARE MENU DATA
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
// 5. ORDERS DATA
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

