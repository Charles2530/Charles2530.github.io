(function () {
  const IMAGE_SELECTOR = ".md-content .md-typeset img";
  const ZOOMABLE_CLASS = "atlas-zoomable-image";
  let overlay;
  let imageEl;
  let captionEl;
  let closeButton;
  let activeImage;
  let listenersMounted = false;

  function imageCaption(img) {
    const figureCaption = img.closest("figure")?.querySelector("figcaption");
    const nextSmall = img.parentElement?.nextElementSibling?.matches("p")
      ? img.parentElement.nextElementSibling.querySelector("small")
      : null;
    return (
      img.getAttribute("alt") ||
      img.getAttribute("title") ||
      figureCaption?.textContent ||
      nextSmall?.textContent ||
      ""
    ).replace(/\s+/g, " ").trim();
  }

  function shouldUseLightbox(img) {
    return (
      img &&
      !img.closest(".atlas-lightbox") &&
      !img.closest("a, button") &&
      !img.matches("[data-no-lightbox], .no-lightbox")
    );
  }

  function ensureOverlay() {
    if (overlay) return overlay;

    overlay = document.createElement("div");
    overlay.className = "atlas-lightbox";
    overlay.setAttribute("aria-hidden", "true");
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");

    closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "atlas-lightbox__close";
    closeButton.setAttribute("aria-label", "关闭放大图片");
    closeButton.title = "关闭";
    closeButton.textContent = "×";

    const stage = document.createElement("div");
    stage.className = "atlas-lightbox__stage";

    imageEl = document.createElement("img");
    imageEl.className = "atlas-lightbox__image";
    imageEl.alt = "";

    captionEl = document.createElement("div");
    captionEl.className = "atlas-lightbox__caption";

    stage.appendChild(imageEl);
    overlay.append(closeButton, stage, captionEl);
    document.body.appendChild(overlay);

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay || event.target === stage) closeLightbox();
    });
    closeButton.addEventListener("click", closeLightbox);
    imageEl.addEventListener("click", (event) => event.stopPropagation());

    return overlay;
  }

  function openLightbox(img) {
    if (!shouldUseLightbox(img)) return;

    const popup = ensureOverlay();
    activeImage = img;

    const caption = imageCaption(img);
    imageEl.src = img.currentSrc || img.src;
    imageEl.alt = img.alt || caption || "";
    captionEl.textContent = caption;
    captionEl.hidden = !caption;

    document.body.classList.add("atlas-lightbox-open");
    popup.setAttribute("aria-hidden", "false");
    popup.dataset.open = "true";
    closeButton.focus({ preventScroll: true });
  }

  function closeLightbox() {
    if (!overlay || overlay.getAttribute("aria-hidden") === "true") return;

    overlay.setAttribute("aria-hidden", "true");
    overlay.dataset.open = "false";
    document.body.classList.remove("atlas-lightbox-open");
    imageEl.removeAttribute("src");

    if (activeImage && document.contains(activeImage)) {
      activeImage.focus({ preventScroll: true });
    }
    activeImage = null;
  }

  function decorateImages() {
    document.querySelectorAll(IMAGE_SELECTOR).forEach((img) => {
      if (!shouldUseLightbox(img) || img.dataset.lightboxReady === "true") return;

      img.dataset.lightboxReady = "true";
      img.classList.add(ZOOMABLE_CLASS);
      img.setAttribute("role", "button");
      img.setAttribute("tabindex", "0");
      img.setAttribute("aria-label", imageCaption(img) || "点击放大图片");
    });
  }

  function mountListeners() {
    if (listenersMounted) return;
    listenersMounted = true;

    document.addEventListener("click", (event) => {
      const img = event.target.closest(IMAGE_SELECTOR);
      if (!shouldUseLightbox(img)) return;

      event.preventDefault();
      openLightbox(img);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeLightbox();
        return;
      }

      const img = event.target.closest?.(IMAGE_SELECTOR);
      if (!shouldUseLightbox(img)) return;
      if (event.key !== "Enter" && event.key !== " ") return;

      event.preventDefault();
      openLightbox(img);
    });
  }

  function init() {
    if (!document.body) return;
    ensureOverlay();
    mountListeners();
    decorateImages();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(init);
  }
})();
