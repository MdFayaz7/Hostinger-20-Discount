// Change this one value if your referral link ever changes.
const REF_LINK = "https://www.hostinger.com/in?REFERRALCODE=FWHFAYAZMLXB";

const modal = document.getElementById("coupon-modal");
const productEl = modal.querySelector("[data-product]");
const goBtn = document.getElementById("modal-go");
const toast = document.getElementById("toast");
let lastFocus = null;

function openModal(product) {
  lastFocus = document.activeElement;
  productEl.textContent = product;
  goBtn.href = REF_LINK;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  goBtn.focus();
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
  try {
    await navigator.clipboard.writeText(REF_LINK);
    showToast("Referral link copied ✓");
  } catch {
    window.prompt("Copy this link:", REF_LINK);
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
  if (e.target.closest("[data-close]")) closeModal();
});

goBtn.addEventListener("click", () => setTimeout(closeModal, 300));

document.addEventListener("keydown", (e) => {
  if (!modal.hidden && e.key === "Escape") closeModal();
});

// Open a product's coupon directly from a shared link, e.g. /#vps-hosting
const hashTarget = location.hash && document.getElementById(location.hash.slice(1));
const hashCard = hashTarget && hashTarget.classList.contains("card") && hashTarget.querySelector("[data-coupon]");
if (hashCard) openModal(hashCard.dataset.coupon);
