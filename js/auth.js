function isUserLoggedIn() {
    return localStorage.getItem('currentUser') !== null;
}

function getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'home.html';
}

function createUserDropdown() {
    const user = getCurrentUser();
    
    const dropdownContainer = document.createElement('div');
    dropdownContainer.className = 'user-dropdown';
    
    const userButton = document.createElement('button');
    userButton.className = 'user-button';
    userButton.innerHTML = `
        <span class="user-avatar">${user.firstName?.charAt(0) || 'U'}</span>
        <span class="user-name">${user.firstName || user.nickname}</span>
        <span class="dropdown-arrow">▼</span>
    `;
    
    const dropdownMenu = document.createElement('div');
    dropdownMenu.className = 'dropdown-menu';
    dropdownMenu.innerHTML = `
        <div class="dropdown-header">
            <span class="user-avatar-large">${user.firstName?.charAt(0) || 'U'}</span>
            <div class="user-info">
                <span class="user-fullname">${user.firstName} ${user.lastName}</span>
                <span class="user-email">${user.email}</span>
            </div>
        </div>
        <div class="dropdown-divider"></div>
        <a href="#" class="dropdown-item profile-item">Профиль</a>
        <a href="#" class="dropdown-item settings-item">Настройки</a>
        <div class="dropdown-divider"></div>
        <button class="dropdown-item logout-item">Выйти</button>
    `;
    
    dropdownContainer.appendChild(userButton);
    dropdownContainer.appendChild(dropdownMenu);

    userButton.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });
    
    dropdownMenu.querySelector('.logout-item').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });

    document.addEventListener('click', function(e) {
        if (!dropdownContainer.contains(e.target)) {
            dropdownMenu.classList.remove('show');
        }
    });
    
    return dropdownContainer;
}

function updateHeaderAuthState() {
    const navButtonContainer = document.querySelector('.nav-button');
    
    if (!navButtonContainer) return;

    navButtonContainer.innerHTML = '';
    
    if (isUserLoggedIn()) {
        const dropdown = createUserDropdown();
        navButtonContainer.appendChild(dropdown);
        const user = getCurrentUser();
        if (user.role === 'admin') {
            const adminLink = document.createElement('a');
            adminLink.href = 'admin.html';
            adminLink.className = 'nav-button-link admin';
            adminLink.textContent = 'Админ-панель';
            navButtonContainer.appendChild(adminLink);
        }
        
    } else {
        navButtonContainer.innerHTML = `
            <a href="login.html" class="nav-button-link login">Login</a>
            <a href="register.html" class="nav-button-link trial">Start Free Trial</a>
        `;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    updateHeaderAuthState();

    window.addEventListener('storage', function(e) {
        if (e.key === 'currentUser') {
            updateHeaderAuthState();
        }
    });
});