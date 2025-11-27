import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref([])

  // Charger les tâches depuis localStorage
  const loadTasks = () => {
    const stored = localStorage.getItem('tasks')
    if (stored) {
      tasks.value = JSON.parse(stored)
    }
  }

  // Sauvegarder les tâches dans localStorage
  const saveTasks = () => {
    localStorage.setItem('tasks', JSON.stringify(tasks.value))
  }

  // Créer une nouvelle tâche (Developer ou Manager)
  const createTask = (projectId, title, description, createdBy, deadline = null) => {
    const task = {
      id: Date.now().toString(),
      projectId,
      title,
      description,
      status: 'Non validé', // Statuts: Non validé, En cours, Complétée, Validée
      assignedTo: [],
      createdBy,
      createdAt: new Date().toISOString(),
      deadline,
      comments: []
    }
    tasks.value.push(task)
    saveTasks()
    return task
  }

  // Modifier une tâche (Manager)
  const updateTask = (taskId, updates) => {
    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      Object.assign(task, updates)
      saveTasks()
      return task
    }
    return null
  }

  // Supprimer une tâche (Manager)
  const deleteTask = (taskId) => {
    const index = tasks.value.findIndex(t => t.id === taskId)
    if (index > -1) {
      tasks.value.splice(index, 1)
      saveTasks()
      return true
    }
    return false
  }

  // Récupérer une tâche par ID
  const getTaskById = (taskId) => {
    return tasks.value.find(t => t.id === taskId)
  }

  // Récupérer les tâches d'un projet
  const getTasksByProject = (projectId) => {
    return tasks.value.filter(t => t.projectId === projectId)
  }

  // Récupérer les tâches affectées à un utilisateur
  const getTasksAssignedToUser = (userId) => {
    return tasks.value.filter(t => t.assignedTo.includes(userId))
  }

  // Récupérer les projets où au moins une tâche est affectée à l'utilisateur
  const getProjectsWithAssignedTasks = (userId) => {
    const userTasks = getTasksAssignedToUser(userId)
    const projectIds = [...new Set(userTasks.map(t => t.projectId))]
    return projectIds
  }

  // Affecter un utilisateur à une tâche (Manager)
  const assignUserToTask = (taskId, userId) => {
    const task = tasks.value.find(t => t.id === taskId)
    if (task && !task.assignedTo.includes(userId)) {
      task.assignedTo.push(userId)
      saveTasks()
      return true
    }
    return false
  }

  // Désaffecter un utilisateur d'une tâche (Manager)
  const unassignUserFromTask = (taskId, userId) => {
    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      const index = task.assignedTo.indexOf(userId)
      if (index > -1) {
        task.assignedTo.splice(index, 1)
        saveTasks()
        return true
      }
    }
    return false
  }

  // Marquer une tâche comme complétée (Developer)
  const markTaskAsCompleted = (taskId, userId) => {
    const task = tasks.value.find(t => t.id === taskId)
    if (task && task.assignedTo.includes(userId)) {
      task.status = 'Complétée'
      saveTasks()
      return true
    }
    return false
  }

  // Valider une tâche complétée (Manager)
  const validateTask = (taskId) => {
    const task = tasks.value.find(t => t.id === taskId)
    if (task && task.status === 'Complétée') {
      task.status = 'Validée'
      saveTasks()
      return true
    }
    return false
  }

  // Ajouter un commentaire à une tâche
  const addCommentToTask = (taskId, userId, userName, content) => {
    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      const comment = {
        id: Date.now().toString(),
        userId,
        userName,
        content,
        createdAt: new Date().toISOString()
      }
      task.comments.push(comment)
      saveTasks()
      return comment
    }
    return null
  }

  // Récupérer les commentaires d'une tâche
  const getTaskComments = (taskId) => {
    const task = tasks.value.find(t => t.id === taskId)
    return task ? task.comments : []
  }

  // Calculer la progression d'un projet
  const getProjectProgress = (projectId) => {
    const projectTasks = getTasksByProject(projectId)
    if (projectTasks.length === 0) return 0

    const completedTasks = projectTasks.filter(t => t.status === 'Validée').length
    return Math.round((completedTasks / projectTasks.length) * 100)
  }

  // Obtenir le statut d'avancement d'un projet (On time, At risk, Delayed)
  const getProjectStatus = (projectId) => {
    const projectTasks = getTasksByProject(projectId)
    const now = new Date()

    let delayed = 0
    let atRisk = 0

    projectTasks.forEach(task => {
      if (task.deadline && task.status !== 'Validée') {
        const deadline = new Date(task.deadline)
        const daysUntilDeadline = (deadline - now) / (1000 * 60 * 60 * 24)

        if (daysUntilDeadline < 0) {
          delayed++
        } else if (daysUntilDeadline < 3) {
          atRisk++
        }
      }
    })

    if (delayed > 0) return 'Retard'
    if (atRisk > 0) return 'À risque'
    return 'En cours'
  }

  // Obtenir les statistiques d'un projet
  const getProjectStats = (projectId) => {
    const projectTasks = getTasksByProject(projectId)
    return {
      total: projectTasks.length,
      validated: projectTasks.filter(t => t.status === 'Validée').length,
      completed: projectTasks.filter(t => t.status === 'Complétée').length,
      inProgress: projectTasks.filter(t => t.status === 'En cours').length,
      notValidated: projectTasks.filter(t => t.status === 'Non validé').length,
      progress: getProjectProgress(projectId),
      status: getProjectStatus(projectId)
    }
  }

  return {
    tasks,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    getTaskById,
    getTasksByProject,
    getTasksAssignedToUser,
    getProjectsWithAssignedTasks,
    assignUserToTask,
    unassignUserFromTask,
    markTaskAsCompleted,
    validateTask,
    addCommentToTask,
    getTaskComments,
    getProjectProgress,
    getProjectStatus,
    getProjectStats
  }
})
