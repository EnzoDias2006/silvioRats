<script setup lang="ts">
import { CalendarDays, Images, ShieldCheck } from "lucide-vue-next";
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <div>
        <p class="eyebrow">SilvioRats</p>
        <h1>Hoje no Silvio?</h1>
      </div>
    </header>

    <main class="content">
      <RouterView />
    </main>

    <nav class="bottom-nav" aria-label="Navegacao principal">
      <RouterLink to="/" class="nav-item">
        <Images :size="20" />
        <span>Feed</span>
      </RouterLink>
      <RouterLink to="/hangouts" class="nav-item">
        <CalendarDays :size="20" />
        <span>Encontros</span>
      </RouterLink>
      <RouterLink to="/admin" class="nav-item">
        <ShieldCheck :size="20" />
        <span>Admin</span>
      </RouterLink>
    </nav>
  </div>
</template>
