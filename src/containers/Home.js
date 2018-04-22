import React, { Component } from "react";
import { PageHeader, ListGroup, ListGroupItem } from "react-bootstrap";
import "./Home.css";
import { API } from "aws-amplify";

export default class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      meters: []
    };
  }

  async componentDidMount() {
    if (!this.props.isAuthenticated) {
      return;
    }

    try {
      const meters = await this.meters();
      this.setState({ meters });
    } catch (e) {
      alert(e);
    }

    this.setState({ isLoading: false });
  }

  meters() {
    return API.get("meters", "/meters");
  }

  renderMeterReadsList(meters) {
    return [{}].concat(meters).map(
      (meter, i) =>
        i !== 0
          ? <ListGroupItem
            key={meter.meterId}
            href={`/meters/${meter.meterId}`}
            onClick={this.handleMeterReadClick}
            header={meter.content.trim().split("\n")[0]}
          >
            {"Created: " + new Date(meter.createdAt).toLocaleString()}
          </ListGroupItem>
          : <ListGroupItem
            key="new"
            href="/meters/new"
            onClick={this.handleMeterReadClick}
          >
            <h4>
              <b>{"\uFF0B"}</b> Create a new meter read
              </h4>
          </ListGroupItem>
    );
  }

  handleMeterReadClick = event => {
    event.preventDefault();
    this.props.history.push(event.currentTarget.getAttribute("href"));
  }

  renderLander() {
    return (
      <div className="lander">
        <h1>MeterData</h1>
        <p>a Nightjar app.</p>
      </div>
    );
  }

  renderMeterReads() {
    return (
      <div className="meters">
        <PageHeader>Meter Reads</PageHeader>
        <ListGroup>
          {!this.state.isLoading && this.renderMeterReadsList(this.state.meters)}
        </ListGroup>
      </div>
    );
  }

  render() {
    return (
      <div className="Home">
        {this.props.isAuthenticated ? this.renderMeterReads() : this.renderLander()}
      </div>
    );
  }
}