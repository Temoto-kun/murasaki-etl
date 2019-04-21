const prepareDownloadQueue = require('./prepareDownloadQueue')

describe('prepareDownloadQueue', () => {
  it('should accept dataset entry', () => {
    expect(prepareDownloadQueue.length).toBe(1)
  })

  it('should return the download task name and queue', () => {
    const aDataset = {
      "group": "dictionary",
      "name": "edict",
      "source": {
        "url": "ftp://ftp.edrdg.org/pub/Nihongo/edict2.gz",
        "encoding": "euc-jp"
      },
      "unpack": {
        "type": "gzip"
      },
      "parse": {
        "format": "edict"
      }
    }

    const aDownloadQueue = prepareDownloadQueue(aDataset)

    expect(typeof aDownloadQueue).toBe('object')
    expect('name' in aDownloadQueue).toBe(true)
    expect('download' in aDownloadQueue).toBe(true)
    expect(aDownloadQueue.download instanceof Array).toBe(true)
    expect(typeof aDownloadQueue.name).toBe('string')
  })
})
