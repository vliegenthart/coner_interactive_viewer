// @flow

import React, { Component } from "react";

import MouseMonitor from "react-pdf-annotator/lib/components/MouseMonitor";

type Props = {
  onClick: (content: React$Element<*>) => void,
  popupContent: React$Element<*>,
  onMouseOut: () => void,
  children: React$Element<*>
};

type State = {
  mouseIn: boolean
};

class Popup extends Component<Props, State> {
  state: State = {
    mouseIn: false
  };

  props: Props;

  render() {
    const { onClick, popupContent, onMouseOut } = this.props;

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

                  // onMouseOut();
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