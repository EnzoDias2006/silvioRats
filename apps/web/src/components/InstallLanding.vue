<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { type BeforeInstallPromptEvent, getInstallPlatform } from "../lib/pwa";

const platform = getInstallPlatform();
const installPrompt = ref<BeforeInstallPromptEvent | null>(null);
const isInstalled = ref(false);
const installHintVisible = ref(false);
function detectChromeAndroid(userAgent = navigator.userAgent) {
  const ua = userAgent.toLowerCase();
  return /android/.test(ua) && /chrome/.test(ua) && !/edg|opr|samsungbrowser|firefox/.test(ua);
}

function handleBeforeInstallPrompt(event: Event) {
  event.preventDefault();
  installPrompt.value = event as BeforeInstallPromptEvent;
  installHintVisible.value = true;
}

function handleAppInstalled() {
  isInstalled.value = true;
  installPrompt.value = null;
  installHintVisible.value = false;
}

async function installApp() {
  if (!installPrompt.value) return;

  const promptEvent = installPrompt.value;
  promptEvent.prompt();
  await promptEvent.userChoice;
  installPrompt.value = null;
}

onMounted(() => {
  detectChromeAndroid();
  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  window.addEventListener("appinstalled", handleAppInstalled);

  window.setTimeout(() => {
    if (!installPrompt.value) {
      installHintVisible.value = true;
    }
  }, 1500);
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
        <p v-else-if="installHintVisible && !installPrompt">
          Se aparecer só “Adicionar à tela inicial”, recarregue a pagina depois do deploy ou limpe os dados do site no
          Chrome. O app precisa ser servido com icon PNG valido para aparecer como PWA.
        </p>
        <ol v-else>
          <li>Abra esta pagina no Chrome.</li>
          <li>Toque em “Instalar app” ou use o menu ⋮ &gt; “Instalar app”.</li>
          <li>Se ver apenas “Adicionar à tela inicial”, o Chrome ainda nao reconheceu o PWA.</li>
          <li>Abra pelo icone SilvioRats depois da instalacao.</li>
        </ol>
      </div>

      <div v-else class="steps">
        <h2>Desktop</h2>
        <button v-if="installPrompt" class="primary-button install-button" type="button" @click="installApp">
          Instalar app
        </button>
        <p v-if="isInstalled">Instalado. Agora abra pelo icone SilvioRats.</p>
        <p v-else-if="installHintVisible">Use Chrome ou Edge com HTTPS para instalar, ou abra no celular.</p>
        <p v-else>Instalacao disponivel apos o navegador reconhecer o PWA.</p>
      </div>
    </section>
  </main>
</template>
