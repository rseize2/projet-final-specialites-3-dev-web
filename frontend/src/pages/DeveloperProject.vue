<template>
  <div class="page-projet-dev">
    <!-- Navbar -->
    <NavBar :utilisateur="utilisateurActuel" @deconnexion="seDeconnecter" />

    <main class="conteneur-projet">
      <!-- En-tête du projet -->
      <header class="entete-projet">
        <button 
          @click="retourAccueil" 
          class="bouton-retour"
          aria-label="Retour à l'accueil"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Retour</span>
        </button>

        <div class="info-projet">
          <div class="badge-role">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M16 18L22 12L16 6M8 6L2 12L8 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Mode Développeur</span>
          </div>
          <h1 class="titre-projet">{{ projet.name }}</h1>
          <p class="description-projet">{{ projet.description || 'Aucune description disponible' }}</p>
        </div>
      </header>

      <!-- Section création de tâche -->
      <section class="section-creation-tache">
        <button 
          v-if="!afficherFormulaireCreation"
          @click="afficherFormulaireCreation = true"
          class="bouton-nouvelle-tache"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Nouvelle tâche</span>
        </button>

        <div v-else class="carte-formulaire">
          <div class="entete-formulaire">
            <h2>Créer une nouvelle tâche</h2>
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

          <form @submit.prevent="creerNouvelleTache" class="formulaire-tache">
            <div class="groupe-champ">
              <label for="titre-tache" class="label-champ">
                Titre de la tâche
              </label>
              <input
                id="titre-tache"
                v-model="nouvelleTache.titre"
                type="text"
                required
                class="input-champ"
                placeholder="Ex: Implémenter la fonctionnalité X"
                aria-required="true"
              />
            </div>

            <div class="groupe-champ">
              <label for="description-tache" class="label-champ">
                Description
              </label>
              <textarea
                id="description-tache"
                v-model="nouvelleTache.description"
                rows="4"
                class="input-champ textarea-champ"
                placeholder="Décrivez la tâche en détail..."
              ></textarea>
            </div>

            <div class="groupe-champ">
              <label for="deadline-tache" class="label-champ">
                Date limite (optionnel)
              </label>
              <div class="input-avec-icone">
                <svg class="icone-input" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                  <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <input
                  id="deadline-tache"
                  v-model="nouvelleTache.deadline"
                  type="date"
                  class="input-champ avec-icone"
                />
              </div>
            </div>

            <div class="actions-formulaire">
              <button type="button" @click="annulerCreation" class="bouton-secondaire">
                Annuler
              </button>
              <button type="submit" class="bouton-primaire">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Créer la tâche</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      <!-- Mes tâches assignées -->
      <section class="section-taches" aria-labelledby="titre-mes-taches">
        <div class="entete-section">
          <h2 id="titre-mes-taches" class="titre-section">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
            </svg>
            Mes tâches assignées
          </h2>
          <span class="badge-compteur-section">{{ tachesAssignees.length }}</span>
        </div>

        <div v-if="tachesAssignees.length === 0" class="etat-vide">
          <svg class="icone-vide" width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M9 11l3 3L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <h3>Aucune tâche assignée</h3>
          <p>Vous n'avez pas encore de tâches assignées dans ce projet.</p>
        </div>

        <div v-else class="liste-taches">
          <TaskCard
            v-for="tache in tachesAssignees"
            :key="tache.id"
            :task="tache"
            :is-manager="false"
            @update="rafraichirTaches"
          />
        </div>
      </section>

      <!-- Autres tâches du projet -->
      <section class="section-taches" aria-labelledby="titre-autres-taches">
        <div class="entete-section">
          <h2 id="titre-autres-taches" class="titre-section">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Autres tâches du projet
          </h2>
          <span class="badge-compteur-section">{{ autresTaches.length }}</span>
        </div>

        <div v-if="autresTaches.length === 0" class="etat-vide">
          <svg class="icone-vide" width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
            <path d="M9 9h6M9 15h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <h3>Aucune autre tâche</h3>
          <p>Il n'y a pas d'autres tâches dans ce projet pour le moment.</p>
        </div>

        <div v-else class="liste-taches">
          <TaskCard
            v-for="tache in autresTaches"
            :key="tache.id"
            :task="tache"
            :is-manager="false"
            @update="rafraichirTaches"
          />
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import NavBar from '../components/NavBar.vue'
import TaskCard from '../components/TaskCard.vue'
import { useUserStore } from '../stores/userStore'
import { useProjectStore } from '../stores/projectStore'
import { useTaskStore } from '../stores/taskStore'

export default {
  name: 'DeveloperProject',
  components: {
    NavBar,
    TaskCard
  },
  data() {
    return {
      userStore: useUserStore(),
      projectStore: useProjectStore(),
      taskStore: useTaskStore(),
      projet: {},
      taches: [],
      nouvelleTache: {
        titre: '',
        description: '',
        deadline: null
      },
      afficherFormulaireCreation: false
    }
  },
  computed: {
    utilisateurActuel() {
      return this.userStore.getCurrentUser()
    },
    tachesAssignees() {
      return this.taches.filter(t => t.assignedTo.includes(this.utilisateurActuel.id))
    },
    autresTaches() {
      return this.taches.filter(t => !t.assignedTo.includes(this.utilisateurActuel.id))
    }
  },
  methods: {
    seDeconnecter() {
      this.userStore.logout()
      this.$router.push('/')
    },
    retourAccueil() {
      this.$router.push({ name: 'Home' })
    },
    chargerProjet() {
      const idProjet = this.$route.params.projectId
      this.projet = this.projectStore.getProjectById(idProjet) || {}
      this.rafraichirTaches()
    },
    rafraichirTaches() {
      const idProjet = this.$route.params.projectId
      this.taches = this.taskStore.getTasksByProject(idProjet)
    },
    creerNouvelleTache() {
      if (this.nouvelleTache.titre.trim()) {
        const idProjet = this.$route.params.projectId
        this.taskStore.createTask(
          idProjet,
          this.nouvelleTache.titre,
          this.nouvelleTache.description,
          this.utilisateurActuel.id,
          this.nouvelleTache.deadline || null
        )
        this.nouvelleTache = { titre: '', description: '', deadline: null }
        this.afficherFormulaireCreation = false
        this.rafraichirTaches()
      }
    },
    annulerCreation() {
      this.nouvelleTache = { titre: '', description: '', deadline: null }
      this.afficherFormulaireCreation = false
    }
  },
  mounted() {
    this.chargerProjet()
  }
}
</script>

<style scoped>
.page-projet-dev {
  min-height: 100vh;
  background-color: #F9F9F9;
}

.conteneur-projet {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem;
}

/* En-tête du projet */
.entete-projet {
  margin-bottom: 2.5rem;
}

.bouton-retour {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background-color: white;
  color: #676767;
  border: 1.5px solid #E0E0E0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: inherit;
  transition: all 0.25s ease;
  margin-bottom: 1.5rem;
}

.bouton-retour:hover {
  background-color: #F9F9F9;
  border-color: #D0D0D0;
  color: #1A1A1A;
}

.bouton-retour:focus-visible {
  outline: 2.5px solid #1A1A1A;
  outline-offset: 2px;
}

.info-projet {
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.badge-role {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #E7F5FF;
  color: #0969DA;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
}

.titre-projet {
  font-size: 2rem;
  font-weight: 600;
  color: #1A1A1A;
  margin: 0 0 0.75rem 0;
  letter-spacing: -0.03em;
}

.description-projet {
  font-size: 1rem;
  color: #676767;
  line-height: 1.6;
  margin: 0;
}

/* Section création de tâche */
.section-creation-tache {
  margin-bottom: 2.5rem;
}

.bouton-nouvelle-tache {
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

.bouton-nouvelle-tache:hover {
  background-color: #000000;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.bouton-nouvelle-tache:active {
  transform: translateY(0);
}

.bouton-nouvelle-tache:focus-visible {
  outline: 3px solid rgba(26, 26, 26, 0.4);
  outline-offset: 3px;
}

/* Carte formulaire */
.carte-formulaire {
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

/* Formulaire */
.formulaire-tache {
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
  min-height: 100px;
}

.input-avec-icone {
  position: relative;
}

.icone-input {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: #676767;
  pointer-events: none;
}

.input-champ.avec-icone {
  padding-left: 2.75rem;
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

/* Section tâches */
.section-taches {
  margin-bottom: 2.5rem;
}

.entete-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.titre-section {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-size: 1.375rem;
  font-weight: 600;
  color: #1A1A1A;
  margin: 0;
}

.titre-section svg {
  color: #676767;
}

.badge-compteur-section {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 0.625rem;
  background-color: #1A1A1A;
  color: white;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 600;
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

.etat-vide h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1A1A1A;
  margin: 0 0 0.5rem 0;
}

.etat-vide p {
  font-size: 0.9375rem;
  color: #676767;
  margin: 0;
}

/* Liste des tâches */
.liste-taches {
  display: grid;
  gap: 1.25rem;
}

/* Responsive - Tablette */
@media (max-width: 768px) {
  .conteneur-projet {
    padding: 2rem 1.25rem;
  }

  .titre-projet {
    font-size: 1.75rem;
  }

  .titre-section {
    font-size: 1.25rem;
  }
}

/* Responsive - Mobile */
@media (max-width: 640px) {
  .conteneur-projet {
    padding: 1.5rem 1rem;
  }

  .info-projet {
    padding: 1.5rem;
  }

  .titre-projet {
    font-size: 1.5rem;
  }

  .description-projet {
    font-size: 0.9375rem;
  }

  .carte-formulaire {
    padding: 1.5rem;
  }

  .actions-formulaire {
    flex-direction: column-reverse;
  }

  .bouton-primaire,
  .bouton-secondaire {
    width: 100%;
  }

  .entete-section {
    flex-wrap: wrap;
  }

  .titre-section {
    font-size: 1.125rem;
  }

  .liste-taches {
    gap: 1rem;
  }
}

/* Responsive - Petits mobiles */
@media (max-width: 375px) {
  .conteneur-projet {
    padding: 1.25rem 0.75rem;
  }

  .info-projet {
    padding: 1.25rem;
  }

  .carte-formulaire {
    padding: 1.25rem;
  }
}

/* Accessibilité - Contraste élevé */
@media (prefers-contrast: high) {
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
  .page-projet-dev {
    background-color: #0D0D0D;
  }

  .info-projet,
  .carte-formulaire,
  .etat-vide {
    background-color: #1F1F1F;
  }

  .titre-projet,
  .titre-section,
  .entete-formulaire h2,
  .etat-vide h3,
  .label-champ {
    color: #F0F0F0;
  }

  .description-projet,
  .etat-vide p {
    color: #B0B0B0;
  }

  .bouton-retour {
    background-color: #2D2D2D;
    border-color: #444444;
    color: #B0B0B0;
  }

  .bouton-retour:hover {
    background-color: #3A3A3A;
    color: #F0F0F0;
  }

  .bouton-fermer {
    color: #B0B0B0;
  }

  .bouton-fermer:hover {
    background-color: #2D2D2D;
    color: #F0F0F0;
  }

  .input-champ {
    background-color: #2D2D2D;
    border-color: #444444;
    color: #F0F0F0;
  }

  .input-champ::placeholder {
    color: #707070;
  }

  .input-champ:hover {
    border-color: #555555;
  }

  .input-champ:focus {
    border-color: #F0F0F0;
  }

  .icone-input {
    color: #B0B0B0;
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

  .badge-compteur-section {
    background-color: #F0F0F0;
    color: #1A1A1A;
  }

  .titre-section svg {
    color: #B0B0B0;
  }
}
</style>