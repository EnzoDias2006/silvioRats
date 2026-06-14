<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { type BeforeInstallPromptEvent, getInstallPlatform } from "../lib/pwa";

const platform = getInstallPlatform();
const installPrompt = ref<BeforeInstallPromptEvent | null>(null);
const isInstalled = ref(false);

function handleBeforeInstallPrompt(event: Event) {
  event.preventDefault();
  installPrompt.value = event as BeforeInstallPromptEvent;
}

function handleAppInstalled() {
  isInstalled.value = true;
  installPrompt.value = null;
}

async function installApp() {
  if (!installPrompt.value) return;

  const promptEvent = installPrompt.value;
  promptEvent.prompt();
  await promptEvent.userChoice;
  installPrompt.value = null;
}

onMounted(() => {
  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  window.addEventListener("appinstalled", handleAppInstalled);
});

onBeforeUnmount(() => {
  window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  window.removeEventListener("appinstalled", handleAppInstalled);
});
</script>

<template>
  <main class="install-page">
    <section class="install-card">
      <p class="eyebrow">Bar do Silvio, na tela inicial</p>
      <h1>SilvioRats vive melhor instalado.</h1>
      <p class="lead">
        Este app e fechado para amigos. Para acessar feed, fotos e encontros, instale como PWA e abra pelo icone.
      </p>

      <div v-if="platform === 'ios'" class="steps">
        <h2>iPhone</h2>
        <ol>
          <li>Abra esta pagina no Safari.</li>
          <li>Toque em compartilhar.</li>
          <li>Escolha “Adicionar à Tela de Início”.</li>
          <li>Abra pelo icone SilvioRats.</li>
        </ol>
      </div>

      <div v-else-if="platform === 'android'" class="steps">
        <h2>Android</h2>
        <button v-if="installPrompt" class="primary-button install-button" type="button" @click="installApp">
          Instalar app
        </button>
        <p v-if="isInstalled">Instalado. Agora abra pelo icone SilvioRats.</p>
        <ol v-else>
          <li>Abra esta pagina no Chrome.</li>
          <li>Toque em “Instalar app” ou use o menu.</li>
          <li>Abra pelo icone SilvioRats.</li>
        </ol>
      </div>

      <div v-else class="steps">
        <h2>Desktop</h2>
        <button v-if="installPrompt" class="primary-button install-button" type="button" @click="installApp">
          Instalar app
        </button>
        <p v-if="isInstalled">Instalado. Agora abra pelo icone SilvioRats.</p>
        <p v-else>Use Chrome ou Edge com HTTPS para instalar, ou abra no celular.</p>
      </div>
    </section>
  </main>
</template>
