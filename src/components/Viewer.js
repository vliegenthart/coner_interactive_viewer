// @flow

// Local development react-pdf-annotator: npm link ../../coner_v2/custom_npm_packages/react-pdf-annotator


// TODO
// - Load highlights from firebase!
// - Secure admin page for only admin (ADMIN role on normal user DB)
// - READ OST RULES/signup
// - Create REAL token economy
// - Simpler feedback mode: click on highlight and scroll to sidebar to give feedback
// - Clean up GitHub epo (remove all highlight files)
// - Update styling

import React, { Component } from "react";
import URLSearchParams from "url-search-params";
import AuthUserContext from './AuthUserContext';

import { auth, db } from '../firebase';
import withAuthorization from './withAuthorization';
import * as ost from '../ost/ost-client';

import { PdfLoader } from "react-pdf-annotator";

import PdfAnnotator from "./PDFAnnotator";

import Tip from "./Tip"
import Highlight from "./Highlight"
import Popup from "./Popup"

import Spinner from "./Spinner";
import Sidebar from "./Sidebar";

import type { T_Highlight, T_NewHighlight } from "react-pdf-annotator/types";

import "../style/App.css";

type T_ManuscriptHighlight = T_Highlight;

type Props = {};

type State = {
  highlights: Array<T_ManuscriptHighlight>
};

const getNextId = () => String(1000000000 + Math.floor(Math.random() * 9000000000));

const snapshotToArray = snapshot => Object.entries(snapshot).map(e => Object.assign(e[1], { id: e[0] }));

const parseIdFromHash = () => window.location.hash.slice("#highlight-".length);

const resetHash = () => {
  window.location.hash = "";
};

const HighlightPopup = ({ metadata }) =>
  metadata.facet ? (
    <div className="Highlight__popup">
      {metadata.facet}
    </div>
  ) : null;

// const DEFAULT_URL = 'https://arxiv.org/pdf/1203.0057.pdf'; 

const papers = [
    "coner.pdf",
    "conf_icwsm_BandariAH12.pdf",
    "conf_trec_BellotCEGL02.pdf",
  ]

const DEFAULT_URL = `pdf/${papers[2]}`;

const searchParams = new URLSearchParams(window.location.search);
const url = searchParams.get("url") || DEFAULT_URL;
const pid = url.split("/")[1]

class PdfViewer extends Component<Props, State> {
  state = {
    user: null,
    pid: pid,
    highlights: [],
    allHighlights: []
  };

  state: State;

  resetHighlights = () => {
    this.setState({
      highlights: []
    });
  };

  scrollViewerTo = (highlight: any) => {};

  scrollToHighlightFromHash = () => {
    const highlight = this.getHighlightById(parseIdFromHash());

    if (highlight) {
      this.scrollViewerTo(highlight);
    }
  };

  componentWillMount() {

    // Load highlights from firebase database
    db.onceGetHighlights()
    .then((snapshot) => {
      const highlights = snapshotToArray(snapshot.val())
      if (highlights.length > 0) {

        this.setState(() => ({ allHighlights: highlights, highlights: highlights.filter(highlight => highlight.pid === pid) }));
      }
    })
    .catch(error => {
      console.log('Error', error);
    });
  }

  componentDidMount() {
    window.addEventListener(
      "hashchange",
      this.scrollToHighlightFromHash,
      false
    );
  }

  getHighlightById(id: string) {
    const { highlights } = this.state;

    return highlights.find(highlight => highlight.id === id);
  }

  addHighlight(highlight: T_NewHighlight, uid: String) {

    const { user, pid, highlights } = this.state;
    const id = getNextId()
    const timestamp = Math.round((new Date()).getTime() / 1000)

    // Reward OST user for adding highlight
    if (user && uid === user.uid) {
      ost.rewardUser(user)
    }
    else {
      db.onceGetUser(uid).then(snapshot => {
        this.setState({ user: { ...snapshot.val(), uid } })
        
        ost.rewardUser(snapshot.val())
        }
      );
    }

    // Create highlight in Firebase database
    highlight.metadata = { ...highlight.metadata, timestamp: timestamp, type: 'selected' };
    highlight = { ...highlight, pid: pid, uid: uid};

    db.doCreateHighlight(id, highlight)
    .then(data => {
      console.log(`Added highlight (${id}) to db`)
      this.setState({
        highlights: [{ ...highlight, id: id }, ...highlights]
      });
    })
    .catch(error => {
      console.log('Error', error);
    });
  }

  updateHighlight(highlightId: string, position: Object, content: Object) {
    console.log("Updating highlight", highlightId, position, content);

    this.setState({
      highlights: this.state.highlights.map(h => {
        return h.id === highlightId
          ? {
              ...h,
              position: { ...h.position, ...position },
              content: { ...h.content, ...content }
            }
          : h;
      })
    });
  }

  render() {
    const { highlights } = this.state;

    return (
      <div className="App" style={{ display: "flex", height: "100vh" }}>
        <Sidebar
          highlights={highlights}
          resetHighlights={this.resetHighlights}
        />
        <div
          style={{
            height: "100vh",
            width: "75vw",
            overflowY: "scroll",
            position: "relative"
          }}
        >
          <PdfLoader url={url} beforeLoad={<Spinner />}>
            {pdfDocument => (
              <AuthUserContext.Consumer>
                {authUser =>
                  <PdfAnnotator
                    pdfDocument={pdfDocument}
                    enableAreaSelection={event => event.altKey}
                    onScrollChange={resetHash}
                    scrollRef={scrollTo => {
                      this.scrollViewerTo = scrollTo;

                      this.scrollToHighlightFromHash();
                    }}
                    url={url}
                    onSelectionFinished={(
                      position,
                      content,
                      hideTipAndSelection,
                      transformSelection
                    ) => (
                      <Tip
                        onOpen={transformSelection}
                        onConfirm={metadata => {
                          this.addHighlight({ content, position, metadata }, authUser.uid);

                          hideTipAndSelection();
                        }}
                      />
                    )}
                    highlightTransform={(
                      highlight,
                      index,
                      setTip,
                      hideTip,
                      viewportToScaled,
                      screenshot,
                      isScrolledTo,
                      renderTipAtPosition
                    ) => {
  
                      const component =
                        <Highlight
                          isScrolledTo={isScrolledTo}
                          position={highlight.position}
                          metadata={highlight.metadata}
                          type={highlight.type}
                        />

                      return (
                        <Popup
                          popupContent={<HighlightPopup {...highlight} />}
                          onClick={popupContent => 
                            setTip(highlight, highlight => popupContent)
                          }
                          onMouseOut={hideTip}
                          key={index}
                          children={component}
                        />
                      );
                    }}
                    highlights={highlights}
                  />
                }
              </AuthUserContext.Consumer>
            )}
          </PdfLoader>
        </div>
      </div>
    );
  }
}

const authCondition = (authUser) => !!authUser;

export default withAuthorization(authCondition)(PdfViewer);