import React from 'react';
import axios from 'axios';

export default class LabelStep extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      labels: [],
      labelChosen: ''
    };
  }
  stepLoaded() {
    return this.props.activeStep === 2;
  }
  componentDidUpdate(props) {
    if (this.stepLoaded() && props.activeStep !== this.props.activeStep) {
      this.setState({labels: []});

      axios.get(`/api/repo/${this.props.repo}/labels`)
        .then((res) => this.setState({labels: res.data}))
        .catch(() => this.previous())
    }
  }
  chooseLabel(e) {
    if (e.target.value) {
      this.props.next({
        labelChosen: e.target.value,
        activeStep: this.props.activeStep + 1
      })
    }
  }
  previous() {
    this.props.next({
      activeStep: this.props.activeStep - 1
    })
  }
  render() {
    return (
      <div className={this.stepLoaded() ? this.props.styles.activeStep : this.props.styles.inactiveStep}>
        <div className="form-group">
          <label htmlFor="labels">Labels</label>
          {this.state.labels.length === 0 &&
            <div>
              <br/>
              <b>Wait for it ...</b>
            </div>
          }
          {this.state.labels.length > 0 &&
            <select
              className={`form-control ${this.props.styles.customControl}`}
              id="labels"
              onChange={this.chooseLabel.bind(this)}
              autoComplete="off"
            >
              <option>Select a label</option>
              {this.state.labels.map((label, id) => {
                return <option id={label.id} key={id}>{label.name}</option>;
              })}
            </select>
          }
          <div className={`row ${this.props.styles.actions}`}>
            <div className="col-xs-6">
              {this.props.activeStep !== 1 &&
                <button
                  className={`btn btn-default ${this.props.styles.customDefaultButton}`}
                  onClick={this.props.startOver}>
                    Reset
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

LabelStep.propTypes = {
  activeStep: React.PropTypes.number.isRequired,
  next: React.PropTypes.func.isRequired,
  styles: React.PropTypes.object.isRequired,
  repo: React.PropTypes.string,
  startOver: React.PropTypes.func.isRequired
};
