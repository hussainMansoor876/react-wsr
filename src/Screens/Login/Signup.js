import React, { Component } from 'react';
import { loginUser } from '../../Redux/actions/authActions'
import { connect } from 'react-redux';
import { Link } from 'react-router-dom'
import { Form, Icon, Input, Button, notification, Select, DatePicker } from 'antd';
import Loader from '../../Components/Loader';
import data from '../../city'
import logo from '../../assets/images/logo-dark.png';
import validator from 'validator'
import { toast } from 'react-toastify';
import axios from 'axios'


const { Option } = Select

const title = "Error"


class Signup extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            city: [],
            loading: false,
            disable: false
        }
    }

    componentDidMount() {
        const { user, history } = this.props;
        if (user) {
            history.replace('/dashboard')
        }
    }

    validateToNextPassword = (rule, value, callback) => {
        const { form } = this.props;
        if (value && this.state.confirmDirty) {
            form.validateFields(['confirm'], { force: true });
        }
        callback();
    };

    compareToFirstPassword = (rule, value, callback) => {
        const { form } = this.props;
        if (value && value !== form.getFieldValue('password')) {
            callback('Two passwords that you enter is inconsistent!');
        } else {
            callback();
        }
    };

    openNotification = (title, desc, icon, color = '#108ee9') => {
        notification.open({
            message: title,
            description: desc,
            icon: <Icon type={icon} style={{ color: color }} />,
        });
    };

    handleSubmit = e => {
        const { city } = this.state
        e.preventDefault();

        this.props.form.validateFields((err, values) => {
            if (!err) {
                if (!validator.isEmail(values.email)) {
                    return toast.error("Invalid Email!");
                }
                else if (values.phone.length < 6) {
                    return toast.error("Phone number must be Atleast 6 Digits!");
                }
                else if (values.password.length < 6) {
                    return toast.error("Password must be Atleast 6 Digits!");
                }
                else if (values.address.length < 6) {
                    return toast.error("Address must be Atleast 6 Digits!");
                }
                else if (values.zip.length < 4) {
                    return toast.error("Zip code must be Atleast 4 Numbers!");
                }
                this.setState({ loading: true, disable: true })
                axios.post('https://wsr-hermes-server786.herokuapp.com/login/signup', values)
                    .then((result) => {
                        if (result.data.success) {
                            this.props.loginUser(result.data.user)
                            this.props.history.push('/review')
                        }
                        else {
                            this.setState({ loading: false, disable: false })
                            this.openNotification(title, result.data.message, 'close-circle', 'red')
                        }
                    })
                    .catch((err) => {
                        toast.error('Something Went Wrong!!!')
                    })
            }
        });
    };


    render() {
        const { getFieldDecorator } = this.props.form;
        const { city } = this.state
        return (
            <div className="authentication-bg authentication-bg-pattern">
                <div className="account-pages mt-5 mb-5">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-md-8 col-lg-6 col-xl-5">
                                <div className="card bg-pattern">

                                    <div className="card-body p-4">

                                        <div className="text-center w-75 m-auto">
                                            <a href="index.html">
                                                <span><img src={logo} alt="" height="100" width="200" /></span>
                                            </a>
                                            <p className="text-muted mb-4 mt-3">Don't have an account? Create your account, it takes less than a minute</p>
                                        </div>
                                        <Form layout="horizontal"
                                            hideRequiredMark={true}
                                            onSubmit={this.handleSubmit}
                                            className="login-form"
                                        >
                                            <Form.Item
                                                label="First Name"
                                                style={{ display: 'inline-block', width: 'calc(50% - 1px)', marginRight: 1 }}
                                            >
                                                {getFieldDecorator('fname', {
                                                    rules: [{ required: true, message: 'Please input your First Name!' }],
                                                })(
                                                    <Input
                                                        prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                                        placeholder="First Name"
                                                    />,
                                                )}
                                            </Form.Item>
                                            <Form.Item
                                                label="Last Name"
                                                style={{ display: 'inline-block', width: 'calc(50% - 1px)' }}
                                            >
                                                {getFieldDecorator('lname', {
                                                    rules: [{ required: true, message: 'Please input your Last Name!' }],
                                                })(
                                                    <Input
                                                        prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                                        placeholder="Last Name"
                                                    />,
                                                )}
                                            </Form.Item>
                                            <Form.Item
                                                label="Email"
                                            >
                                                {getFieldDecorator('email', {
                                                    rules: [{ required: true, message: 'Please input your Last Name!' }],
                                                })(
                                                    <Input
                                                        prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                                        placeholder="Email"
                                                    />,
                                                )}
                                            </Form.Item>
                                            <Form.Item
                                                label="Phone"
                                            >
                                                {getFieldDecorator('phone', {
                                                    rules: [{ required: true, message: 'Please input your phone number!' }],
                                                })(<Input
                                                    prefix={<Icon type="mobile" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                                    placeholder="Phone Number"
                                                />)}
                                            </Form.Item>
                                            <Form.Item
                                                label="Password"
                                                style={{ display: 'inline-block', width: 'calc(50% - 1px)', marginRight: 1 }}
                                                hasFeedback>
                                                {getFieldDecorator('password', {
                                                    rules: [
                                                        {
                                                            required: true,
                                                            message: 'Please input your password!',
                                                        },
                                                        {
                                                            validator: this.validateToNextPassword,
                                                        },
                                                    ],
                                                })(<Input.Password
                                                    prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                                    placeholder="Enter your Password" />)}
                                            </Form.Item>
                                            <Form.Item
                                                label="Confirm"
                                                style={{ display: 'inline-block', width: 'calc(50% - 1px)' }}
                                                hasFeedback>
                                                {getFieldDecorator('confirm', {
                                                    rules: [
                                                        {
                                                            required: true,
                                                            message: 'Please confirm your password!',
                                                        },
                                                        {
                                                            validator: this.compareToFirstPassword,
                                                        },
                                                    ],
                                                })(<Input.Password
                                                    prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                                    placeholder="Confirm Password"
                                                    onBlur={this.handleConfirmBlur} />)}
                                            </Form.Item>
                                            <Form.Item
                                                label="Address"
                                            >
                                                {getFieldDecorator('address', {
                                                    rules: [{ required: true, message: 'Please input your street address!' }],
                                                })(<Input
                                                    prefix={<Icon type="number" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                                    placeholder="Street Address"
                                                />)}
                                            </Form.Item>
                                            <Form.Item
                                                label="State"
                                                style={{ display: 'inline-block', width: 'calc(50% - 1px)', marginRight: 1 }}
                                            >
                                                {getFieldDecorator('country', {
                                                    rules: [{ required: true, message: 'Please Select Your Country!' }],
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
                                                style={{ display: 'inline-block', width: 'calc(50% - 1px)' }}
                                            >
                                                {getFieldDecorator('city', {
                                                    rules: [{ required: true, message: 'Please input Your City!' }],
                                                })(
                                                    <Input
                                                        prefix={<Icon type="number" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                                        placeholder="City"
                                                    />,
                                                )}
                                            </Form.Item>
                                            <Form.Item
                                            label="Zip Code"
                                            >
                                                {getFieldDecorator('zip', {
                                                    rules: [{ required: true, message: 'Please input your zip code!' }],
                                                })(<Input
                                                    prefix={<Icon type="number" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                                    placeholder="Zip Code"
                                                />)}
                                            </Form.Item>
                                            <Form.Item>
                                                <Button disabled={this.state.disable} loading={this.state.loading} type="primary" htmlType="submit" className="login-form-button btn-block signup-btn">
                                                    Register
                                                </Button>
                                                Already have account? <Link to="" className="login-form-forgot" style={{ color: '#1abc9c' }}>Sign In</Link>
                                            </Form.Item>
                                        </Form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const SignupComp = Form.create({ name: 'normal_login' })(Signup);



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



export default connect(mapStateToProps, mapDispatchToProps)(SignupComp)