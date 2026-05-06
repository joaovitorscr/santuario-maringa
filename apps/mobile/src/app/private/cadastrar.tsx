import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import { router } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { PrimaryButton } from '@/components/ui/button';
import { SelectField, TextField, ToggleField } from '@/components/ui/form-fields';
import { AppIcon } from '@/components/ui/icon';
import { HeaderBlock, SectionLabel } from '@/components/ui/layout';
import { ScreenScroll } from '@/components/ui/screen';
import { Surface } from '@/components/ui/surface';
import { ApiError } from '@/lib/api';
import { catQueryKeys, createCat } from '@/lib/cats';

const genderOptions = [
  { label: 'Selecione', value: 'Selecione' },
  { label: 'Fêmea', value: 'Fêmea' },
  { label: 'Macho', value: 'Macho' },
] as const;

const statusOptions = [
  { label: 'Selecione', value: 'Selecione' },
  { label: 'Disponível', value: 'Disponível' },
  { label: 'Indisponível', value: 'Indisponível' },
  { label: 'Em Processo de Adoção', value: 'Em Processo de Adoção' },
  { label: 'Adotado', value: 'Adotado' },
] as const;

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'Selecione' | 'Fêmea' | 'Macho'>('Selecione');
  const [status, setStatus] = useState<
    'Selecione' | 'Disponível' | 'Indisponível' | 'Em Processo de Adoção' | 'Adotado'
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
  const queryClient = useQueryClient();
  const createCatMutation = useMutation({
    mutationFn: createCat,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: catQueryKeys.all });
      Alert.alert('Residente cadastrado', 'O residente foi salvo com sucesso.');
      router.replace('/private/gatos');
    },
    onError: (error) => {
      const message =
        error instanceof ApiError || error instanceof Error ? error.message : 'Tente novamente.';

      Alert.alert('Falha ao cadastrar', message);
    },
  });

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Nome obrigatório', 'Informe o nome do residente.');
      return;
    }

    if (gender === 'Selecione') {
      Alert.alert('Gênero obrigatório', 'Selecione o gênero do residente.');
      return;
    }

    if (status === 'Selecione') {
      Alert.alert('Status obrigatório', 'Selecione o status do residente.');
      return;
    }

    createCatMutation.mutate({
      name,
      gender,
      status,
      coat,
      breed,
      weight,
      entryDate,
      birthDate,
      neutered,
      vaccinated,
      notes,
    });
  };

  return (
    <ScreenScroll contentClassName="gap-3 pb-28 pt-6">
      <View className="flex-row items-start gap-2">
        <View className="w-10 items-center pt-1">
          <AppIcon icon={ArrowLeft01Icon} size={30} />
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
          <SelectField
            label="Gênero"
            value={gender}
            onValueChange={(value) => setGender(value as typeof gender)}
            items={[...genderOptions]}
          />
          <SelectField
            label="Status"
            value={status}
            onValueChange={(value) => setStatus(value as typeof status)}
            items={[...statusOptions]}
          />
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

      <PrimaryButton
        label={createCatMutation.isPending ? 'Cadastrando...' : 'Cadastrar Residente'}
        onPress={handleSubmit}
        disabled={createCatMutation.isPending}
      />
    </ScreenScroll>
  );
}
