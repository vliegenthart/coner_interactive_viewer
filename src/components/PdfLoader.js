// @flow

import React, { Component } from "react";

import type { T_PDFJS, T_PDFJS_Document } from "../types";

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
      pdfDocument: null,
      paperSwitched: this.props.paperSwitched
   };
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   console.log(nextProps.url, this.props.url, !(nextProps.url === this.props.url))
  //   return this.state.pdfDocument && !(nextProps.url === this.props.url);
  // }

  componentDidMount() {
    this.loadPDF()
  }

  // componentDidUpdate(prevProps, prevState, snapshot) {
  //   if (this.props.paperSwitched && !prevProps.paperSwitched) this.setState({paperSwitched: this.props.paperSwitched})

  //   if (!this.state.paperSwitched) return

  //   if (this.state.paperSwitched) {
  //     this.loadPDF()
  //     this.setState({ paperSwitched: false })
  //   }
  //   console.log(this.state.paperSwitched, this.props.paperSwitched)
  //   // console.log(prevProps.paperSwitched, this.props.paperSwitched)
  //   // if (prevProps.paperSwitched) this.loadPDF()
  // }

  loadPDF() {
    const { url } = this.props;

    console.log("LOAD PDF")

    PDFJS.getDocument(url).then(pdfDocument => {
      this.setState({
        pdfDocument: pdfDocument,
        paperSwitched: false
      });
    });
  }


  // componentDidUpdate() {
  //   const { url } = this.props;

  //     PDFJS.getDocument(url).then(pdfDocument => {
  //       this.setState({
  //         pdfDocument: pdfDocument
  //       });
  //     });
    
  // }

  render() {
    const { children, beforeLoad, paperSwitched } = this.props;
    const { pdfDocument } = this.state;
    // console.log(pdfDocument)

    if (pdfDocument) return children(pdfDocument);

    return beforeLoad;
  }
}

export default PdfLoader;
