<script setup lang="ts">
import { onBeforeUnmount, ref, watchEffect } from "vue";
import { fetchCachedImage } from "./imageCache";

const props = defineProps<{
  photoId: string;
  version: string;
  url?: string;
  alt: string;
}>();

const src = ref<string>();
const loading = ref(true);
const error = ref(false);
let objectUrl: string | undefined;

function revokeObjectUrl() {
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
    objectUrl = undefined;
  }
}

watchEffect(async () => {
  loading.value = true;
  error.value = false;
  revokeObjectUrl();

  if (!props.url) {
    error.value = true;
    loading.value = false;
    return;
  }

  try {
    const blob = await fetchCachedImage({
      photoId: props.photoId,
      version: props.version,
      url: props.url,
    });

    objectUrl = URL.createObjectURL(blob);
    src.value = objectUrl;
  } catch {
    error.value = true;
    src.value = undefined;
  } finally {
    loading.value = false;
  }
});

onBeforeUnmount(revokeObjectUrl);
</script>

<template>
  <div v-if="loading" class="photo-placeholder">Carregando foto...</div>
  <div v-else-if="error" class="photo-placeholder">Nao foi possivel carregar a foto.</div>
  <img v-else :src="src" :alt="alt" class="feed-photo" loading="lazy" />
</template>
