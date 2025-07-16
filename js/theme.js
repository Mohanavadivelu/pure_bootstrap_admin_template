export function initializeTheme() {
    // Load theme from localStorage or set default
    const savedTheme = localStorage.getItem('theme');
    const defaultTheme = 'light';
    const setTheme = (theme) => {
        document.documentElement.setAttribute('data-bs-theme', theme);
        localStorage.setItem('theme', theme);
    };

    setTheme(savedTheme || defaultTheme);

    const themeDropdown = document.getElementById('themeDropdown');
    if (themeDropdown) {
        document.querySelectorAll('.dropdown-item[data-theme]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const theme = e.target.getAttribute('data-theme');
                setTheme(theme);
            });
        });
    }
}
