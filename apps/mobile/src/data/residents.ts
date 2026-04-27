export type ResidentStatus =
  | 'Disponível'
  | 'Indisponível'
  | 'Em Processo de Adoção'
  | 'Adotado';

export type ResidentSex = 'Fêmea' | 'Macho';

export type Resident = {
  id: string;
  name: string;
  sex: ResidentSex;
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

export type ApiCat = {
  id: string;
  name: string;
  furType: {
    id: string;
    name: string;
  } | null;
  adoptionStatus: 'Adopted' | 'Adoption Process' | 'Available' | 'Not Available';
  entryDate: string;
  birthDate: string | null;
  race: string;
  gender: 'Male' | 'Female';
  isCastrated: boolean;
  isVaccinated: boolean;
  weightKg: string | null;
  observation: string | null;
};

const coatPrefix = 'Pelagem:';

function formatDate(value: string | null) {
  if (!value) {
    return 'Não informado';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Não informado';
  }

  return new Intl.DateTimeFormat('pt-BR').format(date);
}

function mapStatus(status: ApiCat['adoptionStatus']): ResidentStatus {
  if (status === 'Adopted') return 'Adotado';
  if (status === 'Adoption Process') return 'Em Processo de Adoção';
  if (status === 'Available') return 'Disponível';
  return 'Indisponível';
}

function mapSex(gender: ApiCat['gender']): ResidentSex {
  return gender === 'Female' ? 'Fêmea' : 'Macho';
}

function extractCoat(observation: string | null, fallback: string) {
  if (!observation) {
    return fallback;
  }

  const [firstLine] = observation.split('\n');

  if (firstLine.startsWith(coatPrefix)) {
    const coat = firstLine.slice(coatPrefix.length).trim();
    return coat.length > 0 ? coat : fallback;
  }

  return fallback;
}

function extractNotes(observation: string | null) {
  if (!observation) {
    return 'Sem observações.';
  }

  const lines = observation.split('\n');

  if (lines[0]?.startsWith(coatPrefix)) {
    const notes = lines.slice(1).join('\n').trim();
    return notes.length > 0 ? notes : 'Sem observações.';
  }

  return observation.trim() || 'Sem observações.';
}

export function mapApiCatToResident(cat: ApiCat): Resident {
  const fallbackCoat = cat.furType?.name ?? cat.race;

  return {
    id: cat.id,
    name: cat.name,
    sex: mapSex(cat.gender),
    coat: extractCoat(cat.observation, fallbackCoat),
    breed: cat.race,
    weightKg: cat.weightKg ?? 'Não informado',
    entryDate: formatDate(cat.entryDate),
    birthDate: formatDate(cat.birthDate),
    status: mapStatus(cat.adoptionStatus),
    neutered: cat.isCastrated,
    vaccinated: cat.isVaccinated,
    notes: extractNotes(cat.observation),
  };
}

export function buildObservationPayload(coat: string, notes: string) {
  const parts = [coat.trim() ? `${coatPrefix} ${coat.trim()}` : '', notes.trim()].filter(Boolean);

  return parts.length > 0 ? parts.join('\n\n') : null;
}
