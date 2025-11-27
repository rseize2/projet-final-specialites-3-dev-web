<template>
  <div class="developer-project">
    <div class="project-header">
      <h1>{{ project.name }}</h1>
      <p>{{ project.description }}</p>
    </div>

    <div class="tasks-section">
      <!-- Créer une tâche (Developer) -->
      <div class="create-task">
        <h3>Créer une nouvelle tâche</h3>
        <form @submit.prevent="createNewTask">
          <div class="form-group">
            <label>Titre</label>
            <input v-model="newTask.title" type="text" required class="input" />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="newTask.description" rows="4" class="input"></textarea>
          </div>
          <div class="form-group">
            <label>Deadline (optionnel)</label>
            <input v-model="newTask.deadline" type="date" class="input" />
          </div>
          <button type="submit" class="btn btn-primary">Créer la tâche</button>
        </form>
      </div>

      <!-- Tâches affectées à l'utilisateur -->
      <div class="tasks-list">
        <h3>Mes tâches affectées</h3>
        <div v-if="assignedTasks.length === 0" class="no-tasks">
          Aucune tâche affectée
        </div>
        <task-card
          v-for="task in assignedTasks"
          :key="task.id"
          :task="task"
          :is-manager="false"
          @update="refreshTasks"
        />
      </div>

      <!-- Autres tâches du projet -->
      <div class="tasks-list">
        <h3>Autres tâches du projet</h3>
        <div v-if="otherTasks.length === 0" class="no-tasks">
          Aucune autre tâche
        </div>
        <task-card
          v-for="task in otherTasks"
          :key="task.id"
          :task="task"
          :is-manager="false"
          @update="refreshTasks"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { useUserStore } from '../stores/userStore'
import { useProjectStore } from '../stores/projectStore'
import { useTaskStore } from '../stores/taskStore'
import TaskCard from '../components/TaskCard.vue'

export default {
  name: 'DeveloperProject',
  components: {
    TaskCard
  },
  data() {
    return {
      userStore: useUserStore(),
      projectStore: useProjectStore(),
      taskStore: useTaskStore(),
      project: {},
      tasks: [],
      newTask: {
        title: '',
        description: '',
        deadline: null
      }
    }
  },
  computed: {
    currentUser() {
      return this.userStore.getCurrentUser()
    },
    assignedTasks() {
      return this.tasks.filter(t => t.assignedTo.includes(this.currentUser.id))
    },
    otherTasks() {
      return this.tasks.filter(t => !t.assignedTo.includes(this.currentUser.id))
    }
  },
  methods: {
    loadProject() {
      const projectId = this.$route.params.projectId
      this.project = this.projectStore.getProjectById(projectId) || {}
      this.refreshTasks()
    },
    refreshTasks() {
      const projectId = this.$route.params.projectId
      this.tasks = this.taskStore.getTasksByProject(projectId)
    },
    createNewTask() {
      if (this.newTask.title.trim()) {
        const projectId = this.$route.params.projectId
        this.taskStore.createTask(
          projectId,
          this.newTask.title,
          this.newTask.description,
          this.currentUser.id,
          this.newTask.deadline || null
        )
        this.newTask = { title: '', description: '', deadline: null }
        this.refreshTasks()
      }
    }
  },
  mounted() {
    this.loadProject()
  }
}
</script>

<style scoped>
.developer-project {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.project-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #ddd;
}

.project-header h1 {
  margin: 0 0 10px 0;
  color: #333;
}

.project-header p {
  margin: 0;
  color: #666;
}

.tasks-section {
  display: grid;
  gap: 30px;
}

.create-task {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.create-task h3 {
  margin-top: 0;
  color: #333;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
}

.input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

.input:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
}

textarea.input {
  resize: vertical;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #2196F3;
  color: white;
}

.btn-primary:hover {
  background-color: #0b7dda;
}

.tasks-list h3 {
  margin-top: 0;
  color: #333;
}

.no-tasks {
  padding: 20px;
  text-align: center;
  color: #999;
  background-color: #f5f5f5;
  border-radius: 8px;
}
</style>
