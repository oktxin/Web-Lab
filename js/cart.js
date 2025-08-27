const API_URL = 'http://localhost:3000';

function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.error(`Элемент с ID ${id} не найден`);
    }
    return element;
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
    
    loadCart();
});

function loadCart() {
    fetch(`${API_URL}/cart`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка загрузки корзины');
            }
            return response.json();
        })
        .then(cart => {
            const productPromises = cart.map(cartItem => 
                fetch(`${API_URL}/products/${cartItem.productId}`)
                    .then(response => response.json())
                    .then(product => ({
                        ...cartItem,
                        product: product
                    }))
                    .catch(error => {
                        console.error('Ошибка загрузки товара:', error);
                        return {
                            ...cartItem,
                            product: null
                        };
                    })
            );

            return Promise.all(productPromises);
        })
        .then(cartWithProducts => {
            displayCart(cartWithProducts);
            updateSummary(cartWithProducts);
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

    const validCart = cart.filter(item => item.product);
    
    if (validCart.length === 0) {
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
    
    validCart.forEach(item => {
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

    const invalidCount = cart.length - validCart.length;
    if (invalidCount > 0) {
        console.warn(`Найдено ${invalidCount} товаров в корзине с несуществующими продуктами`);
    }
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
        if (item.product) {
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
    fetch(`${API_URL}/cart`)
        .then(response => response.json())
        .then(cart => {
            if (cart.length === 0) {
                alert('Корзина пуста!');
                return;
            }

            const deletePromises = cart.map(item => 
                fetch(`${API_URL}/cart/${item.id}`, {
                    method: 'DELETE'
                })
            );

            Promise.all(deletePromises)
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
        });
}