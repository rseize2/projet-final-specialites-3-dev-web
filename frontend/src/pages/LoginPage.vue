<template>
  <div class="login-page">
    <button @click="toggleDarkMode" class="dark-mode-toggle" title="Changer de thème">
      <span v-if="isDark">☀️</span>
      <span v-else>🌙</span>
    </button>
    <div class="login-container fade-in">
      <h1 class="bounce">Gestion de Projets</h1>

      <div class="tabs">
        <button
          @click="switchTab(true)"
          :class="{ active: isLogin }"
          class="tab-button smooth-transition"
        >
          Connexion
        </button>
        <button
          @click="switchTab(false)"
          :class="{ active: !isLogin }"
          class="tab-button smooth-transition"
        >
          Inscription
        </button>
      </div>

      <form v-if="isLogin" @submit.prevent="handleLogin" class="form-animate" :class="{ shake: hasError }">
        <h2>Connexion</h2>

        <transition name="error-fade">
          <div v-if="loginError" class="error-message">
            {{ loginError }}
          </div>
        </transition>

        <div class="form-group">
          <label>Email</label>
          <input
            v-model="loginForm.email"
            type="email"
            required
            class="input focus-ring"
            placeholder="votre@email.com"
            @focus="clearError"
          />
        </div>

        <div class="form-group">
          <label>Mot de passe</label>
          <input
            v-model="loginForm.password"
            type="password"
            required
            class="input focus-ring"
            placeholder="••••••••"
            @focus="clearError"
          />
        </div>

        <button type="submit" class="btn btn-primary btn-ripple" :disabled="isLoading">
          <span v-if="!isLoading">Se connecter</span>
          <span v-else class="loading-text">
            <span class="spinner-small"></span>
            Connexion en cours...
          </span>
        </button>
      </form>

      <form v-else @submit.prevent="handleRegister" class="form-animate" :class="{ shake: hasError }">
        <h2>Inscription</h2>

        <transition name="error-fade">
          <div v-if="registerError" class="error-message">
            {{ registerError }}
          </div>
        </transition>

        <div class="form-group">
          <label>Nom</label>
          <input
            v-model="registerForm.name"
            type="text"
            required
            class="input focus-ring"
            placeholder="Jean Dupont"
            @focus="clearError"
          />
        </div>

        <div class="form-group">
          <label>Email</label>
          <input
            v-model="registerForm.email"
            type="email"
            required
            class="input focus-ring"
            placeholder="votre@email.com"
            @focus="clearError"
          />
        </div>

        <div class="form-group">
          <label>Mot de passe</label>
          <div class="password-wrapper">
            <input
              v-model="registerForm.password"
              type="password"
              required
              class="input focus-ring"
              placeholder="Au moins 6 caractères"
              @focus="clearError"
            />
            <div v-if="registerForm.password" class="password-strength">
              <div class="strength-bar" :class="passwordStrengthClass"></div>
              <span class="strength-text">{{ passwordStrengthText }}</span>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Confirmer le mot de passe</label>
          <input
            v-model="registerForm.confirmPassword"
            type="password"
            required
            class="input focus-ring"
            :class="{ 'input-error': registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword }"
            placeholder="Confirmez votre mot de passe"
            @focus="clearError"
          />
          <span v-if="registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword" class="field-error">
            Les mots de passe ne correspondent pas
          </span>
        </div>

        <div class="form-group">
          <label>Rôle(s)</label>
          <div class="checkbox-group">
            <label class="checkbox-label smooth-hover">
              <input v-model="registerForm.roles" type="checkbox" value="developer" />
              <span class="checkbox-custom"></span>
              Développeur
            </label>
            <label class="checkbox-label smooth-hover">
              <input v-model="registerForm.roles" type="checkbox" value="manager" />
              <span class="checkbox-custom"></span>
              Manager
            </label>
          </div>
        </div>

        <button type="submit" class="btn btn-primary btn-ripple" :disabled="isLoading">
          <span v-if="!isLoading">S'inscrire</span>
          <span v-else class="loading-text">
            <span class="spinner-small"></span>
            Inscription en cours...
          </span>
        </button>
      </form>
    </div>

    <transition name="toast-slide">
      <div v-if="toast.show" :class="['toast', `toast-${toast.type}`]">
        {{ toast.message }}
      </div>
    </transition>
  </div>
</template>

<script>
import { useUserStore } from '../stores/userStore'
import { useDarkMode } from '../composables/useDarkMode'

export default {
  name: 'LoginPage',
  setup() {
    const { isDark, toggleDarkMode, initDarkMode } = useDarkMode()
    return { isDark, toggleDarkMode, initDarkMode }
  },
  data() {
    return {
      userStore: useUserStore(),
      isLogin: true,
      isLoading: false,
      hasError: false,
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
      registerError: '',
      toast: {
        show: false,
        message: '',
        type: 'success'
      }
    }
  },
  computed: {
    passwordStrengthClass() {
      const password = this.registerForm.password
      if (password.length < 6) return 'weak'
      if (password.length < 10) return 'medium'
      return 'strong'
    },
    passwordStrengthText() {
      const strength = this.passwordStrengthClass
      if (strength === 'weak') return 'Faible'
      if (strength === 'medium') return 'Moyen'
      return 'Fort'
    }
  },
  methods: {
    switchTab(isLogin) {
      this.isLogin = isLogin
      this.clearError()
    },
    clearError() {
      this.loginError = ''
      this.registerError = ''
      this.hasError = false
    },
    showToast(message, type = 'success') {
      this.toast = { show: true, message, type }
      setTimeout(() => {
        this.toast.show = false
      }, 3000)
    },
    async handleLogin() {
      this.loginError = ''
      this.hasError = false
      this.isLoading = true

      await new Promise(resolve => setTimeout(resolve, 500))

      const result = this.userStore.login(this.loginForm.email, this.loginForm.password)

      this.isLoading = false

      if (result.success) {
        this.showToast('Connexion réussie! Bienvenue', 'success')
        setTimeout(() => {
          this.$router.push({ name: 'Home' })
        }, 500)
      } else {
        this.loginError = result.message
        this.hasError = true
        setTimeout(() => {
          this.hasError = false
        }, 500)
      }
    },
    async handleRegister() {
      this.registerError = ''
      this.hasError = false

      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        this.registerError = 'Les mots de passe ne correspondent pas'
        this.hasError = true
        setTimeout(() => {
          this.hasError = false
        }, 500)
        return
      }

      if (this.registerForm.roles.length === 0) {
        this.registerError = 'Veuillez sélectionner au moins un rôle'
        this.hasError = true
        setTimeout(() => {
          this.hasError = false
        }, 500)
        return
      }

      this.isLoading = true

      await new Promise(resolve => setTimeout(resolve, 500))

      const result = this.userStore.register(
        this.registerForm.email,
        this.registerForm.password,
        this.registerForm.name,
        this.registerForm.roles
      )

      this.isLoading = false

      if (result.success) {
        this.showToast('Inscription réussie! Bienvenue', 'success')
        const loginResult = this.userStore.login(this.registerForm.email, this.registerForm.password)
        if (loginResult.success) {
          setTimeout(() => {
            this.$router.push({ name: 'Home' })
          }, 500)
        }
      } else {
        this.registerError = result.message
        this.hasError = true
        setTimeout(() => {
          this.hasError = false
        }, 500)
      }
    }
  },
  mounted() {
    this.initDarkMode()
    if (this.userStore.isAuthenticated()) {
      this.$router.push({ name: 'Home' })
    } else {
      this.userStore.loadUsers()
    }
  }
}
</script>

<style>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  padding: 20px;
  position: relative;
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
}

.tab-button.active {
  border-color: #667eea;
  background-color: #667eea;
  color: white;
  transform: scale(1.02);
}

.tab-button:hover:not(.active) {
  border-color: #667eea;
  transform: translateY(-2px);
}

.form-animate {
  animation: slideInLeft 0.3s ease-out;
}

h2 {
  color: #333;
  margin: 0 0 20px 0;
  font-size: 20px;
  text-align: center;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  border-left: 4px solid #e74c3c;
  font-size: 14px;
}

.error-fade-enter-active, .error-fade-leave-active {
  transition: all 0.3s ease;
}

.error-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.error-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
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
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-error {
  border-color: #e74c3c !important;
}

.field-error {
  color: #e74c3c;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.password-wrapper {
  position: relative;
}

.password-strength {
  margin-top: 8px;
}

.strength-bar {
  height: 4px;
  border-radius: 2px;
  transition: all 0.3s ease;
  margin-bottom: 4px;
}

.strength-bar.weak {
  width: 33%;
  background-color: #e74c3c;
}

.strength-bar.medium {
  width: 66%;
  background-color: #f39c12;
}

.strength-bar.strong {
  width: 100%;
  background-color: #27ae60;
}

.strength-text {
  font-size: 12px;
  color: #666;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: normal;
  color: #666;
  padding: 8px;
  border-radius: 6px;
}

.checkbox-label:hover {
  background-color: #f5f5f5;
}

.checkbox-label input {
  cursor: pointer;
  width: 18px;
  height: 18px;
}

.btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-top: 8px;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #5568d3;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transform: translateY(-2px);
}

.btn-primary:active:not(:disabled) {
  transform: scale(0.98);
}

.loading-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spinner-small {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-left-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.toast-slide-enter-active, .toast-slide-leave-active {
  transition: all 0.3s ease;
}

.toast-slide-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

@media (max-width: 480px) {
  .login-container {
    padding: 30px 20px;
  }

  h1 {
    font-size: 24px;
  }

  .tab-button {
    font-size: 13px;
    padding: 10px;
  }
}
</style>
