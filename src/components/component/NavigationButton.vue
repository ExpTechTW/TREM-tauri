<script setup lang="ts">
defineProps<{
  icon: string;
  label: string;
  value: string;
  currentView: string;
  changeView: (view: string) => void;
}>();
</script>

<template lang="pug">
.nav-item
  button.nav-btn(:class="{ active: currentView == value  }", type="button", @click="() => changeView(value)")
    span.nav-item-icon.material-symbols-rounded {{ icon }}
    span.nav-item-label {{ label }}
</template>

<style scoped>
.nav-item {
  display: flex;
  pointer-events: none;

  > .nav-btn {
    all: unset;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px;
    padding-right: 16px;
    border-radius: 32px;
    color: #000;
    background-color: #fff;
    font-size: 16px;
    line-height: 20px;
    overflow: hidden;
    height: 24px;
    white-space: nowrap;
    flex: 16px 0;
    opacity: 0.6;
    cursor: pointer;
    pointer-events: all;
    transition:
      flex 0.2s cubic-bezier(0.2, 0, 0, 1),
      opacity 0.2s cubic-bezier(0.2, 0, 0, 1);

    > .nav-item-icon {
      height: 24px;
      aspect-ratio: 1;
      font-size: 24px;
    }

    > .nav-item-label {
      font-weight: 400;
      opacity: 0;
      transition: opacity 0.1s cubic-bezier(0.2, 0, 0, 1);
    }

    &:hover {
      opacity: 0.8;
    }

    &.active {
      opacity: 1;
    }

    &.active,
    &:hover {
      flex: 1;

      > .nav-item-label {
        opacity: 1;
      }
    }
  }
}
</style>
