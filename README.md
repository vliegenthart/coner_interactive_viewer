# Coner Interactive Viewer (CIV)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![GitHub tag](https://img.shields.io/github/tag/expressjs/express.svg)](https://github.com/vliegenthart/coner_interactive_viewer/tags)


Coner is an online, interactive document viewer that visualises relevant technical terms in scientific publications. It aims to provide an environment that gives a concise overview of keywords of different categories, like datasets and methods, that appear in the publications. Coner's main usecase is to enable users to rate the quality of automatically classified technical terms (with regards to relevance to each category, e.g. dataset or method) and to select new technical terms by highlighting them.

Demo of the coner viewer is live at [https://coner-viewer.herokuapp.com/signup](https://coner-viewer.herokuapp.com/signup).

## CIV and Coner Collaborative NER Pipeline
CIV is 1 of 3 modules of the Coner Collaborative Named Entity Recognition Pipeline. You can read more about CIV and it's role in the Coner pipeline in the [Coner Collaborative NER paper](https://github.com/vliegenthart/coner_interactive_viewer/blob/master/public/pdf/coner.pdf).

## Dependencies
- ReactJS
- npm pdfjs package
- [https://github.com/agentcooper/react-pdf-annotator](https://github.com/agentcooper/react-pdf-annotator)
- Firebase Authentication & Realtime databases

## Related Repositories
Coner Collaborative NER Pipeline modules:
- Module 1: [https://github.com/vliegenthart/coner_document_analyser](https://github.com/vliegenthart/coner_document_analyser)
- Module 3: [https://github.com/vliegenthart/coner_feedback_analyser](https://github.com/vliegenthart/coner_feedback_analyser)

## Development
- how to run this stuff