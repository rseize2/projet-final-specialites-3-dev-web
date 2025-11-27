<template>
  <router-view></router-view>
</template>

<script>
import { useUserStore } from './stores/userStore'
import { useProjectStore } from './stores/projectStore'
import { useTaskStore } from './stores/taskStore'

export default {
  name: 'App',
  setup() {
    // Initialiser les stores
    const userStore = useUserStore()
    const projectStore = useProjectStore()
    const taskStore = useTaskStore()

    // Charger les données depuis localStorage
    userStore.loadUsers()
    userStore.loadCurrentUser()
    projectStore.loadProjects()
    taskStore.loadTasks()
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  background-color: #f5f5f5;
}
</style>
