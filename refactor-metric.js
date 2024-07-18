// Constants and configuration
const METRICS = {
    target: {
        daysPlayed: 90,
        sessionsPerDay: 3,
        playMinutesPerDay: 60,
        targetOtterLevel: 100
    },
    rates: {
        diamondToUSD: 100,
        coinToUSD: 200000,
        coinToDiamond: 2000,
        coinToEnergy: 20000,
        energyToUSD: 10,
        inflationRate: 0.05,
        inflationCycle: 1,
        playTimeToUSD: 5,
        energyToPlayTime: 0.5,
        baseCoinItemValue: 1000
    },
    diamond: {
        questRate: 0.5,
        achievementRate: 0.5,
        dailyQuestReward: 100,
        autoRaidCost: 0.5,
        autoStealCost: 0.5
    },
    coin: {
        outRate: 1,
        upgradeRate: 0.6,
        raidRate: 0.25,
        stealRate: 0.15,
        upgradeCurve: 1.1,
        energyInflationRate: 0.15,
        energyInflationCycle: 15,
        inCurve: 0.9
    },
    pool: {
        raidCurve: 1.1,
        raidOverflowRate: 0.5,
        stealCurve: 1.1,
        stealOverflowRate: 0.5
    },
    raid: {
        invulnerableCooldown: 360,
        firstDefenseTime: 30,
        systemAttackBuffer: 60
    },
    steal: {
        protectionCooldown: 360,
        inventoryStealRate: 0.2,
        minMatchingRange: 0.5,
        maxMatchingRange: 0.5,
        firstStealTime: 30,
        systemStealBuffer: 30,
        maxSlots: 4
    },
    otter: {
        upgradeZone: 5,
        starsPerZone: 3,
        zoneHealPrices: 0.5
    },
    spin: {
        1: 1, 2: 2, 3: 5, 4: 6, 5: 10, 6: 20, 7: 30, 8: 50, 9: 80,
        10: 180, 11: 200, 12: 250, 13: 300
    }
};

const POOL_DATA = {
    main: [
        {combo: "Coin", status: "", tag: "", multiplyRatio: 1, id: 1, convertToUSD: 0.005},
        {combo: "Coin", status: "Coin", tag: "", multiplyRatio: 2, id: 2, convertToUSD: 0.010},
        // ... (other pool data)
    ],
    emptySlot1: [
        {id: 1, item: "Event Item", weight: 1, ratio: 0.2},
        // ... (other empty slot 1 data)
    ],
    emptySlot2: [
        {id: 1, combo: ["Event Item", "Event Item"], weight: 1, ratio: 0.17},
        // ... (other empty slot 2 data)
    ]
};

// Utility functions
const Utils = {
    findMaxNumber: (arr) => Math.max(...arr.map(item => item.multiplyRatio)),

    calculateComboRatio: (combo, maxMainPool, arr, spinRatioConstant) => {
        const index = combo - 1;
        const weights = arr.map(item => Math.pow(item.multiplyRatio / maxMainPool, spinRatioConstant));
        const actComboWeight = weights[index];
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        const actComboRatio = actComboWeight / totalWeight;

        return { actComboWeight, totalWeight, actComboRatio };
    },

    calculateReward: (combo, arr, coinItemValueAtOtterLevel) => {
        if (combo === 4) return "10 item Event";
        if (combo === 11) return "10 Energy";
        if (combo <= 0 || combo >= 14) {
            console.warn("Invalid combo value:", combo);
            return null;
        }
        return coinItemValueAtOtterLevel * arr[combo - 1].multiplyRatio;
    },

    calculateCoinOverflow: (targetCoinInPool, actualCoinInPool) => 
        Math.max(actualCoinInPool - targetCoinInPool, 0),

    calculateCoinOutFromActivity: (totalCoinOut, rate, daysLogged, curve, coinOverflow, overflowRate) => {
        if (coinOverflow <= 0) return 0;

        const sigma = Array.from({length: METRICS.target.daysPlayed}, (_, i) => Math.pow(i + 1, curve))
            .reduce((sum, val) => sum + val, 0);

        return totalCoinOut * rate * (Math.pow(daysLogged, curve) / sigma) + coinOverflow * overflowRate;
    }
};

// Core calculation functions
function calculateCoinItemValueAtOtterLevel(baseCoinItemValue, inflationRate, inflationCycle, otterLevel) {
    return baseCoinItemValue * Math.pow(1 + inflationRate, Math.floor(otterLevel / inflationCycle));
}

function calculateMaxEnergy(otterLevel) {
    const baseEnergy = 50;
    const inflatedEnergy = baseEnergy * Math.pow(1 + METRICS.coin.energyInflationRate, 
        Math.floor(otterLevel / METRICS.coin.energyInflationCycle));
    return Math.floor(inflatedEnergy / 5) * 5; // Round to nearest multiple of 5
}

function calculateTotalCoinUpgrade(currentLevel) {
    const targetLevel = METRICS.target.targetOtterLevel;
    const sigma = Array.from({length: targetLevel}, (_, i) => Math.pow(i + 1, METRICS.coin.upgradeCurve))
        .reduce((sum, val) => sum + val, 0);
    return METRICS.coin.upgradeRate * totalCoinOut * 
        (Math.pow(currentLevel, METRICS.coin.upgradeCurve) / sigma);
}

function calculateIAPConvertToCoin(iapPurchasePrice, usdRate, inflationRate, otterLevel, inflationCycle) {
    const inflationCycles = Math.floor(otterLevel / inflationCycle);
    const accumulatedInflation = Math.pow(1 + inflationRate, inflationCycles);
    return iapPurchasePrice * usdRate * accumulatedInflation;
}

function calculateSpinFromDiamondConvertToCoin(diamondsUsed, diamondToCoinRate, inflationRate, otterLevel, inflationCycle) {
    const inflationCycles = Math.floor(otterLevel / inflationCycle);
    const accumulatedInflation = Math.pow(1 + inflationRate, inflationCycles);
    return diamondsUsed * diamondToCoinRate * accumulatedInflation;
}

function calculateCoinInPoolUnlockDay(totalCoinIn, daysLogged, coinInCurve, iapConvertToCoin, spinFromDiamondConvertToCoin) {
    const sigma = Array.from({length: METRICS.target.daysPlayed}, (_, i) => Math.pow(i + 1, coinInCurve))
        .reduce((sum, val) => sum + val, 0);
    return totalCoinIn * (Math.pow(daysLogged, coinInCurve) / sigma) + iapConvertToCoin + spinFromDiamondConvertToCoin;
}

function calculateSpinRatioConstant(targetCoinInPool, actualCoinInPool) {
    return Math.min(targetCoinInPool / actualCoinInPool, 3) - 1.75;
}

// Main calculation logic
function performCalculations(inputParams) {
    const {
        currentOtterLevel,
        iapPurchase,
        diamondsUsed,
        actualPlayMinutesPerDay,
        daysLogged,
        targetCoinInPool,
        actualCoinInPool,
        comboNumber,
        currentEnergy
    } = inputParams;

    // Calculate diamond-related metrics
    const totalDiamondFromQuest = METRICS.target.daysPlayed * METRICS.diamond.dailyQuestReward;
    const totalDiamondFromAchievement = (totalDiamondFromQuest / METRICS.diamond.questRate) * METRICS.diamond.achievementRate;
    const totalDiamondIn = totalDiamondFromQuest / METRICS.diamond.questRate;
    const diamondOutForAutoRaid = totalDiamondIn * METRICS.diamond.autoRaidCost;
    const diamondOutForAutoSteal = totalDiamondIn * METRICS.diamond.autoStealCost;

    // Calculate total coin in and out
    const totalPlayTimeValue = (METRICS.target.daysPlayed * METRICS.target.playMinutesPerDay) / METRICS.rates.playTimeToUSD;
    const coinValueAtMaxLevel = METRICS.rates.coinToUSD * (1 + Math.pow(1 + METRICS.rates.inflationRate, 
        METRICS.target.targetOtterLevel / METRICS.rates.inflationCycle));
    const totalCoinIn = Math.ceil((totalPlayTimeValue * coinValueAtMaxLevel) / 2);
    const totalCoinOut = totalCoinIn * METRICS.coin.outRate;

    // Calculate various game metrics
    const coinItemValueAtOtterLevel = calculateCoinItemValueAtOtterLevel(
        METRICS.rates.baseCoinItemValue, 
        METRICS.rates.inflationRate, 
        METRICS.rates.inflationCycle, 
        currentOtterLevel
    );
    const maxEnergy = calculateMaxEnergy(currentOtterLevel);
    const energyRegen = (METRICS.target.sessionsPerDay * maxEnergy) / 24;
    const iapConvertToCoin = calculateIAPConvertToCoin(
        iapPurchase, 
        METRICS.rates.coinToUSD, 
        METRICS.rates.inflationRate, 
        currentOtterLevel, 
        METRICS.rates.inflationCycle
    );
    const coinClaimCombo = coinItemValueAtOtterLevel * METRICS.spin[currentOtterLevel];
    const totalCoinUpgradeOfOtterLevel = calculateTotalCoinUpgrade(currentOtterLevel);

    const spinFromDiamondConvertToCoin = calculateSpinFromDiamondConvertToCoin(
        diamondsUsed, 
        METRICS.rates.coinToDiamond, 
        METRICS.rates.inflationRate, 
        currentOtterLevel, 
        METRICS.rates.inflationCycle
    );
    const coinInPoolUnlockDay = calculateCoinInPoolUnlockDay(
        totalCoinIn, 
        daysLogged, 
        METRICS.coin.inCurve, 
        iapConvertToCoin, 
        spinFromDiamondConvertToCoin
    );

    // Calculate spin-related metrics
    const spinRatioConstant = calculateSpinRatioConstant(targetCoinInPool, actualCoinInPool);
    const maxMultiRatio = Utils.findMaxNumber(POOL_DATA.main);
    const { actComboWeight, totalWeight, actComboRatio } = Utils.calculateComboRatio(
        comboNumber, 
        maxMultiRatio, 
        POOL_DATA.main, 
        spinRatioConstant
    );

    // Calculate rewards based on combo
    let reward, avgStealMissReward, avgStealFullReward, coinClaimComboShield;
    if (comboNumber === 12) {
        avgStealMissReward = Utils.calculateReward(comboNumber, POOL_DATA.main, coinItemValueAtOtterLevel);
    } else if (comboNumber === 13) {
        avgStealFullReward = Utils.calculateReward(comboNumber, POOL_DATA.main, coinItemValueAtOtterLevel);
    } else if (comboNumber === 7) {
        coinClaimComboShield = Utils.calculateReward(comboNumber, POOL_DATA.main, coinItemValueAtOtterLevel);
    } else {
        reward = Utils.calculateReward(comboNumber, POOL_DATA.main, coinItemValueAtOtterLevel);
    }

    // Calculate coin overflow and related metrics
    const coinOverflow = Utils.calculateCoinOverflow(targetCoinInPool, actualCoinInPool);
    const coinOutFromRaidDay = Utils.calculateCoinOutFromActivity(
        totalCoinOut, 
        METRICS.coin.raidRate, 
        daysLogged, 
        METRICS.pool.raidCurve, 
        coinOverflow, 
        METRICS.pool.raidOverflowRate
    );
    const coinOutFromStealDay = Utils.calculateCoinOutFromActivity(
        totalCoinOut, 
        METRICS.coin.stealRate, 
        daysLogged, 
        METRICS.pool.stealCurve, 
        coinOverflow, 
        METRICS.pool.stealOverflowRate
    );

    // Return calculated metrics
    return {
        totalDiamondFromQuest,
        totalDiamondFromAchievement,
        totalDiamondIn,
        diamondOutForAutoRaid,
        diamondOutForAutoSteal,
        totalCoinIn,
        totalCoinOut,
        coinItemValueAtOtterLevel,
        maxEnergy,
        energyRegen,
        iapConvertToCoin,
        coinClaimCombo,
        totalCoinUpgradeOfOtterLevel,
        spinFromDiamondConvertToCoin,
        coinInPoolUnlockDay,
        spinRatioConstant,
        actComboWeight,
        totalWeight,
        actComboRatio,
        reward,
        avgStealMissReward,
        avgStealFullReward,
        coinClaimComboShield,
        coinOverflow,
        coinOutFromRaidDay,
        coinOutFromStealDay
    };
}

// Example usage
const inputParams = {
    currentOtterLevel: 1,
    iapPurchase: 0,
    diamondsUsed: 0,
    actualPlayMinutesPerDay: 19.012222822833333,
    daysLogged: 1,
    targetCoinInPool: 5209366,
    actualCoinInPool: 10000,
    comboNumber: 2,
    currentEnergy: 50
};

const results = performCalculations(inputParams);
console.log(results);