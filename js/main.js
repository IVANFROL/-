document.addEventListener('DOMContentLoaded', function () {
  // Проверяем, загружен ли Materialize
  if (typeof M === 'undefined') {
    console.error('Materialize.js not loaded');
    return;
  }

  var sidenav = document.querySelectorAll('.sidenav');
  var instances_sidenav = M.Sidenav.init(sidenav);

  var modal = document.querySelectorAll('.modal');
  var instances_modal = M.Modal.init(modal);
  
  // Отключаем Materialbox и используем только наше кастомное решение
  var materialbox = document.querySelectorAll('.materialboxed');
  if (materialbox.length > 0) {
    // Проверяем, не мобильное ли устройство
    var isMobile = window.innerWidth <= 768;
    
    if (!isMobile) {
      materialbox.forEach(function(img) {
        img.style.cursor = 'pointer';
        img.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          createImageModal(img.src, img.alt);
        });
      });
      console.log('Custom image modal initialized for', materialbox.length, 'images (desktop only)');
    } else {
      // На мобильных устройствах убираем курсор и клики
      materialbox.forEach(function(img) {
        img.style.cursor = 'default';
        img.style.pointerEvents = 'none';
      });
      console.log('Image modal disabled on mobile for', materialbox.length, 'images');
    }
  }
  
  // Инициализация квиз-формы
  initQuiz();
  
  // Инициализация мобильной карусели отзывов
  initMobileReviewsCarousel();
  
  // Дополнительная проверка через 1 секунду
  setTimeout(function() {
    var materialbox = document.querySelectorAll('.materialboxed');
    if (materialbox.length > 0) {
      var isMobile = window.innerWidth <= 768;
      
      materialbox.forEach(function(img) {
        // Удаляем все существующие обработчики Materialbox
        img.removeAttribute('data-caption');
        
        if (!isMobile) {
          img.style.cursor = 'pointer';
          img.style.pointerEvents = 'auto';
          
          // Добавляем наш обработчик, если его еще нет
          if (!img.hasAttribute('data-custom-modal')) {
            img.addEventListener('click', function(e) {
              e.preventDefault();
              e.stopPropagation();
              createImageModal(img.src, img.alt);
            });
            img.setAttribute('data-custom-modal', 'true');
          }
        } else {
          img.style.cursor = 'default';
          img.style.pointerEvents = 'none';
        }
      });
      console.log('Custom modal handlers verified for', materialbox.length, 'images (mobile:', isMobile, ')');
    }
  }, 1000);
  
  // Обработчик изменения размера окна
  window.addEventListener('resize', function() {
    var materialbox = document.querySelectorAll('.materialboxed');
    if (materialbox.length > 0) {
      var isMobile = window.innerWidth <= 768;
      
      materialbox.forEach(function(img) {
        if (!isMobile) {
          img.style.cursor = 'pointer';
          img.style.pointerEvents = 'auto';
        } else {
          img.style.cursor = 'default';
          img.style.pointerEvents = 'none';
        }
      });
    }
  });
});

// Функция для создания модального окна с изображением
function createImageModal(imageSrc, imageAlt) {
  // Удаляем все существующие модальные окна
  var existingModals = document.querySelectorAll('#imageModal, .image-modal-overlay');
  existingModals.forEach(function(modal) {
    modal.remove();
  });
  
  // Блокируем прокрутку страницы сразу
  document.body.style.overflow = 'hidden';
  
  // Создаем модальное окно
  var modal = document.createElement('div');
  modal.id = 'imageModal';
  modal.className = 'modal image-modal-overlay';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.8);
    z-index: 999999;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  `;
  
  // Создаем контейнер для изображения
  var imageContainer = document.createElement('div');
  imageContainer.style.cssText = `
    position: relative;
    max-width: 98%;
    max-height: 98%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: default;
  `;
  
  // Создаем изображение
  var img = document.createElement('img');
  img.src = imageSrc;
  img.alt = imageAlt;
  img.style.cssText = `
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    cursor: default;
  `;
  
  // Создаем кнопку закрытия
  var closeBtn = document.createElement('button');
  closeBtn.innerHTML = '×';
  closeBtn.style.cssText = `
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 24px;
    font-weight: bold;
    cursor: pointer;
    color: #333;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease;
  `;
  
  // Добавляем hover эффект для кнопки закрытия
  closeBtn.addEventListener('mouseenter', function() {
    this.style.background = 'rgba(255, 255, 255, 1)';
    this.style.color = '#000';
    this.style.transform = 'scale(1.1)';
  });
  
  closeBtn.addEventListener('mouseleave', function() {
    this.style.background = 'rgba(255, 255, 255, 0.9)';
    this.style.color = '#333';
    this.style.transform = 'scale(1)';
  });
  
  // Добавляем обработчики событий
  closeBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    closeModal();
  });
  
  // Клик по фону закрывает модальное окно
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  // Клик по изображению не закрывает модальное окно
  img.addEventListener('click', function(e) {
    e.stopPropagation();
  });
  
  imageContainer.addEventListener('click', function(e) {
    e.stopPropagation();
  });
  
  // Функция закрытия модального окна
  function closeModal() {
    modal.remove();
    document.body.style.overflow = 'auto';
    // Удаляем обработчик клавиши Escape
    document.removeEventListener('keydown', handleEscape);
  }
  
  // Обработчик клавиши Escape
  function handleEscape(e) {
    if (e.key === 'Escape') {
      closeModal();
    }
  }
  
  // Добавляем обработчик клавиши Escape
  document.addEventListener('keydown', handleEscape);
  
  // Собираем модальное окно
  imageContainer.appendChild(img);
  imageContainer.appendChild(closeBtn);
  modal.appendChild(imageContainer);
  document.body.appendChild(modal);
  
  // Показываем модальное окно
  modal.style.display = 'flex';
}

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = '8260134458:AAFHG4OAhkNVtHI8OFo-9hLIjcnPzB0CUn4';
const TELEGRAM_ADMINS = [
    '6491802621', // Илья
    '1088010167'  // Андрей
];

// Квиз-форма
function initQuiz() {
    const quizForm = document.getElementById('constructionQuiz');
    const steps = document.querySelectorAll('.quiz-step');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const submitBtn = document.getElementById('submitBtn');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const quizResult = document.getElementById('quizResult');
    
    let currentStep = 1;
    const totalSteps = steps.length;
    
    // Маска для телефона
    const phoneInput = document.querySelector('input[name="phone"]');
    if (phoneInput) {
        phoneInput.addEventListener('input', formatPhone);
    }
    
    // Обработчик кнопки "Далее"
    nextBtn.addEventListener('click', function() {
        if (validateCurrentStep()) {
            if (currentStep < totalSteps) {
                currentStep++;
                showStep(currentStep);
                updateProgress();
                updateButtons();
            }
        }
    });
    
    // Обработчик кнопки "Назад"
    prevBtn.addEventListener('click', function() {
        if (currentStep > 1) {
            currentStep--;
            showStep(currentStep);
            updateProgress();
            updateButtons();
        }
    });
    
    // Обработчик отправки формы
    quizForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateCurrentStep()) {
            submitQuiz();
        }
    });
    
    // Обработчик выбора опций
    const options = document.querySelectorAll('.quiz-option input');
    options.forEach(option => {
        option.addEventListener('change', function() {
            // Автоматически переходим к следующему шагу при выборе опции
            if (this.type === 'radio' && this.checked) {
                setTimeout(() => {
                    if (currentStep < totalSteps) {
                        currentStep++;
                        showStep(currentStep);
                        updateProgress();
                        updateButtons();
                    }
                }, 500);
            }
        });
    });
    
    function showStep(step) {
        steps.forEach((stepEl, index) => {
            stepEl.classList.toggle('active', index + 1 === step);
        });
    }
    
    function updateProgress() {
        const progress = (currentStep / totalSteps) * 100;
        progressFill.style.width = progress + '%';
        progressText.textContent = `${currentStep} из ${totalSteps}`;
    }
    
    function updateButtons() {
        prevBtn.style.display = currentStep > 1 ? 'block' : 'none';
        nextBtn.style.display = currentStep < totalSteps ? 'block' : 'none';
        submitBtn.style.display = currentStep === totalSteps ? 'block' : 'none';
    }
    
    function validateCurrentStep() {
        const currentStepEl = document.querySelector(`.quiz-step[data-step="${currentStep}"]`);
        const requiredInputs = currentStepEl.querySelectorAll('input[required]');
        
        for (let input of requiredInputs) {
            if (input.type === 'radio' || input.type === 'checkbox') {
                const name = input.name;
                const checked = currentStepEl.querySelector(`input[name="${name}"]:checked`);
                if (!checked) {
                    showError('Пожалуйста, выберите один из вариантов');
                    return false;
                }
            } else if (!input.value.trim()) {
                showError('Пожалуйста, заполните все обязательные поля');
                return false;
            }
        }
        
        return true;
    }
    
    function showError(message) {
        // Создаем уведомление об ошибке
        const errorDiv = document.createElement('div');
        errorDiv.className = 'quiz-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 10000;
            font-family: 'Open Sans', sans-serif;
            font-weight: 600;
            box-shadow: 0 5px 15px rgba(220, 53, 69, 0.3);
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }
    
    function formatPhone(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            if (value[0] !== '7') {
                value = '7' + value;
            }
            if (value.length > 1) {
                value = value.substring(0, 11);
            }
            
            let formatted = '+7';
            if (value.length > 1) {
                formatted += ' (' + value.substring(1, 4);
            }
            if (value.length >= 5) {
                formatted += ') ' + value.substring(4, 7);
            }
            if (value.length >= 8) {
                formatted += '-' + value.substring(7, 9);
            }
            if (value.length >= 10) {
                formatted += '-' + value.substring(9, 11);
            }
            
            e.target.value = formatted;
        }
    }
    
    function submitQuiz() {
        const formData = new FormData(quizForm);
        const data = {};
        
        // Собираем данные формы
        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }
        
        // Формируем сообщение для Telegram
        const message = formatTelegramMessage(data);
        
        // Отправляем в Telegram
        sendToTelegram(message);
        
        // Показываем результат
        quizForm.style.display = 'none';
        quizResult.style.display = 'block';
        
        // Прокручиваем к результату
        quizResult.scrollIntoView({ behavior: 'smooth' });
    }
    
    function formatTelegramMessage(data) {
        const serviceTypes = {
            'apartment_repair': 'Ремонт квартиры',
            'house_repair': 'Ремонт дома',
            'office_repair': 'Ремонт офиса/коммерческого помещения',
            'construction': 'Строительство с нуля',
            'other': 'Другое'
        };
        
        const workTypes = {
            'rough_repair': 'Черновой ремонт',
            'cosmetic_repair': 'Косметический ремонт',
            'capital_repair': 'Капитальный ремонт',
            'turnkey_finishing': 'Отделка под ключ'
        };
        
        const areas = {
            'up_to_50': 'до 50 м²',
            '50_100': '50–100 м²',
            '100_200': '100–200 м²',
            'over_200': 'более 200 м²'
        };
        
        const timelines = {
            'urgent': 'Срочно (в течение месяца)',
            '3_months': 'В ближайшие 3 месяца',
            '3_6_months': 'Через 3–6 месяцев',
            'considering': 'Пока рассматриваю варианты'
        };
        
        const budgets = {
            'up_to_300k': 'до 300 000 ₽',
            '300k_700k': '300 000–700 000 ₽',
            '700k_1.5m': '700 000–1 500 000 ₽',
            'over_1.5m': 'Более 1 500 000 ₽',
            'not_sure': 'Пока затрудняюсь ответить'
        };
        
        let message = `🏗️ <b>Новая заявка с сайта Happy Build</b>\n\n`;
        message += `👤 <b>Клиент:</b> ${data.name || 'Не указано'}\n`;
        message += `📞 <b>Телефон:</b> ${data.phone || 'Не указано'}\n`;
        message += `📧 <b>Email:</b> ${data.email || 'Не указано'}\n\n`;
        
        message += `🔧 <b>Детали заявки:</b>\n`;
        message += `• <b>Услуга:</b> ${serviceTypes[data.service_type] || 'Не указано'}\n`;
        message += `• <b>Тип работ:</b> ${workTypes[data.work_type] || 'Не указано'}\n`;
        message += `• <b>Площадь:</b> ${areas[data.area] || 'Не указано'}\n`;
        message += `• <b>Сроки:</b> ${timelines[data.timeline] || 'Не указано'}\n`;
        message += `• <b>Бюджет:</b> ${budgets[data.budget] || 'Не указано'}\n\n`;
        
        if (data.materials_help) {
            message += `✅ <b>Нужна помощь с материалами</b>\n`;
        }
        if (data.free_measurement) {
            message += `✅ <b>Хочет бесплатный выезд замерщика</b>\n`;
        }
        
        if (data.comments) {
            message += `\n💬 <b>Комментарии:</b>\n${data.comments}\n`;
        }
        
        message += `\n🕐 <b>Время заявки:</b> ${new Date().toLocaleString('ru-RU')}`;
        
        return message;
    }
    
    function sendToTelegram(message) {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        
        // Отправляем сообщение всем админам
        const sendPromises = TELEGRAM_ADMINS.map(adminId => {
            return fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: adminId,
                    text: message,
                    parse_mode: 'HTML'
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log(`Сообщение отправлено админу ${adminId}:`, data);
                return data;
            })
            .catch(error => {
                console.error(`Ошибка отправки админу ${adminId}:`, error);
                return error;
            });
        });
        
        // Ждем отправки всем админам
        Promise.all(sendPromises)
            .then(results => {
                console.log('Все сообщения отправлены:', results);
            })
            .catch(error => {
                console.error('Ошибка при отправке сообщений:', error);
            });
    }
}

// Мобильная карусель отзывов
function initMobileReviewsCarousel() {
    const track = document.getElementById('reviewsTrackMobile');
    const dots = document.querySelectorAll('.reviews__dot-mobile');
    const prevBtn = document.getElementById('reviewsPrevMobile');
    const nextBtn = document.getElementById('reviewsNextMobile');
    
    if (!track || dots.length === 0) return;
    
    let currentSlide = 0;
    const totalSlides = dots.length;
    let autoSlideInterval;
    
    function updateSlide() {
        const translateX = -currentSlide * 100;
        track.style.transform = `translateX(${translateX}%)`;
        console.log('Current slide:', currentSlide, 'TranslateX:', translateX + '%');
        
        // Обновляем активную точку
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateSlide();
    }
    
    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateSlide();
    }
    
    function goToSlide(slideIndex) {
        currentSlide = slideIndex;
        updateSlide();
    }
    
    function startAutoSlide() {
        autoSlideInterval = setInterval(nextSlide, 4000); // Меняем каждые 4 секунды
    }
    
    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
        }
    }
    
    // Обработчики для стрелочек
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            stopAutoSlide();
            startAutoSlide(); // Перезапускаем автопрокрутку
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            stopAutoSlide();
            startAutoSlide(); // Перезапускаем автопрокрутку
        });
    }
    
    // Обработчики для точек
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToSlide(index);
            stopAutoSlide();
            startAutoSlide(); // Перезапускаем автопрокрутку
        });
    });
    
    // Останавливаем автопрокрутку при наведении
    track.addEventListener('mouseenter', stopAutoSlide);
    track.addEventListener('mouseleave', startAutoSlide);
    
    // Инициализация
    console.log('Initializing mobile carousel with', totalSlides, 'slides');
    updateSlide();
    
    // Запускаем автопрокрутку
    startAutoSlide();
    
    // Останавливаем автопрокрутку когда вкладка неактивна
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoSlide();
        } else {
            startAutoSlide();
        }
    });
}

