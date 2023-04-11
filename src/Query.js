module.exports = class Query {
  #query = Object.defineProperties({}, {
    id: { writable: true, enumerable: false },
    idKey: { writable: true, enumerable: false, value: 'id' },
  });

  constructor(query = {}) {
    Object.assign(this.#query, query);
  }

  id(id) {
    this.#propCheck('id', 'where', 'sort', 'skip', 'limit', 'before', 'after', 'first', 'last');
    this.#query.id = id;
    this.#query.where = { [this.#query.idKey]: id };
    return this;
  }

  where(clause) {
    this.#propCheck('where', 'id');
    this.#query.where = clause;
    return this;
  }

  select(...fields) {
    this.#propCheck('fields');
    this.#query.fields = fields.flat();
    return this;
  }

  populate(...fields) {
    this.#propCheck('populate');
    this.#query.populate = fields.flat();
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

  sort(sort) {
    this.#propCheck('sort', 'id');
    this.#query.sort = sort;
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
    query.idKey = query.idKey || this.#query.idKey;
    return new Query({ ...this.#query, ...query });
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

  #propCheck(prop, ...checks) {
    if (['skip', 'limit'].includes(prop) && this.isCursorPaging) throw new Error(`Cannot use "${prop}" while using Cursor-Style Pagination`);
    if (['first', 'last', 'before', 'after'].includes(prop) && this.isClassicPaging) throw new Error(`Cannot use "${prop}" while using Classic-Style Pagination`);
    checks.forEach((check) => { if (this.#query[check]) throw new Error(`Cannot use "${prop}" while using "${check}"`); });
  }
};
