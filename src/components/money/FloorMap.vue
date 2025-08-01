<template>
  <div class="map">
    <div v-for="w in workshops" :key="w.id"
         class="workshop"
         :style="{ left: w.x+'%', top: w.y+'%', width: w.w+'%', height: w.h+'%' }"
         @mouseenter="hover=w.id"
         @mouseleave="hover=null"
         :class="{active:hover===w.id}">
      {{ w.name }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const hover = ref(null)
const workshops = [
  { id:1, name:'车间1', x:5,  y:5,  w:25, h:20 },
  { id:2, name:'车间2', x:35, y:10, w:25, h:20 },
  { id:3, name:'车间3', x:65, y:5,  w:25, h:20 },
]
</script>

<style scoped>
.map{position:relative;width:100%;height:260px;background:#f7f7f7;border:1px solid #dcdcdc}
.workshop{position:absolute;background:#409eff33;border:1px solid #409eff;display:flex;align-items:center;justify-content:center;font-size:14px;cursor:pointer}
.active{background:#409eff;color:#fff}
</style>
