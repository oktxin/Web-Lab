const API_BASE_URL = 'http://localhost:3000';

function isUserLoggedIn() {
    return localStorage.getItem('currentUser') !== null;
}

function getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
}

function saveUserToLocalStorage(userData) {
    localStorage.setItem('currentUser', JSON.stringify(userData));
}

async function updateUserOnServer(userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userData.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            throw new Error('Ошибка при обновлении пользователя на сервере');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Ошибка при обновлении пользователя:', error);
        throw error;
    }
}

async function getUserFromServer(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`);
        if (!response.ok) {
            throw new Error('Ошибка при получении пользователя с сервера');
        }
        return await response.json();
    } catch (error) {
        console.error('Ошибка при получении пользователя:', error);
        throw error;
    }
}

async function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'home.html';
}

async function resetUserSettings() {
    const user = getCurrentUser();
    if (user) {
        try {
            const serverUser = await getUserFromServer(user.id);

            const resetUser = {
                ...serverUser,
                favorites: [],
                cart: [],
                settings: {} 
            };
           
            const updatedUser = await updateUserOnServer(resetUser);

            saveUserToLocalStorage(updatedUser);

            localStorage.removeItem('theme');
            localStorage.removeItem('preferredLanguage');

            document.body.classList.remove('dark-theme');
            updateThemeIcon('light');
            setLanguage('en'); 

            return true;
        } catch (error) {
            console.error('Ошибка при сбросе настроек:', error);
            alert('Ошибка при сбросе настроек. Попробуйте позже.');
            return false;
        }
    }
    return false;
}


function showProfileModal() {
    const modal = document.getElementById('profileModal');
    const user = getCurrentUser();
    
    if (modal && user) {
        document.getElementById('firstName').value = user.firstName || '';
        document.getElementById('lastName').value = user.lastName || '';
        document.getElementById('nickname').value = user.nickname || '';
        document.getElementById('email').value = user.email || '';
        
        modal.style.display = 'block';
    }
}

function createUserDropdown() {
    const user = getCurrentUser();
    
    const dropdownContainer = document.createElement('div');
    dropdownContainer.className = 'user-dropdown';
    
    const userButton = document.createElement('button');
    userButton.className = 'user-button';
    userButton.innerHTML = `
        <span class="user-avatar">${user.firstName?.charAt(0) || user.nickname?.charAt(0) || 'U'}</span>
        <span class="user-name">${user.firstName || user.nickname || 'User'}</span>
        <span class="dropdown-arrow">▼</span>
    `;
    
    const dropdownMenu = document.createElement('div');
    dropdownMenu.className = 'dropdown-menu';
    dropdownMenu.innerHTML = `
        <div class="dropdown-header">
            <span class="user-avatar-large">${user.firstName?.charAt(0) || user.nickname?.charAt(0) || 'U'}</span>
            <div class="user-info">
                <span class="user-fullname">${user.firstName || ''} ${user.lastName || ''}</span>
                <span class="user-email">${user.email || ''}</span>
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
    
    dropdownMenu.querySelector('.profile-item').addEventListener('click', function(e) {
        e.preventDefault();
        showProfileModal();
        dropdownMenu.classList.remove('show');
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

async function getFavorites() {
    const user = getCurrentUser();
    if (user) {
        try {
            const serverUser = await getUserFromServer(user.id);
            return serverUser.favorites || [];
        } catch (error) {
            console.error('Ошибка при получении избранного:', error);
            return user.favorites || [];
        }
    }
    return [];
}

async function addToFavorites(productId) {
    const user = getCurrentUser();
    if (user) {
        try {
            const serverUser = await getUserFromServer(user.id);
            
            if (!serverUser.favorites) {
                serverUser.favorites = [];
            }
            
            if (!serverUser.favorites.includes(productId)) {
                serverUser.favorites.push(productId);

                const updatedUser = await updateUserOnServer(serverUser);

                saveUserToLocalStorage(updatedUser);
                
                return true;
            }
        } catch (error) {
            console.error('Ошибка при добавлении в избранное:', error);
            if (!user.favorites) {
                user.favorites = [];
            }
            if (!user.favorites.includes(productId)) {
                user.favorites.push(productId);
                saveUserToLocalStorage(user);
                return true;
            }
        }
    }
    return false;
}

async function removeFromFavorites(productId) {
    const user = getCurrentUser();
    if (user) {
        try {
            const serverUser = await getUserFromServer(user.id);
            
            if (serverUser.favorites) {
                serverUser.favorites = serverUser.favorites.filter(id => id !== productId);

                const updatedUser = await updateUserOnServer(serverUser);

                saveUserToLocalStorage(updatedUser);
                
                return true;
            }
        } catch (error) {
            console.error('Ошибка при удалении из избранного:', error);

            if (user.favorites) {
                user.favorites = user.favorites.filter(id => id !== productId);
                saveUserToLocalStorage(user);
                return true;
            }
        }
    }
    return false;
}

async function getCart() {
    const user = getCurrentUser();
    if (user) {
        try {
            const serverUser = await getUserFromServer(user.id);
            return serverUser.cart || [];
        } catch (error) {
            console.error('Ошибка при получении корзины:', error);
            return user.cart || [];
        }
    }
    return [];
}

async function addToCart(productId, quantity = 1) {
    const user = getCurrentUser();
    if (user) {
        try {
            const serverUser = await getUserFromServer(user.id);
            
            if (!serverUser.cart) {
                serverUser.cart = [];
            }
            
            const existingItem = serverUser.cart.find(item => item.productId === productId);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                serverUser.cart.push({ productId, quantity });
            }

            const updatedUser = await updateUserOnServer(serverUser);

            saveUserToLocalStorage(updatedUser);
            
            return true;
        } catch (error) {
            console.error('Ошибка при добавлении в корзину:', error);

            if (!user.cart) {
                user.cart = [];
            }
            
            const existingItem = user.cart.find(item => item.productId === productId);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                user.cart.push({ productId, quantity });
            }
            
            saveUserToLocalStorage(user);
            return true;
        }
    }
    return false;
}

async function removeFromCart(productId) {
    const user = getCurrentUser();
    if (user) {
        try {
            const serverUser = await getUserFromServer(user.id);
            
            if (serverUser.cart) {
                serverUser.cart = serverUser.cart.filter(item => item.productId !== productId);

                const updatedUser = await updateUserOnServer(serverUser);

                saveUserToLocalStorage(updatedUser);
                
                return true;
            }
        } catch (error) {
            console.error('Ошибка при удалении из корзины:', error);
            if (user.cart) {
                user.cart = user.cart.filter(item => item.productId !== productId);
                saveUserToLocalStorage(user);
                return true;
            }
        }
    }
    return false;
}

document.addEventListener('DOMContentLoaded', function() {
    updateHeaderAuthState();

    const modal = document.getElementById('profileModal');
    if (modal) {
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        modal.querySelector('#profileForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const user = getCurrentUser();
            
            try {
                const serverUser = await getUserFromServer(user.id);
                
                const updatedUser = {
                    ...serverUser,
                    firstName: formData.get('firstName'),
                    lastName: formData.get('lastName'),
                    nickname: formData.get('nickname'),
                    email: formData.get('email'),
                };

                const savedUser = await updateUserOnServer(updatedUser);

                saveUserToLocalStorage(savedUser);
                
                modal.style.display = 'none';
                updateHeaderAuthState();
                alert('Данные успешно сохранены!');
            } catch (error) {
                console.error('Ошибка при сохранении профиля:', error);
                alert('Ошибка при сохранении данных. Попробуйте позже.');
            }
        });
        
        modal.querySelector('#resetSettings').addEventListener('click', async function() {
            if (confirm('Вы уверены, что хотите сбросить все настройки?')) {
                const success = await resetUserSettings();
                if (success) {
                    modal.style.display = 'none';
                    updateHeaderAuthState();
                    alert('Настройки сброшены!');
                }
            }
        });
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    window.addEventListener('storage', function(e) {
        if (e.key === 'currentUser') {
            updateHeaderAuthState();
        }
    });
});