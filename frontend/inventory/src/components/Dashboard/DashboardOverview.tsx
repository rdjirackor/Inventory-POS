import {  useEffect, useState } from "react";
import { getDashboard } from "../../apis/dashboard_overview";
import OrdersChart from "../OrdersChart";
import {  Card, Flex } from "@chakra-ui/react";

function DashboardOverview() {

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
        <Flex
        direction={"column"}>

            <Flex
            direction="row"
            justify={"space-between"}
            m={["0", "2vw", "0", "2vw"]}
            >
            
                <p>Today's<br/>Sales<br/>{dashboard.todays_sales}</p>

                <p>Top<br/>Order<br/>{dashboard.most_expensive_order}</p>

                <p>Profit<br/>Generated Today<br/>{dashboard.profit_generated_today}</p>

                <p>Low<br/>Stock Items<br/>{dashboard.low_stock_items}</p>

                <p>Pending<br/>Purchase Orders<br/>{dashboard.pending_purchase_orders}</p>

                <p>Out of<br/>Stock<br/>{dashboard.out_of_stock}</p>

                <p>Number Of<br/>Orders<br/>{dashboard.number_of_orders}</p>

                <p>Top Selling<br/>Product<br/>{dashboard.top_selling_product}</p>
                </Flex>

            <Flex direction={"row"}
                justify={"space-evenly"}>

                    <Card.Root bgColor={"transparent"}>
                        <Card.Header alignItems={"center"} color={"white"}><b>Sales Last 7 Days</b></Card.Header>
                        <Card.Body width={"30vw"} color={"white"}>
                        <OrdersChart data={dashboard.orders_last_7_days}  />
                        </Card.Body>
                    </Card.Root>

                    <Card.Root bgColor={"transparent"}>
                        
                        {dashboard.low_stock_products.length > 0 ? (
                        
                            <Card.Header><b>Low Stock (5 Lowest)</b><ul>
                                {dashboard.low_stock_products.map((product) => (
                                    <li key={product}>{product}</li>
                                ))}
                            </ul></Card.Header>
                            
                        ):
                        <p><b>Low Stock (5 Lowest)</b><br/>No product is low in stock</p>                       
                        }
                    </Card.Root>
                    <Card.Root bgColor={"transparent"}>

                      <Card.Header><b><a href="/stock-movements">Recent Activity (Last 5)</a></b></Card.Header>  
                        <Card.Body>
                        {dashboard.recent_activity.length > 0 ? (
                            <ul>
                                {dashboard.recent_activity.map((activity) => (
                                    <li key={activity.date}>
                                        {activity.movement_type} - {activity.product} (Quantity: {activity.quantity} By: {activity.performed_by})
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No recent activity</p>
                        )}
                        </Card.Body>
                    </Card.Root>

                </Flex>

                </Flex>

    );
}

export default DashboardOverview;