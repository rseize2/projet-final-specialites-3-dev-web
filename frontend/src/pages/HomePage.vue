<template>
  <div class="home-page">
    <nav class="navbar">
      <div class="navbar-brand">Gestion de Projets</div>
      <div class="navbar-user">
        <span>{{ currentUser.name }}</span>
        <button @click="logout" class="btn btn-logout">Déconnexion</button>
      </div>
    </nav>

    <div class="container">
      <h1>Mes Projets</h1>

      <!-- Boutons de rôle pour dual-role users -->
      <div v-if="hasDualRole" class="role-selector">
        <button
          @click="viewMode = 'developer'"
          :class="{ active: viewMode === 'developer' }"
          class="btn btn-role"
        >
          Mode Développeur
        </button>
        <button
          @click="viewMode = 'manager'"
          :class="{ active: viewMode === 'manager' }"
          class="btn btn-role"
        >
          Mode Manager
        </button>
      </div>

      <!-- Vue Developer: projets avec tâches affectées -->
      <div v-if="viewMode === 'developer'" class="projects-grid">
        <div v-if="developerProjects.length === 0" class="no-projects">
          Aucun projet avec tâches affectées
        </div>
        <div
          v-for="project in developerProjects"
          :key="project.id"
          class="project-card"
          @click="goToDeveloperProject(project.id)"
        >
          <h3>{{ project.name }}</h3>
          <p>{{ project.description }}</p>
          <div class="project-meta">
            <span>Tâches affectées: {{ getAssignedTaskCount(project.id) }}</span>
          </div>
        </div>
      </div>

      <!-- Vue Manager: tous les projets gérés + option de créer -->
      <div v-if="viewMode === 'manager'" class="manager-view">
        <div class="create-project-section">
          <h2>Créer un nouveau projet</h2>
          <form @submit.prevent="createNewProject">
            <div class="form-group">
              <label>Nom du projet</label>
              <input v-model="newProject.name" type="text" required class="input" />
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea v-model="newProject.description" rows="3" class="input"></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Créer le projet</button>
          </form>
        </div>

        <div class="projects-grid">
          <div v-if="allProjects.length === 0" class="no-projects">
            Aucun projet créé
          </div>
          <div
            v-for="project in allProjects"
            :key="project.id"
            class="project-card"
            :class="{ 'managed-by-me': isManagedByCurrentUser(project) }"
          >
            <div class="project-card-header">
              <h3>{{ project.name }}</h3>
              <div class="project-actions">
                <button
                  v-if="!isManagedByCurrentUser(project)"
                  @click.stop="takeManagerRole(project.id)"
                  class="btn-small btn-take-role"
                  title="Se désigner comme gestionnaire"
                >
                  Prendre le rôle
                </button>
                <button
                  v-else
                  @click.stop="removeManagerRole(project.id)"
                  class="btn-small btn-remove-role"
                  title="Retirer le rôle de gestionnaire"
                >
                  ✓ Gestionnaire
                </button>
              </div>
            </div>
            <p>{{ project.description }}</p>
            <div class="project-meta">
              <span>Gestionnaires: {{ getManagerNames(project) }}</span>
            </div>
            <div class="project-footer">
              <button
                @click.stop="goToManagerProject(project.id)"
                class="btn btn-primary"
              >
                Gérer le projet
              </button>
              <button
                v-if="isManagedByCurrentUser(project)"
                @click.stop="deleteProject(project.id)"
                class="btn btn-danger"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useUserStore } from '../stores/userStore'
import { useProjectStore } from '../stores/projectStore'
import { useTaskStore } from '../stores/taskStore'

export default {
  name: 'HomePage',
  data() {
    return {
      userStore: useUserStore(),
      projectStore: useProjectStore(),
      taskStore: useTaskStore(),
      viewMode: 'developer',
      newProject: {
        name: '',
        description: ''
      }
    }
  },
  computed: {
    currentUser() {
      return this.userStore.getCurrentUser() || {}
    },
    hasDualRole() {
      return this.currentUser.roles && this.currentUser.roles.length > 1
    },
    developerProjects() {
      const projectIds = this.taskStore.getProjectsWithAssignedTasks(this.currentUser.id)
      return this.projectStore.projects.filter(p => projectIds.includes(p.id))
    },
    allProjects() {
      return this.projectStore.projects
    }
  },
  methods: {
    logout() {
      this.userStore.logout()
      this.$router.push('/')
    },
    goToDeveloperProject(projectId) {
      this.$router.push({ name: 'DeveloperProject', params: { projectId } })
    },
    goToManagerProject(projectId) {
      this.$router.push({ name: 'ManagerProject', params: { projectId } })
    },
    createNewProject() {
      if (this.newProject.name.trim()) {
        const project = this.projectStore.createProject(
          this.newProject.name,
          this.newProject.description,
          this.currentUser.id
        )
        this.newProject = { name: '', description: '' }
      }
    },
    takeManagerRole(projectId) {
      this.projectStore.addManagerToProject(projectId, this.currentUser.id)
    },
    removeManagerRole(projectId) {
      this.projectStore.removeManagerFromProject(projectId, this.currentUser.id)
    },
    deleteProject(projectId) {
      if (confirm('Êtes-vous sûr de vouloir supprimer ce projet?')) {
        this.projectStore.deleteProject(projectId)
        const tasks = this.taskStore.getTasksByProject(projectId)
        tasks.forEach(task => this.taskStore.deleteTask(task.id))
      }
    },
    isManagedByCurrentUser(project) {
      return project.managers.includes(this.currentUser.id)
    },
    getManagerNames(project) {
      return project.managers
        .map(id => {
          const user = this.userStore.getUserById(id)
          return user ? user.name : 'Inconnu'
        })
        .join(', ')
    },
    getAssignedTaskCount(projectId) {
      return this.taskStore
        .getTasksByProject(projectId)
        .filter(t => t.assignedTo.includes(this.currentUser.id)).length
    }
  },
  mounted() {
    if (!this.userStore.isAuthenticated()) {
      this.$router.push('/')
    } else {
      // Charger les projets et tâches
      this.projectStore.loadProjects()
      this.taskStore.loadTasks()

      // Définir le mode par défaut
      if (this.currentUser.roles.includes('manager') && !this.currentUser.roles.includes('developer')) {
        this.viewMode = 'manager'
      }
    }
  }
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.navbar {
  background-color: #333;
  color: white;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.navbar-brand {
  font-size: 20px;
  font-weight: bold;
}

.navbar-user {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-logout {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.btn-logout:hover {
  background-color: #c82333;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}

h1 {
  color: #333;
  margin-bottom: 30px;
}

.role-selector {
  display: flex;
  gap: 12px;
  margin-bottom: 30px;
}

.btn-role {
  padding: 10px 20px;
  border: 2px solid #2196F3;
  background-color: white;
  color: #2196F3;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-role.active {
  background-color: #2196F3;
  color: white;
}

.btn-role:hover {
  background-color: #2196F3;
  color: white;
}

.create-project-section {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.create-project-section h2 {
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

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.no-projects {
  grid-column: 1 / -1;
  padding: 40px;
  text-align: center;
  color: #999;
  background-color: white;
  border-radius: 8px;
}

.project-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.project-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  border-color: #2196F3;
}

.project-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.project-card-header h3 {
  margin: 0;
  color: #333;
  flex: 1;
}

.project-actions {
  display: flex;
  gap: 8px;
}

.btn-small {
  padding: 4px 8px;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-take-role {
  color: #2196F3;
  border-color: #2196F3;
}

.btn-take-role:hover {
  background-color: #e3f2fd;
}

.btn-remove-role {
  color: #28a745;
  border-color: #28a745;
  background-color: #f0f7f0;
}

.project-card p {
  color: #666;
  margin: 12px 0;
  line-height: 1.5;
}

.project-meta {
  font-size: 13px;
  color: #999;
  margin-bottom: 12px;
}

.project-footer {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.project-footer .btn {
  flex: 1;
  padding: 8px 12px;
}

.managed-by-me {
  border-left: 4px solid #28a745;
}
</style>
