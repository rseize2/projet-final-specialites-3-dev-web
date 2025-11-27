import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('users', () => {
  const users = ref([])
  const currentUser = ref(null)

  // Charger les utilisateurs depuis localStorage
  const loadUsers = () => {
    const stored = localStorage.getItem('users')
    if (stored) {
      users.value = JSON.parse(stored)
    }
  }

  // Charger l'utilisateur actuel depuis localStorage
  const loadCurrentUser = () => {
    const stored = localStorage.getItem('currentUser')
    if (stored) {
      currentUser.value = JSON.parse(stored)
    }
  }

  // Sauvegarder les utilisateurs dans localStorage
  const saveUsers = () => {
    localStorage.setItem('users', JSON.stringify(users.value))
  }

  // Sauvegarder l'utilisateur actuel dans localStorage
  const saveCurrentUser = () => {
    if (currentUser.value) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
    } else {
      localStorage.removeItem('currentUser')
    }
  }

  // Valider le format d'un email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Valider le mot de passe (au moins 6 caractères)
  const isValidPassword = (password) => {
    return password && password.length >= 6
  }

  // Inscrire un nouvel utilisateur
  const register = (email, password, name, roles = ['developer']) => {
    // Vérifier que l'email est valide
    if (!isValidEmail(email)) {
      return { success: false, message: 'Email invalide' }
    }

    // Vérifier que le mot de passe est valide
    if (!isValidPassword(password)) {
      return { success: false, message: 'Le mot de passe doit contenir au moins 6 caractères' }
    }

    // Vérifier que l'utilisateur n'existe pas déjà
    if (users.value.some(u => u.email === email)) {
      return { success: false, message: 'Cet email est déjà utilisé' }
    }

    // Créer le nouvel utilisateur
    const newUser = {
      id: Date.now().toString(),
      email,
      password: btoa(password), // Simple encoding (à remplacer par du vrai hashing en production)
      name,
      roles: Array.isArray(roles) ? roles : [roles],
      createdAt: new Date().toISOString()
    }

    users.value.push(newUser)
    saveUsers()

    return { success: true, user: newUser }
  }

  // Connexion d'un utilisateur
  const login = (email, password) => {
    // Vérifier que l'email est valide
    if (!isValidEmail(email)) {
      return { success: false, message: 'Email invalide' }
    }

    // Trouver l'utilisateur
    const user = users.value.find(u => u.email === email)
    if (!user) {
      return { success: false, message: 'Email ou mot de passe incorrect' }
    }

    // Vérifier le mot de passe
    if (btoa(password) !== user.password) {
      return { success: false, message: 'Email ou mot de passe incorrect' }
    }

    // Connecter l'utilisateur
    currentUser.value = {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles
    }
    saveCurrentUser()

    return { success: true, user: currentUser.value }
  }

  // Déconnexion
  const logout = () => {
    currentUser.value = null
    saveCurrentUser()
  }

  // Obtenir l'utilisateur actuel
  const getCurrentUser = () => {
    return currentUser.value
  }

  // Vérifier si l'utilisateur a un rôle spécifique
  const hasRole = (role) => {
    return currentUser.value && currentUser.value.roles && currentUser.value.roles.includes(role)
  }

  // Obtenir un utilisateur par ID
  const getUserById = (userId) => {
    const user = users.value.find(u => u.id === userId)
    if (user) {
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles
      }
    }
    return null
  }

  // Ajouter un rôle à l'utilisateur actuel
  const addRole = (role) => {
    if (currentUser.value && !currentUser.value.roles.includes(role)) {
      currentUser.value.roles.push(role)
      const user = users.value.find(u => u.id === currentUser.value.id)
      if (user) {
        user.roles.push(role)
        saveUsers()
        saveCurrentUser()
        return true
      }
    }
    return false
  }

  // Vérifier si l'utilisateur est connecté
  const isAuthenticated = () => {
    return currentUser.value !== null
  }

  return {
    users,
    currentUser,
    loadUsers,
    loadCurrentUser,
    register,
    login,
    logout,
    getCurrentUser,
    hasRole,
    getUserById,
    addRole,
    isAuthenticated,
    isValidEmail,
    isValidPassword
  }
})
