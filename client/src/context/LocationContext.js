import React, { createContext, useContext, useState, useCallback } from 'react';

const LocationContext = createContext();

const states = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export function LocationProvider({ children }) {
  const [citiesCache, setCitiesCache] = useState({});
  const [loading, setLoading] = useState({});

  const getStates = () => states;
  
  const getCitiesByState = useCallback(async (state) => {
    if (!state) return [];
    
    // Return cached cities if available
    if (citiesCache[state]) {
      return citiesCache[state];
    }
    
    // Return empty array if already loading
    if (loading[state]) {
      return [];
    }
    
    try {
      setLoading(prev => ({ ...prev, [state]: true }));
      
      // Using REST Countries API for Indian cities
      const response = await fetch(`https://api.countrystatecity.in/v1/countries/IN/states/${getStateCode(state)}/cities`, {
        headers: {
          'X-CSCAPI-KEY': 'NHhvOEcyWk50N2Vna3VFTE00bFp3MjFKR0ZEOUhkZlg4RTk1MlJlaA=='
        }
      });
      const data = await response.json();
      
      let cities = [];
      if (data && Array.isArray(data)) {
        cities = data.map(city => city.name).filter(name => name).sort();
      }
      
      // Fallback to basic cities if API fails or no data
      if (cities.length === 0) {
        cities = getBasicCities(state);
      }
      
      setCitiesCache(prev => ({ ...prev, [state]: cities }));
      return cities;
    } catch (error) {
      console.error('Error fetching cities:', error);
      const fallbackCities = getBasicCities(state);
      setCitiesCache(prev => ({ ...prev, [state]: fallbackCities }));
      return fallbackCities;
    } finally {
      setLoading(prev => ({ ...prev, [state]: false }));
    }
  }, [citiesCache, loading]);
  
  const getStateCode = (stateName) => {
    const stateCodes = {
      "Andhra Pradesh": "AP", "Arunachal Pradesh": "AR", "Assam": "AS", "Bihar": "BR", "Chhattisgarh": "CG", "Goa": "GA", "Gujarat": "GJ", "Haryana": "HR", "Himachal Pradesh": "HP", "Jharkhand": "JH", "Karnataka": "KA", "Kerala": "KL", "Madhya Pradesh": "MP", "Maharashtra": "MH", "Manipur": "MN", "Meghalaya": "ML", "Mizoram": "MZ", "Nagaland": "NL", "Odisha": "OR", "Punjab": "PB", "Rajasthan": "RJ", "Sikkim": "SK", "Tamil Nadu": "TN", "Telangana": "TS", "Tripura": "TR", "Uttar Pradesh": "UP", "Uttarakhand": "UK", "West Bengal": "WB", "Andaman and Nicobar Islands": "AN", "Chandigarh": "CH", "Dadra and Nagar Haveli and Daman and Diu": "DH", "Delhi": "DL", "Jammu and Kashmir": "JK", "Ladakh": "LA", "Lakshadweep": "LD", "Puducherry": "PY"
    };
    return stateCodes[stateName] || stateName;
  };
  
  const getBasicCities = (state) => {
    const basicCities = {
      "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Amravati", "Kolhapur", "Sangli"],
      "Karnataka": ["Bengaluru", "Mysuru", "Hubli", "Mangaluru", "Belagavi", "Kalaburagi", "Davanagere", "Ballari", "Vijayapura", "Shivamogga"],
      "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Tiruppur", "Vellore", "Erode", "Thoothukudi"],
      "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Navsari"],
      "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara", "Alwar", "Bharatpur", "Sikar"],
      "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi", "Meerut", "Prayagraj", "Bareilly", "Aligarh", "Moradabad"],
      "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Bardhaman", "Malda", "Baharampur", "Habra", "Kharagpur"],
      "Delhi": ["Central Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "North East Delhi", "North West Delhi", "South East Delhi", "South West Delhi", "New Delhi"]
    };
    return basicCities[state] || [state];
  };

  const value = {
    getStates,
    getCitiesByState,
    loading
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}