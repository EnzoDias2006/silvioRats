<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { apiFetch } from "../../lib/api";

type Hangout = {
  id: string;
  title: string;
  note: string | null;
  startsAt: string;
};

const hangouts = useQuery({
  queryKey: ["hangouts"],
  queryFn: () => apiFetch<Hangout[]>("/hangouts"),
});
</script>

<template>
  <section class="hero-action">
    <div>
      <p class="eyebrow">Encontros</p>
      <h2>Marca a hora. O resto acontece.</h2>
      <p class="lead">Lista simples, legivel e sem excesso.</p>
    </div>
  </section>

  <section v-if="hangouts.isLoading.value" class="state-card">Carregando encontros...</section>
  <section v-else-if="hangouts.data.value?.length === 0" class="state-card">
    <p class="eyebrow">Agenda vazia</p>
    <h2>Nenhum encontro marcado.</h2>
    <p>Quando a turma combinar, tudo aparece aqui.</p>
  </section>
  <section v-else class="feed-list">
    <article v-for="hangout in hangouts.data.value" :key="hangout.id" class="post-card compact">
      <header class="post-meta">
        <div>
          <strong>{{ hangout.title }}</strong>
          <p class="post-timestamp">{{ new Date(hangout.startsAt).toLocaleString("pt-BR") }}</p>
        </div>
        <span class="post-chip">Meetup</span>
      </header>
      <p v-if="hangout.note" class="post-caption">{{ hangout.note }}</p>
    </article>
  </section>
</template>
