import React, { Component } from "react";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import config from "../config";
import "./NewMeterRead.css";
import { API } from "aws-amplify";
import { s3Upload } from "../libs/awsLib";

export default class NewMeterRead extends Component {
    constructor(props) {
        super(props);

        this.file = null;

        this.state = {
            isLoading: null,
            meterId: "",
            meterType: "",
            consumption: "",
            content: ""
        };
    }

    validateForm() {
        return this.state.content.length > 0 && this.state.meterId.length > 0 && this.state.meterType > 0 && this.state.consumption > 0;
    }


    handleChange = event => {
        this.setState({
            [event.target.id]: event.target.value
        });
    }

    handleFileChange = event => {
        this.file = event.target.files[0];
    }

    handleSubmit = async event => {
        event.preventDefault();

        if (this.file && this.file.size > config.MAX_ATTACHMENT_SIZE) {
            alert("Please select a file smaller than 5MB");
            return;
        }

        this.setState({ isLoading: true });

        try {
            const attachment = this.file
                ? await s3Upload(this.file)
                : null;

            await this.createMeterRead({
                attachment,
                content: this.state.content,
                meterId: this.state.meterId,
                meterType: this.state.meterType,
                consumption: this.state.consumption
            });
            this.props.history.push("/");
        } catch (e) {
            console.log(e);
            alert(e);
            this.setState({ isLoading: false });
        }
    }

    createMeterRead(meter) {
        return API.post("meters", "/meters", {
            body: meter
        });
    }

    render() {
        return (
            <div className="NewMeterRead">
                <form onSubmit={this.handleSubmit}>
                <FormGroup controlId="meterId">
                        <ControlLabel>Meter ID</ControlLabel>
                        <FormControl
                            type="text"
                            onChange={this.handleChange}
                            value={this.state.meterId}
                            placeholder="Meter ID" />
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
                        <ControlLabel>Consumption Reading</ControlLabel>
                        <FormControl
                            type="text"
                            onChange={this.handleChange}
                            value={this.state.consumption}
                            placeholder="Consumption Reading" />
                        <FormControl.Feedback />
                    </FormGroup>
                    <FormGroup controlId="content">
                        <ControlLabel>Note</ControlLabel>
                        <FormControl
                            onChange={this.handleChange}
                            value={this.state.content}
                            componentClass="textarea" />
                    </FormGroup>
                    <FormGroup controlId="file">
                        <ControlLabel>Attachment</ControlLabel>
                        <FormControl onChange={this.handleFileChange} type="file" />
                    </FormGroup>
                    <LoaderButton
                        block
                        bsStyle="primary"
                        bsSize="large"
                        disabled={!this.validateForm()}
                        type="submit"
                        isLoading={this.state.isLoading}
                        text="Create"
                        loadingText="Creating…" />
                </form>
            </div>
        );
    }
}