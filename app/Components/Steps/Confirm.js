import React from 'react';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  stepLoaded() {
    return this.props.activeStep === 4;
  }
  next() {
    this.props.next({
      activeStep: this.props.activeStep + 1
    });
  }
  render() {
    return (
      <div className={this.stepLoaded() ? this.props.styles.activeStep : this.props.styles.inactiveStep}>
        <p className="text-center">
          You are about to subscribe to <b>{this.props.repo}</b> with the <b>{this.props.labelChosen}</b> label using the <b>{this.props.email}</b> email.
        </p>
        <div className={`row ${this.props.styles.actions}`}>
            <div className="col-xs-6">
              <button
                className={`btn btn-default ${this.props.styles.customDefaultButton}`}
                onClick={this.props.startOver}>
                  Reset
              </button>
            </div>
            <div className="col-xs-6 text-right">
              <button
                className={`btn btn-default ${this.props.styles.customPrimaryButton}`}
                onClick={this.next.bind(this)}>
                  Subscribe
              </button>
            </div>
          </div>
      </div>
    );
  }
}
