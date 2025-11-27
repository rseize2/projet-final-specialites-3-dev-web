<template>
  <div class="login-page">
    <div class="login-container">
      <h1>Gestion de Projets</h1>

      <div class="tabs">
        <button
          @click="isLogin = true"
          :class="{ active: isLogin }"
          class="tab-button"
        >
          Connexion
        </button>
        <button
          @click="isLogin = false"
          :class="{ active: !isLogin }"
          class="tab-button"
        >
          Inscription
        </button>
      </div>

      <!-- Formulaire de connexion -->
      <form v-if="isLogin" @submit.prevent="handleLogin">
        <h2>Connexion</h2>

        <div v-if="loginError" class="error-message">
          {{ loginError }}
        </div>

        <div class="form-group">
          <label>Email</label>
          <input
            v-model="loginForm.email"
            type="email"
            required
            class="input"
            placeholder="votre@email.com"
          />
        </div>

        <div class="form-group">
          <label>Mot de passe</label>
          <input
            v-model="loginForm.password"
            type="password"
            required
            class="input"
            placeholder="••••••••"
          />
        </div>

        <button type="submit" class="btn btn-primary">Se connecter</button>
      </form>

      <!-- Formulaire d'inscription -->
      <form v-else @submit.prevent="handleRegister">
        <h2>Inscription</h2>

        <div v-if="registerError" class="error-message">
          {{ registerError }}
        </div>

        <div class="form-group">
          <label>Nom</label>
          <input
            v-model="registerForm.name"
            type="text"
            required
            class="input"
            placeholder="Jean Dupont"
          />
        </div>

        <div class="form-group">
          <label>Email</label>
          <input
            v-model="registerForm.email"
            type="email"
            required
            class="input"
            placeholder="votre@email.com"
          />
        </div>

        <div class="form-group">
          <label>Mot de passe</label>
          <input
            v-model="registerForm.password"
            type="password"
            required
            class="input"
            placeholder="Au moins 6 caractères"
          />
        </div>

        <div class="form-group">
          <label>Confirmer le mot de passe</label>
          <input
            v-model="registerForm.confirmPassword"
            type="password"
            required
            class="input"
            placeholder="Confirmez votre mot de passe"
          />
        </div>

        <div class="form-group">
          <label>Rôle(s)</label>
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input v-model="registerForm.roles" type="checkbox" value="developer" />
              Développeur
            </label>
            <label class="checkbox-label">
              <input v-model="registerForm.roles" type="checkbox" value="manager" />
              Manager
            </label>
          </div>
        </div>

        <button type="submit" class="btn btn-primary">S'inscrire</button>
      </form>
    </div>
  </div>
</template>

<script>
import { useUserStore } from '../stores/userStore'

export default {
  name: 'LoginPage',
  data() {
    return {
      userStore: useUserStore(),
      isLogin: true,
      loginForm: {
        email: '',
        password: ''
      },
      registerForm: {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        roles: ['developer']
      },
      loginError: '',
      registerError: ''
    }
  },
  methods: {
    handleLogin() {
      this.loginError = ''

      const result = this.userStore.login(this.loginForm.email, this.loginForm.password)

      if (result.success) {
        this.$router.push({ name: 'Home' })
      } else {
        this.loginError = result.message
      }
    },
    handleRegister() {
      this.registerError = ''

      // Vérifier que les mots de passe correspondent
      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        this.registerError = 'Les mots de passe ne correspondent pas'
        return
      }

      // Vérifier qu'au moins un rôle est sélectionné
      if (this.registerForm.roles.length === 0) {
        this.registerError = 'Veuillez sélectionner au moins un rôle'
        return
      }

      const result = this.userStore.register(
        this.registerForm.email,
        this.registerForm.password,
        this.registerForm.name,
        this.registerForm.roles
      )

      if (result.success) {
        // Connecter automatiquement après l'inscription
        const loginResult = this.userStore.login(this.registerForm.email, this.registerForm.password)
        if (loginResult.success) {
          this.$router.push({ name: 'Home' })
        }
      } else {
        this.registerError = result.message
      }
    }
  },
  mounted() {
    // Si l'utilisateur est déjà connecté, rediriger vers la page d'accueil
    if (this.userStore.isAuthenticated()) {
      this.$router.push({ name: 'Home' })
    } else {
      // Charger les utilisateurs depuis localStorage
      this.userStore.loadUsers()
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
}

.login-container {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

h1 {
  text-align: center;
  color: #333;
  margin: 0 0 30px 0;
  font-size: 28px;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.tab-button {
  flex: 1;
  padding: 12px;
  border: 2px solid #ddd;
  background-color: white;
  color: #333;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.tab-button.active {
  border-color: #667eea;
  background-color: #667eea;
  color: white;
}

.tab-button:hover {
  border-color: #667eea;
}

h2 {
  color: #333;
  margin: 0 0 20px 0;
  font-size: 20px;
  text-align: center;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  border: 1px solid #f5c6cb;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: normal;
  color: #666;
}

.checkbox-label input {
  cursor: pointer;
}

.btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #667eea;
  color: white;
}

.btn-primary:hover {
  background-color: #5568d3;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:active {
  transform: scale(0.98);
}
</style>
