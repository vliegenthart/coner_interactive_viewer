// @flow

import React, { Component } from "react";

import "../style/Highlight.css";

import type { T_LTWH } from "react-pdf-annotator/lib/types.js";

type Props = {
  position: {
    boundingRect: T_LTWH,
    rects: Array<T_LTWH>
  },
  onClick?: () => void,
  onMouseOver?: () => void,
  onMouseOut?: () => void,
  metadata: {
    facet: string,
    text: string,
    type: string
  },
  isScrolledTo: boolean,
};

class Highlight extends Component<Props> {
  render() {
    const {
      position,
      onClick,
      onMouseOver,
      onMouseOut,
      metadata,
      isScrolledTo,
    } = this.props;

    const { rects } = position;

    return (
      <div
        className={`Highlight ${isScrolledTo ? "Highlight--scrolledTo" : ""}`}
      >
        <div className={`Highlight__parts`}>
          {rects.map((rect, index) => (
            <div
              onMouseOver={onMouseOver}
              onMouseOut={onMouseOut}
              onClick={onClick}
              key={index}
              style={rect}
              className={`Highlight__part ${metadata ? metadata.type: ''} ${ metadata ? metadata.facet: ''}`}
            />
          ))}
        </div>
      </div>
    );
  }
}

export default Highlight;
