<script setup lang="ts">
defineProps<{
  leadingIcon?: string;
  label: string;
  trailingIcon?: string;
}>();
</script>

<template lang="pug">
button#report-back-btn.filled-button.button
  span.leading-icon.material-symbols-rounded(v-if="leadingIcon") {{ leadingIcon }}
  span.label {{ label }}
  span.trailing-icon.material-symbols-rounded(v-if="trailingIcon") {{ trailingIcon }}
</template>
<style lang="scss" scoped>
.button {
  all: unset;
  display: flex;
  align-items: center;
  height: 20px;
  padding: 6px;
  border-radius: 32px;
  font-family: "Noto Sans TC", sans-serif;
  cursor: pointer;
  transition:
    background-color 0.1s cubic-bezier(0.2, 0, 0, 1),
    opacity 0.1s cubic-bezier(0.2, 0, 0, 1);

  > .leading-icon {
    width: 20px;
    aspect-ratio: 1;
    font-size: 20px;
  }

  > .label {
    padding: 4px;
    line-height: 16px;
    font-size: 12px;
    font-weight: 500;
  }

  > .trailing-icon {
    width: 20px;
    aspect-ratio: 1;
    font-size: 20px;
  }

  &.filled-button {
    color: #000;
    background-color: #d9d9d9;
  }

  &.filled-button:hover {
    background-color: #e9e9e9;
  }

  &.filled-button:active {
    opacity: 0.6;
  }

  &:disabled {
    cursor: not-allowed;
  }
}
</style>
