
import { useState } from 'react';
import DashboardOverview from '../components/Dashboard/DashboardOverview';
import DashboardSales from '../components/Dashboard/DashboardSales';
import { Text } from '@chakra-ui/react';


export default function Dashboard() {
    const [active, setActive] = useState<string>(localStorage.getItem("active_view") || "sales");

    async function switcher(active) {
        if (active === "sales"){
            setActive("overview");
            localStorage.setItem("active_view", "overview");
        }
        if (active === "overview"){
            setActive("sales");
            localStorage.setItem("active_view", "sales");
        }
        
    }

    return (
        <div>
            <div className="dashboard-toggle">

                <button
                    type="button"
                    onClick={() => switcher(active)}
                >
                    Toggle
                </button>
                <Text>Active: {active}</Text>
            </div>

            <main className="dashboard-content">
                {active === 'overview' ? (
                    <DashboardOverview />
                ) : (
                    <DashboardSales />
                )}
            </main>
        </div>
    );
}
