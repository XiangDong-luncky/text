const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const mobileNav = document.querySelector("[data-mobile-nav]");
const bookingDialog = document.querySelector("[data-booking-dialog]");
const bookingForm = document.querySelector("[data-booking-form]");
const bookingSuccess = document.querySelector("[data-booking-success]");
const dateInput = document.querySelector("[data-date-input]");
const phoneError = document.querySelector("[data-phone-error]");

function updateHeader() {
  header?.classList.toggle("is-scrolled", window.scrollY > 36);
}

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

function closeMobileNav() {
  navToggle?.setAttribute("aria-expanded", "false");
  navToggle?.setAttribute("aria-label", "打开导航");
  mobileNav?.classList.remove("is-open");
  document.body.classList.remove("menu-open");
}

navToggle?.addEventListener("click", () => {
  const isOpen = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "打开导航" : "关闭导航");
  mobileNav?.classList.toggle("is-open", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
});

mobileNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMobileNav);
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 1100) {
    closeMobileNav();
  }
});

const menuTabs = Array.from(document.querySelectorAll("[data-menu-tab]"));
const menuPanels = Array.from(document.querySelectorAll("[data-menu-panel]"));

function activateMenuTab(tab) {
  menuTabs.forEach((item) => {
    const active = item === tab;
    item.classList.toggle("is-active", active);
    item.setAttribute("aria-selected", String(active));
    item.tabIndex = active ? 0 : -1;
  });

  menuPanels.forEach((panel) => {
    panel.hidden = panel.id !== tab.getAttribute("aria-controls");
  });
}

menuTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activateMenuTab(tab));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      return;
    }

    event.preventDefault();
    let nextIndex = index;

    if (event.key === "ArrowLeft") nextIndex = (index - 1 + menuTabs.length) % menuTabs.length;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % menuTabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = menuTabs.length - 1;

    activateMenuTab(menuTabs[nextIndex]);
    menuTabs[nextIndex].focus();
  });
});

function toLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function resetBookingDialog() {
  bookingForm?.removeAttribute("hidden");
  if (bookingSuccess) bookingSuccess.hidden = true;
  if (phoneError) phoneError.textContent = "";
  const phoneField = bookingForm?.elements.phone;
  phoneField?.removeAttribute("aria-invalid");
  bookingForm?.reset();
}

function openBooking() {
  resetBookingDialog();
  closeMobileNav();

  if (!bookingDialog) return;

  if (typeof bookingDialog.showModal === "function") {
    bookingDialog.showModal();
  } else {
    bookingDialog.setAttribute("open", "");
  }

  document.body.classList.add("dialog-open");
  if (dateInput) dateInput.min = toLocalDateString(new Date());
}

function closeBooking() {
  if (!bookingDialog) return;

  if (typeof bookingDialog.close === "function" && bookingDialog.open) {
    bookingDialog.close();
  } else {
    bookingDialog.removeAttribute("open");
  }

  document.body.classList.remove("dialog-open");
}

document.querySelectorAll("[data-open-booking]").forEach((button) => {
  button.addEventListener("click", openBooking);
});

document.querySelectorAll("[data-close-booking]").forEach((button) => {
  button.addEventListener("click", closeBooking);
});

bookingDialog?.addEventListener("click", (event) => {
  if (event.target === bookingDialog) closeBooking();
});

bookingDialog?.addEventListener("cancel", () => {
  document.body.classList.remove("dialog-open");
});

bookingDialog?.addEventListener("close", () => {
  document.body.classList.remove("dialog-open");
});

bookingForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(bookingForm);
  const phone = String(formData.get("phone") || "").replace(/\s/g, "");
  const phoneField = bookingForm.elements.phone;

  if (!/^1[3-9]\d{9}$/.test(phone)) {
    phoneField.setAttribute("aria-invalid", "true");
    if (phoneError) phoneError.textContent = "请输入有效的 11 位手机号";
    phoneField.focus();
    return;
  }

  phoneField.removeAttribute("aria-invalid");
  if (phoneError) phoneError.textContent = "";

  if (!bookingForm.reportValidity()) return;

  const date = new Date(`${formData.get("date")}T12:00:00`);
  const formattedDate = new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(date);
  const summary = `${formattedDate} ${formData.get("time")} · ${formData.get("party")} · ${formData.get("name")}`;

  const summaryNode = document.querySelector("[data-success-summary]");
  if (summaryNode) summaryNode.textContent = summary;

  bookingForm.setAttribute("hidden", "");
  if (bookingSuccess) bookingSuccess.hidden = false;
});

bookingForm?.elements.phone?.addEventListener("input", (event) => {
  if (event.currentTarget.getAttribute("aria-invalid") === "true") {
    event.currentTarget.removeAttribute("aria-invalid");
    if (phoneError) phoneError.textContent = "";
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMobileNav();
});

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px" },
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const yearNode = document.querySelector("[data-year]");
if (yearNode) yearNode.textContent = String(new Date().getFullYear());
