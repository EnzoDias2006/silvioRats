<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Camera } from "lucide-vue-next";
import { ref } from "vue";
import { apiFetch, type FeedPost } from "../../lib/api";
import CachedPhoto from "./CachedPhoto.vue";
import PhotoComposer from "./PhotoComposer.vue";

const composerOpen = ref(false);

const feed = useQuery({
  queryKey: ["feed"],
  queryFn: () => apiFetch<FeedPost[]>("/feed"),
});
</script>

<template>
  <section class="hero-action">
    <div>
      <p class="eyebrow">Feed permanente</p>
      <h2>Fotos, horas e memoria viva.</h2>
      <p class="lead">Leitura limpa, sem camada extra. O foco fica no post.</p>
    </div>
    <button class="round-action" type="button" aria-label="Postar foto" @click="composerOpen = true">
      <Camera :size="24" />
    </button>
  </section>

  <PhotoComposer v-if="composerOpen" @close="composerOpen = false" />

  <section v-if="feed.isLoading.value" class="state-card">Carregando feed...</section>
  <section v-else-if="feed.isError.value" class="state-card">Nao foi possivel carregar o feed.</section>

  <section v-else class="feed-list">
    <article v-for="post in feed.data.value" :key="post.id" class="post-card">
      <header class="post-meta">
        <strong>{{ post.authorName }}</strong>
        <span>{{ formatDistanceToNow(new Date(post.occurredAt), { addSuffix: true, locale: ptBR }) }}</span>
      </header>

      <CachedPhoto
        v-if="post.photos[0]"
        :photo-id="post.photos[0].id"
        :version="post.photos[0].version"
        :url="post.photos[0].url"
        :alt="post.caption || `Foto de ${post.authorName}`"
      />
      <div v-else class="photo-placeholder">Sem foto neste registro.</div>

      <p v-if="post.caption">{{ post.caption }}</p>
    </article>

    <article v-if="feed.data.value?.length === 0" class="state-card">
      <p class="eyebrow">Sem memorias ainda</p>
      <h2>Primeira foto paga a rodada.</h2>
      <p>Quando alguem postar, o feed ganha vida aqui.</p>
    </article>
  </section>
</template>
