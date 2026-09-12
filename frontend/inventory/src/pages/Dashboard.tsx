import { useEffect, useState } from "react";
import "../styles/Dashboard.css";
import { getDashboard } from "../apis/dashboard";

function Dashboard() {

    const [todaysSales, setTodaysSales] = useState("0");

    useEffect(() => {
        getDashboard()
            .then(data => {
                setTodaysSales(data.todays_sales);
            })
            .catch(error => {
                console.error(error);
            });
    }, []);

    return (
        <div>
            <div className="top_dashboard_details">
                <p>Today's<br/>Sales<br/>{todaysSales}</p>
                <p>Top<br/>Order</p>
                <p>Profit<br/>Generated Today</p>
                <p>Low<br/>Stock Items</p>
                <p>Pending<br/>Purchase Orders</p>
                <p>Out of<br/>Stock</p>
                <p>Customers<br/>Served</p>
                <p>Top Selling<br/>Product</p>
            </div>
        </div>
    );
}

export default Dashboard;