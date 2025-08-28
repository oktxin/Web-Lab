const API_URL = 'http://localhost:3000';
const MIN_REVIEW_LENGTH = 20;

document.addEventListener('DOMContentLoaded', function() {
    initializeReviewPage();
});

function initializeReviewPage() {
    loadReviews();

    initializeReviewForm();
}

function initializeReviewForm() {
    const reviewFormContainer = document.getElementById('reviewFormContainer');
    if (!reviewFormContainer) return;
    
    const user = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!user) {
        showLoginPrompt();
        return;
    }
    
    if (user.role === 'admin') {
        showAdminNotice();
        return;
    }
    
    showReviewForm();
    setupReviewForm();
}

function showLoginPrompt() {
    const reviewFormContainer = document.getElementById('reviewFormContainer');
    reviewFormContainer.innerHTML = `
        <div class="login-prompt">
            <h3>Для оставления отзыва необходимо войти в систему</h3>
            <p>Пожалуйста, войдите или зарегистрируйтесь</p>
            <div class="auth-buttons">
                <a href="login.html" class="auth-button" style="margin-right: 10px;">Войти</a>
                <a href="register.html" class="auth-button">Зарегистрироваться</a>
            </div>
        </div>
    `;
}

function showAdminNotice() {
    const reviewFormContainer = document.getElementById('reviewFormContainer');
    reviewFormContainer.innerHTML = `
        <div class="admin-notice">
            <h3>Администраторы не могут оставлять отзывы</h3>
            <p>Вы можете управлять отзывами через админ-панель</p>
        </div>
    `;
}

function showReviewForm() {
    const reviewFormContainer = document.getElementById('reviewFormContainer');
    reviewFormContainer.innerHTML = `
        <form id="reviewForm" class="review-form">
            <div class="form-section">
                <h3>Оставить отзыв</h3>
                
                <div class="form-group">
                    <label for="reviewProduct">Товар*</label>
                    <select id="reviewProduct" required>
                        <option value="">Выберите товар</option>
                    </select>
                    <div class="error-message" id="reviewProductError"></div>
                </div>
                
                <div class="form-group">
                    <label>Оценка*</label>
                    <div class="stars-input">
                        <button type="button" class="star-btn" data-rating="1">☆</button>
                        <button type="button" class="star-btn" data-rating="2">☆</button>
                        <button type="button" class="star-btn" data-rating="3">☆</button>
                        <button type="button" class="star-btn" data-rating="4">☆</button>
                        <button type="button" class="star-btn" data-rating="5">☆</button>
                    </div>
                    <input type="hidden" id="reviewRating" required>
                    <div class="error-message" id="reviewRatingError"></div>
                </div>
                
                <div class="form-group">
                    <label for="reviewText">Текст отзыва*</label>
                    <textarea id="reviewText" rows="4" placeholder="Расскажите о вашем опыте использования товара..." required></textarea>
                    <div class="error-message" id="reviewTextError"></div>
                    <div class="attempts-counter">Минимальная длина: ${MIN_REVIEW_LENGTH} символов</div>
                </div>
            </div>
            
            <button type="submit" id="submitReview" class="auth-button">Отправить отзыв</button>
        </form>
    `;
}

function setupReviewForm() {
    const form = document.getElementById('reviewForm');
    if (!form) return;

    loadUserPurchasedProducts();

    setupStarRating();

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (await validateReviewForm()) {
            submitReview();
        }
    });

    document.getElementById('reviewText').addEventListener('input', validateReviewText);
}

function setupStarRating() {
    const starButtons = document.querySelectorAll('.star-btn');
    const ratingInput = document.getElementById('reviewRating');
    
    starButtons.forEach(button => {
        button.addEventListener('click', function() {
            const rating = parseInt(this.dataset.rating);
            ratingInput.value = rating;

            starButtons.forEach((btn, index) => {
                if (index < rating) {
                    btn.textContent = '★';
                    btn.classList.add('active');
                } else {
                    btn.textContent = '☆';
                    btn.classList.remove('active');
                }
            });
            
            validateReviewRating();
        });
    });
}

async function loadUserPurchasedProducts() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return;
    
    try {
        const response = await fetch(`${API_URL}/orders?userId=${user.id}`);
        const orders = await response.json();
        
        const purchasedProducts = new Set();
        orders.forEach(order => {
            order.items.forEach(item => {
                purchasedProducts.add(item.productId);
            });
        });
        
        const productsResponse = await fetch(`${API_URL}/products`);
        const products = await productsResponse.json();
        
        const productSelect = document.getElementById('reviewProduct');
        if (!productSelect) return;
        
        productSelect.innerHTML = '<option value="">Выберите товар</option>';
        
        products.forEach(product => {
            if (purchasedProducts.has(product.id.toString())) {
                const option = document.createElement('option');
                option.value = product.id;
                option.textContent = product.name;
                productSelect.appendChild(option);
            }
        });
        
    } catch (error) {
        console.error('Ошибка загрузки покупок:', error);
    }
}

function validateReviewText() {
    const text = document.getElementById('reviewText').value;
    const errorElement = document.getElementById('reviewTextError');
    
    if (!text) {
        showError(errorElement, 'Текст отзыва обязателен');
        return false;
    }
    
    if (text.length < MIN_REVIEW_LENGTH) {
        showError(errorElement, `Отзыв должен содержать минимум ${MIN_REVIEW_LENGTH} символов`);
        return false;
    }
    
    hideError(errorElement);
    return true;
}

function validateReviewRating() {
    const rating = document.getElementById('reviewRating').value;
    const errorElement = document.getElementById('reviewRatingError');
    
    if (!rating) {
        showError(errorElement, 'Оценка обязательна');
        return false;
    }
    
    hideError(errorElement);
    return true;
}

function validateReviewProduct() {
    const productId = document.getElementById('reviewProduct').value;
    const errorElement = document.getElementById('reviewProductError');
    
    if (!productId) {
        showError(errorElement, 'Выберите товар');
        return false;
    }
    
    hideError(errorElement);
    return true;
}

async function validateReviewForm() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    
    if (user && user.role === 'admin') {
        alert('Администраторы не могут оставлять отзывы');
        return false;
    }
    
    const isValid = validateReviewText() && validateReviewRating() && validateReviewProduct();
    const submitButton = document.getElementById('submitReview');
    
    if (submitButton) {
        submitButton.disabled = !isValid;
    }
    
    return isValid;
}

async function submitReview() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        alert('Для оставления отзыва необходимо войти в систему');
        return;
    }
    
    const reviewData = {
        userId: user.id,
        productId: document.getElementById('reviewProduct').value,
        rating: parseInt(document.getElementById('reviewRating').value),
        text: document.getElementById('reviewText').value,
        date: new Date().toISOString(),
        status: 'pending'
    };
    
    try {
        const response = await fetch(`${API_URL}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reviewData)
        });
        
        if (response.ok) {
            alert('Отзыв успешно отправлен на модерацию!');
            document.getElementById('reviewForm').reset();

            const starButtons = document.querySelectorAll('.star-btn');
            starButtons.forEach(btn => {
                btn.textContent = '☆';
                btn.classList.remove('active');
            });

            loadReviews();
        } else {
            throw new Error('Ошибка отправки отзыва');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось отправить отзыв');
    }
}

function loadReviews() {
    fetch(`${API_URL}/reviews?_expand=product&_expand=user&status=approved`)
        .then(response => response.json())
        .then(reviews => {
            displayReviews(reviews);
        })
        .catch(error => {
            console.error('Ошибка загрузки отзывов:', error);
        });
}

function displayReviews(reviews) {
    const container = document.getElementById('reviewsList');
    if (!container) return;
    
    container.innerHTML = '';

    reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    reviews.forEach(review => {
        const reviewElement = document.createElement('div');
        reviewElement.className = 'review-item';
        reviewElement.innerHTML = `
            <div class="review-header">
                <h4>${review.product?.name || 'Неизвестный товар'}</h4>
                <div class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
            </div>
            <p class="review-text">${review.text}</p>
            <div class="review-footer">
                <span class="review-author">${review.user?.firstName || 'Пользователь'} ${review.user?.lastName || ''}</span>
                <span class="review-date">${new Date(review.date).toLocaleDateString('ru-RU')}</span>
            </div>
        `;
        container.appendChild(reviewElement);
    });
}

function showError(element, message) {
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

function hideError(element) {
    if (element) {
        element.textContent = '';
        element.style.display = 'none';
    }
}