// @flow

import { Component } from "react";

import type { T_PDFJS_Document } from "../types";

import { PDFJS } from "pdfjs-dist";

type Props = {
  url: string,
  beforeLoad: React$Element<*>,
  children: (pdfDocument: T_PDFJS_Document) => React$Element<*>
};

type State = {
  pdfDocument: ?T_PDFJS_Document
};

class PdfLoader extends Component<Props, State> {
  
  constructor(props) {
    super(props);
    this.loadPDF = this.loadPDF.bind(this);

    this.state = {
      pdfDocument: null   
    };
  }

  componentDidMount() {
    this.loadPDF()
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.url !== this.props.url) {
      this.loadPDF()
    }
  }

  loadPDF() {
    const { url } = this.props;

    PDFJS.getDocument(url).then(pdfDocument => {
      console.log(`Fetched PDF from url ${url}`)

      this.setState({
        pdfDocument: pdfDocument
      });
    });
  }

  render() {
    const { children, beforeLoad } = this.props;
    const { pdfDocument } = this.state;

    if (pdfDocument) return children(pdfDocument);

    return beforeLoad;
  }
}

export default PdfLoader;
