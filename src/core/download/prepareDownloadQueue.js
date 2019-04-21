function prepareKanjiDownloadQueue(dataset) {
  return {
    name: dataset.name,
    download: [
      ...dataset.base.map(base => ({
        name: base.name,
        source: base.source,
      })),
      ...dataset.radicals.map(radical => ({
        name: radical.name,
        source: radical.source,
      })),
    ],
  }
}

function prepareDictionaryDownloadQueue(dataset) {
  return {
    name: dataset.name,
    download: [
      {
        name: dataset.name,
        source: dataset.source,
        unpack: dataset.unpack,
      },
    ],
  }
}

function prepareExamplesDownloadQueue(dataset) {
  return {
    name: dataset.name,
    download: [
      {
        name: dataset.name,
        source: dataset.source,
      },
    ],
  }
}

function prepareDownloadQueue(dataset) {
  const { group, ...theDataset } = dataset
  switch (group) {
    case 'kanji':
      return prepareKanjiDownloadQueue(theDataset)
    case 'dictionary':
      return prepareDictionaryDownloadQueue(theDataset)
    case 'examples':
      return prepareExamplesDownloadQueue(theDataset)
  }
}

module.exports = prepareDownloadQueue
