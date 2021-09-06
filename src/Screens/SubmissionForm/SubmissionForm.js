import React, { Component } from 'react';
import { loginUser } from '../../Redux/actions/authActions'
import { connect } from 'react-redux';
import Loader from '../../Components/Loader';
import logo from '../../assets/images/logo-dark.png';
import Header from '../Header/Header'
import { Link } from 'react-router-dom'
import validator from 'validator'
import { toast } from 'react-toastify';
import data from '../../city'
// import data1 from '../../country1'

import axios from 'axios'
import { Form, Icon, Input, Button, Upload, notification, Select, DatePicker, message } from 'antd';

const { Option } = Select
const { Dragger } = Upload

const title = "Error"


const props = {
    name: 'file',
    multiple: true,
    action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
    onChange(info) {
        const { status } = info.file;
        if (status !== 'uploading') {
            console.log(info.file, info.fileList);
        }
        if (status === 'done') {
            message.success(`${info.file.name} file uploaded successfully.`);
        } else if (status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        }
    },
}

class Submission extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            city: [],
            loading: false,
            disable: false,
            saleType: ["Buy", "Sell", "Rental", "Whole", "Referral"]
        }
    }

    normFile = e => {
        return e && e.fileList;
    }

    handleSubmit = e => {

        const { user } = this.props

        e.preventDefault();

        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({ loading: true, disable: true })
                var formData = new FormData();
                if (values.upload) {
                    for (var i = 0; i < values.upload.length; i++) {
                        formData.append(`upload${i}`, values.upload[i].originFileObj)
                    }
                }
                formData.append('agentId', user._id)
                formData.append('agentName', `${user.fname} ${user.lname}`)
                formData.append('clientName', values.clientName)
                formData.append('streetAddress', values.streetAddress)
                formData.append('country', values.country)
                formData.append('city', values.city)
                formData.append('lender', values.lender)
                formData.append('title', values.title)
                formData.append('soldPrice', values.soldPrice)
                formData.append('saleType', values.saleType)
                formData.append('transactionFee', values.transactionFee)
                formData.append('checkRec', values.checkRec)
                formData.append('paidAmount', values.paidAmount)
                formData.append('paidDate', values.paidDate)
                formData.append('zip', values.zip)
                axios.post('https://wsr-hermes-server786.herokuapp.com/subform/submission', formData)
                    .then((result) => {
                        if (result.data.success) {
                            this.setState({ loading: false })
                            toast.success("Successfully added data!!!")
                            setTimeout(() => {
                                window.location.reload()
                            }, 500)
                        }
                        else {
                            this.setState({ loading: false, disable: false })
                            toast.error(result.data.message)
                        }
                    })
                    .catch((err) => {
                        toast.error("Something Went Wrong!!!")
                    })
            }
        });
    };


    render() {
        const { city, saleType } = this.state
        const { user, form } = this.props
        const { getFieldDecorator } = form;
        return (
            <div>
                <Header {...this.props} />
                <div style={{ backgroundColor: '#E5E5E5' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'ceenter' }}>
                        <div className="card1">
                            <div>
                                <Form
                                    onSubmit={this.handleSubmit}
                                    className="login-form"
                                    hideRequiredMark={true}
                                >
                                    <h1 className="heading1" >Closing Submission Form</h1>
                                    <Form.Item
                                        label="Client Name"
                                    >
                                        {getFieldDecorator('clientName', {
                                            rules: [{ required: true, message: 'Please input Client Name!' }],
                                        })(
                                            <Input
                                                type="text"
                                                minLength={3}
                                                placeholder="Client Name"
                                            />,
                                        )}
                                    </Form.Item>
                                    <Form.Item
                                        className="sign-up"
                                        label="Street Address"
                                    >
                                        {getFieldDecorator('streetAddress', {
                                            rules: [{ required: true, message: 'Please input Street Address!' }],
                                        })(
                                            <Input
                                                style={{ backgroundColor: '#FCFCFC' }}
                                                minLength={10}
                                                placeholder="Street Address"
                                            />,
                                        )}
                                    </Form.Item>
                                    <Form.Item
                                        label="State"
                                    >
                                        {getFieldDecorator('country', {
                                            rules: [{ required: true, message: 'Please Select State!' }],
                                        })(
                                            <Select
                                                showSearch
                                                style={{ backgroundColor: '#fff' }}
                                                placeholder="Select State"
                                                optionFilterProp="children"
                                                onSelect={(e) => this.setState({ city: data[e] })}
                                                filterOption={(input, option) =>
                                                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                }
                                            >
                                                {
                                                    Object.keys(data).map((v, i) => {
                                                        return <Option value={v} key={i}>{v}</Option>
                                                    })
                                                }
                                            </Select>,
                                        )}
                                    </Form.Item>
                                    <Form.Item
                                        label="City"
                                    >
                                        {getFieldDecorator('city', {
                                            rules: [{ required: true, message: 'Please input City!' }],
                                        })(
                                            <Input
                                                minLength={1}
                                                placeholder="City"
                                            />,
                                        )}
                                    </Form.Item>
                                    <Form.Item
                                        label="Zip Code"
                                    >
                                        {getFieldDecorator('zip', {
                                            rules: [{ required: true, message: 'Please input ZipCode!' }],
                                        })(
                                            <Input
                                                minLength={5}
                                                type="number"
                                                placeholder="Zip Code"
                                            />,
                                        )}
                                    </Form.Item>
                                    <Form.Item
                                        label="Lender"
                                    >
                                        {getFieldDecorator('lender', {
                                            rules: [{ required: true, message: 'Please input Lender!' }],
                                        })(
                                            <Input
                                                minLength={3}
                                                type="text"
                                                placeholder="Lender"
                                            />,
                                        )}
                                    </Form.Item>
                                    <Form.Item
                                        label="Company Title"
                                    >
                                        {getFieldDecorator('title', {
                                            rules: [{ required: true, message: 'Please input Company Title!' }],
                                        })(
                                            <Input
                                                type="text"
                                                minLength={3}
                                                placeholder="Company Title"
                                            />,
                                        )}
                                    </Form.Item>
                                    <Form.Item
                                        label="Sold Price"
                                    >
                                        {getFieldDecorator('soldPrice', {
                                            rules: [{ required: true, message: 'Please input Sold Price!' }],
                                        })(
                                            <Input
                                                type="number"
                                                placeholder="$ XXX,XXX.XX"
                                            />,
                                        )}
                                    </Form.Item>
                                    <Form.Item
                                        label="Sale Type"
                                    >
                                        {getFieldDecorator('saleType', {
                                            rules: [{ required: true, message: 'Please Select Sale Type!' }],
                                        })(
                                            <Select
                                                showSearch
                                                style={{ backgroundColor: '#fff' }}
                                                placeholder="Select a Sale Type"
                                                optionFilterProp="children"
                                                filterOption={(input, option) =>
                                                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                }
                                            >
                                                {
                                                    saleType.map((v, i) => {
                                                        return <Option value={v} key={i}>{v}</Option>
                                                    })
                                                }
                                            </Select>,
                                        )}
                                    </Form.Item>
                                    <Form.Item
                                        label="Transaction Fee"
                                    >
                                        {getFieldDecorator('transactionFee', {
                                            rules: [{ required: true, message: 'Please input Transaction Fee!' }],
                                        })(
                                            <Input
                                                type="number"
                                                placeholder="Transaction Fee"
                                            />,
                                        )}
                                    </Form.Item>
                                    <Form.Item
                                        label="Check Recieved"
                                    >
                                        {getFieldDecorator('checkRec', {
                                            rules: [{ required: true, message: 'CHeck Recieved!' }],
                                        })(
                                            <Input
                                                type="text"
                                                placeholder="Check Recieved"
                                            />,
                                        )}
                                    </Form.Item>
                                    <Form.Item
                                        label="Paid Amount"
                                    >
                                        {getFieldDecorator('paidAmount', {
                                            rules: [{ required: true, message: 'Please input Paid Amount!' }],
                                        })(
                                            <Input
                                                type="number"
                                                placeholder="Paid Amount"
                                            />,
                                        )}
                                    </Form.Item>
                                    <Form.Item
                                        label="Submission Date"
                                    >
                                        {getFieldDecorator('paidDate', {
                                            rules: [{ required: true, message: 'Please Select Submission Date!' }],
                                        })(
                                            <DatePicker style={{ width: '100%' }} placeholder="Submission Date" />,
                                        )}
                                    </Form.Item>

                                    <Form.Item className="sign-up">
                                        {getFieldDecorator('upload', {
                                            valuePropName: 'fileList',
                                            getValueFromEvent: this.normFile,
                                        })(
                                            <Dragger {...props}>
                                                <p className="ant-upload-drag-icon">
                                                    <Icon type="inbox" />
                                                </p>
                                                <p className="ant-upload-text">File Upload</p>
                                                <p className="ant-upload-hint">
                                                    Drag and drop a file here or click
                                                </p>
                                            </Dragger>,
                                        )}
                                    </Form.Item>

                                    <Form.Item className="sign-up">
                                        <Button htmlType="submit" disabled={this.state.disable} loading={this.state.loading} style={{ backgroundColor: '#120894', color: 'white', fontWeight: 'bold', fontSize: 14, height: 40, display: 'flex', width: '100%', textAlign: 'center', justifyContent: 'center', alignItems: 'center', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}>
                                            Submit
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const SubmissionForm = Form.create({ name: 'normal_login' })(Submission);

const mapStateToProps = (state) => {

    return {
        user: state.authReducer.user,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        loginUser: (user) => dispatch(loginUser(user)),
    }
}



export default connect(mapStateToProps, mapDispatchToProps)(SubmissionForm)