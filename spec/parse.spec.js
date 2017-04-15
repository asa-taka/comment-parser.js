const comment = require('../js/parser');

// helpers

const fs = require('fs');
function loadData(filename) {
  return fs.readFileSync(`./spec/testdata/${filename}`).toString();
}

// specs

describe('comment.parse', () => {

  const parse = comment.parse;

  it('parse nice', () => {
    const res = parse(loadData('valid'));
    res.entries.map(r => r.comments.nearby).forEach(r => console.log(r))
  })

  it('parse sample', () => {
    const res = parse(loadData('sample'));
    res.entries.map(r => r).forEach(r => console.log(r))
  })

})
