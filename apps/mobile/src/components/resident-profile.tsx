import {
  Calendar03Icon,
  CalendarFavorite01Icon,
  Download01Icon,
  FileDownloadIcon,
  FileUploadIcon,
  FileViewIcon,
  FavouriteIcon,
  InformationCircleIcon,
  MedicalFileIcon,
  Note01Icon,
  PaintBucketIcon,
  Tag01Icon,
  UserIcon,
  VaccineIcon,
  WeightIcon,
} from "@hugeicons/core-free-icons";
import { type IconSvgElement } from "@hugeicons/react-native";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import React from "react";
import { Alert, Linking, Platform, Pressable, View } from "react-native";

import { ResidentAvatar } from "@/components/resident-avatar";
import { StatusChip } from "@/components/status-chip";
import { AppText } from "@/components/ui/app-text";
import { HealthBadge } from "@/components/ui/button";
import { AppIcon } from "@/components/ui/icon";
import { SectionHeader } from "@/components/ui/section-header";
import { Surface } from "@/components/ui/surface";
import { useTheme } from "@/hooks/use-theme";
import { type Resident } from "@/data/residents";

type ResidentProfileProps = {
  resident: Resident;
};

type DetailItem = {
  icon: IconSvgElement;
  label: string;
  value: string;
};

type ResidentDocument = {
  icon: IconSvgElement;
  title: string;
  base64: string | null;
  mimeType: string | null;
  filePrefix: string;
};

export function ResidentProfile({ resident }: ResidentProfileProps) {
  const weightLabel =
    resident.weightKg === "Não informado"
      ? resident.weightKg
      : `${resident.weightKg} kg`;
  const details: DetailItem[] = [
    { icon: Calendar03Icon, label: "Entrada", value: resident.entryDate },
    {
      icon: CalendarFavorite01Icon,
      label: "Adoção",
      value: resident.adoptionDate,
    },
    {
      icon: CalendarFavorite01Icon,
      label: "Nascimento",
      value: resident.birthDate,
    },
    { icon: Tag01Icon, label: "Raça", value: resident.breed },
    { icon: PaintBucketIcon, label: "Pelagem", value: resident.coat },
    {
      icon: Tag01Icon,
      label: "Tipo de Pelagem",
      value: resident.furTypeId || "Não informado",
    },
  ];
  const documents: ResidentDocument[] = [
    {
      icon: FileUploadIcon,
      title: "Termo de Adoção",
      base64: resident.adoptionTermBase64,
      mimeType: resident.adoptionTermMimeType,
      filePrefix: "termo-adocao",
    },
    {
      icon: MedicalFileIcon,
      title: "Exame Médico",
      base64: resident.medicalExamBase64,
      mimeType: resident.medicalExamMimeType,
      filePrefix: "exame-medico",
    },
  ];

  return (
    <View className="gap-3">
      <Surface tone="accentSoft" className="overflow-hidden">
        <View className="items-center gap-4 px-5 pb-5 pt-6">
          <View className="rounded-full border-[6px] border-app-surface bg-app-surface p-1 dark:border-app-surface-dark dark:bg-app-surface-dark">
            <ResidentAvatar
              name={resident.name}
              pictureBase64={resident.pictureBase64}
              size="hero"
            />
          </View>

          <View className="w-full items-center gap-2">
            <StatusChip status={resident.status} />
            <AppText variant="subtitle" className="text-center" selectable>
              {resident.name}
            </AppText>
            <AppText tone="muted" className="text-center" selectable>
              {resident.sex} · {resident.coat}
            </AppText>
          </View>
        </View>

        <View className="border-t border-app-border/70 bg-app-surface/70 px-3 py-3 dark:border-app-border-dark dark:bg-app-surface-dark/70">
          <View className="flex-row gap-3">
            <ProfileStat icon={UserIcon} label="Gênero" value={resident.sex} />
            <ProfileStat icon={WeightIcon} label="Peso" value={weightLabel} />
          </View>
        </View>
      </Surface>

      <Surface className="gap-3 p-4">
        <SectionHeader icon={InformationCircleIcon} label="Informações" />
        <View className="gap-2">
          {details.map((detail) => (
            <DetailRow key={detail.label} {...detail} />
          ))}
        </View>
      </Surface>

      <Surface className="gap-3 p-4">
        <SectionHeader icon={FavouriteIcon} label="Saúde" />
        <View className="flex-row gap-3">
          <HealthTile
            icon={FavouriteIcon}
            label="Castrado(a)"
            active={resident.neutered}
            value={resident.neutered ? "Sim" : "Não"}
          />
          <HealthTile
            icon={VaccineIcon}
            label="Vacinado(a)"
            active={resident.vaccinated}
            value={resident.vaccinated ? "Sim" : "Não"}
          />
        </View>
        <View className="flex-row gap-3">
          <HealthTile
            icon={MedicalFileIcon}
            label="FIV"
            active={resident.fiv}
            value={resident.fiv ? "Sim" : "Não"}
          />
          <HealthTile
            icon={MedicalFileIcon}
            label="FeLV"
            active={resident.felv}
            value={resident.felv ? "Sim" : "Não"}
          />
        </View>
      </Surface>

      <Surface className="gap-3 p-4">
        <SectionHeader icon={FileDownloadIcon} label="Documentos" />
        <View className="gap-2">
          {documents.map((document) => (
            <DocumentRow
              key={document.title}
              document={document}
              residentName={resident.name}
            />
          ))}
        </View>
      </Surface>

      <Surface className="gap-3 p-4">
        <SectionHeader icon={Note01Icon} label="Observações" />
        <AppText tone="muted" selectable>
          {resident.notes}
        </AppText>
      </Surface>
    </View>
  );
}

function normalizeBase64(base64: string) {
  return base64.startsWith("data:") ? base64.split(",")[1] : base64;
}

function getExtension(mimeType?: string | null) {
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "image/heic") return "heic";
  return "jpg";
}

function getDocumentName(
  residentName: string,
  prefix: string,
  mimeType?: string | null,
) {
  const normalizedName = residentName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `${prefix}-${normalizedName || "residente"}.${getExtension(mimeType)}`;
}

function buildDataUri(base64: string, mimeType?: string | null) {
  return `data:${mimeType || "application/octet-stream"};base64,${normalizeBase64(base64)}`;
}

function downloadOnWeb(
  fileName: string,
  base64: string,
  mimeType?: string | null,
) {
  const anchor = document.createElement("a");
  anchor.href = buildDataUri(base64, mimeType);
  anchor.download = fileName;
  anchor.click();
}

async function writeDocumentToCache(fileName: string, base64: string) {
  const file = new File(Paths.cache, fileName);
  file.create({ overwrite: true });
  file.write(normalizeBase64(base64), { encoding: "base64" });
  return file.uri;
}

async function openDocument(document: ResidentDocument, residentName: string) {
  if (!document.base64) {
    return;
  }

  const fileName = getDocumentName(
    residentName,
    document.filePrefix,
    document.mimeType,
  );

  try {
    if (Platform.OS === "web") {
      window.open(buildDataUri(document.base64, document.mimeType), "_blank");
      return;
    }

    const uri = await writeDocumentToCache(fileName, document.base64);
    await Linking.openURL(uri);
  } catch {
    await shareDocument(document, residentName);
  }
}

async function shareDocument(document: ResidentDocument, residentName: string) {
  if (!document.base64) {
    return;
  }

  const fileName = getDocumentName(
    residentName,
    document.filePrefix,
    document.mimeType,
  );

  try {
    if (Platform.OS === "web") {
      downloadOnWeb(fileName, document.base64, document.mimeType);
      return;
    }

    const uri = await writeDocumentToCache(fileName, document.base64);
    const available = await Sharing.isAvailableAsync();

    if (!available) {
      await Linking.openURL(uri);
      return;
    }

    await Sharing.shareAsync(uri, {
      mimeType: document.mimeType || undefined,
      dialogTitle: document.title,
      UTI:
        document.mimeType === "application/pdf" ? "com.adobe.pdf" : undefined,
    });
  } catch {
    Alert.alert(
      "Arquivo indisponível",
      "Não foi possível abrir este documento.",
    );
  }
}

function DocumentRow({
  document,
  residentName,
}: {
  document: ResidentDocument;
  residentName: string;
}) {
  const theme = useTheme();
  const hasFile = Boolean(document.base64);

  return (
    <View className="gap-3 rounded-lg bg-app-background p-3 dark:bg-app-background-dark">
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-lg bg-app-surface dark:bg-app-surface-dark">
          <AppIcon icon={document.icon} size={22} color={theme.textSecondary} />
        </View>
        <View className="min-w-0 flex-1">
          <AppText variant="smallBold">{document.title}</AppText>
          <AppText variant="small" tone="muted" numberOfLines={1}>
            {hasFile
              ? document.mimeType || "Arquivo anexado"
              : "Nenhum arquivo anexado"}
          </AppText>
        </View>
      </View>
      {hasFile ? (
        <View className="flex-row gap-2">
          <DocumentButton
            icon={FileViewIcon}
            label="Visualizar"
            onPress={() => openDocument(document, residentName)}
          />
          <DocumentButton
            icon={Download01Icon}
            label="Baixar"
            onPress={() => shareDocument(document, residentName)}
          />
        </View>
      ) : null}
    </View>
  );
}

function DocumentButton({
  icon,
  label,
  onPress,
}: {
  icon: IconSvgElement;
  label: string;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      className="min-h-11 flex-1 flex-row items-center justify-center gap-2 rounded-lg border border-app-border bg-app-surface px-3 dark:border-app-border-dark dark:bg-app-surface-dark"
      onPress={onPress}
    >
      <AppIcon icon={icon} size={19} color={theme.textSecondary} />
      <AppText variant="smallBold" numberOfLines={1}>
        {label}
      </AppText>
    </Pressable>
  );
}

function ProfileStat({ icon, label, value }: DetailItem) {
  const theme = useTheme();

  return (
    <View className="min-h-[74px] flex-1 justify-between rounded-lg border border-app-border bg-app-surface px-3 py-3 dark:border-app-border-dark dark:bg-app-surface-dark">
      <View className="flex-row items-center gap-2">
        <AppIcon icon={icon} size={18} color={theme.textSecondary} />
        <AppText variant="small" tone="muted">
          {label}
        </AppText>
      </View>
      <AppText variant="smallBold" selectable>
        {value}
      </AppText>
    </View>
  );
}

function DetailRow({ icon, label, value }: DetailItem) {
  const theme = useTheme();

  return (
    <View className="min-h-[62px] flex-row items-center gap-3 rounded-lg bg-app-background px-3 py-3 dark:bg-app-background-dark">
      <View className="h-10 w-10 items-center justify-center rounded-lg bg-app-surface dark:bg-app-surface-dark">
        <AppIcon icon={icon} size={22} color={theme.textSecondary} />
      </View>
      <View className="min-w-0 flex-1 gap-0.5">
        <AppText variant="small" tone="muted">
          {label}
        </AppText>
        <AppText variant="smallBold" className="leading-5" selectable>
          {value}
        </AppText>
      </View>
    </View>
  );
}

function HealthTile({
  icon,
  label,
  active,
  value,
}: {
  icon: IconSvgElement;
  label: string;
  active: boolean;
  value: "Sim" | "Não";
}) {
  const theme = useTheme();

  return (
    <View className="min-h-[116px] flex-1 justify-between rounded-lg border border-app-border bg-app-background p-3 dark:border-app-border-dark dark:bg-app-background-dark">
      <View className="flex-row items-center justify-between gap-2">
        <View className="h-10 w-10 items-center justify-center rounded-lg bg-app-surface dark:bg-app-surface-dark">
          <AppIcon icon={icon} size={22} color={theme.textSecondary} />
        </View>
        <HealthBadge active={active} label={value} />
      </View>
      <View className="gap-0.5">
        <AppText variant="small" tone="muted">
          Status
        </AppText>
        <AppText variant="smallBold">{label}</AppText>
      </View>
    </View>
  );
}
