import { useEffect, useState } from "react";
import "../styles/Dashboard.css";
import { getDashboard } from "../apis/dashboard";

function Dashboard() {

    const [todaysSales, setTodaysSales] = useState("0");
    const [mostExpensiveOrder, setMostExpensiveOrder] = useState("0");
    const [profitGenToday, setProfitGenToday] = useState("0");
    const [lowStockItems, setLowStockItems] = useState("");
    const [pendingPurchaseOrders, setPendingPurchaseOrders] = useState("");
    const [outOfStock, setOutOfStock] = useState("");
    const [customersServed, setCustomersServed] = useState("0");
    const [topSeller, setTopSellingProduct] = useState("");

    



    useEffect(() => {
        getDashboard()
            .then(data => {
                setTodaysSales(data.todays_sales);
                setMostExpensiveOrder(data.most_expensive_order);
                setProfitGenToday(data.profit_generated_today);
                setLowStockItems(data.low_stock_items);
                setPendingPurchaseOrders(data.pending_purchase_orders);
                setOutOfStock(data.out_of_stock);
                setCustomersServed(data.customers_served);
                setTopSellingProduct(data.top_selling_product);

            })
            .catch(error => {
                console.error(error);
            });
    }, []);

    return (
        <div>
            <div className="top_dashboard_details">
                <p>Today's<br/>Sales<br/>{todaysSales}</p>
                <p>Top<br/>Order<br/>{mostExpensiveOrder}</p>
                <p>Profit<br/>Generated Today<br/>{profitGenToday}</p>
                <p>Low<br/>Stock Items<br/>{lowStockItems}</p>
                <p>Pending<br/>Purchase Orders<br/>{pendingPurchaseOrders}</p>
                <p>Out of<br/>Stock<br/>{outOfStock}</p>
                <p>Customers<br/>Served<br/>{customersServed}</p>
                <p>Top Selling<br/>Product<br/>{topSeller}</p>
            </div>
        </div>
    );
}

export default Dashboard;