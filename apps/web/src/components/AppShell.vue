<script setup lang="ts">
import { CalendarDays, Images, ShieldCheck, User } from "lucide-vue-next";
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const topbarTitle = computed(() => {
  switch (route.path) {
    case "/hangouts":
      return "Encontros";
    case "/admin":
      return "Admin";
    case "/profile":
      return "Perfil";
    default:
      return "Feed";
  }
});
</script>

<template>
  <div class="app-shell">
    <header class="topbar" aria-label="Barra principal">
      <div class="brand-lockup">
        <div>
          <p class="brand-mark">SilvioRats</p>
          <p class="topbar-subtitle">Bar do Silvio</p>
        </div>
        <span class="topbar-pill">{{ topbarTitle }}</span>
      </div>

      <nav class="topbar-nav" aria-label="Navegacao rapida">
        <RouterLink to="/" class="topbar-link" aria-label="Feed">
          <Images :size="18" />
          <span>Feed</span>
        </RouterLink>
        <RouterLink to="/hangouts" class="topbar-link" aria-label="Encontros">
          <CalendarDays :size="18" />
          <span>Encontros</span>
        </RouterLink>
        <RouterLink to="/profile" class="topbar-link" aria-label="Perfil">
          <User :size="18" />
          <span>Perfil</span>
        </RouterLink>
      </nav>
    </header>

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
