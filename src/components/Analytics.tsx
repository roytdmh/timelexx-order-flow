
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag } from 'lucide-react';
import { DailySummary } from '@/types';

interface AnalyticsProps {
  summary: DailySummary;
}

const Analytics: React.FC<AnalyticsProps> = ({ summary }) => {
  const chartData = Object.entries(summary.ordersByMeal).map(([meal, count]) => ({
    name: meal.replace(' & ', ' &\n'),
    orders: count,
    revenue: summary.revenueByMeal[meal] || 0
  }));

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-timelexx-red">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <ShoppingBag className="w-4 h-4" />
              Total Orders Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-timelexx-red">{summary.totalOrders}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-timelexx-yellow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <DollarSign className="w-4 h-4" />
              Total Revenue Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-timelexx-yellow">₵{summary.totalRevenue}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              Average Order Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">
              ₵{summary.totalOrders > 0 ? Math.round(summary.totalRevenue / summary.totalOrders) : 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Best Selling Item</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.bestSelling ? (
              <div>
                <p className="text-xl font-semibold">{summary.bestSelling.name}</p>
                <p className="text-muted-foreground">
                  {summary.ordersByMeal[summary.bestSelling.name]} orders
                </p>
                <p className="text-green-600 font-bold">
                  ₵{summary.revenueByMeal[summary.bestSelling.name]} revenue
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">No orders yet today</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Least Selling Item</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.worstSelling ? (
              <div>
                <p className="text-xl font-semibold">{summary.worstSelling.name}</p>
                <p className="text-muted-foreground">
                  {summary.ordersByMeal[summary.worstSelling.name]} orders
                </p>
                <p className="text-red-600 font-bold">
                  ₵{summary.revenueByMeal[summary.worstSelling.name]} revenue
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">No orders yet today</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sales by Menu Item</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="hsl(var(--timelexx-red))" name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Analytics;
