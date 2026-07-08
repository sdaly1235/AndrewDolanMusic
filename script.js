(function () {
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  if (!window.location.hash) {
    window.scrollTo(0, 0);
  }

  const data = window.siteData;

  const socialLabels = {
    spotifyArtist: "Spotify",
    instagram: "Instagram",
    linktree: "Linktree"
  };

  function externalLink(href, label, variant = "secondary") {
    const link = document.createElement("a");
    link.className = `button ${variant}`;
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = label;
    return link;
  }

  function renderSocialLinks(container, primaryFirst = false) {
    Object.entries(data.socialLinks).forEach(([key, href], index) => {
      if (!href) return;
      container.appendChild(externalLink(href, socialLabels[key] || key, primaryFirst && index === 0 ? "primary" : "secondary"));
    });
  }

  function updateScrollState() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    document.documentElement.style.setProperty("--scroll-progress", `${Math.min(progress, 100)}%`);
    document.body.classList.toggle("is-scrolled", window.scrollY > 24);
    updateFlowSections();
  }

  document.querySelector('[data-content="tagline"]').textContent = data.tagline;

  const heroActions = document.querySelector("[data-social-actions]");
  renderSocialLinks(heroActions, true);

  document.querySelector("[data-track-title]").textContent = data.featuredTrack.title;
  document.querySelector("[data-track-artist]").textContent = data.featuredTrack.artist;
  const trackLink = document.querySelector("[data-track-link]");
  trackLink.href = data.featuredTrack.spotifyUrl;
  trackLink.setAttribute("aria-label", `Listen to ${data.featuredTrack.title} on Spotify`);

  const spotifyEmbed = document.querySelector("[data-spotify-embed]");
  if (spotifyEmbed && data.featuredTrack.spotifyEmbedUrl) {
    const spotifyFrame = document.createElement("iframe");
    spotifyFrame.src = data.featuredTrack.spotifyEmbedUrl;
    spotifyFrame.title = `${data.featuredTrack.title} on Spotify`;
    spotifyFrame.loading = "lazy";
    spotifyFrame.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
    spotifyEmbed.appendChild(spotifyFrame);
  }

  const videoFrame = document.querySelector("[data-video-frame]");
  const iframe = document.createElement("iframe");
  iframe.src = data.featuredVideo.embedUrl;
  iframe.title = data.featuredVideo.title;
  iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
  iframe.allowFullscreen = true;
  videoFrame.appendChild(iframe);

  const tourSection = document.querySelector("[data-tour-section]");
  const tourList = document.querySelector("[data-tour-list]");
  if (Array.isArray(data.tourDates) && data.tourDates.length > 0) {
    tourSection.hidden = false;
    data.tourDates.forEach((show) => {
      const item = document.createElement("article");
      item.className = "tour-item";
      item.innerHTML = `
        <strong>${show.date}</strong>
        <div>
          <h3>${show.venue}</h3>
          <p>${show.location}</p>
        </div>
      `;
      if (show.ticketUrl) {
        item.appendChild(externalLink(show.ticketUrl, "Tickets", "primary"));
      }
      tourList.appendChild(item);
    });
  }

  const merchSection = document.querySelector("[data-merch-section]");
  const merchLink = document.querySelector("[data-merch-link]");
  if (data.merch && data.merch.label) {
    merchSection.hidden = false;
    merchLink.textContent = data.merch.label;
    if (data.merch.url) {
      merchLink.href = data.merch.url;
    } else {
      merchLink.removeAttribute("href");
      merchLink.removeAttribute("target");
      merchLink.removeAttribute("rel");
      merchLink.setAttribute("aria-disabled", "true");
      merchLink.classList.add("is-disabled");
    }
  }

  const gallery = document.querySelector("[data-gallery]");
  data.gallery.forEach((item) => {
    const figure = document.createElement("figure");
    figure.className = "gallery-item";

    const image = document.createElement("img");
    image.src = item.image;
    image.alt = item.alt;
    image.loading = "lazy";
    figure.appendChild(image);

    if (item.caption) {
      const caption = document.createElement("figcaption");
      caption.textContent = item.caption;
      figure.appendChild(caption);
    }

    gallery.appendChild(figure);
  });

  const footerLinks = document.querySelector("[data-footer-links]");
  renderSocialLinks(footerLinks, true);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const flowSections = document.querySelectorAll(".flow-in");

  function updateFlowSections() {
    if (reduceMotion) return;

    const resetZone = Math.min(window.innerHeight * 0.62, 520);
    if (window.scrollY < resetZone) {
      flowSections.forEach((section) => section.classList.remove("is-visible"));
      return;
    }

    const revealLine = window.innerHeight * 0.84;
    const resetLine = window.innerHeight * 0.08;

    flowSections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const shouldShow = rect.top < revealLine && rect.bottom > resetLine;
      section.classList.toggle("is-visible", shouldShow);
    });
  }

  if (reduceMotion) {
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
