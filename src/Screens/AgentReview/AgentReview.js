import React, { Component } from 'react';
import { loginUser } from '../../Redux/actions/authActions'
import { connect } from 'react-redux';
import Loader from '../../Components/Loader';
import logo from '../../assets/images/logo-dark.png';
import Header from '../Header/Header'
import { Link } from 'react-router-dom'
import dataCountry from '../../city'
import validator from 'validator'
import { toast } from 'react-toastify';
import axios from 'axios'
import { Form, Icon, Input, Button, Upload, Descriptions, Select, DatePicker, message, List, Table, Skeleton, Avatar } from 'antd';
import moment from 'moment';

const { Option } = Select
const { Dragger } = Upload


const props = {
    name: 'file',
    multiple: true,
    action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
    onChange(info) {
        const { status } = info.file;
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
            isData: true,
            allData: [],
            viewForm: null,
            loading: true,
            edit: false,
            disable: false,
            saleType: ["Buy", "Sell", "Rental", "Whole", "Referral"],
            columns: [
                {
                    title: 'Street Address',
                    dataIndex: 'address',
                    render: text => <Link to="#">{text.length > 30 ? `${text.slice(0, 30)}...` : text}</Link>
                },
                {
                    title: 'Sold Price',
                    dataIndex: 'status',
                    render: text => <p>${text.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
                },
                {
                    title: 'Submission Date',
                    dataIndex: 'date'
                },
                {
                    title: 'Status',
                    dataIndex: 'status1'
                },
                {
                    title: 'Action',
                    dataIndex: 'action',
                    render: (v) => <div>
                        <Button onClick={() => this.setState({ viewForm: v })} type="secondary" style={{ marginBottom: 5 }} block>
                            Details
                            </Button>
                    </div>
                }
            ]
        }
    }

    normFile = e => {
        return e && e.fileList;
    }

    async componentWillMount() {
        const { allData } = this.state
        const { user } = this.props
        await axios.get(`https://wsr-hermes-server786.herokuapp.com/subform/get-user/${user._id}`)
            .then((res) => {
                const { data } = res.data
                data.map((v, i) => {
                    v.date = moment(v.paidDate).toObject()
                    return allData.push({
                        key: i,
                        address: v.streetAddress,
                        status: v.soldPrice,
                        status1: v.review ? "Approved" : "Pending",
                        date: v.timestamp.split(' ').slice(0, 4).join(" "),
                        action: v
                    })
                })
                this.setState({ allData, isData: allData.length ? true : false, loading: false })
            })
            .catch((err) => toast.error("Simething Went Wrong!!!"))
    }

    handleSubmit = e => {
        const { city, viewForm } = this.state
        e.preventDefault();

        this.props.form.validateFields((err, values) => {
            if (!err) {
                if (values.city !== viewForm.city) {
                    values.city = city[values.city]
                }

                this.setState({ disable: true })
                var formData = new FormData();
                try {
                    for (var i = 0; i < values.upload.length; i++) {
                        formData.append(`upload${i}`, values.upload[i].originFileObj)
                    }
                }
                catch (e) {

                }
                finally {
                    formData.append('agentId', viewForm.agentId)
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
                    formData.append('_id', viewForm._id)
                    formData.append('zip', viewForm.zip)
                    formData.append('files', JSON.stringify(viewForm.files))
                    axios.post('https://wsr-hermes-server786.herokuapp.com/subform/update-agent-form', formData)
                        .then((result) => {
                            if (result.data.success) {
                                toast.success("Updated successfully!!!")
                                setTimeout(() => {
                                    window.location.reload()
                                }, 1000)
                            }
                            else {
                                this.setState({ disable: false })
                                toast.error("Something Went Wrong!!!")
                            }
                        })
                        .catch((err) => {
                            this.setState({ disable: false })
                            toast.error("Something Went Wrong!!!")
                        })
                }

            }
        });
    };

    formEdit() {
        this.setState({ edit: true, city: dataCountry[this.state.viewForm.country] })
    }


    delFile(item) {
        const { viewForm } = this.state
        axios.post('https://wsr-hermes-server786.herokuapp.com/subform/del-file', {
            file: item,
            _id: viewForm._id
        })
            .then((result) => {
                if (result.data.success) {
                    result.data.data.date = moment(result.data.data.paidDate).toObject()
                    toast.success("File Deleted Successfully!!!")
                    this.setState({
                        viewForm: result.data.data
                    })
                }
                else {
                    toast.error("Something Went Wrong!!!")
                }
            })
            .catch((err) => {
                toast.error("Something Went Wrong!!!")
            })
    }

    approveForm(id) {
        axios.post('https://wsr-hermes-server786.herokuapp.com/subform/approve', { id })
            .then((result) => {
                if (result.data.success) {
                    window.location.reload()
                }
                else {
                    // this.setState({ loading: false, disable: false })
                    toast.error("Something Went Wrong!!!")
                }
            })
            .catch((err) => {
                toast.error("Something Went Wrong!!!")
            })
    }


    render() {
        const { city, allData, columns, isData, viewForm, edit, loading, saleType } = this.state
        const { getFieldDecorator } = this.props.form;
        return (
            <div>
                <Header {...this.props} />
                <div style={{ backgroundColor: '#E5E5E5' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'ceenter', paddingTop: 20 }}>
                        {!viewForm && !edit ? <div style={{ width: '100%', justifyContent: 'center', display: 'flex', textAlign: 'center' }}>
                            <Table
                                style={{ width: '94%' }}
                                columns={columns}
                                bordered={true}
                                HasData={isData}
                                dataSource={allData}
                                loading={loading}
                                tableLayout={'fixed'}
                            />
                        </div> :
                            viewForm && !edit ? <Descriptions bordered column={1} style={{
                                backgroundColor: '#fff',
                                width: '60%',
                                marginBottom: 20
                            }}>
                                <Descriptions.Item span={2}>
                                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                        {<Button onClick={() => this.setState({ viewForm: false })}>
                                            <Icon type="left" />
                                            Back
                                            </Button>}
                                        {!viewForm.review ? <Button onClick={() => this.formEdit()} style={{ marginRight: 5 }}>Edit</Button> : null}
                                    </div>
                                </Descriptions.Item>
                                <Descriptions.Item label="Client Name">{viewForm.clientName}</Descriptions.Item>
                                <Descriptions.Item label="Street Address">{viewForm.streetAddress}</Descriptions.Item>
                                <Descriptions.Item label="Country">{viewForm.country}</Descriptions.Item>
                                <Descriptions.Item label="City">{viewForm.city}</Descriptions.Item>
                                <Descriptions.Item label="Zip Code">{viewForm.zip}</Descriptions.Item>
                                <Descriptions.Item label="Lender">{viewForm.lender}</Descriptions.Item>
                                <Descriptions.Item label="Title Company">{viewForm.title}</Descriptions.Item>
                                <Descriptions.Item label="Sold Price">{viewForm.soldPrice}</Descriptions.Item>
                                <Descriptions.Item label="Sale Type">{viewForm.saleType}</Descriptions.Item>
                                <Descriptions.Item label="Transaction Fee">{viewForm.transactionFee}</Descriptions.Item>
                                <Descriptions.Item label="Check Recieved">{viewForm.checkRec}</Descriptions.Item>
                                <Descriptions.Item label="Paid Amount">{viewForm.paidAmount}</Descriptions.Item>
                                <Descriptions.Item label="Date">{viewForm.paidDate}</Descriptions.Item>
                                <Descriptions.Item label="Files">
                                    {viewForm.files.length ? <List
                                        style={{ backgroundColor: '#fff', marginBottom: 10 }}
                                        itemLayout="horizontal"
                                        dataSource={viewForm.files ? viewForm.files : []}
                                        bordered={true}
                                        pagination={true}
                                        renderItem={item => (
                                            <List.Item
                                                actions={[<a key="list-loadmore-edit" target="_blank" href={item.url}>View</a>]}
                                            >
                                                <Skeleton avatar title={false} loading={item.loading} active>
                                                    <List.Item.Meta
                                                        avatar={
                                                            <Avatar src={item.url} />
                                                        }
                                                        title={<a href="#">{item.public_id.split('/')[3].length > 20 ? `${item.public_id.split('/')[3].slice(0, 20)}...` : item.public_id.split('/')[3]}</a>}
                                                    />
                                                </Skeleton>
                                            </List.Item>
                                        )}
                                    /> : "No Files"}
                                </Descriptions.Item>
                            </Descriptions> :
                                <div className="card1">
                                    <div>
                                        <Form
                                            onSubmit={this.handleSubmit}
                                            className="login-form"
                                            hideRequiredMark={true}
                                            encType="multipart/form-data">
                                            <h1 className="heading1" >Review Submission Form</h1>
                                            <Form.Item
                                                label="Client Name"
                                            >
                                                {getFieldDecorator('clientName', {
                                                    initialValue: viewForm.clientName,
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
                                                label="Street Address"
                                                className="sign-up">
                                                {getFieldDecorator('streetAddress', {
                                                    initialValue: viewForm.streetAddress,
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
                                                    initialValue: viewForm.country,
                                                    rules: [{ required: true, message: 'Please Select State!' }],
                                                })(
                                                    <Select
                                                        showSearch
                                                        style={{ backgroundColor: '#fff' }}
                                                        placeholder="Select State"
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
                                                label="City"
                                            >
                                                {getFieldDecorator('city', {
                                                    initialValue: viewForm.city,
                                                    rules: [{ required: true, message: 'Please input City!' }],
                                                })(
                                                    <Input
                                                        minLength={1}
                                                        type="text"
                                                        placeholder="City"
                                                    />,
                                                )}
                                            </Form.Item>
                                            <Form.Item
                                                label="Zip Code"
                                            >
                                                {getFieldDecorator('zip', {
                                                    initialValue: viewForm.zip,
                                                    rules: [{ required: true, message: 'Please input Lender!' }],
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
                                                    initialValue: viewForm.lender,
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
                                                    initialValue: viewForm.title,
                                                    rules: [{ required: true, message: 'Please input Title!' }],
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
                                                    initialValue: viewForm.soldPrice,
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
                                                    initialValue: viewForm.saleType,
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
                                                    initialValue: viewForm.transactionFee,
                                                    rules: [{ required: true, message: 'Please input Transaction Fee!' }],
                                                })(
                                                    <Input
                                                        type="number"
                                                        placeholder="Transaction Fee"
                                                    />,
                                                )}
                                            </Form.Item>
                                            <Form.Item
                                                label="Check"
                                            >
                                                {getFieldDecorator('checkRec', {
                                                    initialValue: viewForm.checkRec,
                                                    rules: [{ required: true, message: 'Check Received !' }],
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
                                                    initialValue: viewForm.paidAmount,
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
                                                    initialValue: moment(`${viewForm.date.years}-${viewForm.date.months}-${viewForm.date.days}/`, 'YYYY/MM/DD'),
                                                    rules: [{ required: true, message: 'Please Select Submission Date!' }],
                                                })(
                                                    <DatePicker style={{ width: '100%' }} placeholder="Submission Date" />,
                                                )}
                                            </Form.Item>
                                            {viewForm.files.length ? <List
                                                style={{ backgroundColor: '#fff', marginBottom: 10 }}
                                                itemLayout="horizontal"
                                                dataSource={viewForm.files ? viewForm.files : []}
                                                bordered={true}
                                                pagination={true}
                                                renderItem={item => (
                                                    <List.Item
                                                        actions={[<a key="list-loadmore-edit" target="_blank" href={item.url}>View</a>, <a style={{ color: 'red' }} key="list-loadmore-edit" onClick={() => this.delFile(item)} >Delete</a>]}
                                                    >
                                                        <Skeleton avatar title={false} loading={item.loading} active>
                                                            <List.Item.Meta
                                                                avatar={
                                                                    <Avatar src={item.url} />
                                                                }
                                                                title={<a href="#">{item.public_id.split('/')[3].length > 20 ? `${item.public_id.split('/')[3].slice(0, 20)}...` : item.public_id.split('/')[3]}</a>}
                                                            />
                                                        </Skeleton>
                                                    </List.Item>
                                                )}
                                            /> : null}
                                            <Form.Item className="sign-up">
                                                {getFieldDecorator('upload', {
                                                    valuePropName: 'fileList',
                                                    getValueFromEvent: this.normFile,
                                                    rules: [{ required: false }]
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
                                                <Button htmlType="submit" disabled={this.state.disable} loading={this.state.disable} style={{ backgroundColor: '#120894', color: 'white', fontWeight: 'bold', fontSize: 14, height: 40, display: 'flex', width: '100%', textAlign: 'center', justifyContent: 'center', alignItems: 'center', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}>
                                                    Update
                                        </Button>
                                                <Button disabled={this.state.disable} style={{ fontWeight: 'bold', fontSize: 14, height: 40, display: 'flex', width: '100%', textAlign: 'center', justifyContent: 'center', alignItems: 'center', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)', marginTop: 10 }} onClick={() => window.location.reload()}>
                                                    Cancel
                                        </Button>
                                            </Form.Item>
                                        </Form>
                                    </div>
                                </div>}
                    </div>
                </div>
            </div>
        )
    }
}

const ReviewForm = Form.create({ name: 'normal_login' })(Review);

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



export default connect(mapStateToProps, mapDispatchToProps)(ReviewForm)