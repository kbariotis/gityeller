import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import styles from './App.css';
import gh from 'parse-github-url';
import axios from 'axios';
import isEmail from 'validator/lib/isEmail';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      repo: '',
      email: '',
      labels: [],
      activeStep: 1
    };
  }
  keyup(e) {
    const githubUrl = gh(e.target.value);

    if (githubUrl) {
      this.setState({
        repo: githubUrl.repo
      });
    }
  }
  getLabels(e) {
    e.preventDefault();

    axios.get(`/api/repo/${this.state.repo}/labels`)
      .then((res) => this.setState({labels: res.data, activeStep: ++this.state.activeStep}));
  }
  subscribe(e) {
    e.preventDefault();

    axios.post('/api/subscriptions', {
      email: this.state.email,
      repo: this.state.repo,
      label: this.state.labelChosen
    })
    .then(() => this.setState({activeStep: ++this.state.activeStep}));
  }
  setEmail(e) {
    e.preventDefault();

    this.setState({
      activeStep: ++this.state.activeStep
    });
  }
  validateEmail(e) {
    if (isEmail(e.target.value)) {
      this.setState({
        email: e.target.value
      });
    }
  }
  chooseLabel(e) {
    this.setState({
      labelChosen: e.target.value,
      activeStep: ++this.state.activeStep
    });
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
          <div className="col-sm-4 col-sm-offset-4">
            <form className={styles.stepsContainer}>
              <div className={this.state.activeStep === 1 ? styles.activeStep : styles.inactiveStep}>
                <div className="form-group">
                  <label htmlFor="repo">Repository URL</label>
                  <input
                    className={`form-control ${styles.customControl}`}
                    id="repo"
                    type="text"
                    onKeyUp={this.keyup.bind(this)}
                    placeholder="e.g. https://github.com/kbariotis/throw.js"
                    autoComplete="off"
                    />
                  <div className={`row ${styles.actions}`}>
                    <div className="col-sm-6">
                      {this.state.activeStep !== 1 &&
                        <button
                          className={`btn btn-default ${styles.customDefaultButton}`}
                          onClick={this.startOver.bind(this)}>
                            Reset
                        </button>
                      }
                    </div>
                    <div className="col-sm-6 text-right">
                      {this.state.repo &&
                        <button
                          className={`btn btn-default ${styles.customPrimaryButton}`}
                          onClick={this.getLabels.bind(this)}>
                            Next
                        </button>
                      }
                    </div>
                  </div>
                </div>
              </div>
              <div className={this.state.activeStep === 2 ? styles.activeStep : styles.inactiveStep}>
                <div className="form-group">
                  <label htmlFor="labels">Repo</label>
                  {this.state.labels.length > 0 &&
                    <select
                      className={`form-control ${styles.customControl}`}
                      id="labels"
                      onChange={this.chooseLabel.bind(this)}
                      autoComplete="off"
                    >
                      {this.state.labels.map((label, id) => {
                        return <option id={label.id} key={id}>{label.name}</option>;
                      })}
                    </select>
                  }
                  <div className={`row ${styles.actions}`}>
                    <div className="col-sm-6">
                      {this.state.activeStep !== 1 &&
                        <button
                          className={`btn btn-default ${styles.customDefaultButton}`}
                          onClick={this.startOver.bind(this)}>
                            Reset
                        </button>
                      }
                    </div>
                  </div>
                </div>
              </div>
              <div className={this.state.activeStep === 3 ? styles.activeStep : styles.inactiveStep}>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    className={`form-control ${styles.customControl}`}
                    id="email"
                    type="text"
                    onKeyUp={this.validateEmail.bind(this)}
                    autoComplete="off"
                  />

                  <div className={`row ${styles.actions}`}>
                    <div className="col-sm-6">
                      <button
                        className={`btn btn-default ${styles.customDefaultButton}`}
                        onClick={this.startOver.bind(this)}>
                          Reset
                      </button>
                    </div>
                    <div className="col-sm-6 text-right">
                      {this.state.email &&
                        <button
                          className={`btn btn-default ${styles.customPrimaryButton}`}
                          disabled={!this.state.email}
                          onClick={this.setEmail.bind(this)}>
                            Next
                        </button>
                      }
                    </div>
                  </div>
                </div>
              </div>
              <div className={this.state.activeStep === 4 ? styles.activeStep : styles.inactiveStep}>
                <p className="text-center">
                  You are about to subscribe to <b>{this.state.repo}</b> with the <b>{this.state.labelChosen}</b> label using the <b>{this.state.email}</b> email.
                </p>
                <div className={`row ${styles.actions}`}>
                    <div className="col-sm-6">
                      <button
                        className={`btn btn-default ${styles.customDefaultButton}`}
                        onClick={this.startOver.bind(this)}>
                          Reset
                      </button>
                    </div>
                    <div className="col-sm-6 text-right">
                      <button
                        className={`btn btn-default ${styles.customPrimaryButton}`}
                        disabled={!this.state.labelChosen}
                        onClick={this.subscribe.bind(this)}>
                          Subscribe
                      </button>
                    </div>
                  </div>
              </div>
              <div className={this.state.activeStep === 5 ? styles.activeStep : styles.inactiveStep}>
                <p className="text-center">
                  👏 &nbsp;Hey! You did it! 👏<br/>Now go get some work done. I will let you know once I've found a new issue!
                </p>
                <div className={`row ${styles.actions}`}>
                    <div className="col-sm-12 text-center">
                      <button
                        className={`btn btn-default ${styles.customPrimaryButton}`}
                        onClick={this.startOver.bind(this)}>
                          Again!
                      </button>
                    </div>
                  </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}
