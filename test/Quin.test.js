const Quin = require('../src/Quin');

describe('Quin', () => {
  // test('where (negation)', () => {
  //   expect(Quin.where(true, {
  //     $not: [
  //       {
  //         a: 'rich',
  //         c: ['a', 'b'],
  //       },
  //       {
  //         d: { $gt: '21' },
  //         e: { $in: ['a', 'b'] },
  //       },
  //     ],
  //   })).toEqual([
  //     [
  //       { key: 'a', ne: 'rich' },
  //       { key: 'c', nin: ['a', 'b'] },
  //       { key: 'd', lte: '21' },
  //       { key: 'e', nin: ['a', 'b'] },
  //     ],
  //   ]);
  // });

  test('where', () => {
    expect(Quin.where(false, {
      a: 'rich',
      b: /rich/i,
      c: ['a', 'b'],
      d: { $gt: '21' },
      e: { $in: ['a', 'b'] },
      f: { a: { b: 'c' } },
      'a.b.d': { $lt: 4, $lte: 4 },
      'a.b.e': { $gte: 1, $lte: 100 },
      $or: [
        {
          'a.b.d.$lt': 5,
          'a.b.d.$lte': 5,
          'a.b.e': { $gte: 100, $lte: 1000 },
        },
        {
          'a.b.d.$lte': 1,
          $or: [{
            'a.b.d.$gt': 100,
          }],
        },
      ],
    }, {
      a: 'anne',
    })).toEqual([
      [
        { key: 'a', eq: 'rich' },
        { key: 'b', eq: /rich/i },
        { key: 'c', in: ['a', 'b'] },
        { key: 'd', gt: '21' },
        { key: 'e', in: ['a', 'b'] },
        { key: 'f.a.b', eq: 'c' },
        { key: 'a.b.d', lt: 4 },
        { key: 'a.b.d', lte: 4 },
        { key: 'a.b.e', gte: 1 },
        { key: 'a.b.e', lte: 100 },
        [
          [
            { key: 'a.b.d', lt: 5 },
            { key: 'a.b.d', lte: 5 },
            { key: 'a.b.e', gte: 100 },
            { key: 'a.b.e', lte: 1000 },
          ],
          [
            { key: 'a.b.d', lte: 1 },
            [[{ key: 'a.b.d', gt: 100 }]],
          ],
        ],
      ],
      [
        { key: 'a', eq: 'anne' },
      ],
    ]);
  });

  test('reads', () => {
    expect(new Quin('table1').one()).toEqual({ crud: 'readOne', fields: ['*'], from: 'table1' });
    expect(new Quin('table1').select('*').one()).toEqual({ crud: 'readOne', fields: ['*'], from: 'table1' });
    expect(new Quin('table1').select(['a', 'b', 'c']).one()).toEqual({ crud: 'readOne', fields: ['a', 'b', 'c'], from: 'table1' });
    expect(new Quin('table1').select('a', 'b', 'c').one()).toEqual({ crud: 'readOne', fields: ['a', 'b', 'c'], from: 'table1' });
    expect(new Quin('table1').select('a', 'b', 'c').many()).toEqual({ crud: 'readMany', fields: ['a', 'b', 'c'], from: 'table1' });
  });
});
