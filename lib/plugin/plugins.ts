export default abstract class Plugin<T, R extends T = T> {
  onInsert(data: T[]): R[] | Promise<R[]> {
    return data as R[];
  }

  onUpdate(data: T[]): R[] | Promise<R[]> {
    return data as R[];
  }

  onRemove(data: T[]): R[] | Promise<R[]> {
    return data as R[];
  }

  onFind(data: T[]): R[] | Promise<R[]> {
    return data as R[];
  }
  
  onFindOne(data: T | null): R | null | Promise<R | null> {
    return data as R | null;
  }
  
  beforeInsert(data: T[]): R[] | Promise<R[]> {
    return data as R[];
  }
  
  beforeUpdate(data: T[]): R[] | Promise<R[]> {
    return data as R[];
  }
  
  beforeFind(data: T[]): R[] | Promise<R[]> {
    return data as R[];
  }
  
  beforeFindOne(data: T | null): R | null | Promise<R | null> {
    return data as R | null
  }
}
