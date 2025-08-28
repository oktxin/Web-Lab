const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', function() {
    checkAdminAccess();
    initializeAdminPanel();
});

function checkAdminAccess() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.role !== 'admin') {
        window.location.href = 'home.html';
        return;
    }
}

function initializeAdminPanel() {
    const tabButtons = document.querySelectorAll('.admin-tab');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            switchTab(tabName);
        });
    });

    initializeProductForm();
    initializeReviewsManagement();

    loadProductsForAdmin();
    loadReviewsForAdmin();
}

function switchTab(tabName) {
    document.querySelectorAll('.admin-content').forEach(tab => {
        tab.style.display = 'none';
    });

    document.getElementById(`${tabName}Tab`).style.display = 'block';

    document.querySelectorAll('.admin-tab').forEach(button => {
        button.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

function initializeProductForm() {
    const form = document.getElementById('productForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateProductForm()) {
            if (document.getElementById('productId').value) {
                updateProduct();
            } else {
                addProduct();
            }
        }
    });

    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('input', validateProductForm);
    });
}

function validateProductForm() {
    const name = document.getElementById('productName').value;
    const price = document.getElementById('productPrice').value;
    const category = document.getElementById('productCategory').value;
    const image = document.getElementById('productImage').value;
    
    let isValid = true;
    
    if (!name) {
        showError('productNameError', 'Название обязательно');
        isValid = false;
    } else {
        hideError('productNameError');
    }
    
    if (!price || isNaN(price) || parseFloat(price) <= 0) {
        showError('productPriceError', 'Цена должна быть положительным числом');
        isValid = false;
    } else {
        hideError('productPriceError');
    }
    
    if (!category) {
        showError('productCategoryError', 'Категория обязательна');
        isValid = false;
    } else {
        hideError('productCategoryError');
    }
    
    if (!image) {
        showError('productImageError', 'Изображение обязательно');
        isValid = false;
    } else {
        hideError('productImageError');
    }
    
    document.getElementById('submitProduct').disabled = !isValid;
    return isValid;
}

async function addProduct() {
    const productData = {
        name: document.getElementById('productName').value,
        price: parseFloat(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        image: document.getElementById('productImage').value,
        description: document.getElementById('productDescription').value,
        rating: parseFloat(document.getElementById('productRating').value) || 0,
        details: {
            complexity: document.getElementById('productComplexity').value
        }
    };
    
    try {
        const response = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });
        
        if (response.ok) {
            alert('Товар успешно добавлен!');
            form.reset();
            loadProductsForAdmin();
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось добавить товар');
    }
}

async function updateProduct() {
    const productId = document.getElementById('productId').value;
    const productData = {
        name: document.getElementById('productName').value,
        price: parseFloat(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        image: document.getElementById('productImage').value,
        description: document.getElementById('productDescription').value,
        rating: parseFloat(document.getElementById('productRating').value) || 0,
        details: {
            complexity: document.getElementById('productComplexity').value
        }
    };
    
    try {
        const response = await fetch(`${API_URL}/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });
        
        if (response.ok) {
            alert('Товар успешно обновлен!');
            resetProductForm();
            loadProductsForAdmin();
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось обновить товар');
    }
}

async function deleteProduct(productId) {
    if (!confirm('Удалить товар?')) return;
    
    try {
        const response = await fetch(`${API_URL}/products/${productId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Товар удален!');
            loadProductsForAdmin();
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось удалить товар');
    }
}

function editProduct(product) {
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productImage').value = product.image;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productRating').value = product.rating;
    document.getElementById('productComplexity').value = product.details?.complexity || '';
    
    document.getElementById('submitProduct').textContent = 'Обновить товар';
}

function resetProductForm() {
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('submitProduct').textContent = 'Добавить товар';
}

async function loadProductsForAdmin() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();
        
        const container = document.getElementById('productsList');
        if (!container) return;
        
        container.innerHTML = '';
        
        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${product.image}" alt="${product.name}" class="admin-product-image"></td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${product.price} руб.</td>
                <td>${product.rating}</td>
                <td>
                    <button onclick="editProduct(${JSON.stringify(product).replace(/"/g, '&quot;')})">Редактировать</button>
                    <button onclick="deleteProduct('${product.id}')">Удалить</button>
                </td>
            `;
            container.appendChild(row);
        });
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
    }
}

function initializeReviewsManagement() {
    const productFilter = document.getElementById('reviewFilterProduct');
    const userFilter = document.getElementById('reviewFilterUser');
    
    if (productFilter) {
        productFilter.addEventListener('change', function() {
            const selectedProductId = this.value;
            const selectedUserId = document.getElementById('reviewFilterUser').value;
            updateFilterSelects(selectedProductId, selectedUserId);
            loadReviewsForAdmin();
        });
    }
    
    if (userFilter) {
        userFilter.addEventListener('change', function() {
            const selectedProductId = document.getElementById('reviewFilterProduct').value;
            const selectedUserId = this.value;
            updateFilterSelects(selectedProductId, selectedUserId);
            loadReviewsForAdmin();
        });
    }

    addResetFilterButton();
}

function addResetFilterButton() {
    const filtersContainer = document.querySelector('.admin-filters');
    if (!filtersContainer) return;

    if (!document.getElementById('resetFiltersBtn')) {
        const resetButton = document.createElement('button');
        resetButton.id = 'resetFiltersBtn';
        resetButton.className = 'admin-button';
        resetButton.textContent = 'Сбросить фильтры';
        resetButton.style.marginTop = '20px';
        
        resetButton.addEventListener('click', function() {
            document.getElementById('reviewFilterProduct').value = '';
            document.getElementById('reviewFilterUser').value = '';
            loadReviewsForAdmin();
        });
        
        filtersContainer.appendChild(resetButton);
    }
}

async function loadReviewsForAdmin() {
    try {
        await loadReviewFilters();
        
        let url = `${API_URL}/reviews`;
        
        const productFilter = document.getElementById('reviewFilterProduct').value;
        const userFilter = document.getElementById('reviewFilterUser').value;

        const response = await fetch(url);
        let reviews = await response.json();

        if (productFilter) {
            reviews = reviews.filter(review => review.productId == productFilter);
        }
        if (userFilter) {
            reviews = reviews.filter(review => review.userId == userFilter);
        }

        const reviewsWithDetails = await Promise.all(
            reviews.map(async (review) => {
                try {
                    const [productResponse, userResponse] = await Promise.all([
                        fetch(`${API_URL}/products/${review.productId}`),
                        fetch(`${API_URL}/users/${review.userId}`)
                    ]);
                    
                    const product = productResponse.ok ? await productResponse.json() : null;
                    const user = userResponse.ok ? await userResponse.json() : null;
                    
                    return {
                        ...review,
                        product: product,
                        user: user
                    };
                } catch (error) {
                    console.error('Ошибка загрузки деталей отзыва:', error);
                    return {
                        ...review,
                        product: null,
                        user: null
                    };
                }
            })
        );
        
        displayAdminReviews(reviewsWithDetails);
        
    } catch (error) {
        console.error('Ошибка загрузки отзывов:', error);
    }
}

function updateFilterSelects(selectedProductId, selectedUserId) {
    const productSelect = document.getElementById('reviewFilterProduct');
    const userSelect = document.getElementById('reviewFilterUser');
    
    if (productSelect && selectedProductId !== undefined) {
        productSelect.value = selectedProductId;
    }
    
    if (userSelect && selectedUserId !== undefined) {
        userSelect.value = selectedUserId;
    }
}

async function loadReviewFilters() {
    try {
        const currentProduct = document.getElementById('reviewFilterProduct').value;
        const currentUser = document.getElementById('reviewFilterUser').value;
        
        const [productsResponse, usersResponse] = await Promise.all([
            fetch(`${API_URL}/products`),
            fetch(`${API_URL}/users`)
        ]);
        
        const products = await productsResponse.json();
        const users = await usersResponse.json();
        
        const productSelect = document.getElementById('reviewFilterProduct');
        const userSelect = document.getElementById('reviewFilterUser');
        
        if (!productSelect || !userSelect) return;

        const productOptions = productSelect.innerHTML;
        const userOptions = userSelect.innerHTML;
        
        productSelect.innerHTML = '<option value="">Все товары</option>';
        userSelect.innerHTML = '<option value="">Все пользователи</option>';
        
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = product.name;
            productSelect.appendChild(option);
        });
        
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = `${user.firstName} ${user.lastName}`;
            userSelect.appendChild(option);
        });

        if (currentProduct) {
            productSelect.value = currentProduct;
        }
        if (currentUser) {
            userSelect.value = currentUser;
        }
        
    } catch (error) {
        console.error('Ошибка загрузки фильтров:', error);
    }
}

function displayAdminReviews(reviews) {
    const container = document.getElementById('reviewsAdminList');
    if (!container) return;
    
    container.innerHTML = '';
    
    reviews.forEach(review => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${review.product?.name || 'Неизвестно'}</td>
            <td>${review.user?.firstName || 'Пользователь'} ${review.user?.lastName || ''}</td>
            <td>${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</td>
            <td>${review.text}</td>
            <td>${new Date(review.date).toLocaleDateString()}</td>
            <td>${review.status}</td>
            <td>
                <button onclick="deleteReview('${review.id}')">Удалить</button>
            </td>
        `;
        container.appendChild(row);
    });
}

async function deleteReview(reviewId) {
    if (!confirm('Удалить отзыв?')) return;
    
    try {
        const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Отзыв удален!');
            loadReviewsForAdmin();
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось удалить отзыв');
    }
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

function hideError(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = '';
        element.style.display = 'none';
    }
}