import { ApiCat, buildObservationPayload, mapApiCatToResident } from '@/data/residents';
import { apiFetch } from '@/lib/api';

export const catQueryKeys = {
  all: ['cats'] as const,
  detail: (id: string) => ['cats', id] as const,
};

type CreateCatInput = {
  name: string;
  gender: 'Fêmea' | 'Macho';
  status: 'Disponível' | 'Indisponível' | 'Em Processo de Adoção' | 'Adotado';
  coat: string;
  breed: string;
  weight: string;
  entryDate: string;
  birthDate: string;
  neutered: boolean;
  vaccinated: boolean;
  notes: string;
};

function mapStatusToApi(status: CreateCatInput['status']): ApiCat['adoptionStatus'] {
  if (status === 'Adotado') return 'Adopted';
  if (status === 'Em Processo de Adoção') return 'Adoption Process';
  if (status === 'Disponível') return 'Available';
  return 'Not Available';
}

function mapGenderToApi(gender: CreateCatInput['gender']): ApiCat['gender'] {
  return gender === 'Fêmea' ? 'Female' : 'Male';
}

function parseDateInput(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  const match = normalized.match(/^(\d{2})\s*\/\s*(\d{2})\s*\/\s*(\d{4})$/);

  if (!match) {
    return null;
  }

  const [, day, month, year] = match;
  const iso = new Date(`${year}-${month}-${day}T12:00:00.000Z`);

  if (Number.isNaN(iso.getTime())) {
    return null;
  }

  const validDate =
    iso.getUTCFullYear() === Number(year) &&
    iso.getUTCMonth() + 1 === Number(month) &&
    iso.getUTCDate() === Number(day);

  return validDate ? iso.toISOString() : null;
}

export async function fetchResidents() {
  const cats = await apiFetch<ApiCat[]>('/cat');
  return cats.map(mapApiCatToResident);
}

export async function fetchResident(id: string) {
  const cat = await apiFetch<ApiCat>(`/cat/${id}`);
  return mapApiCatToResident(cat);
}

export async function createCat(input: CreateCatInput) {
  const entryDate = parseDateInput(input.entryDate);

  if (!entryDate) {
    throw new Error('A data de entrada deve estar no formato dd / mm / yyyy.');
  }

  const birthDate = parseDateInput(input.birthDate);

  if (input.birthDate.trim() && !birthDate) {
    throw new Error('A data de nascimento deve estar no formato dd / mm / yyyy.');
  }

  return apiFetch<ApiCat>('/cat', {
    method: 'POST',
    data: {
      name: input.name.trim(),
      pictureBase64: null,
      adoptionTermBase64: null,
      adoptionTermMimeType: null,
      medicalExamBase64: null,
      medicalExamMimeType: null,
      furTypeId: null,
      adoptionStatus: mapStatusToApi(input.status),
      entryDate,
      adoptionDate: null,
      birthDate,
      race: input.breed.trim() || 'Sem raça definida',
      gender: mapGenderToApi(input.gender),
      isCastrated: input.neutered,
      isVaccinated: input.vaccinated,
      weightKg: input.weight.trim() || null,
      isFiv: false,
      isFelv: false,
      observation: buildObservationPayload(input.coat, input.notes),
    },
  });
}
