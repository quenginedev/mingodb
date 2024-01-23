import { ref } from 'vue'
import { useDb } from './useDb'

type Todo = {
  _id: string
  content: string,
  done: boolean,
  updatedAt?: Date
}

export const useTodo = async () => {
  const { db } = await useDb()

  const newTodo = ref<Omit<Todo, '_id'>>({
    content: '',
    done: false
  })

  const todos = ref<Todo[]>([])
  
  const res = await db.findMany('todo')
  todos.value = res
  
  const addTodo = async () => {
    const todo = await db.insertOne('todo', {...newTodo.value})
    todos.value.push(todo)
    newTodo.value = {
      content: '',
      done: false
    }
  }
  
  const toggleDone = async (todo: Todo) => {
    todo.done = !todo.done
    await db.updateOne('todo', todo)
  }
  
  const removeTodo = async (index: number) => {
    const todo = todos.value[index]
    await db.deleteOne('todo', todo)
    todos.value.splice(index, 1)
  }

  return {
    newTodo,
    todos,


    addTodo,
    toggleDone,
    removeTodo
  }
}