const nav = document.querySelector(".nav");
const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");

if (nav) {
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
    });
  });
}

const form = document.querySelector("#referral-form");
if (form) {
  const error = form.querySelector(".error");
  const success = document.querySelector("#referral-success");

  const showError = (message) => {
    error.textContent = message;
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    showError("");

    const data = new FormData(form);
    if (String(data.get("website") || "").trim()) {
      form.hidden = true;
      success.hidden = false;
      return;
    }

    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const consent = form.querySelector("#consent").checked;
    const voucher = form.querySelector("#voucher-confirm").checked;

    if (name.length < 2) return showError("Please add your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError("Please add a valid email address.");
    if (phone.replace(/\D/g, "").length < 10) return showError("Please add a phone number Rosie can call.");
    if (!voucher) return showError("Please confirm you were referred by The Networker UK.");
    if (!consent) return showError("Please agree to being contacted, and confirm you have read the privacy policy.");

    const button = form.querySelector("button[type=submit]");
    button.disabled = true;
    button.textContent = "Sending…";

    try {
      const response = await fetch("https://formsubmit.co/ajax/rosie.mcgilvray@va.vitality.co.uk", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data
      });
      if (!response.ok) throw new Error("Request failed");
      form.hidden = true;
      success.hidden = false;
      success.focus();
    } catch (err) {
      button.disabled = false;
      button.textContent = "Send my referral";
      const subject = encodeURIComponent("Referral from The Networker UK");
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nCover for: ${data.get("cover")}\nAlready insured: ${data.get("insured")}\nBest time: ${data.get("time") || ""}\n\n${data.get("message") || ""}\n\nReferred by The Networker UK. £100 Amazon voucher enquiry.`
      );
      showError("The form could not be sent just now. You can email Rosie directly and your referral will still be recorded.");
      const fallback = form.querySelector(".fallback");
      fallback.hidden = false;
      fallback.href = `mailto:Rosie.mcgilvray@va.vitality.co.uk?subject=${subject}&body=${body}`;
    }
  });
}
