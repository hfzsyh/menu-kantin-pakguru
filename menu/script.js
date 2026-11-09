// ========== DATA MENU ==========
const menu = [
  // Makanan
  { id: 1,  nama: "Nasi Ayam Geprek", kategori: "makanan", harga: 10000, rating: 4.8, ikon: "🍗", label: "Terlaris",
    deskripsi: "Nasi dengan ayam goreng crispy yang diulek bersama sambal bawang pedas." },
  { id: 2,  nama: "Nasi Ayam Bakar", kategori: "makanan", harga: 10000, rating: 4.7, ikon: "🍖", label: "Favorit",
    deskripsi: "Nasi dengan ayam bakar berbumbu manis gurih, empuk dan harum aroma bakaran." },
  { id: 3,  nama: "Nasi Ayam Bumbu Bali", kategori: "makanan", harga: 10000, rating: 4.6, ikon: "🌶️", label: "Pedas",
    deskripsi: "Nasi dengan ayam berbalut bumbu Bali yang kaya rempah dan sedikit pedas." },
  { id: 4,  nama: "Nasi Soto", kategori: "makanan", harga: 10000, rating: 4.5, ikon: "🍲", label: "",
    deskripsi: "Nasi dengan soto kuah kuning hangat, gurih, dan berisi suwiran ayam." },
  { id: 5,  nama: "Nasi Ampela", kategori: "makanan", harga: 6000, rating: 4.4, ikon: "🍢", label: "Hemat",
    deskripsi: "Nasi dengan ampela ayam berbumbu, empuk dan gurih, cocok untuk porsi hemat." },
  { id: 6,  nama: "Nasi Goreng", kategori: "makanan", harga: 3000, rating: 4.3, ikon: "🍛", label: "Hemat",
    deskripsi: "Nasi goreng sederhana dengan bumbu gurih, pas untuk yang ingin kenyang murah." },
  { id: 7,  nama: "Telur Dadar", kategori: "makanan", harga: 3000, rating: 4.4, ikon: "🍳", label: "",
    deskripsi: "Nasi hangat dengan telur dadar tebal yang digoreng kering di pinggirnya." },
  { id: 8,  nama: "Telur Mata Sapi", kategori: "makanan", harga: 5000, rating: 4.5, ikon: "🍳", label: "",
    deskripsi: "Nasi dengan telur mata sapi setengah matang, cocok dimakan dengan kecap." },
  { id: 9,  nama: "Nasi Goreng Kampung", kategori: "makanan", harga: 5000, rating: 4.5, ikon: "🍚", label: "",
    deskripsi: "Nasi goreng ala kampung dengan cita rasa pedas gurih yang khas." },

  // Minuman
  { id: 10, nama: "Minuman Dingin", kategori: "minuman", harga: 6000, rating: 4.6, ikon: "🧊", label: "Segar",
    deskripsi: "Aneka minuman dingin pilihan dengan harga sama untuk semua varian." },
  { id: 11, nama: "Minuman Panas/Hangat", kategori: "minuman", harga: 6000, rating: 4.5, ikon: "☕", label: "",
    deskripsi: "Aneka minuman panas atau hangat pilihan, harga sama untuk semua varian." }
];

// ========== STATE ==========
let kategoriAktif = "semua";
let kataCari = "";
let urutan = "default";
let keranjang = {}; // { idProduk: jumlah }

// ========== ELEMEN ==========
const $ = (id) => document.getElementById(id);
const menuGrid = $("menuGrid");
const emptyMsg = $("emptyMsg");
const cartEl = $("cart");
const overlay = $("overlay");
const cartItemsEl = $("cartItems");
const cartFoot = $("cartFoot");
const cartCount = $("cartCount");
const cartTotal = $("cartTotal");
const toastEl = $("toast");

// ========== UTIL ==========
const rupiah = (n) => "Rp " + n.toLocaleString("id-ID");

function bintang(rating) {
  const penuh = Math.round(rating);
  let html = "";
  for (let i = 1; i <= 5; i++) {
    html += i <= penuh ? "★" : '<span class="off">★</span>';
  }
  return html;
}

let toastTimer;
function toast(pesan) {
  toastEl.textContent = pesan;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1800);
}

// ========== RENDER MENU ==========
function renderMenu() {
  let data = menu.filter((m) => {
    const cocokKategori = kategoriAktif === "semua" || m.kategori === kategoriAktif;
    const cocokCari = m.nama.toLowerCase().includes(kataCari) ||
                      m.deskripsi.toLowerCase().includes(kataCari);
    return cocokKategori && cocokCari;
  });

  if (urutan === "rating") data.sort((a, b) => b.rating - a.rating);
  if (urutan === "murah")  data.sort((a, b) => a.harga - b.harga);
  if (urutan === "mahal")  data.sort((a, b) => b.harga - a.harga);

  menuGrid.innerHTML = data.map((m) => `
    <article class="card">
      <div class="card-img">
        ${m.label ? `<span class="badge">${m.label}</span>` : ""}
        ${m.ikon}
      </div>
      <div class="card-body">
        <h3 class="card-title">${m.nama}</h3>
        <div class="rating">
          <span class="stars">${bintang(m.rating)}</span>
          <span>${m.rating.toFixed(1)}</span>
        </div>
        <p class="desc">${m.deskripsi}</p>
        <div class="card-foot">
          <span class="price">${rupiah(m.harga)}</span>
          <button class="add-btn" data-id="${m.id}">🛒 Tambah</button>
        </div>
      </div>
    </article>
  `).join("");

  emptyMsg.hidden = data.length > 0;
}

// ========== KERANJANG ==========
function simpan() {
  try { localStorage.setItem("keranjangKantinV2", JSON.stringify(keranjang)); } catch (e) {}
}

function muat() {
  try {
    const data = JSON.parse(localStorage.getItem("keranjangKantinV2"));
    if (data && typeof data === "object") {
      // hanya ambil produk yang masih ada di menu
      Object.keys(data).forEach((id) => {
        if (menu.some((m) => m.id === Number(id)) && data[id] > 0) keranjang[id] = data[id];
      });
    }
  } catch (e) {}
}

function tambah(id) {
  keranjang[id] = (keranjang[id] || 0) + 1;
  const item = menu.find((m) => m.id === id);
  toast(`${item.nama} ditambahkan ✔`);
  const btn = $("openCart");
  btn.classList.remove("bump");
  void btn.offsetWidth; // restart animasi
  btn.classList.add("bump");
  renderKeranjang();
}

function ubahJumlah(id, delta) {
  keranjang[id] = (keranjang[id] || 0) + delta;
  if (keranjang[id] <= 0) delete keranjang[id];
  renderKeranjang();
}

function hapus(id) {
  delete keranjang[id];
  renderKeranjang();
}

function hitungTotal() {
  return Object.entries(keranjang).reduce((sum, [id, qty]) => {
    const item = menu.find((m) => m.id === Number(id));
    return sum + item.harga * qty;
  }, 0);
}

function renderKeranjang() {
  const ids = Object.keys(keranjang);
  const jumlahItem = ids.reduce((s, id) => s + keranjang[id], 0);
  cartCount.textContent = jumlahItem;

  if (ids.length === 0) {
    cartItemsEl.innerHTML = `
      <div class="cart-empty">
        <span class="big">🛒</span>
        Keranjang masih kosong.<br>Yuk pilih menu favoritmu!
      </div>`;
    cartFoot.hidden = true;
  } else {
    cartItemsEl.innerHTML = ids.map((id) => {
      const m = menu.find((x) => x.id === Number(id));
      const qty = keranjang[id];
      return `
        <div class="cart-item">
          <div class="ico">${m.ikon}</div>
          <div>
            <h4>${m.nama}</h4>
            <small>${rupiah(m.harga)}</small>
            <div class="qty">
              <button data-aksi="kurang" data-id="${m.id}" aria-label="Kurangi">−</button>
              <span>${qty}</span>
              <button data-aksi="tambah" data-id="${m.id}" aria-label="Tambah">+</button>
            </div>
          </div>
          <div class="item-right">
            <strong>${rupiah(m.harga * qty)}</strong>
            <button class="remove" data-aksi="hapus" data-id="${m.id}">Hapus</button>
          </div>
        </div>`;
    }).join("");
    cartFoot.hidden = false;
  }

  cartTotal.textContent = rupiah(hitungTotal());
  simpan();
}

function bukaKeranjang() {
  cartEl.classList.add("open");
  overlay.classList.add("show");
}
function tutupKeranjang() {
  cartEl.classList.remove("open");
  overlay.classList.remove("show");
}

// ========== CHECKOUT ==========
function checkout() {
  const nama = $("namaPemesan").value.trim();
  const meja = $("nomorMeja").value.trim();
  const catatan = $("catatan").value.trim();

  if (!nama) { toast("Isi nama pemesan dulu ya"); $("namaPemesan").focus(); return; }
  if (!meja) { toast("Isi nomor meja dulu ya"); $("nomorMeja").focus(); return; }

  // isi ringkasan pesanan di modal (pakai textContent agar aman)
  const info = $("modalInfo");
  info.textContent = `Terima kasih, ${nama}! Pesanan untuk meja ${meja} sedang disiapkan.` +
                     (catatan ? ` Catatan: ${catatan}` : "");

  const list = $("modalList");
  list.innerHTML = "";
  Object.entries(keranjang).forEach(([id, qty]) => {
    const m = menu.find((x) => x.id === Number(id));
    const li = document.createElement("li");
    const kiri = document.createElement("span");
    const kanan = document.createElement("span");
    kiri.textContent = `${qty}× ${m.nama}`;
    kanan.textContent = rupiah(m.harga * qty);
    li.append(kiri, kanan);
    list.appendChild(li);
  });
  $("modalTotal").textContent = "Total: " + rupiah(hitungTotal());

  $("modal").hidden = false;
  tutupKeranjang();

  // reset keranjang & form
  keranjang = {};
  $("catatan").value = "";
  renderKeranjang();
}

// ========== EVENT ==========
// tombol "Tambah" di kartu menu
menuGrid.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-btn");
  if (btn) tambah(Number(btn.dataset.id));
});

// tombol di dalam keranjang (+, −, hapus)
cartItemsEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-aksi]");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  if (btn.dataset.aksi === "tambah") ubahJumlah(id, 1);
  if (btn.dataset.aksi === "kurang") ubahJumlah(id, -1);
  if (btn.dataset.aksi === "hapus") hapus(id);
});

// filter kategori
$("filters").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
  chip.classList.add("active");
  kategoriAktif = chip.dataset.kategori;
  renderMenu();
});

// pencarian & urutan
$("search").addEventListener("input", (e) => {
  kataCari = e.target.value.trim().toLowerCase();
  renderMenu();
});
$("sort").addEventListener("change", (e) => {
  urutan = e.target.value;
  renderMenu();
});

// buka/tutup keranjang
$("openCart").addEventListener("click", bukaKeranjang);
$("closeCart").addEventListener("click", tutupKeranjang);
overlay.addEventListener("click", tutupKeranjang);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { tutupKeranjang(); $("modal").hidden = true; }
});

// checkout & kosongkan
$("checkoutBtn").addEventListener("click", checkout);
$("clearBtn").addEventListener("click", () => {
  keranjang = {};
  renderKeranjang();
  toast("Keranjang dikosongkan");
});
$("modalClose").addEventListener("click", () => ($("modal").hidden = true));

// ========== MULAI ==========
muat();
renderMenu();
renderKeranjang();
