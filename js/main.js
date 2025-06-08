let currentStep = 1;
const totalSteps = 3;
let isEditing = false;

// Load components
async function loadComponents() {
  const header = await fetch('components/header.html').then(res => res.text());
  const modals = [
    'profile-modal.html',
    'daily-modal.html',
    'weekly-modal.html',
    'monthly-modal.html',
    'compatibility-modal.html',
    'history-modal.html'
  ].map(file => fetch(`components/${file}`).then(res => res.text()));
  document.getElementById('header').innerHTML = header;
  document.getElementById('modals').innerHTML = (await Promise.all(modals)).join('');
  initializeApp();
}

// Initialize app
function initializeApp() {
  createStars();
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
  }, 2000);
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
  }
  loadProfile();
  document.querySelectorAll('.button').forEach(button => {
    button.addEventListener('click', function() {
      this.classList.add('ripple');
      setTimeout(() => this.classList.remove('ripple'), 600);
    });
  });
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.step));
  });
}

// Create stars for dark mode
function createStars() {
  const starsContainer = document.getElementById('stars');
  for (let i = 0; i < 50; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.width = `${Math.random() * 3 + 1}px`;
    star.style.height = star.style.width;
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.animationDelay = `${Math.random() * 2}s`;
    starsContainer.appendChild(star);
  }
}

// Load profile
function loadProfile() {
  const profile = JSON.parse(localStorage.getItem('profile') || '{}');
  if (profile.name) {
    document.getElementById('name').value = profile.name;
    document.getElementById('birthDate').value = profile.birthDate;
    document.getElementById('birthTime').value = profile.birthTime || '';
    document.getElementById('birthCity').value = profile.birthCity;
    document.getElementById('gender').value = profile.gender;
    document.getElementById('interest').value = profile.interest;
    document.getElementById('maritalStatus').value = profile.maritalStatus;
    document.getElementById('children').value = profile.children;
    document.getElementById('favoriteColor').value = profile.favoriteColor;
    document.getElementById('fears').value = profile.fears || '';
  }
}

// Enable edit mode
function enableEdit() {
  isEditing = true;
  document.querySelectorAll('#profileModal input, #profileModal select').forEach(el => {
    el.disabled = false;
  });
}

// Open modal
function openModal(section) {
  document.body.style.opacity = '0';
  setTimeout(() => {
    document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
    const modal = document.getElementById(section + 'Modal');
    modal.style.display = 'flex';
    modal.querySelector('input, select, button').focus();
    document.body.style.opacity = '1';
    if (section === 'profile') {
      currentStep = 1;
      updateProgress();
      loadProfile();
    }
    if (section === 'daily' || section === 'weekly' || section === 'monthly') {
      document.getElementById(`${section}Forecast`).textContent = 'Данная функция в разработке. Приносим свои извинения';
      document.getElementById(`${section}Forecast`).className = 'error';
    }
    if (section === 'compatibility') {
      loadUserData();
      document.getElementById('compatMessage').style.display = 'none';
    }
    if (section === 'history') loadHistory();
  }, 300);
}

// Close modal
function closeModal(section) {
  document.body.style.opacity = '0';
  setTimeout(() => {
    document.getElementById(section + 'Modal').style.display = 'none';
    document.body.style.opacity = '1';
  }, 300);
}

// Update progress
function updateProgress() {
  const progress = document.getElementById('progress');
  progress.style.width = `${(currentStep / totalSteps) * 100}%`;
  document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
  document.getElementById(`step${currentStep}`).classList.add('active');
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.querySelector(`.tab[data-step="${currentStep}"]`).classList.add('active');
}

// Switch tab
function switchTab(step) {
  if (validateStep(currentStep)) {
    currentStep = parseInt(step);
    updateProgress();
  }
}

// Next step
function nextStep(current) {
  if (validateStep(current)) {
    currentStep++;
    updateProgress();
  }
}

// Previous step
function prevStep(current) {
  currentStep--;
  updateProgress();
}

// Validate step
function validateStep(step) {
  let valid = true;
  if (step === 1) {
    const name = document.getElementById('name').value;
    const gender = document.getElementById('gender').value;
    document.getElementById('nameError').style.display = name ? 'none' : 'block';
    document.getElementById('genderError').style.display = gender ? 'none' : 'block';
    valid = name && gender;
  } else if (step === 2) {
    const birthDate = document.getElementById('birthDate').value;
    const birthCity = document.getElementById('birthCity').value;
    document.getElementById('birthDateError').style.display = birthDate ? 'none' : 'block';
    document.getElementById('birthCityError').style.display = birthCity ? 'none' : 'block';
    valid = birthDate && birthCity;
  } else if (step === 3) {
    const interest = document.getElementById('interest').value;
    const maritalStatus = document.getElementById('maritalStatus').value;
    const children = document.getElementById('children').value;
    const favoriteColor = document.getElementById('favoriteColor').value;
    document.getElementById('interestError').style.display = interest ? 'none' : 'block';
    document.getElementById('maritalStatusError').style.display = maritalStatus ? 'none' : 'block';
    document.getElementById('childrenError').style.display = children ? 'none' : 'block';
    document.getElementById('favoriteColorError').style.display = favoriteColor ? 'none' : 'block';
    valid = interest && maritalStatus && children && favoriteColor;
  }
  return valid;
}

// Save profile
function saveProfile() {
  if (validateStep(3)) {
    const profile = {
      name: document.getElementById('name').value,
      birthDate: document.getElementById('birthDate').value,
      birthTime: document.getElementById('birthTime').value,
      birthCity: document.getElementById('birthCity').value,
      gender: document.getElementById('gender').value,
      interest: document.getElementById('interest').value,
      maritalStatus: document.getElementById('maritalStatus').value,
      children: document.getElementById('children').value,
      favoriteColor: document.getElementById('favoriteColor').value,
      fears: document.getElementById('fears').value
    };
    localStorage.setItem('profile', JSON.stringify(profile));
    const success = document.createElement('p');
    success.className = 'success';
    success.textContent = 'Анкета успешно сохранена!';
    document.getElementById('step3').appendChild(success);
    setTimeout(() => {
      success.remove();
      document.querySelectorAll('#profileModal input, #profileModal select').forEach(el => {
        el.disabled = true;
      });
      isEditing = false;
    }, 3000);
  }
}

// Load user data
function loadUserData() {
  const profile = JSON.parse(localStorage.getItem('profile') || '{}');
  document.getElementById('userData').textContent = profile.name 
    ? `Имя: ${profile.name}, Дата рождения: ${profile.birthDate}, Город: ${profile.birthCity}`
    : 'Данные не заполнены';
}

// Get zodiac sign
function getZodiacSign(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return '♈';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return '♉';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return '♊';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return '♋';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return '♌';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return '♍';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return '♎';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return '♏';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return '♐';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return '♑';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return '♒';
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return '♓';
  return '';
}

// Display zodiac
function displayZodiac() {
  const birthDate = document.getElementById('partnerBirthDate').value;
  const zodiacIcon = document.getElementById('partnerZodiacIcon');
  zodiacIcon.textContent = getZodiacSign(birthDate);
}

// Save to history
function saveToHistory(type, forecast) {
  const history = JSON.parse(localStorage.getItem('forecastHistory') || '[]');
  history.push({ type, forecast, date: new Date().toLocaleString() });
  localStorage.setItem('forecastHistory', JSON.stringify(history));
}

// Load history
function loadHistory() {
  const history = JSON.parse(localStorage.getItem('forecastHistory') || '[]');
  const list = document.getElementById('historyList');
  list.innerHTML = history.length ? '' : '<p>У вас пока нет сохраненных прогнозов</p>';
  history.forEach(item => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `
      <div class="date">${item.date}</div>
      <div class="type">${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</div>
      <div class="forecast">${item.forecast}</div>
    `;
    list.appendChild(div);
  });
}

// Analyze compatibility
function analyzeCompatibility() {
  const message = document.getElementById('compatMessage');
  message.textContent = 'Данная функция в разработке. Приносим свои извинения';
  message.style.display = 'block';
  document.getElementById('compatChart').style.display = 'none';
  setTimeout(() => {
    message.style.display = 'none';
  }, 3000);
}

// Share
function share(platform, type = 'main') {
  const text = type === 'main' 
    ? 'Хочу поделиться с тобой этим астроботом — реально интересно! Прогноз на день, месяц, совместимость и ещё куча всего.\nВот ссылка: @astropred_bot'
    : 'Прогноз от AstroPred';
  const url = platform === 'telegram' 
    ? `https://t.me/share/url?url=${encodeURIComponent(text)}`
    : `https://t.me/share/url?url=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

// Toggle theme
function toggleTheme() {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
}

// Start app
window.onload = loadComponents;