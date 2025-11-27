import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useProjectStore = defineStore('projects', () => {
  const projects = ref([])

  // Charger les projets depuis localStorage
  const loadProjects = () => {
    const stored = localStorage.getItem('projects')
    if (stored) {
      projects.value = JSON.parse(stored)
    }
  }

  // Sauvegarder les projets dans localStorage
  const saveProjects = () => {
    localStorage.setItem('projects', JSON.stringify(projects.value))
  }

  // Créer un nouveau projet (Manager)
  const createProject = (name, description, managerId) => {
    const project = {
      id: Date.now().toString(),
      name,
      description,
      managers: [managerId],
      createdAt: new Date().toISOString(),
      createdBy: managerId
    }
    projects.value.push(project)
    saveProjects()
    return project
  }

  // Modifier un projet (Manager)
  const updateProject = (projectId, updates) => {
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      Object.assign(project, updates)
      saveProjects()
      return project
    }
    return null
  }

  // Supprimer un projet (Manager)
  const deleteProject = (projectId) => {
    const index = projects.value.findIndex(p => p.id === projectId)
    if (index > -1) {
      projects.value.splice(index, 1)
      saveProjects()
      return true
    }
    return false
  }

  // Récupérer un projet par ID
  const getProjectById = (projectId) => {
    return projects.value.find(p => p.id === projectId)
  }

  // Récupérer tous les projets
  const getAllProjects = () => {
    return projects.value
  }

  // Récupérer les projets gérés par un manager
  const getProjectsByManager = (managerId) => {
    return projects.value.filter(p => p.managers.includes(managerId))
  }

  // Ajouter un manager à un projet
  const addManagerToProject = (projectId, managerId) => {
    const project = projects.value.find(p => p.id === projectId)
    if (project && !project.managers.includes(managerId)) {
      project.managers.push(managerId)
      saveProjects()
      return true
    }
    return false
  }

  // Retirer un manager d'un projet
  const removeManagerFromProject = (projectId, managerId) => {
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      const index = project.managers.indexOf(managerId)
      if (index > -1) {
        project.managers.splice(index, 1)
        saveProjects()
        return true
      }
    }
    return false
  }

  return {
    projects,
    loadProjects,
    createProject,
    updateProject,
    deleteProject,
    getProjectById,
    getAllProjects,
    getProjectsByManager,
    addManagerToProject,
    removeManagerFromProject
  }
})
