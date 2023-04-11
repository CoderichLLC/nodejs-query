const Query = require('../src/Query');

describe('Query', () => {
  test('Basic queries', () => {
    expect(new Query({ model: 'table' }).id(1).one()).toEqual({ op: 'findOne', model: 'table', where: { id: 1 } });
    expect(new Query({ model: 'table' }).id(1).select('a', 'b', 'c').one()).toEqual({ op: 'findOne', model: 'table', fields: ['a', 'b', 'c'], where: { id: 1 } });
    expect(new Query({ model: 'table' }).id(1).select(['a', 'b', 'c']).one()).toEqual({ op: 'findOne', model: 'table', fields: ['a', 'b', 'c'], where: { id: 1 } });
    expect(new Query({ model: 'table' }).one()).toEqual({ op: 'findOne', model: 'table' });
    expect(new Query({ model: 'table' }).many()).toEqual({ op: 'findMany', model: 'table' });
  });

  test('Clone', () => {
    const query = new Query({ model: 'table' });
    expect(query.clone().id(1).one()).toEqual({ op: 'findOne', model: 'table', where: { id: 1 } });
    expect(query.clone().id(1).select(['a', 'b', 'c']).one()).toEqual({ op: 'findOne', model: 'table', fields: ['a', 'b', 'c'], where: { id: 1 } });
    expect(query.clone().one()).toEqual({ op: 'findOne', model: 'table' });
    expect(query.clone().many()).toEqual({ op: 'findMany', model: 'table' });
  });

  test('ID manipulation', () => {
    const query = new Query({ model: 'table', idKey: '_id' });
    expect(query.clone().id(1).one()).toEqual({ op: 'findOne', model: 'table', where: { _id: 1 } });
    expect(query.clone().where({ id: 1 }).one()).toEqual({ op: 'findOne', model: 'table', where: { id: 1 } });
    expect(query.clone().where({ network: { id: 1 } }).one()).toEqual({ op: 'findOne', model: 'table', where: { network: { id: 1 } } });
    expect(query.clone().where({ 'network.id': 1 }).one()).toEqual({ op: 'findOne', model: 'table', where: { 'network.id': 1 } });
    expect(query.clone().where({ networkid: 1 }).one()).toEqual({ op: 'findOne', model: 'table', where: { networkid: 1 } });
    expect(query.clone().where({ 'my.array': { $in: ['a', 'b', 'c'] } }).one()).toEqual({ op: 'findOne', model: 'table', where: { 'my.array': { $in: ['a', 'b', 'c'] } } });
    expect(query.clone().where({ 'my.array.$in': ['a', 'b', 'c'] }).one()).toEqual({ op: 'findOne', model: 'table', where: { 'my.array.$in': ['a', 'b', 'c'] } });
    expect(query.clone().where({ $or: [{ id: 1 }, { network: { id: 2 } }] }).one()).toEqual({ op: 'findOne', model: 'table', where: { $or: [{ id: 1 }, { network: { id: 2 } }] } });
    expect(query.clone().where({ $or: [{ id: 1 }, { 'network.id': 2 }] }).one()).toEqual({ op: 'findOne', model: 'table', where: { $or: [{ id: 1 }, { 'network.id': 2 }] } });
  });
});
