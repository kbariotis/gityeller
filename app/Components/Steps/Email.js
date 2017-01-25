import React from 'react';
import isEmail from 'validator/lib/isEmail';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: ''
    };
  }
  stepLoaded() {
    return this.props.activeStep === 3;
  }
  next() {
    this.props.next({
      email: this.state.email,
      activeStep: this.props.activeStep + 1
    });
  }
  validateEmail(e) {
    if (isEmail(e.target.value)) {
      this.setState({
        email: e.target.value
      });
    }

    if (e.keyCode === 13) {
      this.next();
    }
  }
  render() {
    return (
      <div className={this.stepLoaded() ? this.props.styles.activeStep : this.props.styles.inactiveStep}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            className={`form-control ${this.props.styles.customControl}`}
            id="email"
            type="text"
            onKeyUp={this.validateEmail.bind(this)}
            placeholder="konmpar@gmail.com"
            autoComplete="off"
          />

          <div className={`row ${this.props.styles.actions}`}>
            <div className="col-xs-6">
              <button
                className={`btn btn-default ${this.props.styles.customDefaultButton}`}
                onClick={this.props.startOver}>
                  Reset
              </button>
            </div>
            <div className="col-xs-6 text-right">
              {this.state.email &&
                <button
                  className={`btn btn-default ${this.props.styles.customPrimaryButton}`}
                  disabled={!this.state.email}
                  onClick={this.next.bind(this)}>
                    Next
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}
