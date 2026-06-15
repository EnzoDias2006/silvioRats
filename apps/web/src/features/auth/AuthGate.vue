<script setup lang="ts">
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { apiFetch, type MeResponse } from "../../lib/api";
import AuthForm from "./AuthForm.vue";

const queryClient = useQueryClient();

const me = useQuery({
  queryKey: ["me"],
  queryFn: () => apiFetch<MeResponse>("/me"),
  retry: false,
});

function refreshSession() {
  queryClient.invalidateQueries({ queryKey: ["me"] });
}
</script>

<template>
  <main class="auth-page">
    <section v-if="me.isLoading.value" class="state-card auth-card">Carregando sessao...</section>

    <section v-else-if="me.isError.value" class="state-card auth-card">
      <p class="eyebrow">Entrar</p>
      <h2>Sua mesa te espera.</h2>
      <p>Crie sua conta ou entre. Um admin libera sua entrada na bolha.</p>
      <AuthForm @authenticated="refreshSession" />
    </section>

    <section v-else-if="me.data.value?.membership.status === 'pending'" class="state-card auth-card">
      <p class="eyebrow">Aguardando admin</p>
      <h2>Pedido enviado.</h2>
      <p>Um admin precisa aprovar sua entrada na bolha do Silvio.</p>
    </section>

    <section v-else-if="me.data.value?.membership.status !== 'approved'" class="state-card auth-card">
      <p class="eyebrow">Acesso bloqueado</p>
      <h2>Conta sem acesso.</h2>
      <p>Fale com um admin se isto parece errado.</p>
    </section>

    <slot v-else />
  </main>
</template>
