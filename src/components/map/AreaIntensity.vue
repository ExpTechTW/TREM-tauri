<script setup lang="ts">
import { useMapStore } from "@/stores/map_store";
import { onMounted, onBeforeUnmount, onUpdated } from "vue";

const props = defineProps<{
  code: string;
  int: number;
  override?: number;
}>();

const mapStore = useMapStore();

onMounted(() => {
  if (mapStore.value) {
    mapStore.value.setFeatureState(
      { source: "tw_town", id: props.code },
      {
        int: props.override ?? props.int,
        override: props.override != undefined,
      }
    );
  }
});

onUpdated(() => {
  if (mapStore.value) {
    mapStore.value.setFeatureState(
      { source: "tw_town", id: props.code },
      {
        int: props.override ?? props.int,
        override: props.override != undefined,
      }
    );
  }
});

onBeforeUnmount(() => {
  if (mapStore.value) {
    mapStore.value.removeFeatureState(
      { source: "tw_town", id: props.override ?? props.code },
      "int"
    );
    mapStore.value.removeFeatureState(
      { source: "tw_town", id: props.override ?? props.code },
      "override"
    );
  }
});
</script>
