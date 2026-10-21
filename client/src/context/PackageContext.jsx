import React, { createContext, useState, useEffect } from 'react';

export const PackageContext = createContext();

export const PackageProvider = ({ children }) => {
  const [selectedPackage, setSelectedPackage] = useState(() => {
    try {
      const saved = localStorage.getItem('selectedPackage');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [customizations, setCustomizationsState] = useState(() => {
    try {
      const saved = localStorage.getItem('packageCustomizations');
      return saved ? JSON.parse(saved) : {
        addGuide: false,
        selectedMealOption: 'Authentic Sri Lankan Culinary Experience',
        selectedGuideOption: 'Cultural & Heritage Historian Guide'
      };
    } catch (e) {
      return {
        addGuide: false,
        selectedMealOption: 'Authentic Sri Lankan Culinary Experience',
        selectedGuideOption: 'Cultural & Heritage Historian Guide'
      };
    }
  });

  const selectPackage = (pkg) => {
    setSelectedPackage(pkg);
    localStorage.setItem('selectedPackage', JSON.stringify(pkg));
  };

  const clearPackage = () => {
    setSelectedPackage(null);
    localStorage.removeItem('selectedPackage');
  };

  const updateCustomizations = (updates) => {
    setCustomizationsState(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('packageCustomizations', JSON.stringify(next));
      return next;
    });
  };

  // Dynamic cost calculation based on business rules
  const calculatePackageCost = (pkg, days = 1, travelers = 1, custom = customizations) => {
    if (!pkg) return 100 * days * travelers;

    const safeDays = Math.max(1, Number(days) || 1);
    const safeTravelers = Math.max(1, Number(travelers) || 1);
    const baseTotal = safeDays * safeTravelers * (pkg.baseCharge || 85);

    let guideCost = 0;
    let mealExtraCost = 0;

    if (pkg.packageName === 'Standard' && custom?.addGuide) {
      guideCost = safeDays * (pkg.guideAddonPrice || 45);
    }

    if (pkg.packageName === 'Premium' && Array.isArray(pkg.mealOptions)) {
      const selectedMeal = pkg.mealOptions.find(m => m.name === custom?.selectedMealOption);
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
        calculatePackageCost
      }}
    >
      {children}
    </PackageContext.Provider>
  );
};
