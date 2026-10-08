// =========================
// Mobile Menu
// =========================

const menuButton = document.getElementById("menuButton");
const navMenu = document.getElementById("navMenu");

function closeKaimanamMenu() {
    navMenu.classList.remove("active");
    menuButton.textContent = "☰";
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open menu");
}

if (menuButton && navMenu) {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-controls", "navMenu");

    menuButton.addEventListener("click", () => {
        const isOpen = navMenu.classList.toggle("active");

        menuButton.textContent = isOpen ? "✕" : "☰";
        menuButton.setAttribute("aria-expanded", String(isOpen));
        menuButton.setAttribute(
            "aria-label",
            isOpen ? "Close menu" : "Open menu"
        );
    });

    navMenu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeKaimanamMenu);
    });
}

// =========================
// Footer Current Year
// =========================

const currentYear = document.getElementById("currentYear");

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}

// =========================
// Back to Top
// =========================

const backToTop = document.getElementById("backToTop");

if (backToTop) {
    function updateBackToTop() {
        backToTop.classList.toggle("show", window.scrollY > 400);
    }

    window.addEventListener("scroll", updateBackToTop, {
        passive: true
    });

    backToTop.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    updateBackToTop();
}

// =========================
// Products and Cart
// =========================

const kaimanamCart = new Map();

const kaimanamProducts = [
    ...document.querySelectorAll(".product-card")
];

const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");
const orderStatus = document.getElementById("kaimanamOrderStatus");

function getKaimanamProduct(index) {
    const card = kaimanamProducts[index];

    return {
        name: card.querySelector("h3").textContent.trim(),
        size: card.querySelector(".product-details span")
            .textContent.trim(),
        price: Number(
            card.querySelector("h4").textContent
                .replace(/[^0-9.]/g, "")
        )
    };
}

// Restore saved cart
try {
    const savedCart = JSON.parse(
        localStorage.getItem("kaimanamCart") || "[]"
    );

    if (Array.isArray(savedCart)) {
        savedCart.forEach((entry) => {
            if (!Array.isArray(entry) || entry.length !== 2) {
                return;
            }

            const [index, quantity] = entry;

            if (
                Number.isInteger(index) &&
                index >= 0 &&
                index < kaimanamProducts.length &&
                Number.isSafeInteger(quantity) &&
                quantity > 0
            ) {
                kaimanamCart.set(index, quantity);
            }
        });
    }
} catch (error) {
    console.warn("Unable to restore the saved cart.", error);
}

// Add product buttons
kaimanamProducts.forEach((card, index) => {
    const details = card.querySelector(".product-details");

    if (!details) {
        return;
    }

    const oldOrderLink = details.querySelector("a");
    let addButton = details.querySelector(".cart-add-button");

    if (!addButton) {
        addButton = document.createElement("button");

        if (oldOrderLink) {
            oldOrderLink.replaceWith(addButton);
        } else {
            details.appendChild(addButton);
        }
    }

    addButton.type = "button";
    addButton.className = "cart-add-button";
    addButton.textContent = "Add to Cart";

    addButton.addEventListener("click", () => {
        const quantity = kaimanamCart.get(index) || 0;

        kaimanamCart.set(index, quantity + 1);
        updateKaimanamCart();

        document.getElementById("cart")?.scrollIntoView({
            behavior: "smooth"
        });
    });
});

function updateKaimanamCart() {
    // Save every cart change
    try {
        localStorage.setItem(
            "kaimanamCart",
            JSON.stringify([...kaimanamCart])
        );
    } catch (error) {
        console.warn("Unable to save the cart.", error);
    }

    if (orderStatus) {
        orderStatus.replaceChildren();
    }

    if (!cartItems || !cartTotal) {
        return;
    }

    cartItems.replaceChildren();

    let total = 0;
    let itemCount = 0;

    if (kaimanamCart.size === 0) {
        cartItems.textContent = "Your cart is empty.";
    }

    kaimanamCart.forEach((quantity, index) => {
        const product = getKaimanamProduct(index);
        const amount = product.price * quantity;

        total += amount;
        itemCount += quantity;

        const row = document.createElement("div");
        row.className = "cart-row";

        const details = document.createElement("span");
        details.textContent =
            `${product.name} (${product.size}) × ${quantity} = ₹${amount}`;

        const minusButton = document.createElement("button");
        minusButton.type = "button";
        minusButton.textContent = "−";
        minusButton.setAttribute(
            "aria-label",
            `Decrease quantity of ${product.name}`
        );

        minusButton.addEventListener("click", () => {
            const currentQuantity = kaimanamCart.get(index) || 0;

            if (currentQuantity > 1) {
                kaimanamCart.set(index, currentQuantity - 1);
            } else {
                kaimanamCart.delete(index);
            }

            updateKaimanamCart();
        });

        const plusButton = document.createElement("button");
        plusButton.type = "button";
        plusButton.textContent = "+";
        plusButton.setAttribute(
            "aria-label",
            `Increase quantity of ${product.name}`
        );

        plusButton.addEventListener("click", () => {
            const currentQuantity = kaimanamCart.get(index) || 0;

            kaimanamCart.set(index, currentQuantity + 1);
            updateKaimanamCart();
        });

        row.append(details, minusButton, plusButton);
        cartItems.appendChild(row);
    });

    cartTotal.textContent = `Products Total: ₹${total}`;

    if (cartCount) {
        cartCount.textContent = itemCount;
    }
}

// =========================
// Clear Cart
// =========================

const clearCartButton = document.getElementById("clearCart");

if (clearCartButton) {
    clearCartButton.addEventListener("click", () => {
        kaimanamCart.clear();
        updateKaimanamCart();
    });
}

// =========================
// WhatsApp Order
// =========================

const orderForm = document.getElementById("kaimanamOrderForm");

if (orderForm && orderStatus) {
    orderForm.addEventListener("submit", (event) => {
        event.preventDefault();

        if (kaimanamCart.size === 0) {
            orderStatus.textContent =
                "Please add a product to your cart before placing an order.";
            return;
        }

        if (!orderForm.reportValidity()) {
            return;
        }

        const name = document.getElementById("orderName")
            .value.trim();

        const phone = document.getElementById("orderPhone")
            .value.trim();

        const alternatePhone = document.getElementById("alternatePhone")
            .value.trim();

        const address = document.getElementById("orderAddress")
            .value.trim();

        const selectedNumber = document.querySelector(
            'input[name="kaimanamNumber"]:checked'
        );

        if (
            !name ||
            !address ||
            !/^[0-9]{10}$/.test(phone) ||
            (alternatePhone && !/^[0-9]{10}$/.test(alternatePhone))
        ) {
            orderStatus.textContent =
                "Please enter your name, a valid 10-digit mobile number and complete delivery address.";
            return;
        }

        const allowedNumbers = [
            "919842164222",
            "919487019020"
        ];

        if (
            !selectedNumber ||
            !allowedNumbers.includes(selectedNumber.value)
        ) {
            orderStatus.textContent =
                "Please select a WhatsApp number for your order.";
            return;
        }

        let total = 0;
        const products = [];

        kaimanamCart.forEach((quantity, index) => {
            const product = getKaimanamProduct(index);
            const amount = product.price * quantity;

            total += amount;

            products.push(
                `${product.name} (${product.size}) × ${quantity} = ₹${amount}`
            );
        });

        const message = [
            "Hello Kaimanam, I would like to place an order.",
            "",
            ...products,
            "",
            `Products Total: ₹${total}`,
            "Delivery charges will be confirmed separately.",
            "",
            `Name: ${name}`,
            `Mobile Number: ${phone}`,
            ...(alternatePhone
                ? [`Alternate Mobile Number: ${alternatePhone}`]
                : []),
            `Delivery Address: ${address}`
        ].join("\n");

        const url =
            `https://wa.me/${selectedNumber.value}?text=${encodeURIComponent(message)}`;

        orderStatus.replaceChildren();

        const fallbackLink = document.createElement("a");
        fallbackLink.href = url;
        fallbackLink.target = "_blank";
        fallbackLink.rel = "noopener";
        fallbackLink.textContent =
            "If WhatsApp does not open, click here to continue.";

        orderStatus.appendChild(fallbackLink);

        window.open(url, "_blank", "noopener");
    });
}

// Display the saved cart on page load
updateKaimanamCart();
// Feedback Star Rating

const feedbackStars = [
    ...document.querySelectorAll(
        'input[name="feedbackRating"]'
    )
];

const ratingStatus = document.getElementById("ratingStatus");

const feedbackLinks = [
    ...document.querySelectorAll(
        "#reviews .review-button"
    )
];

function updateFeedbackRating() {
    const selectedStar = feedbackStars.find(
        (star) => star.checked
    );

    const rating = selectedStar
        ? Number(selectedStar.value)
        : 0;

    feedbackStars.forEach((star) => {
        star.closest("label").classList.toggle(
            "selected",
            Number(star.value) <= rating
        );
    });

    if (ratingStatus) {
        ratingStatus.textContent = rating
            ? `You selected ${rating} out of 5 stars.`
            : "Select a star to rate your experience.";
    }

    const message = [
        "Hello Kaimanam, I would like to share my feedback.",
        "",
        "Product: ",
        rating
            ? `Rating: ${rating}/5`
            : "Rating (1–5): ",
        "Review: "
    ].join("\n");

    feedbackLinks.forEach((link) => {
        const url = new URL(link.href);
        url.searchParams.set("text", message);
        link.href = url.toString();
    });
}

feedbackStars.forEach((star) => {
    star.addEventListener("change", updateFeedbackRating);
});

updateFeedbackRating();
