const API_URL = 'http://localhost:3000';
let currentPage = 1;
const itemsPerPage = 9;
let currentFilters = {
    category: [],
    complexity: [],
    price: 20000,
    rating: 5,
    sort: 'name_asc',
    search: ''
};

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
    const searchInput = getElement('searchInput');
    const priceRange = getElement('priceRange');
    const ratingRange = getElement('ratingRange');
    const sortSelect = getElement('sortSelect');
    
    if (searchInput && priceRange && ratingRange && sortSelect) {
        searchInput.addEventListener('input', function(e) {
            currentFilters.search = e.target.value;
            currentPage = 1;
            loadProducts();
        });
        
        priceRange.addEventListener('input', function(e) {
            currentFilters.price = parseInt(e.target.value);
            const priceValue = getElement('priceValue');
            if (priceValue) {
                priceValue.textContent = currentFilters.price + ' руб.';
            }
            currentPage = 1;
            loadProducts();
        });
        
        ratingRange.addEventListener('input', function(e) {
            currentFilters.rating = parseFloat(e.target.value);
            const ratingValue = getElement('ratingValue');
            if (ratingValue) {
                ratingValue.textContent = currentFilters.rating.toFixed(1);
            }
            currentPage = 1;
            loadProducts();
        });
        
        sortSelect.addEventListener('change', function(e) {
            currentFilters.sort = e.target.value;
            currentPage = 1;
            loadProducts();
        });

        loadCategories();
        loadComplexityOptions();
        loadProducts();
    } else {
        console.error('Не все необходимые элементы найдены на странице');
    }
});

function loadCategories() {
    fetch(`${API_URL}/products`)
        .then(response => response.json())
        .then(products => {
            const categories = [...new Set(products.map(p => p.category))];
            const container = getElement('categoryFilters');
            
            if (!container) return;
            
            container.innerHTML = '';
            
            categories.forEach(category => {
                const checkbox = document.createElement('div');
                checkbox.className = 'filter-checkbox';
                checkbox.innerHTML = `
                    <input type="checkbox" id="cat-${category}" value="${category}">
                    <label for="cat-${category}">${category}</label>
                `;
                container.appendChild(checkbox);
                
                const input = checkbox.querySelector('input');
                input.addEventListener('change', function() {
                    if (this.checked) {
                        currentFilters.category.push(this.value);
                    } else {
                        currentFilters.category = currentFilters.category.filter(c => c !== this.value);
                    }
                    currentPage = 1;
                    loadProducts();
                });
            });
        })
        .catch(error => {
            console.error('Ошибка загрузки категорий:', error);
        });
}

function loadComplexityOptions() {
    fetch(`${API_URL}/products`)
        .then(response => response.json())
        .then(products => {
            const complexities = [...new Set(products.map(p => p.details?.complexity))].filter(Boolean);
            const container = getElement('complexityFilters');
            
            if (!container) return;
            
            container.innerHTML = '';
            
            complexities.forEach(complexity => {
                const checkbox = document.createElement('div');
                checkbox.className = 'filter-checkbox';
                checkbox.innerHTML = `
                    <input type="checkbox" id="comp-${complexity}" value="${complexity}">
                    <label for="comp-${complexity}">${complexity}</label>
                `;
                container.appendChild(checkbox);
                
                const input = checkbox.querySelector('input');
                input.addEventListener('change', function() {
                    if (this.checked) {
                        currentFilters.complexity.push(this.value);
                    } else {
                        currentFilters.complexity = currentFilters.complexity.filter(c => c !== this.value);
                    }
                    currentPage = 1;
                    loadProducts();
                });
            });
        })
        .catch(error => {
            console.error('Ошибка загрузки сложностей:', error);
        });
}

function loadProducts() {
    fetch(`${API_URL}/products`)
        .then(response => response.json())
        .then(allProducts => {
            let filteredProducts = [...allProducts];

            if (currentFilters.search) {
                const searchTerm = currentFilters.search.toLowerCase();
                filteredProducts = filteredProducts.filter(product => 
                    product.name.toLowerCase().includes(searchTerm) ||
                    product.description.toLowerCase().includes(searchTerm)
                );
            }

            if (currentFilters.category.length > 0) {
                filteredProducts = filteredProducts.filter(product =>
                    currentFilters.category.includes(product.category)
                );
            }

            if (currentFilters.complexity.length > 0) {
                filteredProducts = filteredProducts.filter(product =>
                    product.details?.complexity && 
                    currentFilters.complexity.includes(product.details.complexity)
                );
            }

            filteredProducts = filteredProducts.filter(product =>
                product.price <= currentFilters.price
            );

            filteredProducts = filteredProducts.filter(product =>
                product.rating >= currentFilters.rating
            );

            const [sortField, sortOrder] = currentFilters.sort.split('_');
            filteredProducts.sort((a, b) => {
                let valueA = a[sortField];
                let valueB = b[sortField];

                if (typeof valueA === 'string') {
                    valueA = valueA.toLowerCase();
                    valueB = valueB.toLowerCase();
                }
                
                if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
                if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            });

            const totalCount = filteredProducts.length;
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
            
            displayProducts(paginatedProducts);
            setupPagination(totalCount);
        })
        .catch(error => {
            console.error('Ошибка загрузки продуктов:', error);
            const productsGrid = getElement('productsGrid');
            if (productsGrid) {
                productsGrid.innerHTML = `
                    <div class="no-results">
                        <h3>Произошла ошибка при загрузке данных</h3>
                        <p>Попробуйте перезагрузить страницу</p>
                    </div>
                `;
            }
        });
}

function displayProducts(products) {
    const container = getElement('productsGrid');
    
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <h3>Ничего не найдено</h3>
                <p>Попробуйте изменить параметры фильтрации</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';

        let stars = '';
        const fullStars = Math.floor(product.rating);
        const hasHalfStar = product.rating % 1 !== 0;
        
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
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-meta">
                    <div class="product-price">${product.price} руб.</div>
                    <div class="product-rating">
                        ${stars} <span>${product.rating}</span>
                    </div>
                </div>
                <div class="product-actions">
                    <button class="action-btn favorite-btn" data-id="${product.id}">В избранное</button>
                    <button class="action-btn cart-btn" data-id="${product.id}">В корзину</button>
                </div>
            </div>
        `;

        const favoriteBtn = card.querySelector('.favorite-btn');
        const cartBtn = card.querySelector('.cart-btn');
        
        favoriteBtn.addEventListener('click', () => {
            addToFavorites(product.id);
        });
        
        cartBtn.addEventListener('click', () => {
            addToCart(product.id);
        });
        
        container.appendChild(card);
    });
}

function setupPagination(totalCount) {
    const container = getElement('pagination');
    if (!container) return;
    
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    
    container.innerHTML = '';
    
    if (totalPages <= 1) {
        return;
    }

    if (currentPage > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.className = 'pagination-btn';
        prevBtn.innerHTML = '&laquo;';
        prevBtn.addEventListener('click', () => {
            currentPage--;
            loadProducts();
            window.scrollTo(0, 0);
        });
        container.appendChild(prevBtn);
    }

    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            loadProducts();
            window.scrollTo(0, 0);
        });
        container.appendChild(pageBtn);
    }

    if (currentPage < totalPages) {
        const nextBtn = document.createElement('button');
        nextBtn.className = 'pagination-btn';
        nextBtn.innerHTML = '&raquo;';
        nextBtn.addEventListener('click', () => {
            currentPage++;
            loadProducts();
            window.scrollTo(0, 0);
        });
        container.appendChild(nextBtn);
    }
}

function addToFavorites(productId) {
    const userId = getCurrentUserId();
    if (!userId) {
        alert('Для добавления в избранное необходимо войти в систему');
        return;
    }
    
    fetch(`${API_URL}/favorites?userId=${userId}`)
        .then(response => response.json())
        .then(favorites => {
            if (favorites.some(item => item.productId === productId && item.userId === userId)) {
                alert('Этот товар уже в избранном!');
                return;
            }

            fetch(`${API_URL}/favorites`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userId,
                    productId: productId,
                    addedAt: new Date().toISOString()
                })
            })
            .then(response => response.json())
            .then(() => {
                alert('Товар добавлен в избранное!');
            })
            .catch(error => {
                console.error('Ошибка добавления в избранное:', error);
                alert('Не удалось добавить товар в избранное');
            });
        });
}

function addToCart(productId) {
    const userId = getCurrentUserId();
    if (!userId) {
        alert('Для добавления в корзину необходимо войти в систему');
        return;
    }
    
    fetch(`${API_URL}/cart?userId=${userId}`)
        .then(response => response.json())
        .then(cart => {
            const existingItem = cart.find(item => item.productId === productId && item.userId === userId);
            
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
                        userId: userId,
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
        });
}