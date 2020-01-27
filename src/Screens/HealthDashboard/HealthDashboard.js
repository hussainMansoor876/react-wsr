import React, { Component } from 'react';
import { loginUser } from '../../Redux/actions/authActions'
import { connect } from 'react-redux';
import Loader from '../../Components/Loader';
import { DatePicker } from 'antd';
import Header from '../Header/Header'
import moment from 'moment';

const { MonthPicker, RangePicker } = DatePicker;


const data = {
    labels: [
        'Red',
        'Green',
        'Yellow'
    ],
    datasets: [{
        data: [300, 50, 100],
        backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56'
        ],
        hoverBackgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56'
        ]
    }]
};

class Dashboard extends React.Component {

    constructor(props) {
        super(props)
        this.state = {

        }
    }

    range(start, end) {
        const result = [];
        for (let i = start; i < end; i++) {
            result.push(i);
        }
        return result;
    }

    disabledDate(current) {
        // Can not select days before today and today
        return current && current < moment().endOf('day');
    }

    disabledDateTime() {
        return {
            disabledHours: () => this.range(0, 24).splice(4, 20),
            disabledMinutes: () => this.range(30, 60),
            disabledSeconds: () => [55, 56],
        };
    }

    disabledRangeTime(_, type) {
        if (type === 'start') {
            return {
                disabledHours: () => this.range(0, 60).splice(4, 20),
                disabledMinutes: () => this.range(30, 60),
                disabledSeconds: () => [55, 56],
            };
        }
        return {
            disabledHours: () => this.range(0, 60).splice(20, 4),
            disabledMinutes: () => this.range(0, 31),
            disabledSeconds: () => [55, 56],
        };
    }


    render() {
        return (
            <div>
                <Header {...this.props} />
                <div style={{ backgroundColor: '#E5E5E5' }}>
                    <div className="dashboardHeader" style={{ justifyContent: 'center', alignItems: 'center', paddingTop: 20 }}>
                        Woodward Square Reality Health Report
                    </div>
                    <div style={{ display: 'flex', margin: 20, flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
                        <RangePicker
                            disabledDate={this.disabledDate.bind(this)}
                            // disabledTime={this.disabledRangeTime.bind(this)}
                            // showTime={{
                            //     hideDisabledOptions: true,
                            //     defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('11:59:59', 'HH:mm:ss')],
                            // }}
                            format="YYYY-MM-DD"
                        />
                    </div>
                    <div style={{ textAlign: 'center', display: 'block', margin: 10 }}>
                        <div class="boxes1">
                            <p className="headingText">Net Revenue</p>
                            <p className="text">$15.23</p>
                            <div style={{ display: 'flex' }}>
                                <p className="textBottom">15.10%</p>
                                <p className="textBottom1">&nbsp;(31 days)</p>
                            </div>
                        </div>
                        <div class="boxes1">
                            <p className="headingText">Net Revenue</p>
                            <p className="text">$15.23</p>
                            <div style={{ display: 'flex' }}>
                                <p className="textBottom">15.10%</p>
                                <p className="textBottom1">&nbsp;(31 days)</p>
                            </div>
                        </div>
                        <div class="boxes1">
                            <p className="headingText">Net Revenue</p>
                            <p className="text">$15.23</p>
                            <div style={{ display: 'flex' }}>
                                <p className="textBottom">15.10%</p>
                                <p className="textBottom1">&nbsp;(31 days)</p>
                            </div>
                        </div>
                        <div class="boxes1">
                            <p className="headingText">Net Revenue</p>
                            <p className="text">$15.23</p>
                            <div style={{ display: 'flex' }}>
                                <p className="textBottom">15.10%</p>
                                <p className="textBottom1">&nbsp;(31 days)</p>
                            </div>
                        </div>
                        <div class="boxes1">
                            <p className="headingText">Net Revenue</p>
                            <p className="text">$15.23</p>
                            <div style={{ display: 'flex' }}>
                                <p className="textBottom">15.10%</p>
                                <p className="textBottom1">&nbsp;(31 days)</p>
                            </div>
                        </div>
                        <div class="boxes1">
                            <p className="headingText">Net Revenue</p>
                            <p className="text">$15.23</p>
                            <div style={{ display: 'flex' }}>
                                <p className="textBottom">15.10%</p>
                                <p className="textBottom1">&nbsp;(31 days)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}



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



export default connect(mapStateToProps, mapDispatchToProps)(Dashboard)