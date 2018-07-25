// @flow

import React, { Component } from "react";
import config from './config'

import type { T_LTWH } from "react-pdf-annotator/lib/types.js";

import "../style/Highlight.css";

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
      ratings,
      content,
      isScrolledTo,
      id,
    } = this.props;

    const { rects } = position;

    return (
      <div
        className={`Highlight ${isScrolledTo ? "Highlight--scrolledTo" : ""}`}
      >
        <div className={`Highlight__parts`} id={`highlight-${id}`}>
          {rects.map((rect, index) => (
            <div
              onMouseOver={onMouseOver}
              onMouseOut={onMouseOut}
              onClick={onClick}
              key={index}
              style={rect}
              className={`Highlight__part ${metadata ? metadata.type: ''} ${ metadata ? metadata.facet : ''}  ${content ? `entityText-${content.text}` : ''} ${ratings.length === config.facets.length ? 'Rated__highlight' : ''}`}
            />
          ))}
        </div>
      </div>
    );
  }
}

export default Highlight;
