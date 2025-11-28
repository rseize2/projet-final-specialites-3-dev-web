<template>
  <nav class="barre-navigation" role="navigation" aria-label="Navigation principale">
    <div class="conteneur-nav">
      <!-- Logo / Titre -->
      <div class="section-marque">
        <router-link to="/home" class="lien-marque" aria-label="Retour à l'accueil">
          <svg class="icone-marque" width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="2"/>
            <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="2"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="2"/>
            <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span class="texte-marque">Gestion de Projets</span>
        </router-link>
      </div>

      <!-- Menu mobile toggle -->
      <button 
        class="bouton-menu-mobile"
        :class="{ 'menu-ouvert': menuMobileActif }"
        @click="basculerMenuMobile"
        :aria-expanded="menuMobileActif"
        aria-controls="menu-utilisateur-mobile"
        aria-label="Ouvrir le menu de navigation"
      >
        <span class="ligne-hamburger"></span>
        <span class="ligne-hamburger"></span>
        <span class="ligne-hamburger"></span>
      </button>

      <!-- Section utilisateur (desktop & mobile) -->
      <div 
        class="section-utilisateur" 
        :class="{ 'mobile-visible': menuMobileActif }"
        id="menu-utilisateur-mobile"
      >
        <div class="info-utilisateur">
          <div class="avatar-utilisateur" aria-hidden="true">
            {{ initialesUtilisateur }}
          </div>
          <div class="details-utilisateur">
            <span class="nom-utilisateur">{{ utilisateur.name }}</span>
            <span class="roles-utilisateur">{{ afficherRoles }}</span>
          </div>
        </div>
        
        <button 
          @click="deconnecter" 
          class="bouton-deconnexion"
          aria-label="Se déconnecter"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'NavBar',
  props: {
    utilisateur: {
      type: Object,
      required: true,
      default: () => ({ name: '', roles: [] })
    }
  },
  data() {
    return {
      menuMobileActif: false
    }
  },
  computed: {
    initialesUtilisateur() {
      if (!this.utilisateur.name) return '?'
      const mots = this.utilisateur.name.trim().split(' ')
      if (mots.length === 1) {
        return mots[0].charAt(0).toUpperCase()
      }
      return (mots[0].charAt(0) + mots[mots.length - 1].charAt(0)).toUpperCase()
    },
    afficherRoles() {
      if (!this.utilisateur.roles || this.utilisateur.roles.length === 0) {
        return 'Utilisateur'
      }
      const traductions = {
        'developer': 'Développeur',
        'manager': 'Manager'
      }
      return this.utilisateur.roles
        .map(role => traductions[role] || role)
        .join(' • ')
    }
  },
  methods: {
    basculerMenuMobile() {
      this.menuMobileActif = !this.menuMobileActif
    },
    deconnecter() {
      this.$emit('deconnexion')
      this.menuMobileActif = false
    }
  },
  watch: {
    $route() {
      // Fermer le menu mobile lors du changement de route
      this.menuMobileActif = false
    }
  }
}
</script>

<style scoped>
.barre-navigation {
  background-color: #1A1A1A;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.conteneur-nav {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 70px;
}

/* Section marque */
.section-marque {
  flex-shrink: 0;
}

.lien-marque {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: white;
  transition: opacity 0.25s ease;
}

.lien-marque:hover {
  opacity: 0.85;
}

.lien-marque:focus-visible {
  outline: 2.5px solid white;
  outline-offset: 4px;
  border-radius: 6px;
}

.icone-marque {
  color: white;
  flex-shrink: 0;
}

.texte-marque {
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  white-space: nowrap;
}

/* Bouton menu mobile */
.bouton-menu-mobile {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  width: 44px;
  height: 44px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.25s ease;
}

.bouton-menu-mobile:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.bouton-menu-mobile:focus-visible {
  outline: 2.5px solid white;
  outline-offset: 2px;
}

.ligne-hamburger {
  width: 24px;
  height: 2px;
  background-color: white;
  border-radius: 2px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.bouton-menu-mobile.menu-ouvert .ligne-hamburger:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.bouton-menu-mobile.menu-ouvert .ligne-hamburger:nth-child(2) {
  opacity: 0;
}

.bouton-menu-mobile.menu-ouvert .ligne-hamburger:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* Section utilisateur */
.section-utilisateur {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.info-utilisateur {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.avatar-utilisateur {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2D2D2D 0%, #1A1A1A 100%);
  border: 2px solid rgba(255, 255, 255, 0.15);
  display: grid;
  place-items: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
  letter-spacing: 0.5px;
}

.details-utilisateur {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nom-utilisateur {
  font-size: 0.9375rem;
  font-weight: 500;
  color: white;
  line-height: 1.2;
}

.roles-utilisateur {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.2;
}

.bouton-deconnexion {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: inherit;
  transition: all 0.25s ease;
  white-space: nowrap;
}

.bouton-deconnexion:hover {
  background-color: rgba(220, 53, 69, 0.15);
  border-color: rgba(220, 53, 69, 0.3);
  color: #ff6b7a;
}

.bouton-deconnexion:active {
  transform: scale(0.98);
}

.bouton-deconnexion:focus-visible {
  outline: 2.5px solid white;
  outline-offset: 2px;
}

.bouton-deconnexion svg {
  flex-shrink: 0;
}

/* Responsive - Tablette */
@media (max-width: 768px) {
  .conteneur-nav {
    padding: 0 1.25rem;
    min-height: 64px;
  }

  .texte-marque {
    font-size: 1rem;
  }

  .icone-marque {
    width: 24px;
    height: 24px;
  }

  .avatar-utilisateur {
    width: 38px;
    height: 38px;
    font-size: 0.8125rem;
  }

  .section-utilisateur {
    gap: 1.25rem;
  }
}

/* Responsive - Mobile */
@media (max-width: 640px) {
  .conteneur-nav {
    padding: 0 1rem;
    flex-wrap: wrap;
    min-height: 60px;
  }

  .bouton-menu-mobile {
    display: flex;
  }

  .section-utilisateur {
    display: none;
    width: 100%;
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    padding: 1.25rem 0;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    margin-top: 1rem;
    animation: slideDown 0.3s ease-out;
  }

  .section-utilisateur.mobile-visible {
    display: flex;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .info-utilisateur {
    padding: 0.75rem;
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
  }

  .bouton-deconnexion {
    justify-content: center;
    padding: 0.875rem;
    width: 100%;
  }

  .texte-marque {
    font-size: 0.9375rem;
  }
}

/* Responsive - Petits mobiles */
@media (max-width: 375px) {
  .texte-marque {
    font-size: 0.875rem;
  }

  .icone-marque {
    width: 22px;
    height: 22px;
  }

  .conteneur-nav {
    min-height: 56px;
  }
}

/* Mode contraste élevé */
@media (prefers-contrast: high) {
  .barre-navigation {
    border-bottom-width: 2px;
  }

  .avatar-utilisateur {
    border-width: 3px;
  }

  .bouton-deconnexion {
    border-width: 2px;
  }

  .bouton-deconnexion:focus-visible,
  .lien-marque:focus-visible {
    outline-width: 3px;
  }
}

/* Réduction des animations */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Mode sombre (déjà sombre par défaut, mais on peut ajuster) */
@media (prefers-color-scheme: dark) {
  .barre-navigation {
    background-color: #0D0D0D;
  }

  .avatar-utilisateur {
    background: linear-gradient(135deg, #2D2D2D 0%, #0D0D0D 100%);
  }
}
</style>