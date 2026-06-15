<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import AppShell from "./components/AppShell.vue";
import InstallLanding from "./components/InstallLanding.vue";
import AuthGate from "./features/auth/AuthGate.vue";
import { isStandalonePwa } from "./lib/pwa";

const standalone = ref(isStandalonePwa());
const standaloneModes = ["standalone", "fullscreen", "minimal-ui", "window-controls-overlay"] as const;
const mediaQueries: MediaQueryList[] = [];

function refreshStandaloneState() {
  standalone.value = isStandalonePwa();
}

onMounted(() => {
  refreshStandaloneState();

  for (const mode of standaloneModes) {
    const mediaQuery = window.matchMedia(`(display-mode: ${mode})`);
    mediaQueries.push(mediaQuery);
    mediaQuery.addEventListener("change", refreshStandaloneState);
  }

  window.addEventListener("appinstalled", refreshStandaloneState);
});

onBeforeUnmount(() => {
  for (const mediaQuery of mediaQueries) {
    mediaQuery.removeEventListener("change", refreshStandaloneState);
  }

  window.removeEventListener("appinstalled", refreshStandaloneState);
});
</script>

<template>
  <InstallLanding v-if="!standalone" />
  <AuthGate v-else>
    <AppShell />
  </AuthGate>
</template>
