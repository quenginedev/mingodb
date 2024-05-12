import MingoDb from "../lib";
import TimestampPlugin from "../lib/plugin/timestamp";

type Task = {
  name: string;
  description: string;
  completed: boolean;
};

(async () => {
  const randomUserId = () => Math.random().toString(36).substr(2, 9);

  const accountDb = new MingoDb(`test-${randomUserId()}`, {
    plugins: [ new TimestampPlugin() ],
    sync: {
      callback: async (timestamp, db) => {
        const response = await fetch(`https://jsonplaceholder.typicode.com/todos?from=${timestamp}`)
        const data = await response.json();
        const tasks = db.collection<Task>("tasks");
        await tasks.insertMany(data);
      },
      immediate: true,
    },
  });

  const tasks = accountDb.collection<Task>("tasks");

  const task = await tasks.insert({
    name: "Task 1",
    description: "This is a description",
    completed: false,
  });

  tasks.$({
    query: {},
    callback: (docs, type) => {
      console.log("listener", docs, type);
    },
    changeType: ["insert", "update", "remove"],
    immediate: true,
  });

  await tasks.insert({
    name: "Task 2",
    description: "This is a description",
    completed: false,
  });

  await tasks.update({ name: "Task 1" }, { $set: { completed: true } });
  await tasks.remove({ _id: task._id });
  const allTasks = await tasks.find({});
  console.log(allTasks);
})();
