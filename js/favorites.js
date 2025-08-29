const API_URL = 'http://localhost:3000';

function safeGetTranslation(key) {
    if (typeof getTranslation === 'function') {
        return getTranslation(key);
    }
    const fallbackTranslations = {
        "favoritesTitle": "Избранное",
        "emptyFavoritesTitle": "В избранном пока ничего нет",
        "emptyFavoritesText": "Добавьте услуги, которые вам понравились",
        "goToCatalog": "Перейти в каталог",
        "authRequired": "Необходима авторизация",
        "authRequiredText": "Для просмотра избранного необходимо войти в систему",
        "login": "Войти",
        "register": "Зарегистрироваться",
        "loadError": "Ошибка загрузки избранного",
        "loadErrorText": "Попробуйте перезагрузить страницу",
        "removeFavorite": "Удалить товар из избранного?",
        "addToCart": "В корзину",
        "quantityIncreased": "Количество товара увеличено!",
        "addedToCart": "Товар добавлен в корзину!",
        "removeError": "Не удалось удалить товар из избранного",
        "cartError": "Не удалось добавить товар в корзину",
        "price": "руб.",
        "category": "Категория"
    };
    return fallbackTranslations[key] || key;
}

function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.error(`Элемент с ID ${id} не найден`);
    }
    return element;
}

function getCurrentUserId() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    return user ? user.id : null;
}

function parseProductId(productId) {
    const id = parseInt(productId);
    return isNaN(id) ? productId : id;
}

document.addEventListener('DOMContentLoaded', function() {
    if (!getCurrentUserId()) {
        showLoginPrompt();
        return;
    }
    loadFavorites();
});

function showLoginPrompt() {
    const container = getElement('favoritesGrid');
    const emptyFavorites = getElement('emptyFavorites');
    
    if (container && emptyFavorites) {
        container.innerHTML = '';
        emptyFavorites.style.display = 'block';
        emptyFavorites.innerHTML = `
            <h3>${safeGetTranslation('authRequired')}</h3>
            <p>${safeGetTranslation('authRequiredText')}</p>
            <div style="margin-top: 20px;">
                <a href="login.html" class="auth-button" style="margin-right: 10px;">${safeGetTranslation('login')}</a>
                <a href="register.html" class="auth-button">${safeGetTranslation('register')}</a>
            </div>
        `;
    }
}

function loadFavorites() {
    const userId = getCurrentUserId();
    if (!userId) {
        showLoginPrompt();
        return;
    }

    fetch(`${API_URL}/users/${userId}`)
        .then(res => res.json())
        .then(user => {
            const favorites = user.favorites || [];
            if (favorites.length === 0) {
                displayFavorites([]);
                return;
            }

            const productPromises = favorites.map(productId =>
                fetch(`${API_URL}/products/${productId}`)
                    .then(res => res.json())
                    .then(product => ({ productId, product }))
                    .catch(err => {
                        console.warn('Товар не найден:', productId);
                        return null;
                    })
            );

            return Promise.all(productPromises);
        })
        .then(favoritesWithProducts => {
            if (!favoritesWithProducts) return;
            const validFavorites = favoritesWithProducts.filter(f => f !== null);
            displayFavorites(validFavorites);
        })
        .catch(error => {
            console.error('Ошибка загрузки избранного:', error);
            const container = getElement('favoritesGrid');
            const emptyFavorites = getElement('emptyFavorites');
            if (container) container.innerHTML = '';
            if (emptyFavorites) {
                emptyFavorites.style.display = 'block';
                emptyFavorites.innerHTML = `
                    <h3>${safeGetTranslation('loadError')}</h3>
                    <p>${safeGetTranslation('loadErrorText')}</p>
                    <a href="catalog.html" class="back-button">${safeGetTranslation('goToCatalog')}</a>
                `;
            }
        });
}

function displayFavorites(favorites) {
    const container = getElement('favoritesGrid');
    const emptyFavorites = getElement('emptyFavorites');
    
    if (!container || !emptyFavorites) return;

    if (favorites.length === 0) {
        container.innerHTML = '';
        emptyFavorites.style.display = 'block';
        emptyFavorites.innerHTML = `
            <h3>${safeGetTranslation('emptyFavoritesTitle')}</h3>
            <p>${safeGetTranslation('emptyFavoritesText')}</p>
            <a href="catalog.html" class="back-button">${safeGetTranslation('goToCatalog')}</a>
        `;
        return;
    }
    
    emptyFavorites.style.display = 'none';
    container.innerHTML = '';
    
    favorites.forEach(fav => {
        const product = fav.product;
        const card = document.createElement('div');
        card.className = 'product-card';

        let stars = '';
        const fullStars = Math.floor(product.rating);
        const hasHalfStar = product.rating % 1 !== 0;
        
        for (let i = 0; i < fullStars; i++) stars += '★';
        if (hasHalfStar) stars += '½';
        for (let i = stars.length; i < 5; i++) stars += '☆';

        card.innerHTML = `
            <button class="remove-favorite-btn" onclick="removeFromFavorites('${fav.productId}')">×</button>
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-meta">
                    <div class="product-price">${product.price} ${safeGetTranslation('price')}</div>
                    <div class="product-rating">
                        ${stars} <span>${product.rating}</span>
                    </div>
                </div>
                <div class="product-actions">
                    <button class="action-btn cart-btn" onclick="addToCart('${product.id}')">${safeGetTranslation('addToCart')}</button>
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

function removeFromFavorites(productId) {
    if (!confirm(safeGetTranslation('removeFavorite'))) return;
    
    const userId = getCurrentUserId();
    if (!userId) {
        alert(safeGetTranslation('authRequired'));
        return;
    }

    fetch(`${API_URL}/users/${userId}`)
        .then(res => res.json())
        .then(user => {
            const updatedFavorites = (user.favorites || []).filter(id => id !== productId);
            return fetch(`${API_URL}/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ favorites: updatedFavorites })
            });
        })
        .then(() => loadFavorites())
        .catch(err => {
            console.error(err);
            alert(safeGetTranslation('removeError'));
        });
}

function addToCart(productId) {
    const userId = getCurrentUserId();
    if (!userId) {
        alert(safeGetTranslation('authRequired'));
        return;
    }

    fetch(`${API_URL}/cart?userId=${userId}`)
        .then(res => res.json())
        .then(cart => {
            const existing = cart.find(item => item.productId === productId);
            if (existing) {
                return fetch(`${API_URL}/cart/${existing.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ quantity: existing.quantity + 1 })
                });
            } else {
                return fetch(`${API_URL}/cart`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id: crypto.randomUUID(),
                        userId,
                        productId,
                        quantity: 1
                    })
                });
            }
        })
        .then(() => {
            alert(safeGetTranslation('addedToCart'));
        })
        .catch(err => {
            console.error(err);
            alert(safeGetTranslation('cartError'));
        });
}

function updateFavoritesTranslation(lang) {
    const favoritesTitle = document.querySelector('.catalog-title');
    if (favoritesTitle) favoritesTitle.textContent = safeGetTranslation('favoritesTitle');
    
    loadFavorites();
}