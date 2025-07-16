export function loadPage(page, clickedLink) {
    return fetch(page)
        .then(response => response.text())
        .then(data => {
            document.getElementById('main-content').innerHTML = data;
            
            // Deactivate all links
            document.querySelectorAll('#left-navbar-container .nav-link').forEach(link => {
                link.classList.remove('active');
            });

            // Activate the clicked link
            if (clickedLink) {
                clickedLink.classList.add('active');
            } else {
                // Activate the dashboard link by default
                document.querySelector('#left-navbar-container .nav-link[data-page="content/dashboard.html"]').classList.add('active');
            }
        });
}
