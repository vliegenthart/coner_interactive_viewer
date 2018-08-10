// @author: Daniel Vliegenthart

import papersList from '../highlights/papers-list'

const config = {};

config.facets = ['dataset', 'method']
config.papersList = papersList

config.defaultPaper = process.env.NODE_ENV === 'production'
  ? config.papersList[Math.floor(Math.random()*config.papersList.length)]
  : config.papersList[0];

config.showDebug = process.env.NODE_ENV === 'development'

config.ostMintRatio = 0.03717
config.ostDevMode = true

export default config;
