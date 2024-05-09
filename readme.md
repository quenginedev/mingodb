# Welcome to MingoDb 🎉

MingoDb is a playful, MongoDB-inspired, client-side library that brings a MongoDB-like experience right into your JavaScript environment. Designed for educational purposes and fun experiments, MingoDb uses the power of the 'mingo' library to let you manage a "database" without any server-side processes. Perfect for learning database operations or adding a database feel to your prototypes!

## ⚠️ Important Note

MingoDb is intended for fun and learning. It is not built for production environments. So, dive in for experimentation, but keep it out of your production code!

## Features 🌟

- Simple and intuitive API similar to MongoDB
- Lightweight client-side database operations
- Fun and easy to understand, perfect for demos and learning

## How to Install 📦

Currently, MingoDb is a conceptual project and not published on npm. To use it, you might consider cloning a repo (when available) and using it directly from there.

## Quick Start Guide 🚀

### Setting Up Your "Database"

Here’s how you can create a new database and start interacting with it:

1. **Create a Database Instance**: Initialize your MingoDb with a unique session or user identifier.
2. **Create a Collection**: Think of collections like tables in a relational database. Here, you can store your documents.
3. **Performing Operations**: Insert, update, find, or delete documents in a straightforward manner.

### Example:

```ts 
/// Initialize your database
const db = new MingoDb("my-session-id");

// Create a collection
const users = db.collection("users");

// Insert a new user
const newUser = await users.insert({
  name: "Alice",
  age: 25,
  hobbies: ["reading", "gaming"]
});

// Find a user
const foundUser = await users.find({ name: "Alice" });

// Update a user
await users.update({ name: "Alice" }, { $set: { age: 26 } });

// Remove a user
await users.remove({ name: "Alice" });
```

## Listening to Changes 🔍

Set up listeners to react to changes in your collections. Useful for debugging or understanding how data flows through your app.

### Example:

```ts
users.onChange({
  query: {},
  callback: (docs, type) => {
    console.log(`${type} operation performed`, docs);
  },
  changeType: ["insert", "update", "remove"],
  immediate: true
});
```

## Contributing to MingoDb 💻

Contributions are what make the open-source community such a fantastic place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Running Tests 🧪

To ensure that your contributions and updates do not break any existing functionality, we encourage you to write and run tests frequently.

### How to Run Tests

```bash
`npm run test`
```

Make sure your features are well-covered!

## Get Involved! 🌍

If you’re interested in using, improving, or just playing around with MingoDb, feel free to get involved. Check out the [issues tab](https://chatgpt.com/c/c68217e9-af26-4efa-9bc5-3429c39c1244#) for things to start working on. Remember, no contribution is too small and every contribution is valued.

## Happy coding, and remember: Have fun with it! 😄