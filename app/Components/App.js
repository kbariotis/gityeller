import React from 'react';
import gh from 'parse-github-url';
import axios from 'axios';
import isEmail from 'validator/lib/isEmail';

import styles from './App.css';

import RepoStep from './Steps/Repo';
import LabelStep from './Steps/Label';
import EmailStep from './Steps/Email';
import ConfirmStep from './Steps/Confirm';
import SubscribeStep from './Steps/Subscribe';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      repo: '',
      email: '',
      labelChosen: '',
      activeStep: 1
    };
  }
  startOver(e) {
    e.preventDefault();

    this.setState({
      labelChosen: '',
      email: '',
      repo: '',
      activeStep: 1
    });
  }
  render() {
    return (
      <div>
        <div className="row">
          <div className="col-sm-6 col-sm-offset-3 col-lg-4 col-lg-offset-4">
            <div className={styles.stepsContainer}>
              <RepoStep
                activeStep={this.state.activeStep}
                next={this.setState.bind(this)}
                styles={styles}/>
              <LabelStep
                activeStep={this.state.activeStep}
                next={this.setState.bind(this)}
                repo={this.state.repo}
                startOver={this.startOver.bind(this)}
                styles={styles}/>
              <EmailStep
                activeStep={this.state.activeStep}
                next={this.setState.bind(this)}
                startOver={this.startOver.bind(this)}
                styles={styles}/>
              <ConfirmStep
                {...this.state}
                next={this.setState.bind(this)}
                startOver={this.startOver.bind(this)}
                styles={styles}/>
              <SubscribeStep
                {...this.state}
                next={this.setState.bind(this)}
                startOver={this.startOver.bind(this)}
                styles={styles}/>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
