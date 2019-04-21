const fs = require('fs')
const download = require('./download')
const prepareDownloadQueue = require('./download/prepareDownloadQueue')

describe('download', () => {
  beforeEach(() => {
    return new Promise((resolve) => {
      fs.unlink('test/download', () => {
        resolve()
      })
    })
  })

  it('should input and output respectively', () => {
    expect(download.length).toBe(2)
  })

  describe('on local sources', () => {
    xit('should copy files', () => {
      const aDownloadPromise = download(
        { path: 'datasets/test.txt', },
        { path: 'test/download/test.txt', },
      )

      expect(aDownloadPromise instanceof Promise).toBe(true)

      return new Promise((resolve, reject) => {
        aDownloadPromise.then(() => {
          resolve()
          fs.access('test/download/test.txt', (err) => {
            if (err) {
              reject(err)
              return
            }
            resolve()
          })
        })
      })
    })
  })

  describe('on remote sources', () => {
    let originalTimeout

    beforeEach(() => {
      originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000
    })

    xit('should process a gzipped source with a specified encoding', () => {
      const aDataset = {
        "group": "dictionary",
        "name": "edict",
        "source": {
          "url": "ftp://ftp.edrdg.org/pub/Nihongo/edict2.gz",
          "encoding": "euc-jp",
          "unpack": {
            "type": "gzip"
          },
        },
        "parse": {
          "format": "edict"
        }
      }

      const aDownloadQueue = prepareDownloadQueue(aDataset)

      const aDownloadPromise = download(
        aDownloadQueue.download[0].source,
        { path: `test/download/${aDownloadQueue.name}`, },
      )

      return new Promise((resolve, reject) => {
        aDownloadPromise.then(() => {
          resolve()
          fs.access(`test/download/${aDownloadQueue.name}/${aDownloadQueue.name}.txt`, (err) => {
            if (err) {
              reject(err)
              return
            }
            resolve()
          })
        })
      })
    })

    it('should process a zipped source with files to extract', () => {
      const aDataset = {
        "group": "dictionary",
        "name": "manufdic",
        "source": {
          "url": "ftp://ftp.edrdg.org/pub/Nihongo/manufdic.zip",
          "unpack": {
            "type": "zip",
            "files": [
              {
                "name": "manufdic",
                "source": {
                  "path": "manufdic",
                  "encoding": "euc-jp",
                },
                "parse": {
                  "format": "edict"
                },
              },
            ],
          },
        },
      }

      const aDownloadQueue = prepareDownloadQueue(aDataset)
    })

    afterEach(() => {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout
    })
  })

})
