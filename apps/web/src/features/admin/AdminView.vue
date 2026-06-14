<script setup lang="ts">
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { ref } from "vue";
import { apiFetch } from "../../lib/api";

type ApprovalRequest = {
  userId: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: string;
};

const queryClient = useQueryClient();
const pendingAction = ref<string>();
const actionError = ref<string>();

const requests = useQuery({
  queryKey: ["approval-requests"],
  queryFn: () => apiFetch<ApprovalRequest[]>("/admin/approval-requests"),
  retry: false,
});

async function decide(userId: string, decision: "approve" | "reject") {
  pendingAction.value = `${decision}:${userId}`;
  actionError.value = undefined;

  try {
    await apiFetch(`/admin/approval-requests/${userId}/${decision}`, { method: "POST" });
    await queryClient.invalidateQueries({ queryKey: ["approval-requests"] });
  } catch (caught) {
    actionError.value =
      caught instanceof Error ? caught.message : "Nao foi possivel atualizar pedido.";
  } finally {
    pendingAction.value = undefined;
  }
}
</script>

<template>
  <section class="hero-action">
    <div>
      <p class="eyebrow">Admin</p>
      <h2>Pedidos da bolha.</h2>
    </div>
  </section>

  <section v-if="requests.isLoading.value" class="state-card">Carregando pedidos...</section>
  <section v-else-if="requests.isError.value" class="state-card">Somente admins veem esta area.</section>
  <section v-else class="feed-list">
    <p v-if="actionError" class="form-error">{{ actionError }}</p>

    <article v-for="request in requests.data.value" :key="request.userId" class="post-card compact">
      <strong>{{ request.name }}</strong>
      <span>{{ request.email }}</span>
      <div class="admin-actions">
        <button
          class="primary-button"
          type="button"
          :disabled="Boolean(pendingAction)"
          @click="decide(request.userId, 'approve')"
        >
          Aprovar
        </button>
        <button
          class="ghost-button"
          type="button"
          :disabled="Boolean(pendingAction)"
          @click="decide(request.userId, 'reject')"
        >
          Rejeitar
        </button>
      </div>
    </article>

    <article v-if="requests.data.value?.length === 0" class="state-card">
      <p class="eyebrow">Fila limpa</p>
      <h2>Ninguem esperando.</h2>
    </article>
  </section>
</template>
