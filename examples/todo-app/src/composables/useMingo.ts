import MingoDb from "../../../../lib";
import TimestampPlugin from './../../../../lib/plugin/timestamp';

const db = new MingoDb('todo-app', {
  plugins: [new TimestampPlugin()]
})

export const useMingo = () => {
    return {
      db
    }
}