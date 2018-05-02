// @flow

import React, { Component } from "react";

import config from './config'
import colors from '../style/Colors'

import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Radio, { RadioGroup } from 'material-ui/Radio';
import { FormLabel, FormControl, FormControlLabel, FormHelperText } from 'material-ui/Form';
import Button from 'material-ui/Button';
import classNames from 'classnames';
import Check from '@material-ui/icons/Check';
import Close from '@material-ui/icons/Close';
import Icon from 'material-ui/Icon';

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
    }
  },
  buttonDataset: {
    backgroundColor: colors.facetDataset
  },
  buttonMethod: {
    backgroundColor: colors.facetMethod
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
    margin: '-15px -15px 10px -15px',
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
    compact: this.props.compact,
    rating: this.props.rating,
    text: "",
    facet: config.facets[0],
  };

  state: State;
  props: Props;

  // for TipContainer
  componentDidUpdate(nextProps: Props, nextState: State) {
    const { onUpdate } = this.props;

    if (onUpdate && this.state.compact !== nextState.compact) {
      onUpdate();
    }
  }

  handleChange = event => {
    this.setState({ facet: event.target.value });
  };

  render() {
    const { onConfirm, onOpen, classes } = this.props;
    const { rating, compact, text, facet } = this.state;    

    return (
      <div className="Tip">
        <div className="Tip__card RatingTip__card">
          <div className={`${classes.header} Rating__header`}>
            Keyword relevant for:
          </div>
          {config.facets.map(_facet =>
            <div key={_facet} className="Button__Group">
              <span className={classes.label}>{capitalize(_facet)}</span>
              <Button className={`${classes.button} Button__Facet Button__${_facet}`} variant="raised">
                <Check className={classNames(classes.leftIcon, classes.iconSmall)} />
                Yes
              </Button>

              <Button className={`${classes.button} Button__Facet Button__${_facet}`} variant="raised">
                <Close className={classNames(classes.leftIcon, classes.iconSmall)} />
                No
              </Button>
            </div>
          )}
        </div>

        { compact && (
          <form
            className="Tip__card"
            onSubmit={event => {
              event.preventDefault();
              onConfirm({ text, facet });
            }}
          >
            <div>
              <FormControl component="fieldset" required className={classes.formControl}>
                <FormLabel component="legend" className={classes.legend}>Category:</FormLabel>
                <RadioGroup
                  aria-label="facet"
                  name="facet1"
                  className={classes.group}
                  value={facet}
                  onChange={this.handleChange}
                > 
                  {config.facets.map(_facet =>
                    <FormControlLabel key={_facet} value={_facet} control={<Radio />} label={capitalize(_facet)} />
                  )}
                </RadioGroup>
              </FormControl>
            </div>
            
            <Button type="submit" variant="raised" color="primary" className={classes.button}>
              { rating ? "Rate" : "Add keyword" }
            </Button>
          </form>
        )}
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


