const core = require('./core')
describe('core', () => {
  it('should accept one argument - options', () => {
    expect(typeof core).toBe('function')
    expect(core.length).toBe(1)
  })
})
