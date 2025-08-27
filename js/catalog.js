const products = [
    {
        id: 1,
        name: "Виджет Instagram Stories",
        description: "Отображайте истории из Instagram на вашем сайте с автоматическим обновлением",
        price: 299,
        category: "widgets",
        rating: 4.8,
        reviews: 142,
        image: "https://placehold.co/400x300/0066FF/white?text=Instagram+Widget",
        featured: true
    },
    {
        id: 2,
        name: "Виджет Facebook Feed",
        description: "Вставьте ленту Facebook на ваш сайт для увеличения вовлеченности",
        price: 249,
        category: "widgets",
        rating: 4.6,
        reviews: 87,
        image: "https://placehold.co/400x300/1877F2/white?text=Facebook+Widget",
        featured: false
    },
    {
        id: 3,
        name: "Виджет TikTok Gallery",
        description: "Показывайте ваши видео из TikTok в виде красивейшей галереи",
        price: 279,
        category: "widgets",
        rating: 4.7,
        reviews: 63,
        image: "https://placehold.co/400x300/000000/white?text=TikTok+Widget",
        featured: true
    },
    {
        id: 4,
        name: "Шаблон Popover",
        description: "Готовый шаблон всплывающего окна для отображения социального контента",
        price: 99,
        category: "templates",
        rating: 4.5,
        reviews: 204,
        image: "https://placehold.co/400x300/7844E9/white?text=Popover+Template",
        featured: false
    },
    {
        id: 5,
        name: "Шаблон Carousel",
        description: "Шаблон карусели для красивого отображения социального контента",
        price: 129,
        category: "templates",
        rating: 4.9,
        reviews: 176,
        image: "https://placehold.co/400x300/24B47E/white?text=Carousel+Template",
        featured: true
    },
    {
        id: 6,
        name: "Шаблон Grid Layout",
        description: "Сеточный шаблон для равномерного отображения медиа-контента",
        price: 89,
        category: "templates",
        rating: 4.4,
        reviews: 98,
        image: "https://placehold.co/400x300/FF6928/white?text=Grid+Template",
        featured: false
    },
    {
        id: 7,
        name: "Интеграция с WordPress",
        description: "Легкая интеграция виджетов с самой популярной CMS в мире",
        price: 199,
        category: "integration",
        rating: 4.8,
        reviews: 321,
        image: "https://placehold.co/400x300/21759B/white?text=WordPress+Integration",
        featured: true
    },
    {
        id: 8,
        name: "Интеграция с Shopify",
        description: "Специальное решение для интернет-магазинов на платформе Shopify",
        price: 229,
        category: "integration",
        rating: 4.7,
        reviews: 154,
        image: "https://placehold.co/400x300/7AB55C/white?text=Shopify+Integration",
        featured: false
    },
    {
        id: 9,
        name: "Интеграция с Wix",
        description: "Простое подключение виджетов к сайтам на конструкторе Wix",
        price: 179,
        category: "integration",
        rating: 4.3,
        reviews: 87,
        image: "https://placehold.co/400x300/0C6EF2/white?text=Wix+Integration",
        featured: false
    },
    {
        id: 10,
        name: "Расширенная аналитика",
        description: "Подробные метрики и аналитика эффективности ваших виджетов",
        price: 149,
        category: "analytics",
        rating: 4.6,
        reviews: 112,
        image: "https://placehold.co/400x300/8E44AD/white?text=Advanced+Analytics",
        featured: false
    },
    {
        id: 11,
        name: "A/B тестирование",
        description: "Тестируйте различные варианты виджетов для максимальной конверсии",
        price: 349,
        category: "analytics",
        rating: 4.9,
        reviews: 76,
        image: "https://placehold.co/400x300/E67E22/white?text=A+B+Testing",
        featured: true
    },
    {
        id: 12,
        name: "Heatmap отслеживание",
        description: "Отслеживайте клики и взаимодействия пользователей с вашими виджетами",
        price: 299,
        category: "analytics",
        rating: 4.7,
        reviews: 64,
        image: "https://placehold.co/400x300/E74C3C/white?text=Heatmap+Tracking",
        featured: false
    },
    {
        id: 13,
        name: "Бесплатный виджет",
        description: "Базовый виджет с основными функции для начинающих",
        price: 0,
        category: "widgets",
        rating: 4.2,
        reviews: 289,
        image: "https://placehold.co/400x300/2ECC71/white?text=Free+Widget",
        featured: false
    },
    {
        id: 14,
        name: "Кастомизация дизайна",
        description: "Индивидуальная настройка внешнего вида под ваш бренд",
        price: 399,
        category: "widgets",
        rating: 4.8,
        reviews: 132,
        image: "https://placehold.co/400x300/9B59B6/white?text=Custom+Design",
        featured: true
    },
    {
        id: 15,
        name: "Приоритетная поддержка",
        description: "Круглосуточная поддержка с приоритетом в очереди",
        price: 199,
        category: "integration",
        rating: 4.9,
        reviews: 95,
        image: "https://placehold.co/400x300/34495E/white?text=Priority+Support",
        featured: false
    }
];

let filteredProducts = [...products];
let currentCategory = 'all';
let currentSort = 'default';
let currentSearch = '';

function renderProducts(productsToRender) {
    const productsContainer = document.getElementById('productsContainer');
    
    if (productsToRender.length === 0) {
        productsContainer.innerHTML = `
            <div class="no-products">
                <h2>Товары не найдены</h2>
                <p>Попробуйте изменить параметры поиска или фильтрации</p>
            </div>
        `;
        return;
    }
    
    productsContainer.innerHTML = productsToRender.map(product => `
        <div class="product-card">
            ${product.featured ? '<span class="product-featured">Рекомендуем</span>' : ''}
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">${product.price === 0 ? 'Бесплатно' : `$${product.price}`}</div>
                <div class="product-meta">
                    <span class="product-rating">${product.rating}</span>
                    <span class="product-reviews">${product.reviews} отзывов</span>
                </div>
            </div>
        </div>
    `).join('');
}

function filterProducts() {
    let result = [...products];

    if (currentSearch) {
        const searchLower = currentSearch.toLowerCase();
        result = result.filter(product => 
            product.name.toLowerCase().includes(searchLower) || 
            product.description.toLowerCase().includes(searchLower)
        );
    }

    if (currentCategory !== 'all') {
        result = result.filter(product => product.category === currentCategory);
    }

    switch(currentSort) {
        case 'price-asc':
            result.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            result.sort((a, b) => b.price - a.price);
            break;
        case 'name-asc':
            result.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            result.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'rating-desc':
            result.sort((a, b) => b.rating - a.rating);
            break;
    }
    
    filteredProducts = result;
    renderProducts(filteredProducts);
}

function applyArrayMethod(method) {
    let result = [...products];
    
    switch(method) {
        case 'all':
            result = products;
            break;
        case 'filter-popular':
            result = products.filter(product => product.rating >= 4.5);
            break;
        case 'filter-price':
            result = products.filter(product => product.price <= 499);
            break;
        case 'sort-price':
            result = [...products].sort((a, b) => a.price - b.price);
            break;
        case 'sort-name':
            result = [...products].sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'map-sale':
            result = products.map(product => ({
                ...product,
                name: product.name + " (скидка 10%)",
                price: Math.round(product.price * 0.9)
            }));
            break;
        case 'reduce-total':
            const total = products.reduce((sum, product) => sum + product.price, 0);
            alert(`Общая стоимость всех услуг: $${total}`);
            return;
        case 'find-integration':
            const integration = products.find(product => product.name.toLowerCase().includes('интеграция'));
            result = integration ? [integration] : [];
            break;
        case 'some-free':
            const hasFree = products.some(product => product.price === 0);
            alert(hasFree ? 'Есть бесплатные услуги!' : 'Бесплатных услуг нет');
            return;
        case 'every-premium':
            const allPremium = products.every(product => product.rating >= 4.0);
            alert(allPremium ? 'Все услуги премиум-класса!' : 'Не все услуги премиум-класса');
            return;
    }
    
    filteredProducts = result;
    renderProducts(filteredProducts);
}

document.addEventListener('DOMContentLoaded', function() {
    renderProducts(products);

    document.getElementById('searchInput').addEventListener('input', function(e) {
        currentSearch = e.target.value;
        filterProducts();
    });

    document.getElementById('sortSelect').addEventListener('change', function(e) {
        currentSort = e.target.value;
        filterProducts();
    });

    document.getElementById('categorySelect').addEventListener('change', function(e) {
        currentCategory = e.target.value;
        filterProducts();

        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === currentCategory);
        });
    });

    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            currentCategory = this.dataset.category;
            filterProducts();

            document.getElementById('categorySelect').value = currentCategory;

            document.querySelectorAll('.category-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.category === currentCategory);
            });
        });
    });

    document.querySelectorAll('.method-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            applyArrayMethod(this.dataset.method);
        });
    });
});