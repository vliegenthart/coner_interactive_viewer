// @flow

// Local development react-pdf-annotator: npm link ../../coner_v2/custom_npm_packages/react-pdf-annotator

import React, { Component } from "react";
import URLSearchParams from "url-search-params";
import AuthUserContext from './AuthUserContext';

import { auth, db } from '../firebase';
import withAuthorization from './withAuthorization';
import * as ost from '../ost/ost-client';

import { PdfLoader } from "react-pdf-annotator";

import PdfAnnotator from "./PDFAnnotator";

import HighlightTip from "./HighlightTip"
import RatingTip from "./RatingTip"

import Highlight from "./Highlight"
import Popup from "./Popup"
import Feedback from "./Feedback"

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

// const DEFAULT_URL = 'https://arxiv.org/pdf/1203.0057.pdf'; 

const papers = [
    "coner",
    "conf_icwsm_BandariAH12",
    "conf_trec_BellotCEGL02",
  ]

const defaultPaper = papers[2]
const DEFAULT_URL = `pdf/${defaultPaper}.pdf`;

const searchParams = new URLSearchParams(window.location.search);
const url = searchParams.get("url") || DEFAULT_URL;
const pid = defaultPaper

class PdfViewer extends Component<Props, State> {
  state = {
    user: null,
    pid: pid,
    highlights: [],
    ratings: []
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
    db.onceGetHighlights(pid)
    .then((snapshot) => {
      const highlights = snapshotToArray(snapshot.val())
      if (highlights.length > 0) {

        this.setState(() => ({ highlights: highlights }));
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

  // Create highlight in Firebase database + reward OST user
  addHighlight(highlight: T_NewHighlight, uid: String) {

    const { user, pid, highlights, ratings } = this.state;
    const id = getNextId()
    const timestamp = Math.round((new Date()).getTime() / 1000)

    this.rewardUser(user, uid, "RewardHighlight")

    highlight.metadata = { ...highlight.metadata, timestamp: timestamp, type: 'selected' };
    highlight = { ...highlight, pid: pid, uid: uid};

    db.doCreateHighlight(id, highlight)
    .then(data => {
      console.log(`Added highlight (id: ${id}) to Firebase database`)
      this.setState({
        highlights: [{ ...highlight, id: id }, ...highlights]
      });
    })
    .catch(error => {
      console.log('Error', error);
    });

    const rating = { timestamp: timestamp, type: 'occurrence', entityText: highlight.content.text, relevant: 'relevant', facet: highlight.metadata.facet, pageNumber: highlight.position.pageNumber, highlightType: highlight.metadata.type, highlightId: id, pid: pid, uid: uid}
    this.addRating(highlight, rating)
  }

  // Create rating in Firebase database + reward OST user
  addRating(highlight, rating) {
    const { user, pid, highlights, ratings } = this.state;
    const timestamp = Math.round((new Date()).getTime() / 1000)
    const id = getNextId()
    const uid = rating.uid

    rating.timestamp = timestamp

    this.rewardUser(user, uid, "RewardRating")
    db.doCreateRating(id, rating)
    .then(data => {
      console.log(`Added rating (id: ${id}) to Firebase database`)
      this.setState({
        ratings: [{ ...rating, id: id }, ...ratings]
      });
    })
    .catch(error => {
      console.log('Error', error);
    });
  }

  rewardUser(user, uid, type) {
    if (user && uid === user.uid) {
      ost.rewardUser(user, type)
    }
    else {
      db.onceGetUser(uid).then(snapshot => {
        this.setState({ user: { ...snapshot.val(), uid } })
        
        ost.rewardUser(snapshot.val(), type)
        }
      );
    }

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
    const { pid, highlights } = this.state;

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
                      <HighlightTip
                        onOpen={transformSelection}
                        compact={true}
                        rating={false}
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
                      isScrolledTo
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
                          popupContent={
                            // <Feedback {...highlight} />
                            <RatingTip
                              onopen={null}
                              onConfirm={metadata => {

                                // RELEVANCE IS PLACEHOLDER
                                const id = getNextId()
                                const rating = { type: 'occurrence', entityText: highlight.content.text, relevant: 'relevant', facet: highlight.metadata.facet, pageNumber: highlight.position.pageNumber, highlightType: highlight.metadata.type, highlightId: id, pid: pid, uid: authUser.uid}

                                this.addRating(highlight, rating);

                                hideTip();
                              }}
                              compact={false}
                              rating={true}
                            />
                          }
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
