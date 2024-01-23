```typescript
const dbName = 'quenginedev@gmail.com'
const version = 1

const pets = {
  name: 'string',
  type: { type: 'string', enum: ['dog', 'cat', 'bird'], default: 'cat' },
  age: Number
  ownerId: { type: 'id', ref: 'users', many: false }
}

const users = {
  name: 'string',
  fiends: {type: 'id', }
}

const db = new MingoDb({
  name, 
  version,
  schema: { pets, users }
})

const shaggy = await db.users.findOne({ name: 'Shaggy' })

const scooby = await db.pets.insertOne({
  name: "Scooby",
  type: 'dog',
  owner: user._id
})
```