<script setup lang="ts">
import AppShell from "./components/AppShell.vue";
import InstallLanding from "./components/InstallLanding.vue";
import AuthGate from "./features/auth/AuthGate.vue";
import { isStandalonePwa } from "./lib/pwa";

const standalone = isStandalonePwa();
</script>

<template>
  <InstallLanding v-if="!standalone" />
  <AuthGate v-else>
    <AppShell />
  </AuthGate>
</template>
