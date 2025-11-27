<template>
  <div class="task-card" :class="{ 'task-card-assigned': isAssignedToCurrentUser }">
    <div class="task-header">
      <h3>{{ task.title }}</h3>
      <span class="task-status" :class="'status-' + task.status.toLowerCase().replace(' ', '-')">
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
        class="btn btn-primary"
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
        class="btn btn-success"
      >
        Valider
      </button>

      <button @click="toggleComments" class="btn btn-secondary">
        Commentaires ({{ task.comments.length }})
      </button>

      <button
        v-if="isManager"
        @click="$emit('edit')"
        class="btn btn-secondary"
      >
        Modifier
      </button>

      <button
        v-if="isManager"
        @click="$emit('delete')"
        class="btn btn-danger"
      >
        Supprimer
      </button>
    </div>

    <div v-if="showComments" class="task-comments">
      <div class="comments-list">
        <div v-for="comment in task.comments" :key="comment.id" class="comment">
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
          class="input"
        />
        <button @click="addComment" class="btn btn-primary">Commenter</button>
      </div>
    </div>
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
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.task-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.task-card-assigned {
  border-left: 4px solid #4CAF50;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.task-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.task-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.status-non-validé {
  background-color: #fff3cd;
  color: #856404;
}

.status-en-cours {
  background-color: #cce5ff;
  color: #004085;
}

.status-complétée {
  background-color: #d4edda;
  color: #155724;
}

.status-validée {
  background-color: #d1ecf1;
  color: #0c5460;
}

.task-description {
  color: #666;
  margin: 12px 0;
  line-height: 1.5;
}

.task-meta {
  margin: 12px 0;
  font-size: 14px;
  color: #555;
}

.deadline {
  margin-bottom: 8px;
  color: #d32f2f;
}

.assigned-users {
  margin-bottom: 8px;
}

.task-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.btn {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #2196F3;
  color: white;
}

.btn-primary:hover {
  background-color: #0b7dda;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-success:hover {
  background-color: #218838;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.task-comments {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.comments-list {
  margin-bottom: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.comment {
  padding: 8px;
  margin-bottom: 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-size: 13px;
}

.comment small {
  display: block;
  color: #999;
  margin-top: 4px;
}

.no-comments {
  color: #999;
  font-style: italic;
}

.add-comment {
  display: flex;
  gap: 8px;
}

.input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.input:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
}
</style>
