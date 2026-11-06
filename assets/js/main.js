// Referral links: India store (.in, ₹) and Global store (.com, $).
const LINKS = {
  in: "https://www.hostinger.com/in?REFERRALCODE=FWHFAYAZMLXB",
  com: "https://www.hostinger.com?REFERRALCODE=FWHFAYAZMLXB",
};

// Best guess at the visitor's store: India by timezone or browser language, otherwise Global.
function detectStore() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (/^Asia\/(Kolkata|Calcutta)$/.test(tz)) return "in";
  } catch {}
  const langs = navigator.languages || [navigator.language || ""];
  return langs.some((l) => /-IN$/i.test(l)) ? "in" : "com";
}
const STORE = detectStore();
const OTHER = STORE === "in" ? "com" : "in";

const modal = document.getElementById("coupon-modal");
const productEl = modal.querySelector("[data-product]");
const storesBox = modal.querySelector(".modal__stores");
const toast = document.getElementById("toast");
let lastFocus = null;

// Put the visitor's likely store first and make the other one secondary.
const mainBtn = storesBox.querySelector(`[data-store="${STORE}"]`);
const altBtn = storesBox.querySelector(`[data-store="${OTHER}"]`);
storesBox.prepend(mainBtn);
altBtn.classList.replace("btn--primary", "btn--outline");

// Main CTAs without a modal fallback point at the detected store when JS runs.
document.querySelectorAll("a[data-coupon]").forEach((a) => { a.href = LINKS[STORE]; });

function openModal(product) {
  lastFocus = document.activeElement;
  productEl.textContent = product;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  mainBtn.focus();
}

function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = "";
  if (lastFocus) lastFocus.focus();
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast.t);
  showToast.t = setTimeout(() => toast.classList.remove("show"), 2200);
}

async function copyLink() {
  const link = LINKS[STORE];
  try {
    await navigator.clipboard.writeText(link);
    showToast(`${STORE === "in" ? "India" : "Global"} referral link copied ✓`);
  } catch {
    window.prompt("Copy this link:", link);
  }
}

document.addEventListener("click", (e) => {
  const coupon = e.target.closest("[data-coupon]");
  if (coupon) {
    // Links still work without JS; with JS, show the coupon ticket first.
    e.preventDefault();
    openModal(coupon.dataset.coupon);
    return;
  }
  if (e.target.closest("[data-copy]")) { copyLink(); return; }
  if (e.target.closest("[data-store]")) { setTimeout(closeModal, 300); return; }
  if (e.target.closest("[data-close]")) closeModal();
});

document.addEventListener("keydown", (e) => {
  if (!modal.hidden && e.key === "Escape") closeModal();
});

// Open a product's coupon directly from a shared link, e.g. /#vps-hosting
const hashTarget = location.hash && document.getElementById(location.hash.slice(1));
const hashCard = hashTarget && hashTarget.classList.contains("card") && hashTarget.querySelector("[data-coupon]");
if (hashCard) openModal(hashCard.dataset.coupon);

// Faint visitor counter in the footer. Counts once per browser session; hidden if the API isn't set up.
(async () => {
  const box = document.getElementById("visits");
  if (!box) return;
  let counted = false;
  try { counted = sessionStorage.getItem("visit-counted") === "1"; } catch {}
  try {
    const r = await fetch("/api/visits", { method: counted ? "GET" : "POST" });
    if (!r.ok) return;
    const { count } = await r.json();
    if (!counted) { try { sessionStorage.setItem("visit-counted", "1"); } catch {} }
    box.querySelector("[data-visits]").textContent = Number(count).toLocaleString("en-IN");
    box.hidden = false;
  } catch {}
})();
