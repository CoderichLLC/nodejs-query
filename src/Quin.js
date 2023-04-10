const Util = require('@coderich/util');

module.exports = class Quin {
  #query = Object.defineProperties({}, {
    id: { writable: true },
    keyMap: { writable: true, value: {} },
  });

  constructor(query = {}) {
    Object.assign(this.#query, query);

    // this.join = () => this;
    // this.sort = () => this;

    // Terminal commands
    // this.first = () => this.#query;
    // this.last = () => this.#query;
    // this.count = () => this.#query;
  }

  id(id) {
    this.#propCheck('id', 'where', 'sort', 'skip', 'limit', 'before', 'after', 'first', 'last');
    this.#query.id = id;
    this.#query.where = this.#normalize({ id });
    return this;
  }

  where(clause) {
    this.#propCheck('where', 'id');
    this.#query.where = this.#normalize(clause);
    return this;
  }

  select(...args) {
    this.#propCheck('fields');
    this.#query.fields = args.flat();
    return this;
  }

  skip(skip) {
    this.#propCheck('skip', 'id');
    this.isClassicPaging = true;
    this.#query.skip = skip;
    return this;
  }

  limit(limit) {
    this.#propCheck('limit', 'id');
    this.isClassicPaging = true;
    this.#query.limit = limit;
    return this;
  }

  first(first) {
    this.#propCheck('first', 'id', 'last');
    this.isCursorPaging = true;
    this.#query.first = first + 2; // Adding 2 for pagination meta info (hasNext hasPrev)
    return this;
  }

  last(last) {
    this.#propCheck('last', 'id', 'first');
    this.isCursorPaging = true;
    this.#query.last = last + 2; // Adding 2 for pagination meta info (hasNext hasPrev)
    return this;
  }

  before(before) {
    this.#propCheck('before', 'id');
    this.isCursorPaging = true;
    this.#query.before = before;
    return this;
  }

  after(after) {
    this.#propCheck('after', 'id');
    this.isCursorPaging = true;
    this.#query.after = after;
    return this;
  }

  one() {
    return this.resolve(Object.assign(this.#query, { op: 'findOne' }));
  }

  many() {
    return this.resolve(Object.assign(this.#query, { op: 'findMany' }));
  }

  save() {
    if (this.#query.id) return this.resolve(Object.assign(this.#query, { op: 'updateOne' }));
    if (this.#query.where) return this.resolve(Object.assign(this.#query, { op: 'updateMany' }));
    return this.resolve(Object.assign(this.#query, { op: 'createMany' }));
  }

  delete() {
    if (this.#query.id) return this.resolve(Object.assign(this.#query, { op: 'deleteOne' }));
    if (this.#query.where) return this.resolve(Object.assign(this.#query, { op: 'deleteMany' }));
    throw new Error('Delete requires id() or where()');
  }

  clone(query = {}) {
    query.keyMap = query.keyMap || this.#query.keyMap;
    return new Quin({ ...this.#query, ...query });
  }

  resolve() {
    return this.#query;
  }

  #normalize(data) {
    return Util.unflatten(Object.entries(Util.flatten(data)).reduce((prev, [key, value]) => {
      // Rename key
      const $key = Object.entries(this.#query.keyMap).reduce((p, [k, v]) => {
        const regex = new RegExp(`((?:^|\\.))${k}\\b`, 'g');
        return p.replace(regex, `$1${v}`);
      }, key);

      // Assign it back
      return Object.assign(prev, { [$key]: value });
    }, {}));

    // return args.flat().map((arg) => {
    //   return Object.entries(Flat.flatten(arg, { safe: true })).reduce((arr, [key, value]) => {
    //     let op;
    //     [key, op = 'eq'] = key.split('.$');
    //     // if (key.startsWith('$not')) return arr.concat(...Quin.where(true, value));
    //     if (key.startsWith('$or')) return arr.concat([Quin.where(negate, value)]);
    //     if (Array.isArray(value)) op = 'in';
    //     // if (negate) op = counterOps[op];
    //     return arr.concat({ key, [op]: value });
    //   }, []);
    // });
  }

  #propCheck(prop, ...checks) {
    if (['skip', 'limit'].includes(prop) && this.isCursorPaging) throw new Error(`Cannot use "${prop}" while using Cursor-Style Pagination`);
    if (['first', 'last', 'before', 'after'].includes(prop) && this.isClassicPaging) throw new Error(`Cannot use "${prop}" while using Classic-Style Pagination`);
    checks.forEach((check) => { if (this.#query[check]) throw new Error(`Cannot use "${prop}" while using "${check}"`); });
  }
};
