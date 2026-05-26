import { FileDownloadIcon } from "@hugeicons/core-free-icons";
import React from "react";
import { View } from "react-native";

import { AppText } from "@/components/ui/app-text";
import { HeaderBlock } from "@/components/ui/layout";
import { ScreenScroll } from "@/components/ui/screen";
import { SectionHeader } from "@/components/ui/section-header";
import { Surface } from "@/components/ui/surface";

export default function AdoptionsScreen() {
  return (
    <ScreenScroll>
      <Surface tone="accentSoft" className="gap-3 p-5">
        <HeaderBlock
          title="Adoções"
          subtitle="Processos e histórico de adoção"
        />
      </Surface>

      <Surface className="gap-3 p-4">
        <SectionHeader icon={FileDownloadIcon} label="Adoções" />
        <View className="gap-1">
          <AppText tone="muted">
            A página já está disponível no menu. A listagem será conectada
            quando a API de adoções estiver exposta para o aplicativo.
          </AppText>
        </View>
      </Surface>
    </ScreenScroll>
  );
}
