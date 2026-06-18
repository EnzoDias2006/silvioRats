<script setup lang="ts">
import { useQueryClient } from "@tanstack/vue-query";
import imageCompression from "browser-image-compression";
import { ref } from "vue";
import { apiFetch } from "../../lib/api";
import { setCachedImage } from "./imageCache";

const emit = defineEmits<{ close: [] }>();

const queryClient = useQueryClient();
const caption = ref("");
const file = ref<File>();
const previewUrl = ref<string>();
const loading = ref(false);
const error = ref<string>();

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const selectedFile = input.files?.[0];
  file.value = selectedFile;

  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = selectedFile ? URL.createObjectURL(selectedFile) : undefined;
}

async function submit() {
  if (!file.value) {
    error.value = "Escolha uma foto.";
    return;
  }

  loading.value = true;
  error.value = undefined;

  try {
    const compressed = await imageCompression(file.value, {
      maxSizeMB: 1.5,
      maxWidthOrHeight: 2048,
      useWebWorker: true,
      fileType: "image/webp",
    });

    const post = await apiFetch<{ id: string }>("/feed/posts", {
      method: "POST",
      body: JSON.stringify({ caption: caption.value || undefined }),
    });

    const uploadResponse = await fetch(`/api/feed/posts/${post.id}/photos`, {
      method: "POST",
      headers: { "Content-Type": compressed.type || "image/webp" },
      body: compressed,
    });

    if (!uploadResponse.ok) {
      throw new Error("Upload da foto falhou.");
    }

    const { photoId, version } = await uploadResponse.json();

    await setCachedImage(photoId, version, compressed);
    await queryClient.invalidateQueries({ queryKey: ["feed"] });
    emit("close");
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : "Nao foi possivel postar.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="composer-card">
    <div class="composer-header">
      <div>
        <p class="eyebrow">Nova memoria</p>
        <h2>Postar foto</h2>
        <p class="lead">Uma foto, uma legenda curta, sem bagunça.</p>
      </div>
      <button class="ghost-icon" type="button" @click="emit('close')">Fechar</button>
    </div>

    <form class="auth-form" @submit.prevent="submit">
      <label class="upload-drop">
        <input accept="image/*" capture="environment" type="file" @change="onFileChange" />
        <img v-if="previewUrl" :src="previewUrl" alt="Preview da foto" />
        <span v-else>Toque para escolher ou tirar foto</span>
      </label>

      <div class="field">
        <label for="caption">Legenda</label>
        <input id="caption" v-model="caption" maxlength="280" placeholder="O que rolou?" />
      </div>

      <p v-if="error" class="form-error">{{ error }}</p>

      <button class="primary-button" type="submit" :disabled="loading">
        {{ loading ? "Postando..." : "Salvar no feed" }}
      </button>
    </form>
  </section>
</template>
