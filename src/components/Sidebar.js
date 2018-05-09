// @flow

import React from "react";

import type { T_Highlight } from "react-pdf-annotator/types";
import { sortBy } from 'lodash';

type T_ManuscriptHighlight = T_Highlight;

type Props = {
  highlights: Array<T_ManuscriptHighlight>,
  resetHighlights: () => void
};

const updateHash = highlight => {
  window.location.hash = `highlight-${highlight.id}`;
};

function Sidebar({ highlights, resetHighlights }: Props) {
  return (
    <div className="sidebar" style={{ width: "25vw" }}>
      <div className="description" style={{ padding: "1rem" }}>
        <h3>Categories</h3>
        <ul>
          <li>Dataset: Blue</li>
          <li>Method: Pink</li>
          <li>Both: Purple</li>
        </ul>
      </div>

      <hr />

      <ul className="sidebar__highlights">
        {sortBy(highlights, ['position.pageNumber', 'position.boundingRect.y1', 'position.boundingRect.x1']).map((highlight, index) => (
          <li
            key={index}
            className="sidebar__highlight"
            onClick={() => {
              updateHash(highlight);
            }}
          >
            <div>
              <strong>{highlight.metadata.facet}</strong>
              {highlight.content.text ? (
                <blockquote style={{ marginTop: "0.5rem" }}>
                  {`${highlight.content.text}`}
                </blockquote>
              ) : null}
              {highlight.content.image ? (
                <div
                  className="highlight__image"
                  style={{ marginTop: "0.5rem" }}
                >
                  <img src={highlight.content.image} alt={"Screenshot"} />
                </div>
              ) : null}
            </div>
            <div className="highlight__location">
              Page {highlight.position.pageNumber}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;
