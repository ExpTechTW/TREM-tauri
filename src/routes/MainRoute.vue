<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import NavigationRail from "../components/navigation/NavigationRail.vue";
import MapView from "../components/map/MapView.vue";
import Global from "@/global";

const route = useRoute();

const isNavigationRailExpanded = computed(() => route.path == "/");

onMounted(() => {
  Global.init();
});
</script>

<template>
  <div id="main">
    <div class="navigation">
      <NavigationRail :expanded="isNavigationRailExpanded" />
      <router-view name="navigation" v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </div>
    <div class="content">
      <MapView />
      <div class="stack">
        <router-view name="stack" v-slot="{ Component }">
          <transition name="fade">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<style>
#main {
  position: relative;
  display: grid;
  grid-template-columns: min-content 1fr;
  gap: 8px;
  padding: 8px;
  min-height: 0;
}

.navigation {
  display: flex;
  min-height: 0;
}

.content {
  position: relative;
  background-color: color-mix(in lab, transparent, var(--p-surface-100) 4%);
  border-radius: 8px;
  overflow: hidden;
}

.stack {
  display: grid;
  position: absolute;
  height: 100%;
  width: 100%;
  pointer-events: none;
}
/*
.left-enter-active,
.left-leave-active {
  transition: max-width 0.4s ease, opacity 0.4s ease;
}

.left-enter-to,
.left-leave-from {
  max-width: 500px;
}

.left-enter-from,
.left-leave-to {
  max-width: 0;
  opacity: 0;
}
*/
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
