<script setup lang="ts">
import { useTodo } from "./composables/useTodo";
const { todos, newTodo, addTodo, removeTodo, toggleCompleted } = useTodo();
</script>

<template>
  <div class="todoApp">
    <h2>Todo App</h2>
    <div>
      <input v-model="newTodo.title" />
      <button @click="addTodo(newTodo)">Add</button>
    </div>
    <div>
      <div 
        v-for="todo in todos" 
        :key="todo.id"
        class="todoItem"
        :class="{ completed: todo.completed }"
        >
        <span>{{ todo.title }}</span>
        <div class="">
          <button v-if="todo.completed" @click="removeTodo(todo)">🗑️</button>
          <button @click="toggleCompleted(todo)">
            <template v-if="todo.completed">✅</template>
            <template v-else>⬜</template>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.todoApp {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.completed {
  text-decoration: line-through;
}

input {
  padding: 0.5em;
  border-radius: 0.5em;
  border: 1px solid #ccc;
}

.trashBtn {
  color: white;
  border: none;
  padding: 0.5em;
  border-radius: 0.5em;
}
.todoItem {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
