import { Hook } from "."

type DocWithTimestamp<Document> = Document & {
  createdAt: Date,
  updatedAt: Date
}

const insertOne = <T, R = DocWithTimestamp<T>>(data: T): R => {
  const timestamp = new Date()
  return { ...data, createdAt: timestamp, updatedAt: timestamp } as R
}

const updateOne = <T, R = DocWithTimestamp<T>>(data: T): R => {
  const timestamp = new Date()
  return { ...data, updatedAt: timestamp } as R
}

export const Timestamp = (hook: Hook) => {
  if(!hook['insertOne']) hook['insertOne'] = {}
  if(!hook['updateOne']) hook['updateOne'] = {}

  if (!hook['insertOne']['pre']) hook['insertOne']['pre'] = []
  if (!hook['updateOne']['pre']) hook['updateOne']['pre'] = []

  hook['insertOne']['pre']?.push(insertOne)
  hook['updateOne']['pre']?.push(updateOne)
  return hook
}