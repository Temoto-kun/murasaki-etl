const Jasmine = require('jasmine')
const JasmineConsoleReporter = require('jasmine-console-reporter')

const jasmine = new Jasmine()
const reporter = new JasmineConsoleReporter({
  colors: 2,
  cleanStack: 2,
  emoji: false,
  beep: false,
})

jasmine.loadConfigFile('src/setupTests/jasmine.json')
jasmine.addReporter(reporter)
jasmine.execute()

