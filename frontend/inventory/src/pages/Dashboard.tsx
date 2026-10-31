
import { useState } from 'react';
import DashboardOverview from '../components/Dashboard/DashboardOverview';
import DashboardSales from '../components/Dashboard/DashboardSales';


export default function Dashboard() {
    const [activeView, setActiveView] = useState<'overview' | 'sales'>('sales');

    return (
        <div>
            <div className="dashboard-toggle">

                <button
                    type="button"
                    onClick={() => setActiveView('sales')}
                    className={activeView === 'sales' ? 'active' : ''}
                >
                    Sales
                </button>



                <button
                    type="button"
                    onClick={() => setActiveView('overview')}
                    className={activeView === 'overview' ? 'active' : ''}
                >
                    Overview
                </button>


            </div>

            <main className="dashboard-content">
                {activeView === 'overview' ? (
                    <DashboardOverview />
                ) : (
                    <DashboardSales />
                )}
            </main>
        </div>
    );
}
