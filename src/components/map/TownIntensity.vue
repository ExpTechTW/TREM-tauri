<script setup lang="ts">
import { onMounted, onBeforeUnmount, onUpdated } from "vue";
import { useMapStore } from "@/stores/map_store";

const props = defineProps<{
  code: string;
  intensity: number;
  override?: number;
}>();

const mapStore = useMapStore();

onMounted(() => {
  if (mapStore.map) {
    mapStore.map.setFeatureState(
      { source: "tw_town", id: props.code },
      {
        intensity: props.override ?? props.intensity,
        override: props.override != undefined,
      }
    );
  }
});

onUpdated(() => {
  if (mapStore.map) {
    mapStore.map.setFeatureState(
      { source: "tw_town", id: props.code },
      {
        intensity: props.override ?? props.intensity,
        override: props.override != undefined,
      }
    );
  }
});

onBeforeUnmount(() => {
  if (mapStore.map) {
    mapStore.map.removeFeatureState(
      { source: "tw_town", id: props.override ?? props.code },
      "intensity"
    );
    mapStore.map.removeFeatureState(
      { source: "tw_town", id: props.override ?? props.code },
      "override"
    );
  }
});
</script>
