import { MingoDb } from "../../../src";
import { Timestamp } from './../../../src/plugins/timestamp';

export const useDb = async () => {
  const db = await MingoDb({
    name: "my-todos",
    version: 5,
    schema: {
      todo: {
        content: { type: "string" },
        done: { type: "boolean" },
      },
    },
    plugins: [ Timestamp ]
  });  

  return {
    db
  }
}