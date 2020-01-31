import React, { Component } from 'react';
import { loginUser } from '../../Redux/actions/authActions'
import { connect } from 'react-redux';
import Loader from '../../Components/Loader';
import logo from '../../assets/images/logo-dark.png';
import Header from '../Header/Header'
import { Link } from 'react-router-dom'
import dataCountry from '../../country'
import validator from 'validator'
import { toast } from 'react-toastify';
import axios from 'axios'
import { Form, Icon, Input, Button, Upload, Descriptions, Select, DatePicker, message, Menu, Table, Skeleton, Badge } from 'antd';
import Iframe from 'react-iframe'

const { Option } = Select
const { Dragger } = Upload

const expandedRowRender = record => <p>Hello</p>;

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

class Review extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            city: [],
            allData: [],
            columns: [
                {
                    title: 'Client',
                    dataIndex: 'headline',
                    render: text => <Link>{text.clientName > 30 ? `${text.clientName(0, 30)}...` : text.clientName}</Link>
                },
                {
                    title: 'Sold Price',
                    dataIndex: 'status',
                },
                {
                    title: 'Agent Id',
                    dataIndex: 'author',
                },
                {
                    title: 'Date',
                    dataIndex: 'date',
                    render: text => <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <p>{text}</p>
                        <div>
                            <Button type="secondary" style={{ margin: 5 }}>
                                Detail
                            </Button>
                            <Button type="primary">
                                Approve
                            </Button>
                        </div>
                    </div>
                },
            ]
        }
    }

    async componentWillMount() {
        const { allData } = this.state
        await axios.get('https://wsr-server.herokuapp.com/subform/getAll')
            .then((res) => {
                console.log(res.data.data)
                const { data } = res.data
                data.map((v, i) => {
                    return allData.push({
                        key: i,
                        headline: v,
                        status: v.soldPrice,
                        author: v.agentId,
                        date: v.timestamp
                    })
                })
                this.setState({ allData })
                console.log(allData)
            })
            .catch((err) => console.log(err))
    }

    handleSubmit = e => {
        const { city } = this.state
        e.preventDefault();

        this.props.form.validateFields((err, values) => {
            if (!err) {
                if (!validator.isAlpha(values.clientName)) {
                    return toast.error("Client Name Must be an alphabet!!!");
                }
                else if (!validator.isAlphanumeric(values.title)) {
                    return toast.error("Title Must be an alphaNumeric!!!");
                }
                values.city = city[values.city]
                // this.setState({ loading: true, disable: true })
                var formData = new FormData();
                for (var i in values) {
                    formData.append(i, values[i])
                }
                formData.append('upload', values.upload[0].originFileObj)
                console.log('form', formData)
                axios.post('https://wsr-server.herokuapp.com/subform/submission', formData)
                    .then((result) => {
                        console.log('result', result)
                        if (result.data.success) {
                            window.location.reload()
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
        const { city, allData, columns } = this.state
        const { getFieldDecorator } = this.props.form;
        return (
            <div>
                <Header {...this.props} />
                <div style={{ backgroundColor: '#E5E5E5' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'ceenter', paddingTop: 20 }}>
                        {/* <div style={{ width: '100%', justifyContent: 'center', display: 'flex', textAlign: 'center' }}>
                            {allData.length ? <Table
                                style={{ width: '94%' }}
                                columns={columns}
                                bordered={true}
                                // expandedRowRender={expandedRowRender}
                                dataSource={allData}
                            /> : <Skeleton active />}
                        </div> */}
                        <Descriptions layout="vertical" bordered column={2} style={{
                            backgroundColor: '#fff',
                            width: '60%',
                            marginBottom: 20
                        }}>
                            <Descriptions.Item span={2}>
                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                                    <Button>Edit</Button>
                                </div>
                            </Descriptions.Item>
                            <Descriptions.Item label="AgentId">Cloud Database</Descriptions.Item>
                            <Descriptions.Item label="Client Name">Prepaid</Descriptions.Item>
                            <Descriptions.Item label="Street Address" span={2}>YES</Descriptions.Item>
                            <Descriptions.Item label="Country">Cloud Database</Descriptions.Item>
                            <Descriptions.Item label="City">Prepaid</Descriptions.Item>
                            <Descriptions.Item label="Lender">Cloud Database</Descriptions.Item>
                            <Descriptions.Item label="Title Company">Prepaid</Descriptions.Item>
                            <Descriptions.Item label="Sold Price">Cloud Database</Descriptions.Item>
                            <Descriptions.Item label="Sale Type">Prepaid</Descriptions.Item>
                            <Descriptions.Item label="Transaction Fee">Cloud Database</Descriptions.Item>
                            <Descriptions.Item label="Check Recieved">Prepaid</Descriptions.Item>
                            <Descriptions.Item label="Paid Amount">Cloud Database</Descriptions.Item>
                            <Descriptions.Item label="Date">Prepaid</Descriptions.Item>
                        </Descriptions>
                        {/* <div className="card1">
                            <div>
                                <Form onSubmit={this.handleSubmit} className="login-form">
                                    <h1 className="heading1" >Review Submission Form</h1>
                                    <Form.Item
                                        style={{ display: 'inline-block', width: 'calc(50% - 3px)', marginRight: 6 }}
                                    >
                                        {getFieldDecorator('agentId', {
                                            rules: [{ required: true, message: 'Please input your First Name!' }],
                                        })(
                                            <Input
                                                minLength={3}
                                                type="text"
                                                placeholder="Agent Id"
                                            />,
                                        )}
                                    </Form.Item>
                                    <Form.Item
                                        style={{ display: 'inline-block', width: 'calc(50% - 3px)' }}
                                    >
                                        {getFieldDecorator('clientName', {
                                            rules: [{ required: true, message: 'Please input your Last Name!' }],
                                        })(
                                            <Input
                                                type="text"
                                                minLength={3}
                                                placeholder="Client Name"
                                            />,
                                        )}
                                    </Form.Item>
                                    <Form.Item className="sign-up">
                                        {getFieldDecorator('streetAddress', {
                                            rules: [{ required: true, message: 'Please input your username!' }],
                                        })(
                                            <Input
                                                style={{ backgroundColor: '#FCFCFC' }}
                                                minLength={10}
                                                placeholder="Street Address"
                                            />,
                                        )}
                                    </Form.Item>
                                    <Form.Item
                                        style={{ display: 'inline-block', width: 'calc(50% - 3px)', marginRight: 6 }}
                                    >
                                        {getFieldDecorator('country', {
                                            rules: [{ required: true, message: 'Please Select Your Country!' }],
                                        })(
                                            <Select
                                                showSearch
                                                style={{ backgroundColor: '#fff' }}
                                                placeholder="Select a Country"
                                                optionFilterProp="children"
                                                onSelect={(e) => this.setState({ city: dataCountry[e] })}
                                                filterOption={(input, option) =>
                                                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                }
                                            >
                                                {
                                                    Object.keys(dataCountry).map((v, i) => {
                                                        return <Option value={v} key={i}>{v}</Option>
                                                    })
                                                }
                                            </Select>,
                                        )}
                                    </Form.Item>
                                    <Form.Item
                                        style={{ display: 'inline-block', width: 'calc(50% - 3px)' }}
                                    >
                                        {getFieldDecorator('city', {
                                            rules: [{ required: true, message: 'Please Select Your City!' }],
                                        })(
                                            <Select
                                                showSearch
                                                style={{ backgroundColor: '#fff' }}
                                                placeholder="Select a city"
                                                optionFilterProp="children"
                                                filterOption={(input, option) =>
                                                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                }
                                            >
                                                {
                                                    city.map((v, i) => {
                                                        return <Option city={v} key={i}>{v}</Option>
                                                    })
                                                }
                                            </Select>,
                                        )}
                                    </Form.Item>
                                    <Form.Item
                                        style={{ display: 'inline-block', width: 'calc(50% - 3px)', marginRight: 6 }}
                                    >
                                        {getFieldDecorator('lender', {
                                            rules: [{ required: true, message: 'Please input your First Name!' }],
                                        })(
                                            <Input
                                                minLength={3}
                                                type="text"
                                                placeholder="Lender"
                                            />,
                                        )}
                                    </Form.Item>
                                    <Form.Item
                                        style={{ display: 'inline-block', width: 'calc(50% - 3px)' }}
                                    >
                                        {getFieldDecorator('title', {
                                            rules: [{ required: true, message: 'Please input your Last Name!' }],
                                        })(
                                            <Input
                                                type="text"
                                                minLength={3}
                                                placeholder="Title Company"
                                            />,
                                        )}
                                    </Form.Item>
                                    <Form.Item
                                        style={{ display: 'inline-block', width: 'calc(50% - 3px)', marginRight: 6 }}
                                    >
                                        {getFieldDecorator('soldPrice', {
                                            rules: [{ required: true, message: 'Please input your First Name!' }],
                                        })(
                                            <Input
                                                type="number"
                                                placeholder="Sold Price"
                                            />,
                                        )}
                                    </Form.Item>
                                    <Form.Item
                                        style={{ display: 'inline-block', width: 'calc(50% - 3px)' }}
                                    >
                                        {getFieldDecorator('saleType', {
                                            rules: [{ required: true, message: 'Please input your Last Name!' }],
                                        })(
                                            <Input
                                                type="text"
                                                minLength={3}
                                                placeholder="Sale Type"
                                            />,
                                        )}
                                    </Form.Item>
                                    <Form.Item
                                        style={{ display: 'inline-block', width: 'calc(50% - 3px)', marginRight: 6 }}
                                    >
                                        {getFieldDecorator('transactionFee', {
                                            rules: [{ required: true, message: 'Please input your First Name!' }],
                                        })(
                                            <Input
                                                type="number"
                                                placeholder="Transaction Fee"
                                            />,
                                        )}
                                    </Form.Item>
                                    <Form.Item
                                        style={{ display: 'inline-block', width: 'calc(50% - 3px)' }}
                                    >
                                        {getFieldDecorator('checkRec', {
                                            rules: [{ required: true, message: 'Please input your Last Name!' }],
                                        })(
                                            <Input
                                                type="text"
                                                placeholder="Check Recieved"
                                            />,
                                        )}
                                    </Form.Item>
                                    <Form.Item
                                        style={{ display: 'inline-block', width: 'calc(50% - 3px)', marginRight: 6 }}
                                    >
                                        {getFieldDecorator('paidAmount', {
                                            rules: [{ required: true, message: 'Please input your First Name!' }],
                                        })(
                                            <Input
                                                type="number"
                                                placeholder="Paid Amount"
                                            />,
                                        )}
                                    </Form.Item>
                                    <Form.Item
                                        style={{ display: 'inline-block', width: 'calc(50% - 3px)' }}
                                    >
                                        {getFieldDecorator('paidDate', {
                                            rules: [{ required: true, message: 'Please input your Last Name!' }],
                                        })(
                                            <DatePicker style={{ width: '100%' }} />,
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
                                        <Button htmlType="submit" disabled={this.state.disable} style={{ backgroundColor: '#120894', color: 'white', fontWeight: 'bold', fontSize: 14, height: 40, display: 'flex', width: '100%', textAlign: 'center', justifyContent: 'center', alignItems: 'center', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}>
                                            Sign Up
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>
        )
    }
}

const ReviewForm = Form.create({ name: 'normal_login' })(Review);

const mapStateToProps = (state) => {
    console.log("mapToState", state.authReducer)
    return {
        user: state.authReducer.user,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        loginUser: (user) => dispatch(loginUser(user)),
    }
}



export default connect(mapStateToProps, mapDispatchToProps)(ReviewForm)