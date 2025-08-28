const API_URL = 'http://localhost:3000';

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
            <h3>Необходима авторизация</h3>
            <p>Для просмотра избранного необходимо войти в систему</p>
            <div style="margin-top: 20px;">
                <a href="login.html" class="auth-button" style="margin-right: 10px;">Войти</a>
                <a href="register.html" class="auth-button">Зарегистрироваться</a>
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
    
    fetch(`${API_URL}/favorites?userId=${userId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка загрузки избранного');
            }
            return response.json();
        })
        .then(favorites => {
            const productPromises = favorites.map(favorite => 
                fetch(`${API_URL}/products/${favorite.productId}`)
                    .then(response => response.json())
                    .then(product => ({
                        ...favorite,
                        product: product
                    }))
                    .catch(error => {
                        console.error('Ошибка загрузки товара:', error);
                        return {
                            ...favorite,
                            product: null
                        };
                    })
            );

            return Promise.all(productPromises);
        })
        .then(favoritesWithProducts => {
            displayFavorites(favoritesWithProducts);
        })
        .catch(error => {
            console.error('Ошибка загрузки избранного:', error);
            const favoritesGrid = getElement('favoritesGrid');
            const emptyFavorites = getElement('emptyFavorites');
            
            if (favoritesGrid) {
                favoritesGrid.innerHTML = '';
            }
            if (emptyFavorites) {
                emptyFavorites.style.display = 'block';
                emptyFavorites.innerHTML = `
                    <h3>Ошибка загрузки избранного</h3>
                    <p>Попробуйте перезагрузить страницу</p>
                    <a href="catalog.html" class="back-button">Перейти в каталог</a>
                `;
            }
        });
}

function displayFavorites(favorites) {
    const container = getElement('favoritesGrid');
    const emptyFavorites = getElement('emptyFavorites');
    
    if (!container || !emptyFavorites) return;

    const validFavorites = favorites.filter(favorite => favorite.product);
    
    if (validFavorites.length === 0) {
        container.innerHTML = '';
        emptyFavorites.style.display = 'block';
        return;
    }
    
    emptyFavorites.style.display = 'none';
    container.innerHTML = '';
    
    validFavorites.forEach(favorite => {
        const card = document.createElement('div');
        card.className = 'product-card';

        let stars = '';
        const fullStars = Math.floor(favorite.product.rating);
        const hasHalfStar = favorite.product.rating % 1 !== 0;
        
        for (let i = 0; i < fullStars; i++) {
            stars += '★';
        }
        if (hasHalfStar) {
            stars += '½';
        }
        for (let i = stars.length; i < 5; i++) {
            stars += '☆';
        }

        card.innerHTML = `
            <button class="remove-favorite-btn" onclick="removeFromFavorites('${favorite.id}')">×</button>
            <img src="${favorite.product.image}" alt="${favorite.product.name}" class="product-image">
            <div class="product-info">
                <div class="product-category">${favorite.product.category}</div>
                <h3 class="product-title">${favorite.product.name}</h3>
                <p class="product-description">${favorite.product.description}</p>
                <div class="product-meta">
                    <div class="product-price">${favorite.product.price} руб.</div>
                    <div class="product-rating">
                        ${stars} <span>${favorite.product.rating}</span>
                    </div>
                </div>
                <div class="product-actions">
                    <button class="action-btn cart-btn" onclick="addToCartFromFavorites(${favorite.product.id})">В корзину</button>
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });

    const invalidCount = favorites.length - validFavorites.length;
    if (invalidCount > 0) {
        console.warn(`Найдено ${invalidCount} избранных товаров с несуществующими продуктами`);
    }
}

function removeFromFavorites(favoriteId) {
    if (!confirm('Удалить товар из избранного?')) return;
    
    fetch(`${API_URL}/favorites/${favoriteId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Ошибка удаления из избранного');
        }
        loadFavorites();
    })
    .catch(error => {
        console.error('Ошибка при удалении из избранного:', error);
        alert('Не удалось удалить товар из избранного');
    });
}

function addToCartFromFavorites(productId) {
    fetch(`${API_URL}/cart`)
        .then(response => response.json())
        .then(cart => {
            const existingItem = cart.find(item => item.productId == productId);
            
            if (existingItem) {
                fetch(`${API_URL}/cart/${existingItem.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        quantity: existingItem.quantity + 1
                    })
                })
                .then(() => {
                    alert('Количество товара увеличено!');
                })
                .catch(error => {
                    console.error('Ошибка увеличения количества:', error);
                    alert('Не удалось увеличить количество товара');
                });
            } else {
                fetch(`${API_URL}/cart`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        productId: productId,
                        quantity: 1,
                        addedAt: new Date().toISOString()
                    })
                })
                .then(() => {
                    alert('Товар добавлен в корзину!');
                })
                .catch(error => {
                    console.error('Ошибка добавления в корзину:', error);
                    alert('Не удалось добавить товар в корзину');
                });
            }
        })
        .catch(error => {
            console.error('Ошибка загрузки корзины:', error);
            alert('Не удалось добавить товар в корзину');
        });
}