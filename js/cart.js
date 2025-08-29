const API_URL = 'http://localhost:3000';

function getElement(id) {
    const element = document.getElementById(id);
    if (!element) console.error(`Элемент с ID ${id} не найден`);
    return element;
}

function getCurrentUserId() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    return user ? user.id : null;
}

document.addEventListener('DOMContentLoaded', function () {
    const checkoutBtn = getElement('checkoutBtn');
    const closeModal = getElement('closeModal');

    if (checkoutBtn) checkoutBtn.addEventListener('click', checkout);
    if (closeModal) closeModal.addEventListener('click', () => {
        const modal = getElement('successModal');
        if (modal) modal.style.display = 'none';
    });

    if (!getCurrentUserId()) {
        showLoginPrompt();
        return;
    }

    loadCart();
});

function showLoginPrompt() {
    const container = getElement('cartItems');
    const emptyCart = getElement('emptyCart');
    const cartSummary = getElement('cartSummary');
    const checkoutBtn = getElement('checkoutBtn');

    if (!container || !emptyCart || !cartSummary || !checkoutBtn) return;

    container.innerHTML = '';
    emptyCart.style.display = 'block';
    emptyCart.innerHTML = `
        <h3 data-translate="authRequired">Необходима авторизация</h3>
        <p data-translate="authRequiredText">Для просмотра корзины необходимо войти в систему</p>
        <div style="margin-top: 20px;">
            <a href="login.html" class="auth-button" style="margin-right: 10px;" data-translate="login">Войти</a>
            <a href="register.html" class="auth-button" data-translate="register">Зарегистрироваться</a>
        </div>
    `;
    cartSummary.style.display = 'none';
    checkoutBtn.style.display = 'none';

    if (typeof applyTranslation === 'function') {
        applyTranslation(currentLanguage);
    }
}

function displayCart(cart) {
    const container = getElement('cartItems');
    const emptyCart = getElement('emptyCart');
    const cartSummary = getElement('cartSummary');
    const checkoutBtn = getElement('checkoutBtn');

    if (!container || !emptyCart || !cartSummary || !checkoutBtn) return;

    if (cart.length === 0) {
        container.innerHTML = '';
        emptyCart.style.display = 'block';
        cartSummary.style.display = 'none';
        checkoutBtn.style.display = 'none';
        return;
    }

    emptyCart.style.display = 'none';
    cartSummary.style.display = 'block';
    checkoutBtn.style.display = 'block';
    container.innerHTML = '';

    cart.forEach(item => {
        if (!item.product) return;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.dataset.id = item.productId;

        cartItem.innerHTML = `
            <img src="${item.product.image}" alt="${item.product.name}" class="cart-item-image">
            <div class="cart-item-info">
                <h3 class="cart-item-title">${item.product.name}</h3>
                <div class="cart-item-category">${item.product.category}</div>
                <div class="cart-item-price">${item.product.price} ${getTranslation('price')} × ${item.quantity} = ${item.product.price * item.quantity} ${getTranslation('price')}</div>
                <div class="cart-item-controls">
                    <div class="quantity-control">
                        <button class="quantity-btn" onclick="changeQuantity('${item.productId}', ${item.quantity - 1})">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" onchange="changeQuantity('${item.productId}', parseInt(this.value))">
                        <button class="quantity-btn" onclick="changeQuantity('${item.productId}', ${item.quantity + 1})">+</button>
                    </div>
                    <button class="remove-btn" onclick="removeFromCart('${item.productId}')" data-translate="delete">Удалить</button>
                </div>
            </div>
        `;

        container.appendChild(cartItem);
    });

    if (typeof applyTranslation === 'function') {
        applyTranslation(currentLanguage);
    }
}

function displayError() {
    const container = getElement('cartItems');
    const emptyCart = getElement('emptyCart');
    if (!container || !emptyCart) return;

    container.innerHTML = '';
    emptyCart.style.display = 'block';
    emptyCart.innerHTML = `
        <h3 data-translate="loadError">Ошибка загрузки корзины</h3>
        <p data-translate="loadErrorText">Попробуйте перезагрузить страницу</p>
        <a href="catalog.html" class="back-button" data-translate="goToCatalog">Перейти в каталог</a>
    `;

    if (typeof applyTranslation === 'function') {
        applyTranslation(currentLanguage);
    }
}

function updateSummary(cart) {
    const totalPriceElement = getElement('totalPrice');
    if (!totalPriceElement) return;

    const subtotal = cart.reduce((sum, item) => {
        const price = Number(item.product?.price) || 0;
        const quantity = Number(item.quantity) || 0;
        return sum + price * quantity;
    }, 0);

    totalPriceElement.textContent = subtotal + ' ' + getTranslation('price');
}

async function changeQuantity(productId, newQuantity) {
    if (newQuantity < 1) newQuantity = 1;
    const userId = getCurrentUserId();
    if (!userId) return;

    try {
        const user = await fetch(`${API_URL}/users/${userId}`).then(r => r.json());
        const cart = user.cart || [];
        const item = cart.find(i => i.productId === productId);
        if (item) item.quantity = newQuantity;

        await fetch(`${API_URL}/users/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cart })
        });

        loadCart();
    } catch (error) {
        console.error('Ошибка изменения количества:', error);
        alert(getTranslation('cartError'));
    }
}

async function removeFromCart(productId) {
    if (!confirm(getTranslation('removeFromCartConfirm'))) return;
    const userId = getCurrentUserId();
    if (!userId) return;

    try {
        const user = await fetch(`${API_URL}/users/${userId}`).then(r => r.json());
        const cart = (user.cart || []).filter(i => i.productId !== productId);

        await fetch(`${API_URL}/users/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cart })
        });

        loadCart();
    } catch (error) {
        console.error('Ошибка удаления из корзины:', error);
        alert(getTranslation('removeError'));
    }
}

async function checkout() {
    const userId = getCurrentUserId();
    if (!userId) return alert(getTranslation('loginRequired'));

    try {
        const user = await fetch(`${API_URL}/users/${userId}`).then(r => r.json());
        const cart = user.cart || [];
        if (cart.length === 0) return alert(getTranslation('emptyCartAlert'));

        const cartWithProducts = await Promise.all(cart.map(async item => {
            try {
                const product = await fetch(`${API_URL}/products/${item.productId}`).then(r => r.json());
                return { ...item, product };
            } catch (e) { return null; }
        }));

        const validCart = cartWithProducts.filter(i => i && i.product);
        if (validCart.length === 0) return alert(getTranslation('invalidCartAlert'));

        const order = {
            orderDate: new Date().toISOString(),
            items: validCart,
            total: validCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
            status: 'completed',
            userId
        };

        await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
        });

        await fetch(`${API_URL}/users/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cart: [] })
        });

        const modal = getElement('successModal');
        if (modal) modal.style.display = 'flex';
        loadCart();
    } catch (error) {
        console.error('Ошибка оформления заказа:', error);
        alert(getTranslation('checkoutError'));
    }
}

function loadCart() {
    const userId = getCurrentUserId();
    if (!userId) {
        showLoginPrompt();
        return;
    }

    fetch(`${API_URL}/users/${userId}`)
        .then(response => response.json())
        .then(user => {
            const cart = user.cart || [];  
            if (cart.length === 0) {
                displayCart([]);
                updateSummary([]);
                return;
            }

            const productPromises = cart.map(cartItem =>
                fetch(`${API_URL}/products/${cartItem.productId}`)
                    .then(res => res.json())
                    .then(product => ({
                        ...cartItem,
                        product
                    }))
                    .catch(err => {
                        console.warn('Товар не найден:', cartItem.productId);
                        return null;
                    })
            );

            return Promise.all(productPromises);
        })
        .then(cartWithProducts => {
            if (!cartWithProducts) return;
            const validCart = cartWithProducts.filter(item => item !== null);
            displayCart(validCart);
            updateSummary(validCart);
        })
        .catch(error => {
            console.error('Ошибка загрузки корзины:', error);
            displayError();
        });
}

function updateCartTranslation(lang) {
    loadCart();

    const cartSummary = getElement('cartSummary');
    if (cartSummary && cartSummary.style.display !== 'none') {
        const cart = JSON.parse(localStorage.getItem('userCart') || '[]');
        updateSummary(cart);
    }
}

if (typeof updateCartOnLanguageChange === 'undefined') {
    window.updateCartOnLanguageChange = function(lang) {
        if (typeof updateCartTranslation === 'function') {
            updateCartTranslation(lang);
        }
    };
}