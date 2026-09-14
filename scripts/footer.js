// Inserts the site footer (copyright + last-updated line) at the
// location of a script tag with id="insert_footer". The
// "last updated" date is looked up from the GitHub commit history
// of the current page itself, so it stays accurate without any
// manual bookkeeping.

(() => {
    const GH_OWNER = 'Hendrik1704';
    const GH_REPO = 'hendrik1704.github.io';
    const SITE_LAUNCH_YEAR = 2025;

    const oldelem = document.querySelector("script#insert_footer");
    if (!oldelem) return;

    const footer = document.createElement("footer");
    footer.id = "footerFlexible";

    const currentYear = new Date().getFullYear();
    const yearRange = currentYear > SITE_LAUNCH_YEAR
        ? `${SITE_LAUNCH_YEAR}–${currentYear}`
        : `${SITE_LAUNCH_YEAR}`;

    const copyrightLine = document.createElement("p");
    copyrightLine.className = "footer-line";
    copyrightLine.innerHTML = `&copy; ${yearRange} Hendrik Roch &middot; <a href="https://github.com/${GH_OWNER}/${GH_REPO}" target="_blank" rel="noopener">source on GitHub</a>`;

    const updatedLine = document.createElement("p");
    updatedLine.className = "footer-line";
    updatedLine.id = "lastUpdatedLine";

    footer.appendChild(copyrightLine);
    footer.appendChild(updatedLine);
    oldelem.parentNode.replaceChild(footer, oldelem);

    // Resolve the current page to a repo-relative file path.
    let path = window.location.pathname;
    if (path === '/' || path === '') {
        path = '/index.html';
    }
    path = path.replace(/^\//, '');

    fetch(`https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/commits?path=${encodeURIComponent(path)}&per_page=1`)
        .then(res => res.ok ? res.json() : Promise.reject(res.status))
        .then(commits => {
            if (!Array.isArray(commits) || commits.length === 0) return;
            const isoDate = commits[0]?.commit?.author?.date;
            if (!isoDate) return;
            const formatted = new Date(isoDate).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
            updatedLine.textContent = `Last updated: ${formatted}`;
        })
        .catch(() => {
            // GitHub API is rate-limited for unauthenticated requests;
            // fail silently rather than showing a broken footer line.
        });
})();
