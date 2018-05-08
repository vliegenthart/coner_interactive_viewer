// @flow

import React, { Component } from "react";

import config from './config'
import colors from '../style/Colors'

import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import classNames from 'classnames';
import Check from '@material-ui/icons/Check';
import Close from '@material-ui/icons/Close';

import "../style/Tip.css";
import "../style/RatingTip.css";

import isEqual from 'lodash/isEqual';


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
    }
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
    color: 'rgba(0, 0, 0, 0.87)',
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
  state = {
    compact: false,
    text: "",
    relevant: [],
    irrelevant: [],
    ratings: []
  };

  state: State;
  props: Props;

  // for TipContainer
  componentDidUpdate(prevProps: Props, prevState: State) {
    const { onUpdate } = this.props;

    if (onUpdate && this.state.compact !== prevState.compact) {
      onUpdate();
    }

    console.log(!isEqual(prevState.ratings, this.props.ratings), prevState.ratings, this.props.ratings)
    if (!isEqual(prevState.ratings, this.props.ratings)) {
      this.setState( { ratings: this.props.ratings })

      let rel = []
      let irr = []
      
      this.props.ratings.map(rating => {
        if (rating.relevant === 'relevant') rel.push(rating.facet)
        if (rating.relevant === 'irrelevant') irr.push(rating.facet)
      })

      this.setState(() => ({ relevant: rel, irrelevant: irr }))
    }
     
  }

  handleChange = event => {
    this.setState({ facet: event.target.value });
  };

  render() {
    const { classes } = this.props;
    const { relevant, irrelevant } = this.state;

    return (
      <div className="Tip">
        <div className="Tip__card RatingTip__card">
          <div className={`${classes.header} Rating__header`}>
            Keyword relevant for:
          </div>
          {config.facets.map(_facet =>
            <div key={_facet} className="Button__Group">
              <span className={classes.label}>{capitalize(_facet)}</span>
              <Button className={`${classes.button} Button__Facet Button__${_facet} ${relevant.indexOf(_facet) > -1 ? 'Button__pressed' : ''}`} disabled={relevant.indexOf(_facet) > -1} variant="raised">
                <Check className={classNames(classes.leftIcon, classes.iconSmall)} />
                Yes
              </Button>

              <Button className={`${classes.button} Button__Facet Button__${_facet} ${irrelevant.indexOf(_facet) > -1 ? 'Button__pressed' : ''}`} disabled={irrelevant.indexOf(_facet) > -1} variant="raised">
                <Close className={classNames(classes.leftIcon, classes.iconSmall)} />
                No
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


