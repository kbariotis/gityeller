import React from 'react';
import axios from 'axios';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      success: false
    };
  }
  stepLoaded() {
    return this.props.activeStep === 5;
  }
  componentDidUpdate(props) {
    if (this.stepLoaded() && props.activeStep !== this.props.activeStep) {
      axios.post('/api/subscriptions', {
        email: this.props.email,
        repo: this.props.repo,
        label: this.props.labelChosen
      })
      .then(() => this.setState({loading: false, success: true}))
      .catch(() => this.setState({loading: false, success: false}));
    }
  }
  render() {
    return (
      <div className={this.stepLoaded() ? this.props.styles.activeStep : this.props.styles.inactiveStep}>
        {this.state.loading &&
          <div>
            <br/>
            <b>Wait for it ...</b>
          </div>
        }
        {!this.state.loading && this.state.success &&
          <div>
            <p className="text-center">
              👏 &nbsp;Hey! You did it! 👏<br/>Now go get some work done. I will let you know once I've found a new issue!
            </p>
            <div className={`row ${this.props.styles.actions}`}>
              <div className="col-sm-12 text-center">
                <button
                  className={`btn btn-default ${this.props.styles.customPrimaryButton}`}
                  onClick={this.props.startOver}>
                    Again!
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    );
  }
}
