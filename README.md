# Coner Interactive Viewer (CIV)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![GitHub tag](https://img.shields.io/github/tag/expressjs/express.svg)](https://github.com/vliegenthart/coner_interactive_viewer/tags)

CIV is an online, interactive document viewer that visualises relevant technical terms in scientific publications. It creates an environment that gives a concise overview of technical terms/entities/keywords of different categories, like datasets and methods, that appear in the publications. CIV's main usecase is to enable users to rate the quality of automatically classified technical terms (with regards to relevance to each category, e.g. dataset or method) and to select new technical terms by highlighting them.

Demo of the Coner viewer is live at [https://coner-viewer.herokuapp.com/signup](https://coner-viewer.herokuapp.com/signup).

## Coner Collaborative NER Pipeline
Named Entity Recognition (NER) for rare long-tail entities as e.g., often found in domain-specific scientific publications is a challenging task, as typically the extensive training data and test data for fine-tuning NER algorithms is lacking. Recent approaches presented promising solutions relying on training NER algorithms in a iterative distantly-supervised fashion, thus limiting human interaction to only providing a small set of seed terms. Such approaches heavily rely on heuristics in order to cope with the limited training data size. As these heuristics are prone to failure, the overall achievable performance is limited. In this paper, we therefore introduce a collaborative approach which incrementally incorporates human feedback on the relevance of extracted entities into the training cycle of such iterative NER algorithms. This approach, called Coner, allows to still train new domain specific rare long-tail NER extractors with low costs, but with ever increasing performance while the algorithm is actively used. 

Coner consists of 3 modules, namely the [Coner Document Analyser (CDA)](https://github.com/vliegenthart/coner_document_analyser), Coner Interactive Viewer (CIV) and [Coner Feedback Analyser (CFA)](https://github.com/vliegenthart/coner_feedback_analyser). Module 1 (CDA) generates a candidate set of publications to receive feedback on in CIV, by analysing publications from the corpus and rank them according to features like number of times paper has been cited, number of distinct automatically extracted entities for each category and availability of PDF. Module 2 (CIV) visualizes the extracted entities and allows users to both give feedback on categorical relevance and select new relevant entities. Finally, module 3 (CDA) analyses the given feedback and generates a list of entities for each category with metadata like relevance score, amount of feedback, etc. This final output can be utilized by the NER algorithm to improve the expansion and filtering step of it's training cycle for the next iteration.

You can read more about CIV and the Coner pipeline in the [Coner Collaborative NER paper](https://github.com/vliegenthart/coner_interactive_viewer/blob/master/public/pdf/coner.pdf).

## Installation
- how to run this stuff

### Dependencies
- ReactJS
- npm pdfjs package
- [https://github.com/agentcooper/react-pdf-annotator](https://github.com/agentcooper/react-pdf-annotator)
- Firebase Authentication & Realtime databases

## Contributing

## License
Coner Interactive Viewer is [MIT LICENSED](https://github.com/vliegenthart/coner_interactive_viewer/blob/master/LICENSE).