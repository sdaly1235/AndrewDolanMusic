(function () {
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  if (!window.location.hash) {
    window.scrollTo(0, 0);
  }

  const data = window.siteData || {};
  const siteHeader = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const primaryNav = document.querySelector("#primary-nav");

  function closeNavigation() {
    if (!siteHeader || !navToggle) return;
    siteHeader.classList.remove("is-menu-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation menu");
  }

  if (siteHeader && navToggle && primaryNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = siteHeader.classList.toggle("is-menu-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
    });

    primaryNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeNavigation);
    });

    const brandLink = siteHeader.querySelector(".brand");
    if (brandLink) brandLink.addEventListener("click", closeNavigation);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && siteHeader.classList.contains("is-menu-open")) {
        closeNavigation();
        navToggle.focus();
      }
    });

    document.addEventListener("click", (event) => {
      if (!siteHeader.contains(event.target)) closeNavigation();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 780) closeNavigation();
    });
  }

  const allowedExternalHosts = new Set([
    "open.spotify.com",
    "www.instagram.com",
    "instagram.com",
    "linktr.ee",
    "www.youtube.com",
    "youtube.com",
    "youtu.be"
  ]);

  function safeExternalUrl(value) {
    try {
      const url = new URL(value);
      if (url.protocol !== "https:" || !allowedExternalHosts.has(url.hostname)) {
        return "";
      }
      return url.href;
    } catch (_) {
      return "";
    }
  }

  function safeAssetPath(value) {
    if (typeof value !== "string") return "";
    if (!/^assets\/[\w./-]+\.(jpe?g|png|webp|gif)$/i.test(value)) return "";
    if (value.includes("..") || value.includes("//")) return "";
    return value;
  }

  function setText(selector, value) {
    const element = document.querySelector(selector);
    if (element) {
      element.textContent = value || "";
    }
    return element;
  }

  const socialLabels = {
    spotifyArtist: "Spotify",
    instagram: "Instagram",
    linktree: "Linktree"
  };

  const socialAriaLabels = {
    spotifyArtist: "Andrew Dolan on Spotify",
    instagram: "Andrew Dolan Music on Instagram",
    linktree: "Andrew Dolan Music links on Linktree"
  };

  function externalLink(href, label, variant = "secondary", ariaLabel = "") {
    const safeHref = safeExternalUrl(href);
    if (!safeHref) return null;

    const link = document.createElement("a");
    link.className = `button ${variant}`;
    link.href = safeHref;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = label;
    if (ariaLabel) {
      link.setAttribute("aria-label", ariaLabel);
    }
    return link;
  }

  function assetLink(path, label, variant = "secondary", ariaLabel = "") {
    const safePath = safeAssetPath(path);
    if (!safePath) return null;

    const link = document.createElement("a");
    link.className = `button ${variant}`;
    link.href = safePath;
    link.textContent = label;
    if (ariaLabel) {
      link.setAttribute("aria-label", ariaLabel);
    }
    return link;
  }

  function renderSocialLinks(container, primaryFirst = false) {
    if (!container || !data.socialLinks) return;

    Object.entries(data.socialLinks).forEach(([key, href], index) => {
      const link = externalLink(
        href,
        socialLabels[key] || key,
        primaryFirst && index === 0 ? "primary" : "secondary",
        socialAriaLabels[key] || ""
      );
      if (link) {
        container.appendChild(link);
      }
    });
  }

  function updateScrollState() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    document.documentElement.style.setProperty("--scroll-progress", `${Math.min(progress, 100)}%`);
    document.body.classList.toggle("is-scrolled", window.scrollY > 24);
  }

  setText('[data-content="tagline"]', data.tagline);

  const heroActions = document.querySelector("[data-social-actions]");
  renderSocialLinks(heroActions, true);

  const featuredTrack = data.featuredTrack || {};
  setText("[data-track-title]", featuredTrack.title);
  setText("[data-track-artist]", featuredTrack.artist);
  const trackLink = document.querySelector("[data-track-link]");
  const safeTrackUrl = safeExternalUrl(featuredTrack.spotifyUrl);
  if (trackLink && safeTrackUrl) {
    trackLink.href = safeTrackUrl;
    trackLink.setAttribute("aria-label", `Listen to ${featuredTrack.title || "the featured track"} on Spotify`);
  } else if (trackLink) {
    trackLink.hidden = true;
  }

  const spotifyEmbed = document.querySelector("[data-spotify-embed]");
  const safeSpotifyEmbedUrl = safeExternalUrl(featuredTrack.spotifyEmbedUrl);
  if (spotifyEmbed && safeSpotifyEmbedUrl) {
    const spotifyFrame = document.createElement("iframe");
    spotifyFrame.src = safeSpotifyEmbedUrl;
    spotifyFrame.title = `${featuredTrack.title || "Featured track"} on Spotify`;
    spotifyFrame.loading = "lazy";
    spotifyFrame.referrerPolicy = "strict-origin-when-cross-origin";
    spotifyFrame.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
    spotifyEmbed.appendChild(spotifyFrame);
  }

  const videoFrame = document.querySelector("[data-video-frame]");
  const featuredVideo = data.featuredVideo || {};
  const safeVideoEmbedUrl = safeExternalUrl(featuredVideo.embedUrl);
  if (videoFrame && safeVideoEmbedUrl) {
    const iframe = document.createElement("iframe");
    iframe.src = safeVideoEmbedUrl;
    iframe.title = featuredVideo.title || "Featured video";
    iframe.loading = "lazy";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    videoFrame.appendChild(iframe);
  }

  const tourSection = document.querySelector("[data-tour-section]");
  const tourList = document.querySelector("[data-tour-list]");
  if (Array.isArray(data.tourDates) && data.tourDates.length > 0) {
    tourSection.hidden = false;
    data.tourDates.forEach((show) => {
      const item = document.createElement("article");
      item.className = "tour-item";

      const date = document.createElement("time");
      date.className = "tour-date";
      date.setAttribute("aria-label", show.date || "");
      if (show.isoDate) date.dateTime = show.isoDate;

      if (show.day && show.month) {
        const weekday = document.createElement("span");
        weekday.className = "tour-weekday";
        weekday.textContent = show.weekday || "";

        const day = document.createElement("span");
        day.className = "tour-day";
        day.textContent = show.day;

        const month = document.createElement("span");
        month.className = "tour-month";
        month.textContent = show.month;

        date.append(weekday, day, month);
      } else {
        const fullDate = document.createElement("span");
        fullDate.className = "tour-date-full";
        fullDate.textContent = show.date || "";
        date.appendChild(fullDate);
      }

      const details = document.createElement("div");
      details.className = "tour-details";
      const venue = document.createElement("h3");
      venue.textContent = show.venue || "";
      const location = document.createElement("p");
      location.textContent = show.location || "";

      details.append(venue, location);
      item.append(date, details);

      if (show.ticketUrl) {
        const ticketLink = externalLink(show.ticketUrl, "Tickets", "primary");
        if (ticketLink) {
          item.appendChild(ticketLink);
        }
      }
      tourList.appendChild(item);
    });
  }

  const merchSection = document.querySelector("[data-merch-section]");
  const merchLink = document.querySelector("[data-merch-link]");
  const safeMerchUrl = data.merch ? safeExternalUrl(data.merch.url) : "";
  if (data.merch && data.merch.label && safeMerchUrl) {
    merchSection.hidden = false;
    merchLink.textContent = data.merch.label;
    merchLink.href = safeMerchUrl;
  }

  const gallery = document.querySelector("[data-gallery]");
  if (gallery && Array.isArray(data.gallery)) data.gallery.forEach((item) => {
    const imagePath = safeAssetPath(item.image);
    if (!imagePath) return;

    const figure = document.createElement("figure");
    figure.className = "gallery-item";

    const image = document.createElement("img");
    image.src = imagePath;
    image.alt = item.alt || "";
    image.loading = "lazy";
    image.decoding = "async";
    if (Number.isInteger(item.width) && Number.isInteger(item.height)) {
      image.width = item.width;
      image.height = item.height;
    }
    figure.appendChild(image);

    if (item.caption) {
      const caption = document.createElement("figcaption");
      caption.textContent = item.caption;
      figure.appendChild(caption);
    }

    gallery.appendChild(figure);
  });

  const pressKit = data.pressKit || {};
  const pressPhoto = document.querySelector("[data-press-photo]");
  const safePressPhoto = safeAssetPath(pressKit.pressPhoto);
  if (pressPhoto && safePressPhoto) {
    pressPhoto.src = safePressPhoto;
  }
  setText("[data-press-bio]", pressKit.bio);
  setText("[data-press-artist]", data.artistName);
  setText("[data-press-location]", pressKit.location);
  setText("[data-press-release]", featuredTrack.title);

  const pressLinks = document.querySelector("[data-press-links]");
  if (pressLinks && Array.isArray(pressKit.links)) {
    pressKit.links.forEach((item, index) => {
      const link = safeAssetPath(item.url)
        ? assetLink(item.url, item.label, index === 0 ? "primary" : "secondary", item.ariaLabel || `${item.label} for Andrew Dolan Music`)
        : externalLink(item.url, item.label, index === 0 ? "primary" : "secondary", item.ariaLabel || "");
      if (link) {
        pressLinks.appendChild(link);
      }
    });
  }

  const footerLinks = document.querySelector("[data-footer-links]");
  renderSocialLinks(footerLinks, true);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const flowSections = document.querySelectorAll(".flow-in");

  if (reduceMotion) {
    flowSections.forEach((section) => section.classList.add("is-visible"));
  } else if ("IntersectionObserver" in window) {
    const flowObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -10%", threshold: 0.08 });
    flowSections.forEach((section) => flowObserver.observe(section));
  } else {
    flowSections.forEach((section) => section.classList.add("is-visible"));
  }

  const navLinks = document.querySelectorAll(".nav-links a[href^='#']");
  const navTargets = [...navLinks]
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    }, { rootMargin: "-38% 0px -52% 0px", threshold: 0 });
    navTargets.forEach((section) => navObserver.observe(section));
  }

  updateScrollState();
  window.addEventListener("scroll", updateScrollState, { passive: true });
  window.addEventListener("resize", updateScrollState);
})();
