const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    initializeForm(); 
});


async function initializeForm() {
    const form = document.getElementById('registrationForm');
    const passwordMethod = document.getElementById('passwordMethod');
    const generateBtn = document.getElementById('generateNickname');
    const submitButton = document.getElementById('submitButton');

    if (!form || !passwordMethod || !generateBtn || !submitButton) {
        console.error('Не удалось найти необходимые элементы формы');
        return;
    }

    await generateNickname();

    passwordMethod.addEventListener('change', function() {
        togglePasswordSections(this.value);
        validateForm();
    });

    generateBtn.addEventListener('click', async function() {
        const attemptsElement = document.getElementById('attemptsCount');
        if (attemptsElement) {
            const attempts = parseInt(attemptsElement.textContent);
            if (attempts > 0) {
                await generateNickname(); 
                attemptsElement.textContent = attempts - 1;
            } else {
                enableManualNicknameInput();
            }
        }
    });

    const mainInputs = [
        'phone', 'email', 'lastName', 'firstName', 
        'birthDate', 'nickname', 'password', 'confirmPassword'
    ];
    
    mainInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', function() {
                validateForm();
            });
        }
    });

    const agreeTerms = document.getElementById('agreeTerms');
    if (agreeTerms) {
        agreeTerms.addEventListener('change', function() {
            updateSubmitButton();
        });
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (await validateForm(true)) {
            registerUser();
        }
    });

    const phoneInput = document.getElementById('phone');
    const emailInput = document.getElementById('email');
    const birthDateInput = document.getElementById('birthDate');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    if (phoneInput) phoneInput.addEventListener('blur', validatePhone);
    if (emailInput) emailInput.addEventListener('blur', validateEmail);
    if (birthDateInput) birthDateInput.addEventListener('blur', validateBirthDate);
    if (passwordInput) passwordInput.addEventListener('input', validatePassword);
    if (confirmPasswordInput) confirmPasswordInput.addEventListener('blur', validateConfirmPassword);

    updateSubmitButton();
}

function togglePasswordSections(method) {
    const manualSection = document.getElementById('manualPasswordSection');
    const autoSection = document.getElementById('autoPasswordSection');
    
    if (manualSection && autoSection) {
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
    }
}

async function generateNickname() {
    const firstName = document.getElementById('firstName')?.value || 'User';
    const lastName = document.getElementById('lastName')?.value || '';
    const nicknameInput = document.getElementById('nickname');
    
    if (!nicknameInput) return;

    const firstNameLength = Math.floor(Math.random() * 3) + 1; 
    const firstNamePart = firstName.substring(0, firstNameLength);

    let lastNamePart = '';
    if (lastName.trim() !== '') {
        const lastNameLength = Math.floor(Math.random() * 3) + 1;
        lastNamePart = lastName.substring(0, lastNameLength);
    }

    const randomNum = Math.floor(Math.random() * 990) + 10;

    const suffixes = ['Pro', 'Master', 'Hero', 'Star', 'Boss'];
    const suffix = Math.random() > 0.7 ? suffixes[Math.floor(Math.random() * suffixes.length)] : '';

    const separators = ['', '_', '.', '-'];
    const separator = separators[Math.floor(Math.random() * separators.length)];

    let nickname = lastNamePart
        ? `${firstNamePart}${separator}${lastNamePart}${randomNum}${suffix}`
        : `${firstNamePart}${randomNum}${suffix}`;

    nickname = nickname.charAt(0).toUpperCase() + nickname.slice(1);

    nicknameInput.value = nickname;

    let isValid = await validateNickname();
    let attempts = 5;
    while (!isValid && attempts > 0) {
        nicknameInput.value = nickname + Math.floor(Math.random() * 99);
        isValid = await validateNickname();
        attempts--;
    }

    updateSubmitButton();
}


function getRandomSuffix() {
    const suffixPatterns = [
        'Pro', 'Master', 'Expert', 'Guru', 'King', 'Star', 
        'Hero', 'Leader', 'Champ', 'Wizard', 'Ninja', 'Warrior',
        'Genius', 'Savvy', 'Ace', 'Boss', 'Chief', 'Elite'
    ];
    return suffixPatterns[Math.floor(Math.random() * suffixPatterns.length)];
}

function getRandomSeparator() {

    const separators = ['', '_', '.', '-', ''];
    return separators[Math.floor(Math.random() * separators.length)];
}

function enableManualNicknameInput() {
    const nicknameInput = document.getElementById('nickname');
    const generateBtn = document.getElementById('generateNickname');
    const attemptsCounter = document.querySelector('.attempts-counter');
    
    if (nicknameInput) {
        nicknameInput.readOnly = false;
        nicknameInput.placeholder = getTranslation('enterNickname');
    }
    
    if (generateBtn) generateBtn.style.display = 'none';
    if (attemptsCounter) attemptsCounter.style.display = 'none';
    
    if (nicknameInput) nicknameInput.focus();
}

async function validateNickname() {
    const nicknameInput = document.getElementById('nickname');
    const errorElement = document.getElementById('nicknameError');
    
    if (!nicknameInput || !errorElement) return false;
    
    const nickname = nicknameInput.value;
    
    if (!nickname) {
        showError(errorElement, getTranslation('nicknameRequired'));
        return false;
    }
    
    if (nickname.length < 3) {
        showError(errorElement, getTranslation('nicknameMinLength'));
        return false;
    }

    if (nickname.length > 20) {
        showError(errorElement, getTranslation('nicknameMaxLength'));
        return false;
    }

    try {
        const response = await fetch(`${API_URL}/users?nickname=${encodeURIComponent(nickname)}`);
        const users = await response.json();
        
        if (users.length > 0) {
            showError(errorElement, getTranslation('nicknameTaken'));
            return false;
        }
    } catch (error) {
        console.error('Ошибка проверки никнейма:', error);
        return true;
    }
    
    hideError(errorElement);
    return true;
}

function validatePhone() {
    const phoneInput = document.getElementById('phone');
    const errorElement = document.getElementById('phoneError');
    
    if (!phoneInput || !errorElement) return false;
    
    const phone = phoneInput.value;
    const belarusRegex = /^(\+375|80)(29|25|44|33)(\d{3})(\d{2})(\d{2})$/;
    
    if (!phone) {
        showError(errorElement, getTranslation('phoneRequired'));
        return false;
    }

    const cleanPhone = phone.replace(/[^\d+]/g, '');
    
    if (!belarusRegex.test(cleanPhone)) {
        showError(errorElement, getTranslation('invalidPhone'));
        return false;
    }
    
    hideError(errorElement);
    return true;
}

function validateEmail() {
    const emailInput = document.getElementById('email');
    const errorElement = document.getElementById('emailError');
    
    if (!emailInput || !errorElement) return false;
    
    const email = emailInput.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
        showError(errorElement, getTranslation('emailRequired'));
        return false;
    }
    
    if (!emailRegex.test(email)) {
        showError(errorElement, getTranslation('invalidEmail'));
        return false;
    }
    
    hideError(errorElement);
    return true;
}

function validateBirthDate() {
    const birthDateInput = document.getElementById('birthDate');
    const errorElement = document.getElementById('birthDateError');
    
    if (!birthDateInput || !errorElement) return false;
    
    const birthDateValue = birthDateInput.value;
    if (!birthDateValue) {
        showError(errorElement, getTranslation('birthDateRequired'));
        return false;
    }
    
    const birthDate = new Date(birthDateValue);
    const today = new Date();
    const minAgeDate = new Date();
    minAgeDate.setFullYear(today.getFullYear() - 16);
    
    if (birthDate > minAgeDate) {
        showError(errorElement, getTranslation('minAgeRequired'));
        return false;
    }
    
    hideError(errorElement);
    return true;
}

function validatePassword() {
    const passwordInput = document.getElementById('password');
    const errorElement = document.getElementById('passwordError');
    const strengthValue = document.getElementById('strengthValue');
    
    if (!passwordInput) return true;
    
    const password = passwordInput.value;
    
    const manualSection = document.getElementById('manualPasswordSection');
    if (manualSection && manualSection.style.display === 'none') {
        if (errorElement) hideError(errorElement);
        return true;
    }
    
    if (!password) {
        if (errorElement) hideError(errorElement);
        if (strengthValue) updatePasswordStrength(0, getTranslation('notSet'), '#ddd');
        return false;
    }

    if (password.length < 8) {
        if (errorElement) showError(errorElement, getTranslation('passwordMinLength'));
        if (strengthValue) updatePasswordStrength(0, getTranslation('veryWeak'), '#dc3545');
        return false;
    }
    
    if (password.length > 20) {
        if (errorElement) showError(errorElement, getTranslation('passwordMaxLength'));
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
        if (errorElement) showError(errorElement, getTranslation('commonPassword'));
        if (strengthValue) updatePasswordStrength(0, getTranslation('veryWeak'), '#dc3545');
        return false;
    }

    switch(strength) {
        case 1:
            message = getTranslation('veryWeak');
            color = '#dc3545';
            break;
        case 2:
            message = getTranslation('weak');
            color = '#fd7e14';
            break;
        case 3:
            message = getTranslation('medium');
            color = '#ffc107';
            break;
        case 4:
            message = getTranslation('strong');
            color = '#28a745';
            break;
    }
    
    const width = (strength / 4) * 100;
    if (strengthValue) updatePasswordStrength(width, message, color);
    
    if (strength < 3) {
        if (errorElement) showError(errorElement, getTranslation('passwordTooWeak'));
        return false;
    }
    
    if (errorElement) hideError(errorElement);
    return true;
}

function updatePasswordStrength(width, message, color) {
    const strengthBar = document.querySelector('.strength-bar');
    const strengthValue = document.getElementById('strengthValue');
    
    if (strengthBar) {
        strengthBar.style.setProperty('--strength-width', width + '%');
        strengthBar.style.setProperty('--strength-color', color);
    }
    
    if (strengthValue) {
        strengthValue.textContent = message;
        strengthValue.style.color = color;
    }
}

function validateConfirmPassword() {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const errorElement = document.getElementById('confirmPasswordError');
    
    if (!confirmPasswordInput || !errorElement) return true;
    
    const manualSection = document.getElementById('manualPasswordSection');
    if (manualSection && manualSection.style.display === 'none') {
        hideError(errorElement);
        return true;
    }
    
    const password = passwordInput ? passwordInput.value : '';
    const confirmPassword = confirmPasswordInput.value;
    
    if (!confirmPassword) {
        showError(errorElement, getTranslation('confirmPasswordRequired'));
        return false;
    }
    
    if (password !== confirmPassword) {
        showError(errorElement, getTranslation('passwordsDontMatch'));
        return false;
    }
    
    hideError(errorElement);
    return true;
}

async function validateForm(finalValidation = false) {
    const phoneValid = validatePhone();
    const emailValid = validateEmail();
    const birthDateValid = validateBirthDate();
    const nicknameValid = await validateNickname();
    
    const passwordMethod = document.getElementById('passwordMethod');
    let passwordValid = true;
    let confirmPasswordValid = true;
    
    if (passwordMethod && passwordMethod.value === 'manual') {
        passwordValid = validatePassword();
        confirmPasswordValid = validateConfirmPassword();
    }
    
    const agreeTerms = document.getElementById('agreeTerms');
    const termsValid = agreeTerms ? agreeTerms.checked : false;
    
    updateSubmitButton();
    
    if (finalValidation) {
        return phoneValid && emailValid && birthDateValid && nicknameValid && 
               passwordValid && confirmPasswordValid && termsValid;
    }
    
    return true;
}

function updateSubmitButton() {
    const submitButton = document.getElementById('submitButton');
    if (!submitButton) return;
    
    const phone = document.getElementById('phone')?.value;
    const email = document.getElementById('email')?.value;
    const lastName = document.getElementById('lastName')?.value;
    const firstName = document.getElementById('firstName')?.value;
    const birthDate = document.getElementById('birthDate')?.value;
    const nickname = document.getElementById('nickname')?.value;
    const agreeTerms = document.getElementById('agreeTerms')?.checked;
    
    const passwordMethod = document.getElementById('passwordMethod')?.value;
    let passwordValid = true;
    
    if (passwordMethod === 'manual') {
        const password = document.getElementById('password')?.value;
        const confirmPassword = document.getElementById('confirmPassword')?.value;
        passwordValid = password && confirmPassword && password === confirmPassword;
    }
    
    const allFieldsFilled = phone && email && lastName && firstName && 
                           birthDate && nickname && agreeTerms && passwordValid;
    
    submitButton.disabled = !allFieldsFilled;
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

async function registerUser() {
    const formData = {
        phone: document.getElementById('phone')?.value || '',
        email: document.getElementById('email')?.value || '',
        lastName: document.getElementById('lastName')?.value || '',
        firstName: document.getElementById('firstName')?.value || '',
        middleName: document.getElementById('middleName')?.value || '',
        birthDate: document.getElementById('birthDate')?.value || '',
        nickname: document.getElementById('nickname')?.value || '',
        passwordMethod: document.getElementById('passwordMethod')?.value || '',
        agreeTerms: document.getElementById('agreeTerms')?.checked || false,
        role: 'user',
        registrationDate: new Date().toISOString()
    };

    if (formData.passwordMethod === 'auto') {
        formData.password = generateAutoPassword();
    } else {
        formData.password = document.getElementById('password')?.value || '';
    }
    
    try {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
    });
        
        if (response.ok) {
            alert(getTranslation('registrationSuccess'));
            window.location.href = 'login.html';
        } else {
            throw new Error(getTranslation('registrationError'));
        }
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        alert(getTranslation('registrationFailed'));
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

function updateRegisterTranslation(lang) {
    const nicknameInput = document.getElementById('nickname');
    if (nicknameInput && !nicknameInput.readOnly) {
        nicknameInput.placeholder = getTranslation('enterNickname');
    }
    
    const attemptsCounter = document.querySelector('.attempts-counter');
    if (attemptsCounter) {
        const attemptsCount = document.getElementById('attemptsCount');
        if (attemptsCount) {
            attemptsCounter.innerHTML = getTranslation('attempts').replace('{count}', `<span id="attemptsCount">${attemptsCount.textContent}</span>`);
        }
    }
    
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        validatePassword();
    } else {
        const strengthValue = document.getElementById('strengthValue');
        if (strengthValue) {
            updatePasswordStrength(0, getTranslation('notSet'), '#ddd');
        }
    }
    
    updateSubmitButton();
}