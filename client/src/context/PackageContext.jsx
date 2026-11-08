import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const PackageContext = createContext();

const DEFAULT_CURRENCY_RATES = {
  USD: { code: 'USD', symbol: '$', rate: 1, label: 'USD ($)' },
  LKR: { code: 'LKR', symbol: 'Rs. ', rate: 300, label: 'LKR (Rs.)' },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92, label: 'EUR (€)' },
  GBP: { code: 'GBP', symbol: '£', rate: 0.79, label: 'GBP (£)' },
  AUD: { code: 'AUD', symbol: 'A$', rate: 1.52, label: 'AUD (A$)' }
};

export const PackageProvider = ({ children }) => {
  const [selectedPackage, setSelectedPackage] = useState(() => {
    try {
      const saved = localStorage.getItem('selectedPackage');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('preferredCurrency') || 'USD';
  });

  const [currencyRates, setCurrencyRates] = useState(DEFAULT_CURRENCY_RATES);

  const [customizations, setCustomizationsState] = useState(() => {
    try {
      const saved = localStorage.getItem('packageCustomizations');
      return saved
        ? JSON.parse(saved)
        : {
            addGuide: false,
            selectedMealOption: 'Authentic Sri Lankan Culinary Experience',
            selectedGuideOption: 'Cultural & Heritage Historian Guide'
          };
    } catch {
      return {
        addGuide: false,
        selectedMealOption: 'Authentic Sri Lankan Culinary Experience',
        selectedGuideOption: 'Cultural & Heritage Historian Guide'
      };
    }
  });

  useEffect(() => {
    let mounted = true;
    api
      .get('/packages/currencies/rates')
      .then((res) => {
        if (mounted && res.data?.data) {
          setCurrencyRates((prev) => ({ ...prev, ...res.data.data }));
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const setCurrency = (code) => {
    if (DEFAULT_CURRENCY_RATES[code] || currencyRates[code]) {
      setCurrencyState(code);
      localStorage.setItem('preferredCurrency', code);
    }
  };

  const formatPrice = useCallback(
    (usdAmount) => {
      const numeric = Number(usdAmount) || 0;
      const active = currencyRates[currency] || DEFAULT_CURRENCY_RATES.USD;
      const converted = numeric * (active.rate || 1);
      if (currency === 'LKR') {
        return `Rs. ${Math.round(converted).toLocaleString()}`;
      }
      return `${active.symbol}${Math.round(converted).toLocaleString()}`;
    },
    [currency, currencyRates]
  );

  const selectPackage = (pkg) => {
    setSelectedPackage(pkg);
    localStorage.setItem('selectedPackage', JSON.stringify(pkg));
  };

  const clearPackage = () => {
    setSelectedPackage(null);
    localStorage.removeItem('selectedPackage');
  };

  const updateCustomizations = (updates) => {
    setCustomizationsState((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem('packageCustomizations', JSON.stringify(next));
      return next;
    });
  };

  // Dynamic cost calculation based on business rules (in base USD)
  const calculatePackageCost = (pkg, days = 1, travelers = 1, custom = customizations) => {
    if (!pkg) {
      const fallbackBase = 100 * days * travelers;
      return {
        baseTotal: fallbackBase,
        guideCost: 0,
        mealExtraCost: 0,
        grandTotal: fallbackBase
      };
    }

    const safeDays = Math.max(1, Number(days) || 1);
    const safeTravelers = Math.max(1, Number(travelers) || 1);
    const baseTotal = safeDays * safeTravelers * (pkg.baseCharge || 85);

    let guideCost = 0;
    let mealExtraCost = 0;

    if (pkg.packageName === 'Standard' && custom?.addGuide) {
      guideCost = safeDays * (pkg.guideAddonPrice || 45);
    }

    if (pkg.packageName === 'Premium' && Array.isArray(pkg.mealOptions)) {
      const selectedMeal = pkg.mealOptions.find((m) => m.name === custom?.selectedMealOption);
      if (selectedMeal && selectedMeal.extraCostPerDay) {
        mealExtraCost = selectedMeal.extraCostPerDay * safeDays * safeTravelers;
      }
    }

    return {
      baseTotal,
      guideCost,
      mealExtraCost,
      grandTotal: baseTotal + guideCost + mealExtraCost
    };
  };

  return (
    <PackageContext.Provider
      value={{
        selectedPackage,
        selectPackage,
        clearPackage,
        customizations,
        updateCustomizations,
        calculatePackageCost,
        currency,
        setCurrency,
        currencyRates,
        formatPrice
      }}
    >
      {children}
    </PackageContext.Provider>
  );
};
