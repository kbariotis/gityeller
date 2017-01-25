import React from 'react';
import gh from 'parse-github-url';

export default class RepoStep extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      repo: ''
    };
  }
  stepLoaded() {
    return this.props.activeStep === 1;
  }
  repoKeyup(e) {
    e.preventDefault();

    const githubUrl = gh(e.target.value);

    if (githubUrl) {
      this.setState({
        repo: githubUrl.repo
      });
    }

    if (e.keyCode === 13 && this.state.repo) {
      this.next();
    }
  }
  next() {
    this.props.next({
      repo: this.state.repo,
      activeStep: this.props.activeStep + 1
    });
  }
  render() {
    return (
      <div className={this.stepLoaded() ? this.props.styles.activeStep : this.props.styles.inactiveStep}>
        <div className="form-group">
          <label htmlFor="repo">Repository URL</label>
          <input
            className={`form-control ${this.props.styles.customControl}`}
            id="repo"
            type="text"
            onKeyUp={this.repoKeyup.bind(this)}
            placeholder="https://github.com/expressjs/express"
            autoComplete="off"
            />
          <div className={`row ${this.props.styles.actions}`}>
            <div className="col-xs-6 col-xs-offset-6 text-right">
              {this.state.repo &&
                <button
                  className={`btn btn-default ${this.props.styles.customPrimaryButton}`}
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

RepoStep.propTypes = {
  activeStep: React.PropTypes.number.isRequired,
  next: React.PropTypes.func.isRequired,
  styles: React.PropTypes.object.isRequired
};
