// This script inserts the navigation bar near the top of
// every page. It is included via a root-relative path
// (/scripts/nav.js) so it works the same from any directory
// depth (e.g. /teaching/*.html).

fetch('/nav.html')
.then(res => res.text())
.then(text => {
    let oldelem = document.querySelector("script#insert_menu");
    let newelem = document.createElement("div");
    newelem.innerHTML = text;
    oldelem.parentNode.replaceChild(newelem, oldelem);

    // Highlight the nav button for the current page. Root URLs
    // resolve to "/", which maps back to the Home entry.
    let currentPage = window.location.pathname;
    if (currentPage === '/' || currentPage === '') {
        currentPage = '/index.html';
    }
    newelem.querySelectorAll('.dropbtn a').forEach(link => {
        const href = link.getAttribute('href');
        const isActive = href === currentPage ||
            (href === '/teaching.html' && currentPage.startsWith('/teaching/'));
        if (isActive) {
            link.closest('.dropbtn').classList.add('nav-active');
        }
    });

    // Mobile hamburger toggle.
    const toggle = newelem.querySelector('#navToggle');
    const links = newelem.querySelector('#navLinks');
    if (toggle && links) {
        toggle.addEventListener('click', () => {
            const open = links.classList.toggle('nav-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        links.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                links.classList.remove('nav-open');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });
    }
})
