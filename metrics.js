
// Function calculate CoinItemValueAtOtterLevel
function calculateCoinItemValueAtOtterLevel(baseCoinItemValue, inflationRate, inflationCycle, ACTOtterLevel) {
    return baseCoinItemValue * (1 + inflationRate) ** Math.floor(ACTOtterLevel / inflationCycle);
}

// Hàm tính năng lượng tối đa
function countMaxEnergy(ACTCurOtterLevel) {
    const baseEnergy = 50;
    const inflatedEnergy = baseEnergy * (1 + metric.coin.EnergyInflation_Rate) ** Math.floor(ACTCurOtterLevel / metric.coin.EnergyInflationCycle);
    return roundNearestFive(inflatedEnergy); // Làm tròn tới số chia hết cho 5 gần nhất
}

// Hàm làm tròn số gần nhất và chia hết cho 5
function roundNearestFive(number) {
    let roundedNumber = Math.floor(number);
    let remainder = roundedNumber % 5;

    if (remainder >= 3) {
        roundedNumber += (5 - remainder);
    } else {
        roundedNumber -= remainder;
    }

    return roundedNumber;
}

// function tính tổng số coin cần Upgrade để lên level
function countTgtTotalCoinUpgradeOfOtterLevel(curLevel) {
    let sigma = 0;
    let total
    for (let i = 1; i <= metric.targetMetrics.TGT_TargetOtterLevel; i++) {
        sigma += Math.pow(i, metric.coin.CoinUpgradeCurve);
    }
    total = metric.coin.TGT_CoinOutFromUpgrade_Rate * TOT_CoinOut  * (Math.pow(curLevel , metric.coin.CoinUpgradeCurve) / sigma )
    return total;
}

// Function check ACT purcharge IAP
function calculateACTIAPConvertToCoin(iapPurchasePriceInUSD, usdRate, inflationRate, actOtterLevel, inflationCycle) {
    // Kiểm tra xem các giá trị đầu vào có hợp lệ hay không
    if (isNaN(iapPurchasePriceInUSD) || isNaN(usdRate) || isNaN(inflationRate) || isNaN(actOtterLevel) || isNaN(inflationCycle)) {
      throw new Error("Giá trị đầu vào không hợp lệ");
    }
  
    // Tính toán số chu kỳ lạm phát
    const inflationCycles = Math.floor(actOtterLevel / inflationCycle);
  
    // Tính toán tỷ lệ lạm phát tích lũy
    const accumulatedInflationRate = Math.pow(1 + inflationRate, inflationCycles);
  
    // Tính toán giá trị ACT_IAPConvertToCoin
    const actIAPConvertToCoin = iapPurchasePriceInUSD * usdRate * accumulatedInflationRate;
  
    return actIAPConvertToCoin;
  }

  // Function count ACTSpin
  function calculateACTSpinFromDiamondConvertToCoin(actDiamondUsed, diamondToCoinRate, inflationRate, actOtterLevel, inflationCycle) {
    // Check for valid input values
    if (isNaN(actDiamondUsed) || isNaN(diamondToCoinRate) || isNaN(inflationRate) || isNaN(actOtterLevel) || isNaN(inflationCycle)) {
      throw new Error("Invalid input values");
    }
  
    // Calculate inflation cycles
    const inflationCycles = Math.floor(actOtterLevel / inflationCycle);
  
    // Calculate accumulated inflation rate
    const accumulatedInflationRate = Math.pow(1 + inflationRate, inflationCycles);
  
    // Calculate ACT_SpinFromDiamondConvertToCoin
    const actSpinFromDiamondConvertToCoin = actDiamondUsed * diamondToCoinRate * accumulatedInflationRate;
  
    return actSpinFromDiamondConvertToCoin;
  }

// Function coun Total CoinInPool
function countTGTCoinInPoolUnclockDay(TOT_CoinIn, Dayloged, CoinInCurve , actIAPConvertToCoin, actSpinFromDiamondConvertToCoin) {
    let sigma = 0;
    let total
    for (let i = 1; i <= metric.targetMetrics.TGT_DayPlay; i++) {
        sigma += Math.pow(i, metric.coin.CoinInCurve);
    }
    total = TOT_CoinIn  * (Math.pow(DayLoged , metric.coin.CoinInCurve) / sigma ) + actIAPConvertToCoin + actSpinFromDiamondConvertToCoin
    return total;
}

// Function count SpinRatio
function calcACTSpinRatioConstanst(TGT_CoinInPool, ACT_CoinInPool){
    if (typeof TGT_CoinInPool !== "number" || typeof ACT_CoinInPool !== "number") {
        throw new Error("Invalid arguments: both arguments must be numbers");
      }
      let ACT_SpinRationConstanst = Math.min(TGT_CoinInPool /  ACT_CoinInPool, 3) - 1.75
      return ACT_SpinRationConstanst;
}

const metric = {
    targetMetrics: {
        TGT_DayPlay: 90,
        TGT_SessionPerDay: 3,
        TGT_PlayMinutesPerDay: 60,
        TGT_TargetOtterLevel: 100
    },
    exchangeRate: {
        DiamondToUSD: 100,
        CoinToUSD: 200000,
        CoinToDiamond: 2000,
        CoinToEnergy: 20000,
        EnergyToUSD: 10,
        InflationRate: 0.05,
        InflationCycle: 1,
        PlayTimeToUSD: 5,
        EnergyToPlayTime: 0.5,
        baseCoinItemValue: 1000
    },
    diamond: {
        TGT_DiamondInFromQuest_Rate: 0.5,
        TGT_DiamondInFromAchievement_Rate: 0.5,
        TGT_DiamondInFromQuestDaily: 100,
        TGT_DiamondOutForAutoRaid: 0.5,
        TGT_DiamondOutForAutoSteal: 0.5
    },
    coin: {
        TGT_CoinOut_Rate: 1,
        TGT_CoinOutFromUpgrade_Rate: 0.6,
        TGT_CoinOutFromRaid_Rate: 0.25,
        TGT_CoinOutFromSteal_Rate: 0.15,
        CoinUpgradeCurve: 1.1,
        EnergyInflation_Rate: 0.15,
        EnergyInflationCycle: 15,
        CoinInCurve: 0.9
    },
    pool: {
        CoinOutFromRaidCurve: 1.1,
        TGT_CoinInOverForRaid_Rate: 0.5,
        CoinOutFromStealCurve: 1.1,
        TGT_CoinInOverForSteal_Rate: 0.5
    },
    raid: {
        DefaultInvulnerableCooldown: 360,
        TGT_FirstDefenseTimeAfterFirstLogin: 30,
        TGT_SystemAttackBufferTime: 60
    },
    steal: {
        DefaultStealProtectionCooldown: 360,
        TGT_InventoryStealRate: 0.2,
        TGT_MinMatchingRangeRate: 0.5,
        TGT_MaxMatchingRangeRate: 0.5,
        TGT_FirstStealTimeAfterFirstLogin: 30,
        TGT_SystemStealBufferTime: 30,
        TGT_MaxSlotInSteal: 4
    },
    otter: {
        TGT_OtterUpgradeZone: 5,
        TGT_StarUpgradePerZone: 3,
        TGT_ZoneHealPrices: 0.5
    },
    spin: {
        1: 1 ,
        2: 2 ,
        3: 5 ,
        4: 6 ,
        5: 10 ,
        6: 20 ,
        7: 30 ,
        8: 50 ,
        9: 80 ,
        10: 180 ,
        11: 200 ,
        12: 250 ,
        13: 300
    }
}

const DATA = {
    mainPool: [
        {combo: "Coin", status: "", tag: "", multiplyRatio: 1, id: 1, convertToUSD: 0.005},
        {combo: "Coin", status: "Coin", tag: "", multiplyRatio: 2, id: 2, convertToUSD: 0.010},
        {combo: "Coin Bag", status: "", tag: "", multiplyRatio: 5, id: 3, convertToUSD: 0.025},
        {combo: "Event Item", status: "Event Item", tag: "Event Item", multiplyRatio: 6, id: 4, convertToUSD: 0.030},
        {combo: "Coin Bag", status: "Coin Bag", tag: "", multiplyRatio: 10, id: 5, convertToUSD: 0.050},
        {combo: "Coin", status: "Coin", tag: "Coin", multiplyRatio: 20, id: 6, convertToUSD: 0.100},
        {combo: "Shield", status: "Shield", tag: "Shield", multiplyRatio: 30, id: 7, convertToUSD: 0.500},
        {combo: "Raid", status: "Raid", tag: "Raid", multiplyRatio: 50, id: 8, convertToUSD: 0.250},
        {combo: "Coin Bag", status: "Coin Bag", tag: "Coin Bag", multiplyRatio: 80, id: 9, convertToUSD: 0.400},
        {combo: "Raid", status: "Raid", tag: "Raid", multiplyRatio: 180, id: 10, convertToUSD: 0.900},
        {combo: "Energy", status: "Energy", tag: "Energy", multiplyRatio: 200, id: 11, convertToUSD: 1.000},
        {combo: "Steal", status: "Steal", tag: "Steal", multiplyRatio: 250, id: 12, convertToUSD: 1.250},
        {combo: "Steal", status: "Steal", tag: "Steal", multiplyRatio: 300, id: 13, convertToUSD: 1.500}
    ],
    emptySlotPool1: [
        {id: 1, item: "Event Item", weight: 1, ratio: 0.2},
        {id: 2, item: "Energy", weight: 1, ratio: 0.2},
        {id: 3, item: "Raid", weight: 1, ratio: 0.2},
        {id: 4, item: "Shield", weight: 1, ratio: 0.2},
        {id: 5, item: "Steal", weight: 1, ratio: 0.2}
    ],
    emptySlotPool2: [
        {id: 1, combo: ["Event Item", "Event Item"], weight: 1, ratio: 0.17},
        {id: 2, combo: ["Energy", "Energy"], weight: 1, ratio: 0.17},
        {id: 3, combo: ["Raid", "Raid"], weight: 1, ratio: 0.17},
        {id: 4, combo: ["Shield", "Shield"], weight: 1, ratio: 0.17},
        {id: 5, combo: ["Steal", "Steal"], weight: 1, ratio: 0.17},
        {id: 6, combo: "emptySlotPool1", weight: 1, ratio: 0.17}
    ]
};

const support = {
    findMaxNumber: (arr) => {
        let max = 0;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].multiplyRatio >= max) {
                max = arr[i].multiplyRatio;
            }
        }
        return max;
    },

    calcActComboRatio: (combo, maxMainPool, arr, spinRatioConstant) => {
        const index = combo - 1;
        const actComboWeight = Math.pow(arr[index].multiplyRatio / maxMainPool, spinRatioConstant);
        
        let totalActComboWeight = 0;
        for (let i = 0; i < arr.length; i++) {
            totalActComboWeight += Math.pow(arr[i].multiplyRatio / maxMainPool, spinRatioConstant);
        }
        
        let ACT_ComboRatio = actComboWeight / totalActComboWeight
        
        return {
            actComboWeight,
            totalActComboWeight,
            ACT_ComboRatio
        };
    },

    calcReward: (combo, arr, coinItemValueAtOtterLevel) => {
        // Early return for special combos
        if (combo === 4) {
          return "10 item Event";
        } else if (combo === 11) {
          return "10 Energy";
        }
      
        // Validate combo range
        if (combo <= 0 || combo >= 14) {
          console.warn("Invalid combo value:", combo);
          return; // Or throw an error if strict behavior is needed
        }
      
        const index = combo - 1;
        const reward = coinItemValueAtOtterLevel * arr[index].multiplyRatio;
        return reward;
      }
      ,
      calcCoinOverTake: (TGT_CoinInPool, ACT_CoinInPool) => {
        let TGT_CoinOverTake = ACT_CoinInPool - TGT_CoinInPool
        if(TGT_CoinOverTake > 0) {
            return TGT_CoinOverTake
        }else {
            return 0
        }
      },
      calcTgtCoinOutUnlockFromRaidDay: (TOT_CoinOut, TGT_CoinOutFromRaid_Rate, DayLoged, CoinOutFromRaidCurve, TGT_CoinOverTake, TGT_CoinInOverForRaid_Rate) => {
        let sigma = 0
        let total
        for(let i = 1; i <= metric.targetMetrics.TGT_DayPlay; i++){
            sigma += Math.pow(i, CoinOutFromRaidCurve)
        }
        total = TOT_CoinOut * TGT_CoinOutFromRaid_Rate * (Math.pow(DayLoged , CoinOutFromRaidCurve ) / sigma ) + TGT_CoinOverTake * TGT_CoinInOverForRaid_Rate
        return total
      },
      calcTgtCoinOutUnlockFromStealDay: (TOT_CoinOut, TGT_CoinOutFromSteal_Rate, DayLoged, CoinOutFromStealCurve, TGT_CoinOverTake, TGT_CoinInOverForSteal_Rate) => {
        let sigma = 0
        let total
        for(let i = 1; i <= metric.targetMetrics.TGT_DayPlay; i++){
            sigma += Math.pow(i, CoinOutFromStealCurve)
        }
        total = TOT_CoinOut * TGT_CoinOutFromSteal_Rate * (Math.pow(DayLoged , CoinOutFromStealCurve ) / sigma ) + TGT_CoinOverTake * TGT_CoinInOverForSteal_Rate
        return total
      },
      calcTgtCoinOutFromRaid: (TGT_CoinOutPoolFromRaidDay, TGT_CoinOverTake) => {
        return TGT_CoinOutPoolFromRaidDay + TGT_CoinOverTake
      }
};

// Thong so thay doi
let ACTCurOtterLevel = 1;
let ACTIAPPurcharge = 0
let ACTDiamondUsed = 0
let actPlayMinutesPerDay = 19.012222822833333
let DayLoged = 1
let TGT_CoinInPool = 5209366  
let ACT_CoinInPool = 10000
let combo = 2
let curEnegy = 50


let TOT_DiamondInFromQuest = metric.targetMetrics.TGT_DayPlay * metric.diamond.TGT_DiamondInFromQuestDaily;
let TOT_DiamondInFromAchievement = (TOT_DiamondInFromQuest / metric.diamond.TGT_DiamondInFromQuest_Rate) * metric.diamond.TGT_DiamondInFromAchievement_Rate;
let TOT_DiamondIn = TOT_DiamondInFromQuest / metric.diamond.TGT_DiamondInFromQuest_Rate;
let DiamondOutForAutoRaid = TOT_DiamondIn * metric.diamond.TGT_DiamondOutForAutoRaid;
let DiamondOutForAutoSteal = TOT_DiamondIn * metric.diamond.TGT_DiamondOutForAutoSteal;

let isA = (metric.targetMetrics.TGT_DayPlay * metric.targetMetrics.TGT_PlayMinutesPerDay) / metric.exchangeRate.PlayTimeToUSD
let isB = metric.exchangeRate.CoinToUSD * [1 + (1 + metric.exchangeRate.InflationRate) ** (metric.targetMetrics.TGT_TargetOtterLevel / metric.exchangeRate.InflationCycle)]
let TOT_CoinIn = Math.ceil((isA * isB) / 2)
let TOT_CoinOut = TOT_CoinIn * metric.coin.TGT_CoinOut_Rate

let coinItemValueAtOtterLevel = calculateCoinItemValueAtOtterLevel(metric.exchangeRate.baseCoinItemValue, metric.exchangeRate.InflationRate, metric.exchangeRate.InflationCycle, ACTCurOtterLevel);
let maxEnergy = countMaxEnergy(ACTCurOtterLevel);
let energyRegen = (metric.targetMetrics.TGT_SessionPerDay * maxEnergy ) / 24
let IAPPurchargePriceInUSD = 1
let ACT_IAPConvertToCoin = IAPPurchargePriceInUSD * metric.exchangeRate.CoinToUSD * (1 + metric.exchangeRate.InflationRate) ** Math.floor(ACTCurOtterLevel / metric.exchangeRate.InflationCycle)
let CoinClaimCombo = coinItemValueAtOtterLevel * metric.spin[ACTCurOtterLevel]
let TGT_TotalCoinUpgradeOfOtterLevel = countTgtTotalCoinUpgradeOfOtterLevel(ACTCurOtterLevel);

let actIAPConvertToCoin = calculateACTIAPConvertToCoin(ACTIAPPurcharge, metric.exchangeRate.CoinToUSD, metric.exchangeRate.InflationRate, ACTCurOtterLevel, metric.exchangeRate.InflationCycle);
let actSpinFromDiamondConvertToCoin = calculateACTSpinFromDiamondConvertToCoin(ACTDiamondUsed, metric.exchangeRate.CoinToDiamond, metric.exchangeRate.InflationRate, ACTCurOtterLevel, metric.exchangeRate.InflationCycle);
let TGT_CoinInPoolUnlockDay = countTGTCoinInPoolUnclockDay(TOT_CoinIn, DayLoged, metric.coin.CoinInCurve, actIAPConvertToCoin, actSpinFromDiamondConvertToCoin)

// Calc ACT_SpinRatioConstanst
let ACT_SpinRatioConstanst = calcACTSpinRatioConstanst(TGT_CoinInPool, ACT_CoinInPool)

// Calc spin
let maxMultiRatio = support.findMaxNumber(DATA.mainPool)
let ACT_Comboweight = support.calcActComboRatio(combo , maxMultiRatio, DATA.mainPool, ACT_SpinRatioConstanst ).actComboWeight
let TotalAllComboWeight = support.calcActComboRatio(combo , maxMultiRatio, DATA.mainPool, ACT_SpinRatioConstanst ).totalActComboWeight
let ACT_ComboRatio = support.calcActComboRatio(combo , maxMultiRatio, DATA.mainPool, ACT_SpinRatioConstanst ).ACT_ComboRatio
let AVG_StealMissReward
let AVG_StealFullReward
let coinClaimComboShield
let reward

if(combo === 12) {
    AVG_StealMissReward = support.calcReward(combo, DATA.mainPool, coinItemValueAtOtterLevel)
}else if (combo === 13){
    AVG_StealFullReward = support.calcReward(combo, DATA.mainPool, coinItemValueAtOtterLevel)
}else if (combo === 7){
    coinClaimComboShield = support.calcReward(combo, DATA.mainPool, coinItemValueAtOtterLevel)
}else {
    reward = support.calcReward(combo, DATA.mainPool, coinItemValueAtOtterLevel)
}

// Calc ACT_CoinFromRaidDay
let TGT_CoinOverTake = support.calcCoinOverTake(TGT_CoinInPool, ACT_CoinInPool)
let TGT_CoinOutPoolFromRaidDay = support.calcTgtCoinOutUnlockFromRaidDay(TOT_CoinOut, metric.coin.TGT_CoinOutFromRaid_Rate, DayLoged, metric.pool.CoinOutFromRaidCurve, TGT_CoinOverTake, metric.pool.TGT_CoinInOverForRaid_Rate)
let TGT_CoinOutPoolFromStealDay = support.calcTgtCoinOutUnlockFromStealDay(TOT_CoinOut, metric.coin.TGT_CoinOutFromSteal_Rate, DayLoged, metric.pool.CoinOutFromStealCurve, TGT_CoinOverTake, metric.pool.TGT_CoinInOverForSteal_Rate)

// Calc tgtCoinOutFromRaid
let TGT_CoinOutFromRaid = support.calcTgtCoinOutFromRaid(TGT_CoinOutPoolFromRaidDay, TGT_CoinOverTake)
let TGT_CoinOutFromSteal = TGT_CoinOutPoolFromStealDay