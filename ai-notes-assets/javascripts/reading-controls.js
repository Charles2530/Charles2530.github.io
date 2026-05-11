(function () {
  const STORAGE_KEY = "atlas-reading-preferences";

  function loadPrefs() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch (_) {
      return {};
    }
  }

  function savePrefs(prefs) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (_) {
      // Ignore storage failures in private browsing or locked environments.
    }
  }

  function applyPrefs(prefs) {
    const body = document.body;
    body.classList.toggle("atlas-wide", !!prefs.wide);
    body.classList.toggle("atlas-focus", !!prefs.focus);
    body.classList.toggle("atlas-hide-left", !!prefs.hideLeft);
    body.classList.toggle("atlas-hide-right", !!prefs.hideRight);
    body.classList.remove("atlas-zoom-0", "atlas-zoom-1", "atlas-zoom-2");
    body.classList.add(`atlas-zoom-${prefs.zoom || 0}`);
    window.requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent("atlas:layoutchange"));
    });
  }

  function markPageContext() {
    const path = window.location.pathname.replace(/\/index\.html$/, "/");
    document.body.classList.toggle("atlas-paper-deep-dive", path.includes("/paper-deep-dives/"));
  }

  function directChild(parent, selector) {
    return Array.from(parent ? parent.children : []).find((child) => child.matches(selector));
  }

  function markPaperDeepDiveNav() {
    document.querySelectorAll(".atlas-paper-nav-root, .atlas-paper-nav-topic").forEach((node) => {
      node.classList.remove("atlas-paper-nav-root", "atlas-paper-nav-topic");
    });

    const primary = document.querySelector(".md-sidebar--primary");
    if (!primary) return;

    const rootLink = Array.from(primary.querySelectorAll("a.md-nav__link[href]")).find((anchor) => {
      return anchor.textContent.replace(/\s+/g, " ").trim() === "论文专题讲解";
    });
    const root = rootLink ? rootLink.closest(".md-nav__item--nested") : null;
    if (!root) return;

    root.classList.add("atlas-paper-nav-root");

    const nav = directChild(root, "nav.md-nav");
    const list = directChild(nav, "ul.md-nav__list");
    Array.from(list ? list.children : []).forEach((item) => {
      if (item.matches(".md-nav__item--nested")) {
        item.classList.add("atlas-paper-nav-topic");
      }
    });
  }

  function applyDockState(dock, prefs, toggle) {
    const collapsed = !!prefs.controlsCollapsed;
    dock.classList.toggle("atlas-reader-controls--collapsed", collapsed);
    dock.setAttribute("aria-expanded", String(!collapsed));
    if (toggle) {
      toggle.textContent = collapsed ? "工具" : "收起";
      toggle.title = collapsed ? "展开阅读工具" : "收起阅读工具";
      toggle.setAttribute("aria-label", toggle.title);
    }
  }

  function makeButton(label, title, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "atlas-reader-button";
    button.textContent = label;
    button.title = title;
    button.addEventListener("click", onClick);
    return button;
  }

  function pageTitle() {
    const heading = document.querySelector(".md-content__inner h1");
    const title = heading ? heading.textContent.replace(/\s+/g, " ").trim() : document.title;
    return title || "AI Notes Page";
  }

  function printCurrentPage() {
    const title = pageTitle();
    const previousTitle = document.title;
    document.title = `${title} - Charles AI notes`;
    document.body.classList.add("atlas-printing");

    const cleanup = () => {
      document.body.classList.remove("atlas-printing");
      document.title = previousTitle;
      window.removeEventListener("afterprint", cleanup);
    };

    window.addEventListener("afterprint", cleanup);
    window.setTimeout(() => {
      window.print();
      window.setTimeout(cleanup, 60000);
    }, 80);
  }

  function mountReaderControls() {
    const prefs = Object.assign({ zoom: 0 }, loadPrefs());
    applyPrefs(prefs);

    if (document.querySelector(".atlas-reader-controls")) return;

    const dock = document.createElement("div");
    dock.className = "atlas-reader-controls";
    dock.setAttribute("aria-label", "阅读控制");

    const toggle = makeButton("收起", "收起阅读工具", () => {
      prefs.controlsCollapsed = !prefs.controlsCollapsed;
      applyDockState(dock, prefs, toggle);
      savePrefs(prefs);
    });
    toggle.classList.add("atlas-reader-toggle");

    const zoom = makeButton("A+", "切换正文放大", () => {
      prefs.zoom = ((prefs.zoom || 0) + 1) % 3;
      applyPrefs(prefs);
      savePrefs(prefs);
    });

    const wide = makeButton("宽屏", "切换正文宽屏", () => {
      prefs.wide = !prefs.wide;
      applyPrefs(prefs);
      savePrefs(prefs);
    });

    const focus = makeButton("全屏", "切换沉浸阅读；支持浏览器全屏时会尝试进入全屏", async () => {
      prefs.focus = !prefs.focus;
      applyPrefs(prefs);
      savePrefs(prefs);
      try {
        if (prefs.focus && !document.fullscreenElement && document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if (!prefs.focus && document.fullscreenElement && document.exitFullscreen) {
          await document.exitFullscreen();
        }
      } catch (_) {
        // Browser fullscreen can be blocked; CSS focus mode still works.
      }
    });

    const left = makeButton("左栏", "折叠/展开左侧目录", () => {
      prefs.hideLeft = !prefs.hideLeft;
      applyPrefs(prefs);
      savePrefs(prefs);
    });

    const right = makeButton("右栏", "折叠/展开右侧小章节", () => {
      prefs.hideRight = !prefs.hideRight;
      applyPrefs(prefs);
      savePrefs(prefs);
    });

    const top = makeButton("顶部", "跳到当前页开头", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    const bottom = makeButton("末尾", "跳到当前页末尾", () => {
      const height = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight
      );
      window.scrollTo({ top: height, behavior: "smooth" });
    });

    const link = makeButton("链接", "复制当前页链接", async () => {
      try {
        await copyText(window.location.href);
        link.textContent = "已复制";
        window.setTimeout(() => {
          link.textContent = "链接";
        }, 1300);
      } catch (_) {
        link.textContent = "失败";
        window.setTimeout(() => {
          link.textContent = "链接";
        }, 1600);
      }
    });

    const pdf = makeButton("PDF", "导出当前页内容为 PDF；在打印窗口选择“保存为 PDF”", printCurrentPage);

    dock.append(toggle, zoom, wide, focus, left, right, top, bottom, link, pdf);
    applyDockState(dock, prefs, toggle);
    document.body.appendChild(dock);
  }

  function tableToText(table) {
    return Array.from(table.rows)
      .map((row) =>
        Array.from(row.cells)
          .map((cell) => cell.innerText.replace(/\s+/g, " ").trim())
          .join("\t")
      )
      .join("\n");
  }

  async function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "readonly");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    textarea.remove();
    if (!ok) throw new Error("copy failed");
  }

  function mountTableCopyButtons() {
    document.querySelectorAll(".md-typeset table").forEach((table) => {
      if (table.closest(".atlas-table-wrap")) return;

      const wrapper = document.createElement("div");
      wrapper.className = "atlas-table-wrap";
      table.parentNode.insertBefore(wrapper, table);

      const button = document.createElement("button");
      button.type = "button";
      button.className = "atlas-table-copy";
      button.textContent = "复制表格";
      button.title = "复制当前表格内容，不包含术语浮窗说明";
      button.addEventListener("click", async () => {
        const text = tableToText(table);
        try {
          await copyText(text);
          button.textContent = "已复制";
          window.setTimeout(() => {
            button.textContent = "复制表格";
          }, 1300);
        } catch (_) {
          button.textContent = "复制失败";
          window.setTimeout(() => {
            button.textContent = "复制表格";
          }, 1600);
        }
      });
      wrapper.appendChild(button);
      wrapper.appendChild(table);
    });
  }

  function parsePaperDate(value) {
    const match = String(value || "").match(/(\d{4})(?:-(\d{1,2}))?/);
    if (!match) return Number.MAX_SAFE_INTEGER;
    const year = Number(match[1]);
    const month = match[2] ? Number(match[2]) : 99;
    return year * 100 + month;
  }

  function sortPaperTable(table) {
    const body = table.tBodies && table.tBodies[0];
    if (!body) return;

    const headers = Array.from(table.tHead ? table.tHead.rows[0].cells : table.rows[0]?.cells || []);
    const dateIndex = Math.max(
      0,
      headers.findIndex((cell) => /^(时间|日期|Date)$/i.test(cell.innerText.replace(/\s+/g, " ").trim()))
    );
    const rows = Array.from(body.rows);
    if (rows.length < 2) return;

    rows
      .sort((a, b) => {
        const aDate = parsePaperDate(a.cells[dateIndex]?.innerText);
        const bDate = parsePaperDate(b.cells[dateIndex]?.innerText);
        if (aDate !== bDate) return aDate - bDate;
        return a.innerText.localeCompare(b.innerText, "zh-Hans-CN");
      })
      .forEach((row) => body.appendChild(row));
  }

  function mountPaperDeepDiveSorting() {
    document.querySelectorAll("table[data-paper-sort], [data-paper-sort] table, table.paper-deep-dive-table").forEach(sortPaperTable);

    document.querySelectorAll("[data-paper-sort]").forEach((container) => {
      const items = Array.from(container.children).filter((child) => child.hasAttribute("data-paper-date"));
      if (items.length < 2) return;

      items
        .sort((a, b) => {
          const aDate = parsePaperDate(a.getAttribute("data-paper-date"));
          const bDate = parsePaperDate(b.getAttribute("data-paper-date"));
          if (aDate !== bDate) return aDate - bDate;
          return a.innerText.localeCompare(b.innerText, "zh-Hans-CN");
        })
        .forEach((item) => container.appendChild(item));
    });
  }

  function linkInfo(anchor) {
    if (!anchor) return null;
    const title = anchor.querySelector(".md-footer__title");
    const label = title ? title.textContent.replace(/\s+/g, " ").trim() : anchor.textContent.replace(/\s+/g, " ").trim();
    return {
      href: anchor.getAttribute("href"),
      label: label || anchor.getAttribute("href")
    };
  }

  function normalizeUrl(url) {
    const parsed = new URL(url, window.location.href);
    parsed.hash = "";
    parsed.search = "";
    let path = parsed.pathname.replace(/\/index\.html$/, "/");
    if (!path.endsWith("/") && !PathLikeFile(path)) path += "/";
    return `${parsed.origin}${path}`;
  }

  function PathLikeFile(path) {
    return /\.[a-z0-9]+$/i.test(path.split("/").pop() || "");
  }

  function navLinkInfo(anchor) {
    const label = anchor.textContent.replace(/\s+/g, " ").trim();
    const href = anchor.getAttribute("href");
    if (!href || href.startsWith("#")) return null;
    return { href, label: label || href, key: normalizeUrl(anchor.href) };
  }

  function adjacentFromPrimaryNav() {
    const links = Array.from(document.querySelectorAll(".md-sidebar--primary a.md-nav__link[href]"));
    const seen = new Set();
    const pages = [];

    links.forEach((anchor) => {
      const info = navLinkInfo(anchor);
      if (!info) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (seen.has(info.key)) return;
      seen.add(info.key);
      pages.push(info);
    });

    const current = normalizeUrl(window.location.href);
    const index = pages.findIndex((page) => page.key === current);
    if (index < 0) return { prev: null, next: null };

    return {
      prev: index > 0 ? pages[index - 1] : null,
      next: index < pages.length - 1 ? pages[index + 1] : null
    };
  }

  function mountPageNav() {
    const content = document.querySelector(".md-content__inner");
    if (!content || content.querySelector(".atlas-page-nav")) return;

    const fallback = adjacentFromPrimaryNav();
    const prev = linkInfo(document.querySelector(".md-footer__link--prev")) || fallback.prev;
    const next = linkInfo(document.querySelector(".md-footer__link--next")) || fallback.next;
    if (!prev && !next) return;

    const nav = document.createElement("nav");
    nav.className = "atlas-page-nav";
    nav.setAttribute("aria-label", "上一页和下一页");

    if (prev) {
      const prevLink = document.createElement("a");
      prevLink.className = "atlas-page-nav__link atlas-page-nav__link--prev";
      prevLink.href = prev.href;
      prevLink.innerHTML = `<span>上一页</span><strong>${prev.label}</strong>`;
      nav.appendChild(prevLink);
    }

    if (next) {
      const nextLink = document.createElement("a");
      nextLink.className = "atlas-page-nav__link atlas-page-nav__link--next";
      nextLink.href = next.href;
      nextLink.innerHTML = `<span>下一页</span><strong>${next.label}</strong>`;
      nav.appendChild(nextLink);
    }

    content.appendChild(nav);
  }

  function init() {
    if (!document.body) return;
    markPageContext();
    markPaperDeepDiveNav();
    mountReaderControls();
    mountPaperDeepDiveSorting();
    mountTableCopyButtons();
    mountPageNav();
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
