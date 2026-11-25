const products = [
  {
    id: "linen-throw",
    name: "Sunday Linen Throw",
    category: "Home",
    price: 88,
    rating: "4.9",
    reviews: 28,
    badge: "A favourite",
    image: "photo-1600210492486-724fe5c67fb0",
    alt: "An airy living room layered with relaxed neutral linen",
  },
  {
    id: "stoneware-mug",
    name: "Slow Morning Mug",
    category: "Home",
    price: 32,
    rating: "4.8",
    reviews: 42,
    badge: "Small batch",
    image: "photo-1514228742587-6b1558fcca3d",
    alt: "Handmade ceramic coffee cup in soft natural light",
  },
  {
    id: "wild-candle",
    name: "Wild Fig Candle",
    category: "Wellness",
    price: 38,
    rating: "5.0",
    reviews: 19,
    badge: "",
    image: "photo-1603006905003-be475563bc59",
    alt: "A softly glowing candle for a quiet evening",
  },
  {
    id: "daily-journal",
    name: "The Daily Pause Journal",
    category: "Wellness",
    price: 26,
    rating: "4.9",
    reviews: 36,
    badge: "A little ritual",
    image: "photo-1455390582262-044cdead277a",
    alt: "A notebook and pen ready for a slow morning",
  },
  {
    id: "market-tote",
    name: "Everywhere Market Tote",
    category: "Accessories",
    price: 44,
    rating: "4.7",
    reviews: 21,
    badge: "",
    image: "photo-1544816155-12df9643f363",
    alt: "A thoughtfully made everyday carryall",
  },
  {
    id: "botanical-oil",
    name: "Sunday Skin Oil",
    category: "Wellness",
    price: 52,
    rating: "4.9",
    reviews: 31,
    badge: "New here",
    image: "photo-1608248543803-ba4f8c70ae0b",
    alt: "A simple botanical skincare ritual",
  },
  {
    id: "wooden-tray",
    name: "Little Ritual Tray",
    category: "Home",
    price: 58,
    rating: "4.8",
    reviews: 16,
    badge: "",
    image: "photo-1603199506016-b9a594b593c0",
    alt: "Warm natural wood homeware on a softly lit table",
  },
  {
    id: "soft-socks",
    name: "Stay Awhile Socks",
    category: "Accessories",
    price: 24,
    rating: "4.9",
    reviews: 53,
    badge: "The comfiest",
    image: "photo-1586350977771-b3b0abd50c82",
    alt: "Soft cozy essentials in a calming neutral palette",
  },
];

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const productGrid = document.querySelector("#product-grid");
const emptyState = document.querySelector("#empty-state");
const searchInput = document.querySelector("#product-search");
const sortSelect = document.querySelector("#sort-products");
const cart = new Map();
let activeCategory = "All";
let toastTimer;

function imageUrl(id, width = 720) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;
}

function renderProducts() {
  const search = searchInput.value.trim().toLowerCase();
  let visibleProducts = products.filter((product) => {
    const matchesCategory = activeCategory === "All" || product.category === activeCategory;
    const matchesSearch = `${product.name} ${product.category}`.toLowerCase().includes(search);
    return matchesCategory && matchesSearch;
  });

  if (sortSelect.value === "low") visibleProducts.sort((a, b) => a.price - b.price);
  if (sortSelect.value === "high") visibleProducts.sort((a, b) => b.price - a.price);
  if (sortSelect.value === "rating") visibleProducts.sort((a, b) => Number(b.rating) - Number(a.rating));

  productGrid.innerHTML = visibleProducts.map((product) => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img class="product-image" src="${imageUrl(product.image)}" alt="${product.alt}" loading="lazy" />
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
        <button class="quick-add" data-add="${product.id}" aria-label="Add ${product.name} to bag">Add to bag&nbsp; +</button>
      </div>
      <div class="product-info">
        <p class="product-category">${product.category}</p>
        <div class="product-name-row"><h3 class="product-name">${product.name}</h3><span class="product-price">${money.format(product.price)}</span></div>
        <p class="product-rating"><span aria-hidden="true">★★★★★</span> ${product.rating} (${product.reviews})</p>
      </div>
    </article>
  `).join("");
  emptyState.hidden = visibleProducts.length > 0;
}

function cartQuantity() {
  return [...cart.values()].reduce((sum, item) => sum + item.quantity, 0);
}

function cartSubtotal() {
  return [...cart.values()].reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}

function updateCart() {
  const quantity = cartQuantity();
  const subtotal = cartSubtotal();
  document.querySelector("#cart-count").textContent = quantity;
  document.querySelector("#drawer-count").textContent = `(${quantity})`;
  document.querySelector("#cart-subtotal").textContent = money.format(subtotal);
  document.querySelector("#cart-empty").classList.toggle("show", quantity === 0);
  document.querySelector("#cart-footer").classList.toggle("hidden", quantity === 0);

  const remaining = Math.max(0, 75 - subtotal);
  const progress = document.querySelector("#shipping-progress");
  progress.innerHTML = quantity === 0
    ? ""
    : `<strong>${remaining === 0 ? "Lovely! You unlocked free shipping." : `You're ${money.format(remaining)} away from free shipping.`}</strong>
       <div class="shipping-meter"><span style="width:${Math.min(100, (subtotal / 75) * 100)}%"></span></div>`;

  document.querySelector("#cart-items").innerHTML = [...cart.values()].map(({ product, quantity: count }) => `
    <article class="cart-line">
      <img src="${imageUrl(product.image, 180)}" alt="" />
      <div class="cart-line-info">
        <h3>${product.name}</h3><p>${product.category}</p>
        <div class="quantity-control">
          <button data-quantity="${product.id}" data-change="-1" aria-label="Remove one ${product.name}">−</button>
          <span>${count}</span>
          <button data-quantity="${product.id}" data-change="1" aria-label="Add one ${product.name}">+</button>
        </div>
      </div>
      <span class="cart-line-price">${money.format(product.price * count)}</span>
    </article>
  `).join("");
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2300);
}

function openCart() {
  const drawer = document.querySelector("#cart-drawer");
  const overlay = document.querySelector("#overlay");
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  overlay.hidden = false;
  requestAnimationFrame(() => overlay.classList.add("visible"));
  document.body.style.overflow = "hidden";
  document.querySelector("#close-cart").focus();
}

function closeCart() {
  const drawer = document.querySelector("#cart-drawer");
  const overlay = document.querySelector("#overlay");
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
  overlay.classList.remove("visible");
  document.body.style.overflow = "";
  window.setTimeout(() => { overlay.hidden = true; }, 250);
}

document.querySelector(".category-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  document.querySelectorAll(".category-chip").forEach((chip) => {
    chip.classList.toggle("active", chip === button);
  });
  renderProducts();
});

document.querySelector(".main-nav").addEventListener("click", (event) => {
  const link = event.target.closest("[data-nav-category]");
  if (!link) return;
  activeCategory = link.dataset.navCategory;
  document.querySelectorAll(".category-chip").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.category === activeCategory);
  });
  renderProducts();
  document.querySelector(".main-nav").classList.remove("open");
  document.querySelector("#menu-toggle").setAttribute("aria-expanded", "false");
});

searchInput.addEventListener("input", renderProducts);
sortSelect.addEventListener("change", renderProducts);
document.querySelector(".search-toggle").addEventListener("click", () => {
  searchInput.focus();
  document.querySelector("#shop").scrollIntoView({ behavior: "smooth" });
});

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  const product = products.find((item) => item.id === button.dataset.add);
  const existing = cart.get(product.id);
  cart.set(product.id, { product, quantity: existing ? existing.quantity + 1 : 1 });
  updateCart();
  showToast(`${product.name} added to your bag`);
});

document.querySelector("#cart-items").addEventListener("click", (event) => {
  const button = event.target.closest("[data-quantity]");
  if (!button) return;
  const id = button.dataset.quantity;
  const item = cart.get(id);
  const quantity = item.quantity + Number(button.dataset.change);
  if (quantity <= 0) cart.delete(id);
  else cart.set(id, { ...item, quantity });
  updateCart();
});

document.querySelector("#open-cart").addEventListener("click", openCart);
document.querySelector("#close-cart").addEventListener("click", closeCart);
document.querySelector("#overlay").addEventListener("click", closeCart);
document.querySelector("#continue-shopping").addEventListener("click", closeCart);
document.querySelector("#continue-shopping-footer").addEventListener("click", closeCart);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.querySelector("#cart-drawer").classList.contains("open")) closeCart();
});

document.querySelector("#checkout-button").addEventListener("click", () => {
  showToast("Checkout is a demo — your bag is saved right here.");
});

document.querySelector("#newsletter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const email = document.querySelector("#newsletter-email");
  document.querySelector("#newsletter-message").textContent = "You're on the list. Keep an eye on your inbox!";
  email.value = "";
});

document.querySelector("#menu-toggle").addEventListener("click", (event) => {
  const menu = document.querySelector(".main-nav");
  const isOpen = menu.classList.toggle("open");
  event.currentTarget.setAttribute("aria-expanded", String(isOpen));
});

renderProducts();
updateCart();
