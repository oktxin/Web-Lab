const API_URL = 'http://localhost:3000';

const nickSuffixes = ['Pro', 'Master', 'Expert', 'Guru', 'King', 'Star', 'Hero', 'Leader', 'Champ', 'Wizard'];

document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
});

function initializeForm() {
    const form = document.getElementById('registrationForm');
    const passwordMethod = document.getElementById('passwordMethod');
    const generateBtn = document.getElementById('generateNickname');
    const submitButton = document.getElementById('submitButton');

    generateNickname();

    passwordMethod.addEventListener('change', function() {
        togglePasswordSections(this.value);
    });

    generateBtn.addEventListener('click', function() {
        const attempts = parseInt(document.getElementById('attemptsCount').textContent);
        if (attempts > 0) {
            generateNickname();
            document.getElementById('attemptsCount').textContent = attempts - 1;
        } else {
            enableManualNicknameInput();
        }
    });

    form.addEventListener('input', async function() {
        await validateForm();
    });

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (await validateForm()) {
            registerUser();
        }
    });

    document.getElementById('phone').addEventListener('blur', validatePhone);
    document.getElementById('email').addEventListener('blur', validateEmail);
    document.getElementById('birthDate').addEventListener('blur', validateBirthDate);
    document.getElementById('password').addEventListener('input', validatePassword);
    document.getElementById('confirmPassword').addEventListener('blur', validateConfirmPassword);
}

function togglePasswordSections(method) {
    const manualSection = document.getElementById('manualPasswordSection');
    const autoSection = document.getElementById('autoPasswordSection');
    
    if (method === 'manual') {
        manualSection.style.display = 'block';
        autoSection.style.display = 'none';
    } else if (method === 'auto') {
        manualSection.style.display = 'none';
        autoSection.style.display = 'block';
    } else {
        manualSection.style.display = 'none';
        autoSection.style.display = 'none';
    }
    
    validateForm();
}

function generateNickname() {
    const firstName = document.getElementById('firstName').value || 'User';
    const lastName = document.getElementById('lastName').value || '';
    
    let nickname = '';

    const firstPart = firstName.substring(0, Math.min(3, Math.max(1, Math.floor(Math.random() * 3) + 1)));

    let secondPart = '';
    if (lastName) {
        secondPart = lastName.substring(0, Math.min(3, Math.max(1, Math.floor(Math.random() * 3) + 1)));
    }

    const randomNum = Math.floor(Math.random() * 990) + 10;

    if (secondPart) {
        const separator = Math.random() > 0.5 ? '' : (Math.random() > 0.5 ? '_' : '.');
        nickname = firstPart + separator + secondPart + randomNum;
    } else {
        nickname = firstPart + randomNum;
    }

    if (Math.random() > 0.7) {
        const suffix = nickSuffixes[Math.floor(Math.random() * nickSuffixes.length)];
        nickname += suffix;
    }

    nickname = nickname.charAt(0).toUpperCase() + nickname.slice(1).toLowerCase();
    
    document.getElementById('nickname').value = nickname;
    validateNickname();
}

function enableManualNicknameInput() {
    const nicknameInput = document.getElementById('nickname');
    const generateBtn = document.getElementById('generateNickname');
    
    nicknameInput.readOnly = false;
    nicknameInput.placeholder = 'Введите свой никнейм';
    generateBtn.style.display = 'none';
    document.querySelector('.attempts-counter').style.display = 'none';
    
    nicknameInput.focus();
}

async function validateNickname() {
    const nickname = document.getElementById('nickname').value;
    const errorElement = document.getElementById('nicknameError');
    
    if (!nickname) {
        showError(errorElement, 'Никнейм обязателен для заполнения');
        return false;
    }
    
    if (nickname.length < 3) {
        showError(errorElement, 'Никнейм должен содержать минимум 3 символа');
        return false;
    }

    try {
        const response = await fetch(`${API_URL}/users?nickname=${encodeURIComponent(nickname)}`);
        const users = await response.json();
        
        if (users.length > 0) {
            showError(errorElement, 'Этот никнейм уже занят');
            return false;
        }
    } catch (error) {
        console.error('Ошибка проверки никнейма:', error);
    }
    
    hideError(errorElement);
    return true;
}

function validatePhone() {
    const phone = document.getElementById('phone').value;
    const errorElement = document.getElementById('phoneError');
    const belarusRegex = /^(\+375|80)(29|25|44|33)(\d{3})(\d{2})(\d{2})$/;
    
    if (!phone) {
        showError(errorElement, 'Номер телефона обязателен');
        return false;
    }

    const cleanPhone = phone.replace(/[^\d+]/g, '');
    
    if (!belarusRegex.test(cleanPhone)) {
        showError(errorElement, 'Введите корректный номер телефона РБ');
        return false;
    }
    
    hideError(errorElement);
    return true;
}

function validateEmail() {
    const email = document.getElementById('email').value;
    const errorElement = document.getElementById('emailError');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
        showError(errorElement, 'Email обязателен');
        return false;
    }
    
    if (!emailRegex.test(email)) {
        showError(errorElement, 'Введите корректный email');
        return false;
    }
    
    hideError(errorElement);
    return true;
}

function validateBirthDate() {
    const birthDate = new Date(document.getElementById('birthDate').value);
    const errorElement = document.getElementById('birthDateError');
    
    if (!document.getElementById('birthDate').value) {
        showError(errorElement, 'Дата рождения обязательна');
        return false;
    }
    
    const today = new Date();
    const minAgeDate = new Date();
    minAgeDate.setFullYear(today.getFullYear() - 16);
    
    if (birthDate > minAgeDate) {
        showError(errorElement, 'Вам должно быть не менее 16 лет');
        return false;
    }
    
    hideError(errorElement);
    return true;
}

function validatePassword() {
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('passwordError');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthValue = document.getElementById('strengthValue');
    
    if (!password) {
        hideError(errorElement);
        updatePasswordStrength(0, 'не задан', '#ddd');
        return false;
    }

    if (password.length < 8) {
        showError(errorElement, 'Пароль должен содержать минимум 8 символов');
        updatePasswordStrength(0, 'очень слабый', '#dc3545');
        return false;
    }
    
    if (password.length > 20) {
        showError(errorElement, 'Пароль должен содержать не более 20 символов');
        return false;
    }

    let strength = 0;
    let message = '';
    let color = '';
    
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    const commonPasswords = ['password', '12345678', 'qwerty123', 'admin123'];
    if (commonPasswords.includes(password.toLowerCase())) {
        showError(errorElement, 'Этот пароль слишком распространен');
        updatePasswordStrength(0, 'очень слабый', '#dc3545');
        return false;
    }

    switch(strength) {
        case 1:
            message = 'очень слабый';
            color = '#dc3545';
            break;
        case 2:
            message = 'слабый';
            color = '#fd7e14';
            break;
        case 3:
            message = 'средний';
            color = '#ffc107';
            break;
        case 4:
            message = 'сильный';
            color = '#28a745';
            break;
    }
    
    const width = (strength / 4) * 100;
    updatePasswordStrength(width, message, color);
    
    if (strength < 3) {
        showError(errorElement, 'Пароль слишком слабый. Используйте буквы разного регистра, цифры и специальные символы');
        return false;
    }
    
    hideError(errorElement);
    return true;
}

function updatePasswordStrength(width, message, color) {
    const strengthBar = document.querySelector('.strength-bar');
    const strengthValue = document.getElementById('strengthValue');
    
    strengthBar.style.setProperty('--strength-width', width + '%');
    strengthBar.style.setProperty('--strength-color', color);
    strengthValue.textContent = message;
    strengthValue.style.color = color;
}

function validateConfirmPassword() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorElement = document.getElementById('confirmPasswordError');
    
    if (!confirmPassword) {
        showError(errorElement, 'Подтверждение пароля обязательно');
        return false;
    }
    
    if (password !== confirmPassword) {
        showError(errorElement, 'Пароли не совпадают');
        return false;
    }
    
    hideError(errorElement);
    return true;
}

async function validateForm() {
    const requiredFields = [
        validatePhone(),
        validateEmail(),
        validateBirthDate(),
        await validateNickname() 
    ];
    
    const passwordMethod = document.getElementById('passwordMethod').value;
    if (passwordMethod === 'manual') {
        requiredFields.push(validatePassword());
        requiredFields.push(validateConfirmPassword());
    }
    
    const agreeTerms = document.getElementById('agreeTerms').checked;
    if (!agreeTerms) {
        return false;
    }
    
    const isValid = requiredFields.every(field => field === true);
    document.getElementById('submitButton').disabled = !isValid;
    
    return isValid;
}


function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
}

function hideError(element) {
    element.textContent = '';
    element.style.display = 'none';
}

async function registerUser() {
    const formData = {
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        lastName: document.getElementById('lastName').value,
        firstName: document.getElementById('firstName').value,
        middleName: document.getElementById('middleName').value || '',
        birthDate: document.getElementById('birthDate').value,
        nickname: document.getElementById('nickname').value,
        passwordMethod: document.getElementById('passwordMethod').value,
        agreeTerms: document.getElementById('agreeTerms').checked,
        role: 'user',
        registrationDate: new Date().toISOString()
    };

    if (formData.passwordMethod === 'auto') {
        formData.password = generateAutoPassword();
    } else {
        formData.password = document.getElementById('password').value;
    }
    
    try {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        if (typeof updateHeaderAuthState === 'function') {
            updateHeaderAuthState();
        }
        if (response.ok) {
            alert('Регистрация успешна!');
            window.location.href = 'login.html';
        } else {
            throw new Error('Ошибка регистрации');
        }
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        alert('Произошла ошибка при регистрации. Попробуйте еще раз.');
    }
}

function generateAutoPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return password;
}