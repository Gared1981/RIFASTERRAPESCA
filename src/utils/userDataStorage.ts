/**
 * Utilidades para almacenar y recuperar datos de usuario
 * Permite recordar información de participantes anteriores
 */

interface UserData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  state: string;
  lastUsed: string;
}

const USER_DATA_KEY = 'terrapesca_user_data';

export const saveUserData = (userData: Omit<UserData, 'lastUsed'>): void => {
  try {
    const dataToSave: UserData = {
      ...userData,
      lastUsed: new Date().toISOString()
    };
    
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(dataToSave));
    console.log('✅ Datos de usuario guardados exitosamente');
  } catch (error: any) {
    console.error('❌ Error al guardar datos de usuario:', error);
  }
};

export const getUserData = (): UserData | null => {
  try {
    const savedData = localStorage.getItem(USER_DATA_KEY);
    if (!savedData) return null;
    
    const userData: UserData = JSON.parse(savedData);
    
    // Verificar que los datos no sean muy antiguos (más de 6 meses)
    const lastUsed = new Date(userData.lastUsed);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    if (lastUsed < sixMonthsAgo) {
      // Datos muy antiguos, eliminar
      clearUserData();
      return null;
    }
    
    console.log('✅ Datos de usuario recuperados exitosamente');
    return userData;
  } catch (error: any) {
    console.error('❌ Error al recuperar datos de usuario:', error);
    return null;
  }
};

export const clearUserData = (): void => {
  try {
    localStorage.removeItem(USER_DATA_KEY);
    console.log('✅ Datos de usuario eliminados');
  } catch (error: any) {
    console.error('❌ Error al eliminar datos de usuario:', error);
  }
};

export const hasUserData = (): boolean => {
  return getUserData() !== null;
};

export const updateUserData = (partialData: Partial<Omit<UserData, 'lastUsed'>>): void => {
  const existingData = getUserData();
  if (existingData) {
    const updatedData = {
      ...existingData,
      ...partialData
    };
    saveUserData(updatedData);
  }
};