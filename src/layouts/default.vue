<template>
  <div class="flex flex-col">
    <WindowTitlebar />
    <div class="flex-1 flex">
      <NavigationRail :expanded="false" />
      <div class="">
        <MapView />
        <div class="absolute h-full w-full pointer-events-none">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>
