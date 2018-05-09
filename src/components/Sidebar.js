// @flow

import React, { Component } from "react";

import config from './config'
import colors from '../style/Colors'

import type { T_Highlight } from "react-pdf-annotator/types";
import AuthUserContext from './AuthUserContext';
import { sortBy } from 'lodash';

import PropTypes from 'prop-types';
import Button from 'material-ui/Button';
import { withStyles } from 'material-ui/styles';

import "../style/Sidebar.css";


type T_ManuscriptHighlight = T_Highlight;

type Props = {
  highlights: Array<T_ManuscriptHighlight>,
  resetHighlights: () => void
};

const styles = theme => ({
  buttonRandomPaper: {
    width: '100%',
    backgroundColor: colors.primary,
    color: colors.logoText,
    '&:hover': {
      backgroundColor: colors.primaryDarken,
    }
  }
});

const updateHash = highlight => {
  window.location.hash = `highlight-${highlight.id}`;
};

class Sidebar extends Component<Props, State> {

  constructor(props) {
    super(props);

    this.handlePaperChange = this.handlePaperChange.bind(this)
  }

  handlePaperChange = (uid) => {
    this.props.switchPaper('pid', config.papersList[Math.floor(Math.random()*config.papersList.length)]['pid'], uid)
  }

  render() {
    const { highlights, resetHighlights, classes } = this.props;

    return (

      <AuthUserContext.Consumer>
        {authUser =>
          <div className="sidebar" style={{ width: "25vw" }}>
            <div className="description" style={{ padding: "1rem" }}>
            <Button value="randomPaper" onClick={() => this.handlePaperChange(authUser.uid)} className={classes.buttonRandomPaper} variant="raised">
              Random Paper
            </Button>

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
        }
      </AuthUserContext.Consumer>
    );
  }
}

Sidebar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Sidebar);
