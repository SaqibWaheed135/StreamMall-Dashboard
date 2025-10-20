import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

const data = [
  { date: '1 Jul', revenue: 40000, margin: 25000 },
  { date: '2 Jul', revenue: 48000, margin: 28000 },
  { date: '3 Jul', revenue: 60000, margin: 30000 },
  { date: '4 Jul', revenue: 55000, margin: 32000 },
  { date: '5 Jul', revenue: 49000, margin: 35000 },
  { date: '6 Jul', revenue: 60000, margin: 52187 },
];

export default function Dashboard() {
  return (
    <>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Dashboard</h1>
      <div className="cards">
        <div className="card">
          <div>Total Users</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>567,899</div>
        </div>
        <div className="card">
          <div>Total Revenue</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>$3,465 M</div>
        </div>
        <div className="card">
          <div>Total Videos</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>1,136 M</div>
        </div>
        <div className="card">
          <div>Total Withdrawal</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>1,789</div>
        </div>
      </div>

      <div className="chart-container">
        <h2 style={{ marginBottom: '10px' }}>Product Sales</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="margin" fill="#3b82f6" />
            <Bar dataKey="revenue" fill="#f97316" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}