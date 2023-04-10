const Util = require('@coderich/util');

module.exports = class Quin {
  #query = Object.defineProperties({}, {
    id: { writable: true },
    keyMap: { writable: true, value: {} },
    arrayOp: { writable: true, value: '$eq' },
  });

  constructor(query = {}) {
    Object.assign(this.#query, query);

    // this.join = () => this;
    // this.sort = () => this;

    // Terminal commands
    // this.first = () => this.#query;
    // this.last = () => this.#query;
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

  // first(first) {
  //   this.#propCheck('first', 'id', 'last');
  //   this.isCursorPaging = true;
  //   this.#query.first = first + 2; // Adding 2 for pagination meta info (hasNext hasPrev)
  //   return this;
  // }

  // last(last) {
  //   this.#propCheck('last', 'id', 'first');
  //   this.isCursorPaging = true;
  //   this.#query.last = last + 2; // Adding 2 for pagination meta info (hasNext hasPrev)
  //   return this;
  // }

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

  count() {
    return this.resolve(Object.assign(this.#query, { op: 'count' }));
  }

  save(...args) {
    const { id, where } = this.#query;
    const prefix = (id || where ? (args[1] ? 'upsert' : 'update') : 'create'); // eslint-disable-line
    return this.#mutation(prefix, ...args);
  }

  delete(...args) {
    const { id, where } = this.#query;
    if (!id && !where) throw new Error('Delete requires id() or where()');
    return this.#mutation('delete', ...args);
  }

  clone(query = {}) {
    query.keyMap = query.keyMap || this.#query.keyMap;
    query.arrayOp = query.arrayOp || this.#query.arrayOp;
    return new Quin({ ...this.#query, ...query });
  }

  resolve() {
    return this.#query;
  }

  #mutation(prefix, ...args) {
    args = args.flat();
    const { id, limit } = this.#query;
    const suffix = id || limit === 1 || (prefix === 'create' && args.length === 1) ? 'One' : 'Many';
    const input = suffix === 'One' ? args[0] : args;
    return this.resolve(Object.assign(this.#query, { op: `${prefix}${suffix}`, input }));
  }

  #normalize(data) {
    if (typeof data !== 'object') return data;

    // Flatten (but don't spread arrays - we want to special handle them)
    return Util.unflatten(Object.entries(Util.flatten(data, false)).reduce((prev, [key, value]) => {
      // Rename key
      const $key = Object.entries(this.#query.keyMap).reduce((p, [k, v]) => {
        const regex = new RegExp(`((?:^|\\.))${k}\\b`, 'g');
        return p.replace(regex, `$1${v}`);
      }, key);

      // Special array handling, ensure we understand the meaning
      if (Array.isArray(value)) {
        const match = $key.match(/\$[a-zA-Z]{2}(?=']|$)/);
        const $value = value.map(el => this.#normalize(el));
        value = match ? $value : { [this.#query.arrayOp]: $value };
      }

      // Assign it back
      return Object.assign(prev, { [$key]: value });
    }, {}));
  }

  #propCheck(prop, ...checks) {
    if (['skip', 'limit'].includes(prop) && this.isCursorPaging) throw new Error(`Cannot use "${prop}" while using Cursor-Style Pagination`);
    if (['first', 'last', 'before', 'after'].includes(prop) && this.isClassicPaging) throw new Error(`Cannot use "${prop}" while using Classic-Style Pagination`);
    checks.forEach((check) => { if (this.#query[check]) throw new Error(`Cannot use "${prop}" while using "${check}"`); });
  }
};
