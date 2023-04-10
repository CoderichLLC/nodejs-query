const Flat = require('flat');

// const counterOps = { eq: 'ne', ne: 'eq', lt: 'gte', lte: 'gt', gt: 'lte', gte: 'lt', in: 'nin', nin: 'in' };

module.exports = class Quin {
  #query = { fields: ['*'] };

  constructor(target) {
    this.#query.from = target;
    this.join = () => this;
    this.sort = () => this;

    // Terminal commands
    // this.first = () => this.#query;
    // this.last = () => this.#query;
    // this.count = () => this.#query;
  }

  id(id) {
    this.#propCheck('id', 'where', 'sort', 'skip', 'limit', 'before', 'after', 'first', 'last');
    this.#query.id = id;
    this.#query.where = { id };
    return this;
  }

  where(...args) {
    this.#propCheck('where', 'id');
    this.#query.where = Quin.where(false, ...args);
    return this;
  }

  select(...args) {
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
    return Object.assign(this.#query, { crud: 'readOne' });
  }

  many() {
    return Object.assign(this.#query, { crud: 'readMany' });
  }

  save() {
    if (this.#query.id) return Object.assign(this.#query, { crud: 'updateOne' });
    if (this.#query.where) return Object.assign(this.#query, { crud: 'updateMany' });
    return Object.assign(this.#query, { crud: 'createMany' });
  }

  delete() {
    if (this.#query.id) return Object.assign(this.#query, { crud: 'deleteOne' });
    if (this.#query.where) return Object.assign(this.#query, { crud: 'deleteMany' });
    throw new Error('Delete requires id() or where()');
  }

  #propCheck(prop, ...checks) {
    if (['skip', 'limit'].includes(prop) && this.isCursorPaging) throw new Error(`Cannot use "${prop}" while using Cursor-Style Pagination`);
    if (['first', 'last', 'before', 'after'].includes(prop) && this.isClassicPaging) throw new Error(`Cannot use "${prop}" while using Classic-Style Pagination`);
    checks.forEach((check) => { if (this.#query[check]) throw new Error(`Cannot use "${prop}" while using "${check}"`); });
  }

  static where(negate = false, ...args) {
    return args.flat().map((arg) => {
      return Object.entries(Flat.flatten(arg, { safe: true })).reduce((arr, [key, value]) => {
        let op;
        [key, op = 'eq'] = key.split('.$');
        // if (key.startsWith('$not')) return arr.concat(...Quin.where(true, value));
        if (key.startsWith('$or')) return arr.concat([Quin.where(negate, value)]);
        if (Array.isArray(value)) op = 'in';
        // if (negate) op = counterOps[op];
        return arr.concat({ key, [op]: value });
      }, []);
    });
  }
};
