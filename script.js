class UnsplashGallery {
    constructor() {
        this.API_KEY = 'xCQgIul9J5ppK63cmh_3d6L5I_jVRBk1XBEBumQ6NZA'; 
        this.BASE_URL = 'https://api.unsplash.com';
        this.currentPage = 1;
        this.currentQuery = '';
        this.currentFilter = 'relevant';
        this.isLoading = false;
        
        this.initialize();
    }

    initialize() {
        this.cacheElements();
        this.bindEvents();
        this.focusSearchInput();
        this.loadInitialPhotos();
    }

    cacheElements() {
        this.gallery = document.getElementById('gallery');
        this.searchInput = document.querySelector('.search__input');
        this.searchClear = document.querySelector('.search__clear');
        this.filterSelect = document.querySelector('.filter');
    }

    bindEvents() {
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });

        this.searchClear.addEventListener('click', () => {
            this.clearSearch();
        });

        this.filterSelect.addEventListener('change', () => {
            this.currentFilter = this.filterSelect.value;
            if (this.currentQuery) {
                this.handleSearch();
            }
        });

        window.addEventListener('scroll', () => {
            this.handleScroll();
        });
    }

    focusSearchInput() {
        this.searchInput.focus();
    }

    async loadInitialPhotos() {
        try {
            this.showLoading();
            const photos = await this.fetchPhotos('nature', 1, 12);
            this.displayPhotos(photos);
        } catch (error) {
            this.showError('Ошибка при загрузке фотографий');
        }
    }

    async handleSearch() {
        const query = this.searchInput.value.trim();
        if (!query) return;

        this.currentQuery = query;
        this.currentPage = 1;
        
        try {
            this.showLoading();
            const photos = await this.fetchPhotos(query, 1, 12);
            if (photos.length === 0) {
                this.showNoResults();
            } else {
                this.displayPhotos(photos);
            }
        } catch (error) {
            this.showError('Ошибка при поиске фотографий');
        }
    }

    clearSearch() {
        this.searchInput.value = '';
        this.searchInput.focus();
        this.currentPage = 1;
        this.loadInitialPhotos();
    }

    async handleScroll() {
        if (this.isLoading) return;

        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        const isBottom = scrollTop + clientHeight >= scrollHeight - 100;

        if (isBottom) {
            this.currentPage++;
            this.isLoading = true;
            
            try {
                const query = this.currentQuery || 'nature';
                const photos = await this.fetchPhotos(query, this.currentPage, 12);
                this.appendPhotos(photos);
            } catch (error) {
                console.error('Ошибка при загрузке дополнительных фотографий:', error);
            } finally {
                this.isLoading = false;
            }
        }
    }

    async fetchPhotos(query, page = 1, perPage = 12) {
        const url = new URL(`${this.BASE_URL}/search/photos`);
        url.searchParams.append('query', query);
        url.searchParams.append('page', page);
        url.searchParams.append('per_page', perPage);
        url.searchParams.append('order_by', this.currentFilter);

        const response = await fetch(url, {
            headers: {
                'Authorization': `Client-ID ${this.API_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.results;
    }

    displayPhotos(photos) {
        this.gallery.innerHTML = '';
        
        if (photos.length === 0) {
            this.showNoResults();
            return;
        }

        photos.forEach(photo => {
            this.gallery.appendChild(this.createPhotoCard(photo));
        });
    }

    appendPhotos(photos) {
        photos.forEach(photo => {
            this.gallery.appendChild(this.createPhotoCard(photo));
        });
    }

    createPhotoCard(photo) {
        const card = document.createElement('div');
        card.className = 'photo-card';
        
        const date = new Date(photo.created_at).toLocaleDateString('ru-RU');
        
        card.innerHTML = `
            <img 
                src="${photo.urls.regular}" 
                alt="${photo.alt_description || 'Unsplash photo'}" 
                class="photo-card__image"
                loading="lazy"
            >
            <div class="photo-card__info">
                <h3 class="photo-card__title">${photo.description || 'Без названия'}</h3>
                <p class="photo-card__author">Автор: ${photo.user.name}</p>
                <p class="photo-card__date">Дата: ${date}</p>
                <div class="photo-card__stats">
                    <span class="photo-card__stat">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        ${photo.likes}
                    </span>
                    <span class="photo-card__stat">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M14.017 21v-7.391c0-5.704-3.731-9.57-8.017-9.57-4.286 0-8.017 3.866-8.017 9.57v7.391h16.034zm-8.017-12.609c0-1.754 1.343-3.174 3-3.174s3 1.42 3 3.174c0 1.754-1.343 3.174-3 3.174s-3-1.42-3-3.174z"/>
                        </svg>
                        ${photo.user.total_photos}
                    </span>
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            window.open(photo.links.html, '_blank');
        });

        return card;
    }

    showLoading() {
        this.gallery.innerHTML = '<div class="loading">Загрузка изображений...</div>';
    }

    showError(message) {
        this.gallery.innerHTML = `<div class="error">${message}</div>`;
    }

    showNoResults() {
        this.gallery.innerHTML = `
            <div class="no-results">
                По запросу "${this.currentQuery}" ничего не найдено.
                <br>Попробуйте изменить поисковый запрос.
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new UnsplashGallery();
});