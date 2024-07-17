function calcACTSpinRatioConstanst(TGT_CoinInPool, ACT_CoinInPool){
    if (typeof TGT_CoinInPool !== "number" || typeof ACT_CoinInPool !== "number") {
        throw new Error("Invalid arguments: both arguments must be numbers");
      }
      let ACT_SpinRationConstanst = Math.min(TGT_CoinInPool /  ACT_CoinInPool, 3) - 1.75
      return ACT_SpinRationConstanst;
}

// Function calculate CoinItemValueAtOtterLevel
function calculateCoinItemValueAtOtterLevel(baseCoinItemValue, inflationRate, inflationCycle, ACTOtterLevel) {
    return baseCoinItemValue * (1 + inflationRate) ** Math.floor(ACTOtterLevel / inflationCycle);
}

// calc reward from Spin
function calcRewardComboAtLevel(combo, coinItemValueAtOtterLevel, multiplyRatio) {
    const specialRewards = {
        4: "x10 EvenItem",
        7: "x1 Shield",
        11: "x10 Energy"
    };

    return specialRewards[combo] || coinItemValueAtOtterLevel * multiplyRatio[combo];
}
function getAndLogReward(combo, coinItemValueAtOtterLevel, multiplyRatio) {
    if (combo < 1 || combo > 13) {
        console.log("Invalid combo value");
        return null;
    }

    const reward = calcRewardComboAtLevel(combo, coinItemValueAtOtterLevel, multiplyRatio);

    if (combo === 12) {
        console.log(`AVG_StealMissReward: ${calcRewardComboAtLevel(combo, coinItemValueAtOtterLevel, multiplyRatio)}`);
    } else if (combo === 13) {
        console.log(`AVG_StealFullReward: ${reward}`);
    } else if (combo === 7){
        console.log(`CoinClaimComboShield: ${reward}`);
    } else{
        console.log(`rewardAtLevel: ${reward}`);
    }

    return reward;
}

const DATA = [
    mainPool: {
        {combo: "Coin", status: "", tag: "", multiplyRatio: 1, id: 1, convertToUSD: 0.005 },
        {combo: "Coin", status: "Coin", tag: "", multiplyRatio: 2, id: 2, convertToUSD: 0.010 },
        {combo: "Coin Bag", status: "", tag: "", multiplyRatio: 5, id: 3, convertToUSD: 0.025 },
        {combo: "Event Item", status: "Event Item", tag: "Event Item", multiplyRatio: 6, id: 4, convertToUSD: 0.030 },
        {combo: "Coin Bag", status: "Coin Bag", tag: "", multiplyRatio: 10, id: 5, convertToUSD: 0.050 },
        {combo: "Coin", status: "Coin", tag: "Coin", multiplyRatio: 20, id: 6, convertToUSD: 0.100 },
        {combo: "Shield", status: "Shield", tag: "Shield", multiplyRatio: 30, id: 7, convertToUSD: 0.500 },
        {combo: "Raid", status: "Raid", tag: "Raid", multiplyRatio: 50, id: 8, convertToUSD: 0.250 },
        {combo: "Coin Bag", status: "Coin Bag", tag: "Coin Bag", multiplyRatio: 80, id: 9, convertToUSD: 0.400 },
        {combo: "Raid", status: "Raid", tag: "Raid", multiplyRatio: 180, id: 10, convertToUSD: 0.900 },
        {combo: "Energy", status: "Energy", tag: "Energy", multiplyRatio: 200, id: 11, convertToUSD: 1.000 },
        {combo: "Steal", status: "Steal", tag: "Steal", multiplyRatio: 250, id: 12, convertToUSD: 1.250 },
        {combo: "Steal", status: "Steal", tag: "Steal", multiplyRatio: 300, id: 13, convertToUSD: 1.500 }
    },
    emptySlotPool1 = [
        { id: 1, item: "Event Item", weight: 1, ratio: 0.2 },
        { id: 2, item: "Energy", weight: 1, ratio: 0.2 },
        { id: 3, item: "Raid", weight: 1, ratio: 0.2 },
        { id: 4, item: "Shield", weight: 1, ratio: 0.2 },
        { id: 5, item: "Steal", weight: 1, ratio: 0.2 },
      ],
      emptySlotPool2 = [
        { id: 1, combo: ["Event Item", "Event Item"], weight: 1, ratio: 0.17 },
        { id: 2, combo: ["Energy", "Energy"], weight: 1, ratio: 0.17 },
        { id: 3, combo: ["Raid", "Raid"], weight: 1, ratio: 0.17 },
        { id: 4, combo: ["Shield", "Shield"], weight: 1, ratio: 0.17 },
        { id: 5, combo: ["Steal", "Steal"], weight: 1, ratio: 0.17 },
        { id: 6, combo: "emptySlotPool1", weight: 1, ratio: 0.17 },
      ]
  ];


const ;
  
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

  // Calc ACT_SpinRatioConstanst
let TGT_CoinInPool = 800000
let ACT_CoinInPool = 10000
let ACT_SpinRatioConstanst = calcACTSpinRatioConstanst(TGT_CoinInPool, ACT_CoinInPool)


let ACTCurOtterLevel = 10
let combo = 7
let coinItemValueAtOtterLevel = calculateCoinItemValueAtOtterLevel(metric.exchangeRate.baseCoinItemValue, metric.exchangeRate.InflationRate, metric.exchangeRate.InflationCycle, ACTCurOtterLevel);
let reward = getAndLogReward(combo, coinItemValueAtOtterLevel, metric.spin);

console.log(`ACT_SpinRatioConstanst: ${ACT_SpinRatioConstanst}` )

