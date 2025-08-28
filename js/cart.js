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

document.addEventListener('DOMContentLoaded', function() {
    const checkoutBtn = getElement('checkoutBtn');
    const closeModal = getElement('closeModal');
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', checkout);
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            const modal = getElement('successModal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    }
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
    
    if (container && emptyCart && cartSummary && checkoutBtn) {
        container.innerHTML = '';
        emptyCart.style.display = 'block';
        emptyCart.innerHTML = `
            <h3>Необходима авторизация</h3>
            <p>Для просмотра корзины необходимо войти в систему</p>
            <div style="margin-top: 20px;">
                <a href="login.html" class="auth-button" style="margin-right: 10px;">Войти</a>
                <a href="register.html" class="auth-button">Зарегистрироваться</a>
            </div>
        `;
        cartSummary.style.display = 'none';
        checkoutBtn.style.display = 'none';
    }
}

function loadCart() {
    const userId = getCurrentUserId();
    if (!userId) {
        showLoginPrompt();
        return;
    }
    
    fetch(`${API_URL}/cart?userId=${userId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка загрузки корзины');
            }
            return response.json();
        })
        .then(cart => {
            const productPromises = cart.map(cartItem => 
                fetch(`${API_URL}/products/${cartItem.productId}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Товар не найден');
                        }
                        return response.json();
                    })
                    .then(product => ({
                        ...cartItem,
                        product: product
                    }))
                    .catch(error => {
                        console.warn('Товар не найден, удаляем из корзины:', cartItem.productId);
                        return fetch(`${API_URL}/cart/${cartItem.id}`, {
                            method: 'DELETE'
                        }).then(() => null);
                    })
            );

            return Promise.all(productPromises);
        })
        .then(cartWithProducts => {
            const validCart = cartWithProducts.filter(item => item !== null);
            displayCart(validCart);
            updateSummary(validCart);
        })
        .catch(error => {
            console.error('Ошибка загрузки корзины:', error);
            displayError();
        });
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
        if (!item.product) {
            console.warn('Пропускаем товар без продукта:', item.id);
            return;
        }
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.dataset.id = item.id;

        cartItem.innerHTML = `
            <img src="${item.product.image}" alt="${item.product.name}" class="cart-item-image">
            <div class="cart-item-info">
                <h3 class="cart-item-title">${item.product.name}</h3>
                <div class="cart-item-category">${item.product.category}</div>
                <div class="cart-item-price">${item.product.price} руб. × ${item.quantity} = ${item.product.price * item.quantity} руб.</div>
                <div class="cart-item-controls">
                    <div class="quantity-control">
                        <button class="quantity-btn" onclick="changeQuantity('${item.id}', ${item.quantity - 1})">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" onchange="changeQuantity(${item.id}, parseInt(this.value))">
                        <button class="quantity-btn" onclick="changeQuantity('${item.id}', ${item.quantity + 1})">+</button>
                    </div>
                    <button class="remove-btn" onclick="removeFromCart('${item.id}')">Удалить</button>
                </div>
            </div>
        `;
        
        container.appendChild(cartItem);
    });
}

function displayError() {
    const container = getElement('cartItems');
    const emptyCart = getElement('emptyCart');
    
    if (container && emptyCart) {
        container.innerHTML = '';
        emptyCart.style.display = 'block';
        emptyCart.innerHTML = `
            <h3>Ошибка загрузки корзины</h3>
            <p>Попробуйте перезагрузить страницу</p>
            <a href="catalog.html" class="back-button">Перейти в каталог</a>
        `;
    }
}

function updateSummary(cart) {
    const totalPriceElement = getElement('totalPrice');
    if (!totalPriceElement) return;
    
    const subtotal = cart.reduce((sum, item) => {
        if (item.product && item.product.price) {
            return sum + (item.product.price * item.quantity);
        }
        return sum;
    }, 0);
    
    totalPriceElement.textContent = subtotal + ' руб.';
}

function changeQuantity(cartItemId, newQuantity) {
    if (newQuantity < 1) newQuantity = 1;
    
    fetch(`${API_URL}/cart/${cartItemId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            quantity: newQuantity
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Ошибка изменения количества');
        }
        loadCart();
    })
    .catch(error => {
        console.error('Ошибка изменения количества:', error);
        alert('Не удалось изменить количество товара');
    });
}

function removeFromCart(cartItemId) {
    if (!confirm('Удалить товар из корзины?')) return;
    
    fetch(`${API_URL}/cart/${cartItemId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Ошибка удаления из корзины');
        }
        loadCart();
    })
    .catch(error => {
        console.error('Ошибка удаления из корзины:', error);
        alert('Не удалось удалить товар из корзины');
    });
}

function checkout() {
    const userId = getCurrentUserId();
    if (!userId) {
        alert('Для оформления заказа необходимо войти в систему');
        return;
    }

    fetch(`${API_URL}/cart?userId=${userId}`)
        .then(response => response.json())
        .then(cart => {
            if (cart.length === 0) {
                alert('Корзина пуста!');
                return;
            }

            const productPromises = cart.map(cartItem => 
                fetch(`${API_URL}/products/${cartItem.productId}`)
                    .then(response => response.json())
                    .then(product => ({
                        ...cartItem,
                        product: product
                    }))
                    .catch(error => {
                        console.warn('Товар не найден:', cartItem.productId);
                        return {
                            ...cartItem,
                            product: null
                        };
                    })
            );

            return Promise.all(productPromises);
        })
        .then(cartWithProducts => {
            const validCartItems = cartWithProducts.filter(item => item.product);

            if (validCartItems.length === 0) {
                alert('В корзине нет действительных товаров!');
                return;
            }

            const order = {
                orderDate: new Date().toISOString(),
                items: validCartItems,
                total: validCartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
                status: 'completed',
                userId: userId
            };

            fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(order)
            })
            .then(response => response.json())
            .then(() => {
                const deletePromises = validCartItems.map(item => 
                    fetch(`${API_URL}/cart/${item.id}`, {
                        method: 'DELETE'
                    })
                );

                return Promise.all(deletePromises);
            })
            .then(() => {
                const modal = getElement('successModal');
                if (modal) {
                    modal.style.display = 'flex';
                }
                loadCart();
            })
            .catch(error => {
                console.error('Ошибка оформления заказа:', error);
                alert('Произошла ошибка при оформлении заказа');
            });
        })
        .catch(error => {
            console.error('Ошибка загрузки корзины:', error);
            alert('Не удалось загрузить корзину');
        });
}

function getCurrentUserId() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    return user ? user.id : null;
}