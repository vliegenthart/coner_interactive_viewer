// @flow

import React, { Component } from "react";

import MouseMonitor from "react-pdf-annotator/lib/components/MouseMonitor";

type Props = {
  onClick: (content: React$Element<*>) => void,
  popupContent: React$Element<*>,
  onMouseOut: () => void,
  children: React$Element<*>,
  isScrolledTo: boolean
};

type State = {
  mouseIn: boolean
};

class Popup extends Component<Props, State> {
  state: State = {
    mouseIn: false
  };

  props: Props;

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { onClick, isScrolledTo, highlight } = this.props;

    if (!prevProps.isScrolledTo && isScrolledTo) {
      document.getElementById('highlight-' + highlight.id).click()
    }
  }

  render() {
    const { onClick, popupContent } = this.props;

    return (
      <div>
        <div
          onClick={() => {
            this.setState({ mouseIn: true });

            onClick(
              <MouseMonitor
                onMoveAway={() => {
                  if (this.state.mouseIn) {
                    return;
                  }

                }}
                paddingX={60}
                paddingY={30}
                children={popupContent}
              />
            );
          }}
          onMouseOut={() => {
            this.setState({ mouseIn: false });
          }}
        >
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default Popup;
