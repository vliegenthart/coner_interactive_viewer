// @flow

// Local development react-pdf-annotator: npm link ../../coner_v2/custom_npm_packages/react-pdf-annotator

import React, { Component } from "react";
import AuthUserContext from './AuthUserContext';

import { db } from '../firebase';
import withAuthorization from './withAuthorization';

import PdfLoader from "./PdfLoader";
import PdfAnnotator from "./PDFAnnotator";
import HighlightTip from "./HighlightTip"
import RatingTip from "./RatingTip"
import Highlight from "./Highlight"
import Popup from "./Popup"

import Spinner from "./Spinner";
import Sidebar from "./Sidebar";
import { snapshotToArray, getNextId } from '../utility/utilFunctions'

import type { T_Highlight, T_NewHighlight } from "react-pdf-annotator/types";

import "../style/App.css";
import config from './config';

type T_ManuscriptHighlight = T_Highlight;

type Props = {};

type State = {
  highlights: Array<T_ManuscriptHighlight>
};

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

    this.state = {
      highlights: [],
      newHighlightId: null
    };
  }

  generateURL = () => {
    const { pid } = this.props
    const url = `/pdf/${pid}.pdf`;
    // const searchParams = new URLSearchParams(window.location.search);
    // const url = searchParams.get("url") || DEFAULT_URL;

    return url
  };

  resetHighlights = () => {
    this.setState({
      highlights: [],
      newhighlightId: null,
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

    // document.getElementsByClassName("pdfViewer")[0].click()
  }

  // Load highlights from firebase database
  getHighlightsByPid(pid: string) {
    db.onceGetHighlights(pid)
    .then((snapshot) => {
      const highlights = snapshot.val() ? snapshotToArray(snapshot.val()) : []
      this.setState(() => ({ highlights: highlights, newHighlightId: null }));
    })
    .catch(error => {
      console.log('Error:', error);
    });
  }

  getHighlightById(id: string) {
    const { highlights } = this.state;

    return highlights.find(highlight => highlight.id === id);
  }

  // Create highlight in Firebase database + reward OST user
  addHighlight(highlight: T_NewHighlight, uid: String) {

    const { highlights } = this.state;
    const { pid, user, contentCreator, rewardUser } = this.props;
    const id = getNextId()
    const timestamp = Math.round((new Date()).getTime() / 1000)
    rewardUser(contentCreator, user, "RewardHighlight")

    highlight.metadata = { ...highlight.metadata, timestamp: timestamp, type: 'selected' };
    highlight.pid = pid
    highlight.uid = uid

    db.doCreateHighlight(id, highlight)
    .then(data => {
      console.log(`Added highlight (id: ${id}) to Firebase database`)
      this.setState(() => ({
        highlights: [{ ...highlight, id: id }, ...highlights],
        newHighlightId: id
      }));

      const rating = { timestamp: timestamp, type: 'occurrence', entityText: highlight.content.text, relevance: 'relevant', facet: highlight.metadata.facet, pageNumber: highlight.position.pageNumber, highlightType: highlight.metadata.type, highlightId: id, pid: pid, uid: uid, version: 1}
    
      let rating2 = null

      const oppFacet = rating.facet === 'dataset' ? 'method' : 'dataset'
      const oppRelevance = rating.relevance === 'relevant' ? 'irrelevant' : 'relevant'
      rating2 = { timestamp: timestamp, type: 'occurrence', entityText: highlight.content.text, relevance: oppRelevance, facet: oppFacet, pageNumber: highlight.position.pageNumber, highlightType: highlight.metadata.type, highlightId: id, pid: pid, uid: uid, version: 1}

      this.props.addRating(rating, rating2)
    })
    .catch(error => {
      console.log('Error:', error);
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
    const { highlights, newHighlightId } = this.state;
    const { pid, addRating, getRatingsForHighlight, switchPaper } = this.props;
    const url = this.generateURL()

    return (
      <div className="Paper__viewer" id="Paper__viewer1" style={{ display: "flex", height: "100vh" }}>
        <Sidebar
          highlights={highlights}
          switchPaper={switchPaper}
          getRatingsForHighlight={getRatingsForHighlight}
        />
        <div
          style={{
            height: "calc(100% - 64px)",
            width: "75vw",
            overflowY: "hidden",
            top: "64px",
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
                        content={content}
                        onConfirm={(entityText, metadata) => {
                          content.text = entityText
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
                      const ratingsForHighlight = getRatingsForHighlight(pid, highlight, authUser.uid) 
                      
                      const component =
                        <Highlight
                          isScrolledTo={isScrolledTo}
                          position={highlight.position}
                          metadata={highlight.metadata}
                          content={highlight.content}
                          type={highlight.type}
                          ratings={ratingsForHighlight}
                          id={highlight.id}
                          isNewHighlight={newHighlightId == highlight.id}
                        />

                      return (
                        <Popup
                          popupContent={
                            <RatingTip
                              onopen={null}
                              addRating={addRating}
                              highlight={highlight}
                              authUser={authUser}
                              ratings={ratingsForHighlight}
                              onClose={() => { 
                                hideTip();
                              }}
                            />
                          }
                          onClick={popupContent =>
                            setTip(highlight, highlight => popupContent)
                          }
                          isScrolledTo={isScrolledTo}
                          highlight={highlight}
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
