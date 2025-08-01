<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { authState } from './store/auth'

onMounted(() => {
  if (localStorage.getItem('email')) {
    authState.isAuthenticated = true
  }
})
</script>