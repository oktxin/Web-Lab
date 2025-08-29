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
        showError('productNameError', 'nameRequired');
        isValid = false;
    } else {
        hideError('productNameError');
    }
    
    if (!price || isNaN(price) || parseFloat(price) <= 0) {
        showError('productPriceError', 'priceRequired');
        isValid = false;
    } else {
        hideError('productPriceError');
    }
    
    if (!category) {
        showError('productCategoryError', 'categoryRequired');
        isValid = false;
    } else {
        hideError('productCategoryError');
    }
    
    if (!image) {
        showError('productImageError', 'imageRequired');
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
            alert(getTranslation('productAdded'));
            document.getElementById('productForm').reset();
            loadProductsForAdmin();
        } else {
            alert(getTranslation('errorAddingProduct'));
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert(getTranslation('errorAddingProduct'));
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
            alert(getTranslation('productUpdated'));
            resetProductForm();
            loadProductsForAdmin();
        } else {
            alert(getTranslation('errorUpdatingProduct'));
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert(getTranslation('errorUpdatingProduct'));
    }
}

async function deleteProduct(productId) {
    if (!confirm(getTranslation('confirmDeleteProduct'))) return;
    
    try {
        const response = await fetch(`${API_URL}/products/${productId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert(getTranslation('productDeleted'));
            loadProductsForAdmin();
        } else {
            alert(getTranslation('errorDeletingProduct'));
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert(getTranslation('errorDeletingProduct'));
    }
}

function editProduct(product) {
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productImage').value = product.image;
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productRating').value = product.rating || '';
    document.getElementById('productComplexity').value = product.details?.complexity || '';
    
    document.getElementById('submitProduct').textContent = getTranslation('updateProduct');
}

function resetProductForm() {
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('submitProduct').textContent = getTranslation('addProduct');
}

async function loadProductsForAdmin() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();
        
        displayAdminProducts(products);
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
    }
}

function displayAdminProducts(products) {
    const container = document.getElementById('productsList');
    if (!container) return;
    
    container.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${product.image}" alt="${product.name}" class="admin-product-image"></td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.price} ${getTranslation('price')}</td>
            <td>${product.rating || 0}</td>
            <td>
                <button onclick="editProduct(${JSON.stringify(product).replace(/"/g, '&quot;')})">${getTranslation('edit')}</button>
                <button onclick="deleteProduct('${product.id}')">${getTranslation('delete')}</button>
            </td>
        `;
        container.appendChild(row);
    });
}

function initializeReviewsManagement() {
    const productFilter = document.getElementById('reviewFilterProduct');
    const userFilter = document.getElementById('reviewFilterUser');
    
    if (productFilter) {
        productFilter.addEventListener('change', function() {
            loadReviewsForAdmin();
        });
    }
    
    if (userFilter) {
        userFilter.addEventListener('change', function() {
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
        resetButton.textContent = getTranslation('resetFilters');
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
        
        const productFilter = document.getElementById('reviewFilterProduct').value;
        const userFilter = document.getElementById('reviewFilterUser').value;

        const response = await fetch(`${API_URL}/reviews`);
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

        productSelect.innerHTML = '<option value="">' + getTranslation('allProducts') + '</option>';
        userSelect.innerHTML = '<option value="">' + getTranslation('allUsers') + '</option>';
        
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
            <td>${review.product?.name || getTranslation('unknownProduct')}</td>
            <td>${review.user?.firstName || getTranslation('user')} ${review.user?.lastName || ''}</td>
            <td>${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</td>
            <td>${review.text}</td>
            <td>${new Date(review.date).toLocaleDateString()}</td>
            <td>${review.status}</td>
            <td>
                <button onclick="deleteReview('${review.id}')">${getTranslation('delete')}</button>
            </td>
        `;
        container.appendChild(row);
    });
}

async function deleteReview(reviewId) {
    if (!confirm(getTranslation('confirmDeleteReview'))) return;
    
    try {
        const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert(getTranslation('reviewDeleted'));
            loadReviewsForAdmin();
        } else {
            alert(getTranslation('errorDeletingReview'));
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert(getTranslation('errorDeletingReview'));
    }
}

function showError(elementId, messageKey) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = getTranslation(messageKey);
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

function updateAdminTranslation(lang) {
    const submitButton = document.getElementById('submitProduct');
    if (submitButton) {
        submitButton.textContent = document.getElementById('productId').value 
            ? getTranslation('updateProduct') 
            : getTranslation('addProduct');
    }

    const resetButton = document.getElementById('resetFiltersBtn');
    if (resetButton) {
        resetButton.textContent = getTranslation('resetFilters');
    }

    const productSelect = document.getElementById('reviewFilterProduct');
    const userSelect = document.getElementById('reviewFilterUser');
    
    if (productSelect && productSelect.options.length > 0) {
        productSelect.options[0].text = getTranslation('allProducts');
    }
    
    if (userSelect && userSelect.options.length > 0) {
        userSelect.options[0].text = getTranslation('allUsers');
    }

    loadProductsForAdmin();
    loadReviewsForAdmin();
}

function updateAdminOnLanguageChange(lang) {
    if (typeof updateAdminTranslation === 'function') {
        updateAdminTranslation(lang);
    }
}