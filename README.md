# Mingodb
In browser MongoDB wrapper around IndexedDB Database with almost perfect type inference and plugin system done in a day 😎 

```typescript
import { MingoDb } from "../../../src";

const db = await MingoDb({
  name: "my-todos",
  version: 5,
  schema: {
    todo: {
      content: { type: "string", required: true },
      done: { type: "boolean" },
      members: { 
        type: "array", 
        of: {
          name: { type: "string" },
          email: { type: "string" },
        } 
      }
    }
  }
});

const todos = await db.findMany('todo')

const addTodo = async (newTodo) => {
    const todo = await db.insertOne('todo', {...newTodo})
    todos.push(todo)
  }
  
  const toggleDone = async (todo) => {
    todo.done = !todo.done
    await db.updateOne('todo', todo)
  }
  
  const removeTodo = async (index) => {
    const todo = todos[index]
    await db.deleteOne('todo', todo)
    todos.splice(index, 1)
  }
```