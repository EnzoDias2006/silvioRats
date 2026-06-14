<script setup lang="ts">
import { getInstallPlatform } from "../lib/pwa";

const platform = getInstallPlatform();
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
        <ol>
          <li>Abra esta pagina no Chrome.</li>
          <li>Toque em “Instalar app” ou use o menu.</li>
          <li>Abra pelo icone SilvioRats.</li>
        </ol>
      </div>

      <div v-else class="steps">
        <h2>Celular necessario</h2>
        <p>Use Safari no iPhone ou Chrome no Android para instalar.</p>
      </div>
    </section>
  </main>
</template>
