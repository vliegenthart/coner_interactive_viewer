// @flow

import React, { Component } from "react";

import config from './config'
import colors from '../style/colors'

import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Radio, { RadioGroup } from 'material-ui/Radio';
import { FormLabel, FormControl, FormControlLabel, FormHelperText } from 'material-ui/Form';
import Button from 'material-ui/Button';


import "../style/Tip.css";

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
    width: '100%',
    backgroundColor: colors.primary,
    color: colors.logoText,
    '&:hover': {
      backgroundColor: colors.primaryDarken,
    }
  },
  legend: {
    color: 'rgba(0, 0, 0, 0.54) !important',
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


class Tip extends Component<Props, State> {
  state = {
    compact: true,
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
    const { compact, text, facet } = this.state;
    const facets: Array<string> = ["dataset", "method"];

    return (
      <div className="Tip">
        {compact ? (
          <div
            className="Tip__compact"
            onClick={() => {
              onOpen();
              this.setState({ compact: false });
            }}
          >
            Add entity
          </div>
        ) : (
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
                    <FormControlLabel value={_facet} control={<Radio />} label={capitalize(_facet)} />
                  )}
                </RadioGroup>
              </FormControl>
            </div>
            <Button type="submit" variant="raised" color="primary" className={classes.button}>
              Add entity
            </Button>
          </form>
        )}
      </div>
    );
  }
}

Tip.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Tip);




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


