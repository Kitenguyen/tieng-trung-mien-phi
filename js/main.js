// Countdown placeholder cho Sprint 1:
// dùng localStorage để giữ mốc thời gian ổn định giữa các lần tải trang.
(function () {
  const STORAGE_KEY = "hlpad-countdown-deadline";
  const COUNTDOWN_DURATION = 72 * 60 * 60 * 1000;

  const dayElement = document.getElementById("countdown-days");
  const hourElement = document.getElementById("countdown-hours");
  const minuteElement = document.getElementById("countdown-minutes");
  const secondElement = document.getElementById("countdown-seconds");
  const slotsElement = document.getElementById("slots-value");

  if (!dayElement || !hourElement || !minuteElement || !secondElement || !slotsElement) {
    return;
  }

  function getDeadline() {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    const storedDeadline = storedValue ? Number(storedValue) : NaN;

    if (Number.isFinite(storedDeadline) && storedDeadline > Date.now()) {
      return storedDeadline;
    }

    const newDeadline = Date.now() + COUNTDOWN_DURATION;
    window.localStorage.setItem(STORAGE_KEY, String(newDeadline));
    return newDeadline;
  }

  function formatUnit(value) {
    return String(value).padStart(2, "0");
  }

  function updateSlots(remainingTime) {
    // Placeholder khan hiếm: chỉ giảm nhẹ theo tiến trình thời gian để tạo cảm giác động.
    const totalSlots = 27;
    const elapsedRatio = 1 - remainingTime / COUNTDOWN_DURATION;
    const usedSlots = Math.min(9, Math.max(0, Math.floor(elapsedRatio * 10)));
    const remainingSlots = totalSlots - usedSlots;

    slotsElement.textContent = `${remainingSlots} suất`;
  }

  function renderCountdown(deadline) {
    const remainingTime = Math.max(deadline - Date.now(), 0);

    const totalSeconds = Math.floor(remainingTime / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    dayElement.textContent = formatUnit(days);
    hourElement.textContent = formatUnit(hours);
    minuteElement.textContent = formatUnit(minutes);
    secondElement.textContent = formatUnit(seconds);

    updateSlots(remainingTime);

    if (remainingTime === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }

  const deadline = getDeadline();
  renderCountdown(deadline);

  window.setInterval(function () {
    renderCountdown(deadline);
  }, 1000);
})();

// Fade Up animation cho Sprint 1:
// chỉ áp dụng cho các phần tử được gắn data-fade-up để không ảnh hưởng code cũ.
(function () {
  const fadeElements = document.querySelectorAll("[data-fade-up]");

  if (!fadeElements.length) {
    return;
  }

  if (!("IntersectionObserver" in window)) {
    fadeElements.forEach(function (element) {
      element.classList.add("is-visible");
    });
    return;
  }

  const observer = new IntersectionObserver(
    function (entries, currentObserver) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.2,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  fadeElements.forEach(function (element) {
    observer.observe(element);
  });
})();

// Fade In va Zoom animation cho production sprint:
// mo rong he thong reveal ma khong can sua logic cu cua fade-up.
(function () {
  const revealElements = document.querySelectorAll("[data-fade-in], [data-zoom-in]");

  if (!revealElements.length) {
    return;
  }

  if (!("IntersectionObserver" in window)) {
    revealElements.forEach(function (element) {
      element.classList.add("is-visible");
    });
    return;
  }

  const revealObserver = new IntersectionObserver(
    function (entries, currentObserver) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -32px 0px"
    }
  );

  revealElements.forEach(function (element) {
    revealObserver.observe(element);
  });
})();

// UI layer helpers cho Sprint 11:
// quản lý scroll lock và focus restore dùng chung cho các overlay để tránh xung đột trạng thái.
(function () {
  const sharedState = window.__hlpadUiState || {
    scrollLockCount: 0,
    lastFocusedElement: null
  };

  window.__hlpadUiState = sharedState;

  window.hlpRememberFocus = function () {
    sharedState.lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  };

  window.hlpRestoreFocus = function () {
    if (sharedState.lastFocusedElement && typeof sharedState.lastFocusedElement.focus === "function") {
      sharedState.lastFocusedElement.focus();
    }
  };

  window.hlpLockScroll = function () {
    sharedState.scrollLockCount += 1;

    if (sharedState.scrollLockCount === 1) {
      document.body.style.overflow = "hidden";
    }
  };

  window.hlpUnlockScroll = function () {
    sharedState.scrollLockCount = Math.max(0, sharedState.scrollLockCount - 1);

    if (sharedState.scrollLockCount === 0) {
      document.body.style.overflow = "";
    }
  };
})();

// Mobile menu va active navigation cho production sprint:
// dong bo sticky header, keyboard va scroll spy ma khong can thu vien ngoai.
(function () {
  const siteHeader = document.getElementById("site-header");
  const menuToggle = document.getElementById("menu-toggle");
  const siteNav = document.getElementById("site-nav");
  const navLinks = document.querySelectorAll(".site-nav-link");

  if (!siteHeader || !menuToggle || !siteNav || !navLinks.length) {
    return;
  }

  const trackedSections = Array.from(navLinks)
    .map(function (link) {
      const href = link.getAttribute("href") || "";
      return href.startsWith("#") ? document.querySelector(href) : null;
    })
    .filter(Boolean);

  function openMenu() {
    menuToggle.setAttribute("aria-expanded", "true");
    siteNav.classList.add("is-open");
    document.body.classList.add("menu-open");
    window.hlpLockScroll();
  }

  function closeMenu() {
    menuToggle.setAttribute("aria-expanded", "false");
    siteNav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    window.hlpUnlockScroll();
  }

  function toggleMenu() {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";

    if (isExpanded) {
      closeMenu();
      return;
    }

    window.hlpRememberFocus();
    openMenu();
  }

  function updateActiveLink() {
    const currentOffset = window.scrollY + 140;
    let activeId = "";

    trackedSections.forEach(function (section) {
      if (currentOffset >= section.offsetTop) {
        activeId = `#${section.id}`;
      }
    });

    navLinks.forEach(function (link) {
      const isActive = link.getAttribute("href") === activeId;
      link.classList.toggle("is-active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "page");
        return;
      }

      link.removeAttribute("aria-current");
    });
  }

  menuToggle.addEventListener("click", toggleMenu);

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      closeMenu();
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && siteNav.classList.contains("is-open")) {
      closeMenu();
      window.hlpRestoreFocus();
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth >= 1024 && siteNav.classList.contains("is-open")) {
      closeMenu();
    }
  });

  updateActiveLink();
  window.addEventListener("scroll", updateActiveLink, { passive: true });

  if ("IntersectionObserver" in window) {
    const headerObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          siteHeader.classList.toggle("is-scrolled", !entry.isIntersecting);
        });
      },
      {
        threshold: 0,
        rootMargin: "-80px 0px 0px 0px"
      }
    );

    const hero = document.getElementById("hero");

    if (hero) {
      headerObserver.observe(hero);
    }
  }
})();

// Ripple effect cho CTA production:
// tao phan hoi nhe tren nhung nut duoc gan data-ripple.
(function () {
  const rippleTriggers = document.querySelectorAll("[data-ripple]");

  if (!rippleTriggers.length) {
    return;
  }

  rippleTriggers.forEach(function (trigger) {
    trigger.addEventListener("click", function (event) {
      const rect = trigger.getBoundingClientRect();
      const ripple = document.createElement("span");

      ripple.className = "button-ripple";
      ripple.style.left = `${event.clientX - rect.left}px`;
      ripple.style.top = `${event.clientY - rect.top}px`;

      trigger.appendChild(ripple);

      window.setTimeout(function () {
        ripple.remove();
      }, 600);
    });
  });
})();

// Slider review cho Sprint 2:
// tách biệt hoàn toàn với các phần khác và không phụ thuộc thư viện ngoài.
(function () {
  const slider = document.getElementById("review-slider");
  const track = document.getElementById("review-track");
  const prevButton = document.getElementById("slider-prev");
  const nextButton = document.getElementById("slider-next");
  const dots = document.querySelectorAll(".slider-dot");

  if (!slider || !track || !prevButton || !nextButton || !dots.length) {
    return;
  }

  const slides = track.children;
  let currentIndex = 0;

  function updateSlider(index) {
    const safeIndex = (index + slides.length) % slides.length;
    currentIndex = safeIndex;
    track.style.transform = `translateX(-${safeIndex * 100}%)`;

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === safeIndex);
    });
  }

  prevButton.addEventListener("click", function () {
    updateSlider(currentIndex - 1);
  });

  nextButton.addEventListener("click", function () {
    updateSlider(currentIndex + 1);
  });

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      const slideIndex = Number(dot.getAttribute("data-slide"));
      updateSlider(slideIndex);
    });
  });

  updateSlider(0);
})();

// Lightbox và gallery cho Sprint 2:
// dùng một modal chung cho ảnh và video giới thiệu để giữ code gọn và dễ mở rộng.
(function () {
  const lightbox = document.getElementById("lightbox");
  const lightboxBackdrop = document.getElementById("lightbox-backdrop");
  const lightboxClose = document.getElementById("lightbox-close");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxVideo = document.getElementById("lightbox-video");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const triggers = document.querySelectorAll("[data-lightbox-type]");

  if (!lightbox || !lightboxBackdrop || !lightboxClose || !lightboxImage || !lightboxVideo || !lightboxCaption || !triggers.length) {
    return;
  }

  function openLightbox(type, source, caption) {
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    window.hlpRememberFocus();
    window.hlpLockScroll();
    lightboxCaption.textContent = caption || "";

    if (type === "image") {
      lightboxImage.style.display = "block";
      lightboxVideo.style.display = "none";
      lightboxImage.src = source;
      lightboxImage.alt = caption || "Gallery image";
      lightboxClose.focus();
      return;
    }

    lightboxImage.style.display = "none";
    lightboxVideo.style.display = "block";
    lightboxImage.removeAttribute("src");
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    window.hlpUnlockScroll();
    lightboxImage.style.display = "none";
    lightboxVideo.style.display = "none";
    lightboxImage.removeAttribute("src");
    lightboxCaption.textContent = "";
    window.hlpRestoreFocus();
  }

  triggers.forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      const type = trigger.getAttribute("data-lightbox-type");
      const source = trigger.getAttribute("data-lightbox-src") || "";
      const caption = trigger.getAttribute("data-lightbox-caption") || "Video giới thiệu";
      openLightbox(type, source, caption);
    });
  });

  lightboxClose.addEventListener("click", closeLightbox);
  lightboxBackdrop.addEventListener("click", closeLightbox);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
      closeLightbox();
    }
  });
})();

// Lazy load native cho Sprint 2:
// chỉ áp dụng với ảnh có data-src để không can thiệp vào ảnh đang dùng sẵn.
(function () {
  const lazyImages = document.querySelectorAll(".lazy-image[data-src]");

  if (!lazyImages.length) {
    return;
  }

  function loadImage(image) {
    const source = image.getAttribute("data-src");

    if (!source) {
      return;
    }

    image.decoding = "async";
    image.src = source;
    image.addEventListener(
      "load",
      function () {
        image.classList.add("is-loaded");
        image.removeAttribute("data-src");
      },
      { once: true }
    );
  }

  if (!("IntersectionObserver" in window)) {
    lazyImages.forEach(loadImage);
    return;
  }

  const imageObserver = new IntersectionObserver(
    function (entries, currentObserver) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }

        loadImage(entry.target);
        currentObserver.unobserve(entry.target);
      });
    },
    {
      rootMargin: "120px 0px"
    }
  );

  lazyImages.forEach(function (image) {
    imageObserver.observe(image);
  });
})();

// FAQ accordion cho Sprint 5:
// điều khiển mở/đóng mượt và đồng bộ ARIA mà không phụ thuộc thư viện ngoài.
(function () {
  const faqQuestions = document.querySelectorAll(".faq-question");

  if (!faqQuestions.length) {
    return;
  }

  function closeAnswer(button, answer) {
    button.setAttribute("aria-expanded", "false");
    answer.classList.remove("is-open");
    answer.style.maxHeight = "0px";
  }

  function openAnswer(button, answer) {
    button.setAttribute("aria-expanded", "true");
    answer.classList.add("is-open");
    answer.style.maxHeight = `${answer.scrollHeight}px`;
  }

  faqQuestions.forEach(function (button) {
    const answerId = button.getAttribute("aria-controls");
    const answer = answerId ? document.getElementById(answerId) : null;

    if (!answer) {
      return;
    }

    if (button.getAttribute("aria-expanded") === "true") {
      answer.style.maxHeight = `${answer.scrollHeight}px`;
    }

    button.addEventListener("click", function () {
      const isExpanded = button.getAttribute("aria-expanded") === "true";

      faqQuestions.forEach(function (otherButton) {
        const otherAnswerId = otherButton.getAttribute("aria-controls");
        const otherAnswer = otherAnswerId ? document.getElementById(otherAnswerId) : null;

        if (!otherAnswer) {
          return;
        }

        if (otherButton !== button) {
          closeAnswer(otherButton, otherAnswer);
        }
      });

      if (isExpanded) {
        closeAnswer(button, answer);
        return;
      }

      openAnswer(button, answer);
    });
  });

  window.addEventListener("resize", function () {
    faqQuestions.forEach(function (button) {
      const answerId = button.getAttribute("aria-controls");
      const answer = answerId ? document.getElementById(answerId) : null;

      if (!answer) {
        return;
      }

      if (button.getAttribute("aria-expanded") === "true") {
        answer.style.maxHeight = `${answer.scrollHeight}px`;
      }
    });
  });
})();

// Lead form cho Sprint 6:
// xử lý realtime validation, loading state và submit tới Google Apps Script qua config.js.
(function () {
  const form = document.getElementById("lead-form");

  if (!form) {
    return;
  }

  const submitButton = document.getElementById("form-submit");
  const statusElement = document.getElementById("form-status");
  const progressFill = document.getElementById("form-progress-fill");
  const progressValue = document.getElementById("form-progress-value");
  const formConfig = window.APP_CONFIG || {};
  const scriptUrl = typeof formConfig.GOOGLE_APPS_SCRIPT_URL === "string" ? formConfig.GOOGLE_APPS_SCRIPT_URL.trim() : "";

  const fieldMap = {
    fullName: {
      input: document.getElementById("full-name"),
      error: document.getElementById("full-name-error"),
      required: true,
      validate: function (value) {
        if (!value.trim()) {
          return "Vui lòng nhập họ tên.";
        }

        if (value.trim().length < 2) {
          return "Họ tên cần ít nhất 2 ký tự.";
        }

        return "";
      }
    },
    phoneNumber: {
      input: document.getElementById("phone-number"),
      error: document.getElementById("phone-number-error"),
      required: true,
      validate: function (value) {
        const normalizedValue = value.replace(/\s+/g, "");

        if (!normalizedValue) {
          return "Vui lòng nhập số điện thoại.";
        }

        if (!/^(0|\+84)\d{8,10}$/.test(normalizedValue)) {
          return "Số điện thoại chưa đúng định dạng.";
        }

        return "";
      }
    },
    studentClass: {
      input: document.getElementById("student-class"),
      error: document.getElementById("student-class-error"),
      required: false,
      validate: function (value) {
        if (!value.trim()) {
          return "";
        }

        return "";
      }
    },
    learningGoal: {
      input: document.getElementById("learning-goal"),
      error: document.getElementById("learning-goal-error"),
      required: false,
      validate: function (value) {
        if (!value.trim()) {
          return "";
        }

        if (value.trim().length > 0 && value.trim().length < 10) {
          return "Mục tiêu học cần rõ hơn một chút.";
        }

        return "";
      }
    }
  };

  function setStatus(message, type) {
    statusElement.textContent = message;
    statusElement.classList.remove("is-success", "is-error");

    if (type) {
      statusElement.classList.add(type);
    }
  }

  function setFieldState(input, errorElement, message) {
    const isValid = !message;

    errorElement.textContent = message;
    input.setAttribute("aria-invalid", String(!isValid));
    input.classList.toggle("is-invalid", !isValid);
    input.classList.toggle("is-valid", isValid && input.value.trim() !== "");
  }

  function updateFormProgress() {
    const fields = Object.keys(fieldMap);
    const filledCount = fields.reduce(function (count, fieldKey) {
      const field = fieldMap[fieldKey];

      if (!field || !field.input) {
        return count;
      }

      return count + (field.input.value.trim() ? 1 : 0);
    }, 0);

    const percent = Math.round((filledCount / fields.length) * 100);

    if (progressFill) {
      progressFill.style.width = `${percent}%`;
    }

    if (progressValue) {
      progressValue.textContent = `${percent}%`;
    }
  }

  function validateField(fieldKey) {
    const field = fieldMap[fieldKey];

    if (!field || !field.input || !field.error) {
      return true;
    }

    const message = field.validate(field.input.value);
    setFieldState(field.input, field.error, message);
    return !message;
  }

  function validateForm() {
    return Object.keys(fieldMap).every(validateField);
  }

  function toggleLoading(isLoading) {
    submitButton.classList.toggle("is-loading", isLoading);
    submitButton.disabled = isLoading;
  }

  Object.keys(fieldMap).forEach(function (fieldKey) {
    const field = fieldMap[fieldKey];

    if (!field.input) {
      return;
    }

    field.input.addEventListener("input", function () {
      validateField(fieldKey);
      setStatus("", "");
      updateFormProgress();
    });

    field.input.addEventListener("blur", function () {
      validateField(fieldKey);
    });
  });

  updateFormProgress();

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    setStatus("", "");

    const isFormValid = validateForm();

    if (!isFormValid) {
      setStatus("Vui lòng kiểm tra lại các trường bắt buộc.", "is-error");
      return;
    }

    if (!scriptUrl) {
      setStatus("Chưa cấu hình Google Apps Script URL trong js/config.js.", "is-error");
      return;
    }

    const payload = {
      fullName: fieldMap.fullName.input.value.trim(),
      phoneNumber: fieldMap.phoneNumber.input.value.trim(),
      studentClass: fieldMap.studentClass.input.value.trim(),
      learningGoal: fieldMap.learningGoal.input.value.trim(),
      submittedAt: new Date().toISOString()
    };

    toggleLoading(true);
    setStatus("Đang gửi thông tin, vui lòng chờ một chút...", "");

    fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("REQUEST_FAILED");
        }

        return response.text().catch(function () {
          return "";
        });
      })
      .then(function () {
        form.reset();

        Object.keys(fieldMap).forEach(function (fieldKey) {
          const field = fieldMap[fieldKey];

          if (!field.input || !field.error) {
            return;
          }

          field.input.classList.remove("is-valid", "is-invalid");
          field.error.textContent = "";
        });

        updateFormProgress();

        document.dispatchEvent(
          new CustomEvent("hlpad:form-submit-success", {
            detail: payload
          })
        );

        setStatus("Gửi thông tin thành công. Chúng tôi sẽ liên hệ với bạn sớm nhất có thể.", "is-success");
      })
      .catch(function () {
        setStatus("Có lỗi xảy ra khi gửi form. Vui lòng thử lại sau.", "is-error");
      })
      .finally(function () {
        toggleLoading(false);
      });
  });
})();

// Floating actions cho Sprint 7:
// điều khiển nút back-to-top theo vị trí cuộn và giữ hành vi mượt, độc lập.
(function () {
  const backToTopButton = document.getElementById("back-to-top-button");
  const contactActions = document.getElementById("contact-actions");
  const contactToggle = document.getElementById("contact-toggle");
  const contactToggleIcon = document.querySelector(".contact-toggle-icon");

  if (!backToTopButton) {
    return;
  }

  function setContactActionsCollapsed(isCollapsed) {
    if (!contactActions || !contactToggle) {
      return;
    }

    contactActions.classList.toggle("is-collapsed", isCollapsed);
    contactToggle.setAttribute("aria-expanded", String(!isCollapsed));

    if (contactToggleIcon) {
      contactToggleIcon.textContent = isCollapsed ? "+" : "−";
    }
  }

  function updateBackToTopVisibility() {
    const shouldShow = window.scrollY > 360;
    backToTopButton.classList.toggle("is-visible", shouldShow);
  }

  backToTopButton.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

  if (contactToggle && contactActions) {
    contactToggle.addEventListener("click", function () {
      const isCollapsed = contactActions.classList.contains("is-collapsed");
      setContactActionsCollapsed(!isCollapsed);
    });
  }

  updateBackToTopVisibility();
  setContactActionsCollapsed(false);
  window.addEventListener("scroll", updateBackToTopVisibility, { passive: true });
})();

// Urgency controls cho Sprint 8:
// dùng countdown và scarcity riêng để không ảnh hưởng khối countdown đã có từ Sprint 1.
(function () {
  const STORAGE_KEY = "hlpad-urgency-deadline";
  const COUNTDOWN_DURATION = 48 * 60 * 60 * 1000;
  const urgencyElements = {
    days: document.getElementById("urgency-days"),
    hours: document.getElementById("urgency-hours"),
    minutes: document.getElementById("urgency-minutes"),
    seconds: document.getElementById("urgency-seconds"),
    progressBar: document.getElementById("urgency-progress-bar"),
    slotsValue: document.getElementById("urgency-slots-value"),
    slotsLeft: document.getElementById("urgency-slots-left"),
    progressText: document.getElementById("urgency-progress-text")
  };

  if (!urgencyElements.days || !urgencyElements.hours || !urgencyElements.minutes || !urgencyElements.seconds || !urgencyElements.progressBar || !urgencyElements.slotsValue || !urgencyElements.slotsLeft || !urgencyElements.progressText) {
    return;
  }

  function getUrgencyDeadline() {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    const storedDeadline = storedValue ? Number(storedValue) : NaN;

    if (Number.isFinite(storedDeadline) && storedDeadline > Date.now()) {
      return storedDeadline;
    }

    const nextDeadline = Date.now() + COUNTDOWN_DURATION;
    window.localStorage.setItem(STORAGE_KEY, String(nextDeadline));
    return nextDeadline;
  }

  function formatUnit(value) {
    return String(value).padStart(2, "0");
  }

  function updateScarcity(remainingTime) {
    const totalSlots = 50;
    const baseReservedSlots = 38;
    const elapsedRatio = 1 - remainingTime / COUNTDOWN_DURATION;
    const dynamicReservedSlots = Math.min(47, baseReservedSlots + Math.floor(elapsedRatio * 8));
    const slotsLeft = totalSlots - dynamicReservedSlots;
    const progressPercent = Math.round((dynamicReservedSlots / totalSlots) * 100);

    urgencyElements.slotsValue.textContent = `${dynamicReservedSlots} / ${totalSlots} suất`;
    urgencyElements.slotsLeft.textContent = `${slotsLeft} suất`;
    urgencyElements.progressText.textContent = `${progressPercent}% suất ưu đãi đã được giữ.`;
    urgencyElements.progressBar.style.width = `${progressPercent}%`;
  }

  function renderUrgency(deadline) {
    const remainingTime = Math.max(deadline - Date.now(), 0);
    const totalSeconds = Math.floor(remainingTime / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    urgencyElements.days.textContent = formatUnit(days);
    urgencyElements.hours.textContent = formatUnit(hours);
    urgencyElements.minutes.textContent = formatUnit(minutes);
    urgencyElements.seconds.textContent = formatUnit(seconds);

    updateScarcity(remainingTime);

    if (remainingTime === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }

  const deadline = getUrgencyDeadline();
  renderUrgency(deadline);

  window.setInterval(function () {
    renderUrgency(deadline);
  }, 1000);
})();

// Exit intent popup cho Sprint 8:
// chỉ hiển thị một lần mỗi phiên để tránh gây khó chịu khi người dùng tiếp tục tương tác.
(function () {
  const exitPopup = document.getElementById("exit-popup");
  const exitPopupBackdrop = document.getElementById("exit-popup-backdrop");
  const exitPopupClose = document.getElementById("exit-popup-close");
  const exitPopupCta = document.getElementById("exit-popup-cta");

  if (!exitPopup || !exitPopupBackdrop || !exitPopupClose || !exitPopupCta) {
    return;
  }

  const SESSION_KEY = "hlpad-exit-popup-shown";

  function openExitPopup() {
    if (window.sessionStorage.getItem(SESSION_KEY) === "1") {
      return;
    }

    window.sessionStorage.setItem(SESSION_KEY, "1");
    exitPopup.classList.add("is-open");
    exitPopup.setAttribute("aria-hidden", "false");
    window.hlpRememberFocus();
    window.hlpLockScroll();
    exitPopupClose.focus();
  }

  function closeExitPopup() {
    exitPopup.classList.remove("is-open");
    exitPopup.setAttribute("aria-hidden", "true");
    window.hlpUnlockScroll();
    window.hlpRestoreFocus();
  }

  document.addEventListener("mouseout", function (event) {
    if (event.clientY > 12) {
      return;
    }

    openExitPopup();
  });

  exitPopupClose.addEventListener("click", closeExitPopup);
  exitPopupBackdrop.addEventListener("click", closeExitPopup);
  exitPopupCta.addEventListener("click", closeExitPopup);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && exitPopup.classList.contains("is-open")) {
      closeExitPopup();
    }
  });
})();

// Tracking dashboard cho Sprint 10:
// gom theo dõi click, scroll, form submit và bridge sang GA/Meta Pixel nếu đã cấu hình.
(function () {
  const appConfig = window.APP_CONFIG || {};
  const dashboard = document.getElementById("tracking-dashboard");
  const clickCountElement = document.getElementById("tracking-click-count");
  const scrollDepthElement = document.getElementById("tracking-scroll-depth");
  const formSubmitCountElement = document.getElementById("tracking-form-submit-count");
  const gaStatusElement = document.getElementById("tracking-ga-status");
  const metaStatusElement = document.getElementById("tracking-meta-status");
  const lastEventElement = document.getElementById("tracking-last-event");

  if (!dashboard || !clickCountElement || !scrollDepthElement || !formSubmitCountElement || !gaStatusElement || !metaStatusElement || !lastEventElement) {
    return;
  }

  const analyticsConfig = {
    gaId: typeof appConfig.GOOGLE_ANALYTICS_ID === "string" ? appConfig.GOOGLE_ANALYTICS_ID.trim() : "",
    metaPixelId: typeof appConfig.META_PIXEL_ID === "string" ? appConfig.META_PIXEL_ID.trim() : "",
    showDashboard: appConfig.ENABLE_TRACKING_DASHBOARD !== false
  };

  if (!analyticsConfig.showDashboard) {
    dashboard.classList.add("is-hidden");
  }

  const trackingState = {
    clickCount: 0,
    maxScrollDepth: 0,
    formSubmitCount: 0,
    sentScrollMilestones: {}
  };

  function setLastEvent(label) {
    lastEventElement.textContent = label;
  }

  function updateDashboard() {
    clickCountElement.textContent = String(trackingState.clickCount);
    scrollDepthElement.textContent = `${trackingState.maxScrollDepth}%`;
    formSubmitCountElement.textContent = String(trackingState.formSubmitCount);
    gaStatusElement.textContent = analyticsConfig.gaId ? "On" : "Off";
    metaStatusElement.textContent = analyticsConfig.metaPixelId ? "On" : "Off";
  }

  function loadGoogleAnalytics(measurementId) {
    if (!measurementId || window.gtag) {
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };

    window.gtag("js", new Date());
    window.gtag("config", measurementId);
  }

  function loadMetaPixel(pixelId) {
    if (!pixelId || window.fbq) {
      return;
    }

    window.fbq = function () {
      window.fbq.callMethod
        ? window.fbq.callMethod.apply(window.fbq, arguments)
        : window.fbq.queue.push(arguments);
    };
    window.fbq.push = window.fbq;
    window.fbq.loaded = true;
    window.fbq.version = "2.0";
    window.fbq.queue = [];

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);

    window.fbq("init", pixelId);
    window.fbq("track", "PageView");
  }

  function sendTrackingEvent(eventName, payload) {
    if (typeof window.gtag === "function" && analyticsConfig.gaId) {
      window.gtag("event", eventName, payload || {});
    }

    if (typeof window.fbq === "function" && analyticsConfig.metaPixelId) {
      window.fbq("trackCustom", eventName, payload || {});
    }
  }

  function getTrackableLabel(target) {
    const explicitId = target.id ? `#${target.id}` : "";
    const text = (target.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40);
    return explicitId || text || target.tagName.toLowerCase();
  }

  function updateScrollDepth() {
    const doc = document.documentElement;
    const scrollableHeight = Math.max(doc.scrollHeight - window.innerHeight, 1);
    const currentDepth = Math.min(100, Math.max(0, Math.round((window.scrollY / scrollableHeight) * 100)));

    if (currentDepth <= trackingState.maxScrollDepth) {
      return;
    }

    trackingState.maxScrollDepth = currentDepth;
    updateDashboard();
    setLastEvent(`Scroll ${currentDepth}%`);

    [25, 50, 75, 100].forEach(function (milestone) {
      if (currentDepth >= milestone && !trackingState.sentScrollMilestones[milestone]) {
        trackingState.sentScrollMilestones[milestone] = true;
        sendTrackingEvent("scroll_depth", {
          percent: milestone
        });
      }
    });
  }

  loadGoogleAnalytics(analyticsConfig.gaId);
  loadMetaPixel(analyticsConfig.metaPixelId);
  updateDashboard();

  document.addEventListener("click", function (event) {
    const trackableTarget = event.target.closest("button, a");

    if (!trackableTarget) {
      return;
    }

    trackingState.clickCount += 1;
    updateDashboard();

    const label = getTrackableLabel(trackableTarget);
    setLastEvent(`Click ${label}`);
    sendTrackingEvent("button_click", {
      label: label,
      tag: trackableTarget.tagName.toLowerCase()
    });
  });

  document.addEventListener("hlpad:form-submit-success", function (event) {
    trackingState.formSubmitCount += 1;
    updateDashboard();
    setLastEvent("Form submit success");
    sendTrackingEvent("form_submit", {
      form_id: "lead-form",
      has_learning_goal: Boolean(event.detail && event.detail.learningGoal)
    });
  });

  updateScrollDepth();
  window.addEventListener("scroll", updateScrollDepth, { passive: true });
})();
