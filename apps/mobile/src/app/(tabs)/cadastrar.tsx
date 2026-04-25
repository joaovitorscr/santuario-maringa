import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SelectFieldProps = {
  label: string;
  value: string;
  onPress: () => void;
};

function SelectField({ label, value, onPress }: SelectFieldProps) {
  const theme = useTheme();

  return (
    <View style={styles.fieldBlock}>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.fieldLabel}>
        {label}
      </ThemedText>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.inputSurface,
          { borderColor: theme.border, backgroundColor: theme.background },
          pressed && styles.pressed,
        ]}>
        <ThemedText themeColor={value.startsWith('Selecione') ? 'textSecondary' : 'text'}>{value}</ThemedText>
        <ThemedText themeColor="textSecondary">⌄</ThemedText>
      </Pressable>
    </View>
  );
}

type InputFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  keyboardType?: 'default' | 'number-pad' | 'url';
};

function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  multiline = false,
  keyboardType = 'default',
}: InputFieldProps) {
  const theme = useTheme();

  return (
    <View style={styles.fieldBlock}>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.fieldLabel}>
        {label}
      </ThemedText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[
          styles.textInput,
          {
            color: theme.text,
            borderColor: theme.border,
            backgroundColor: theme.background,
            minHeight: multiline ? 122 : 48,
          },
        ]}
      />
    </View>
  );
}

export default function RegisterScreen() {
  const theme = useTheme();
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
    setGender((current) => (current === 'Selecione' ? 'Fêmea' : current === 'Fêmea' ? 'Macho' : 'Selecione'));
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
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset + Spacing.five }]}
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <ThemedText style={styles.backIcon}>‹</ThemedText>
            </View>
            <View style={styles.headerCopy}>
              <ThemedText type="subtitle" style={styles.heading}>
                Novo Residente
              </ThemedText>
              <ThemedText themeColor="textSecondary">
                Preencha as informações do novo residente
              </ThemedText>
            </View>
          </View>

          <ThemedView type="backgroundElement" style={styles.section}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>
              Informações Básicas
            </ThemedText>
            <InputField label="Nome" placeholder="Nome do gato" value={name} onChangeText={setName} />
            <View style={styles.twoColumnRow}>
              <SelectField label="Gênero" value={gender} onPress={cycleGender} />
              <SelectField label="Status" value={status} onPress={cycleStatus} />
            </View>
            <InputField
              label="Cor / Pelagem"
              placeholder="Ex: Preta e branca, Caramelo..."
              value={coat}
              onChangeText={setCoat}
            />
            <View style={styles.twoColumnRow}>
              <InputField
                label="Raça (opcional)"
                placeholder="Ex: SRD, Persa..."
                value={breed}
                onChangeText={setBreed}
              />
              <InputField
                label="Peso em kg (opcional)"
                placeholder="Ex: 4.5"
                value={weight}
                onChangeText={setWeight}
                keyboardType="number-pad"
              />
            </View>
            <InputField
              label="URL da Foto (opcional)"
              placeholder="https://..."
              value={imageUrl}
              onChangeText={setImageUrl}
              keyboardType="url"
            />
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.section}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>
              Datas
            </ThemedText>
            <View style={styles.twoColumnRow}>
              <InputField
                label="Data de Entrada"
                placeholder="dd / mm / yyyy"
                value={entryDate}
                onChangeText={setEntryDate}
              />
              <InputField
                label="Nascimento (opcional)"
                placeholder="dd / mm / yyyy"
                value={birthDate}
                onChangeText={setBirthDate}
              />
            </View>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.section}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>
              Saúde
            </ThemedText>
            <View style={styles.switchRow}>
              <ThemedText style={styles.switchLabel}>Castrado(a)</ThemedText>
              <Switch
                value={neutered}
                onValueChange={setNeutered}
                trackColor={{ false: theme.border, true: theme.successSoft }}
                thumbColor={theme.background}
              />
            </View>
            <View style={styles.switchRow}>
              <ThemedText style={styles.switchLabel}>Vacinado(a)</ThemedText>
              <Switch
                value={vaccinated}
                onValueChange={setVaccinated}
                trackColor={{ false: theme.border, true: theme.successSoft }}
                thumbColor={theme.background}
              />
            </View>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.section}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>
              Observações
            </ThemedText>
            <InputField
              label=""
              placeholder="Histórico médico, comportamento, informações adicionais..."
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </ThemedView>

          <Pressable
            onPress={() => undefined}
            style={({ pressed }) => [
              styles.submitButton,
              { backgroundColor: theme.accent },
              pressed && styles.pressed,
            ]}>
            <ThemedText style={styles.submitLabel}>Cadastrar Residente</ThemedText>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.three,
  },
  content: {
    paddingTop: Spacing.four,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  headerIcon: {
    width: 28,
    paddingTop: 4,
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 28,
    lineHeight: 28,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  heading: {
    fontSize: 28,
    lineHeight: 34,
  },
  section: {
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  sectionLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  fieldBlock: {
    flex: 1,
    gap: 8,
  },
  fieldLabel: {
    minHeight: 20,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  inputSurface: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    fontSize: 18,
    lineHeight: 22,
  },
  submitButton: {
    minHeight: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.one,
  },
  submitLabel: {
    color: '#FFF8F1',
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.88,
  },
});
