<template>
  <div class="page-login">
    <div class="carte-login" role="main">
      <!-- Section titre -->
      <header class="en-tete-page">
        <h1 class="titre-page">Connexion</h1>
        <p class="sous-titre-page">Saisissez vos identifiants pour accéder à votre compte.</p>
      </header>

      <!-- Message erreur -->
      <div 
        v-if="erreurMessage" 
        class="notification-erreur"
        role="alert"
        aria-live="polite"
      >
        {{ erreurMessage }}
      </div>

      <!-- Formulaire -->
      <form @submit.prevent="effectuerConnexion" novalidate class="form-login">
        <!-- Email -->
        <div class="champ-formulaire">
          <label for="input-email" class="label-champ">
            Adresse email
          </label>
          <input
            id="input-email"
            v-model="identifiants.email"
            type="email"
            required
            class="input-champ"
            placeholder="Saisissez votre adresse email"
            aria-required="true"
            :aria-invalid="erreurMessage ? 'true' : 'false'"
            autocomplete="email"
          />
        </div>

        <!-- Mot de passe -->
        <div class="champ-formulaire">
          <label for="input-password" class="label-champ">
            Mot de passe
          </label>
          <div class="wrapper-password">
            <input
              id="input-password"
              v-model="identifiants.motDePasse"
              :type="afficherMdp ? 'text' : 'password'"
              required
              class="input-champ"
              placeholder="Saisissez votre mot de passe"
              aria-required="true"
              :aria-invalid="erreurMessage ? 'true' : 'false'"
              autocomplete="current-password"
            />
            <button
              type="button"
              class="btn-toggle-mdp"
              :aria-label="afficherMdp ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
              @click="basculerVisibiliteMdp"
            >
              <svg v-if="!afficherMdp" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 4C5 4 1.73 7.11 1 10c.73 2.89 4 6 9 6s8.27-3.11 9-6c-.73-2.89-4-6-9-6z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="10" cy="10" r="2.5" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3l14 14M10.5 7.5A2.5 2.5 0 0 0 8 10M12.5 12.5A2.5 2.5 0 0 1 10 15M6.5 6.5C4.5 7.5 3 9.5 3 10c.73 2.89 4 6 7 6 1.5 0 2.8-.5 4-1.2M13.5 13.5c1.5-1 2.5-2.5 3-3.5-.7-2.89-4-6-6.5-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Bouton submit -->
        <button 
          type="submit" 
          class="btn-submit"
          :disabled="chargementActif"
          :aria-busy="chargementActif"
        >
          <span v-if="!chargementActif">Se connecter</span>
          <span v-else class="loader-content">
            <svg class="spinner" width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="40 10"/>
            </svg>
            Connexion en cours...
          </span>
        </button>
      </form>

      <!-- Pied de page -->
      <footer class="pied-page">
        <p class="texte-pied">
          Vous n'avez pas encore de compte ?
          <router-link 
            to="/register" 
            class="lien-register"
            aria-label="Créer un nouveau compte"
          >
            Inscrivez-vous
          </router-link>
        </p>
      </footer>
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
      identifiants: {
        email: '',
        motDePasse: ''
      },
      erreurMessage: '',
      chargementActif: false,
      afficherMdp: false
    }
  },
  methods: {
    basculerVisibiliteMdp() {
      this.afficherMdp = !this.afficherMdp
    },

    async effectuerConnexion() {
      // Réinitialisation de l'erreur
      this.erreurMessage = ''
      this.chargementActif = true

      // Validation : champs vides
      if (!this.identifiants.email || !this.identifiants.motDePasse) {
        this.erreurMessage = 'Veuillez remplir tous les champs obligatoires'
        this.chargementActif = false
        return
      }

      // Validation : format email
      const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!regexEmail.test(this.identifiants.email)) {
        this.erreurMessage = 'L\'adresse email saisie n\'est pas valide'
        this.chargementActif = false
        return
      }

      // Délai de simulation réseau
      await new Promise(resolve => setTimeout(resolve, 600))

      // Tentative de connexion
      const reponse = this.userStore.login(
        this.identifiants.email, 
        this.identifiants.motDePasse
      )

      this.chargementActif = false

      if (reponse.success) {
        this.$router.push({ name: 'Home' })
      } else {
        this.erreurMessage = reponse.message
      }
    }
  },
  mounted() {
    // Redirection automatique si déjà connecté
    if (this.userStore.isAuthenticated()) {
      this.$router.push({ name: 'Home' })
    } else {
      this.userStore.loadUsers()
    }
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.page-login {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background-color: #F8F8F8;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  padding: 1.75rem;
}

.carte-login {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 2.75rem 2.25rem;
  width: 100%;
  max-width: 420px;
  animation: fadeInUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.en-tete-page {
  text-align: center;
  margin-bottom: 2.25rem;
}

.titre-page {
  font-size: 2rem;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 0.625rem;
  letter-spacing: -0.02em;
}

.sous-titre-page {
  font-size: 0.9375rem;
  color: #666666;
  font-weight: 400;
  line-height: 1.6;
}

.notification-erreur {
  background-color: #FDECEA;
  color: #C62828;
  padding: 1rem 1.125rem;
  border-radius: 10px;
  margin-bottom: 1.75rem;
  font-size: 0.875rem;
  border: 1px solid #FFCDD2;
  animation: slideIn 0.35s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-login {
  display: grid;
  gap: 1.5rem;
}

.champ-formulaire {
  display: grid;
  gap: 0.625rem;
}

.label-champ {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1A1A1A;
}

.input-champ {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1.5px solid #D4D4D4;
  border-radius: 9px;
  font-size: 0.9375rem;
  font-family: inherit;
  color: #1A1A1A;
  background-color: white;
  transition: all 0.25s ease;
}

.input-champ::placeholder {
  color: #9E9E9E;
}

.input-champ:hover {
  border-color: #A8A8A8;
}

.input-champ:focus {
  outline: none;
  border-color: #1A1A1A;
  box-shadow: 0 0 0 3.5px rgba(26, 26, 26, 0.08);
}

.input-champ[aria-invalid="true"] {
  border-color: #C62828;
}

.wrapper-password {
  position: relative;
}

.wrapper-password .input-champ {
  padding-right: 3.25rem;
}

.btn-toggle-mdp {
  position: absolute;
  right: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: grid;
  place-items: center;
  color: #666666;
  border-radius: 6px;
  transition: all 0.25s ease;
}

.btn-toggle-mdp:hover {
  color: #1A1A1A;
  background-color: #F8F8F8;
}

.btn-toggle-mdp:focus-visible {
  outline: 2.5px solid #1A1A1A;
  outline-offset: 2px;
}

.btn-submit {
  width: 100%;
  padding: 1rem 1.125rem;
  border: none;
  border-radius: 9px;
  font-size: 0.9375rem;
  font-weight: 600;
  font-family: inherit;
  color: white;
  background-color: #1A1A1A;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 0.75rem;
}

.btn-submit:hover:not(:disabled) {
  background-color: #000000;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-submit:active:not(:disabled) {
  transform: translateY(0);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-submit:focus-visible {
  outline: 3.5px solid rgba(26, 26, 26, 0.4);
  outline-offset: 3px;
}

.loader-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
}

.spinner {
  animation: spin 1.2s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.pied-page {
  text-align: center;
  margin-top: 2.25rem;
}

.texte-pied {
  font-size: 0.875rem;
  color: #666666;
}

.lien-register {
  color: #1A1A1A;
  font-weight: 600;
  text-decoration: underline;
  transition: color 0.25s ease;
}

.lien-register:hover {
  color: #000000;
}

.lien-register:focus-visible {
  outline: 2.5px solid #1A1A1A;
  outline-offset: 3px;
  border-radius: 5px;
}

/* Responsive - Tablette */
@media (max-width: 768px) {
  .page-login {
    padding: 1.5rem 1.25rem;
  }

  .carte-login {
    padding: 2.5rem 2rem;
  }
}

/* Responsive - Mobile */
@media (max-width: 640px) {
  .page-login {
    padding: 1.25rem;
    align-items: flex-start;
    padding-top: 3rem;
  }

  .carte-login {
    padding: 2.25rem 1.75rem;
    max-width: 100%;
  }

  .titre-page {
    font-size: 1.75rem;
  }

  .sous-titre-page {
    font-size: 0.875rem;
  }

  .input-champ {
    padding: 1rem 1.125rem;
    font-size: 1rem;
  }

  .wrapper-password .input-champ {
    padding-right: 3.5rem;
  }

  .btn-toggle-mdp {
    right: 1rem;
    padding: 0.625rem;
  }

  .btn-submit {
    padding: 1.125rem;
    font-size: 1rem;
  }

  .form-login {
    gap: 1.375rem;
  }

  .pied-page {
    margin-top: 2rem;
  }
}

/* Responsive - Petits mobiles */
@media (max-width: 375px) {
  .carte-login {
    padding: 2rem 1.5rem;
  }

  .titre-page {
    font-size: 1.625rem;
  }

  .en-tete-page {
    margin-bottom: 2rem;
  }
}

/* Responsive - Mode paysage */
@media (max-height: 600px) and (orientation: landscape) {
  .page-login {
    padding: 1.25rem;
    align-items: flex-start;
  }

  .carte-login {
    padding: 1.75rem;
    margin: 0.75rem 0;
  }

  .en-tete-page {
    margin-bottom: 1.5rem;
  }

  .titre-page {
    font-size: 1.625rem;
    margin-bottom: 0.5rem;
  }

  .sous-titre-page {
    font-size: 0.875rem;
  }

  .form-login {
    gap: 1.25rem;
  }

  .pied-page {
    margin-top: 1.5rem;
  }
}

/* Accessibilité - Contraste élevé */
@media (prefers-contrast: high) {
  .input-champ {
    border-width: 2px;
  }

  .input-champ:focus {
    border-width: 2px;
    box-shadow: 0 0 0 4px rgba(26, 26, 26, 0.25);
  }

  .btn-submit {
    border: 2px solid transparent;
  }

  .btn-submit:focus-visible {
    outline-width: 4px;
  }
}

/* Accessibilité - Mouvement réduit */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Mode sombre */
@media (prefers-color-scheme: dark) {
  .page-login {
    background-color: #0D0D0D;
  }

  .carte-login {
    background-color: #1F1F1F;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
  }

  .titre-page {
    color: #F0F0F0;
  }

  .sous-titre-page {
    color: #B0B0B0;
  }

  .label-champ {
    color: #F0F0F0;
  }

  .input-champ {
    background-color: #0D0D0D;
    border-color: #444444;
    color: #F0F0F0;
  }

  .input-champ::placeholder {
    color: #707070;
  }

  .input-champ:hover {
    border-color: #707070;
  }

  .input-champ:focus {
    border-color: #F0F0F0;
    box-shadow: 0 0 0 3.5px rgba(240, 240, 240, 0.12);
  }

  .btn-toggle-mdp {
    color: #B0B0B0;
  }

  .btn-toggle-mdp:hover {
    color: #F0F0F0;
    background-color: #2D2D2D;
  }

  .btn-submit {
    background-color: #F0F0F0;
    color: #1A1A1A;
  }

  .btn-submit:hover:not(:disabled) {
    background-color: #DDDDDD;
  }

  .texte-pied {
    color: #B0B0B0;
  }

  .lien-register {
    color: #F0F0F0;
  }

  .lien-register:hover {
    color: #DDDDDD;
  }
}
</style>