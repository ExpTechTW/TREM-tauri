<template lang="pug">
.report-detail-field
  .report-detail-field-icon.material-symbols-rounded: slot(name="icon")
  .report-detail-field-divider
  .report-detail-field-content-container
    .report-detail-field-name: slot(name="name")
    #report-time.report-detail-field-value.skeleton: slot(name="value")
</template>

<style scoped>
.report-detail-field {
  display: flex;
  align-items: center;
  gap: 8px;

  > .report-detail-field-icon {
    width: 24px;
    aspect-ratio: 1;
    opacity: 0.8;
    font-size: 24px;
  }

  > .report-detail-field-divider {
    width: 2px;
    height: 90%;
    background-color: rgb(255 255 255 / 0.6);
    border-radius: 2px;
  }

  > .report-detail-field-content-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;

    > .report-detail-field-name {
      position: relative;
      line-height: 12px;
      font-size: 12px;
      font-weight: 300;
      opacity: 0.8;
    }

    > .report-detail-field-value {
      display: flex;
      gap: 16px;
      height: 16px;
      line-height: 16px;
      font-family: "Lato", "Noto Sans TC", sans-serif;
      font-size: 16px;
      font-weight: 700;
    }
  }
}
</style>
