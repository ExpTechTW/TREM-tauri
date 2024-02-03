<template lang="pug">
button.chip
  span.chip-leading-icon.material-symbols-rounded: slot(name="icon")
  span.chip-label: slot(name="label")
</template>

<style scoped>
.chip {
  --chip-label-hsl: 0deg 0% 90%;
  --chip-label-hover-hsl: 0deg 0% 94%;
  --chip-label-active-hsl: 0deg 0% 100%;
  --chip-background-hsl: var(--surface-variant-hsl);
  --chip-background-hover-hsl: var(--surface-variant-hsl);
  --chip-background-active-hsl: var(--surface-hsl);
  --chip-outline-hsl: var(--surface-hsl);
  --chip-outline-hover-hsl: 0deg 0% 75%;

  all: unset;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px;
  padding-right: 10px;
  border-radius: 48px;
  cursor: pointer;
  background-color: hsl(var(--chip-background-hsl));
  color: hsl(var(--chip-label-hsl));
  transition-property: background-color, color, outline, opacity;
  transition-duration: .1s;
  transition-timing-function: cubic-bezier(0.2, 0, 0, 1);
  outline: 1px solid hsl(var(--chip-outline-hsl));

  &:disabled {
    cursor: not-allowed;
    opacity: .4;
  }

  >.chip-leading-icon {
    height: 16px;
    aspect-ratio: 1;
    font-size: 16px;
  }

  >.chip-label {
    line-height: 12px;
    font-size: 12px;
  }

  &:not(:disabled) {
    &:hover {
      background-color: hsl(var(--chip-background-hover-hsl));
      color: hsl(var(--chip-label-hover-hsl));
      outline-color: hsl(var(--chip-outline-hover-hsl));
    }

    &:active {
      background-color: hsl(var(--chip-background-active-hsl));
      color: hsl(var(--chip-label-active-hsl));
    }
  }
}
</style>