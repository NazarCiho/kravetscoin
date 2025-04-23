try{
    const balanceElement = document.getElementById('balance');
    const errorMessage = document.getElementById('timeerror');
    const trans_bg = document.getElementById('trans-bg');
    const close_button = document.getElementById('close_id');
    const tab1 = document.getElementById('tab1');
    const tab2 = document.getElementById('tab2');
    const tab3 = document.getElementById('tab3');
    const tablinks = document.getElementsByClassName("tablinks");

    const telegram = window.Telegram.WebApp;

    // Обробник натискання кнопки
    document.getElementById("sendButton").addEventListener("click", () => {
        const data = {
            action: "send_data",
            value: "Hello, bot!",
        };
            balanceElement.innerText = "DATA SETED"
        // Відправляє дані боту
        telegram.sendData(JSON.stringify(data));
    });

    // Відправлення даних у Mini App
    telegram.sendData(JSON.stringify({ action: "send_data", value: "example" }));

    tablinks[0].className += " tablinks-active";
    tablinks[0].querySelector('img').src = "https://i.ibb.co/rZwwBgy/image-1.png";
    // Відновлюємо баланс з localStorage, якщо він є
    let balance = parseInt(localStorage.getItem('balance')) || 0;
    balanceElement.innerText = balance.toLocaleString()

    telegram.setBottomBarColor('#380040')
    telegram.setBackgroundColor('#380040')
    telegram.setHeaderColor('#380040')


    let lastClickTime = 0;
    let clickCount = 0;


    document.querySelector('.but1').addEventListener('click', () => {
        trans_bg.style.display = 'block';
        close_button.style.display = 'block';
        tab1.style.display = 'block';
    });
    document.querySelector('.but2').addEventListener('click', () => {
        trans_bg.style.display = 'block';
        close_button.style.display = 'block';
        tab2.style.display = 'block';
    });
    document.querySelector('.but3').addEventListener('click', () => {
        trans_bg.style.display = 'block';
        close_button.style.display = 'block';
        tab3.style.display = 'block';
    });
    document.querySelector('.close').addEventListener('click', () => {
        trans_bg.style.display = 'none';
        close_button.style.display = 'none';
        tab1.style.display = 'none';
        tab2.style.display = 'none';
        tab3.style.display = 'none';
    });
    console.log(tablinks)
    function openTab(evt, tabName) {
        // Приховуємо всі вкладки
        var tabcontent = document.getElementsByClassName("tab");
        for (var i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }

        // Скидаємо активний стан всіх вкладок
        for (var i = 0; i < tablinks.length; i++) {
            const currentTab = tablinks[i]; // Зберігаємо посилання
            currentTab.className = currentTab.className.replace(" tablinks-active", "");

            // Плавна зміна іконки
            const img = currentTab.querySelector('img');
            setTimeout(() => {
                img.src = currentTab.dataset.defaultIcon;
                img.style.opacity = '1';
            }, 150);
        }
        // Обробляємо особливий випадок для tab1
        if(tabName == "tab1") {
            for (var i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.display = "none";
                trans_bg.style.display = 'none';
            }
        } else {
            document.getElementById(tabName).style.display = "block";
            trans_bg.style.display = 'block';
        }

        // Активуємо поточну вкладку
        evt.currentTarget.className += " tablinks-active";

        // Змінюємо іконку на активну з анімацією
        const img = evt.currentTarget.querySelector('img');
        const activeIcon = evt.currentTarget.dataset.activeIcon;
        img.style.opacity = '0';
        setTimeout(() => {
            img.src = activeIcon;
            img.style.opacity = '1';
        }, 150);
    }
    // Додаємо обробник події кліку на кнопку
    document.querySelector('.button-click').addEventListener('click', (event) => {
        const currentTime = Date.now();

        // Якщо різниця між поточним і останнім кліком менша за 100 мс
        if (currentTime - lastClickTime < 100) {
            clickCount++;
        } else {
            clickCount = 1; // Оновлюємо лічильник кліків, якщо пройшло більше 100 мс
        }

        // Оновлюємо останній час кліку
        lastClickTime = currentTime;

        // Якщо більше 20 кліків за короткий час
        if (clickCount > 20) {
            errorMessage.style.display = 'block'; // Показуємо повідомлення про помилку
            setTimeout(() => {
                errorMessage.style.display = 'none'; // Ховаємо повідомлення через 4 секунди
            }, 4000);
            return; // Зупиняємо подальшу обробку кліку
        }

        // Додаємо 1 до балансу
        balance += 1;
        balanceElement.innerText = balance.toLocaleString(); // Оновлюємо відображення з комами

        // Зберігаємо новий баланс в localStorage
        localStorage.setItem('balance', balance);

        // Додаємо одиничку в місці натискання
        const unit = document.createElement('div');
        unit.classList.add('unit');
        unit.innerText = '+1';

        // Змінюємо позицію, щоб одиничка з'являлася вище
        unit.style.left = `${event.clientX}px`;
        unit.style.top = `${event.clientY - 30}px`; // 30 пікселів вище

        // Додаємо одиничку на сторінку
        document.body.appendChild(unit);

        // Анімація зникнення
        setTimeout(() => {
            unit.style.opacity = '0';
            unit.style.transform = 'translateY(-20px)'; // Можна додати підйом
        }, 50);

        // Видаляємо одиничку через 500 мс
        setTimeout(() => {
            unit.remove();
        }, 550);
    });

    // Ініціалізація Telegram Web App
    const tg = telegram;

    // Отримання даних про користувача
    const initDataUnsafe = tg.initDataUnsafe;
    const user = initDataUnsafe.user;

    // Оновлення даних на сторінці
    if (user) {
        document.getElementById('user-name').textContent = `${user.first_name} ${user.last_name || ''}`;
        document.getElementById('user-photo').src = user.photo_url || "https://via.placeholder.com/100";
    } else {
        document.getElementById('user-name').textContent = "Користувач не авторизований";
    }

    // Налаштування теми
    tg.themeParams && (document.body.style.backgroundColor = tg.themeParams.bg_color || '#fff');

    const playPauseButtons = document.querySelectorAll('.play-pause');
    const audios = document.querySelectorAll('.audio');
    const progressBars = document.querySelectorAll('.progress');

    playPauseButtons.forEach((button, index) => {
        const audio = audios[index];
        const progressBar = progressBars[index];
        const statusBar = progressBar.parentElement;
        const img = button.querySelector('img');

        button.addEventListener('click', () => {
            // Зупиняємо всі інші аудіо
            audios.forEach((otherAudio, otherIndex) => {
                if (otherIndex !== index && !otherAudio.paused) {
                    otherAudio.pause();
                    playPauseButtons[otherIndex].querySelector('img').src = 'https://cdn-icons-png.flaticon.com/512/0/375.png';
                }
            });

            if (audio.paused) {
                audio.play();
                img.src = 'https://cdn-icons-png.flaticon.com/512/16/16427.png';
            } else {
                audio.pause();
                img.src = 'https://cdn-icons-png.flaticon.com/512/0/375.png';
            }
        });

        // Додаємо можливість перемотування
        statusBar.addEventListener('click', (e) => {
            const rect = statusBar.getBoundingClientRect();
            const clickPosition = (e.clientX - rect.left) / rect.width;
            audio.currentTime = clickPosition * audio.duration;
        });

        // Оновлюємо прогрес бар
        audio.addEventListener('timeupdate', () => {
            const percentage = (audio.currentTime / audio.duration) * 100;
            progressBar.style.width = `${percentage}%`;
        });

        // Додаємо відображення часу
        const timeDisplay = document.createElement('div');
        timeDisplay.className = 'time-display';
        statusBar.appendChild(timeDisplay);

        audio.addEventListener('timeupdate', () => {
            const currentMinutes = Math.floor(audio.currentTime / 60);
            const currentSeconds = Math.floor(audio.currentTime % 60);
            const durationMinutes = Math.floor(audio.duration / 60);
            const durationSeconds = Math.floor(audio.duration % 60);

            timeDisplay.textContent = `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')} / ${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;
        });
    });


} catch (error) {
    // Обробка помилки
    alert(error.message);}
