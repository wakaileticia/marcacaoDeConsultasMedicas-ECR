import { authApiService } from '../services/authApi';  // ← Serviço da API
import { apiClient } from '../services/api';

const loadStoredUser = async () => {
  try {
    // Carrega o token salvo
    const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    
    if (storedToken && storedUser) {
      // Configura o token no cliente da API  ← NOVO!
      apiClient.setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  } catch (error) {
    console.error('Erro ao carregar usuário:', error);
    // Se houver erro, limpa os dados armazenados  ← NOVO!
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
  } finally {
    setLoading(false);
  }
};

const signIn = async (credentials: LoginCredentials) => {
  try {
    const response = await authApiService.signIn(credentials);  // ← Login real!
    setUser(response.user);
    
    // Salva os dados no AsyncStorage para persistência
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
  } catch (error) {
    throw error;
  }
};