/* ===== LinkedIn Posts Archive ===== */
(function () {
    'use strict';

    var POSTS = window.POSTS_DATA || [];
    var MEDIA_DIR = 'Images/posts/';

    /* Fold fancy unicode (LinkedIn math-bold letters) to plain lowercase for search */
    function fold(s) {
        return (s || '').normalize('NFKC').toLowerCase();
    }

    POSTS.forEach(function (p) {
        p._search = fold(p.text) + ' ' + p.date;
        p._year = p.date.slice(0, 4);
    });

    var state = { query: '', year: 'all', kind: 'all' };

    /* inject year filter chips from the data */
    (function buildYearChips() {
        var wrap = document.getElementById('year-filters');
        if (!wrap) { return; }
        var years = {};
        POSTS.forEach(function (p) { years[p._year] = 1; });
        Object.keys(years).sort().reverse().forEach(function (y) {
            var b = document.createElement('button');
            b.className = 'filter-chip';
            b.dataset.group = 'year';
            b.dataset.value = y;
            b.textContent = y;
            b.setAttribute('aria-pressed', 'false');
            wrap.appendChild(b);
        });
    })();

    /* shareable filtered views: posts.html?q=faiss&year=2025&kind=video */
    (function initFromParams() {
        var params = new URLSearchParams(location.search);
        if (params.get('q')) { state.query = params.get('q'); }
        if (params.get('year')) { state.year = params.get('year'); }
        if (params.get('kind')) { state.kind = params.get('kind'); }
    })();

    var feed = document.getElementById('posts-feed');
    var countEl = document.getElementById('posts-count');
    var searchEl = document.getElementById('posts-search');
    var clearBtn = document.getElementById('posts-search-clear');
    var srStatus = document.getElementById('sr-status');

    function announce(msg) {
        if (srStatus) { srStatus.textContent = msg; }
    }

    /* ---- rendering helpers ---- */
    function esc(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    /* linkify on RAW text (escaping happens per-segment) so quotes/brackets
       around a URL can never bleed into the href as partial entities */
    var URL_RE = /https?:\/\/[^\s<>"]+/g;

    function trimUrl(url) {
        for (;;) {
            var ch = url.charAt(url.length - 1);
            if ('.,;:!?]'.indexOf(ch) !== -1 && ch !== '') {
                url = url.slice(0, -1);
                continue;
            }
            if (ch === ')') {
                var opens = (url.match(/\(/g) || []).length;
                var closes = (url.match(/\)/g) || []).length;
                if (closes > opens) {
                    url = url.slice(0, -1);
                    continue;
                }
            }
            break;
        }
        return url;
    }

    function decorate(plain) {
        return esc(plain).replace(/(^|\s)#([\p{L}\p{N}_]+)/gu,
            '$1<span class="hashtag">#$2</span>');
    }

    function richText(s) {
        var out = '';
        var last = 0;
        var m;
        URL_RE.lastIndex = 0;
        while ((m = URL_RE.exec(s)) !== null) {
            var url = trimUrl(m[0]);
            if (!url) { continue; }
            out += decorate(s.slice(last, m.index));
            out += '<a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' +
                esc(url) + '</a>';
            last = m.index + url.length;
        }
        out += decorate(s.slice(last));
        return out;
    }

    function domainOf(url) {
        try { return new URL(url).hostname.replace(/^www\./, ''); }
        catch (e) { return 'link'; }
    }

    var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    function fmtDate(d) {
        return MONTHS[+d.slice(5, 7) - 1] + ' ' + (+d.slice(8, 10)) + ', ' + d.slice(0, 4);
    }

    function mediaHTML(p) {
        if (!p.media || !p.media.length) { return ''; }
        var alt = esc((p.text.split('\n')[0] || '').normalize('NFKC').slice(0, 120)) ||
            'LinkedIn post media';
        var imgs = p.media.filter(function (m) { return m.kind === 'image'; });
        var parts = p.media.map(function (m) {
            var src = MEDIA_DIR + m.file;
            if (m.kind === 'image') {
                return '<img src="' + src + '" loading="lazy" decoding="async" alt="' +
                    alt + '" data-zoom tabindex="0" role="button">';
            }
            if (m.kind === 'video') {
                return '<video controls preload="none" playsinline' +
                    (m.poster ? ' poster="' + MEDIA_DIR + m.poster + '"' : '') +
                    '><source src="' + src + '" type="video/mp4"></video>';
            }
            if (m.kind === 'thumb') {
                return '<a class="post-linkcard" href="' + esc(m.href || p.sharedUrl) +
                    '" target="_blank" rel="noopener noreferrer">' +
                    '<img src="' + src + '" loading="lazy" decoding="async" alt="YouTube thumbnail: ' +
                    alt + '">' +
                    '<span class="linkcard-badge"><i class="fab fa-youtube" aria-hidden="true"></i>' +
                    'Watch on YouTube</span></a>';
            }
            return '<a class="post-doc" href="' + src + '" target="_blank" rel="noopener">' +
                '<i class="fas fa-file-pdf" aria-hidden="true"></i><span>View document (PDF)</span></a>';
        });
        var cls = 'post-media' + (imgs.length > 1 ? ' grid-2' : '');
        return '<div class="' + cls + '">' + parts.join('') + '</div>';
    }

    function cardHTML(p) {
        var repost = p.dupCount > 1
            ? '<span class="post-repost-note" title="Shared ' + p.dupCount +
              ' times on LinkedIn (groups/reposts) — shown once here">shared ×' +
              p.dupCount + '</span>'
            : '';
        return '<article class="post-card" id="' + p.id + '">' +
            '<div class="post-meta"><i class="fab fa-linkedin" aria-hidden="true"></i>' +
            '<span class="post-date">' + fmtDate(p.date) + '</span>' + repost + '</div>' +
            '<div class="post-text clamped" id="txt-' + p.id + '">' + richText(p.text) + '</div>' +
            '<button class="post-more-btn" hidden aria-expanded="false" aria-controls="txt-' +
            p.id + '">See more</button>' +
            mediaHTML(p) +
            '<div class="post-actions">' +
            (p.link ? '<a class="post-action" href="' + esc(p.link) +
                '" target="_blank" rel="noopener noreferrer">' +
                '<i class="fab fa-linkedin-in" aria-hidden="true"></i>View on LinkedIn</a>' : '') +
            (p.sharedUrl ? '<a class="post-action" href="' + esc(p.sharedUrl) +
                '" target="_blank" rel="noopener noreferrer">' +
                '<i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i>' +
                esc(domainOf(p.sharedUrl)) + '</a>' : '') +
            '<button class="post-action" data-copy="' + p.id + '">' +
            '<i class="fas fa-link" aria-hidden="true"></i>Copy link</button>' +
            '</div></article>';
    }

    /* ---- filtering ---- */
    function visiblePosts() {
        var q = fold(state.query.trim());
        var terms = q ? q.split(/\s+/) : [];
        return POSTS.filter(function (p) {
            if (state.year !== 'all' && p._year !== state.year) { return false; }
            if (state.kind !== 'all') {
                var kinds = (p.media || []).map(function (m) { return m.kind; });
                if (kinds.indexOf(state.kind) === -1) { return false; }
            }
            return terms.every(function (t) { return p._search.indexOf(t) !== -1; });
        });
    }

    /* show See-more only when the clamp actually hides text; re-run after
       webfont load and on resize because line wrapping changes */
    function updateClamps() {
        feed.querySelectorAll('.post-text').forEach(function (el) {
            var btn = el.nextElementSibling;
            if (!btn || !btn.classList.contains('post-more-btn')) { return; }
            if (el.classList.contains('clamped')) {
                btn.hidden = el.scrollHeight <= el.clientHeight + 4;
            } else {
                btn.hidden = false;
            }
        });
    }

    function render() {
        var posts = visiblePosts();
        countEl.textContent = posts.length === POSTS.length
            ? POSTS.length + ' posts'
            : posts.length + ' of ' + POSTS.length + ' posts';
        if (!posts.length) {
            feed.innerHTML = '<div class="posts-empty"><i class="fas fa-magnifying-glass" aria-hidden="true"></i>' +
                'No posts match your search.</div>';
            return;
        }
        feed.innerHTML = posts.map(cardHTML).join('');
        updateClamps();
    }

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(updateClamps);
    }
    var resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(updateClamps, 150);
    });

    /* ---- events ---- */
    var debounce;
    searchEl.addEventListener('input', function () {
        clearTimeout(debounce);
        clearBtn.style.display = searchEl.value ? 'block' : 'none';
        debounce = setTimeout(function () {
            state.query = searchEl.value;
            render();
        }, 120);
    });

    clearBtn.addEventListener('click', function () {
        searchEl.value = '';
        clearBtn.style.display = 'none';
        state.query = '';
        render();
        searchEl.focus();
    });

    document.querySelectorAll('.filter-chip').forEach(function (chip) {
        if (!chip.hasAttribute('aria-pressed')) {
            chip.setAttribute('aria-pressed', chip.classList.contains('active') ? 'true' : 'false');
        }
        chip.addEventListener('click', function () {
            var group = chip.dataset.group;
            document.querySelectorAll('.filter-chip[data-group="' + group + '"]')
                .forEach(function (c) {
                    c.classList.remove('active');
                    c.setAttribute('aria-pressed', 'false');
                });
            chip.classList.add('active');
            chip.setAttribute('aria-pressed', 'true');
            state[group] = chip.dataset.value;
            render();
        });
    });

    function toggleSeeMore(more) {
        var txt = more.previousElementSibling;
        var clamped = txt.classList.toggle('clamped');
        more.textContent = clamped ? 'See more' : 'See less';
        more.setAttribute('aria-expanded', clamped ? 'false' : 'true');
    }

    function copyLink(copy) {
        var url = location.origin + location.pathname + '#' + copy.dataset.copy;
        var icon = copy.querySelector('i');
        function ok() {
            icon.className = 'fas fa-check';
            announce('Link copied to clipboard');
            setTimeout(function () { icon.className = 'fas fa-link'; }, 1500);
        }
        function fallback() {
            window.prompt('Copy this link:', url);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(ok, fallback);
        } else {
            fallback();
        }
    }

    feed.addEventListener('click', function (e) {
        var more = e.target.closest('.post-more-btn');
        if (more) { toggleSeeMore(more); return; }
        var copy = e.target.closest('[data-copy]');
        if (copy) { copyLink(copy); return; }
        var zoom = e.target.closest('[data-zoom]');
        if (zoom) { openLightbox(zoom.src); }
    });

    feed.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') { return; }
        var zoom = e.target.closest('[data-zoom]');
        if (zoom) {
            e.preventDefault();
            openLightbox(zoom.src);
        }
    });

    /* ---- image lightbox ---- */
    var modal = document.getElementById('img-modal');
    var modalImg = modal.querySelector('img');
    var modalClose = modal.querySelector('.img-modal-close');
    var lastFocus = null;

    function openLightbox(src) {
        lastFocus = document.activeElement;
        modalImg.src = src;
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
        modalClose.focus();
    }
    function closeLightbox() {
        modal.classList.remove('open');
        modalImg.src = '';
        document.body.style.overflow = '';
        if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
    }
    modal.querySelector('.img-modal-backdrop').addEventListener('click', closeLightbox);
    modalClose.addEventListener('click', closeLightbox);
    modal.addEventListener('keydown', function (e) {
        if (e.key === 'Tab') {
            /* single focusable element — keep focus on the close button */
            e.preventDefault();
            modalClose.focus();
        }
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('open')) { closeLightbox(); }
    });

    /* ---- hash permalink ---- */
    function scrollToCard(card, smooth) {
        var nav = document.getElementById('navbar');
        var controls = document.querySelector('.posts-controls');
        var offset = (nav ? nav.offsetHeight : 70) +
            (controls ? controls.offsetHeight : 0) + 16;
        var top = card.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: Math.max(top, 0), behavior: smooth ? 'smooth' : 'instant' });
    }

    function goToHash(smooth) {
        var id = location.hash.slice(1);
        if (!id) { return; }
        var card = document.getElementById(id);
        if (!card || !card.classList.contains('post-card')) { return; }
        var txt = card.querySelector('.post-text');
        var btn = card.querySelector('.post-more-btn');
        if (txt && btn && !btn.hidden && txt.classList.contains('clamped')) {
            toggleSeeMore(btn);
        }
        card.classList.add('highlight');
        scrollToCard(card, smooth);
        setTimeout(function () { card.classList.remove('highlight'); }, 3500);
    }
    window.addEventListener('hashchange', function () { goToHash(true); });

    /* ---- navbar / scroll chrome (mirrors script.js for this page) ---- */
    var navbar = document.getElementById('navbar');
    var backToTop = document.getElementById('backToTop');
    var hamburger = document.getElementById('hamburger');
    var navMenu = document.getElementById('nav-menu');

    function handleScroll() {
        if (navbar) { navbar.classList.toggle('scrolled', window.scrollY > 50); }
        if (backToTop) { backToTop.classList.toggle('visible', window.scrollY > 500); }
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    if (hamburger && navMenu) {
        var toggleMenu = function () {
            var open = !navMenu.classList.contains('active');
            hamburger.classList.toggle('active', open);
            navMenu.classList.toggle('active', open);
            hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
            document.body.style.overflow = open ? 'hidden' : '';
        };
        hamburger.addEventListener('click', toggleMenu);
        hamburger.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMenu();
            }
        });
        navMenu.querySelectorAll('.nav-link').forEach(function (link) {
            link.addEventListener('click', function () {
                if (navMenu.classList.contains('active')) { toggleMenu(); }
            });
        });
    }

    var yearEl = document.getElementById('year');
    if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

    /* reflect any URL-param state in the controls */
    if (state.query) {
        searchEl.value = state.query;
        clearBtn.style.display = 'block';
    }
    ['year', 'kind'].forEach(function (group) {
        if (state[group] === 'all') { return; }
        var chip = document.querySelector(
            '.filter-chip[data-group="' + group + '"][data-value="' + state[group] + '"]');
        if (chip) {
            document.querySelectorAll('.filter-chip[data-group="' + group + '"]')
                .forEach(function (c) {
                    c.classList.remove('active');
                    c.setAttribute('aria-pressed', 'false');
                });
            chip.classList.add('active');
            chip.setAttribute('aria-pressed', 'true');
        } else {
            state[group] = 'all';
        }
    });

    render();
    goToHash(false);
})();
