<script setup lang="ts">
import { CalendarDays, Images, ShieldCheck, User } from "lucide-vue-next";
</script>

<template>
  <div class="app-shell">
    <main class="content">
      <RouterView />
    </main>

    <nav class="bottom-nav" aria-label="Navegacao principal">
      <RouterLink to="/" class="nav-item" aria-label="Feed">
        <Images :size="21" />
      </RouterLink>
      <RouterLink to="/hangouts" class="nav-item" aria-label="Encontros">
        <CalendarDays :size="21" />
      </RouterLink>
      <RouterLink to="/admin" class="nav-item" aria-label="Admin">
        <ShieldCheck :size="21" />
      </RouterLink>
      <RouterLink to="/profile" class="nav-item" aria-label="Perfil">
        <User :size="21" />
      </RouterLink>
    </nav>
  </div>
</template>
