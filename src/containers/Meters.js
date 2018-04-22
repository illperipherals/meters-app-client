import React, { Component } from "react";
import { API, Storage } from "aws-amplify";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import config from "../config";
import "./Meters.css";
import { s3Upload } from "../libs/awsLib";

export default class Meters extends Component {
  constructor(props) {
    super(props);

    this.file = null;

    this.state = {
      isLoading: null,
      isDeleting: null,
      meter: null,
      meterType: "",
      consumption: "",
      content: "",
      attachmentURL: null
    };
  }

  async componentDidMount() {
    try {
      let attachmentURL;
      const meter = await this.getMeter();
      const { meterId, meterType, consumption, content, attachment } = meter;

      if (attachment) {
        attachmentURL = await Storage.vault.get(attachment);
      }

      this.setState({
        meter,
        meterId,
        meterType,
        consumption,
        content,
        attachmentURL
      });
    } catch (e) {
      alert(e);
    }
  }

  getMeter() {
    return API.get("meters", `/meters/${this.props.match.params.id}`);
  }

  validateForm() {
    return this.state.meterType > 0 && this.state.consumption > 0 && this.state.content.length > 0;
  }

  formatFilename(str) {
    return str.replace(/^\w+-/, "");
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleFileChange = event => {
    this.file = event.target.files[0];
  }

  saveMeterRead(meter) {
    return API.put("meters", `/meters/${this.props.match.params.id}`, {
      body: meter
    });
  }

  handleSubmit = async event => {
    let attachment;

    event.preventDefault();

    if (this.file && this.file.size > config.MAX_ATTACHMENT_SIZE) {
      alert("Please select a file smaller than 5MB");
      return;
    }

    this.setState({ isLoading: true });

    try {
      if (this.file) {
        attachment = await s3Upload(this.file);
      }

      await this.saveMeterRead({
        meterType: this.state.meterType,
        consumption: this.state.consumption,
        content: this.state.content,
        attachment: attachment || this.state.meter.attachment
      });
      this.props.history.push("/");
    } catch (e) {
      alert(e);
      this.setState({ isLoading: false });
    }
  }


  deleteMeterRead() {
    return API.del("meters", `/meters/${this.props.match.params.id}`);
  }

  handleDelete = async event => {
    event.preventDefault();

    const confirmed = window.confirm(
      "Are you sure you want to delete this meter reading?"
    );

    if (!confirmed) {
      return;
    }

    this.setState({ isDeleting: true });

    try {
      await this.deleteMeterRead();
      this.props.history.push("/");
    } catch (e) {
      alert(e);
      this.setState({ isDeleting: false });
    }
  }

  render() {
    return (
      <div className="MeterReads">
        {this.state.meter &&
          <form onSubmit={this.handleSubmit}>
          <FormGroup controlId="meterId">
              <ControlLabel>Meter Id</ControlLabel>
              <FormControl
                type="text"
                onChange={this.handleChange}
                value={this.state.meterId}
                placeholder="Meter ID"
                readonly="readonly" />
              <FormControl.Feedback />
            </FormGroup>
            <FormGroup controlId="meterType">
              <ControlLabel>Meter Type</ControlLabel>
              <FormControl
                type="text"
                onChange={this.handleChange}
                value={this.state.meterType}
                placeholder="Meter Type" />
              <FormControl.Feedback />
            </FormGroup>
            <FormGroup controlId="consumption">
              <ControlLabel>Consumption</ControlLabel>
              <FormControl
                type="text"
                onChange={this.handleChange}
                value={this.state.consumption}
                placeholder="Consumption" />
              <FormControl.Feedback />
            </FormGroup>
            <FormGroup controlId="content">
              <ControlLabel>Notes</ControlLabel>
              <FormControl
                onChange={this.handleChange}
                value={this.state.content}
                componentClass="textarea"
              />
            </FormGroup>
            {this.state.meter.attachment &&
              <FormGroup>
                <ControlLabel>Attachment</ControlLabel>
                <FormControl.Static>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={this.state.attachmentURL}
                  >
                    {this.formatFilename(this.state.meter.attachment)}
                  </a>
                </FormControl.Static>
              </FormGroup>}
            <FormGroup controlId="file">
              {!this.state.meter.attachment &&
                <ControlLabel>Attachment</ControlLabel>}
              <FormControl onChange={this.handleFileChange} type="file" />
            </FormGroup>
            <LoaderButton
              block
              bsStyle="primary"
              bsSize="large"
              disabled={!this.validateForm()}
              type="submit"
              isLoading={this.state.isLoading}
              text="Save"
              loadingText="Saving…"
            />
            <LoaderButton
              block
              bsStyle="danger"
              bsSize="large"
              isLoading={this.state.isDeleting}
              onClick={this.handleDelete}
              text="Delete"
              loadingText="Deleting…"
            />
          </form>}
      </div>
    );
  }
}