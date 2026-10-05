(function () {
  var S = window.SITE || {}, $ = function (id) { return document.getElementById(id); };

  /* contact links */
  $("waLink").href = S.whatsapp; $("igLink").href = S.instagram;
  $("mailLink").href = "mailto:" + S.email; $("mailLink").textContent = S.email;
  $("year").textContent = new Date().getFullYear();
  if (!S.available) $("avail").style.display = "none";

  /* marquee */
  var words = ["Video Editing", "Videography", "Photography", "Colour Grading", "Sound Design", "Motion Graphics", "Reels", "Brand Films"];
  var html = words.map(function (w) { return "<span>" + w + "</span>"; }).join("");
  $("track").innerHTML = html + html;

  /* YouTube helpers: accept a full link or a bare 11-char ID */
  function ytId(u) {
    if (!u) return "";
    u = String(u).trim();
    if (/^[\w-]{11}$/.test(u)) return u;
    var m = u.match(/(?:v=|youtu\.be\/|shorts\/|embed\/|live\/)([\w-]{11})/);
    return m ? m[1] : "";
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* videos: thumbnail first, iframe only on click (keeps the page fast) */
  var grid = $("vgrid");
  (window.VIDEOS || []).forEach(function (v) {
    var id = ytId(v.url), card = document.createElement("article");
    card.className = "vcard reveal" + (v.featured ? " featured" : "") + (v.vertical ? " vertical" : "");
    var media = id
      ? '<div class="vmedia" role="button" tabindex="0" aria-label="Play ' + esc(v.title) + '" data-id="' + id + '">' +
        '<img loading="lazy" alt="' + esc(v.title) + ' thumbnail" src="https://i.ytimg.com/vi/' + id + '/hqdefault.jpg"><span class="play"></span></div>'
      : '<div class="vmedia empty"><span>Video coming soon</span></div>';
    card.innerHTML = media + '<div class="vmeta"><h3>' + esc(v.title) + "</h3><span>" + esc(v.category) + "</span></div>";
    grid.appendChild(card);
  });
  function play(el) {
    if (el.querySelector("iframe")) return;
    var f = document.createElement("iframe");
    f.src = "https://www.youtube-nocookie.com/embed/" + el.dataset.id + "?autoplay=1&rel=0&modestbranding=1&playsinline=1";
    f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen"; f.allowFullscreen = true;
    f.title = el.getAttribute("aria-label");
    el.innerHTML = ""; el.appendChild(f); el.removeAttribute("role"); el.removeAttribute("tabindex");
  }
  grid.addEventListener("click", function (e) { var m = e.target.closest(".vmedia[data-id]"); if (m) play(m); });
  grid.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var m = e.target.closest(".vmedia[data-id]"); if (m) { e.preventDefault(); play(m); }
  });

  /* photos (section hidden until you add some) */
  var photos = window.PHOTOS || [];
  if (photos.length) {
    $("photos").hidden = false;
    $("pgrid").innerHTML = photos.map(function (p) {
      return '<figure><img loading="lazy" src="' + esc(p.src) + '" alt="' + esc(p.alt || "") + '">' + (p.tag ? "<figcaption>" + esc(p.tag) + "</figcaption>" : "") + "</figure>";
    }).join("");
  }

  /* mobile menu */
  var btn = $("menuBtn");
  function setMenu(open) { document.body.classList.toggle("menu-open", open); btn.setAttribute("aria-expanded", open); }
  btn.addEventListener("click", function () { setMenu(!document.body.classList.contains("menu-open")); });
  $("menu").addEventListener("click", function (e) { if (e.target.tagName === "A") setMenu(false); });

  /* scroll reveal */
  var els = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } });
    }, { threshold: .12 });
    els.forEach(function (el) { io.observe(el); });
  } else els.forEach(function (el) { el.classList.add("in"); });
})();
