// @flow

import React, { Component } from "react";

import config from './config';
import { setHighlightsRated, truncate } from '../utility/util-functions';
import colors from './Colors';

import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import classNames from 'classnames';
import Check from '@material-ui/icons/Check';
import Close from '@material-ui/icons/Close';

import "../style/Tip.css";
import "../style/RatingTip.css";


const capitalize = word =>
  word.charAt(0).toUpperCase() + word.slice(1)

const styles = theme => ({
  formControl: {
    margin: theme.spacing.unit * 1,
  },
  group: {
    margin: `5px 0`,
  },
  button: {
    margin: theme.spacing.unit,
    backgroundColor: colors.primary,
    color: colors.logoText,
    '&:hover': {
      backgroundColor: colors.primaryDarken,
    },
    padding: '8px 12px'
  },
  leftIcon: {
    marginRight: theme.spacing.unit,
  },
  rightIcon: {
    marginLeft: theme.spacing.unit,
  },
  legend: {
    color: 'rgba(0, 0, 0, 0.54) !important',
  },
  iconSmall: {
    fontSize: 20,
  },
  header: {
    backgroundColor: colors.primary,
    margin: '-15px -15px 15px -15px',
    padding: '15px'
  },
  label: {
    marginRight: '10px',
    color: 'rgba(0, 0, 0, 0.54) !important',
    display: 'inline-block'
  }
});

type State = {
  compact: boolean,
  text: string,
  facet: string
};

type Props = {
  onConfirm: (metadata: { text: string, facet: string }) => void,
  onOpen: () => void,
  onUpdate?: () => void
};

class RatingTip extends Component<Props, State> {
  constructor(props) {
    super(props);
    this.ratingRelevant = this.ratingRelevant.bind(this);
    this.ratingIrrelevant = this.ratingIrrelevant.bind(this);
    this.incrementversion = this.incrementVersion.bind(this);
    this.handleButtonClick = this.handleButtonClick.bind(this);

    this.state = {
      compact: false,
      text: "",
      ratings: {}
    };
  }

  componentDidMount() {
    const { ratings } = this.props;

    if (ratings.length > 0) {
      this.setState({ ratings: ratings.length > 0 ? Object.assign(...ratings.map(d => ({[d['facet']]: d}))) : {} });
    }
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { onUpdate } = this.props;

    // for TipContainer
    if (onUpdate && this.state.compact !== prevState.compact) {
      onUpdate();
    }
  }

  ratingRelevant = facet => {
    const { ratings } = this.state;
    return ratings[facet] && ratings[facet].relevance === 'relevant' 
  }

  ratingIrrelevant = facet => {
    const { ratings } = this.state;
    return ratings[facet] && ratings[facet].relevance === 'irrelevant' 
  }

  incrementVersion = facet => {
    const { ratings } = this.state;
    const version =  ratings[facet] ? ratings[facet].version + 1 : 1;
    return version
  }

  handleButtonClick = event => {
    const { addRating, highlight, authUser } = this.props;
    const { ratings } = this.state;

    const val = event.currentTarget.value;
    const [facet, relevance] = val.split("-");

    const rating = { type: 'occurrence', entityText: highlight.content.text, relevance: relevance, facet: facet, pageNumber: highlight.position.pageNumber, highlightType: highlight.metadata.type, highlightId: highlight.id, pid: highlight.pid, uid: authUser.uid, version: this.incrementVersion(facet) }
      
    ratings[facet] = rating

    this.setState(() => ({ ratings: ratings }));
    addRating(rating);
    setHighlightsRated(Object.keys(ratings).length, rating);
  }

  render() {
    const { classes, onClose, highlight } = this.props;

    return (
      <div className="Tip">
        <div className="Tip__card RatingTip__card">
          <div className={`${classes.header} Rating__header`}>
            <div className="Entity__text">{truncate(highlight.content.text, 50)}</div>
            <div className="close" onClick={onClose}>CLOSE</div>
          </div>
          {/*} <span className={classes.label}>Category:</span> */}
          {config.facets.map(_facet =>
            <div key={_facet} className="Button__Group">
              <span className={classes.label}>{capitalize(_facet)}</span>
              
              <Button value={`${_facet}-relevant`} onClick={this.handleButtonClick} className={`${classes.button} Button__facet Button__${_facet} ${this.ratingRelevant(_facet) ? 'Button__pressed' : ''}`} disabled={this.ratingRelevant(_facet)} variant="raised">
                <Check className={classNames(classes.leftIcon, classes.iconSmall)} />
                Yes
                <div className="Center__text"></div>
              </Button>

              <Button value={`${_facet}-irrelevant`} onClick={this.handleButtonClick} className={`${classes.button} Button__facet Button__${_facet} ${this.ratingIrrelevant(_facet) ? 'Button__pressed' : ''}`} disabled={this.ratingIrrelevant(_facet)} variant="raised">
                <Close className={classNames(classes.leftIcon, classes.iconSmall)} />
                No
                <div className="Center__text"></div>
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }
}

RatingTip.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(RatingTip);




// class RadioButtonsGroup extends React.Component {
//   state = {
//     value: config.facets[0],
//   };

 

//   render() {
//     const { classes } = this.props;

//     return (
        
//     );
//   }
// }


