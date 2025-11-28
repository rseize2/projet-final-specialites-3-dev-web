<template>
  <article 
    class="carte-tache" 
    :class="classesCarte"
    role="article"
    :aria-label="`Tâche: ${tache.title}`"
  >
    <!-- En-tête de la carte -->
    <header class="entete-tache">
      <div class="info-principale">
        <h3 class="titre-tache">{{ tache.title }}</h3>
        <span 
          class="badge-statut" 
          :class="classeStatut"
          :aria-label="`Statut: ${tache.status}`"
        >
          <svg class="icone-statut" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="12" cy="12" r="10" fill="currentColor"/>
          </svg>
          {{ tache.status }}
        </span>
      </div>
      
      <!-- Badge d'assignation -->
      <div v-if="estAssigneUtilisateurActuel" class="badge-assigne">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Assigné à vous</span>
      </div>
    </header>

    <!-- Description -->
    <p class="description-tache">{{ tache.description }}</p>

    <!-- Métadonnées -->
    <div class="metadonnees-tache">
      <div v-if="tache.deadline" class="meta-item deadline">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span>
          <strong>Échéance:</strong> {{ formaterDate(tache.deadline) }}
        </span>
      </div>
      
      <div class="meta-item assignes">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span v-if="tache.assignedTo.length === 0" class="non-assigne">Non assigné</span>
        <span v-else>{{ nomsUtilisateursAssignes }}</span>
      </div>
    </div>

    <!-- Actions principales -->
    <div class="actions-tache">
      <!-- Bouton marquer comme complétée -->
      <button
        v-if="estAssigneUtilisateurActuel && tache.status === 'Non validé'"
        @click="marquerCompletee"
        class="bouton-action primaire"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M9 11l3 3L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Marquer complétée</span>
      </button>

      <!-- État complétée -->
      <div
        v-if="estAssigneUtilisateurActuel && tache.status === 'Complétée'"
        class="etat-completee"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span>En attente de validation</span>
      </div>

      <!-- Bouton valider -->
      <button
        v-if="estManager && tache.status === 'Complétée'"
        @click="validerTache"
        class="bouton-action success"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M22 4L12 14.01l-3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Valider</span>
      </button>
    </div>

    <!-- Actions secondaires -->
    <div class="actions-secondaires">
      <button @click="basculerCommentaires" class="bouton-secondaire">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Commentaires</span>
        <span class="badge-compteur">{{ tache.comments.length }}</span>
      </button>

      <button
        v-if="estManager"
        @click="$emit('edit')"
        class="bouton-secondaire"
        aria-label="Modifier la tâche"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Modifier</span>
      </button>

      <button
        v-if="estManager"
        @click="$emit('delete')"
        class="bouton-secondaire danger"
        aria-label="Supprimer la tâche"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Supprimer</span>
      </button>
    </div>

    <!-- Section commentaires -->
    <transition name="slide-fade">
      <section v-if="afficherCommentaires" class="section-commentaires">
        <div class="liste-commentaires">
          <div v-if="tache.comments.length === 0" class="aucun-commentaire">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p>Aucun commentaire pour le moment</p>
          </div>

          <article
            v-for="commentaire in tache.comments"
            :key="commentaire.id"
            class="commentaire"
          >
            <div class="entete-commentaire">
              <div class="avatar-commentaire">
                {{ obtenirInitiales(commentaire.userName) }}
              </div>
              <div class="info-commentaire">
                <strong class="auteur-commentaire">{{ commentaire.userName }}</strong>
                <time class="date-commentaire" :datetime="commentaire.createdAt">
                  {{ formaterDate(commentaire.createdAt) }}
                </time>
              </div>
            </div>
            <p class="contenu-commentaire">{{ commentaire.content }}</p>
          </article>
        </div>

        <form @submit.prevent="ajouterCommentaire" class="formulaire-commentaire">
          <div class="groupe-input-commentaire">
            <input
              v-model="nouveauCommentaire"
              type="text"
              placeholder="Ajouter un commentaire..."
              class="input-commentaire"
              aria-label="Nouveau commentaire"
            />
            <button 
              type="submit" 
              class="bouton-envoyer"
              :disabled="!nouveauCommentaire.trim()"
              aria-label="Envoyer le commentaire"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </form>
      </section>
    </transition>
  </article>
</template>

<script>
import { useUserStore } from '../stores/userStore'
import { useTaskStore } from '../stores/taskStore'

export default {
  name: 'TaskCard',
  props: {
    task: {
      type: Object,
      required: true
    },
    isManager: {
      type: Boolean,
      default: false
    }
  },
  emits: ['edit', 'delete', 'update'],
  data() {
    return {
      afficherCommentaires: false,
      nouveauCommentaire: '',
      userStore: useUserStore(),
      taskStore: useTaskStore()
    }
  },
  computed: {
    tache() {
      return this.task
    },
    estManager() {
      return this.isManager
    },
    estAssigneUtilisateurActuel() {
      const utilisateurActuel = this.userStore.getCurrentUser()
      return utilisateurActuel && this.tache.assignedTo.includes(utilisateurActuel.id)
    },
    nomsUtilisateursAssignes() {
      return this.tache.assignedTo
        .map(idUtilisateur => {
          const utilisateur = this.userStore.getUserById(idUtilisateur)
          return utilisateur ? utilisateur.name : 'Inconnu'
        })
        .join(', ')
    },
    classesCarte() {
      return {
        'assignee-moi': this.estAssigneUtilisateurActuel,
        'statut-validee': this.tache.status === 'Validée'
      }
    },
    classeStatut() {
      const mapStatuts = {
        'Non validé': 'statut-non-valide',
        'En cours': 'statut-en-cours',
        'Complétée': 'statut-completee',
        'Validée': 'statut-validee'
      }
      return mapStatuts[this.tache.status] || 'statut-defaut'
    }
  },
  methods: {
    formaterDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    },
    basculerCommentaires() {
      this.afficherCommentaires = !this.afficherCommentaires
    },
    marquerCompletee() {
      const utilisateurActuel = this.userStore.getCurrentUser()
      if (this.taskStore.markTaskAsCompleted(this.tache.id, utilisateurActuel.id)) {
        this.$emit('update')
      }
    },
    validerTache() {
      if (this.taskStore.validateTask(this.tache.id)) {
        this.$emit('update')
      }
    },
    ajouterCommentaire() {
      if (this.nouveauCommentaire.trim()) {
        const utilisateurActuel = this.userStore.getCurrentUser()
        this.taskStore.addCommentToTask(
          this.tache.id,
          utilisateurActuel.id,
          utilisateurActuel.name,
          this.nouveauCommentaire
        )
        this.nouveauCommentaire = ''
        this.$emit('update')
      }
    },
    obtenirInitiales(nom) {
      if (!nom) return '?'
      const mots = nom.trim().split(' ')
      if (mots.length === 1) {
        return mots[0].charAt(0).toUpperCase()
      }
      return (mots[0].charAt(0) + mots[mots.length - 1].charAt(0)).toUpperCase()
    }
  }
}
</script>

<style scoped>
.carte-tache {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.carte-tache:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  border-color: #E0E0E0;
}

.carte-tache.assignee-moi::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, #0969DA 0%, #2EA043 100%);
}

.carte-tache.statut-validee {
  background: linear-gradient(135deg, #F0FFF4 0%, #FFFFFF 100%);
}

/* En-tête */
.entete-tache {
  margin-bottom: 1rem;
}

.info-principale {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.titre-tache {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1A1A1A;
  margin: 0;
  line-height: 1.4;
  flex: 1;
}

.badge-statut {
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

.icone-statut {
  flex-shrink: 0;
}

.statut-non-valide {
  background-color: #FFF3CD;
  color: #856404;
}

.statut-non-valide .icone-statut {
  color: #FFC107;
}

.statut-en-cours {
  background-color: #CCE5FF;
  color: #004085;
}

.statut-en-cours .icone-statut {
  color: #0969DA;
}

.statut-completee {
  background-color: #D4EDDA;
  color: #155724;
}

.statut-completee .icone-statut {
  color: #28A745;
}

.statut-validee {
  background-color: #D1ECF1;
  color: #0C5460;
}

.statut-validee .icone-statut {
  color: #17A2B8;
}

.badge-assigne {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background-color: #E7F5FF;
  color: #0969DA;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 500;
}

/* Description */
.description-tache {
  color: #676767;
  line-height: 1.6;
  margin: 0 0 1rem 0;
  font-size: 0.9375rem;
}

/* Métadonnées */
.metadonnees-tache {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  padding: 1rem 0;
  border-top: 1px solid #F0F0F0;
  border-bottom: 1px solid #F0F0F0;
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #676767;
}

.meta-item svg {
  flex-shrink: 0;
  color: #A0A0A0;
}

.meta-item.deadline {
  color: #D32F2F;
}

.meta-item.deadline svg {
  color: #D32F2F;
}

.meta-item strong {
  font-weight: 500;
  color: #1A1A1A;
}

.non-assigne {
  font-style: italic;
  color: #A0A0A0;
}

/* Actions principales */
.actions-tache {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.bouton-action {
  display: inline-flex;
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
}

.bouton-action.primaire {
  background-color: #1A1A1A;
  color: white;
}

.bouton-action.primaire:hover {
  background-color: #000000;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
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

.bouton-action:focus-visible {
  outline: 2.5px solid rgba(26, 26, 26, 0.4);
  outline-offset: 2px;
}

.etat-completee {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background-color: #FFF9E6;
  color: #856404;
  border: 1.5px solid #FFE8A1;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Actions secondaires */
.actions-secondaires {
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;
}

.bouton-secondaire {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  background-color: #F9F9F9;
  color: #676767;
  border: 1.5px solid #E0E0E0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8125rem;
  font-weight: 500;
  font-family: inherit;
  transition: all 0.25s ease;
}

.bouton-secondaire:hover {
  background-color: #F0F0F0;
  border-color: #D0D0D0;
  color: #1A1A1A;
}

.bouton-secondaire.danger {
  color: #D32F2F;
}

.bouton-secondaire.danger:hover {
  background-color: #FFEBEE;
  border-color: #FFCDD2;
}

.bouton-secondaire:focus-visible {
  outline: 2.5px solid #1A1A1A;
  outline-offset: 2px;
}

.badge-compteur {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 0.375rem;
  background-color: #1A1A1A;
  color: white;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Section commentaires */
.section-commentaires {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid #F0F0F0;
}

.liste-commentaires {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 1rem;
  padding-right: 0.5rem;
}

.liste-commentaires::-webkit-scrollbar {
  width: 6px;
}

.liste-commentaires::-webkit-scrollbar-track {
  background: #F0F0F0;
  border-radius: 3px;
}

.liste-commentaires::-webkit-scrollbar-thumb {
  background: #D0D0D0;
  border-radius: 3px;
}

.liste-commentaires::-webkit-scrollbar-thumb:hover {
  background: #B0B0B0;
}

.aucun-commentaire {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: #A0A0A0;
}

.aucun-commentaire svg {
  color: #D4D4D4;
  margin-bottom: 0.75rem;
}

.aucun-commentaire p {
  font-size: 0.875rem;
  margin: 0;
}

.commentaire {
  padding: 1rem;
  background-color: #F9F9F9;
  border-radius: 10px;
  margin-bottom: 0.75rem;
  transition: background-color 0.25s ease;
}

.commentaire:hover {
  background-color: #F0F0F0;
}

.entete-commentaire {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.625rem;
}

.avatar-commentaire {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1A1A1A 0%, #676767 100%);
  color: white;
  display: grid;
  place-items: center;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
}

.info-commentaire {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.auteur-commentaire {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1A1A1A;
}

.date-commentaire {
  font-size: 0.75rem;
  color: #A0A0A0;
}

.contenu-commentaire {
  font-size: 0.875rem;
  color: #676767;
  line-height: 1.5;
  margin: 0;
}

/* Formulaire commentaire */
.formulaire-commentaire {
  margin-top: 1rem;
}

.groupe-input-commentaire {
  display: flex;
  gap: 0.625rem;
  align-items: center;
}

.input-commentaire {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1.5px solid #E0E0E0;
  border-radius: 10px;
  font-size: 0.875rem;
  font-family: inherit;
  color: #1A1A1A;
  background-color: white;
  transition: all 0.25s ease;
}

.input-commentaire::placeholder {
  color: #A0A0A0;
}

.input-commentaire:hover {
  border-color: #D0D0D0;
}

.input-commentaire:focus {
  outline: none;
  border-color: #1A1A1A;
  box-shadow: 0 0 0 3px rgba(26, 26, 26, 0.08);
}

.bouton-envoyer {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  background-color: #1A1A1A;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s ease;
  flex-shrink: 0;
}

.bouton-envoyer:hover:not(:disabled) {
  background-color: #000000;
  transform: scale(1.05);
}

.bouton-envoyer:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.bouton-envoyer:focus-visible {
  outline: 2.5px solid rgba(26, 26, 26, 0.4);
  outline-offset: 2px;
}

/* Animations */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.25s ease-in;
}

.slide-fade-enter-from {
  transform: translateY(-10px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-5px);
  opacity: 0;
}

/* Responsive - Mobile */
@media (max-width: 640px) {
  .carte-tache {
    padding: 1.25rem;
  }

  .titre-tache {
    font-size: 1rem;
  }

  .info-principale {
    flex-direction: column;
    gap: 0.75rem;
  }

  .badge-statut {
    align-self: flex-start;
  }

  .actions-tache,
  .actions-secondaires {
    flex-direction: column;
  }

  .bouton-action,
  .bouton-secondaire {
    width: 100%;
    justify-content: center;
  }

  .metadonnees-tache {
    gap: 0.75rem;
  }

  .groupe-input-commentaire {
    gap: 0.5rem;
  }

  .bouton-envoyer {
    width: 44px;
    height: 44px;
  }
}

/* Accessibilité - Contraste élevé */
@media (prefers-contrast: high) {
  .carte-tache {
    border-width: 2px;
  }

  .input-commentaire {
    border-width: 2px;
  }

  .input-commentaire:focus {
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
  .carte-tache {
    background-color: #1F1F1F;
    border-color: #2D2D2D;
  }

  .carte-tache:hover {
    border-color: #444444;
  }

  .titre-tache {
    color: #F0F0F0;
  }

  .description-tache {
    color: #B0B0B0;
  }

  .metadonnees-tache {
    border-color: #2D2D2D;
  }

  .meta-item {
    color: #B0B0B0;
  }

  .meta-item strong {
    color: #F0F0F0;
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

  .section-commentaires {
    border-color: #2D2D2D;
  }

  .commentaire {
    background-color: #2D2D2D;
  }

  .commentaire:hover {
    background-color: #3A3A3A;
  }

  .auteur-commentaire {
    color: #F0F0F0;
  }

  .contenu-commentaire {
    color: #B0B0B0;
  }

  .input-commentaire {
    background-color: #2D2D2D;
    border-color: #444444;
    color: #F0F0F0;
  }

  .input-commentaire:hover {
    border-color: #555555;
  }

  .input-commentaire:focus {
    border-color: #F0F0F0;
  }

  .bouton-envoyer {
    background-color: #F0F0F0;
    color: #1A1A1A;
  }

  .bouton-envoyer:hover:not(:disabled) {
    background-color: #E0E0E0;
  }
}
</style>