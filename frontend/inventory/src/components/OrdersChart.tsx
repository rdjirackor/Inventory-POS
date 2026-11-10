import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

function OrdersChart({ data }: { data: any[] }) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <CartesianGrid stroke="#b99d64" strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                    dataKey="date" 
                    stroke="#b99d64" 
                    tick={{ fill: '#ffffff', fontSize: 12 }} 
                />
                <YAxis 
                    stroke="#b99d64" 
                    tick={{ fill: '#ffffff', fontSize: 12 }} 
                />
                
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        borderColor: '#b99d64', 
                        borderRadius: '8px',
                        color: '#ffffff',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                    }}
                    itemStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                    labelStyle={{ color: '#b99d64', fontWeight: 'bold' }}
                />

                <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#ffffff"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 6, fill: '#b99d64', stroke: '#ffffff', strokeWidth: 2 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

export default OrdersChart;