const Quin = require('../src/Quin');

describe('Quin', () => {
  test('Basic queries', () => {
    expect(new Quin({ model: 'table' }).id(1).one()).toEqual({ op: 'findOne', model: 'table', where: { id: 1 } });
    expect(new Quin({ model: 'table' }).id(1).select('a', 'b', 'c').one()).toEqual({ op: 'findOne', model: 'table', fields: ['a', 'b', 'c'], where: { id: 1 } });
    expect(new Quin({ model: 'table' }).id(1).select(['a', 'b', 'c']).one()).toEqual({ op: 'findOne', model: 'table', fields: ['a', 'b', 'c'], where: { id: 1 } });
    expect(new Quin({ model: 'table' }).one()).toEqual({ op: 'findOne', model: 'table' });
    expect(new Quin({ model: 'table' }).many()).toEqual({ op: 'findMany', model: 'table' });
  });

  test('Clone', () => {
    const quin = new Quin({ model: 'table' });
    expect(quin.clone().id(1).one()).toEqual({ op: 'findOne', model: 'table', where: { id: 1 } });
    expect(quin.clone().id(1).select(['a', 'b', 'c']).one()).toEqual({ op: 'findOne', model: 'table', fields: ['a', 'b', 'c'], where: { id: 1 } });
    expect(quin.clone().one()).toEqual({ op: 'findOne', model: 'table' });
    expect(quin.clone().many()).toEqual({ op: 'findMany', model: 'table' });
  });

  test('Query manipulation', () => {
    const quin = new Quin({ model: 'table', keyMap: { id: '_id' } });
    expect(quin.clone().where({ id: 1 }).one()).toEqual({ op: 'findOne', model: 'table', where: { _id: 1 } });
    expect(quin.clone().where({ network: { id: 1 } }).one()).toEqual({ op: 'findOne', model: 'table', where: { network: { _id: 1 } } });
    expect(quin.clone().where({ 'network.id': 1 }).one()).toEqual({ op: 'findOne', model: 'table', where: { 'network._id': 1 } });
    expect(quin.clone().where({ networkid: 1 }).one()).toEqual({ op: 'findOne', model: 'table', where: { networkid: 1 } });
    expect(quin.clone().where({ 'my.array': ['a', 'b', 'c'] }).one()).toEqual({ op: 'findOne', model: 'table', where: { 'my.array': ['a', 'b', 'c'] } });
    expect(quin.clone().where({ $or: [{ id: 1 }, { network: { id: 2 } }] }).one()).toEqual({ op: 'findOne', model: 'table', where: { $or: [{ _id: 1 }, { network: { _id: 2 } }] } });
    expect(quin.clone().where({ $or: [{ id: 1 }, { 'network.id': 2 }] }).one()).toEqual({ op: 'findOne', model: 'table', where: { $or: [{ _id: 1 }, { 'network._id': 2 }] } });
  });
});
