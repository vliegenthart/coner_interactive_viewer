# Coner Interactive Document Viewer (CIDV)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![GitHub release](https://img.shields.io/github/release/vliegenthart/coner_interactive_viewer.svg)](https://github.com/vliegenthart/coner_interactive_viewer/releases)



CIDV is an online, interactive document viewer that visualises relevant technical terms in scientific publications. It creates an environment that gives a concise overview of technical terms/entities/keywords of different categories, like datasets and methods, that appear in the publications. CIDV's main usecase is to enable users to rate the quality of automatically classified technical terms (with regards to relevance to each category, e.g. dataset or method) and to select new technical terms by highlighting them.

Demo of the Coner viewer is live at [https://coner-viewer.herokuapp.com/signup](https://coner-viewer.herokuapp.com/signup).

## Coner Collaborative NER Pipeline
Named Entity Recognition (NER) for rare long-tail entities as e.g., often found in domain-specific scientific publications is a challenging task, as typically the extensive training data and test data for fine-tuning NER algorithms is lacking. Recent approaches presented promising solutions relying on training NER algorithms in a iterative distantly-supervised fashion, thus limiting human interaction to only providing a small set of seed terms. Such approaches heavily rely on heuristics in order to cope with the limited training data size. As these heuristics are prone to failure, the overall achievable performance is limited. In this paper, we therefore introduce a collaborative approach which incrementally incorporates human feedback on the relevance of extracted entities into the training cycle of such iterative NER algorithms. This approach, called Coner, allows to still train new domain specific rare long-tail NER extractors with low costs, but with ever increasing performance while the algorithm is actively used. 

Coner consists of 3 modules, namely the [Coner Document Analyser (CDA)](https://github.com/vliegenthart/coner_document_analyser), Coner Interactive Document Viewer (CIDV) and [Coner Feedback Analyser (CFA)](https://github.com/vliegenthart/coner_feedback_analyser). Module 1 (CDA) generates a candidate set of publications to receive feedback on in CIDV, by analysing publications from the corpus and rank them according to features like number of times paper has been cited, number of distinct automatically extracted entities for each category and availability of PDF. Module 2 (CIDV) visualizes the extracted entities and allows users to both give feedback on categorical relevance and select new relevant entities. Finally, module 3 (CFA) analyses the given feedback and generates a list of entities for each category with metadata like relevance score, amount of feedback, etc. This final output can be utilized by the NER algorithm to improve the expansion and filtering step of it's training cycle for the next iteration.

You can read more about CIDV and the Coner pipeline in the [Coner Collaborative NER paper](https://github.com/vliegenthart/coner_interactive_viewer/blob/master/public/pdf/coner.pdf).

## Dependencies
CIDV is built in [React](https://github.com/facebook/react) with extensibility in mind; if you are familiar with React you can extend, replace or add React components to customize features of Coner. It's based on the [react-pdf-annotator](https://github.com/agentcooper/react-pdf-annotator) React project, which itself is built using [PDF.js](https://github.com/mozilla/pdf.js).

[Node](https://github.com/nodejs/node) and [npm](https://github.com/npm/npm) are required to install the dependencies and run the local server.

## Local Development
The following steps are needed to run CIDV locally in development mode:
- Copy `src/highlights/demo-term-highlightlights.js` to `src/highlights/term-highlights.js` and `src/highlights/demo-papers-list.js` to `src/highlights/papers-list.js`. 
- CIDV uses Firebase for it's authentication system and database storage. Create a [Firebase Project](https://firebase.google.com/), copy the contents from `src/firebase/demo-config.js` to `src/firebase/config.js` and copy the configuration values from your online Firebase Console to the local config file.
- Run `npm install`.
- Run `npm start`, wait for the project to build and open `http://localhost:3000`.
- Signup for a CIDV account.
- Go to `http://localhost:3000/admin` and click the `Sync highlights with Firebase database` button.
- Now you're all set to go and use the viewer to view, rate and select highlights!

## Contributing
Please feel free to contribute to the project by forking or creating a custom branch with a pull request. You can contact me on with any question, suggestions or other inquiries.

## License
Coner Interactive Viewer is [MIT LICENSED](https://github.com/vliegenthart/coner_interactive_viewer/blob/master/LICENSE).