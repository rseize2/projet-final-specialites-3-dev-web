<template>
  <div class="page-projet-manager">
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
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Mode Manager</span>
          </div>
          <h1 class="titre-projet">{{ projet.name }}</h1>
          <p class="description-projet">{{ projet.description || 'Aucune description disponible' }}</p>
        </div>
      </header>

      <!-- Tableau de bord -->
      <section class="section-dashboard" aria-labelledby="titre-dashboard">
        <h2 id="titre-dashboard" class="titre-section">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
            <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
            <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
            <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
          </svg>
          Tableau de bord
        </h2>

        <div class="grille-statistiques">
          <!-- Carte Progression -->
          <div class="carte-stat progression">
            <div class="entete-stat">
              <h3>Progression globale</h3>
              <span class="valeur-principale">{{ statistiques.progress }}%</span>
            </div>
            <div class="barre-progression">
              <div 
                class="remplissage-progression" 
                :style="{ width: statistiques.progress + '%' }"
                role="progressbar"
                :aria-valuenow="statistiques.progress"
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
          </div>

          <!-- Carte Statut -->
          <div class="carte-stat statut">
            <h3>Statut du projet</h3>
            <div class="badge-statut-projet" :class="classeStatutProjet">
              <svg class="icone-statut-projet" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="12" cy="12" r="10" fill="currentColor"/>
              </svg>
              {{ statistiques.status }}
            </div>
          </div>

          <!-- Carte Tâches -->
          <div class="carte-stat taches">
            <h3>Répartition des tâches</h3>
            <div class="liste-stats">
              <div class="ligne-stat">
                <span class="label-stat">Total</span>
                <span class="valeur-stat total">{{ statistiques.total }}</span>
              </div>
              <div class="ligne-stat">
                <span class="label-stat">Validées</span>
                <span class="valeur-stat validee">{{ statistiques.validated }}</span>
              </div>
              <div class="ligne-stat">
                <span class="label-stat">Complétées</span>
                <span class="valeur-stat completee">{{ statistiques.completed }}</span>
              </div>
              <div class="ligne-stat">
                <span class="label-stat">En cours</span>
                <span class="valeur-stat en-cours">{{ statistiques.inProgress }}</span>
              </div>
              <div class="ligne-stat">
                <span class="label-stat">Non validées</span>
                <span class="valeur-stat non-validee">{{ statistiques.notValidated }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

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
              <label for="titre-tache-manager" class="label-champ">
                Titre de la tâche
              </label>
              <input
                id="titre-tache-manager"
                v-model="nouvelleTache.titre"
                type="text"
                required
                class="input-champ"
                placeholder="Ex: Implémenter la fonctionnalité X"
                aria-required="true"
              />
            </div>

            <div class="groupe-champ">
              <label for="description-tache-manager" class="label-champ">
                Description
              </label>
              <textarea
                id="description-tache-manager"
                v-model="nouvelleTache.description"
                rows="4"
                class="input-champ textarea-champ"
                placeholder="Décrivez la tâche en détail..."
              ></textarea>
            </div>

            <div class="groupe-champ">
              <label for="deadline-tache-manager" class="label-champ">
                Date limite (optionnel)
              </label>
              <div class="input-avec-icone">
                <svg class="icone-input" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                  <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <input
                  id="deadline-tache-manager"
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

      <!-- Liste des tâches -->
      <section class="section-taches-manager" aria-labelledby="titre-taches-manager">
        <div class="entete-section">
          <h2 id="titre-taches-manager" class="titre-section">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M9 11l3 3L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Gestion des tâches
          </h2>
          <span class="badge-compteur-section">{{ taches.length }}</span>
        </div>

        <div v-if="taches.length === 0" class="etat-vide">
          <svg class="icone-vide" width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
            <path d="M9 9h6M9 15h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <h3>Aucune tâche créée</h3>
          <p>Commencez par créer votre première tâche pour ce projet.</p>
        </div>

        <div v-else class="liste-taches-manager">
          <article
            v-for="tache in taches"
            :key="tache.id"
            class="carte-tache-manager"
          >
            <!-- En-tête tâche -->
            <header class="entete-tache-manager">
              <div class="info-tache-principale">
                <h3 class="titre-tache-manager">{{ tache.title }}</h3>
                <span class="badge-statut-tache" :class="obtenirClasseStatut(tache.status)">
                  <svg class="icone-statut-tache" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" fill="currentColor"/>
                  </svg>
                  {{ tache.status }}
                </span>
              </div>
            </header>

            <!-- Description -->
            <p class="description-tache-manager">{{ tache.description }}</p>

            <!-- Métadonnées -->
            <div class="metadonnees-tache-manager">
              <div v-if="tache.deadline" class="meta-item-manager deadline-manager">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span><strong>Échéance:</strong> {{ formaterDate(tache.deadline) }}</span>
              </div>
              <div class="meta-item-manager">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span><strong>Créée par:</strong> {{ obtenirNomCreateur(tache.createdBy) }}</span>
              </div>
            </div>

            <!-- Section assignation -->
            <div class="section-assignation">
              <h4 class="titre-assignation">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Personnes assignées
              </h4>

              <div class="liste-assignes">
                <div v-if="tache.assignedTo.length === 0" class="aucun-assigne">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  <span>Personne n'est assigné</span>
                </div>
                <div v-else class="badges-assignes">
                  <span 
                    v-for="idUtilisateur in tache.assignedTo" 
                    :key="idUtilisateur" 
                    class="badge-assigne"
                  >
                    <span class="nom-assigne">{{ obtenirNomUtilisateur(idUtilisateur) }}</span>
                    <button
                      @click="desassignerUtilisateur(tache.id, idUtilisateur)"
                      class="bouton-retirer"
                      :aria-label="`Retirer ${obtenirNomUtilisateur(idUtilisateur)}`"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                  </span>
                </div>
              </div>

              <form @submit.prevent="assignerUtilisateur(tache.id)" class="formulaire-assignation">
                <select 
                  v-model="utilisateurSelectionne[tache.id]" 
                  class="select-utilisateur"
                  :aria-label="`Sélectionner un utilisateur à assigner à ${tache.title}`"
                >
                  <option value="">Sélectionner un utilisateur...</option>
                  <option 
                    v-for="utilisateur in utilisateursDisponibles" 
                    :key="utilisateur.id" 
                    :value="utilisateur.id"
                  >
                    {{ utilisateur.name }}
                  </option>
                </select>
                <button
                  type="submit"
                  class="bouton-assigner"
                  :disabled="!utilisateurSelectionne[tache.id]"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>Assigner</span>
                </button>
              </form>
            </div>

            <!-- Actions -->
            <div class="actions-tache-manager">
              <button
                v-if="tache.status === 'Complétée'"
                @click="validerTache(tache.id)"
                class="bouton-action success"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M22 4L12 14.01l-3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Valider</span>
              </button>

              <button
                @click="modifierTache(tache)"
                class="bouton-action secondaire"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Modifier</span>
              </button>

              <button
                @click="supprimerTache(tache.id)"
                class="bouton-action danger"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Supprimer</span>
              </button>
            </div>

            <!-- Commentaires -->
            <details class="section-commentaires-manager">
              <summary class="titre-commentaires-manager">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Commentaires ({{ tache.comments.length }})</span>
              </summary>

              <div class="liste-commentaires-manager">
                <div v-if="tache.comments.length === 0" class="aucun-commentaire-manager">
                  Aucun commentaire
                </div>
                <div
                  v-for="commentaire in tache.comments"
                  :key="commentaire.id"
                  class="commentaire-manager"
                >
                  <div class="entete-commentaire-manager">
                    <strong>{{ commentaire.userName }}</strong>
                    <time>{{ formaterDate(commentaire.createdAt) }}</time>
                  </div>
                  <p>{{ commentaire.content }}</p>
                </div>
              </div>
            </details>
          </article>
        </div>
      </section>
    </main>

    <!-- Modal d'édition -->
    <transition name="modal-fade">
      <div v-if="idTacheEnEdition" class="overlay-modal" @click="annulerEdition">
        <div class="conteneur-modal" @click.stop>
          <div class="entete-modal">
            <h2>Modifier la tâche</h2>
            <button 
              @click="annulerEdition"
              class="bouton-fermer-modal"
              aria-label="Fermer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

          <form @submit.prevent="mettreAJourTache" class="formulaire-modal">
            <div class="groupe-champ">
              <label for="titre-edition" class="label-champ">
                Titre de la tâche
              </label>
              <input
                id="titre-edition"
                v-model="tacheEnEdition.title"
                type="text"
                required
                class="input-champ"
              />
            </div>

            <div class="groupe-champ">
              <label for="description-edition" class="label-champ">
                Description
              </label>
              <textarea
                id="description-edition"
                v-model="tacheEnEdition.description"
                rows="4"
                class="input-champ textarea-champ"
              ></textarea>
            </div>

            <div class="groupe-champ">
              <label for="deadline-edition" class="label-champ">
                Date limite
              </label>
              <input
                id="deadline-edition"
                v-model="tacheEnEdition.deadline"
                type="date"
                class="input-champ"
              />
            </div>

            <div class="actions-modal">
              <button type="button" @click="annulerEdition" class="bouton-secondaire">
                Annuler
              </button>
              <button type="submit" class="bouton-primaire">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M17 21v-8H7v8M7 3v5h8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Sauvegarder</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import NavBar from '../components/NavBar.vue'
import { useUserStore } from '../stores/userStore'
import { useProjectStore } from '../stores/projectStore'
import { useTaskStore } from '../stores/taskStore'

export default {
  name: 'ManagerProject',
  components: {
    NavBar
  },
  data() {
    return {
      userStore: useUserStore(),
      projectStore: useProjectStore(),
      taskStore: useTaskStore(),
      projet: {},
      taches: [],
      statistiques: {
        total: 0,
        validated: 0,
        completed: 0,
        inProgress: 0,
        notValidated: 0,
        progress: 0,
        status: 'En cours'
      },
      nouvelleTache: {
        titre: '',
        description: '',
        deadline: null
      },
      utilisateurSelectionne: {},
      idTacheEnEdition: null,
      tacheEnEdition: {},
      afficherFormulaireCreation: false
    }
  },
  computed: {
    utilisateurActuel() {
      return this.userStore.getCurrentUser()
    },
    utilisateursDisponibles() {
      return this.userStore.users.filter(u => u.id !== this.utilisateurActuel.id)
    },
    classeStatutProjet() {
      const mapStatuts = {
        'En cours': 'statut-projet-en-cours',
        'À risque': 'statut-projet-risque',
        'Retard': 'statut-projet-retard',
        'Terminé': 'statut-projet-termine'
      }
      return mapStatuts[this.statistiques.status] || 'statut-projet-defaut'
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
      this.statistiques = this.taskStore.getProjectStats(idProjet)
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
    },
    validerTache(idTache) {
      if (this.taskStore.validateTask(idTache)) {
        this.rafraichirTaches()
      }
    },
    assignerUtilisateur(idTache) {
      const idUtilisateur = this.utilisateurSelectionne[idTache]
      if (idUtilisateur) {
        this.taskStore.assignUserToTask(idTache, idUtilisateur)
        this.utilisateurSelectionne[idTache] = ''
        this.rafraichirTaches()
      }
    },
    desassignerUtilisateur(idTache, idUtilisateur) {
      this.taskStore.unassignUserFromTask(idTache, idUtilisateur)
      this.rafraichirTaches()
    },
    modifierTache(tache) {
      this.idTacheEnEdition = tache.id
      this.tacheEnEdition = { ...tache }
    },
    mettreAJourTache() {
      this.taskStore.updateTask(this.idTacheEnEdition, this.tacheEnEdition)
      this.idTacheEnEdition = null
      this.tacheEnEdition = {}
      this.rafraichirTaches()
    },
    annulerEdition() {
      this.idTacheEnEdition = null
      this.tacheEnEdition = {}
    },
    supprimerTache(idTache) {
      if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ? Cette action est irréversible.')) {
        this.taskStore.deleteTask(idTache)
        this.rafraichirTaches()
      }
    },
    formaterDate(dateString) {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    },
    obtenirNomUtilisateur(idUtilisateur) {
      const utilisateur = this.userStore.getUserById(idUtilisateur)
      return utilisateur ? utilisateur.name : 'Inconnu'
    },
    obtenirNomCreateur(idUtilisateur) {
      return this.obtenirNomUtilisateur(idUtilisateur)
    },
    obtenirClasseStatut(statut) {
      const mapStatuts = {
        'Non validé': 'statut-non-valide',
        'En cours': 'statut-en-cours',
        'Complétée': 'statut-completee',
        'Validée': 'statut-validee'
      }
      return mapStatuts[statut] || 'statut-defaut'
    }
  },
  mounted() {
    this.chargerProjet()
  }
}
</script>

<style scoped>
.page-projet-manager {
  min-height: 100vh;
  background-color: #F9F9F9;
}

.conteneur-projet {
  max-width: 1400px;
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
  background-color: #D1FAE5;
  color: #059669;
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

/* Dashboard */
.section-dashboard {
  margin-bottom: 2.5rem;
}

.titre-section {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-size: 1.375rem;
  font-weight: 600;
  color: #1A1A1A;
  margin: 0 0 1.5rem 0;
}

.titre-section svg {
  color: #676767;
}

.grille-statistiques {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.carte-stat {
  background-color: white;
  padding: 1.75rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.25s ease;
}

.carte-stat:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.carte-stat h3 {
  font-size: 0.875rem;
  font-weight: 500;
  color: #676767;
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.entete-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.entete-stat h3 {
  margin: 0;
}

.valeur-principale {
  font-size: 2rem;
  font-weight: 700;
  color: #1A1A1A;
}

.barre-progression {
  width: 100%;
  height: 12px;
  background-color: #F0F0F0;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.remplissage-progression {
  height: 100%;
  background: linear-gradient(90deg, #2EA043 0%, #4CAF50 100%);
  transition: width 0.5s ease;
  border-radius: 6px;
}

.badge-statut-projet {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
}

.icone-statut-projet {
  flex-shrink: 0;
}

.statut-projet-en-cours {
  background-color: #DBEAFE;
  color: #1E40AF;
}

.statut-projet-en-cours .icone-statut-projet {
  color: #3B82F6;
}

.statut-projet-risque {
  background-color: #FEF3C7;
  color: #92400E;
}

.statut-projet-risque .icone-statut-projet {
  color: #F59E0B;
}

.statut-projet-retard {
  background-color: #FEE2E2;
  color: #991B1B;
}

.statut-projet-retard .icone-statut-projet {
  color: #EF4444;
}

.statut-projet-termine {
  background-color: #D1FAE5;
  color: #065F46;
}

.statut-projet-termine .icone-statut-projet {
  color: #10B981;
}

.liste-stats {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ligne-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem 0;
  border-bottom: 1px solid #F0F0F0;
}

.ligne-stat:last-child {
  border-bottom: none;
}

.label-stat {
  font-size: 0.875rem;
  color: #676767;
}

.valeur-stat {
  font-size: 1.125rem;
  font-weight: 600;
  padding: 0.25rem 0.625rem;
  border-radius: 6px;
}

.valeur-stat.total {
  color: #1A1A1A;
  background-color: #F0F0F0;
}

.valeur-stat.validee {
  color: #059669;
  background-color: #D1FAE5;
}

.valeur-stat.completee {
  color: #0969DA;
  background-color: #DBEAFE;
}

.valeur-stat.en-cours {
  color: #92400E;
  background-color: #FEF3C7;
}

.valeur-stat.non-validee {
  color: #991B1B;
  background-color: #FEE2E2;
}

/* Section création (même style que DeveloperProject) */
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
.section-taches-manager {
  margin-bottom: 2.5rem;
}

.entete-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
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

/* Liste des tâches manager */
.liste-taches-manager {
  display: grid;
  gap: 1.5rem;
}

.carte-tache-manager {
  background-color: white;
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.carte-tache-manager:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  border-color: #E0E0E0;
}

.entete-tache-manager {
  margin-bottom: 1rem;
}

.info-tache-principale {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.titre-tache-manager {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1A1A1A;
  margin: 0;
  line-height: 1.4;
  flex: 1;
}

.badge-statut-tache {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.icone-statut-tache {
  flex-shrink: 0;
}

.statut-non-valide {
  background-color: #FFF3CD;
  color: #856404;
}

.statut-non-valide .icone-statut-tache {
  color: #FFC107;
}

.statut-en-cours {
  background-color: #CCE5FF;
  color: #004085;
}

.statut-en-cours .icone-statut-tache {
  color: #0969DA;
}

.statut-completee {
  background-color: #D4EDDA;
  color: #155724;
}

.statut-completee .icone-statut-tache {
  color: #28A745;
}

.statut-validee {
  background-color: #D1ECF1;
  color: #0C5460;
}

.statut-validee .icone-statut-tache {
  color: #17A2B8;
}

.description-tache-manager {
  color: #676767;
  line-height: 1.6;
  margin: 0 0 1rem 0;
  font-size: 0.9375rem;
}

.metadonnees-tache-manager {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  padding: 1rem 0;
  border-top: 1px solid #F0F0F0;
  border-bottom: 1px solid #F0F0F0;
  margin-bottom: 1rem;
}

.meta-item-manager {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #676767;
}

.meta-item-manager svg {
  flex-shrink: 0;
  color: #A0A0A0;
}

.meta-item-manager.deadline-manager {
  color: #D32F2F;
}

.meta-item-manager.deadline-manager svg {
  color: #D32F2F;
}

.meta-item-manager strong {
  font-weight: 500;
  color: #1A1A1A;
}

/* Section assignation */
.section-assignation {
  background-color: #F9F9F9;
  padding: 1.25rem;
  border-radius: 10px;
  margin-bottom: 1rem;
}

.titre-assignation {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1A1A1A;
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.titre-assignation svg {
  color: #676767;
}

.liste-assignes {
  margin-bottom: 1rem;
}

.aucun-assigne {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: white;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #A0A0A0;
  font-style: italic;
}

.aucun-assigne svg {
  flex-shrink: 0;
  color: #D4D4D4;
}

.badges-assignes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;
}

.badge-assigne {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background-color: #E7F5FF;
  color: #0969DA;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
}

.nom-assigne {
  font-weight: 500;
}

.bouton-retirer {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  background: none;
  border: none;
  cursor: pointer;
  color: #0969DA;
  border-radius: 4px;
  transition: all 0.25s ease;
  padding: 0;
}

.bouton-retirer:hover {
  background-color: rgba(9, 105, 218, 0.2);
  color: #044289;
}

.bouton-retirer:focus-visible {
  outline: 2px solid #0969DA;
  outline-offset: 1px;
}

.formulaire-assignation {
  display: flex;
  gap: 0.625rem;
}

.select-utilisateur {
  flex: 1;
  padding: 0.625rem 0.875rem;
  border: 1.5px solid #D4D4D4;
  border-radius: 8px;
  font-size: 0.875rem;
  font-family: inherit;
  color: #1A1A1A;
  background-color: white;
  transition: all 0.25s ease;
}

.select-utilisateur:hover {
  border-color: #A8A8A8;
}

.select-utilisateur:focus {
  outline: none;
  border-color: #1A1A1A;
  box-shadow: 0 0 0 3px rgba(26, 26, 26, 0.08);
}

.bouton-assigner {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.625rem 1rem;
  background-color: #1A1A1A;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: inherit;
  transition: all 0.25s ease;
  white-space: nowrap;
}

.bouton-assigner:hover:not(:disabled) {
  background-color: #000000;
}

.bouton-assigner:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.bouton-assigner:focus-visible {
  outline: 2.5px solid rgba(26, 26, 26, 0.4);
  outline-offset: 2px;
}

/* Actions tâche */
.actions-tache-manager {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.bouton-action {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: inherit;
  transition: all 0.25s ease;
}

.bouton-action.success {
  background-color: #2EA043;
  color: white;
}

.bouton-action.success:hover {
  background-color: #2C974B;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(46, 160, 67, 0.3);
}

.bouton-action.secondaire {
  background-color: #F9F9F9;
  color: #676767;
  border: 1.5px solid #E0E0E0;
}

.bouton-action.secondaire:hover {
  background-color: #F0F0F0;
  border-color: #D0D0D0;
  color: #1A1A1A;
}

.bouton-action.danger {
  background-color: #FFEBEE;
  color: #D32F2F;
  border: 1.5px solid #FFCDD2;
}

.bouton-action.danger:hover {
  background-color: #D32F2F;
  color: white;
  border-color: #D32F2F;
}

.bouton-action:focus-visible {
  outline: 2.5px solid rgba(26, 26, 26, 0.4);
  outline-offset: 2px;
}

/* Commentaires */
.section-commentaires-manager {
  border-top: 2px solid #F0F0F0;
  padding-top: 1rem;
}

.titre-commentaires-manager {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1A1A1A;
  cursor: pointer;
  padding: 0.5rem 0;
  list-style: none;
}

.titre-commentaires-manager::-webkit-details-marker {
  display: none;
}

.titre-commentaires-manager svg {
  color: #676767;
}

.liste-commentaires-manager {
  margin-top: 1rem;
  max-height: 300px;
  overflow-y: auto;
}

.aucun-commentaire-manager {
  padding: 1rem;
  text-align: center;
  color: #A0A0A0;
  font-style: italic;
  font-size: 0.875rem;
}

.commentaire-manager {
  padding: 0.875rem;
  background-color: #F9F9F9;
  border-radius: 8px;
  margin-bottom: 0.625rem;
  font-size: 0.875rem;
}

.entete-commentaire-manager {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.entete-commentaire-manager strong {
  color: #1A1A1A;
  font-weight: 600;
}

.entete-commentaire-manager time {
  color: #A0A0A0;
  font-size: 0.75rem;
}

.commentaire-manager p {
  color: #676767;
  margin: 0;
  line-height: 1.5;
}

/* Modal */
.overlay-modal {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
  backdrop-filter: blur(2px);
}

.conteneur-modal {
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: modalSlideUp 0.3s ease-out;
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.entete-modal {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.entete-modal h2 {
  font-size: 1.375rem;
  font-weight: 600;
  color: #1A1A1A;
  margin: 0;
}

.bouton-fermer-modal {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: #676767;
  transition: all 0.25s ease;
}

.bouton-fermer-modal:hover {
  background-color: #F9F9F9;
  color: #1A1A1A;
}

.bouton-fermer-modal:focus-visible {
  outline: 2.5px solid #1A1A1A;
  outline-offset: 2px;
}

.formulaire-modal {
  display: grid;
  gap: 1.25rem;
}

.actions-modal {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-active .conteneur-modal,
.modal-fade-leave-active .conteneur-modal {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .conteneur-modal,
.modal-fade-leave-to .conteneur-modal {
  transform: translateY(20px) scale(0.95);
  opacity: 0;
}

/* Responsive - Tablette */
@media (max-width: 1024px) {
  .grille-statistiques {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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

  .grille-statistiques {
    grid-template-columns: 1fr;
  }

  .carte-formulaire,
  .carte-tache-manager {
    padding: 1.5rem;
  }

  .actions-formulaire,
  .actions-tache-manager,
  .actions-modal {
    flex-direction: column;
  }

  .bouton-primaire,
  .bouton-secondaire,
  .bouton-action {
    width: 100%;
    justify-content: center;
  }

  .info-tache-principale {
    flex-direction: column;
    gap: 0.75rem;
  }

  .badge-statut-tache {
    align-self: flex-start;
  }

  .formulaire-assignation {
    flex-direction: column;
  }

  .bouton-assigner {
    width: 100%;
    justify-content: center;
  }

  .conteneur-modal {
    padding: 1.5rem;
  }

  .entete-modal h2 {
    font-size: 1.125rem;
  }
}

/* Accessibilité */
@media (prefers-contrast: high) {
  .input-champ,
  .select-utilisateur {
    border-width: 2px;
  }

  .input-champ:focus,
  .select-utilisateur:focus {
    box-shadow: 0 0 0 4px rgba(26, 26, 26, 0.2);
  }
}

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
  .page-projet-manager {
    background-color: #0D0D0D;
  }

  .info-projet,
  .carte-stat,
  .carte-formulaire,
  .carte-tache-manager,
  .conteneur-modal {
    background-color: #1F1F1F;
  }

  .titre-projet,
  .titre-section,
  .entete-formulaire h2,
  .entete-modal h2,
  .etat-vide h3,
  .label-champ,
  .titre-tache-manager,
  .titre-assignation {
    color: #F0F0F0;
  }

  .description-projet,
  .etat-vide p,
  .description-tache-manager {
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

  .carte-stat h3,
  .label-stat,
  .meta-item-manager {
    color: #B0B0B0;
  }

  .valeur-principale,
  .meta-item-manager strong {
    color: #F0F0F0;
  }

  .barre-progression {
    background-color: #2D2D2D;
  }

  .section-assignation {
    background-color: #2D2D2D;
  }

  .aucun-assigne {
    background-color: #1F1F1F;
  }

  .input-champ,
  .select-utilisateur {
    background-color: #2D2D2D;
    border-color: #444444;
    color: #F0F0F0;
  }

  .input-champ:hover,
  .select-utilisateur:hover {
    border-color: #555555;
  }

  .input-champ:focus,
  .select-utilisateur:focus {
    border-color: #F0F0F0;
  }

  .icone-input {
    color: #B0B0B0;
  }

  .bouton-fermer,
  .bouton-fermer-modal {
    color: #B0B0B0;
  }

  .bouton-fermer:hover,
  .bouton-fermer-modal:hover {
    background-color: #2D2D2D;
    color: #F0F0F0;
  }

  .bouton-secondaire,
  .bouton-action.secondaire {
    background-color: #2D2D2D;
    border-color: #444444;
    color: #B0B0B0;
  }

  .bouton-secondaire:hover,
  .bouton-action.secondaire:hover {
    background-color: #3A3A3A;
    color: #F0F0F0;
  }

  .badge-compteur-section {
    background-color: #F0F0F0;
    color: #1A1A1A;
  }

  .commentaire-manager {
    background-color: #2D2D2D;
  }

  .commentaire-manager p {
    color: #B0B0B0;
  }

  .overlay-modal {
    background-color: rgba(0, 0, 0, 0.8);
  }
}
</style>