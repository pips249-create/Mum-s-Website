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

document.querySelectorAll(".choice[data-choice]").forEach((button) => {
  button.addEventListener("click", () => {
    const choice = choiceCopy[button.dataset.choice];
    if (!choice) return;
    document.querySelectorAll(".choice[data-choice]").forEach((item) => {
      item.setAttribute("aria-pressed", item === button ? "true" : "false");
    });
    const result = document.querySelector("#choice-result");
    const title = document.querySelector("#choice-title");
    const copy = document.querySelector("#choice-copy");
    if (!result || !title || !copy) return;
    title.textContent = choice.title;
    copy.textContent = choice.text;
    result.hidden = false;
    const cover = document.querySelector("#cover");
    if (cover) cover.value = choice.cover;
    try { sessionStorage.setItem("mmc-cover", choice.cover); } catch (err) {}
    const next = document.querySelector("#choice-next");
    if (next) {
      next.hidden = true;
      next.textContent = "";
    }
  });
});

document.querySelectorAll("[data-insured]").forEach((button) => {
  button.addEventListener("click", () => {
    const insured = document.querySelector("#insured");
    if (insured) insured.value = button.dataset.insured;
    try { sessionStorage.setItem("mmc-insured", button.dataset.insured); } catch (err) {}
    const next = document.querySelector("#choice-next");
    if (!next) return;
    next.hidden = false;
    next.textContent = button.dataset.insured === "No"
      ? "Rosie will start from what you need, and what you want to pay. The call is 30 minutes and there is no obligation."
      : "Bring the plan you have, even roughly. Rosie will say whether it still fits, or whether Vitality would do the job for less.";
  });
});

const coverField = document.querySelector("#cover");
if (coverField) {
  try {
    const savedCover = sessionStorage.getItem("mmc-cover");
    const savedInsured = sessionStorage.getItem("mmc-insured");
    if (savedCover) coverField.value = savedCover;
    const insuredField = document.querySelector("#insured");
    if (insuredField && savedInsured) insuredField.value = savedInsured;
  } catch (err) {}
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

const quiz = document.querySelector("#quiz");
const quizForm = document.querySelector("#quiz-form");
if (quiz && quizForm) {
  const answers = {};
  const steps = [...quiz.querySelectorAll(".quiz-step")];
  const stepNum = quiz.querySelector("#quiz-step-num");
  const bar = quiz.querySelector("#quiz-bar");
  const count = quiz.querySelector("#quiz-count");
  const success = quiz.querySelector("#quiz-success");
  const summary = quiz.querySelector("#quiz-summary");

  const showStep = (number) => {
    steps.forEach((step) => {
      step.hidden = Number(step.dataset.step) !== number;
    });
    stepNum.textContent = String(number);
    bar.style.width = `${number * 20}%`;
    quiz.scrollIntoView({ block: "start" });
  };

  const whoLine = {
    "Just me": "just you",
    "Me and my family": "you and your family",
    "Self-employed": "you as someone self-employed",
    "My business": "your business"
  };
  const situationLine = {
    "New to private healthcare": "You are new to private healthcare",
    "Already covered": "You already have cover",
    "Had cover before": "You have had cover before"
  };
  const priorityLine = {
    "Faster specialist access": "You want a faster route to a specialist. What that includes depends on the plan.",
    "Active rewards": "You are interested in rewards for staying active, such as an Apple Watch, a gym discount or coffee. Those offers depend on the plan and can change.",
    "Broad cover and cancer care": "You want broader cover, including cancer care where the plan includes it.",
    "Mental health support": "You want mental health support, such as therapy or wellbeing tools, where the plan includes them."
  };

  quiz.querySelectorAll(".quiz-option[data-value]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.key;
      const value = button.dataset.value;
      answers[key] = value;
      try {
        if (key === "who") {
          const coverFor = {
            "Just me": "Just me",
            "Me and my family": "Me and my family",
            "Self-employed": "I’m self-employed",
            "My business": "My business"
          }[value];
          if (coverFor) sessionStorage.setItem("mmc-cover", coverFor);
        }
        if (key === "situation") {
          sessionStorage.setItem("mmc-insured", value === "Already covered" ? "Yes — I’d like it reviewed" : "No");
        }
      } catch (err) {}
      const field = quizForm.querySelector(`#quiz-${key}`);
      if (field) field.value = value;
      button.parentElement.querySelectorAll(".quiz-option").forEach((item) => {
        item.setAttribute("aria-pressed", item === button ? "true" : "false");
      });
      const step = Number(button.closest(".quiz-step").dataset.step);
      if (step < 5) showStep(step + 1);
    });
  });

  quiz.querySelectorAll("[data-goto]").forEach((button) => {
    button.addEventListener("click", () => showStep(Number(button.dataset.goto)));
  });

  quizForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const error = quizForm.querySelector(".error");
    const showError = (message) => { error.textContent = message; };
    const showSuccess = () => {
      steps.forEach((step) => { step.hidden = true; });
      count.hidden = true;
      quiz.querySelector(".quiz-progress").hidden = true;
      success.hidden = false;
      success.focus();
    };
    showError("");

    const data = new FormData(quizForm);
    if (String(data.get("website") || "").trim()) {
      showSuccess();
      return;
    }

    const name = String(data.get("first_name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const time = String(data.get("time") || "");
    const consent = quizForm.querySelector("#quiz-consent").checked;

    if (name.length < 2) return showError("Please add your first name.");
    if (phone.replace(/\D/g, "").length < 10) return showError("Please add a phone number Rosie can call.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError("Please add a valid email address.");
    if (!time) return showError("Please choose a time for Rosie to call.");
    if (!consent) return showError("Please agree to being contacted, and confirm you have read the privacy policy.");
    if (!answers.who || !answers.priority || !answers.situation || !answers.activity) {
      return showError("Please go back and answer each question.");
    }

    summary.textContent = `Rosie will prepare a conversation about cover for ${whoLine[answers.who]}. ${priorityLine[answers.priority]} ${situationLine[answers.situation]}, and your week sounds ${answers.activity.toLowerCase()}. She will explain what a plan can and cannot include. This is not a quote, and it is not a health assessment.`;

    const button = quizForm.querySelector("button[type=submit]");
    button.disabled = true;
    button.textContent = "Sending…";

    try {
      const response = await fetch("https://formsubmit.co/ajax/rosie.mcgilvray@va.vitality.co.uk", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data
      });
      if (!response.ok) throw new Error("Request failed");
      showSuccess();
    } catch (err) {
      button.disabled = false;
      button.textContent = "See my match";
      const subject = encodeURIComponent("Cover and rewards match");
      const body = encodeURIComponent(
        `First name: ${name}\nEmail: ${email}\nPhone: ${phone}\nBest time: ${time}\n\nWho: ${answers.who}\nPriority: ${answers.priority}\nSituation: ${answers.situation}\nActivity: ${answers.activity}\n\nCover and rewards match. Not a quote.`
      );
      showError("The form could not be sent just now. You can email Rosie directly.");
      const fallback = quizForm.querySelector(".fallback");
      fallback.hidden = false;
      fallback.href = `mailto:Rosie.mcgilvray@va.vitality.co.uk?subject=${subject}&body=${body}`;
    }
  });
}

const perkCarousel = document.querySelector("[data-perk-carousel]");
if (perkCarousel) {
  const viewport = perkCarousel.querySelector(".perk-viewport");
  const track = perkCarousel.querySelector(".perk-track");
  const pauseBtn = perkCarousel.querySelector("[data-perk-pause]");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let timer;
  let busy = false;
  let moving = "";
  let userPaused = reduced;
  let hoverPaused = false;

  const step = () => {
    const card = track.firstElementChild;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return card.getBoundingClientRect().width + gap;
  };

  const play = () => {
    clearInterval(timer);
    if (userPaused || hoverPaused || reduced || document.hidden) return;
    timer = setInterval(() => go(1), 3200);
  };

  const go = (direction) => {
    if (busy || !track.firstElementChild) return;
    const distance = step();
    if (reduced) {
      if (direction > 0) track.appendChild(track.firstElementChild);
      else track.prepend(track.lastElementChild);
      return;
    }
    busy = true;
    moving = direction > 0 ? "next" : "prev";
    if (direction < 0) {
      track.prepend(track.lastElementChild);
      track.style.transition = "none";
      track.style.transform = `translateX(${-distance}px)`;
      track.offsetHeight;
      track.style.transition = "";
      track.style.transform = "translateX(0)";
      return;
    }
    track.style.transform = `translateX(${-distance}px)`;
  };

  track.addEventListener("transitionend", (event) => {
    if (event.target !== track || event.propertyName !== "transform") return;
    if (moving === "next") {
      track.style.transition = "none";
      track.appendChild(track.firstElementChild);
      track.style.transform = "translateX(0)";
      track.offsetHeight;
      track.style.transition = "";
    }
    busy = false;
    moving = "";
  });

  perkCarousel.querySelector("[data-perk-next]").addEventListener("click", () => {
    go(1);
    play();
  });
  perkCarousel.querySelector("[data-perk-prev]").addEventListener("click", () => {
    go(-1);
    play();
  });
  pauseBtn.addEventListener("click", () => {
    userPaused = !userPaused;
    pauseBtn.textContent = userPaused ? "Play" : "Pause";
    pauseBtn.setAttribute("aria-pressed", userPaused ? "true" : "false");
    play();
  });
  perkCarousel.addEventListener("mouseenter", () => { hoverPaused = true; play(); });
  perkCarousel.addEventListener("mouseleave", () => { hoverPaused = false; play(); });
  perkCarousel.addEventListener("focusin", () => { hoverPaused = true; play(); });
  perkCarousel.addEventListener("focusout", () => { hoverPaused = false; play(); });
  document.addEventListener("visibilitychange", play);

  if (reduced) {
    pauseBtn.textContent = "Play";
    pauseBtn.setAttribute("aria-pressed", "true");
  }

  const watcher = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.tabIndex = entry.intersectionRatio > 0.7 ? 0 : -1;
    });
  }, { root: viewport, threshold: [0.7, 1] });
  track.querySelectorAll(".perk").forEach((card) => watcher.observe(card));
  play();
}
