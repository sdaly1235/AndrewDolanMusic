(function () {
  const data = window.siteData || {};
  const siteHeader = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const primaryNav = document.querySelector("#primary-nav");
  const mainContent = document.querySelector("#main-content");
  const siteFooter = document.querySelector(".site-footer");

  function setNavigationOpen(isOpen) {
    if (!siteHeader || !navToggle) return;
    siteHeader.classList.toggle("is-menu-open", isOpen);
    document.body.classList.toggle("is-menu-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");

    if ("inert" in HTMLElement.prototype) {
      if (mainContent) mainContent.inert = isOpen;
      if (siteFooter) siteFooter.inert = isOpen;
    }
  }

  function closeNavigation(restoreFocus = false) {
    setNavigationOpen(false);
    if (restoreFocus && navToggle) navToggle.focus();
  }

  if (siteHeader && navToggle && primaryNav) {
    navToggle.addEventListener("click", () => {
      setNavigationOpen(!siteHeader.classList.contains("is-menu-open"));
    });

    primaryNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeNavigation);
    });

    const brandLink = siteHeader.querySelector(".brand");
    if (brandLink) brandLink.addEventListener("click", closeNavigation);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && siteHeader.classList.contains("is-menu-open")) {
        closeNavigation(true);
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
    "www.facebook.com",
    "facebook.com",
    "www.tiktok.com",
    "tiktok.com",
    "linktr.ee",
    "music.apple.com",
    "www.youtube.com",
    "youtube.com",
    "youtu.be",
    "www.ganjingworld.com",
    "ganjingworld.com",
    "www.concertarchives.org",
    "concertarchives.org",
    "www.tyronecon.co.uk",
    "tyronecon.co.uk"
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

  function setSectionLinksVisibility(sectionId, isVisible) {
    document.querySelectorAll(`[data-section-link="${sectionId}"]`).forEach((link) => {
      link.hidden = !isVisible;
    });
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
    facebook: "Facebook",
    tiktok: "TikTok",
    linktree: "Linktree"
  };

  const socialAriaLabels = {
    spotifyArtist: "Andrew Dolan on Spotify",
    instagram: "Andrew Dolan Music on Instagram",
    facebook: "Andrew Dolan Music on Facebook",
    tiktok: "Andrew Dolan on TikTok",
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

  function externalTextLink(href, label, ariaLabel = "") {
    const safeHref = safeExternalUrl(href);
    if (!safeHref) return null;

    const link = document.createElement("a");
    link.className = "text-link";
    link.href = safeHref;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = label;
    if (ariaLabel) link.setAttribute("aria-label", ariaLabel);
    return link;
  }

  function renderSocialLinks(container, primaryFirst = false, includedKeys = null) {
    if (!container || !data.socialLinks) return;

    const entries = Object.entries(data.socialLinks)
      .filter(([key]) => !includedKeys || includedKeys.includes(key));

    entries.forEach(([key, href], index) => {
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

  let scrollFrame = 0;

  function updateScrollState() {
    scrollFrame = 0;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
    const clampedProgress = Math.min(Math.max(progress, 0), 1);
    document.documentElement.style.setProperty("--scroll-progress", String(clampedProgress));
    document.body.classList.toggle("is-scrolled", window.scrollY > 24);
    updateActiveNavigation();
  }

  function requestScrollStateUpdate() {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(updateScrollState);
  }

  setText('[data-content="tagline"]', data.tagline);

  const featuredTrack = data.featuredTrack || {};
  const heroActions = document.querySelector("[data-social-actions]");
  if (heroActions) {
    const featuredLink = externalLink(
      featuredTrack.spotifyUrl,
      `Listen to ${featuredTrack.title || "the new single"}`,
      "primary",
      `Listen to ${featuredTrack.title || "the new single"} on Spotify`
    );
    if (featuredLink) heroActions.appendChild(featuredLink);
    renderSocialLinks(heroActions, false, ["instagram"]);
  }

  setText("[data-track-title]", featuredTrack.title);
  setText("[data-track-meta]", [featuredTrack.releaseDate, featuredTrack.duration].filter(Boolean).join(" · "));
  setText("[data-track-description]", featuredTrack.description);
  setText("[data-release-lyric]", featuredTrack.lyric);

  const trackCover = document.querySelector("[data-track-cover]");
  const safeTrackCover = safeAssetPath(featuredTrack.cover);
  if (trackCover && safeTrackCover) {
    trackCover.src = safeTrackCover;
    trackCover.alt = `${featuredTrack.title || "Featured release"} cover artwork`;
  }
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

  const discography = document.querySelector("[data-discography]");
  if (discography && Array.isArray(data.discography)) {
    data.discography.filter((release) => !release.featured).forEach((release) => {
      const card = document.createElement("article");
      card.className = "discography-card";

      const meta = document.createElement("p");
      meta.className = "card-meta";
      meta.textContent = [release.type, release.date].filter(Boolean).join(" · ");

      const title = document.createElement("h3");
      title.textContent = release.title || "Release";

      const linkLabel = safeExternalUrl(release.url).includes("music.apple.com")
        ? "Listen on Apple Music"
        : "Listen on Spotify";
      const link = externalTextLink(release.url, linkLabel, `${linkLabel}: ${release.title || "release"}`);

      card.append(meta, title);
      if (link) card.appendChild(link);
      discography.appendChild(card);
    });
  }

  const campaignGrid = document.querySelector("[data-release-campaign]");
  if (campaignGrid && Array.isArray(data.releaseCampaign)) {
    data.releaseCampaign.forEach((moment) => {
      const card = document.createElement("article");
      card.className = "campaign-card";

      const kicker = document.createElement("p");
      kicker.className = "card-kicker";
      kicker.textContent = moment.kicker || "Release story";

      const date = document.createElement("time");
      date.className = "card-date";
      date.textContent = moment.date || "";
      if (moment.isoDate) date.dateTime = moment.isoDate;

      const title = document.createElement("h3");
      title.textContent = moment.title || "";

      const description = document.createElement("p");
      description.textContent = moment.description || "";

      const link = externalTextLink(moment.url, moment.linkLabel || "View update", moment.title || "View release update");
      card.append(kicker, date, title, description);
      if (link) card.appendChild(link);
      campaignGrid.appendChild(card);
    });
  }

  const highlightsGrid = document.querySelector("[data-highlights]");
  if (highlightsGrid && Array.isArray(data.recentHighlights)) {
    data.recentHighlights.forEach((highlight) => {
      const card = document.createElement("article");
      card.className = "highlight-card";

      const date = document.createElement("time");
      date.className = "card-date";
      date.textContent = highlight.date || "";
      if (highlight.isoDate) date.dateTime = highlight.isoDate;

      const title = document.createElement("h3");
      title.textContent = highlight.title || "";

      const description = document.createElement("p");
      description.textContent = highlight.description || "";

      const link = externalTextLink(highlight.url, highlight.linkLabel || "Read more", highlight.title || "View live highlight");
      card.append(date, title, description);
      if (link) card.appendChild(link);
      highlightsGrid.appendChild(card);
    });
  }

  const videoFrame = document.querySelector("[data-video-frame]");
  const featuredVideo = data.featuredVideo || {};
  const safeVideoEmbedUrl = safeExternalUrl(featuredVideo.embedUrl);
  if (videoFrame && safeVideoEmbedUrl) {
    const loadVideo = () => {
      const iframe = document.createElement("iframe");
      const embedUrl = new URL(safeVideoEmbedUrl);
      embedUrl.searchParams.set("autoplay", "1");
      iframe.src = embedUrl.href;
      iframe.title = featuredVideo.title || "Featured video";
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;
      videoFrame.replaceChildren(iframe);
      videoFrame.classList.add("is-playing");
    };

    const thumbnailPath = safeAssetPath(featuredVideo.thumbnail);
    if (thumbnailPath) {
      const poster = document.createElement("button");
      poster.className = "video-poster";
      poster.type = "button";
      poster.setAttribute("aria-label", `Play ${featuredVideo.title || "featured video"}`);

      const thumbnail = document.createElement("img");
      thumbnail.src = thumbnailPath;
      thumbnail.alt = "";
      thumbnail.width = 480;
      thumbnail.height = 360;
      thumbnail.loading = "lazy";
      thumbnail.decoding = "async";

      const posterContent = document.createElement("span");
      posterContent.className = "video-poster-content";
      const playIcon = document.createElement("span");
      playIcon.className = "video-play-icon";
      playIcon.setAttribute("aria-hidden", "true");
      const playLabel = document.createElement("span");
      playLabel.textContent = "Play acoustic session";
      posterContent.append(playIcon, playLabel);

      poster.append(thumbnail, posterContent);
      poster.addEventListener("click", loadVideo, { once: true });
      videoFrame.appendChild(poster);
    } else {
      loadVideo();
    }
  }

  const tourSection = document.querySelector("[data-tour-section]");
  const tourList = document.querySelector("[data-tour-list]");
  const hasTourDates = Array.isArray(data.tourDates) && data.tourDates.length > 0;
  setSectionLinksVisibility("tour", hasTourDates);
  if (hasTourDates) {
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
  setText("[data-press-highlight]", pressKit.highlight);

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
    }, { rootMargin: "0px 0px -4%", threshold: 0.03 });
    flowSections.forEach((section) => flowObserver.observe(section));
  } else {
    flowSections.forEach((section) => section.classList.add("is-visible"));
  }

  const navLinks = document.querySelectorAll(".nav-links a[href^='#']:not([hidden])");
  const chapterLinks = document.querySelectorAll(".chapter-strip a[href^='#']:not([hidden])");
  const sectionNavigationLinks = [...navLinks, ...chapterLinks];
  const navTargets = [...new Set(sectionNavigationLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter((target) => target && !target.hidden))];

  function updateActiveNavigation() {
    const readingLine = window.scrollY + Math.min(window.innerHeight * 0.35, 280);
    let activeTarget = null;

    navTargets.forEach((section) => {
      if (section.offsetTop <= readingLine) activeTarget = section;
    });

    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      activeTarget = navTargets[navTargets.length - 1] || activeTarget;
    }

    sectionNavigationLinks.forEach((link) => {
      const isActive = Boolean(activeTarget) && link.getAttribute("href") === `#${activeTarget.id}`;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  const pressDisclosure = document.querySelector(".press-disclosure");
  if (pressDisclosure) {
    const pressToggleLabel = pressDisclosure.querySelector("summary strong");
    pressDisclosure.addEventListener("toggle", () => {
      if (pressToggleLabel) {
        pressToggleLabel.textContent = pressDisclosure.open ? "Close press kit" : "Open press kit";
      }
      requestScrollStateUpdate();
    });
  }

  function findHashTarget(hash) {
    try {
      return document.getElementById(decodeURIComponent(hash.slice(1)));
    } catch (_) {
      return null;
    }
  }

  const initialHash = window.location.hash;
  const alignInitialHash = () => {
    if (!initialHash || window.location.hash !== initialHash) return;
    const hashTarget = findHashTarget(initialHash);
    if (hashTarget) {
      const previousScrollBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = "auto";
      hashTarget.scrollIntoView({ behavior: "auto", block: "start" });
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
    }
  };

  if (initialHash && findHashTarget(initialHash)) {
    window.requestAnimationFrame(() => window.requestAnimationFrame(alignInitialHash));
    window.addEventListener("load", alignInitialHash, { once: true });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(alignInitialHash);
    }
  }

  updateScrollState();
  window.addEventListener("scroll", requestScrollStateUpdate, { passive: true });
  window.addEventListener("resize", requestScrollStateUpdate);
})();
