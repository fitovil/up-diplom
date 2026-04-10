const LS_CART_KEY = "candle_cart_v1";
const LS_REVIEWS_KEY = "candle_reviews_v1";
const LS_FAVORITES_KEY = "candle_favorites_v1";

/* ================= CART ================= */

function getCart() {
  try { return JSON.parse(localStorage.getItem(LS_CART_KEY)) || []; }
  catch { return []; }
}

function setCart(cart) {
  localStorage.setItem(LS_CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const badge = document.getElementById("cartCount");
  if (!badge) return;
  const cart = getCart();
  const count = cart.reduce((sum, it) => sum + (it.qty || 1), 0);
  badge.textContent = count;
}

function addToCart(item) {
  const cart = getCart();
  const found = cart.find(x => x.id === item.id);
  if (found) found.qty += 1;
  else cart.push({ ...item, qty: 1 });
  setCart(cart);
}

function removeFromCart(id) {
  const cart = getCart().filter(x => x.id !== id);
  setCart(cart);
}

function clearCart() {
  setCart([]);
}

/* ================= FAVORITES ================= */

function getFavorites() {
  try { return JSON.parse(localStorage.getItem(LS_FAVORITES_KEY)) || []; }
  catch { return []; }
}

function setFavorites(list) {
  localStorage.setItem(LS_FAVORITES_KEY, JSON.stringify(list));
}

function addToFavorites(item) {
  const list = getFavorites();
  const exists = list.find(x => x.id === item.id);

  if (!exists) {
    list.push(item);
    setFavorites(list);
  }
}

function removeFromFavorites(id) {
  const list = getFavorites().filter(x => x.id !== id);
  setFavorites(list);
}

/* ================= REVIEWS ================= */

function getReviews() {
  try { return JSON.parse(localStorage.getItem(LS_REVIEWS_KEY)) || []; }
  catch { return []; }
}

function setReviews(list) {
  localStorage.setItem(LS_REVIEWS_KEY, JSON.stringify(list));
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#039;"
  }[c]));
}

/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", () => {

  updateCartBadge();

  // активная вкладка
  const page = document.body.getAttribute("data-page");
  if (page) {
    document.querySelectorAll("nav a[data-nav]").forEach(a => {
      a.classList.toggle("active", a.getAttribute("data-nav") === page);
    });
  }

  /* ===== ADD TO CART ===== */

  document.querySelectorAll("[data-add-to-cart]").forEach(btn => {
    btn.addEventListener("click", () => {

      const payload = btn.getAttribute("data-add-to-cart");

      try {
        const item = JSON.parse(payload);
        addToCart(item);

        const old = btn.textContent;
        btn.textContent = "Добавлено";

        setTimeout(() => {
          btn.textContent = old;
        }, 900);

      } catch {}
    });
  });

  /* ===== ADD TO FAVORITES ===== */

  document.querySelectorAll("[data-add-to-favorites]").forEach(btn => {
    btn.addEventListener("click", () => {

      const payload = btn.getAttribute("data-add-to-favorites");

      try {
        const item = JSON.parse(payload);
        addToFavorites(item);

        const old = btn.textContent;
        btn.textContent = "В избранном";

        setTimeout(() => {
          btn.textContent = old;
        }, 900);

      } catch {}
    });
  });

  /* ===== CART PAGE ===== */

  const cartRoot = document.getElementById("cartRoot");
  if (cartRoot) renderCart(cartRoot);

  const clearBtn = document.getElementById("clearCartBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      clearCart();
      renderCart(cartRoot);
    });
  }

  /* ===== FAVORITES PAGE ===== */

  const favoritesRoot = document.getElementById("favoritesRoot");
  if (favoritesRoot) renderFavorites(favoritesRoot);

  /* ===== REVIEWS ===== */

  const reviewsRoot = document.getElementById("reviewsRoot");
  if (reviewsRoot) renderReviews(reviewsRoot);

  const reviewForm = document.getElementById("reviewForm");

  if (reviewForm) {
    reviewForm.addEventListener("submit", (e) => {

      e.preventDefault();

      const name = reviewForm.querySelector("[name=name]").value.trim();
      const text = reviewForm.querySelector("[name=text]").value.trim();

      if (!name || !text) return;

      const list = getReviews();

      list.unshift({
        id: crypto.randomUUID(),
        name,
        text,
        createdAt: new Date().toISOString()
      });

      setReviews(list);

      reviewForm.reset();

      renderReviews(reviewsRoot);
    });
  }

});

/* ================= RENDER CART ================= */

function renderCart(root) {

  const cart = getCart();

  if (cart.length === 0) {
    root.innerHTML = `<p>Корзина пустая.</p>`;
    return;
  }

  root.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.img}" alt="">
      <div>
        <h4>${item.title}</h4>
        <small>${item.desc || ""}</small><br>
        <small>Количество: ${item.qty}</small>
      </div>
      <div class="spacer"></div>
      <button class="btn btn--ghost" data-remove="${item.id}">
        Удалить
      </button>
    </div>
  `).join("");

  root.querySelectorAll("[data-remove]").forEach(btn => {
    btn.addEventListener("click", () => {

      removeFromCart(btn.getAttribute("data-remove"));

      renderCart(root);

    });
  });
}

/* ================= RENDER FAVORITES ================= */

function renderFavorites(root) {

  const list = getFavorites();

  if (list.length === 0) {
    root.innerHTML = `<p>Избранное пусто.</p>`;
    return;
  }

  root.innerHTML = list.map(item => `
    <div class="cart-item">
      <img src="${item.img}" alt="">
      <div>
        <h4>${item.title}</h4>
        <small>${item.desc || ""}</small>
      </div>
      <div class="spacer"></div>
      <button class="btn btn--ghost" data-remove-fav="${item.id}">
        Удалить
      </button>
    </div>
  `).join("");

  root.querySelectorAll("[data-remove-fav]").forEach(btn => {

    btn.addEventListener("click", () => {

      removeFromFavorites(btn.getAttribute("data-remove-fav"));

      renderFavorites(root);

    });

  });

}

/* ================= RENDER REVIEWS ================= */

function renderReviews(root) {

  const list = getReviews();

  if (list.length === 0) {
    root.innerHTML = `<p>Пока нет отзывов. Оставьте первый.</p>`;
    return;
  }

  root.innerHTML = list.map(r => {

    const d = new Date(r.createdAt);
    const dateStr = isNaN(d) ? "" : d.toLocaleString("ru-RU");

    return `
      <div class="review">
        <div class="meta">${escapeHtml(r.name)} • ${dateStr}</div>
        <div>${escapeHtml(r.text).replaceAll("\n","<br>")}</div>
      </div>
    `;

  }).join("");
}