import { authApiService } from '../services/authApi';
import { specialtiesApiService, Specialty } from '../services/specialtiesApi';

const AppointmentForm: React.FC<AppointmentFormProps> = ({ onSubmit }) => {
   const [selectedDoctor, setSelectedDoctor] = useState<string>('');
   const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');  // ← NOVO!
   
   // Estados para dados da API  ← NOVO!
   const [doctors, setDoctors] = useState<User[]>([]);
   const [specialties, setSpecialties] = useState<Specialty[]>([]);
   const [loading, setLoading] = useState(true);

   // Carrega dados ao montar o componente  ← NOVO!
   useEffect(() => {
      loadInitialData();
   }, []);

   // Carrega médicos por especialidade  ← NOVO!
   useEffect(() => {
      if (selectedSpecialty) {
         loadDoctorsBySpecialty(selectedSpecialty);
      } else {
         loadAllDoctors();
      }
   }, [selectedSpecialty]);

   const loadInitialData = async () => {  // ← NOVO!
      try {
         setLoading(true);
         const [specialtiesData, doctorsData] = await Promise.all([
            specialtiesApiService.getAllSpecialties(),
            authApiService.getAllDoctors(),
         ]);
         
         setSpecialties(specialtiesData);
         setDoctors(doctorsData);
      } catch (error) {
         console.error('Erro ao carregar dados:', error);
         Alert.alert('Erro', 'Não foi possível carregar os dados. Tente novamente.');
      } finally {
         setLoading(false);
      }
   };

   // Interface com seleção de especialidade  ← NOVO!
   return (
      <Container>
         <Title>Selecione a Especialidade</Title>  {/* ← NOVO! */}
         <SpecialtyContainer>
            {specialties.map((specialty) => (  // ← Dados reais da API
               <SpecialtyButton
                  key={specialty.id}
                  selected={selectedSpecialty === specialty.name}
                  onPress={() => setSelectedSpecialty(specialty.name)}
               >
                  <SpecialtyText>{specialty.name}</SpecialtyText>
               </SpecialtyButton>
            ))}
         </SpecialtyContainer>

         <Title>Selecione o Médico</Title>
         <DoctorList>
            {doctors.map((doctor) => (  // ← Agora dados dinâmicos
               <DoctorCard key={doctor.id}>
                  {/* ... */}
               </DoctorCard>
            ))}
         </DoctorList>
         {/* ... resto do formulário */}
      </Container>
   );
