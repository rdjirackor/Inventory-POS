import { useEffect, useState } from "react";
import "../styles/Dashboard.css";
import { getDashboard } from "../apis/dashboard";
import OrdersChart from "../components/OrdersChart";

function Dashboard() {

    const [dashboard, setDashboard] = useState<any>(null);

    useEffect(() => {
        getDashboard()
            .then(data => {
                setDashboard(data);
            })
            .catch(error => {
                console.error(error);
            });
    }, []);

    if (!dashboard) {
        return <p>Loading...</p>;
    }

    return (
        <div className="dashboard">
            <div className="top_dashboard_details">
                <p>Today's<br/>Sales<br/>{dashboard.todays_sales}</p>

                <p>Top<br/>Order<br/>{dashboard.most_expensive_order}</p>

                <p>Profit<br/>Generated Today<br/>{dashboard.profit_generated_today}</p>

                <p>Low<br/>Stock Items<br/>{dashboard.low_stock_items}</p>

                <p>Pending<br/>Purchase Orders<br/>{dashboard.pending_purchase_orders}</p>

                <p>Out of<br/>Stock<br/>{dashboard.out_of_stock}</p>

                <p>Number Of<br/>Orders<br/>{dashboard.number_of_orders}</p>

                <p>Top Selling<br/>Product<br/>{dashboard.top_selling_product}</p>
            </div>
            <div className="lower_dashboard">

                <div className="seven_days_chart">
                    <p><b>Sales Last 7 Days</b></p>
                    <OrdersChart data={dashboard.orders_last_7_days} />
                </div>

                {dashboard.low_stock_products.length > 0 ? (
                <div className="low_stock_items">
                    
                    <p><b>Low Stock (5 Lowest)</b></p>

                    <ul>
                        {dashboard.low_stock_products.map((product) => (
                            <li key={product}>{product}</li>
                        ))}
                    </ul>
                </div>   ):
                
                <p><b>Low Stock (5 Lowest)</b><br/>No product is low in stock</p>                             
                }

                <div className="recent_activity">
                <p><b>Recent Activity (Last 5)</b></p>

                {dashboard.recent_activity.length > 0 ? (
                    <ul>
                        {dashboard.recent_activity.map((activity) => (
                            <li key={activity.date}>
                                {activity.movement_type} - {activity.product} ({activity.quantity})
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No recent activity</p>
                )}
            </div>

                </div>
        </div>
    );
}

export default Dashboard;