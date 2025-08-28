document.addEventListener('DOMContentLoaded', function() {
    initializeModal();
});

function initializeModal() {
    const modal = document.getElementById('productModal');
    const closeBtn = document.querySelector('.close-modal');
    const addProductBtn = document.getElementById('addProductBtn');

    if (addProductBtn) {
        addProductBtn.addEventListener('click', function() {
            resetProductForm();
            openProductModal();
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });
 
    const cancelBtn = document.querySelector('.modal-button[data-action="close"]');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
}

function openProductModal(product = null) {
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('modalTitle');
    
    if (!modal) return;

    if (product) {
        modalTitle.textContent = 'Редактировать товар';
        fillProductForm(product);
    } else {
        modalTitle.textContent = 'Добавить товар';
    }

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; 
}

function fillProductForm(product) {
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productImage').value = product.image;
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productRating').value = product.rating || '';
    document.getElementById('productComplexity').value = product.details?.complexity || '';
}

function resetProductForm() {
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';

    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
    });
}

function closeModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; 
    }
}

function editProduct(product) {
    openProductModal(product);
}