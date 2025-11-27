<template>
  <div class="manager-project">
    <div class="project-header">
      <h1>{{ project.name }}</h1>
      <p>{{ project.description }}</p>
    </div>

    <!-- Tableau de bord -->
    <div class="dashboard">
      <h2>Tableau de bord</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Progression</h3>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: stats.progress + '%' }"></div>
          </div>
          <p>{{ stats.progress }}%</p>
        </div>
        <div class="stat-card">
          <h3>Statut du projet</h3>
          <p :class="'status-' + stats.status.toLowerCase().replace(' ', '-')">
            {{ stats.status }}
          </p>
        </div>
        <div class="stat-card">
          <h3>Tâches</h3>
          <ul>
            <li>Total: {{ stats.total }}</li>
            <li>Validées: {{ stats.validated }}</li>
            <li>Complétées: {{ stats.completed }}</li>
            <li>En cours: {{ stats.inProgress }}</li>
            <li>Non validées: {{ stats.notValidated }}</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Gestion des tâches -->
    <div class="tasks-management">
      <h2>Gestion des tâches</h2>

      <!-- Créer une tâche -->
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

      <!-- Liste des tâches avec actions manager -->
      <div class="tasks-list">
        <h3>Tâches du projet</h3>
        <div v-if="tasks.length === 0" class="no-tasks">
          Aucune tâche dans ce projet
        </div>
        <div v-for="task in tasks" :key="task.id" class="task-management-card">
          <div class="task-header">
            <h4>{{ task.title }}</h4>
            <span class="task-status" :class="'status-' + task.status.toLowerCase().replace(' ', '-')">
              {{ task.status }}
            </span>
          </div>

          <p class="task-description">{{ task.description }}</p>

          <div class="task-info">
            <div v-if="task.deadline" class="deadline">
              <strong>Deadline:</strong> {{ formatDate(task.deadline) }}
            </div>
            <div class="created-by">
              <strong>Créée par:</strong> {{ getCreatorName(task.createdBy) }}
            </div>
          </div>

          <!-- Assigner/Désassigner des utilisateurs -->
          <div class="assignment-section">
            <h5>Assigner des personnes</h5>
            <div class="assigned-list">
              <div v-if="task.assignedTo.length === 0" class="no-assigned">
                Personne non assignée
              </div>
              <div v-else>
                <span v-for="userId in task.assignedTo" :key="userId" class="assigned-user">
                  {{ getUserName(userId) }}
                  <button
                    @click="unassignUser(task.id, userId)"
                    class="btn-remove"
                    title="Retirer"
                  >
                    ×
                  </button>
                </span>
              </div>
            </div>

            <div class="assign-form">
              <select v-model="selectedUserForTask[task.id]" class="input">
                <option value="">Sélectionner un utilisateur...</option>
                <option v-for="user in availableUsers" :key="user.id" :value="user.id">
                  {{ user.name }}
                </option>
              </select>
              <button
                @click="assignUser(task.id)"
                class="btn btn-secondary"
              >
                Assigner
              </button>
            </div>
          </div>

          <!-- Actions -->
          <div class="task-actions">
            <button
              v-if="task.status === 'Complétée'"
              @click="validateTask(task.id)"
              class="btn btn-success"
            >
              Valider
            </button>

            <button
              @click="editTask(task)"
              class="btn btn-secondary"
            >
              Modifier
            </button>

            <button
              @click="deleteTask(task.id)"
              class="btn btn-danger"
            >
              Supprimer
            </button>
          </div>

          <!-- Commentaires -->
          <div class="comments-section">
            <h5>Commentaires ({{ task.comments.length }})</h5>
            <div class="comments-list">
              <div v-for="comment in task.comments" :key="comment.id" class="comment">
                <strong>{{ comment.userName }}:</strong> {{ comment.content }}
                <small>{{ formatDate(comment.createdAt) }}</small>
              </div>
              <div v-if="task.comments.length === 0" class="no-comments">
                Pas de commentaires
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'édition -->
    <div v-if="editingTaskId" class="modal">
      <div class="modal-content">
        <h3>Modifier la tâche</h3>
        <form @submit.prevent="updateTask">
          <div class="form-group">
            <label>Titre</label>
            <input v-model="editingTask.title" type="text" required class="input" />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="editingTask.description" rows="4" class="input"></textarea>
          </div>
          <div class="form-group">
            <label>Deadline</label>
            <input v-model="editingTask.deadline" type="date" class="input" />
          </div>
          <div class="modal-actions">
            <button type="submit" class="btn btn-primary">Sauvegarder</button>
            <button type="button" @click="cancelEdit" class="btn btn-secondary">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { useUserStore } from '../stores/userStore'
import { useProjectStore } from '../stores/projectStore'
import { useTaskStore } from '../stores/taskStore'

export default {
  name: 'ManagerProject',
  data() {
    return {
      userStore: useUserStore(),
      projectStore: useProjectStore(),
      taskStore: useTaskStore(),
      project: {},
      tasks: [],
      stats: {
        total: 0,
        validated: 0,
        completed: 0,
        inProgress: 0,
        notValidated: 0,
        progress: 0,
        status: 'En cours'
      },
      newTask: {
        title: '',
        description: '',
        deadline: null
      },
      selectedUserForTask: {},
      editingTaskId: null,
      editingTask: {}
    }
  },
  computed: {
    currentUser() {
      return this.userStore.getCurrentUser()
    },
    availableUsers() {
      return this.userStore.users.filter(u => u.id !== this.currentUser.id)
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
      this.stats = this.taskStore.getProjectStats(projectId)
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
    },
    validateTask(taskId) {
      if (this.taskStore.validateTask(taskId)) {
        this.refreshTasks()
      }
    },
    assignUser(taskId) {
      const userId = this.selectedUserForTask[taskId]
      if (userId) {
        this.taskStore.assignUserToTask(taskId, userId)
        this.selectedUserForTask[taskId] = ''
        this.refreshTasks()
      }
    },
    unassignUser(taskId, userId) {
      this.taskStore.unassignUserFromTask(taskId, userId)
      this.refreshTasks()
    },
    editTask(task) {
      this.editingTaskId = task.id
      this.editingTask = { ...task }
    },
    updateTask() {
      this.taskStore.updateTask(this.editingTaskId, this.editingTask)
      this.editingTaskId = null
      this.editingTask = {}
      this.refreshTasks()
    },
    cancelEdit() {
      this.editingTaskId = null
      this.editingTask = {}
    },
    deleteTask(taskId) {
      if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche?')) {
        this.taskStore.deleteTask(taskId)
        this.refreshTasks()
      }
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR')
    },
    getUserName(userId) {
      const user = this.userStore.getUserById(userId)
      return user ? user.name : 'Inconnu'
    },
    getCreatorName(userId) {
      return this.getUserName(userId)
    }
  },
  mounted() {
    this.loadProject()
  }
}
</script>

<style scoped>
.manager-project {
  max-width: 1400px;
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

.dashboard {
  margin-bottom: 40px;
  padding-bottom: 30px;
  border-bottom: 2px solid #eee;
}

.dashboard h2 {
  color: #333;
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.stat-card {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.stat-card h3 {
  margin-top: 0;
  color: #333;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background-color: #eee;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background-color: #4CAF50;
  transition: width 0.3s ease;
}

.stat-card p {
  margin: 10px 0 0 0;
  font-size: 24px;
  font-weight: bold;
  color: #2196F3;
}

.status-en-cours {
  color: #FFC107;
}

.status-à-risque {
  color: #FF9800;
}

.status-retard {
  color: #DC3545;
}

.stat-card ul {
  list-style: none;
  padding: 0;
  margin: 10px 0 0 0;
}

.stat-card li {
  padding: 4px 0;
  color: #666;
}

.tasks-management h2 {
  color: #333;
  margin-bottom: 20px;
  margin-top: 30px;
}

.create-task {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #ddd;
  margin-bottom: 30px;
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

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-success:hover {
  background-color: #218838;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
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

.task-management-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.task-header h4 {
  margin: 0;
  color: #333;
}

.task-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.status-non-validé {
  background-color: #fff3cd;
  color: #856404;
}

.status-complétée {
  background-color: #d4edda;
  color: #155724;
}

.status-validée {
  background-color: #d1ecf1;
  color: #0c5460;
}

.task-description {
  color: #666;
  margin: 12px 0;
}

.task-info {
  margin: 12px 0;
  font-size: 14px;
  color: #555;
}

.deadline {
  color: #d32f2f;
}

.assignment-section {
  margin: 16px 0;
  padding: 12px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.assignment-section h5 {
  margin-top: 0;
  color: #333;
}

.assigned-list {
  margin-bottom: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.no-assigned {
  color: #999;
  font-style: italic;
}

.assigned-user {
  background-color: #e3f2fd;
  color: #1976d2;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-remove {
  background: none;
  border: none;
  color: #1976d2;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  font-weight: bold;
}

.btn-remove:hover {
  color: #0d47a1;
}

.assign-form {
  display: flex;
  gap: 8px;
}

.assign-form .input {
  flex: 1;
}

.task-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.comments-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.comments-section h5 {
  margin-top: 0;
  color: #333;
}

.comments-list {
  max-height: 200px;
  overflow-y: auto;
}

.comment {
  padding: 8px;
  margin-bottom: 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-size: 13px;
}

.comment small {
  display: block;
  color: #999;
  margin-top: 4px;
}

.no-comments {
  color: #999;
  font-style: italic;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
  margin-top: 0;
  color: #333;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
