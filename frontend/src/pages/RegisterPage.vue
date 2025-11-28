<template>
  <div class="page-register">
    <div class="carte-register" role="main">
      <!-- En-tête -->
      <header class="section-titre">
        <h1 class="titre-register">Inscription</h1>
        <p class="description-register">Créez votre compte pour commencer.</p>
      </header>

      <!-- Notification erreur -->
      <div 
        v-if="notificationErreur" 
        class="banniere-erreur"
        role="alert"
        aria-live="polite"
      >
        {{ notificationErreur }}
      </div>

      <!-- Notification succès -->
      <div 
        v-if="notificationSucces" 
        class="banniere-succes"
        role="status"
        aria-live="polite"
      >
        {{ notificationSucces }}
      </div>

      <!-- Formulaire -->
      <form @submit.prevent="creerCompte" novalidate class="form-register">
        <!-- Nom complet -->
        <div class="groupe-input">
          <label for="input-nom-complet" class="etiquette-input">
            Nom complet
          </label>
          <input
            id="input-nom-complet"
            v-model="formulaire.nomComplet"
            type="text"
            required
            class="champ-input"
            placeholder="Saisissez votre nom complet"
            aria-required="true"
            autocomplete="name"
          />
        </div>

        <!-- Email -->
        <div class="groupe-input">
          <label for="input-email-register" class="etiquette-input">
            Adresse email
          </label>
          <input
            id="input-email-register"
            v-model="formulaire.emailUtilisateur"
            type="email"
            required
            class="champ-input"
            placeholder="Saisissez votre adresse email"
            aria-required="true"
            :aria-invalid="erreursFormulaire.emailUtilisateur ? 'true' : 'false'"
            autocomplete="email"
            @blur="controlerEmail"
          />
          <p v-if="erreursFormulaire.emailUtilisateur" class="texte-aide avec-erreur" role="alert">
            {{ erreursFormulaire.emailUtilisateur }}
          </p>
        </div>

        <!-- Mot de passe -->
        <div class="groupe-input">
          <label for="input-mdp-register" class="etiquette-input">
            Mot de passe
          </label>
          <div class="conteneur-mdp">
            <input
              id="input-mdp-register"
              v-model="formulaire.passwordUtilisateur"
              :type="revelerMdp ? 'text' : 'password'"
              required
              class="champ-input"
              placeholder="Au moins 6 caractères"
              aria-required="true"
              :aria-invalid="erreursFormulaire.passwordUtilisateur ? 'true' : 'false'"
              aria-describedby="conseil-mdp"
              autocomplete="new-password"
              @input="controlerPassword"
            />
            <button
              type="button"
              class="toggle-mdp"
              :aria-label="revelerMdp ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
              @click="basculerAffichageMdp"
            >
              <svg v-if="!revelerMdp" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 4C5 4 1.73 7.11 1 10c.73 2.89 4 6 9 6s8.27-3.11 9-6c-.73-2.89-4-6-9-6z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="10" cy="10" r="2.5" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3l14 14M10.5 7.5A2.5 2.5 0 0 0 8 10M12.5 12.5A2.5 2.5 0 0 1 10 15M6.5 6.5C4.5 7.5 3 9.5 3 10c.73 2.89 4 6 7 6 1.5 0 2.8-.5 4-1.2M13.5 13.5c1.5-1 2.5-2.5 3-3.5-.7-2.89-4-6-6.5-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <p id="conseil-mdp" class="texte-aide" :class="{ 'avec-erreur': erreursFormulaire.passwordUtilisateur }">
            {{ erreursFormulaire.passwordUtilisateur || 'Minimum 6 caractères requis' }}
          </p>
        </div>

        <!-- Confirmation mot de passe -->
        <div class="groupe-input">
          <label for="input-confirm-mdp" class="etiquette-input">
            Confirmer le mot de passe
          </label>
          <div class="conteneur-mdp">
            <input
              id="input-confirm-mdp"
              v-model="formulaire.confirmPassword"
              :type="revelerConfirm ? 'text' : 'password'"
              required
              class="champ-input"
              placeholder="Confirmez votre mot de passe"
              aria-required="true"
              :aria-invalid="erreursFormulaire.confirmPassword ? 'true' : 'false'"
              autocomplete="new-password"
              @blur="controlerConfirmation"
            />
            <button
              type="button"
              class="toggle-mdp"
              :aria-label="revelerConfirm ? 'Masquer la confirmation' : 'Afficher la confirmation'"
              @click="basculerAffichageConfirm"
            >
              <svg v-if="!revelerConfirm" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 4C5 4 1.73 7.11 1 10c.73 2.89 4 6 9 6s8.27-3.11 9-6c-.73-2.89-4-6-9-6z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="10" cy="10" r="2.5" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3l14 14M10.5 7.5A2.5 2.5 0 0 0 8 10M12.5 12.5A2.5 2.5 0 0 1 10 15M6.5 6.5C4.5 7.5 3 9.5 3 10c.73 2.89 4 6 7 6 1.5 0 2.8-.5 4-1.2M13.5 13.5c1.5-1 2.5-2.5 3-3.5-.7-2.89-4-6-6.5-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <p v-if="erreursFormulaire.confirmPassword" class="texte-aide avec-erreur" role="alert">
            {{ erreursFormulaire.confirmPassword }}
          </p>
        </div>

        <!-- Rôles -->
        <div class="groupe-input">
          <fieldset class="fieldset-roles">
            <legend class="etiquette-input">
              Rôle(s) dans l'équipe
            </legend>
            <div class="grid-choix">
              <label class="choix-role">
                <input 
                  v-model="formulaire.rolesUtilisateur" 
                  type="checkbox" 
                  value="developer"
                  class="checkbox-role"
                  aria-describedby="description-roles"
                />
                <span class="box-choix">
                  <svg class="check-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 8L7 10L11 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span class="texte-choix">
                    <span class="titre-choix">Développeur</span>
                    <span class="desc-choix">Créer et gérer des tâches techniques</span>
                  </span>
                </span>
              </label>

              <label class="choix-role">
                <input 
                  v-model="formulaire.rolesUtilisateur" 
                  type="checkbox" 
                  value="manager"
                  class="checkbox-role"
                />
                <span class="box-choix">
                  <svg class="check-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 8L7 10L11 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span class="texte-choix">
                    <span class="titre-choix">Manager</span>
                    <span class="desc-choix">Superviser les projets et l'équipe</span>
                  </span>
                </span>
              </label>
            </div>
            <p v-if="erreursFormulaire.rolesUtilisateur" id="description-roles" class="texte-aide avec-erreur" role="alert">
              {{ erreursFormulaire.rolesUtilisateur }}
            </p>
          </fieldset>
        </div>

        <!-- Bouton submit -->
        <button 
          type="submit" 
          class="btn-creer-compte"
          :disabled="traitementEnCours"
          :aria-busy="traitementEnCours"
        >
          <span v-if="!traitementEnCours">Créer mon compte</span>
          <span v-else class="contenu-loading">
            <svg class="icone-loading" width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="40 10"/>
            </svg>
            Création en cours...
          </span>
        </button>
      </form>

      <!-- Footer -->
      <footer class="footer-register">
        <p class="texte-footer">
          Vous avez déjà un compte ?
          <router-link 
            to="/connexion" 
            class="lien-connexion"
            aria-label="Se connecter à votre compte"
          >
            Se connecter
          </router-link>
        </p>
      </footer>
    </div>
  </div>
</template>

<script>
import { useUserStore } from '../stores/userStore'

export default {
  name: 'RegisterPage',
  data() {
    return {
      userStore: useUserStore(),
      formulaire: {
        nomComplet: '',
        emailUtilisateur: '',
        passwordUtilisateur: '',
        confirmPassword: '',
        rolesUtilisateur: ['developer']
      },
      notificationErreur: '',
      notificationSucces: '',
      erreursFormulaire: {
        emailUtilisateur: '',
        passwordUtilisateur: '',
        confirmPassword: '',
        rolesUtilisateur: ''
      },
      traitementEnCours: false,
      revelerMdp: false,
      revelerConfirm: false
    }
  },
  methods: {
    basculerAffichageMdp() {
      this.revelerMdp = !this.revelerMdp
    },

    basculerAffichageConfirm() {
      this.revelerConfirm = !this.revelerConfirm
    },

    controlerEmail() {
      const patternEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (this.formulaire.emailUtilisateur && !patternEmail.test(this.formulaire.emailUtilisateur)) {
        this.erreursFormulaire.emailUtilisateur = 'L\'adresse email saisie n\'est pas valide'
      } else {
        this.erreursFormulaire.emailUtilisateur = ''
      }
    },

    controlerPassword() {
      if (this.formulaire.passwordUtilisateur.length < 6 && this.formulaire.passwordUtilisateur.length > 0) {
        this.erreursFormulaire.passwordUtilisateur = 'Le mot de passe doit contenir au moins 6 caractères'
      } else {
        this.erreursFormulaire.passwordUtilisateur = ''
      }

      // Revalidation de la confirmation
      if (this.formulaire.confirmPassword) {
        this.controlerConfirmation()
      }
    },

    controlerConfirmation() {
      if (this.formulaire.confirmPassword !== this.formulaire.passwordUtilisateur) {
        this.erreursFormulaire.confirmPassword = 'Les mots de passe ne correspondent pas'
      } else {
        this.erreursFormulaire.confirmPassword = ''
      }
    },

    validerTout() {
      let estValide = true

      // Contrôle email
      this.controlerEmail()
      if (this.erreursFormulaire.emailUtilisateur) estValide = false

      // Contrôle mot de passe
      if (this.formulaire.passwordUtilisateur.length < 6) {
        this.erreursFormulaire.passwordUtilisateur = 'Le mot de passe doit contenir au moins 6 caractères'
        estValide = false
      }

      // Contrôle confirmation
      this.controlerConfirmation()
      if (this.erreursFormulaire.confirmPassword) estValide = false

      // Contrôle rôles
      if (this.formulaire.rolesUtilisateur.length === 0) {
        this.erreursFormulaire.rolesUtilisateur = 'Veuillez sélectionner au moins un rôle'
        estValide = false
      } else {
        this.erreursFormulaire.rolesUtilisateur = ''
      }

      return estValide
    },

    async creerCompte() {
      this.notificationErreur = ''
      this.notificationSucces = ''

      // Validation complète
      if (!this.validerTout()) {
        this.notificationErreur = 'Veuillez corriger les erreurs dans le formulaire'
        return
      }

      this.traitementEnCours = true

      // Délai simulation
      await new Promise(resolve => setTimeout(resolve, 800))

      const reponseRegister = this.userStore.register(
        this.formulaire.emailUtilisateur,
        this.formulaire.passwordUtilisateur,
        this.formulaire.nomComplet,
        this.formulaire.rolesUtilisateur
      )

      this.traitementEnCours = false

      if (reponseRegister.success) {
        this.notificationSucces = 'Compte créé avec succès ! Connexion en cours...'
        
        // Auto-connexion après création
        setTimeout(() => {
          const reponseLogin = this.userStore.login(
            this.formulaire.emailUtilisateur, 
            this.formulaire.passwordUtilisateur
          )
          
          if (reponseLogin.success) {
            this.$router.push({ name: 'Home' })
          }
        }, 1000)
      } else {
        this.notificationErreur = reponseRegister.message
      }
    }
  },
  mounted() {
    // Vérification authentification existante
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
  padding: 0;
  margin: 0;
}

.page-register {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background-color: #F9F9F9;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  padding: 2rem;
}

.carte-register {
  background-color: white;
  border-radius: 11px;
  box-shadow: 0 2px 14px rgba(0, 0, 0, 0.07);
  padding: 2.75rem 2.25rem;
  width: 100%;
  max-width: 480px;
  animation: entreeHaut 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@keyframes entreeHaut {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-titre {
  text-align: center;
  margin-bottom: 2.25rem;
}

.titre-register {
  font-size: 2rem;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 0.625rem;
  letter-spacing: -0.025em;
}

.description-register {
  font-size: 0.9375rem;
  color: #676767;
  font-weight: 400;
  line-height: 1.6;
}

.banniere-erreur,
.banniere-succes {
  padding: 1rem 1.125rem;
  border-radius: 10px;
  margin-bottom: 1.75rem;
  font-size: 0.875rem;
  animation: descente 0.4s ease-out;
}

.banniere-erreur {
  background-color: #FDECEA;
  color: #D32F2F;
  border: 1px solid #FFCDD2;
}

.banniere-succes {
  background-color: #E7F5E9;
  color: #388E3C;
  border: 1px solid #A5D6A7;
}

@keyframes descente {
  from {
    opacity: 0;
    transform: translateY(-12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-register {
  display: grid;
  gap: 1.5rem;
}

.groupe-input {
  display: grid;
  gap: 0.625rem;
}

.etiquette-input {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1A1A1A;
}

.champ-input {
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

.champ-input::placeholder {
  color: #9E9E9E;
}

.champ-input:hover {
  border-color: #A8A8A8;
}

.champ-input:focus {
  outline: none;
  border-color: #1A1A1A;
  box-shadow: 0 0 0 3.5px rgba(26, 26, 26, 0.08);
}

.champ-input[aria-invalid="true"] {
  border-color: #D32F2F;
}

.conteneur-mdp {
  position: relative;
}

.conteneur-mdp .champ-input {
  padding-right: 3.25rem;
}

.toggle-mdp {
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
  color: #676767;
  border-radius: 6px;
  transition: all 0.25s ease;
}

.toggle-mdp:hover {
  color: #1A1A1A;
  background-color: #F9F9F9;
}

.toggle-mdp:focus-visible {
  outline: 2.5px solid #1A1A1A;
  outline-offset: 2px;
}

.texte-aide {
  font-size: 0.8125rem;
  color: #676767;
}

.texte-aide.avec-erreur {
  color: #D32F2F;
}

.fieldset-roles {
  border: none;
  padding: 0;
  margin: 0;
}

.grid-choix {
  display: grid;
  gap: 0.875rem;
  margin-top: 0.875rem;
}

.choix-role {
  position: relative;
  cursor: pointer;
  display: block;
}

.checkbox-role {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.box-choix {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border: 1.5px solid #D4D4D4;
  border-radius: 9px;
  background-color: white;
  transition: all 0.25s ease;
}

.checkbox-role:focus-visible + .box-choix {
  outline: 3.5px solid rgba(26, 26, 26, 0.2);
  outline-offset: 2px;
}

.checkbox-role:checked + .box-choix {
  border-color: #1A1A1A;
  background-color: #F9F9F9;
}

.choix-role:hover .box-choix {
  border-color: #1A1A1A;
}

.check-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border: 2px solid #D4D4D4;
  border-radius: 6px;
  background-color: white;
  color: white;
  transition: all 0.25s ease;
  margin-top: 2px;
}

.checkbox-role:checked + .box-choix .check-icon {
  background-color: #1A1A1A;
  border-color: #1A1A1A;
}

.texte-choix {
  display: grid;
  gap: 0.375rem;
}

.titre-choix {
  font-weight: 500;
  color: #1A1A1A;
  font-size: 0.9375rem;
}

.desc-choix {
  font-size: 0.8125rem;
  color: #676767;
}

.btn-creer-compte {
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

.btn-creer-compte:hover:not(:disabled) {
  background-color: #000000;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-creer-compte:active:not(:disabled) {
  transform: translateY(0);
}

.btn-creer-compte:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-creer-compte:focus-visible {
  outline: 3.5px solid rgba(26, 26, 26, 0.4);
  outline-offset: 3px;
}

.contenu-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
}

.icone-loading {
  animation: rotation 1.2s linear infinite;
}

@keyframes rotation {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.footer-register {
  text-align: center;
  margin-top: 2.25rem;
}

.texte-footer {
  font-size: 0.875rem;
  color: #676767;
}

.lien-connexion {
  color: #1A1A1A;
  font-weight: 600;
  text-decoration: underline;
  transition: color 0.25s ease;
}

.lien-connexion:hover {
  color: #000000;
}

.lien-connexion:focus-visible {
  outline: 2.5px solid #1A1A1A;
  outline-offset: 3px;
  border-radius: 5px;
}

/* Responsive - Tablette */
@media (max-width: 768px) {
  .page-register {
    padding: 1.75rem 1.25rem;
  }

  .carte-register {
    padding: 2.5rem 2rem;
  }
}

/* Responsive - Mobile */
@media (max-width: 640px) {
  .page-register {
    padding: 1.25rem;
    align-items: flex-start;
    padding-top: 3rem;
  }

  .carte-register {
    padding: 2.25rem 1.75rem;
    max-width: 100%;
  }

  .titre-register {
    font-size: 1.75rem;
  }

  .description-register {
    font-size: 0.875rem;
  }

  .champ-input {
    padding: 1rem 1.125rem;
    font-size: 1rem;
  }

  .conteneur-mdp .champ-input {
    padding-right: 3.5rem;
  }

  .toggle-mdp {
    right: 1rem;
    padding: 0.625rem;
  }

  .btn-creer-compte {
    padding: 1.125rem;
    font-size: 1rem;
  }

  .form-register {
    gap: 1.375rem;
  }

  .footer-register {
    margin-top: 2rem;
  }
}

/* Responsive - Petits mobiles */
@media (max-width: 375px) {
  .carte-register {
    padding: 2rem 1.5rem;
  }

  .titre-register {
    font-size: 1.625rem;
  }

  .section-titre {
    margin-bottom: 2rem;
  }
}

/* Responsive - Mode paysage */
@media (max-height: 600px) and (orientation: landscape) {
  .page-register {
    padding: 1.25rem;
    align-items: flex-start;
  }

  .carte-register {
    padding: 1.75rem;
    margin: 0.75rem 0;
  }

  .section-titre {
    margin-bottom: 1.5rem;
  }

  .titre-register {
    font-size: 1.625rem;
    margin-bottom: 0.5rem;
  }

  .description-register {
    font-size: 0.875rem;
  }

  .form-register {
    gap: 1.25rem;
  }

  .footer-register {
    margin-top: 1.5rem;
  }
}

/* Accessibilité - Contraste élevé */
@media (prefers-contrast: high) {
  .champ-input {
    border-width: 2px;
  }

  .champ-input:focus {
    border-width: 2px;
    box-shadow: 0 0 0 4px rgba(26, 26, 26, 0.25);
  }

  .btn-creer-compte {
    border: 2px solid transparent;
  }

  .btn-creer-compte:focus-visible {
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
  .page-register {
    background-color: #0D0D0D;
  }

  .carte-register {
    background-color: #1F1F1F;
    box-shadow: 0 2px 14px rgba(0, 0, 0, 0.5);
  }

  .titre-register {
    color: #F0F0F0;
  }

  .description-register {
    color: #B0B0B0;
  }

  .etiquette-input {
    color: #F0F0F0;
  }

  .champ-input {
    background-color: #0D0D0D;
    border-color: #444444;
    color: #F0F0F0;
  }

  .champ-input::placeholder {
    color: #707070;
  }

  .champ-input:hover {
    border-color: #707070;
  }

  .champ-input:focus {
    border-color: #F0F0F0;
    box-shadow: 0 0 0 3.5px rgba(240, 240, 240, 0.12);
  }

  .toggle-mdp {
    color: #B0B0B0;
  }

  .toggle-mdp:hover {
    color: #F0F0F0;
    background-color: #2D2D2D;
  }

  .texte-aide {
    color: #B0B0B0;
  }

  .box-choix {
    background-color: #0D0D0D;
    border-color: #444444;
  }

  .checkbox-role:checked + .box-choix {
    border-color: #F0F0F0;
    background-color: #2D2D2D;
  }

  .check-icon {
    border-color: #444444;
    background-color: #0D0D0D;
  }

  .checkbox-role:checked + .box-choix .check-icon {
    background-color: #F0F0F0;
    border-color: #F0F0F0;
  }

  .titre-choix {
    color: #F0F0F0;
  }

  .desc-choix {
    color: #B0B0B0;
  }

  .btn-creer-compte {
    background-color: #F0F0F0;
    color: #1A1A1A;
  }

  .btn-creer-compte:hover:not(:disabled) {
    background-color: #DDDDDD;
  }

  .texte-footer {
    color: #B0B0B0;
  }

  .lien-connexion {
    color: #F0F0F0;
  }

  .lien-connexion:hover {
    color: #DDDDDD;
  }
}
</style>