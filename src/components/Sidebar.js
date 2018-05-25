// @flow

import React, { Component } from "react";

import config from './config';
import colors from './Colors';

import type { T_Highlight } from "react-pdf-annotator/types";
import AuthUserContext from './AuthUserContext';
import sortBy from 'lodash/sortBy';
import { uniqueHighlights, truncate } from '../utility/util-functions';

import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import { withStyles } from '@material-ui/core/styles';
import DoneIcon from '@material-ui/icons/Done';
import CloseIcon from '@material-ui/icons/Close';


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

class Sidebar extends Component<Props, State> {

  constructor(props) {
    super(props);

    this.handlePaperChange = this.handlePaperChange.bind(this)

    this.state = {
      categories: [
        { key: 0, label: 'Dataset', klass: 'dataset' },
        { key: 1, label: 'Method', klass: 'method' },
        { key: 2, label: 'Dataset & Method', klass: 'dataset-method' },
        { key: 3, label: 'User added', klass: 'user' },
      ]
    };
  }

  handlePaperChange = (uid) => {
    this.props.switchPaper('pid', config.papersList[Math.floor(Math.random()*config.papersList.length)]['pid'], uid)
  }

  render() {
    const { highlights, getRatingsForHighlight, classes } = this.props;
    const { categories } = this.state;

    return (

      <AuthUserContext.Consumer>
        {authUser =>
          <div className="sidebar" style={{ width: "25vw" }}>
            <div className="description" style={{ padding: "1rem" }}>
              <Button value="randomPaper" onClick={() => this.handlePaperChange(authUser.uid)} className={classes.buttonRandomPaper} variant="raised">
                Random Paper
              </Button>

              <h3>Categories</h3>

              {categories.map(cat => {
                return (
                  <Chip
                    key={cat.key}
                    label={cat.label}
                    className={`${classes.chip} Category__chip Category__${cat.klass}`}
                  />
                );
              })}
            </div>
            
            <h3 className="Keywords__title">Keyword Ratings</h3>
            <ul className="sidebar__highlights">
              {uniqueHighlights(sortBy(highlights, ['position.pageNumber', 'position.boundingRect.y1', 'position.boundingRect.x1'])).map((highlight, index) => (
                <li
                  key={index}
                  className="sidebar__highlight"
                > 
                  
                  <div className="Ratings__facets">
                    {sortBy(getRatingsForHighlight(highlight.pid, highlight, authUser.uid), 'facet').map((rating, index) =>
                      <Chip
                        key={`highlight-${index}`}
                        label={rating.facet}
                        className={`${classes.chip} Category__chip Category__${rating.facet.toLowerCase()}`}
                        onDelete={event => null}
                        deleteIcon={rating.relevance === 'relevant' ? <DoneIcon /> : <CloseIcon />}
                      />
                    )}
                    {highlight.metadata.type === 'selected' && 
                      <Chip
                        key={`highlight-${index}-selected`}
                        label="User added"
                        className={`${classes.chip} Category__chip Category__user`}
                      />
                    }

                  </div>

                  <div className="Highlight__text">
                    {truncate(highlight.content.text, 100)}
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
