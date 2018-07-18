// @flow

import React, { Component } from "react";
import ReactDom from "react-dom";

import { PDFJS } from "pdfjs-dist";

import "pdfjs-dist/web/pdf_viewer.css";
import "react-pdf-annotator/lib/style/pdf_viewer.css";

import "react-pdf-annotator/lib/style/PdfAnnotator.css";

import getBoundingRect from "react-pdf-annotator/lib/lib/get-bounding-rect";
import getClientRects from "react-pdf-annotator/lib/lib/get-client-rects";
import getAreaAsPng from "react-pdf-annotator/lib/lib/get-area-as-png";

import {
  getPageFromRange,
  getPageFromElement,
  findOrCreateContainerLayer
} from "react-pdf-annotator/lib/lib/pdfjs-dom";

import TextLayerBuilder_bindMouse from "react-pdf-annotator/lib/PDFJS/TextLayerBuilder_bindMouse";

import TipContainer from "react-pdf-annotator/lib/components/TipContainer";
import MouseSelection from "react-pdf-annotator/lib/components/MouseSelection";

import { scaledToViewport, viewportToScaled } from "react-pdf-annotator/lib/lib/coordinates";

import type {
  T_Position,
  T_ScaledPosition,
  T_Highlight,
  T_Scaled,
  T_LTWH,
  T_PDFJS_Viewer,
  T_PDFJS_Document,
  T_PDFJS_LinkService
} from "react-pdf-annotator/lib/types";

require("pdfjs-dist/web/pdf_viewer");

// @FIXME: hack
PDFJS.TextLayerBuilder.prototype._bindMouse = TextLayerBuilder_bindMouse;

PDFJS.disableWorker = true;

type T_ViewportHighlight<T_HT> = { position: T_Position } & T_HT;

type State<T_HT> = {
  ghostHighlight: ?{
    position: T_ScaledPosition
  },
  isCollapsed: boolean,
  range: ?Range,
  isMouseDown: boolean,
  tip: ?{
    highlight: T_ViewportHighlight<T_HT>,
    callback: (highlight: T_ViewportHighlight<T_HT>) => React$Element<*>
  },
  isAreaSelectionInProgress: boolean,
  scrolledToHighlightId: string
};

type Props<T_HT> = {
  highlightTransform: (
    highlight: T_ViewportHighlight<T_HT>,
    index: number,
    setTip: (
      highlight: T_ViewportHighlight<T_HT>,
      callback: (highlight: T_ViewportHighlight<T_HT>) => React$Element<*>
    ) => void,
    hideTip: () => void,
    viewportToScaled: (rect: T_LTWH) => T_Scaled,
    screenshot: (position: T_LTWH) => string,
    isScrolledTo: boolean
  ) => React$Element<*>,
  highlights: Array<T_HT>,
  onScrollChange: () => void,
  scrollRef: (scrollTo: (highlight: T_Highlight) => void) => void,
  pdfDocument: T_PDFJS_Document,
  onSelectionFinished: (
    position: T_ScaledPosition,
    content: { text?: string, image?: string },
    hideTipAndSelection: () => void,
    transformSelection: () => void
  ) => ?React$Element<*>,
  enableAreaSelection: (event: MouseEvent) => boolean
};

const CLICK_TIMEOUT = 300;
const EMPTY_ID = "empty-id";

let clickTimeoutId = 0;

class PdfAnnotator<T_HT: T_Highlight> extends Component<
  Props<T_HT>,
  State<T_HT>
> {
  state = {
    ghostHighlight: null,
    isCollapsed: true,
    range: null,
    scrolledToHighlightId: EMPTY_ID
  };

  state: State<T_HT>;
  props: Props<T_HT>;

  viewer = null;
  viewer: T_PDFJS_Viewer;
  linkService: T_PDFJS_LinkService;

  containerNode = null;
  containerNode: ?HTMLDivElement;

  componentWillReceiveProps(nextProps: Props<T_HT>) {
    if (this.props.highlights !== nextProps.highlights) {
      this.renderHighlights(nextProps);
    }
  }

  shouldComponentUpdate(prevProps, prevState, snapshot) {
    return prevProps.pdfDocument !== this.props.pdfDocument;
  }

  componentDidUpdate() {
    this.setupAndRenderPDFAnnotator()
  }

  componentDidMount() {
    this.setupAndRenderPDFAnnotator()
  }

  setupAndRenderPDFAnnotator() {
    const { pdfDocument } = this.props;

    this.linkService = new PDFJS.PDFLinkService();

    this.viewer = new PDFJS.PDFViewer({
      container: this.containerNode,
      enhanceTextSelection: true,
      removePageBorders: true,
      linkService: this.linkService
    });

    this.viewer.setDocument(pdfDocument);
    this.linkService.setDocument(pdfDocument);

    // debug
    window.PdfViewer = this;

    document.addEventListener("selectionchange", this.onSelectionChange);
    document.addEventListener("keydown", this.handleKeyDown);

    this.containerNode &&
      this.containerNode.addEventListener("pagesinit", () => {
        this.onDocumentReady();
      });

    this.containerNode &&
      this.containerNode.addEventListener(
        "textlayerrendered",
        this.onTextLayerRendered
      );
    this.containerNode &&
      this.containerNode.addEventListener("mousedown", this.onMouseDown);
  }

  componentWillUnmount() {
    document.removeEventListener("selectionchange", this.onSelectionChange);
    document.removeEventListener("keydown", this.handleKeyDown);

    this.containerNode &&
      this.containerNode.removeEventListener(
        "textlayerrendered",
        this.onTextLayerRendered
      );
    this.containerNode &&
      this.containerNode.removeEventListener("mousedown", this.onMouseDown);
  }

  findOrCreateHighlightLayer(page: number) {
    const textLayer = this.viewer.getPageView(page - 1).textLayer;

    if (!textLayer) {
      return null;
    }

    return findOrCreateContainerLayer(
      textLayer.textLayerDiv,
      "PdfAnnotator__highlight-layer"
    );
  }

  groupHighlightsByPage(
    highlights: Array<T_HT>
  ): { [pageNumber: string]: Array<T_HT> } {
    const { ghostHighlight } = this.state;

    return [...highlights, ghostHighlight]
      .filter(Boolean)
      .reduce((res, highlight) => {
        const { pageNumber } = highlight.position;

        res[pageNumber] = res[pageNumber] || [];
        res[pageNumber].push(highlight);

        return res;
      }, {});
  }

  showTip(highlight: T_ViewportHighlight<T_HT>, content: React$Element<*>) {
    const {
      isCollapsed,
      ghostHighlight,
      isMouseDown,
      isAreaSelectionInProgress
    } = this.state;

    const highlightInProgress = !isCollapsed || ghostHighlight;

    if (highlightInProgress || isMouseDown || isAreaSelectionInProgress) {
      return;
    }

    this.renderTipAtPosition(highlight.position, content);
  }

  scaledPositionToViewport({
    pageNumber,
    boundingRect,
    rects,
    usePdfCoordinates
  }: T_ScaledPosition): T_Position {
    const viewport = this.viewer.getPageView(pageNumber - 1).viewport;

    return {
      boundingRect: scaledToViewport(boundingRect, viewport, usePdfCoordinates),
      rects: (rects || []).map(rect =>
        scaledToViewport(rect, viewport, usePdfCoordinates)
      ),
      pageNumber
    };
  }

  viewportPositionToScaled({
    pageNumber,
    boundingRect,
    rects
  }: T_Position): T_ScaledPosition {
    const viewport = this.viewer.getPageView(pageNumber - 1).viewport;

    return {
      boundingRect: viewportToScaled(boundingRect, viewport),
      rects: (rects || []).map(rect => viewportToScaled(rect, viewport)),
      pageNumber
    };
  }

  screenshot(position: T_LTWH, pageNumber: number) {
    const canvas = this.viewer.getPageView(pageNumber - 1).canvas;

    return getAreaAsPng(canvas, position);
  }

  renderHighlights(nextProps?: Props<T_HT>) {
    const { highlightTransform, highlights } = nextProps || this.props;

    const { pdfDocument } = this.props;

    const { tip, scrolledToHighlightId } = this.state;

    const highlightsByPage = this.groupHighlightsByPage(highlights);

    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
      const highlightLayer = this.findOrCreateHighlightLayer(pageNumber);

      if (highlightLayer) {
        ReactDom.render(
          <div>
            {(highlightsByPage[String(pageNumber)] || []).map(
              (highlight, index) => {
                const { position, ...rest } = highlight;

                const viewportHighlight = {
                  position: this.scaledPositionToViewport(position),
                  ...rest
                };

                if (tip && tip.highlight.id === String(highlight.id)) {
                  this.showTip(tip.highlight, tip.callback(viewportHighlight));
                }

                const isScrolledTo = Boolean(
                  scrolledToHighlightId === highlight.id
                );

                return highlightTransform(
                  viewportHighlight,
                  index,
                  (highlight, callback) => {
                    this.setState({
                      tip: { highlight, callback }
                    });

                    this.showTip(highlight, callback(highlight));
                  },
                  this.hideTipAndSelection,
                  rect => {
                    const viewport = this.viewer.getPageView(pageNumber - 1)
                      .viewport;

                    return viewportToScaled(rect, viewport);
                  },
                  boundingRect => this.screenshot(boundingRect, pageNumber),
                  isScrolledTo
                );
              }
            )}
          </div>,
          highlightLayer
        );
      }
    }
  }

  hideTipAndSelection = () => {
    const tipNode = findOrCreateContainerLayer(
      this.viewer.viewer,
      "PdfAnnotator__tip-layer"
    );

    ReactDom.unmountComponentAtNode(tipNode);

    this.setState({ ghostHighlight: null, tip: null }, () =>
      this.renderHighlights()
    );
  };

  renderTipAtPosition(position: T_Position, inner: ?React$Element<*>) {

    const { boundingRect, pageNumber } = position;

    const page = {
      node: this.viewer.getPageView(pageNumber - 1).div
    };

    const pageBoundingRect = page.node.getBoundingClientRect();

    const tipNode = findOrCreateContainerLayer(
      this.viewer.viewer,
      "PdfAnnotator__tip-layer"
    );

    ReactDom.render(
      <TipContainer
        scrollTop={this.viewer.container.scrollTop}
        pageBoundingRect={pageBoundingRect}
        style={{
          left:
            page.node.offsetLeft + boundingRect.left + boundingRect.width / 2,
          top: boundingRect.top + page.node.offsetTop,
          bottom: boundingRect.top + page.node.offsetTop + boundingRect.height
        }}
        children={inner}
      />,
      tipNode
    );
  }

  onTextLayerRendered = () => {
    this.renderHighlights();
  };

  scrollTo = (highlight: T_Highlight) => {
    const { pageNumber, boundingRect, usePdfCoordinates } = highlight.position;

    this.viewer.container.removeEventListener("scroll", this.onScroll);

    const pageViewport = this.viewer.getPageView(pageNumber - 1).viewport;

    const scrollMargin = 10;

    this.viewer.scrollPageIntoView({
      pageNumber,
      destArray: [
        null,
        { name: "XYZ" },
        ...pageViewport.convertToPdfPoint(
          0,
          scaledToViewport(boundingRect, pageViewport, usePdfCoordinates).top -
            scrollMargin - pageViewport.height/4
        ),
        0
      ]
    });

    this.setState(
      {
        scrolledToHighlightId: highlight.id
      },
      () => this.renderHighlights()
    );

    // wait for scrolling to finish
    setTimeout(() => {
      this.viewer.container.addEventListener("scroll", this.onScroll);
    }, 100);
  };

  onDocumentReady = () => {
    const { scrollRef } = this.props;

    this.viewer.currentScaleValue = "auto";

    scrollRef(this.scrollTo);
  };

  onSelectionChange = () => {
    const selection: Selection = window.getSelection();

    if (selection.isCollapsed) {
      this.setState({ isCollapsed: true });
      return;
    }

    const range = selection.getRangeAt(0);

    if (!range) {
      return;
    }

    this.setState({
      isCollapsed: false,
      range
    });
  };

  onScroll = () => {
    const { onScrollChange } = this.props;

    onScrollChange();

    this.setState(
      {
        scrolledToHighlightId: EMPTY_ID
      },
      () => this.renderHighlights()
    );

    this.viewer.container.removeEventListener("scroll", this.onScroll);
  };

  onMouseDown = (event: MouseEvent) => {
    if (!(event.target instanceof HTMLElement)) {
      return;
    }

    if (event.target.closest(".PdfAnnotator__tip-container")) {
      return;
    }

    this.hideTipAndSelection();

    // let single click go through
    clickTimeoutId = setTimeout(
      () => this.setState({ isMouseDown: true }),
      CLICK_TIMEOUT
    );
  };

  handleKeyDown = (event: KeyboardEvent) => {
    if (event.code === "Escape") {
      this.hideTipAndSelection();
    }
  };

  onMouseUp = () => {
    clearTimeout(clickTimeoutId);
    this.setState({ isMouseDown: false });

    const { onSelectionFinished } = this.props;

    const { isCollapsed, range } = this.state;

    if (!range || isCollapsed) {
      return;
    }

    const page = getPageFromRange(range);

    if (!page) {
      return;
    }

    const rects = getClientRects(range, page.node);

    if (rects.length === 0) {
      return;
    }

    const boundingRect = getBoundingRect(rects);

    const viewportPosition = { boundingRect, rects, pageNumber: page.number };

    const content = {
      text: range.toString()
    };

    const scaledPosition = this.viewportPositionToScaled(viewportPosition);

    this.renderTipAtPosition(
      viewportPosition,
      onSelectionFinished(
        scaledPosition,
        content,
        () => this.hideTipAndSelection(),
        () =>
          this.setState(
            {
              ghostHighlight: { position: scaledPosition }
            },
            () => this.renderHighlights()
          )
      )
    );
  };

  toggleTextSelection(flag: boolean) {
    this.viewer.viewer.classList.toggle(
      "PdfAnnotator--disable-selection",
      flag
    );
  }

  render() {
    const { onSelectionFinished, enableAreaSelection } = this.props;

    return (
      <div
        ref={node => (this.containerNode = node)}
        onMouseUp={() => setTimeout(this.onMouseUp, 0)}
        className="PdfAnnotator"
      >
        <div className="pdfViewer" />
        {typeof enableAreaSelection === "function" ? (
          <MouseSelection
            onDragStart={() => this.toggleTextSelection(true)}
            onDragEnd={() => this.toggleTextSelection(false)}
            onChange={isVisible =>
              this.setState({ isAreaSelectionInProgress: isVisible })
            }
            shouldStart={event =>
              enableAreaSelection(event) &&
              event.target instanceof HTMLElement &&
              Boolean(event.target.closest(".page"))
            }
            onSelection={(startTarget, boundingRect, resetSelection) => {
              const page = getPageFromElement(startTarget);

              if (!page) {
                return;
              }

              const pageBoundingRect = {
                ...boundingRect,
                top: boundingRect.top - page.node.offsetTop,
                left: boundingRect.left - page.node.offsetLeft
              };

              const viewportPosition = {
                boundingRect: pageBoundingRect,
                rects: [],
                pageNumber: page.number
              };

              const scaledPosition = this.viewportPositionToScaled(
                viewportPosition
              );

              const image = this.screenshot(pageBoundingRect, page.number);

              this.renderTipAtPosition(
                viewportPosition,
                onSelectionFinished(
                  scaledPosition,
                  { image },
                  () => this.hideTipAndSelection(),
                  () =>
                    this.setState(
                      {
                        ghostHighlight: {
                          position: scaledPosition,
                          content: { image }
                        }
                      },
                      () => {
                        resetSelection();
                        this.renderHighlights();
                      }
                    )
                )
              );
            }}
          />
        ) : null}
      </div>
    );
  }
}

export default PdfAnnotator;
