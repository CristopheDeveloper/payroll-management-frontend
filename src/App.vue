<template>
  <RouterView />
  <AppLoading :visible="isLoading" :message="loadingMessage" />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppLoading from '@/components/AppLoading.vue'
import { useLoading } from '@/composables/useLoading'

const { isLoading, loadingMessage } = useLoading()
</script>
