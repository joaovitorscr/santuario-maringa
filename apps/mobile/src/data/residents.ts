export type ResidentStatus =
  | 'Residente Permanente'
  | 'Em Processo de Adoção'
  | 'Em Tratamento'
  | 'Adotado';

export type Resident = {
  id: string;
  name: string;
  sex: 'Fêmea' | 'Macho';
  coat: string;
  breed: string;
  weightKg: string;
  entryDate: string;
  birthDate: string;
  status: ResidentStatus;
  neutered: boolean;
  vaccinated: boolean;
  notes: string;
};

export const residents: Resident[] = [
  {
    id: 'luna',
    name: 'Luna',
    sex: 'Fêmea',
    coat: 'Preta e branca',
    breed: 'Sem raça definida',
    weightKg: '3.2',
    entryDate: '15/03/2023',
    birthDate: '10/01/2022',
    status: 'Residente Permanente',
    neutered: true,
    vaccinated: true,
    notes: 'Muito sociável, tolera bem outros gatos e gosta de áreas ensolaradas.',
  },
  {
    id: 'thor',
    name: 'Thor',
    sex: 'Macho',
    coat: 'Laranja',
    breed: 'Sem raça definida',
    weightKg: '4.6',
    entryDate: '20/11/2022',
    birthDate: '08/08/2021',
    status: 'Residente Permanente',
    neutered: true,
    vaccinated: true,
    notes: 'Gosta de rotina previsível e responde bem a enriquecimento ambiental.',
  },
  {
    id: 'mel',
    name: 'Mel',
    sex: 'Fêmea',
    coat: 'Caramelo',
    breed: 'Sem raça definida',
    weightKg: '3.8',
    entryDate: '08/01/2024',
    birthDate: '14/06/2023',
    status: 'Em Processo de Adoção',
    neutered: true,
    vaccinated: true,
    notes: 'Perfil dócil e já em etapa final de entrevista com adotante.',
  },
  {
    id: 'simba',
    name: 'Simba',
    sex: 'Macho',
    coat: 'Laranja e branco',
    breed: 'Sem raça definida',
    weightKg: '4.9',
    entryDate: '22/07/2023',
    birthDate: '11/02/2022',
    status: 'Em Tratamento',
    neutered: false,
    vaccinated: true,
    notes: 'Em acompanhamento médico e com retorno agendado para revisão.',
  },
  {
    id: 'nala',
    name: 'Nala',
    sex: 'Fêmea',
    coat: 'Cinza',
    breed: 'Sem raça definida',
    weightKg: '3.5',
    entryDate: '14/02/2024',
    birthDate: '05/09/2023',
    status: 'Em Processo de Adoção',
    neutered: true,
    vaccinated: false,
    notes: 'Boa adaptação com humanos, ainda avaliando convivência com cães.',
  },
  {
    id: 'bob',
    name: 'Bob',
    sex: 'Macho',
    coat: 'Preto',
    breed: 'Sem raça definida',
    weightKg: '5.1',
    entryDate: '10/05/2022',
    birthDate: '17/12/2020',
    status: 'Residente Permanente',
    neutered: true,
    vaccinated: true,
    notes: 'Mais reservado, prefere ambientes tranquilos e pontos altos.',
  },
  {
    id: 'mimi',
    name: 'Mimi',
    sex: 'Fêmea',
    coat: 'Branca',
    breed: 'Sem raça definida',
    weightKg: '3.4',
    entryDate: '01/03/2024',
    birthDate: '21/10/2022',
    status: 'Adotado',
    neutered: true,
    vaccinated: true,
    notes: 'Adotada recentemente e em acompanhamento pós-adoção.',
  },
  {
    id: 'fred',
    name: 'Fred',
    sex: 'Macho',
    coat: 'Rajado',
    breed: 'Sem raça definida',
    weightKg: '4.3',
    entryDate: '09/09/2023',
    birthDate: '01/04/2022',
    status: 'Residente Permanente',
    neutered: true,
    vaccinated: true,
    notes: 'Ativo e curioso, demanda rotina com brincadeiras e observação.',
  },
];

export function getResidentById(id: string) {
  return residents.find((resident) => resident.id === id);
}
