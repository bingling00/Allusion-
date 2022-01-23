export class Sequence<T> implements Iterable<T> {
  private readonly generator: () => Generator<T, void, void>;

  constructor(generator: () => Generator<T, void, void>) {
    this.generator = generator;
  }

  [Symbol.iterator](): Iterator<T, void, void> {
    return this.generator();
  }

  static from<T>(iterable: Iterable<T>): Sequence<T> {
    return new Sequence(function* () {
      for (const item of iterable) {
        yield item;
      }
    });
  }

  static empty(): Sequence<never> {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return new Sequence(function* () {});
  }

  static once<T>(value: T): Sequence<T> {
    return new Sequence(function* () {
      yield value;
    });
  }

  map<U>(transform: (item: T) => U): Sequence<U> {
    const iterator = this.generator();
    return new Sequence(function* () {
      for (const item of iterator) {
        yield transform(item);
      }
    });
  }

  filter(predicate: (item: T) => boolean): Sequence<T> {
    const iterator = this.generator();
    return new Sequence(function* () {
      for (const item of iterator) {
        if (predicate(item)) {
          yield item;
        }
      }
    });
  }

  filterMap<U>(transform: (item: T) => U | undefined): Sequence<U> {
    const iterator = this.generator();
    return new Sequence(function* () {
      for (const item of iterator) {
        const value = transform(item);
        if (value !== undefined) {
          yield value;
        }
      }
    });
  }

  flatMap<U>(transform: (item: T) => Sequence<U>): Sequence<U> {
    const iterator = this.generator();
    return new Sequence(function* () {
      for (const item of iterator) {
        yield* transform(item);
      }
    });
  }

  chain(iterable: Iterable<T>): Sequence<T> {
    const iter1 = this.generator();
    const iter2 = iterable;
    return new Sequence(function* () {
      for (const item of iter1) {
        yield item;
      }
      for (const item of iter2) {
        yield item;
      }
    });
  }

  skip(count: number): Sequence<T> {
    const iterator = this.generator()[Symbol.iterator]();
    return new Sequence(function* () {
      for (let i = 0; i < count && iterator.next().done !== true; i++) {}
      for (const item of iterator) {
        yield item;
      }
    });
  }

  take(count: number): Sequence<T> {
    const iterator = this.generator()[Symbol.iterator]();
    return new Sequence(function* () {
      let item = iterator.next();
      for (let i = 0; i < count && item.done !== true; i++) {
        yield item.value;
        item = iterator.next();
      }
    });
  }

  takeWhile(predicate: (item: T) => boolean): Sequence<T> {
    const iterator = this.generator()[Symbol.iterator]();
    return new Sequence(function* () {
      let item = iterator.next();
      while (item.done !== true && predicate(item.value)) {
        yield item.value;
        item = iterator.next();
      }
    });
  }

  intersperse(separator: T): Sequence<T> {
    const iterator = this.generator();
    return new Sequence(function* () {
      let needsSeparator = false;
      for (const item of iterator) {
        if (needsSeparator) {
          yield separator;
        }
        yield item;
        needsSeparator = true;
      }
    });
  }

  zip<U>(iterable: Iterable<U>): Sequence<[T, U]> {
    const iter1 = this.generator()[Symbol.iterator]();
    const iter2 = iterable[Symbol.iterator]();
    return new Sequence(function* () {
      let item1 = iter1.next();
      let item2 = iter2.next();
      while (item1.done !== true && item2.done !== true) {
        yield [item1.value, item2.value];
        item1 = iter1.next();
        item2 = iter2.next();
      }
    });
  }

  forEach(each: (item: T) => void) {
    const iterator = this.generator();
    for (const item of iterator) {
      each(item);
    }
  }

  count(): number {
    const iterator = this.generator()[Symbol.iterator]();
    let count = 0;
    while (iterator.next().done !== true) {
      count += 1;
    }
    return count;
  }

  reduce<B>(init: B, reducer: (accumulator: B, item: T) => B): B {
    const iterator = this.generator();
    let result = init;
    for (const item of iterator) {
      result = reducer(result, item);
    }
    return result;
  }

  some(predicate: (item: T) => boolean): boolean {
    const iterator = this.generator();
    for (const item of iterator) {
      if (predicate(item)) {
        return true;
      }
    }
    return false;
  }

  collect(): T[] {
    return Array.from(this.generator());
  }
}

export function drainFilter<T>(array: T[], predicate: (item: T) => boolean): Sequence<T> {
  return new Sequence(function* () {
    let count = 0;
    for (let i = array.length - 1; i >= 0; i--) {
      if (predicate(array[i])) {
        count += 1;
      } else {
        yield* array.splice(i + 1, count);
        count = 0;
      }
    }
    yield* array.splice(0, count);
  });
}
