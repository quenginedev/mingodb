<script setup lang="ts">
import { useTodo } from './composable/useTodo'
const {
  newTodo,
  todos,

  addTodo,
  removeTodo,
  toggleDone
} = await useTodo()

</script>

<template>
  <div style="display: flex; gap: 10px;">
    <input v-model="newTodo.content"/>
    <button @click="addTodo">Add</button>
  </div>
  <div style="margin-top: 20px;">
    <div @click="toggleDone(todo)" v-for="(todo, index) in todos" :key="index" class="todo">
      <p>{{ todo.content }}</p>
      <p v-if="todo.done" style="display: flex; gap: 15px;">
        <span style="cursor: pointer;" @click.stop="removeTodo(index)">❌</span>
      </p>
      <p v-else>🔳</p>
    </div>
  </div>
  <pre>{{ todos }}</pre>
</template>
<style scoped>
.todo{
  width: 420px;
  display: flex;
  justify-content: space-between;
  border: 2px solid #333;
  padding: 0px 20px;
}
</style>