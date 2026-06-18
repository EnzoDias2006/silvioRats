<script setup lang="ts">
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { LogOut, UserRound } from "lucide-vue-next";
import { apiFetch, type MeResponse } from "../../lib/api";

const queryClient = useQueryClient();

const me = useQuery({
  queryKey: ["me"],
  queryFn: () => apiFetch<MeResponse>("/me"),
  retry: false,
});

async function signOut() {
  await fetch("/api/auth/sign-out", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  await queryClient.invalidateQueries({ queryKey: ["me"] });
  window.location.reload();
}
</script>

<template>
  <section class="hero-action">
    <div>
      <p class="eyebrow">Perfil</p>
      <h2>Sua mesa na bolha.</h2>
      <p class="lead">Dados, permissao e saida rapida. Sem ruido.</p>
    </div>
  </section>

  <section v-if="me.isLoading.value" class="state-card">Carregando perfil...</section>
  <section v-else-if="me.isError.value" class="state-card">Nao foi possivel carregar seu perfil.</section>
  <section v-else class="feed-list">
    <article class="post-card compact">
      <header class="post-meta">
        <strong>{{ me.data.value?.user.name }}</strong>
        <span>{{ me.data.value?.membership.role === "admin" ? "Admin" : "Member" }}</span>
      </header>
      <p>{{ me.data.value?.user.email }}</p>
      <div class="profile-summary">
        <div class="profile-avatar">
          <UserRound :size="20" />
        </div>
        <div>
          <p class="profile-label">Status</p>
          <strong>{{ me.data.value?.membership.status }}</strong>
        </div>
      </div>
    </article>

    <button class="ghost-button profile-logout" type="button" @click="signOut">
      <LogOut :size="18" />
      Sair da conta
    </button>
  </section>
</template>
