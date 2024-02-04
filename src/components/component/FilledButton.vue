<template lang="pug">
button#report-back-btn.filled-button.button
  span.button-leading-icon.material-symbols-rounded arrow_back
  span.button-label 返回列表
</template>
<style scoped>
.button {
  all: unset;
  display: flex;
  align-items: center;
  gap: 4px;
  height: 20px;
  padding: 6px;
  padding-right: 12px;
  border-radius: 32px;
  font-family: "Noto Sans TC", sans-serif;
  cursor: pointer;
  transition:
    background-color 0.1s cubic-bezier(0.2, 0, 0, 1),
    opacity 0.1s cubic-bezier(0.2, 0, 0, 1);

  > .button-leading-icon {
    width: 20px;
    aspect-ratio: 1;
    font-size: 20px;
  }

  > .button-label {
    line-height: 16px;
    font-size: 12px;
    font-weight: 500;
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
