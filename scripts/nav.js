// This script inserts the navigation bar near the top of
// every page.

fetch('nav.html')
.then(res => res.text())
.then(text => {
    let oldelem = document.querySelector("script#insert_menu");
    let newelem = document.createElement("div");
    newelem.innerHTML = text;
    oldelem.parentNode.replaceChild(newelem,oldelem);

    // Highlight the nav button for the current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    newelem.querySelectorAll('.dropbtn a').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.closest('.dropbtn').classList.add('nav-active');
        }
    });
})
