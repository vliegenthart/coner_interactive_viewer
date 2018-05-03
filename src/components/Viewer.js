// @flow

// Local development react-pdf-annotator: npm link ../../coner_v2/custom_npm_packages/react-pdf-annotator

import React, { Component } from "react";
import AuthUserContext from './AuthUserContext';

import { auth, db } from '../firebase';
import withAuthorization from './withAuthorization';
import * as ost from '../ost/ost-client';

import PdfLoader from "./PdfLoader";

import PdfAnnotator from "./PDFAnnotator";

import HighlightTip from "./HighlightTip"
import RatingTip from "./RatingTip"

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

class PdfViewer extends Component<Props, State> {
  constructor(props) {
    super(props);
    this.generateURL = this.generateURL.bind(this);
    this.resetHighlights = this.resetHighlights.bind(this);
    this.scrollViewerTo = this.scrollViewerTo.bind(this);
    this.scrollToHighlightFromHash = this.scrollToHighlightFromHash.bind(this);
    this.getHighlightsByPid = this.getHighlightsByPid.bind(this);
    this.getHighlightById = this.getHighlightById.bind(this);
    this.addHighlight = this.addHighlight.bind(this);
    this.updateHighlight = this.updateHighlight.bind(this);
    this.addRating = this.addRating.bind(this);

    this.state = {
      highlights: [],
      ratings: []
    };
  }

  generateURL = () => {
    const { pid } = this.props
    const url = `pdf/${pid}.pdf`;
    // const searchParams = new URLSearchParams(window.location.search);
    // const url = searchParams.get("url") || DEFAULT_URL;

    return url
  };

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

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { pid } = this.props

    if (prevProps.pid !== pid) this.getHighlightsByPid(pid)
  }

  componentDidMount() {
    const { pid } = this.props
    this.getHighlightsByPid(pid)

    window.addEventListener(
      "hashchange",
      this.scrollToHighlightFromHash,
      false
    );
  }

  // Load highlights from firebase database
  getHighlightsByPid(pid: string) {
    db.onceGetHighlights(pid)
    .then((snapshot) => {
      const highlights = snapshot.val() ? snapshotToArray(snapshot.val()) : []
      this.setState(() => ({ highlights: highlights }));
    })
    .catch(error => {
      console.log('Error', error);
    });
  }

  getHighlightById(id: string) {
    const { highlights } = this.state;

    return highlights.find(highlight => highlight.id === id);
  }

  // Create highlight in Firebase database + reward OST user
  addHighlight(highlight: T_NewHighlight, uid: String) {

    const { highlights } = this.state;
    const { pid, user } = this.props;
    const id = getNextId()
    const timestamp = Math.round((new Date()).getTime() / 1000)

    this.props.rewardUser(user, uid, "RewardHighlight")

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

  // Create rating in Firebase database + reward OST user
  addRating(highlight, rating) {
    const { pid, highlights, ratings } = this.state;
    const { user } = this.props;
    const timestamp = Math.round((new Date()).getTime() / 1000)
    const id = getNextId()
    const uid = rating.uid

    rating.timestamp = timestamp

    this.props.rewardUser(user, uid, "RewardRating")

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

  render() {
    const { highlights } = this.state;
    const { pid } = this.props;
    const url = this.generateURL()

    return (
      <div className="Paper__viewer" id="Paper__viewer1" style={{ display: "flex", height: "100vh" }}>
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
          <PdfLoader url={url} beforeLoad={<Spinner />} >
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
                            <RatingTip
                              onopen={null}
                              onConfirm={metadata => {

                                // RELEVANCE IS PLACEHOLDER
                                const id = getNextId()
                                const rating = { type: 'occurrence', entityText: highlight.content.text, relevant: 'relevant', facet: highlight.metadata.facet, pageNumber: highlight.position.pageNumber, highlightType: highlight.metadata.type, highlightId: id, pid: pid, uid: authUser.uid}

                                this.addRating(highlight, rating);

                                hideTip();
                              }}
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
