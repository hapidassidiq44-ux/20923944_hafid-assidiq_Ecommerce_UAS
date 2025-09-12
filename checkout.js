// --------- Helper ----------
const rp = n => n.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

// --------- State ----------
let cart = JSON.parse(localStorage.getItem("BLANK_cart") || "[]");

function saveCart() {
  localStorage.setItem("BLANK_cart", JSON.stringify(cart));
  // Periksa apakah elemen cartCount ada sebelum mengatur teks
  const cartCountElem = document.getElementById("cartCount");
  if (cartCountElem) {
    cartCountElem.textContent = cart.reduce((a, b) => a + b.qty, 0);
  }
}

function cartSubtotal() {
  return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}

// --------- Ringkasan Pesanan ----------
function renderSummary() {
  const box = document.getElementById("orderSummary");
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
    ${lines}
    <div class="sum-row total">
      <div>Total</div>
      <div>${rp(cartSubtotal())}</div>
    </div>
  `;
}

// --------- Event Listeners ----------
document.addEventListener("DOMContentLoaded", () => {
  // Tahun footer
  document.getElementById("year").textContent = new Date().getFullYear();
  
  // Update cart count saat halaman dimuat
  saveCart();
  
  // Render ringkasan pesanan
  renderSummary();
  
  // Form checkout
  document.getElementById("checkoutForm").addEventListener("submit", e => {
    e.preventDefault();
    alert("Pesanan berhasil! Terima kasih telah berbelanja di BLANK STORE.");
    cart = [];
    saveCart();
    window.location.href = "index.html";
  });
});