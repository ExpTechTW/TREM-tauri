<template lang="pug">
span.value-unit-pair(v-if="$slots['value']")
  span.field-unit(v-if="$slots['leading-unit']"): slot(name="leading-unit")
  span.field-value: slot(name="value")
  span.field-unit(v-if="$slots['trailing-unit']"): slot(name="trailing-unit")
</template>

<style lang="scss" scoped>
.value-unit-pair {
  display: inline-flex;
  align-items: baseline;
  gap: 2px;
}

.field-value {
  line-height: 18px;
  font-size: 16px;
}

.field-unit {
  line-height: 10px;
  font-size: 10px;
  opacity: 0.6;
}
</style>
