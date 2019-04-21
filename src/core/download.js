const fs = require('fs')
const { PassThrough, } = require('stream')
const httpRequest = require('request')
const FtpClient = require('ftp')
const iconv = require('iconv-lite')
const zlib = require('zlib')
const unzipper = require('unzipper')

const fetchInputStreamsFromFtpInput = input => {
  const { url, unpack, } = input
  const [, , host, ...uri] = url.split('/')

  const client = new FtpClient()

  return new Promise((resolve, reject) => {
    client.on('ready', () => {
      client.get(uri.join('/'), (err, stream) => {
        if (err) {
          reject(err)
          return
        }

        const streams = []
        let unpackFileNames

        switch (unpack.type) {
          case 'zip':
            unpackFileNames = unpack.files.map((file) => file.name)
            stream
              .pipe(unzipper.Parse())
              .on('entry', (entry) => {
                const { path, type, } = entry
                if (!(type === 'File' && unpackFileNames.includes(path))) {
                  entry.autodrain()
                  return
                }
                streams.push(entry)
              })
              .on('close', () => {
                resolve(streams)
              })
            return
          default:
            streams.push(stream)
            break
        }

        resolve(streams)
      })
    })

    client.connect({
      host,
    })
  })
}

const fetchInputStreamsFromHttpInput = input => {
  const { url, encoding = null, } = input

  return new Promise((resolve) => {
    if (encoding !== null) {
      resolve([httpRequest({
        url,
        encoding,
      })])
      return
    }

    resolve([httpRequest({
      url,
    })])
  })
}

const fetchInputStreamsFromUrlInput = input => {
  const { url, } = input

  if (url.startsWith('ftp://')) {
    return fetchInputStreamsFromFtpInput(input)
  }

  // http is default; we're not expecting any protocol for now
  return fetchInputStreamsFromHttpInput(input)
}

const fetchInputStreams = (input) => {
  const {
    path = null,
    url = null,
    encoding = null,
  } = input

  return new Promise((resolve, reject) => {
    if (path !== null) {
      // path is local, just copy file
      resolve([fs.createReadStream(path, { encoding, })])
      return
    }

    if (url !== null) {
      fetchInputStreamsFromUrlInput(input).then(resolve, reject)
      return
    }

    reject(new Error(`Illegal argument for getInputStream(input): Specify input.path or input.url`))
  })
}

const getUnpackStreams = input => {
  const { unpack, } = input
  const unpackStreams = []

  switch (unpack.type) {
    case 'gzip':
      //unpackStreams.push(zlib.createGunzip())
      break
    default:
      break
  }

  unpackStreams.push(new PassThrough())
  return unpackStreams
}

const getEncodingStream = input => {
  const { encoding = 'utf-8', } = input

  return iconv.decodeStream(encoding)
}

const getOutputStream = output => {
  const {
    path = null,
  } = output

  if (path !== null) {
    return fs.createWriteStream(path)
  }
  throw new Error(`Illegal argument for getOutputStream(output): Specify output.path`)
}

const download = (input, output) => {
  return new Promise(async (resolve, reject) => {
    let inputStreams
    try {
      inputStreams = await fetchInputStreams(input)
    } catch (err) {
      reject(err)
      return
    }

    try {
      await Promise
        .all(
          inputStreams.map(inputStream => new Promise((resolve1, reject1) => {
            const outputStream = getOutputStream(output)

            inputStream.on('error', reject1)

            outputStream.on('error', reject1)
            outputStream.on('close', resolve1)

            inputStream
              .pipe(getUnpackStreams(input))
              .pipe(getEncodingStream(input))
              .pipe(outputStream)
          }))
        )
    } catch (err) {
      reject(err)
    }
  })
}

module.exports = download
