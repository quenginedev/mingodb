import MingoDb from "../lib";

type Task = {
  name: string;
  description: string;
  completed: boolean;
  createdAt: Date;
}

(async () => {
  const randomUserId = () => Math.random().toString(36).substr(2, 9);
  const accountDb = new MingoDb(`test-${randomUserId()}`);
  const tasks = accountDb.collection<Task>("tasks");

  const task = await tasks.insert({
    name: "Task 1",
    description: "This is a description",
    completed: false,
    createdAt: new Date(),
  }); // This will insert a new task

  tasks.$({
    query: {},
    callback: (docs, type) => {
      console.log('listener', docs, type);
    },
    changeType: ["insert", "update", "remove"], // This will listen to all changes
    immediate: true // This will trigger the callback immediately
  })

  await tasks.insert({
    name: "Task 2",
    description: "This is a description",
    completed: false,
    createdAt: new Date(),
  });

  await tasks.update({ name: "Task 1" }, { $set: { completed: true } });

  await tasks.remove({ _id: task._id });

  const allTasks = await tasks.find({});
  console.log(allTasks);
})();
