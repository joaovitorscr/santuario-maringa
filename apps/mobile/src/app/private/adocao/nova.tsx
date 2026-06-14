import { router } from "expo-router";
import React from "react";

import { AdoptionForm } from "@/components/adoption-form";
import { ScreenScroll } from "@/components/ui/screen";

export default function NewAdoptionScreen() {
  return (
    <ScreenScroll contentClassName="gap-4 pb-28 pt-3">
      <AdoptionForm onBack={() => router.back()} />
    </ScreenScroll>
  );
}
