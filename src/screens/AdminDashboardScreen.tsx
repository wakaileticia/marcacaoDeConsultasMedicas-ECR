import React, { useState } from 'react';
import styled from 'styled-components/native';
import { ScrollView, ViewStyle, TextStyle } from 'react-native';
import { Button, ListItem, Text } from 'react-native-elements';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import theme from '../styles/theme';
import Header from '../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserManagement from '../components/UserManagement';

type AdminDashboardScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AdminDashboard'>;
};

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  specialty: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'doctor' | 'patient';
}

interface StyledProps {
  status: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return theme.colors.success;
    case 'cancelled':
      return theme.colors.error;
    default:
      return theme.colors.warning;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'Confirmada';
    case 'cancelled':
      return 'Cancelada';
    default:
      return 'Pendente';
  }
};

const AdminDashboardScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<AdminDashboardScreenProps['navigation']>();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'appointments' | 'users'>('appointments');

  const loadData = async () => {
    try {
      // Carrega consultas
      const storedAppointments = await AsyncStorage.getItem('@MedicalApp:appointments');
      if (storedAppointments) {
        const allAppointments: Appointment[] = JSON.parse(storedAppointments);
        setAppointments(allAppointments);
      }

      // Carrega usuários
      const storedUsers = await AsyncStorage.getItem('@MedicalApp:users');
      if (storedUsers) {
        const allUsers: User[] = JSON.parse(storedUsers);
        setUsers(allUsers);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carrega os dados quando a tela estiver em foco
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const handleUpdateStatus = async (appointmentId: string, newStatus: 'confirmed' | 'cancelled') => {
    try {
      const storedAppointments = await AsyncStorage.getItem('@MedicalApp:appointments');
      if (storedAppointments) {
        const allAppointments: Appointment[] = JSON.parse(storedAppointments);
        const updatedAppointments = allAppointments.map(appointment => {
          if (appointment.id === appointmentId) {
            return { ...appointment, status: newStatus };
          }
          return appointment;
        });
        await AsyncStorage.setItem('@MedicalApp:appointments', JSON.stringify(updatedAppointments));
        loadData(); // Recarrega os dados
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  return (
    <Container>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Title>Painel Administrativo</Title>

        {/* NOVO - Abas de navegação */}
        <TabContainer>
          <TabButton
            active={activeTab === 'appointments'}
            onPress={() => setActiveTab('appointments')}
          >
            <TabText active={activeTab === 'appointments'}>Consultas</TabText>
          </TabButton>
          <TabButton
            active={activeTab === 'users'}
            onPress={() => setActiveTab('users')}
          >
            <TabText active={activeTab === 'users'}>Usuários</TabText>
          </TabButton>
        </TabContainer>

        {/* CONTEÚDO CONDICIONAL baseado na aba ativa */}
        {activeTab === 'appointments' ? (
          <>
            <SectionTitle>Últimas Consultas</SectionTitle>
            {/* ... código existente das consultas ... */}
          </>
        ) : (
          <UserManagement />
        )}

        <Button
          title="Sair"
          onPress={signOut}
          containerStyle={styles.button as ViewStyle}
          buttonStyle={styles.logoutButton}
        />
      </ScrollView>
    </Container>
  );

const TabContainer = styled.View`
  flex-direction: row;
  background-color: ${theme.colors.surface};
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid ${theme.colors.border};
`;

const TabButton = styled.TouchableOpacity<{ active: boolean }>`
  flex: 1;
  padding: 12px;
  align-items: center;
  background-color: ${props => props.active ? theme.colors.primary : 'transparent'};
  border-radius: 8px;
`;

const TabText = styled.Text<{ active: boolean }>`
  color: ${props => props.active ? '#fff' : theme.colors.text};
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  font-size: 16px;
`;