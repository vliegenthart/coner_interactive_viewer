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
  comment: {
    facet: string,
    text: string
  },
  isScrolledTo: boolean,
  type: string
};

class Highlight extends Component<Props> {
  render() {
    const {
      position,
      onClick,
      onMouseOver,
      onMouseOut,
      comment,
      isScrolledTo,
      type
    } = this.props;

    const { rects, boundingRect } = position;

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
              className={`Highlight__part ${type} ${ comment ? comment.facet: ''}`}
            />
          ))}
        </div>
      </div>
    );
  }
}

export default Highlight;
