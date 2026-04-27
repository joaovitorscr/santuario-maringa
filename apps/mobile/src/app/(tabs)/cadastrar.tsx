import React, { useState } from 'react';
import { View } from 'react-native';

import { PrimaryButton } from '@/components/ui/button';
import { SelectField, TextField, ToggleField } from '@/components/ui/form-fields';
import { AppText } from '@/components/ui/app-text';
import { HeaderBlock, SectionLabel } from '@/components/ui/layout';
import { ScreenScroll } from '@/components/ui/screen';
import { Surface } from '@/components/ui/surface';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'Selecione' | 'Fêmea' | 'Macho'>('Selecione');
  const [status, setStatus] = useState<
    'Selecione' | 'Residente Permanente' | 'Em Processo de Adoção' | 'Em Tratamento'
  >('Selecione');
  const [coat, setCoat] = useState('');
  const [breed, setBreed] = useState('');
  const [weight, setWeight] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [entryDate, setEntryDate] = useState('21 / 04 / 2026');
  const [birthDate, setBirthDate] = useState('');
  const [neutered, setNeutered] = useState(false);
  const [vaccinated, setVaccinated] = useState(false);
  const [notes, setNotes] = useState('');

  const cycleGender = () => {
    setGender((current) =>
      current === 'Selecione' ? 'Fêmea' : current === 'Fêmea' ? 'Macho' : 'Selecione',
    );
  };

  const cycleStatus = () => {
    setStatus((current) => {
      if (current === 'Selecione') return 'Residente Permanente';
      if (current === 'Residente Permanente') return 'Em Processo de Adoção';
      if (current === 'Em Processo de Adoção') return 'Em Tratamento';
      return 'Selecione';
    });
  };

  return (
    <ScreenScroll contentClassName="gap-3 pb-28 pt-6">
      <View className="flex-row items-start gap-2">
        <View className="w-7 items-center pt-1">
          <AppText className="text-[28px] leading-7">‹</AppText>
        </View>
        <HeaderBlock
          className="flex-1"
          title="Novo Residente"
          subtitle="Preencha as informações do novo residente"
        />
      </View>

      <Surface className="gap-4 p-4">
        <SectionLabel>Informações Básicas</SectionLabel>
        <TextField label="Nome" placeholder="Nome do gato" value={name} onChangeText={setName} />
        <View className="flex-row gap-4">
          <SelectField label="Gênero" value={gender} onPress={cycleGender} />
          <SelectField label="Status" value={status} onPress={cycleStatus} />
        </View>
        <TextField
          label="Cor / Pelagem"
          placeholder="Ex: Preta e branca, Caramelo..."
          value={coat}
          onChangeText={setCoat}
        />
        <View className="flex-row gap-4">
          <TextField
            label="Raça (opcional)"
            placeholder="Ex: SRD, Persa..."
            value={breed}
            onChangeText={setBreed}
          />
          <TextField
            label="Peso em kg (opcional)"
            placeholder="Ex: 4.5"
            value={weight}
            onChangeText={setWeight}
            keyboardType="number-pad"
          />
        </View>
        <TextField
          label="URL da Foto (opcional)"
          placeholder="https://..."
          value={imageUrl}
          onChangeText={setImageUrl}
          keyboardType="url"
        />
      </Surface>

      <Surface className="gap-4 p-4">
        <SectionLabel>Datas</SectionLabel>
        <View className="flex-row gap-4">
          <TextField
            label="Data de Entrada"
            placeholder="dd / mm / yyyy"
            value={entryDate}
            onChangeText={setEntryDate}
          />
          <TextField
            label="Nascimento (opcional)"
            placeholder="dd / mm / yyyy"
            value={birthDate}
            onChangeText={setBirthDate}
          />
        </View>
      </Surface>

      <Surface className="gap-4 p-4">
        <SectionLabel>Saúde</SectionLabel>
        <ToggleField label="Castrado(a)" value={neutered} onValueChange={setNeutered} />
        <ToggleField label="Vacinado(a)" value={vaccinated} onValueChange={setVaccinated} />
      </Surface>

      <Surface className="gap-4 p-4">
        <SectionLabel>Observações</SectionLabel>
        <TextField
          label=""
          placeholder="Histórico médico, comportamento, informações adicionais..."
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </Surface>

      <PrimaryButton label="Cadastrar Residente" onPress={() => undefined} />
    </ScreenScroll>
  );
}
