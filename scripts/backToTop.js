// Inserts the "back to top" button used on every page.
// Included via a script tag with id="insert_backtotop", which this
// script replaces with the button markup and behavior, so the
// button doesn't need to be duplicated on every page.

(() => {
    const oldelem = document.querySelector("script#insert_backtotop");
    if (!oldelem) return;

    const btn = document.createElement("button");
    btn.id = "backToTop";
    btn.type = "button";
    btn.innerHTML = "&#8679; Top";
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    oldelem.parentNode.replaceChild(btn, oldelem);

    window.addEventListener('scroll', () => {
        btn.style.display = window.scrollY > 300 ? 'block' : 'none';
    });
})();
