import React from 'react';
import { loginUser } from '../../Redux/actions/authActions'
import { connect } from 'react-redux';
import { DatePicker, Select, Skeleton, Button } from 'antd';
import moment from 'moment';
import Chart from 'react-apexcharts'
import axios from 'axios'
import RevenueOverview from './RevenueOverview'
import AgentSummary from './AgentSummary'
import AgentPerformance from './AgentPerformance'
import SelectComp from './SelectComponent'
import Header from '../Header/Header'
import allState from './allState'
import { toast } from 'react-toastify';

class Dashboard extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            ...allState
        }
    }

    range(start, end) {
        const result = [];
        for (let i = start; i < end; i++) {
            result.push(i);
        }
        return result;
    }

    distribute(max, buckets) {
        var arr = [], rpt = max / buckets, groupLiteral_low;
        for (var i = 0; i < max; i += rpt) {
            if (Math.ceil(i) !== i || i === 0) {
                groupLiteral_low = Math.ceil(i);
            } else {
                groupLiteral_low = Math.ceil(i) + 1;
            }
            arr.push({
                limit: (Math.floor(rpt + i)),
                literal: `[$${groupLiteral_low}, $${Math.floor(rpt + i)}]`,
                min: groupLiteral_low,
                max: Math.floor(rpt + i)
            });
        }
        return arr;
    }

    disabledEndDate(current) {
        return current < moment(this.state.StartDateValue).add(1, 'day')
    }

    disableDate(current) {
        return current > moment(this.state.endDate).add(-1, 'day')
    }

    async componentWillMount() {
        const { startDate, endDate } = this.state
        var yData = {}
        var topData = { ...this.state.topData }
        var histData = { ...this.state.salePriceHist }
        var lineData = { ...this.state.lineChart }
        var saleAmount = { ...this.state.SaleAmountChart }
        var AgentData = { ...this.state.AgentChart }
        var sortableId = []
        var sortableVal = []
        var obj = { "Buy": 0, "Sell": 0, "Rental": 0, "Whole": 0, "Referral": 0 }
        var arr = []
        var allObj = {}
        axios.post('https://wsr-hermes-server786.herokuapp.com/admin/getAll', {
            startDate: startDate.toArray(),
            endDate: endDate.toArray()
        })
            .then((res) => {
                var { data } = res
                if (data.success) {
                    if (data.data.length) {
                        var len = data.data.length
                        var maxVal = Math.max.apply(Math, data.data.map(v => v.soldPrice))
                        var record = this.distribute(maxVal, 5)
                        var arr1 = record.map(v => v.literal)
                        histData.options.xaxis.categories = arr1
                        var saleObj = {}
                        for (var ind of arr1) {
                            saleObj[ind] = 0
                        }
                        maxVal = maxVal / 5
                        for (var i of data.data) {
                            if (!allObj[i.agentId]) {
                                allObj[i.agentId] = 0
                            }
                            if (!yData[moment(i.timestamp).year()]) {
                                yData[moment(i.timestamp).year()] = {
                                    month: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0 },
                                    monthLine: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0 }
                                }
                            }
                            yData[moment(i.timestamp).year()]['month'][moment(i.timestamp).month()] += i.paidAmount
                            yData[moment(i.timestamp).year()]['monthLine'][moment(i.timestamp).month()] += 1
                            topData.netRevenue += i.paidAmount
                            topData.salesPerDeal += i.soldPrice
                            obj[i.saleType] += i.paidAmount
                            allObj[i.agentId] += 1
                            if (i.soldPrice <= maxVal) {
                                saleObj[arr1[0]] += 1
                            }
                            else if (i.soldPrice <= maxVal * 2) {
                                saleObj[arr1[1]] += 1
                            }
                            else if (i.soldPrice <= maxVal * 3) {
                                saleObj[arr1[2]] += 1
                            }
                            else if (i.soldPrice <= maxVal * 4) {
                                saleObj[arr1[3]] += 1
                            }
                            else {
                                saleObj[arr1[4]] += 1
                            }
                        }
                        topData.revPerDeal = topData.netRevenue / len
                        topData.salesPerDeal = topData.salesPerDeal / len
                        topData.deals = len
                        lineData.series[0].data = Object.entries(yData[startDate.year()]['month']).map(v => v[1])
                        lineData.series[1].data = Object.entries(yData[startDate.year()]['monthLine']).map(v => v[1])
                        saleAmount.series[0].data = Object.entries(yData[startDate.year()]['month']).map(v => v[1])
                        histData.series[0].data = Object.entries(saleObj).map(v => v[1])
                        var sortable = [];
                        for (var vehicle in allObj) {
                            sortable.push([vehicle, allObj[vehicle]]);
                        }

                        sortable.sort((a, b) => {
                            return a[1] - b[1];
                        }).reverse()

                        sortableId = sortable.map(v => v[0])
                    }
                    for (var j in obj) {
                        arr.push(obj[j])
                    }
                    this.setState({
                        topData: topData, saleTypeChart: {
                            ...this.state.saleTypeChart, series: arr
                        }, salePriceHist: histData, lineChart: lineData,
                        SaleAmountChart: saleAmount,
                        dashData: data.data,
                        yearsData: yData
                    })
                }

                axios.get('https://wsr-hermes-server786.herokuapp.com/admin/getusers')
                    .then((res) => {
                        var { data } = res.data
                        var sortableName = []
                        topData.activeAgent = data.length
                        this.setState({ allData: data, topData: topData }, () => {
                            var { allData, stats } = this.state
                            for (var k of sortableId) {
                                for (var d of allData) {
                                    if (d._id === k) {
                                        sortableName.push(d.fname)
                                        sortableVal.push(allObj[k])
                                    }
                                }
                            }
                            AgentData.series[0].data = sortableVal.length > 10 ? sortableVal.slice(0, 10) : sortableVal
                            AgentData.options.xaxis.categories = sortableName.length > 10 ? sortableName.slice(0, 10) : sortableName
                            if (allData.length) {
                                axios.post(`https://wsr-hermes-server786.herokuapp.com/admin/get-user/${allData[0]._id}`, {
                                    startDate: startDate.toArray(),
                                    endDate: endDate.toArray()
                                })
                                    .then((response) => {
                                        var { data } = response
                                        stats.deal = data.data.length
                                        for (var i of data.data) {
                                            stats.revenue += i.paidAmount
                                            stats.sales += i.soldPrice
                                        }
                                        this.setState({
                                            currentAgent: response.data.data,
                                            stats: stats,
                                            AgentChart: AgentData,
                                            loading: true
                                        })
                                    })
                                    .catch(e => toast.error("Something Went Wrong!!!"))
                            }
                            else {
                                this.setState({
                                    loading: true
                                })
                            }
                        })
                    })
                    .catch((err) => toast.error("Something Went Wrong!!!"))
            })
    }

    async getUpdate(id) {
        const { StartDateValue, endDate } = this.state
        var stats1 = {
            deal: 0,
            sales: 0,
            revenue: 0,
            commission: 0,
            cap: 0,
            recruits: 0
        }
        await axios.post(`https://wsr-hermes-server786.herokuapp.com/admin/get-user/${id}`, {
            startDate: StartDateValue.toArray(),
            endDate: endDate.toArray()
        })
            .then((response) => {
                var { data } = response
                stats1.deal = data.data.length
                for (var i of data.data) {
                    stats1.revenue += i.paidAmount
                    stats1.sales += i.soldPrice
                }
                this.setState({
                    stats: stats1
                })
            })
    }

    updateChart() {
        const { StartDateValue, endDate, allData } = this.state
        var yData = {}
        this.setState({ loadingData: false })
        var topData = { ...this.state.topData }
        var histData = { ...this.state.salePriceHist }
        var obj = { "Buy": 0, "Sell": 0, "Rental": 0, "Whole": 0, "Referral": 0 }
        var arr = []
        var lineData = { ...this.state.lineChart }
        var saleAmount = { ...this.state.SaleAmountChart }
        var AgentData = { ...this.state.AgentChart }
        var sortableId = []
        var sortableVal = []
        var allObj = {}
        var sortableName = []
        yData[StartDateValue.year()] = {
            month: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0 },
            monthLine: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0 }
        }
        axios.post('https://wsr-hermes-server786.herokuapp.com/admin/getAll', {
            startDate: StartDateValue.toArray(),
            endDate: endDate.toArray()
        })
            .then((res) => {
                var { data } = res
                if (data.success) {
                    var len = data.data.length
                    if (data.data.length) {
                        var maxVal = Math.max.apply(Math, data.data.map(v => v.soldPrice))
                        var record = this.distribute(maxVal, 5)
                        var arr1 = record.map(v => v.literal)
                        histData.options.xaxis.categories = arr1
                        var saleObj = {}
                        for (var ind of arr1) {
                            saleObj[ind] = 0
                        }
                        maxVal = maxVal / 5
                        for (var i of data.data) {
                            if (!allObj[i.agentId]) {
                                allObj[i.agentId] = 0
                            }
                            if (!yData[moment(i.timestamp).year()]) {
                                yData[moment(i.timestamp).year()] = {
                                    month: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0 },
                                    monthLine: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0 }
                                }
                            }
                            yData[moment(i.timestamp).year()]['month'][moment(i.timestamp).month()] += i.paidAmount
                            yData[moment(i.timestamp).year()]['monthLine'][moment(i.timestamp).month()] += 1
                            topData.netRevenue += i.paidAmount
                            topData.salesPerDeal += i.soldPrice
                            obj[i.saleType] += i.paidAmount
                            allObj[i.agentId] += 1
                            if (i.soldPrice <= maxVal) {
                                saleObj[arr1[0]] += 1
                            }
                            else if (i.soldPrice <= maxVal * 2) {
                                saleObj[arr1[1]] += 1
                            }
                            else if (i.soldPrice <= maxVal * 3) {
                                saleObj[arr1[2]] += 1
                            }
                            else if (i.soldPrice <= maxVal * 4) {
                                saleObj[arr1[3]] += 1
                            }
                            else {
                                saleObj[arr1[4]] += 1
                            }
                        }
                        topData.revPerDeal = topData.netRevenue / len
                        topData.salesPerDeal = topData.salesPerDeal / len
                        topData.deals = len
                        lineData.series[0].data = Object.entries(yData[StartDateValue.year()]['month']).map(v => v[1])
                        lineData.series[1].data = Object.entries(yData[StartDateValue.year()]['monthLine']).map(v => v[1])
                        saleAmount.series[0].data = Object.entries(yData[StartDateValue.year()]['month']).map(v => v[1])
                        histData.series[0].data = Object.entries(saleObj).map(v => v[1])

                        var sortable = [];
                        for (var vehicle in allObj) {
                            sortable.push([vehicle, allObj[vehicle]]);
                        }

                        sortable.sort((a, b) => {
                            return a[1] - b[1];
                        }).reverse()

                        sortableId = sortable.map(v => v[0])

                        for (var k of sortableId) {
                            for (var d of allData) {
                                if (d._id === k) {
                                    sortableName.push(d.fname)
                                    sortableVal.push(allObj[k])
                                }
                            }
                        }
                        axios.post(`https://wsr-hermes-server786.herokuapp.com/admin/get-user/${allData[0]._id}`, {
                            startDate: StartDateValue.toArray(),
                            endDate: endDate.toArray()
                        })
                            .then((response) => {
                                var stats = {
                                    deal: 0,
                                    sales: 0,
                                    revenue: 0,
                                    commission: 0,
                                    cap: 0,
                                    recruits: 0
                                }
                                var { data } = response
                                stats.deal = data.data.length
                                for (var i of data.data) {
                                    stats.revenue += i.paidAmount
                                    stats.sales += i.soldPrice
                                }
                                this.setState({
                                    currentAgent: response.data.data,
                                    stats: stats
                                })
                            })
                            .catch(e => toast.error("Something Went Wrong!!!"))
                        AgentData.series[0].data = sortableVal.length > 10 ? sortableVal.slice(0, 10) : sortableVal
                        AgentData.options.xaxis.categories = sortableName.length > 10 ? sortableName.slice(0, 10) : sortableName
                    }
                    for (var j in obj) {
                        arr.push(obj[j])
                    }
                    this.setState({
                        loadingData: true, topData: topData, saleTypeChart: {
                            ...this.state.saleTypeChart, series: arr
                        }, salePriceHist: histData, lineChart: lineData,
                        SaleAmountChart: saleAmount, AgentChart: AgentData,
                        dashData: data.data, yearsData: yData
                    })
                }

            })
            .catch(e => toast.error("Something Went Wrong!!!"))
    }

    updateData(e) {
        const { dashData, allData, AgentChart, currentVal } = this.state
        var AgentData = { ...AgentChart }
        var sortableId = []
        var sortableVal = []
        var allObj = {}
        var sortableName = []
        var ids = ["top10", "bottom10"]
        this.setState({
            loadingChart: false
        }, () => {
            for (var i of ids) {
                if (i === e.id) {
                    document.getElementById(e.id).className = "ant-btn btn-group"
                }
                else {
                    document.getElementById(i).className = "ant-btn"
                }
            }

            for (var j of dashData) {
                if (!allObj[j.agentId]) {
                    allObj[j.agentId] = 0
                }

                if (currentVal === "volume") {
                    allObj[j.agentId] += 1
                }
                else if (currentVal === "amount") {
                    allObj[j.agentId] += j.soldPrice
                }
                else {
                    allObj[j.agentId] += 1
                }
            }

            var sortable = [];
            for (var vehicle in allObj) {
                sortable.push([vehicle, allObj[vehicle]]);
            }

            if (e.id === "top10") {
                sortable.sort((a, b) => {
                    return a[1] - b[1];
                }).reverse()
            }

            else {
                sortable.sort((a, b) => {
                    return a[1] - b[1];
                })
            }

            sortableId = sortable.map(v => v[0])

            for (var k of sortableId) {
                for (var d of allData) {
                    if (d._id === k) {
                        sortableName.push(d.fname)
                        sortableVal.push(allObj[k])
                    }
                }
            }
            AgentData.series[0].data = sortableVal.length > 10 ? sortableVal.slice(0, 10) : sortableVal
            AgentData.options.xaxis.categories = sortableName.length > 10 ? sortableName.slice(0, 10) : sortableName

            this.setState({
                AgentChart: AgentData,
                loadingChart: true,
                currentTop: e.id
            })
        })
    }

    updateData1(e) {
        var ids = ["volume", "amount", "recruits"]
        const { dashData, allData, AgentChart, currentTop } = this.state
        var AgentData = { ...AgentChart }
        var sortableId = []
        var sortableVal = []
        var allObj = {}
        var sortableName = []

        this.setState({
            loadingChart: false
        }, () => {
            for (var i of ids) {
                if (i === e.id) {
                    document.getElementById(e.id).className = "ant-btn btn-group"
                }
                else {
                    document.getElementById(i).className = "ant-btn"
                }
            }

            for (var j of dashData) {
                if (!allObj[j.agentId]) {
                    allObj[j.agentId] = 0
                }

                if (e.id === "volume") {
                    allObj[j.agentId] += 1
                }
                else if (e.id === "amount") {
                    allObj[j.agentId] += j.soldPrice
                }
                else {
                    allObj[j.agentId] += 1
                }
            }


            var sortable = [];
            for (var vehicle in allObj) {
                sortable.push([vehicle, allObj[vehicle]]);
            }

            if (currentTop === "top10") {
                sortable.sort((a, b) => {
                    return a[1] - b[1];
                }).reverse()
            }

            else {
                sortable.sort((a, b) => {
                    return a[1] - b[1];
                })
            }

            sortableId = sortable.map(v => v[0])

            for (var k of sortableId) {
                for (var d of allData) {
                    if (d._id === k) {
                        sortableName.push(d.fname)
                        sortableVal.push(allObj[k])
                    }
                }
            }
            AgentData.series[0].data = sortableVal.length > 10 ? sortableVal.slice(0, 10) : sortableVal
            AgentData.options.xaxis.categories = sortableName.length > 10 ? sortableName.slice(0, 10) : sortableName

            this.setState({
                AgentChart: AgentData,
                loadingChart: true,
                currentVal: e.id
            })

        })
    }

    updateLineChart(e) {
        const { yearsData } = this.state
        var lineData = { ...this.state.lineChart }

        this.setState({
            loadingLineChart: true
        }, () => {
            lineData.series[0].data = Object.entries(yearsData[e]['month']).map(v => v[1])
            lineData.series[1].data = Object.entries(yearsData[e]['monthLine']).map(v => v[1])

            this.setState({
                lineChart: lineData,
                loadingLineChart: false
            })
        })
    }

    updateSaleChart(e) {
        const { yearsData } = this.state
        var saleAmount = { ...this.state.SaleAmountChart }

        this.setState({
            loadingSaleChart: true
        }, () => {
            saleAmount.series[0].data = Object.entries(yearsData[e]['month']).map(v => v[1])

            this.setState({
                SaleAmountChart: saleAmount,
                loadingSaleChart: false
            })
        })
    }


    render() {
        const { allData, currentAgent, stats, startDate, loading, topData, saleTypeChart, salePriceHist, lineChart, SaleAmountChart, AgentChart, loadingChart, loadingData, yearsData, StartDateValue, loadingLineChart, loadingSaleChart } = this.state
        if (!allData.length & !currentAgent.length || !loading) {
            return (
                <div>
                    <Header {...this.props} />
                    <div style={{ backgroundColor: '#E5E5E5' }}>
                        <Skeleton paragraph={{ rows: 20 }} />
                    </div>
                </div>
            )
        }
        return (
            <div>
                <Header {...this.props} />
                <div style={{ backgroundColor: '#E5E5E5' }}>
                    <div className="dashboardHeader" style={{ justifyContent: 'center', alignItems: 'center', paddingTop: 20 }}>
                        Woodward Square Realty Health Report
                    </div>
                    <div style={{ display: 'flex', margin: 20, marginBottom: -20, flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }} className="dateRange">
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            width: 345,
                        }}>
                            <h4 style={{ flex: 1 }}>Start Date</h4>
                            <h4 style={{ flex: 1 }}>End Date</h4>
                        </div>
                    </div>
                    <div style={{ display: 'flex', margin: 20, flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }} className="dateRange">
                        <DatePicker defaultValue={startDate} disabledDate={this.disableDate.bind(this)} allowClear={false} showToday={false} onChange={(e) => this.setState({ StartDateValue: e }, () => {
                            this.updateChart()
                        })} />
                        <DatePicker defaultValue={moment()} allowClear={false} onChange={(e) => this.setState({ endDate: e }, () => {
                            this.updateChart()
                        })} disabledDate={this.disabledEndDate.bind(this)} />
                    </div>
                    {loadingData ? <div>
                        <RevenueOverview {...this.props} topData={topData} />
                        <div className="chartBody">
                            <div className="chartBody1">
                                <div className="div5">
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        paddingRight: 20,
                                        paddingLeft: 10
                                    }}>
                                        <span>&nbsp;</span>
                                        <h4 style={{ marginTop: 5, paddingLeft: 120 }}>Sales Amount Over Time</h4>
                                        <SelectComp {...this.props} startYear={StartDateValue.year()} update={this.updateSaleChart.bind(this)} yearsData={yearsData} />
                                    </div>
                                    {!loadingSaleChart ? <Chart options={SaleAmountChart.options} series={SaleAmountChart.series} type="bar" height={300} /> : <Skeleton />}
                                </div>
                                <AgentSummary {...this.props} getUpdate={this.getUpdate.bind(this)} allData={allData} stats={stats} />
                            </div>
                            <div className="chart2">
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    paddingRight: 20,
                                    paddingLeft: 10
                                }}>
                                    <span>&nbsp;</span>
                                    <h4 style={{ textAlign: 'center', marginTop: 5, paddingLeft: 120 }}>Deals & Revenue Over Time</h4>
                                    <SelectComp {...this.props} startYear={StartDateValue.year()} update={this.updateLineChart.bind(this)} yearsData={yearsData} />
                                </div>
                                {!loadingLineChart ? <Chart options={lineChart.options} series={lineChart.series} type="line" height={500} /> : <Skeleton />}
                            </div>
                        </div>
                        <div className="chart3">
                            <div className="chart1 mLeft">
                                <h4 style={{ textAlign: 'center' }}>Revenue By Sale Types</h4>
                                <Chart options={saleTypeChart.options} series={saleTypeChart.series} type="pie" height={300} />
                            </div>
                            <div className="chart1">
                                <h4 style={{ textAlign: 'center' }}>Closing By Sale Price</h4>
                                <Chart options={salePriceHist.options} series={salePriceHist.series} type="histogram" height={300} />
                            </div>
                        </div>
                        <AgentPerformance {...this.props} loadingChart={loadingChart} AgentChart={AgentChart} updateData={this.updateData.bind(this)} updateData1={this.updateData1.bind(this)} />

                    </div> : <Skeleton paragraph={{ rows: 20 }} />}
                </div>
            </div >
        )
    }
}

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

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard)