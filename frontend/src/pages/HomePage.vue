<template>
  <div class="page-accueil">
    <!-- Navbar Component -->
    <NavBar :utilisateur="utilisateurActuel" @deconnexion="seDeconnecter" />

    <main class="conteneur-principal">
      <!-- En-tête de la page -->
      <header class="entete-page">
        <div class="section-titre-page">
          <h1 class="titre-page">Mes Projets</h1>
          <p class="sous-titre-page">Gérez et suivez vos projets en temps réel</p>
        </div>

        <!-- Sélecteur de rôle pour utilisateurs dual-role -->
        <div v-if="aDoubleRole" class="selecteur-mode" role="tablist" aria-label="Sélection du mode de vue">
          <button
            @click="modeVue = 'developer'"
            :class="{ actif: modeVue === 'developer' }"
            class="bouton-mode"
            role="tab"
            :aria-selected="modeVue === 'developer'"
            :aria-controls="modeVue === 'developer' ? 'panneau-developer' : ''"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M16 18L22 12L16 6M8 6L2 12L8 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Développeur</span>
          </button>
          <button
            @click="modeVue = 'manager'"
            :class="{ actif: modeVue === 'manager' }"
            class="bouton-mode"
            role="tab"
            :aria-selected="modeVue === 'manager'"
            :aria-controls="modeVue === 'manager' ? 'panneau-manager' : ''"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Manager</span>
          </button>
        </div>
      </header>

      <!-- Vue Développeur -->
      <section 
        v-if="modeVue === 'developer'" 
        id="panneau-developer"
        role="tabpanel"
        aria-labelledby="mode-developer"
        class="vue-developer"
      >
        <div v-if="projetsDeveloper.length === 0" class="etat-vide">
          <svg class="icone-vide" width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
            <path d="M9 9L15 15M15 9L9 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <h2>Aucun projet assigné</h2>
          <p>Vous n'avez pas encore de tâches affectées dans un projet.</p>
        </div>

        <div v-else class="grille-projets">
          <article
            v-for="projet in projetsDeveloper"
            :key="projet.id"
            class="carte-projet"
            @click="naviguerVersProjetDev(projet.id)"
            @keydown.enter="naviguerVersProjetDev(projet.id)"
            @keydown.space.prevent="naviguerVersProjetDev(projet.id)"
            tabindex="0"
            role="button"
            :aria-label="`Ouvrir le projet ${projet.name}`"
          >
            <div class="entete-carte">
              <div class="badge-dev">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M16 18L22 12L16 6M8 6L2 12L8 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Dev</span>
              </div>
            </div>
            <h3 class="titre-carte">{{ projet.name }}</h3>
            <p class="description-carte">{{ projet.description || 'Aucune description disponible' }}</p>
            <div class="stats-carte">
              <div class="stat-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ obtenirNombreTaches(projet.id) }} tâche{{ obtenirNombreTaches(projet.id) > 1 ? 's' : '' }}</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- Vue Manager -->
      <section 
        v-if="modeVue === 'manager'" 
        id="panneau-manager"
        role="tabpanel"
        aria-labelledby="mode-manager"
        class="vue-manager"
      >
        <!-- Section création de projet -->
        <div class="section-creation">
          <button 
            v-if="!afficherFormulaireCreation"
            @click="afficherFormulaireCreation = true"
            class="bouton-nouveau-projet"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Nouveau projet</span>
          </button>

          <div v-else class="formulaire-creation">
            <div class="entete-formulaire">
              <h2>Créer un nouveau projet</h2>
              <button 
                @click="annulerCreation"
                class="bouton-fermer"
                aria-label="Fermer le formulaire"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
            <form @submit.prevent="creerNouveauProjet" class="formulaire">
              <div class="groupe-champ">
                <label for="nom-projet" class="label-champ">
                  Nom du projet
                </label>
                <input
                  id="nom-projet"
                  v-model="nouveauProjet.nom"
                  type="text"
                  required
                  class="input-champ"
                  placeholder="Ex: Application mobile"
                  aria-required="true"
                />
              </div>
              <div class="groupe-champ">
                <label for="description-projet" class="label-champ">
                  Description
                </label>
                <textarea
                  id="description-projet"
                  v-model="nouveauProjet.description"
                  rows="3"
                  class="input-champ textarea-champ"
                  placeholder="Décrivez brièvement le projet..."
                ></textarea>
              </div>
              <div class="actions-formulaire">
                <button type="button" @click="annulerCreation" class="bouton-secondaire">
                  Annuler
                </button>
                <button type="submit" class="bouton-primaire">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>Créer le projet</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Liste des projets -->
        <div v-if="tousProjets.length === 0" class="etat-vide">
          <svg class="icone-vide" width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <h2>Aucun projet créé</h2>
          <p>Commencez par créer votre premier projet.</p>
        </div>

        <div v-else class="grille-projets">
          <article
            v-for="projet in tousProjets"
            :key="projet.id"
            class="carte-projet"
            :class="{ 'projet-gere': estGereParUtilisateur(projet) }"
          >
            <div class="entete-carte">
              <div class="badges-carte">
                <div v-if="estGereParUtilisateur(projet)" class="badge-gestionnaire">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M9 11l3 3L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>Gestionnaire</span>
                </div>
              </div>
              <button
                v-if="!estGereParUtilisateur(projet)"
                @click.stop="prendreRoleGestionnaire(projet.id)"
                class="bouton-action-mini"
                title="Se désigner comme gestionnaire"
                aria-label="Devenir gestionnaire du projet"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <button
                v-else
                @click.stop="retirerRoleGestionnaire(projet.id)"
                class="bouton-action-mini actif"
                title="Retirer le rôle de gestionnaire"
                aria-label="Retirer le rôle de gestionnaire"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>

            <h3 class="titre-carte">{{ projet.name }}</h3>
            <p class="description-carte">{{ projet.description || 'Aucune description disponible' }}</p>

            <div class="info-gestionnaires">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{{ obtenirNomsGestionnaires(projet) }}</span>
            </div>

            <div class="actions-carte">
              <button
                @click.stop="naviguerVersProjetManager(projet.id)"
                class="bouton-action-carte primaire"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Gérer</span>
              </button>
              <button
                v-if="estGereParUtilisateur(projet)"
                @click.stop="supprimerProjet(projet.id)"
                class="bouton-action-carte danger"
                aria-label="Supprimer le projet"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Supprimer</span>
              </button>
            </div>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import NavBar from '../components/NavBar.vue'
import { useUserStore } from '../stores/userStore'
import { useProjectStore } from '../stores/projectStore'
import { useTaskStore } from '../stores/taskStore'

export default {
  name: 'HomePage',
  components: {
    NavBar
  },
  data() {
    return {
      userStore: useUserStore(),
      projectStore: useProjectStore(),
      taskStore: useTaskStore(),
      modeVue: 'developer',
      nouveauProjet: {
        nom: '',
        description: ''
      },
      afficherFormulaireCreation: false
    }
  },
  computed: {
    utilisateurActuel() {
      return this.userStore.getCurrentUser() || {}
    },
    aDoubleRole() {
      return this.utilisateurActuel.roles && this.utilisateurActuel.roles.length > 1
    },
    projetsDeveloper() {
      const idsProjet = this.taskStore.getProjectsWithAssignedTasks(this.utilisateurActuel.id)
      return this.projectStore.projects.filter(p => idsProjet.includes(p.id))
    },
    tousProjets() {
      return this.projectStore.projects
    }
  },
  methods: {
    seDeconnecter() {
      this.userStore.logout()
      this.$router.push('/')
    },
    naviguerVersProjetDev(idProjet) {
      this.$router.push({ name: 'DeveloperProject', params: { projectId: idProjet } })
    },
    naviguerVersProjetManager(idProjet) {
      this.$router.push({ name: 'ManagerProject', params: { projectId: idProjet } })
    },
    creerNouveauProjet() {
      if (this.nouveauProjet.nom.trim()) {
        this.projectStore.createProject(
          this.nouveauProjet.nom,
          this.nouveauProjet.description,
          this.utilisateurActuel.id
        )
        this.nouveauProjet = { nom: '', description: '' }
        this.afficherFormulaireCreation = false
      }
    },
    annulerCreation() {
      this.nouveauProjet = { nom: '', description: '' }
      this.afficherFormulaireCreation = false
    },
    prendreRoleGestionnaire(idProjet) {
      this.projectStore.addManagerToProject(idProjet, this.utilisateurActuel.id)
    },
    retirerRoleGestionnaire(idProjet) {
      this.projectStore.removeManagerFromProject(idProjet, this.utilisateurActuel.id)
    },
    supprimerProjet(idProjet) {
      if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.')) {
        this.projectStore.deleteProject(idProjet)
        const taches = this.taskStore.getTasksByProject(idProjet)
        taches.forEach(tache => this.taskStore.deleteTask(tache.id))
      }
    },
    estGereParUtilisateur(projet) {
      return projet.managers.includes(this.utilisateurActuel.id)
    },
    obtenirNomsGestionnaires(projet) {
      return projet.managers
        .map(id => {
          const utilisateur = this.userStore.getUserById(id)
          return utilisateur ? utilisateur.name : 'Inconnu'
        })
        .join(', ')
    },
    obtenirNombreTaches(idProjet) {
      return this.taskStore
        .getTasksByProject(idProjet)
        .filter(t => t.assignedTo.includes(this.utilisateurActuel.id)).length
    }
  },
  mounted() {
    if (!this.userStore.isAuthenticated()) {
      this.$router.push('/')
    } else {
      this.projectStore.loadProjects()
      this.taskStore.loadTasks()

      // Définir le mode par défaut
      if (this.utilisateurActuel.roles.includes('manager') && !this.utilisateurActuel.roles.includes('developer')) {
        this.modeVue = 'manager'
      }
    }
  }
}
</script>

<style scoped>
.page-accueil {
  min-height: 100vh;
  background-color: #F9F9F9;
}

.conteneur-principal {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem;
}

/* En-tête de la page */
.entete-page {
  margin-bottom: 2.5rem;
}

.section-titre-page {
  margin-bottom: 2rem;
}

.titre-page {
  font-size: 2.25rem;
  font-weight: 600;
  color: #1A1A1A;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.03em;
}

.sous-titre-page {
  font-size: 1rem;
  color: #676767;
  margin: 0;
}

/* Sélecteur de mode */
.selecteur-mode {
  display: inline-flex;
  gap: 0.75rem;
  padding: 0.375rem;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.bouton-mode {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.125rem;
  background-color: transparent;
  color: #676767;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: inherit;
  transition: all 0.25s ease;
}

.bouton-mode:hover {
  background-color: #F9F9F9;
  color: #1A1A1A;
}

.bouton-mode.actif {
  background-color: #1A1A1A;
  color: white;
}

.bouton-mode:focus-visible {
  outline: 2.5px solid #1A1A1A;
  outline-offset: 2px;
}

/* État vide */
.etat-vide {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.icone-vide {
  color: #D4D4D4;
  margin-bottom: 1.5rem;
}

.etat-vide h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1A1A1A;
  margin: 0 0 0.5rem 0;
}

.etat-vide p {
  font-size: 0.9375rem;
  color: #676767;
  margin: 0;
}

/* Section création */
.section-creation {
  margin-bottom: 2.5rem;
}

.bouton-nouveau-projet {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.25rem;
  background-color: #1A1A1A;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.9375rem;
  font-weight: 600;
  font-family: inherit;
  transition: all 0.25s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.bouton-nouveau-projet:hover {
  background-color: #000000;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.bouton-nouveau-projet:active {
  transform: translateY(0);
}

.bouton-nouveau-projet:focus-visible {
  outline: 3px solid rgba(26, 26, 26, 0.4);
  outline-offset: 3px;
}

/* Formulaire création */
.formulaire-creation {
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  animation: slideDown 0.3s ease-out;
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

.entete-formulaire {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.entete-formulaire h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1A1A1A;
  margin: 0;
}

.bouton-fermer {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: #676767;
  transition: all 0.25s ease;
}

.bouton-fermer:hover {
  background-color: #F9F9F9;
  color: #1A1A1A;
}

.bouton-fermer:focus-visible {
  outline: 2.5px solid #1A1A1A;
  outline-offset: 2px;
}

.formulaire {
  display: grid;
  gap: 1.25rem;
}

.groupe-champ {
  display: grid;
  gap: 0.5rem;
}

.label-champ {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1A1A1A;
}

.input-champ {
  width: 100%;
  padding: 0.75rem 0.875rem;
  border: 1.5px solid #D4D4D4;
  border-radius: 8px;
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
  box-shadow: 0 0 0 3px rgba(26, 26, 26, 0.08);
}

.textarea-champ {
  resize: vertical;
  min-height: 80px;
}

.actions-formulaire {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.bouton-primaire,
.bouton-secondaire {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  transition: all 0.25s ease;
  flex: 1;
}

.bouton-primaire {
  background-color: #1A1A1A;
  color: white;
}

.bouton-primaire:hover {
  background-color: #000000;
  transform: translateY(-1px);
}

.bouton-primaire:focus-visible {
  outline: 3px solid rgba(26, 26, 26, 0.4);
  outline-offset: 2px;
}

.bouton-secondaire {
  background-color: #F9F9F9;
  color: #676767;
  border: 1.5px solid #D4D4D4;
}

.bouton-secondaire:hover {
  background-color: #F0F0F0;
  border-color: #A8A8A8;
  color: #1A1A1A;
}

.bouton-secondaire:focus-visible {
  outline: 2.5px solid #1A1A1A;
  outline-offset: 2px;
}

/* Grille de projets */
.grille-projets {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

/* Carte projet */
.carte-projet {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.carte-projet:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  border-color: #1A1A1A;
  transform: translateY(-2px);
}

.carte-projet:focus-visible {
  outline: 3px solid rgba(26, 26, 26, 0.4);
  outline-offset: 2px;
}

.carte-projet.projet-gere::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, #28a745 0%, #20c997 100%);
}

.entete-carte {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.badges-carte {
  display: flex;
  gap: 0.5rem;
}

.badge-dev,
.badge-gestionnaire {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.625rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-dev {
  background-color: #E7F5FF;
  color: #0969DA;
}

.badge-gestionnaire {
  background-color: #D1FAE5;
  color: #059669;
}

.bouton-action-mini {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  background-color: #F9F9F9;
  color: #676767;
  border: 1.5px solid #D4D4D4;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s ease;
  flex-shrink: 0;
}

.bouton-action-mini:hover {
  background-color: #1A1A1A;
  color: white;
  border-color: #1A1A1A;
}

.bouton-action-mini.actif {
  background-color: #D1FAE5;
  color: #059669;
  border-color: #A5D6A7;
}

.bouton-action-mini.actif:hover {
  background-color: #FFEBEE;
  color: #D32F2F;
  border-color: #FFCDD2;
}

.bouton-action-mini:focus-visible {
  outline: 2.5px solid #1A1A1A;
  outline-offset: 2px;
}

.titre-carte {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1A1A1A;
  margin: 0 0 0.75rem 0;
  line-height: 1.3;
}

.description-carte {
  font-size: 0.875rem;
  color: #676767;
  line-height: 1.5;
  margin: 0 0 1rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.stats-carte {
  display: flex;
  gap: 1rem;
  padding: 0.75rem 0;
  border-top: 1px solid #F0F0F0;
  margin-bottom: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: #676767;
}

.info-gestionnaires {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: #676767;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
}

.actions-carte {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.bouton-action-carte {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: inherit;
  transition: all 0.25s ease;
  flex: 1;
}

.bouton-action-carte.primaire {
  background-color: #1A1A1A;
  color: white;
}

.bouton-action-carte.primaire:hover {
  background-color: #000000;
}

.bouton-action-carte.danger {
  background-color: #FFEBEE;
  color: #D32F2F;
  border: 1.5px solid #FFCDD2;
}

.bouton-action-carte.danger:hover {
  background-color: #D32F2F;
  color: white;
  border-color: #D32F2F;
}

.bouton-action-carte:focus-visible {
  outline: 2.5px solid #1A1A1A;
  outline-offset: 2px;
}

/* Responsive - Tablette */
@media (max-width: 1024px) {
  .grille-projets {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.25rem;
  }
}

/* Responsive - Mobile */
@media (max-width: 640px) {
  .conteneur-principal {
    padding: 1.5rem 1rem;
  }

  .titre-page {
    font-size: 1.75rem;
  }

  .sous-titre-page {
    font-size: 0.875rem;
  }

  .selecteur-mode {
    width: 100%;
  }

  .bouton-mode {
    flex: 1;
    justify-content: center;
  }

  .grille-projets {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .actions-formulaire {
    flex-direction: column-reverse;
  }

  .bouton-primaire,
  .bouton-secondaire {
    width: 100%;
  }

  .actions-carte {
    flex-direction: column;
  }

  .bouton-action-carte {
    width: 100%;
  }
}

/* Responsive - Petits mobiles */
@media (max-width: 375px) {
  .conteneur-principal {
    padding: 1.25rem 0.75rem;
  }

  .carte-projet {
    padding: 1.25rem;
  }

  .formulaire-creation {
    padding: 1.5rem;
  }
}

/* Accessibilité - Contraste élevé */
@media (prefers-contrast: high) {
  .carte-projet {
    border-width: 2px;
  }

  .input-champ {
    border-width: 2px;
  }

  .input-champ:focus {
    box-shadow: 0 0 0 4px rgba(26, 26, 26, 0.2);
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
  .page-accueil {
    background-color: #0D0D0D;
  }

  .titre-page {
    color: #F0F0F0;
  }

  .sous-titre-page {
    color: #B0B0B0;
  }

  .selecteur-mode {
    background-color: #1F1F1F;
  }

  .bouton-mode {
    color: #B0B0B0;
  }

  .bouton-mode:hover {
    background-color: #2D2D2D;
    color: #F0F0F0;
  }

  .bouton-mode.actif {
    background-color: #F0F0F0;
    color: #1A1A1A;
  }

  .carte-projet,
  .formulaire-creation,
  .etat-vide {
    background-color: #1F1F1F;
  }

  .titre-carte,
  .entete-formulaire h2,
  .etat-vide h2,
  .label-champ {
    color: #F0F0F0;
  }

  .description-carte,
  .etat-vide p,
  .info-gestionnaires,
  .stat-item {
    color: #B0B0B0;
  }

  .input-champ {
    background-color: #0D0D0D;
    border-color: #444444;
    color: #F0F0F0;
  }

  .input-champ:hover {
    border-color: #707070;
  }

  .input-champ:focus {
    border-color: #F0F0F0;
  }

  .bouton-secondaire {
    background-color: #2D2D2D;
    border-color: #444444;
    color: #B0B0B0;
  }

  .bouton-secondaire:hover {
    background-color: #3A3A3A;
    color: #F0F0F0;
  }

  .bouton-action-mini {
    background-color: #2D2D2D;
    border-color: #444444;
    color: #B0B0B0;
  }

  .bouton-action-mini:hover {
    background-color: #F0F0F0;
    color: #1A1A1A;
  }

  .bouton-action-carte.danger {
    background-color: #4A1F1F;
    border-color: #7A2F2F;
    color: #FFCDD2;
  }

  .bouton-action-carte.danger:hover {
    background-color: #D32F2F;
    color: white;
  }
}
</style>