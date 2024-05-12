import { onMounted, ref, watchEffect } from 'vue';
import { Doc } from '../../../../lib/adaptor';
import { useMingo } from './useMingo';

type Todo = {
  title: string;
  completed: boolean;
}

export const useTodo = () => {
  const { db } = useMingo()
  const todosCollection = db.collection<Todo>('todos')
  
  const todos = ref<Doc<Todo>[]>([])
  const defaultNewTodo = { title: '', completed: false } 
  const newTodo = ref<Todo>({...defaultNewTodo})

  const addTodo = async (todo: Todo) => {
    const insertedTodo = await todosCollection.insert(todo)
    newTodo.value = {...defaultNewTodo}
    return insertedTodo
  }

  const toggleCompleted = async (todo: Doc<Todo>) => {
    return await todosCollection.update({ _id: todo._id }, { $set: { completed: !todo.completed } })
  }

  const removeTodo = async (todo: Doc<Todo>) => {
    return await todosCollection.remove({ _id: todo._id })
  }

  onMounted(() => {
    todosCollection.insertMany([
      { title: 'Learn Vue 3', completed: true },
      { title: 'Learn Mingo', completed: false },
      { title: 'Build a Todo App', completed: false },
      { title: 'Learn Vite', completed: false },
      { title: 'Learn Vitepress', completed: false },
    ])
  })

  watchEffect((cleanup) => {
    const sub = todosCollection.$<Todo>({
      query: {},
      callback: (docs, changeType) => {
        switch (changeType) {
          case 'insert':
            docs.forEach(todo => todos.value.push(todo))
            break
          case 'update':
            docs.forEach(updatedTodo => {
              const list = [...todos.value]
              const index = list.findIndex(todo => todo._id === updatedTodo._id)
              list.splice(index, 1, updatedTodo)
              todos.value = list
            })
            break
          case 'remove':
            docs.forEach(removeTodo => {
              const index = todos.value.findIndex(todo => todo._id === removeTodo._id)
              todos.value.splice(index, 1)
            })
            break
        }
      },
      changeType: ['insert', 'update', 'remove'],
      immediate: true
    })
    
    cleanup(() => {
      sub()
    })
  })

  return {
    todos,
    newTodo,
    addTodo,
    removeTodo,
    toggleCompleted
  }
}