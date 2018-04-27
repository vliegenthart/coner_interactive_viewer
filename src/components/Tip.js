// @flow

import React, { Component } from "react";

import "../style/Tip.css";

type State = {
  compact: boolean,
  text: string,
  facet: string
};

type Props = {
  onConfirm: (comment: { text: string, facet: string }) => void,
  onOpen: () => void,
  onUpdate?: () => void
};


class Tip extends Component<Props, State> {
  state = {
    compact: true,
    text: "",
    facet: ""
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

  render() {
    const { onConfirm, onOpen } = this.props;
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
              <textarea
                width="100%"
                placeholder="Your comment"
                autoFocus
                value={text}
                onChange={event => this.setState({ text: event.target.value })}
                ref={node => {
                  if (node) {
                    node.focus();
                  }
                }}
              />
              <div className="label-header">Category: </div>
              <div>
                {facets.map(_facet => (
                  <label key={_facet}>
                    <input
                      checked={facet === _facet}
                      type="radio"
                      name="facet"
                      value={_facet}
                      onChange={event =>
                        this.setState({ facet: event.target.value })
                      }
                    />
                    {_facet}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <input type="submit" value="Save" />
            </div>
          </form>
        )}
      </div>
    );
  }
}

export default Tip;
