function toggleTheme() {
    const body = document.body;
    const isDarkTheme = body.classList.contains('dark-theme');
    
    if (isDarkTheme) {
        body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
        updateThemeIcon('light');
    } else {
        body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
        updateThemeIcon('dark');
    }
}

function updateThemeIcon(theme) {
    const themeButton = document.getElementById('theme-switcher');
    if (themeButton) {
        themeButton.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
}


document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            updateThemeIcon('dark');
        } else {
            document.body.classList.remove('dark-theme');
            updateThemeIcon('light');
        }
    } else {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
            updateThemeIcon('dark');
        }
    }

    const themeButton = document.getElementById('theme-switcher');
    if (themeButton) {
        themeButton.addEventListener('click', toggleTheme);
    }
});