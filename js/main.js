import { loadPage } from './navigation.js';
import { initializeTheme } from './theme.js';
import { loadChart } from './charts.js';

document.addEventListener('DOMContentLoaded', () => {
    // Load initial content
    loadPage('content/dashboard.html', null).then(() => {
        loadChart();
    });
    
    // Load navigation bars
    fetch('top-navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('top-navbar-container').innerHTML = data;
            initializeTheme();
        });

    fetch('left-navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('left-navbar-container').innerHTML = data;
            document.querySelectorAll('#left-navbar-container .nav-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const page = e.currentTarget.getAttribute('data-page');
                    loadPage(page, e.currentTarget).then(() => {
                        if (page === 'content/dashboard.html') {
                            loadChart();
                        }
                    });
                });
            });
        });
});
