import React, { Component } from 'react';
import { loginUser, removeUser } from '../../Redux/actions/authActions'
import { connect } from 'react-redux';
import { Link } from 'react-router-dom'
import Loader from '../../Components/Loader';
import { Form, Icon, Input, Button, Checkbox, notification } from 'antd';
import logo from '../../assets/images/logo-dark.png';
import { toast } from 'react-toastify';
import axios from 'axios'
import validator from 'validator'

const title = "Error"


class Login extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            disable: false
        }
    }

    componentDidMount() {
        const { user, history } = this.props;
        if (history.location.state) {
            this.props.removeUser()
        }
        if (user) {
            this.props.history.replace('/review')
        }
    }


    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                if (!validator.isEmail(values.email)) {
                    return toast.error("Invalid Email!");
                }
                else if (values.password.length < 6) {
                    return toast.error("Password must be Atleast 6 Digits!");
                }
                this.setState({ loading: true, disable: true })
                axios.post('https://wsr-hermes-server786.herokuapp.com/login/signin', values)
                    .then((result) => {
                        if (result.data.success) {
                            this.props.loginUser(result.data.user)
                            if (result.data.user.role === "agent") {
                                this.props.history.push('/submission')
                            }
                            else {
                                this.props.history.push('/dashboard')
                            }
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

    openNotification = (title, desc, icon, color = '#108ee9') => {
        notification.open({
            message: title,
            description: desc,
            icon: <Icon type={icon} style={{ color: color }} />,
        });
    };


    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <div className="authentication-bg">
                <div className="account-pages mt-5 mb-5">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-md-8 col-lg-6 col-xl-5">
                                <div className="card bg-pattern">

                                    <div className="card-body p-4">

                                        <div className="text-center w-75 m-auto">
                                            <Link to="/">
                                                <span><img src={logo} alt="" height="100" width="200" /></span>
                                            </Link>
                                            <p className="text-muted mb-4 mt-3">Enter your email address and password to access admin panel.</p>
                                        </div>
                                        <Form
                                            hideRequiredMark={true}
                                            onSubmit={this.handleSubmit}
                                            className="login-form">
                                            <Form.Item
                                                label="Email"
                                            >
                                                {getFieldDecorator('email', {
                                                    rules: [{ required: true, message: 'Please input your Email!' }],
                                                })(
                                                    <Input
                                                        prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                                        placeholder="Email"
                                                    />,
                                                )}
                                            </Form.Item>
                                            <Form.Item
                                                label="Password"
                                            >
                                                {getFieldDecorator('password', {
                                                    rules: [{ required: true, message: 'Please input your Password!' }],
                                                })(
                                                    <Input
                                                        prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                                        type="password"
                                                        placeholder="Password"
                                                    />,
                                                )}
                                            </Form.Item>
                                            <Form.Item>
                                                {getFieldDecorator('remember', {
                                                    valuePropName: 'checked',
                                                    initialValue: true,
                                                })(<Checkbox>Remember me</Checkbox>)}
                                                <Link className="login-form-forgot textColor" to="/recover" >
                                                    Forgot password
                                                    </Link>
                                                <Button disabled={this.state.disable} loading={this.state.loading} type="primary" htmlType="submit" className="login-form-button btn-block btn-color">
                                                    Log in
                                                </Button>
                                                Don't have an account? <Link to="/register" className="login-form-forgot textColor">Sign Up</Link>
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

const LoginComp = Form.create({ name: 'normal_login' })(Login);

const mapStateToProps = (state) => {

    return {
        user: state.authReducer.user,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        loginUser: (user) => dispatch(loginUser(user)),
        removeUser: () => dispatch(removeUser())
    }
}



export default connect(mapStateToProps, mapDispatchToProps)(LoginComp)