<script setup lang="ts">
import { ref } from "vue";

const emit = defineEmits<{ authenticated: [] }>();

const mode = ref<"signin" | "signup">("signin");
const name = ref("");
const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref<string>();

async function submit() {
  loading.value = true;
  error.value = undefined;

  const path = mode.value === "signin" ? "/api/auth/sign-in/email" : "/api/auth/sign-up/email";
  const payload =
    mode.value === "signin"
      ? { email: email.value, password: password.value }
      : { name: name.value, email: email.value, password: password.value };

  try {
    const response = await fetch(path, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    emit("authenticated");
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : "Nao foi possivel entrar.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <form class="auth-form" @submit.prevent="submit">
    <div v-if="mode === 'signup'" class="field">
      <label for="name">Nome</label>
      <input id="name" v-model="name" autocomplete="name" required />
    </div>

    <div class="field">
      <label for="email">Email</label>
      <input id="email" v-model="email" autocomplete="email" required type="email" />
    </div>

    <div class="field">
      <label for="password">Senha</label>
      <input id="password" v-model="password" autocomplete="current-password" required type="password" />
    </div>

    <p v-if="error" class="form-error">{{ error }}</p>

    <button class="primary-button" type="submit" :disabled="loading">
      {{ loading ? "Aguarde..." : mode === "signin" ? "Entrar" : "Criar conta" }}
    </button>

    <button class="ghost-button" type="button" @click="mode = mode === 'signin' ? 'signup' : 'signin'">
      {{ mode === "signin" ? "Criar conta" : "Ja tenho conta" }}
    </button>
  </form>
</template>
