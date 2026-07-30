(function () {
    'use strict';

    // ——— Налаштування ———
    const CONFIG = {
        botUsername: 'KravetsCoin_bot',
        referralBonus: 500,
        newUserBonus: 250,
        energyRegenPerSec: 1,
        boostMultiplier: 2,
        boostDurationMs: 30000,
        boostUnlockLevel: 3,
        maxClicksPer100ms: 8,
    };

    const LEVELS = [
        { level: 1, xpRequired: 0, rank: 'Новачок' },
        { level: 2, xpRequired: 1000, rank: 'Тапер' },
        { level: 3, xpRequired: 3500, rank: 'Фармер' },
        { level: 4, xpRequired: 8000, rank: 'Майнер' },
        { level: 5, xpRequired: 15000, rank: 'Кит' },
        { level: 6, xpRequired: 30000, rank: 'Бос' },
        { level: 7, xpRequired: 60000, rank: 'Легенда' },
        { level: 8, xpRequired: 120000, rank: 'Імператор Vanya' },
    ];

    const UPGRADES = [
        {
            id: 'tap',
            name: 'Сила тапу',
            desc: '+1 монета за клік',
            icon: '👆',
            baseCost: 50,
            costMult: 1.55,
            maxLevel: 50,
        },
        {
            id: 'auto',
            name: 'Авто-майнер',
            desc: '+1 монета/сек пасивно',
            icon: '⚙️',
            baseCost: 200,
            costMult: 1.7,
            maxLevel: 30,
        },
        {
            id: 'energy',
            name: 'Макс. енергія',
            desc: '+100 до ліміту енергії',
            icon: '⚡',
            baseCost: 150,
            costMult: 1.45,
            maxLevel: 20,
        },
        {
            id: 'crit',
            name: 'Критичний тап',
            desc: '+2% шанс x3 винагороди',
            icon: '💥',
            baseCost: 300,
            costMult: 1.65,
            maxLevel: 25,
        },
        {
            id: 'regen',
            name: 'Реген енергії',
            desc: '+0.5 відновлення/сек',
            icon: '🔋',
            baseCost: 250,
            costMult: 1.5,
            maxLevel: 15,
        },
    ];

    const TASKS = [
        {
            id: 'tap100',
            title: 'Перші 100 тапів',
            desc: 'Натисни монету 100 разів',
            reward: 200,
            xp: 100,
            check: (s) => s.totalTaps >= 100,
        },
        {
            id: 'tap1000',
            title: 'Тап-машина',
            desc: 'Зроби 1000 тапів',
            reward: 1500,
            xp: 500,
            check: (s) => s.totalTaps >= 1000,
        },
        {
            id: 'level3',
            title: 'Досягни рівня 3',
            desc: 'Прокачайся до рівня 3',
            reward: 800,
            xp: 300,
            check: (s) => s.level >= 3,
        },
        {
            id: 'level5',
            title: 'Досягни рівня 5',
            desc: 'Стань справжнім китом',
            reward: 3000,
            xp: 1000,
            check: (s) => s.level >= 5,
        },
        {
            id: 'buyUpgrade',
            title: 'Перша прокачка',
            desc: 'Купи будь-яке покращення',
            reward: 150,
            xp: 50,
            check: (s) => s.totalUpgrades >= 1,
        },
        {
            id: 'invite1',
            title: 'Запроси друга',
            desc: '1 друг за реферальним посиланням',
            reward: 500,
            xp: 200,
            check: (s) => s.referralCount >= 1,
        },
        {
            id: 'balance10k',
            title: '10 000 $VANYA',
            desc: 'Накопич 10 000 монет загалом',
            reward: 1000,
            xp: 400,
            check: (s) => s.totalEarned >= 10000,
        },
        {
            id: 'daily3',
            title: 'Відданий гравець',
            desc: 'Забери щоденний бонус 3 рази',
            reward: 600,
            xp: 250,
            check: (s) => s.dailyClaims >= 3,
        },
    ];

    const DAILY_REWARDS = [100, 200, 350, 500, 750, 1000, 2000];
    const DEFAULT_TAP_IMAGE = 'https://i.ibb.co/NFMdyzb/Ivan-coin-button.png';

    const RARITY_LABELS = {
        common: 'Звичайний',
        rare: 'Рідкісний',
        epic: 'Епічний',
        legendary: 'Легендарний',
    };

    const CHARACTERS = [
        { id: 'default', name: 'Vanya Classic', image: DEFAULT_TAP_IMAGE, price: 0, rarity: 'common' },
        { id: 'street', name: 'Вуличний стиль', image: 'https://i.ibb.co/0yZfFC0T/Gemini-Generated-Image-8t23ap8t23ap8t23.png', price: 600, rarity: 'common' },
        { id: 'neon', name: 'Неоновий воїн', image: 'https://i.ibb.co/8g7pfBc7/Gemini-Generated-Image-okjec2okjec2okje.png', price: 1200, rarity: 'rare' },
        { id: 'cyber', name: 'Кібер-тапер', image: 'https://i.ibb.co/LXqjTJDb/Gemini-Generated-Image-daw1v6daw1v6daw1.png', price: 2200, rarity: 'rare' },
        { id: 'gold', name: 'Золотий бос', image: 'https://i.ibb.co/jchZBQS/Gemini-Generated-Image-6ktip76ktip76kti.png', price: 4500, rarity: 'epic' },
        { id: 'phantom', name: 'Фантом', image: 'https://i.ibb.co/7drLTLDn/Gemini-Generated-Image-g9agf0g9agf0g9ag.png', price: 7500, rarity: 'epic' },
        { id: 'cosmic', name: 'Космічний Vanya', image: 'https://i.ibb.co/5W2cRTG0/Gemini-Generated-Image-74ftc374ftc374ft.png', price: 12000, rarity: 'legendary' },
        { id: 'emperor', name: 'Імператор монет', image: 'https://i.ibb.co/1JdRSy0w/Gemini-Generated-Image-ol0zlool0zlool0z.png', price: 25000, rarity: 'legendary' },
    ];

    const telegram = window.Telegram?.WebApp;
    if (telegram) {
        telegram.ready();
        telegram.expand();
        telegram.setHeaderColor('#0d0b14');
        telegram.setBackgroundColor('#12101c');
    }

    const user = telegram?.initDataUnsafe?.user;
    const userId = user?.id ? String(user.id) : ('guest_' + Math.random().toString(36).substr(2, 6));

    // Початковий стан гри
    const state = {
        balance: 0,
        xp: 0,
        totalTaps: 0,
        totalEarned: 0,
        totalUpgrades: 0,
        referralCount: 0,
        dailyClaims: 0,
        dailyStreak: 0,
        lastDailyClaim: null,
        completedTasks: [],
        upgradeLevels: {},
        energy: 500,
        maxEnergy: 500,
        energyRegen: CONFIG.energyRegenPerSec,
        boostActiveUntil: 0,
        referredBy: null,
        referralProcessed: false,
        ownedCharacters: ['default'],
        activeCharacter: 'default',
        _lastLevel: 1
    };

    UPGRADES.forEach((u) => {
        state.upgradeLevels[u.id] = 0;
    });

    let lastClickTime = 0;
    let clickBurst = 0;
    let boostTimer = null;
    let pendingCharacterId = null;

    const $ = (id) => document.getElementById(id);

    const els = {
        balance: $('balance'),
        perTap: $('per-tap'),
        levelNum: $('level-num'),
        levelXpText: $('level-xp-text'),
        levelProgress: $('level-progress'),
        energyFill: $('energy-fill'),
        energyText: $('energy-text'),
        userName: $('user-name'),
        userPhoto: $('user-photo'),
        userRank: $('user-rank'),
        tasksList: $('tasks-list'),
        upgradesList: $('upgrades-list'),
        ranksList: $('ranks-list'),
        referralLink: $('referral-link'),
        referralCount: $('referral-count'),
        refBonusText: $('ref-bonus-text'),
        statTaps: $('stat-taps'),
        statEarned: $('stat-earned'),
        statFriends: $('stat-friends'),
        statTasks: $('stat-tasks'),
        walletBalance: $('wallet-balance'),
        walletAuto: $('wallet-auto'),
        walletTap: $('wallet-tap'),
        boostBtn: $('boost-btn'),
        boostLabel: $('boost-label'),
        boostIcon: $('boost-icon'),
        timeerror: $('timeerror'),
        panelOverlay: $('panel-overlay'),
        closeBtn: $('close_id'),
        toast: $('toast'),
        headerBalance: $('header-balance'),
        tapSkin: $('tap-skin'),
        charactersGrid: $('characters-grid'),
        skinInventory: $('skin-inventory'),
        characterModal: $('character-modal'),
        characterModalPreview: $('character-modal-preview'),
        characterModalTitle: $('character-modal-title'),
        characterModalRarity: $('character-modal-rarity'),
        characterModalPrice: $('character-modal-price'),
        characterModalBuy: $('character-modal-buy'),
        characterModalCancel: $('character-modal-cancel'),
        characterModalClose: $('character-modal-close'),
    };

    function getLevelInfo() {
        let current = LEVELS[0];
        let next = LEVELS[1] || null;
        for (let i = LEVELS.length - 1; i >= 0; i--) {
            if (state.xp >= LEVELS[i].xpRequired) {
                current = LEVELS[i];
                next = LEVELS[i + 1] || null;
                break;
            }
        }
        return { current, next };
    }

    function getTapPower() {
        const base = 1 + (state.upgradeLevels.tap || 0);
        const mult = isBoostActive() ? CONFIG.boostMultiplier : 1;
        return base * mult;
    }

    function getAutoIncome() {
        return state.upgradeLevels.auto || 0;
    }

    function getCritChance() {
        return Math.min(0.5, (state.upgradeLevels.crit || 0) * 0.02);
    }

    function isBoostActive() {
        return Date.now() < state.boostActiveUntil;
    }

    // Збереження всього стану у Firebase
    function persist() {
        if (window.cloudSaveAll) {
            window.cloudSaveAll(userId, state);
        }
    }

    function formatNum(n) {
        return Math.floor(n || 0).toLocaleString('uk-UA');
    }

    function getCharacterById(id) {
        return CHARACTERS.find((c) => c.id === id);
    }

    function isCharacterOwned(id) {
        return state.ownedCharacters.includes(id);
    }

    function getActiveCharacter() {
        return getCharacterById(state.activeCharacter) || CHARACTERS[0];
    }

    function applyTapSkin() {
        const ch = getActiveCharacter();
        if (els.tapSkin && ch) {
            els.tapSkin.src = ch.image;
            els.tapSkin.alt = ch.name;
        }
    }

    function equipCharacter(id) {
        if (!isCharacterOwned(id)) {
            showToast('Спочатку купи цього персонажа');
            return;
        }
        state.activeCharacter = id;
        persist();
        applyTapSkin();
        renderCharacters();
        renderSkinInventory();
        const ch = getCharacterById(id);
        showToast(`🎭 Обрано: ${ch?.name || id}`);
        haptic('medium');
    }

    function openCharacterModal(characterId) {
        const ch = getCharacterById(characterId);
        if (!ch || ch.id === 'default') return;

        pendingCharacterId = characterId;
        els.characterModalPreview.innerHTML = `<img src="${ch.image}" alt="${ch.name}">`;
        els.characterModalTitle.textContent = ch.name;
        els.characterModalRarity.textContent = `${RARITY_LABELS[ch.rarity] || ch.rarity}`;
        els.characterModalRarity.className = `character-modal-rarity rarity-${ch.rarity}`;
        els.characterModalPrice.textContent = `Ціна: ${formatNum(ch.price)} $VANYA`;
        els.characterModalBuy.disabled = state.balance < ch.price;
        els.characterModal.setAttribute('aria-hidden', 'false');
        els.characterModal.classList.add('is-open');
    }

    function closeCharacterModal() {
        pendingCharacterId = null;
        els.characterModal.classList.remove('is-open');
        els.characterModal.setAttribute('aria-hidden', 'true');
    }

    function confirmBuyCharacter() {
        if (!pendingCharacterId) return;
        const ch = getCharacterById(pendingCharacterId);
        if (!ch) return;

        if (isCharacterOwned(ch.id)) {
            closeCharacterModal();
            equipCharacter(ch.id);
            return;
        }

        if (state.balance < ch.price) {
            telegram?.HapticFeedback?.notificationOccurred?.('error');
            showToast('Недостатньо монет');
            return;
        }

        state.balance -= ch.price;
        if (!state.ownedCharacters.includes(ch.id)) {
            state.ownedCharacters.push(ch.id);
        }
        state.activeCharacter = ch.id;
        persist();
        applyTapSkin();
        closeCharacterModal();
        updateUI();
        renderCharacters();
        renderSkinInventory();
        showToast(`🎭 Куплено: ${ch.name}!`);
        telegram?.HapticFeedback?.notificationOccurred?.('success');
        haptic('heavy');
    }

    function onCharacterCardClick(characterId) {
        const ch = getCharacterById(characterId);
        if (!ch) return;

        if (isCharacterOwned(ch.id)) {
            equipCharacter(ch.id);
            return;
        }

        openCharacterModal(characterId);
    }

    function renderSkinInventory() {
        if (!els.skinInventory) return;

        const owned = state.ownedCharacters
            .map((id) => getCharacterById(id))
            .filter(Boolean);

        els.skinInventory.innerHTML = owned.map((ch) => {
            const active = state.activeCharacter === ch.id;
            return `
                <button type="button" class="skin-inv-item ${active ? 'is-active' : ''}" data-skin="${ch.id}">
                    <img src="${ch.image}" alt="${ch.name}">
                    <span class="skin-inv-name">${ch.name}</span>
                    ${active ? '<span class="skin-inv-badge">Обрано</span>' : ''}
                </button>`;
        }).join('');

        els.skinInventory.querySelectorAll('[data-skin]').forEach((btn) => {
            btn.addEventListener('click', () => equipCharacter(btn.dataset.skin));
        });
    }

    function renderCharacters() {
        if (!els.charactersGrid) return;

        const shopItems = CHARACTERS.filter((c) => c.id !== 'default');

        els.charactersGrid.innerHTML = shopItems.map((ch) => {
            const owned = isCharacterOwned(ch.id);
            const active = state.activeCharacter === ch.id;
            const canAfford = state.balance >= ch.price;

            return `
                <button type="button" class="character-card rarity-${ch.rarity} ${owned ? 'is-owned' : ''} ${active ? 'is-equipped' : ''}"
                    data-character="${ch.id}">
                    <div class="character-card-img">
                        <img src="${ch.image}" alt="${ch.name}" loading="lazy">
                    </div>
                    <span class="character-rarity rarity-${ch.rarity}">${RARITY_LABELS[ch.rarity]}</span>
                    <span class="character-name">${ch.name}</span>
                    <span class="character-price">${owned ? '✓ У інвентарі' : `🪙 ${formatNum(ch.price)}`}</span>
                    ${!owned && !canAfford ? '<span class="character-lock">Недостатньо монет</span>' : ''}
                    ${active ? '<span class="character-equipped">На кнопці</span>' : ''}
                </button>`;
        }).join('');

        els.charactersGrid.querySelectorAll('[data-character]').forEach((card) => {
            card.addEventListener('click', () => onCharacterCardClick(card.dataset.character));
        });

        renderSkinInventory();
    }

    function showToast(msg) {
        els.toast.textContent = msg;
        els.toast.classList.add('toast-visible');
        setTimeout(() => els.toast.classList.remove('toast-visible'), 2200);
    }

    function haptic(type) {
        telegram?.HapticFeedback?.impactOccurred?.(type || 'light');
    }

    function addCoins(amount, source = 'tap') {
        if (amount <= 0) return;
        state.balance += amount;
        state.totalEarned += amount;
        if (source === 'tap') {
            state.xp += Math.max(1, Math.floor(amount * 0.5));
        } else {
            state.xp += Math.floor(amount * 0.3);
        }
        checkLevelUp();
        persist();
        updateUI();
    }

    function checkLevelUp() {
        const { current } = getLevelInfo();
        const prevLevel = state._lastLevel || 1;
        if (current.level > prevLevel) {
            state._lastLevel = current.level;
            showToast(`🎉 Новий рівень ${current.level}: ${current.rank}!`);
            telegram?.HapticFeedback?.notificationOccurred?.('success');
            unlockBoostIfNeeded();
        }
    }

    function unlockBoostIfNeeded() {
        if (!els.boostBtn) return;
        const { current } = getLevelInfo();
        if (current.level >= CONFIG.boostUnlockLevel) {
            els.boostBtn.disabled = false;
            if (els.boostIcon) els.boostIcon.src = 'https://cdn-icons-png.flaticon.com/512/1828/1828817.png';
            if (els.boostLabel) els.boostLabel.textContent = isBoostActive()
                ? `Буст x2 активний!`
                : 'Увімкнути буст x2 (30 сек)';
        }
    }

    function getUpgradeCost(upgrade) {
        const lvl = state.upgradeLevels[upgrade.id] || 0;
        return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMult, lvl));
    }

    function buyUpgrade(upgradeId) {
        const upgrade = UPGRADES.find((u) => u.id === upgradeId);
        if (!upgrade) return;
        const lvl = state.upgradeLevels[upgradeId] || 0;
        if (lvl >= upgrade.maxLevel) {
            showToast('Максимальний рівень!');
            return;
        }
        const cost = getUpgradeCost(upgrade);
        if (state.balance < cost) {
            telegram?.HapticFeedback?.notificationOccurred?.('error');
            showToast('Недостатньо монет');
            return;
        }
        state.balance -= cost;
        state.upgradeLevels[upgradeId] = lvl + 1;
        state.totalUpgrades += 1;

        if (upgradeId === 'energy') {
            state.maxEnergy += 100;
            state.energy = Math.min(state.maxEnergy, state.energy + 100);
        }
        if (upgradeId === 'regen') {
            state.energyRegen += 0.5;
        }

        haptic('medium');
        showToast(`${upgrade.name} → рівень ${lvl + 1}`);
        persist();
        updateUI();
        renderUpgrades();
        checkTasks();
    }

    function completeTask(taskId) {
        if (state.completedTasks.includes(taskId)) return;
        const task = TASKS.find((t) => t.id === taskId);
        if (!task || !task.check(getTaskSnapshot())) return;

        state.completedTasks.push(taskId);
        addCoins(task.reward, 'task');
        state.xp += task.xp;
        showToast(`✅ ${task.title}: +${formatNum(task.reward)}`);
        telegram?.HapticFeedback?.notificationOccurred?.('success');
        persist();
        renderTasks();
        updateUI();
    }

    function getTaskSnapshot() {
        const { current } = getLevelInfo();
        return {
            totalTaps: state.totalTaps,
            level: current.level,
            totalUpgrades: state.totalUpgrades,
            referralCount: state.referralCount,
            totalEarned: state.totalEarned,
            dailyClaims: state.dailyClaims,
        };
    }

    function checkTasks() {
        renderTasks();
    }

    function claimDaily() {
        const today = new Date().toDateString();
        if (state.lastDailyClaim === today) {
            showToast('Щоденний бонус вже забрано сьогодні');
            return;
        }
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (state.lastDailyClaim === yesterday.toDateString()) {
            state.dailyStreak = Math.min(state.dailyStreak + 1, DAILY_REWARDS.length - 1);
        } else if (state.lastDailyClaim !== today) {
            state.dailyStreak = 0;
        }

        const reward = DAILY_REWARDS[state.dailyStreak] || DAILY_REWARDS[DAILY_REWARDS.length - 1];
        state.lastDailyClaim = today;
        state.dailyClaims += 1;
        addCoins(reward, 'daily');
        showToast(`🎁 День ${state.dailyStreak + 1}: +${formatNum(reward)} $VANYA`);
        haptic('heavy');
        persist();
        checkTasks();
    }

    function activateBoost() {
        const { current } = getLevelInfo();
        if (current.level < CONFIG.boostUnlockLevel) {
            showToast(`Відкриється на рівні ${CONFIG.boostUnlockLevel}`);
            return;
        }
        if (isBoostActive()) {
            showToast('Буст вже активний');
            return;
        }
        state.boostActiveUntil = Date.now() + CONFIG.boostDurationMs;
        persist();
        unlockBoostIfNeeded();
        showToast('🔥 Буст x2 на 30 секунд!');
        haptic('heavy');

        if (boostTimer) clearTimeout(boostTimer);
        boostTimer = setTimeout(() => {
            unlockBoostIfNeeded();
            updateUI();
        }, CONFIG.boostDurationMs);
    }

    function getReferralLink() {
        const bot = (CONFIG.botUsername || 'KravetsCoin_bot').replace(/^@/, '');
        const param = `ref_${userId}`;
        return `https://t.me/${bot}?startapp=${param}`;
    }

    function processReferral() {
        if (state.referralProcessed) return;
        const startParam = telegram?.initDataUnsafe?.start_param;
        if (!startParam || !startParam.startsWith('ref_')) return;

        const referrerId = startParam.replace('ref_', '');
        if (referrerId === userId) return;

        state.referredBy = referrerId;
        state.referralProcessed = true;
        addCoins(CONFIG.newUserBonus, 'referral');
        showToast(`🎁 Вітальний бонус: +${CONFIG.newUserBonus} $VANYA`);
        persist();
    }

    function onTap(event) {
        if (state.energy < 1) {
            showToast('⚡ Немає енергії! Зачекай...');
            telegram?.HapticFeedback?.notificationOccurred?.('warning');
            return;
        }

        const now = Date.now();
        if (now - lastClickTime < 100) {
            clickBurst++;
        } else {
            clickBurst = 1;
        }
        lastClickTime = now;

        if (clickBurst > CONFIG.maxClicksPer100ms) {
            els.timeerror.style.display = 'block';
            setTimeout(() => { els.timeerror.style.display = 'none'; }, 5000);
            return;
        }

        let reward = getTapPower();
        if (Math.random() < getCritChance()) {
            reward *= 3;
            haptic('heavy');
        } else {
            haptic('light');
        }

        state.energy -= 1;
        state.totalTaps += 1;
        addCoins(reward, 'tap');

        const unit = document.createElement('div');
        unit.className = 'unit';
        unit.innerText = `+${reward}`;
        const x = event.clientX || window.innerWidth / 2;
        const y = (event.clientY || window.innerHeight / 2) - 30;
        unit.style.left = `${x}px`;
        unit.style.top = `${y}px`;
        document.body.appendChild(unit);
        setTimeout(() => {
            unit.style.opacity = '0';
            unit.style.transform = 'translateY(-40px)';
        }, 50);
        setTimeout(() => unit.remove(), 600);

        checkTasks();
    }

    function renderTasks() {
        const snap = getTaskSnapshot();
        els.tasksList.innerHTML = TASKS.map((task) => {
            const done = state.completedTasks.includes(task.id);
            const ready = !done && task.check(snap);
            const btnClass = done ? 'task-btn done' : ready ? 'task-btn claim' : 'task-btn';
            const btnText = done ? '✓ Готово' : ready ? 'Забрати' : 'В процесі';
            const progress = getTaskProgress(task, snap);
            return `
                <div class="task-card ${done ? 'task-done' : ''}">
                    <div class="task-info">
                        <p class="task-title">${task.title}</p>
                        <p class="task-desc">${task.desc}</p>
                        <p class="task-reward">🪙 ${formatNum(task.reward)} · ⭐ ${task.xp} XP</p>
                        ${progress ? `<div class="task-progress-wrap"><div class="task-progress" style="width:${progress}%"></div></div>` : ''}
                    </div>
                    <button type="button" class="${btnClass}" data-task="${task.id}" ${done || !ready ? 'disabled' : ''}>${btnText}</button>
                </div>`;
        }).join('');

        els.tasksList.querySelectorAll('.task-btn.claim').forEach((btn) => {
            btn.addEventListener('click', () => completeTask(btn.dataset.task));
        });
    }

    function getTaskProgress(task, snap) {
        if (task.id === 'tap100') return Math.min(100, (snap.totalTaps / 100) * 100);
        if (task.id === 'tap1000') return Math.min(100, (snap.totalTaps / 1000) * 100);
        if (task.id === 'level3') return Math.min(100, (snap.level / 3) * 100);
        if (task.id === 'level5') return Math.min(100, (snap.level / 5) * 100);
        if (task.id === 'invite1') return Math.min(100, snap.referralCount * 100);
        if (task.id === 'balance10k') return Math.min(100, (snap.totalEarned / 10000) * 100);
        if (task.id === 'daily3') return Math.min(100, (snap.dailyClaims / 3) * 100);
        if (task.id === 'buyUpgrade') return snap.totalUpgrades >= 1 ? 100 : 0;
        return null;
    }

    function renderUpgrades() {
        els.upgradesList.innerHTML = UPGRADES.map((u) => {
            const lvl = state.upgradeLevels[u.id] || 0;
            const cost = getUpgradeCost(u);
            const maxed = lvl >= u.maxLevel;
            return `
                <div class="upgrade-card">
                    <div class="upgrade-icon">${u.icon}</div>
                    <div class="upgrade-info">
                        <p class="upgrade-name">${u.name} <span class="lvl-tag">Lv.${lvl}</span></p>
                        <p class="upgrade-desc">${u.desc}</p>
                        <p class="upgrade-price">Ціна: <strong>${maxed ? 'MAX' : formatNum(cost)}</strong></p>
                    </div>
                    <button type="button" class="buy-button" data-upgrade="${u.id}" ${maxed ? 'disabled' : ''}>
                        ${maxed ? 'MAX' : 'Купити'}
                    </button>
                </div>`;
        }).join('');

        els.upgradesList.querySelectorAll('[data-upgrade]').forEach((btn) => {
            btn.addEventListener('click', () => buyUpgrade(btn.dataset.upgrade));
        });
    }

    function renderRanks() {
        const { current } = getLevelInfo();
        els.ranksList.innerHTML = LEVELS.map((l) => {
            const reached = state.xp >= l.xpRequired;
            return `<li class="${reached ? 'rank-reached' : ''}">${reached ? '✅' : '🔒'} Lv.${l.level} — ${l.rank}</li>`;
        }).join('');
        els.userRank.textContent = current.rank;
    }

    function updateUI() {
        const { current, next } = getLevelInfo();
        els.balance.textContent = formatNum(state.balance);
        if (els.headerBalance) els.headerBalance.textContent = formatNum(state.balance);
        els.perTap.textContent = `+${getTapPower()} за тап${isBoostActive() ? ' 🔥' : ''}`;
        applyTapSkin();

        els.levelNum.textContent = current.level;
        const xpInLevel = state.xp - current.xpRequired;
        const xpNeeded = next ? next.xpRequired - current.xpRequired : 1;
        const pct = next ? Math.min(100, (xpInLevel / xpNeeded) * 100) : 100;
        els.levelProgress.style.width = `${pct}%`;
        els.levelXpText.textContent = next
            ? `${formatNum(xpInLevel)} / ${formatNum(xpNeeded)} XP`
            : 'MAX рівень';

        const energyPct = (state.energy / state.maxEnergy) * 100;
        els.energyFill.style.width = `${energyPct}%`;
        els.energyText.textContent = `${Math.floor(state.energy)} / ${state.maxEnergy}`;

        els.statTaps.textContent = formatNum(state.totalTaps);
        els.statEarned.textContent = formatNum(state.totalEarned);
        els.statFriends.textContent = formatNum(state.referralCount);
        els.statTasks.textContent = `${state.completedTasks.length}/${TASKS.length}`;

        els.walletBalance.textContent = formatNum(state.balance);
        els.walletAuto.textContent = formatNum(getAutoIncome());
        els.walletTap.textContent = formatNum(getTapPower());

        els.referralCount.textContent = state.referralCount;
        els.refBonusText.textContent = formatNum(CONFIG.referralBonus);
        if (els.referralLink) els.referralLink.value = getReferralLink();

        renderRanks();
        unlockBoostIfNeeded();
    }

    function openTab(tabId, btn) {
        document.querySelectorAll('.tab').forEach((t) => { t.style.display = 'none'; });
        document.querySelectorAll('.tablinks').forEach((link) => {
            link.classList.remove('tablinks-active');
            const img = link.querySelector('img');
            if (img) img.src = link.dataset.defaultIcon;
        });

        if (tabId === 'home') {
            closePanel();
            return;
        }

        const tab = document.getElementById(tabId);
        if (tab) {
            tab.style.display = 'block';
            tab.classList.remove('panel-animate');
            void tab.offsetWidth;
            tab.classList.add('panel-animate');
        }

        els.panelOverlay.classList.add('is-open');
        document.body.classList.add('panel-open');

        if (btn) {
            btn.classList.add('tablinks-active');
            const activeImg = btn.querySelector('img');
            if (activeImg) activeImg.src = btn.dataset.activeIcon;
        }

        if (tabId === 'tab1') renderRanks();
        if (tabId === 'tab2') renderTasks();
        if (tabId === 'tab3') renderUpgrades();
        if (tabId === 'tab5') renderCharacters();
    }

    function closePanel() {
        closeCharacterModal();
        els.panelOverlay.classList.remove('is-open');
        document.body.classList.remove('panel-open');
        document.querySelectorAll('.tab').forEach((t) => { t.style.display = 'none'; });
        document.querySelectorAll('.tablinks').forEach((link) => {
            link.classList.remove('tablinks-active');
            const img = link.querySelector('img');
            if (img) img.src = link.dataset.defaultIcon;
        });
    }

    // Завантаження гри з Firebase та запуск інтерфейсу
    function initGame() {
        if (user) {
            els.userName.textContent = user.first_name + (user.last_name ? ` ${user.last_name}` : '');
            if (user.photo_url) els.userPhoto.src = user.photo_url;
        } else {
            els.userName.textContent = 'Гість (відкрий у Telegram)';
        }

        // Завантажуємо дані з Firebase хмари
        if (window.cloudLoadAll) {
            window.cloudLoadAll(userId, (cloudData) => {
                if (cloudData) {
                    Object.assign(state, cloudData);
                } else {
                    // Якщо даних ще немає, зберігаємо початковий стан
                    persist();
                }
                
                processReferral();
                renderUpgrades();
                renderTasks();
                renderCharacters();
                applyTapSkin();
                updateUI();
                state._lastLevel = getLevelInfo().current.level;
            });
        }
    }

    // Події
    $('tap-btn').addEventListener('click', onTap);

    document.querySelectorAll('.tablinks').forEach((btn) => {
        btn.addEventListener('click', () => openTab(btn.dataset.tab, btn));
    });

    els.closeBtn.addEventListener('click', closePanel);
    $('btn-shop').addEventListener('click', () => {
        const tabBtn = document.querySelector('[data-tab="tab3"]');
        openTab('tab3', tabBtn);
    });
    $('btn-daily').addEventListener('click', claimDaily);
    $('btn-friends-quick').addEventListener('click', () => {
        const tabBtn = document.querySelector('[data-tab="tab4"]');
        openTab('tab4', tabBtn);
    });

    $('btn-stats').addEventListener('click', () => { openTab('tab1', null); });
    $('btn-character').addEventListener('click', () => { openTab('tab5', null); });

    els.characterModalBuy.addEventListener('click', confirmBuyCharacter);
    els.characterModalCancel.addEventListener('click', closeCharacterModal);
    els.characterModalClose.addEventListener('click', closeCharacterModal);
    els.characterModal.querySelector('.character-modal-backdrop')?.addEventListener('click', closeCharacterModal);

    els.boostBtn?.addEventListener('click', activateBoost);

    $('copy-ref').addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(getReferralLink());
            showToast('Посилання скопійовано!');
        } catch {
            els.referralLink.select();
            document.execCommand('copy');
            showToast('Посилання скопійовано!');
        }
    });

    $('share-ref').addEventListener('click', () => {
        const link = getReferralLink();
        const text = 'Грай у Vanya Coin Tapper разом зі мною! 🪙';
        if (telegram?.openTelegramLink) {
            telegram.openTelegramLink(
                `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`
            );
        } else {
            window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`);
        }
    });

    setInterval(() => {
        if (state.energy < state.maxEnergy) {
            state.energy = Math.min(state.maxEnergy, state.energy + state.energyRegen / 10);
        }
        const auto = getAutoIncome();
        if (auto > 0) {
            const tickIncome = auto / 10;
            state.balance += tickIncome;
            state.totalEarned += tickIncome;
        }
        updateUI();
    }, 100);

    // Періодичне фонове збереження у хмару кожні 10 секунд
    setInterval(() => {
        persist();
    }, 10000);

    // Старт гри
    initGame();

})();
