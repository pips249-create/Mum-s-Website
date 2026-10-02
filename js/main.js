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

const choiceCopy = {
  personal: {
    title: "Personal cover",
    cover: "Just me",
    text: "This is a plan for you. Vitality’s own illustration, for one adult and including Insurance Premium Tax, starts from £25 a month at age 18 and rises to £38 a month for ages 47 to 79. That is not your price. Age, health and the level of cover all change it. Rosie will quote the plan you actually need."
  },
  family: {
    title: "Family cover",
    cover: "Me and my family",
    text: "One plan can include you, a partner and children. Rosie works out who to include, and which level fits the household budget. The £25 to £38 illustration is for one adult only, so a family price is worked out separately."
  },
  self: {
    title: "Self-employed cover",
    cover: "I’m self-employed",
    text: "If your income stops when you are ill, this is usually a personal plan. If you trade through a limited company, it may sit with the business instead. Rosie explains which arrangement fits. She does not give tax advice."
  },
  business: {
    title: "Business cover",
    cover: "My business",
    text: "This is cover for you and your staff, often paid by the company. What the business can treat as a cost depends on how it is set up. Rosie explains the cover. An accountant confirms the tax treatment."
  }
};

document.querySelectorAll(".choice").forEach((button) => {
  button.addEventListener("click", () => {
    const choice = choiceCopy[button.dataset.choice];
    document.querySelectorAll(".choice").forEach((item) => {
      item.setAttribute("aria-pressed", item === button ? "true" : "false");
    });
    const result = document.querySelector("#choice-result");
    document.querySelector("#choice-title").textContent = choice.title;
    document.querySelector("#choice-copy").textContent = choice.text;
    result.hidden = false;
    const cover = document.querySelector("#cover");
    if (cover) cover.value = choice.cover;
    const next = document.querySelector("#choice-next");
    next.hidden = true;
    next.textContent = "";
  });
});

document.querySelectorAll("[data-insured]").forEach((button) => {
  button.addEventListener("click", () => {
    const insured = document.querySelector("#insured");
    if (insured) insured.value = button.dataset.insured;
    const next = document.querySelector("#choice-next");
    next.hidden = false;
    next.textContent = button.dataset.insured === "No"
      ? "Rosie will start from what you need, and what you want to pay. The call is 30 minutes and there is no obligation."
      : "Bring the plan you have, even roughly. Rosie will say whether it still fits, or whether Vitality would do the job for less.";
  });
});

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
