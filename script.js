// --------- Data Produk (5 item) ----------
const products = [
  {
    id: "p1",
    name: "Basic Tee Combed 30s",
    price: 99000,
    image: "https://static.zara.net/assets/public/05d6/f64c/6e5c478c8a15/65ea2e03eb80/05584261250-p/05584261250-p.jpg?ts=1727277108008&w=1024"
  },
  {
    id: "p2",
    name: "Polo Shirt Premium",
    price: 149000,
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop"
  },
  {
    id: "p3",
    name: "Hoodie Zip Minimal",
    price: 239000,
    image: "https://images.unsplash.com/photo-1520974722057-9e6a8435b1f2?q=80&w=1200&auto=format&fit=crop"
  },
  {
    id: "p4",
    name: "Denim Jacket Classic",
    price: 329000,
    image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=1200&auto=format&fit=crop"
  },
  {
    id: "p5",
    name: "Sports Jersey DryFit",
    price: 179000,
    image: "https://images.unsplash.com/photo-1520975927950-c3caa1f76849?q=80&w=1200&auto=format&fit=crop"
  }
];

// --------- Helper ----------
const rp = n => n.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

// --------- State ----------
let cart = JSON.parse(localStorage.getItem("BLANK_cart") || "[]");

function saveCart() {
  localStorage.setItem("BLANK_cart", JSON.stringify(cart));
  document.getElementById("cartCount").textContent = cart.reduce((a, b) => a + b.qty, 0);
}

// --------- Render Produk ----------
function renderProducts() {
  const grid = document.getElementById("productGrid");
  // Periksa apakah elemen productGrid ada (hanya di index.html)
  if (!grid) return;
  
  const tpl = document.getElementById("productCardTpl");
  grid.innerHTML = "";
  products.forEach(p => {
    const node = tpl.content.cloneNode(true);
    const card = node.querySelector(".product-card");
    card.querySelector("img").src = p.image;
    card.querySelector("img").alt = p.name;
    card.querySelector(".product-name").textContent = p.name;
    card.querySelector(".product-price").textContent = rp(p.price);

    const qtyInput = card.querySelector(".qty-input");
    card.querySelectorAll(".qty-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const delta = Number(btn.dataset.delta);
        const v = Math.max(1, Number(qtyInput.value || 1) + delta);
        qtyInput.value = v;
      });
    });

    card.querySelector(".add-to-cart").addEventListener("click", () => {
      const size = card.querySelector(".size-select").value;
      const qty = Math.max(1, Number(qtyInput.value || 1));
      addToCart(p, size, qty);
      openCart();
    });

    grid.appendChild(node);
  });
}

// --------- Keranjang ----------
function addToCart(product, size, qty) {
  const key = product.id + "|" + size;
  const idx = cart.findIndex(i => i.key === key);
  if (idx >= 0) {
    cart[idx].qty += qty;
  } else {
    cart.push({
      key,
      id: product.id,
      name: product.name,
      price: product.price,
      size,
      image: product.image,
      qty
    });
  }
  saveCart();
  renderCart();
  
  // Hanya panggil renderSummary jika di halaman checkout
  if (document.getElementById("orderSummary")) {
    renderSummary();
  }
}

function updateCartQty(key, qty) {
  const item = cart.find(i => i.key === key);
  if (!item) return;
  item.qty = Math.max(1, qty);
  saveCart();
  renderCart();
  
  // Hanya panggil renderSummary jika di halaman checkout
  if (document.getElementById("orderSummary")) {
    renderSummary();
  }
}

function changeCartQty(key, delta) {
  const item = cart.find(i => i.key === key);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart();
  renderCart();
  
  // Hanya panggil renderSummary jika di halaman checkout
  if (document.getElementById("orderSummary")) {
    renderSummary();
  }
}

function removeFromCart(key) {
  cart = cart.filter(i => i.key !== key);
  saveCart();
  renderCart();
  
  // Hanya panggil renderSummary jika di halaman checkout
  if (document.getElementById("orderSummary")) {
    renderSummary();
  }
}

function cartSubtotal() {
  return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}

function renderCart() {
  const list = document.getElementById("cartItems");
  // Periksa apakah elemen cartItems ada (hanya di index.html)
  if (!list) return;
  
  const tpl = document.getElementById("cartItemTpl");
  list.innerHTML = cart.length ? "" : "<p class='muted'>Keranjang masih kosong.</p>";
  cart.forEach(i => {
    const node = tpl.content.cloneNode(true);
    node.querySelector(".ci-img").src = i.image;
    node.querySelector(".ci-img").alt = i.name;
    node.querySelector(".ci-title").textContent = i.name;
    node.querySelector(".ci-meta").textContent = "Ukuran " + i.size;
    node.querySelector(".ci-price").textContent = rp(i.price * i.qty);

    const qtyInput = node.querySelector(".qty-input");
    qtyInput.value = i.qty;
    qtyInput.addEventListener("input", () => {
      const v = Math.max(1, Number(qtyInput.value || 1));
      updateCartQty(i.key, v);
    });

    node.querySelectorAll(".qty-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const delta = Number(btn.dataset.delta);
        changeCartQty(i.key, delta);
      });
    });

    node.querySelector(".ci-remove").addEventListener("click", () => removeFromCart(i.key));

    list.appendChild(node);
  });
  
  // Periksa apakah elemen cartSubtotal ada sebelum mengatur teks
  const cartSubtotalElem = document.getElementById("cartSubtotal");
  if (cartSubtotalElem) {
    cartSubtotalElem.textContent = rp(cartSubtotal());
  }
}

// --------- Ringkasan Pesanan (di Checkout) ----------
function renderSummary() {
  const box = document.getElementById("orderSummary");
  if (!box) return;
  if (!cart.length) {
    box.innerHTML = "<div class='empty'>Keranjang kosong. Silakan pilih produk.</div>";
    return;
  }
  const lines = cart.map(i =>
    `<div class="sum-row">
      <div><strong>${i.name}</strong> · ${i.size} × ${i.qty}</div>
      <div>${rp(i.price * i.qty)}</div>
    </div>`).join("");

  box.innerHTML = `
    <h4>Ringkasan Pesanan</h4>
    ${lines}
    <div class="sum-row total">
      <div>Subtotal</div>
      <div><strong>${rp(cartSubtotal())}</strong></div>
    </div>
    <p class="muted small">* Ongkos kirim dihitung pada langkah berikutnya.</p>
  `;
}

// --------- Drawer Keranjang ----------
const cartDrawer = document.getElementById("cartDrawer");
const openCartBtn = document.getElementById("openCartBtn");
const closeCartBtn = document.getElementById("closeCartBtn");
const cartBackdrop = document.getElementById("cartBackdrop");
const goCheckoutBtn = document.getElementById("goCheckoutBtn");

function openCart() {
  if (cartDrawer) {
    cartDrawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
  }
}

function closeCart() {
  if (cartDrawer) {
    cartDrawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
  }
}

if (openCartBtn) {
  openCartBtn.addEventListener("click", openCart);
}

if (closeCartBtn) {
  closeCartBtn.addEventListener("click", closeCart);
}

if (cartBackdrop) {
  cartBackdrop.addEventListener("click", closeCart);
}

if (goCheckoutBtn) {
  goCheckoutBtn.addEventListener("click", closeCart);
}

// --------- Checkout submit ----------
const checkoutForm = document.getElementById("checkoutForm");
if (checkoutForm) {
  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!cart.length) {
      alert("Keranjang masih kosong.");
      return;
    }
    const form = new FormData(e.target);
    const order = {
      name: form.get("name"),
      phone: form.get("phone"),
      email: form.get("email"),
      address: form.get("address"),
      payment: form.get("payment"),
      items: cart,
      subtotal: cartSubtotal(),
      date: new Date().toISOString()
    };
    console.log("ORDER:", order);
    alert("Terima kasih! Pesanan Anda diterima. Rincian dikirim ke email/WhatsApp.");
    cart = [];
    saveCart();
    renderCart();
    renderSummary();
    e.target.reset();
    window.location.hash = "#home";
  });
}

// --------- Kontak dummy ----------
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Pesan terkirim! Kami akan membalas secepatnya.");
    e.target.reset();
  });
}

// --------- Init ----------
// Set tahun di footer
const yearElem = document.getElementById("year");
if (yearElem) {
  yearElem.textContent = new Date().getFullYear();
}

// Render produk hanya jika di halaman index
renderProducts();
saveCart();
renderCart();

// Hanya render summary jika di halaman checkout
if (document.getElementById("orderSummary")) {
  renderSummary();
}

// Navigasi ke halaman checkout
if (goCheckoutBtn) {
  goCheckoutBtn.addEventListener("click", function(e) {
    e.preventDefault();
    if (cart.length === 0) {
      alert("Keranjang belanja Anda kosong. Silakan tambahkan produk terlebih dahulu.");
      return;
    }
    window.location.href = "checkout.html";
  });
}
