import { apiClient, API_ENDPOINTS } from './api';
import { User, LoginCredentials, RegisterData, AuthResponse } from '../types/auth';

/**
 * Interface para a resposta de login da API
 */
interface ApiLoginResponse {
  token: string;
}

/**
 * Interface para o usuário retornado pela API
 */
interface ApiUser {
  id: number;
  nome: string;
  email: string;
  tipo: 'ADMIN' | 'MEDICO' | 'PACIENTE';
}

/**
 * Serviço de autenticação que se conecta com a API do backend
 */
export const authApiService = {
  /**
   * Faz login com a API
   */
  async signIn(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Faz a requisição de login
      const loginResponse = await apiClient.post<ApiLoginResponse>(
        API_ENDPOINTS.LOGIN,
        {
          email: credentials.email,
          senha: credentials.password,
        }
      );

      // Define o token no cliente da API
      apiClient.setToken(loginResponse.token);

      // Busca os dados do usuário
      const userData = await this.getCurrentUser();

      return {
        user: userData,
        token: loginResponse.token,
      };
    } catch (error) {
      console.error('Erro no login:', error);
      throw new Error('Email ou senha inválidos');
    }
  },

  /**
   * Registra um novo usuário (paciente)
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Cria o usuário
      const newUser = await apiClient.post<ApiUser>(API_ENDPOINTS.REGISTER, {
        nome: data.name,
        email: data.email,
        senha: data.password,
        tipo: 'PACIENTE',
      });

      // Faz login automaticamente após o registro
      return await this.signIn({
        email: data.email,
        password: data.password,
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      throw new Error('Erro ao criar conta. Verifique se o email já não está em uso.');
    }
  },

  /**
   * Obtém os dados do usuário atual baseado no token JWT
   */
  async getCurrentUser(): Promise<User> {
    try {
      // Busca o usuário atual usando o endpoint específico que utiliza o JWT
      const currentUser = await apiClient.get<ApiUser>(API_ENDPOINTS.CURRENT_USER);
      return this.mapApiUserToUser(currentUser);
    } catch (error) {
      console.error('Erro ao buscar usuário atual:', error);
      throw new Error('Erro ao carregar dados do usuário');
    }
  },

  /**
   * Mapeia um usuário da API para o formato usado no frontend
   */
  mapApiUserToUser(apiUser: ApiUser): User {
    const baseUser = {
      id: apiUser.id.toString(),
      name: apiUser.nome,
      email: apiUser.email,
      let image: string;
        if (apiUser.tipo === 'ADMIN') {
        // NOVO - Ícone de avatar para admins - SVG simples de usuário
          image = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjUwIiBmaWxsPSIjNjY2NjY2Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iMzUiIHI9IjE1IiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNNTAgNjVDMzUgNjUgMjUgNzUgMjUgODVWOTVINzVWODVDNzUgNzUgNjUgNjUgNTAgNjVaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
        } else {
          // Fotos aleatórias para médicos e pacientes
          image = `https://randomuser.me/api/portraits/${apiUser.id % 2 === 0 ? 'men' : 'women'}/${(apiUser.id % 10) + 1}.jpg`;
        }
    };

    switch (apiUser.tipo) {
      case 'ADMIN':
        return { ...baseUser, role: 'admin' as const };
          case 'MEDICO':
            return { ...baseUser,
        role: 'doctor' as const,
        specialty: apiUser.especialidade || 'Especialidade não informada'};
      case 'PACIENTE':
        return { ...baseUser, role: 'patient' as const };
      default:
        throw new Error(`Tipo de usuário inválido: ${apiUser.tipo}`);
    }
  },

  async getAllDoctors(): Promise<User[]> {
    try {
      const doctors = await apiClient.get<ApiUser[]>(API_ENDPOINTS.DOCTORS);
      return doctors.map(this.mapApiUserToUser);
    } catch (error) {
      console.error('Erro ao buscar médicos:', error);
      throw new Error('Erro ao carregar médicos');
    }
  },
  
  async getDoctorsBySpecialty(specialty: string): Promise<User[]> {
    try {
      const doctors = await apiClient.get<ApiUser[]>(
        `${API_ENDPOINTS.DOCTORS}?especialidade=${encodeURIComponent(specialty)}`
      );
      return doctors.map(this.mapApiUserToUser);
    } catch (error) {
      console.error('Erro ao buscar médicos por especialidade:', error);
      throw new Error('Erro ao carregar médicos da especialidade');
    }
  },
};
