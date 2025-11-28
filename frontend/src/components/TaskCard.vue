<template>
  <div class="task-card smooth-transition" :class="{ 'task-card-assigned': isAssignedToCurrentUser }">
    <div class="task-header">
      <h3>{{ task.title }}</h3>
      <span class="task-status smooth-transition" :class="'status-' + task.status.toLowerCase().replace(' ', '-')">
        {{ task.status }}
      </span>
    </div>

    <p class="task-description">{{ task.description }}</p>

    <div class="task-meta">
      <div v-if="task.deadline" class="deadline">
        <strong>Deadline:</strong> {{ formatDate(task.deadline) }}
      </div>
      <div class="assigned-users">
        <strong>Assigné(s) à:</strong>
        <span v-if="task.assignedTo.length === 0">Non assigné</span>
        <span v-else>{{ assignedUserNames }}</span>
      </div>
    </div>

    <div class="task-actions">
      <button
        v-if="isAssignedToCurrentUser && task.status === 'Non validé'"
        @click="markAsCompleted"
        class="btn btn-primary btn-ripple smooth-hover"
      >
        Marquer comme complétée
      </button>

      <button
        v-if="isAssignedToCurrentUser && task.status === 'Complétée'"
        @click="markAsCompleted"
        class="btn btn-secondary"
        disabled
      >
        Complétée (en attente de validation)
      </button>

      <button
        v-if="isManager && task.status === 'Complétée'"
        @click="validateTask"
        class="btn btn-success btn-ripple smooth-hover"
      >
        Valider
      </button>

      <button @click="toggleComments" class="btn btn-secondary smooth-hover">
        Commentaires ({{ task.comments.length }})
      </button>

      <button
        v-if="isManager"
        @click="$emit('edit')"
        class="btn btn-secondary smooth-hover"
      >
        Modifier
      </button>

      <button
        v-if="isManager"
        @click="$emit('delete')"
        class="btn btn-danger smooth-hover"
      >
        Supprimer
      </button>
    </div>

    <transition name="slide-down">
      <div v-if="showComments" class="task-comments">
        <div class="comments-list">
          <div v-for="(comment, index) in task.comments" :key="comment.id" class="comment fade-in" :style="{ animationDelay: `${index * 0.1}s` }">
            <strong>{{ comment.userName }}:</strong> {{ comment.content }}
            <small>{{ formatDate(comment.createdAt) }}</small>
          </div>
          <div v-if="task.comments.length === 0" class="no-comments">
            Pas de commentaires
          </div>
        </div>

        <div class="add-comment">
          <input
            v-model="newComment"
            type="text"
            placeholder="Ajouter un commentaire..."
            class="input focus-ring"
            @keyup.enter="addComment"
          />
          <button @click="addComment" class="btn btn-primary btn-ripple smooth-hover">Commenter</button>
        </div>
      </div>
    </transition>
  </div>
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
  emits: ['edit', 'delete'],
  data() {
    return {
      showComments: false,
      newComment: '',
      userStore: useUserStore(),
      taskStore: useTaskStore()
    }
  },
  computed: {
    isAssignedToCurrentUser() {
      const currentUser = this.userStore.getCurrentUser()
      return currentUser && this.task.assignedTo.includes(currentUser.id)
    },
    assignedUserNames() {
      return this.task.assignedTo
        .map(userId => {
          const user = this.userStore.getUserById(userId)
          return user ? user.name : 'Inconnu'
        })
        .join(', ')
    }
  },
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR')
    },
    toggleComments() {
      this.showComments = !this.showComments
    },
    markAsCompleted() {
      const currentUser = this.userStore.getCurrentUser()
      if (this.taskStore.markTaskAsCompleted(this.task.id, currentUser.id)) {
        this.$emit('update')
      }
    },
    validateTask() {
      if (this.taskStore.validateTask(this.task.id)) {
        this.$emit('update')
      }
    },
    addComment() {
      if (this.newComment.trim()) {
        const currentUser = this.userStore.getCurrentUser()
        this.taskStore.addCommentToTask(
          this.task.id,
          currentUser.id,
          currentUser.name,
          this.newComment
        )
        this.newComment = ''
        this.$emit('update')
      }
    }
  }
}
</script>

<style scoped>
.task-card {
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
}

.task-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.task-card:hover::before {
  transform: scaleY(1);
}

.task-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateX(4px);
}

.task-card-assigned {
  border-left: 4px solid #4CAF50;
}

.task-card-assigned::before {
  display: none;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  gap: 12px;
}

.task-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
  flex: 1;
}

.task-status {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
  letter-spacing: 0.5px;
}

.status-non-validé {
  background: linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%);
  color: #856404;
}

.status-en-cours {
  background: linear-gradient(135deg, #cce5ff 0%, #99ccff 100%);
  color: #004085;
}

.status-complétée {
  background: linear-gradient(135deg, #d4edda 0%, #a8d5ba 100%);
  color: #155724;
}

.status-validée {
  background: linear-gradient(135deg, #d1ecf1 0%, #a3d9e4 100%);
  color: #0c5460;
}

.task-description {
  color: #666;
  margin: 12px 0;
  line-height: 1.6;
}

.task-meta {
  margin: 16px 0;
  font-size: 14px;
  color: #555;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
}

.deadline {
  margin-bottom: 8px;
  color: #d32f2f;
  font-weight: 500;
}

.assigned-users {
  margin-bottom: 8px;
}

.task-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transform: translateY(-2px);
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
  transform: translateY(-2px);
}

.btn-success {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
}

.btn-success:hover {
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
  transform: translateY(-2px);
}

.btn-danger {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
}

.btn-danger:hover {
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
  transform: translateY(-2px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.task-comments {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #e9ecef;
}

.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
}

.slide-down-enter-from, .slide-down-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  margin-top: 0;
}

.comments-list {
  margin-bottom: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.comment {
  padding: 12px;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  font-size: 13px;
  border-left: 3px solid #667eea;
}

.comment strong {
  color: #667eea;
}

.comment small {
  display: block;
  color: #999;
  margin-top: 6px;
  font-size: 11px;
}

.no-comments {
  color: #999;
  font-style: italic;
  text-align: center;
  padding: 20px;
}

.add-comment {
  display: flex;
  gap: 8px;
}

.input {
  flex: 1;
  padding: 10px 14px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Responsive Design */
@media (max-width: 640px) {
  .task-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .task-status {
    align-self: flex-start;
  }

  .task-actions {
    flex-direction: column;
  }

  .task-actions .btn {
    width: 100%;
  }

  .add-comment {
    flex-direction: column;
  }
}
</style>
