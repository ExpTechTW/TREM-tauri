<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAccountStore } from "@/stores/account_store";

const accountStore = useAccountStore();
const router = useRouter();

onMounted(() => {
  if (!accountStore.current) {
    router.replace("/account/login");
  }
});
</script>

<template></template>
