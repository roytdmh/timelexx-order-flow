
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, TrendingUp, DollarSign, ShoppingBag, Loader2 } from 'lucide-react';
import { DailySummary } from '@/types';
import { toast } from '@/hooks/use-toast';

interface ReportsProps {
  summary: DailySummary;
  onDownloadReport: () => Promise<void>;
  adminUsername?: string;
}

const Reports: React.FC<ReportsProps> = ({ summary, onDownloadReport, adminUsername }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownloadReport = async () => {
    setIsLoading(true);
    try {
      await onDownloadReport();
      toast({
        title: "Report Downloaded Successfully",
        description: "Daily summary report has been downloaded as a PDF file",
      });
    } catch (error) {
      toast({
        title: "Failed to Download Report",
        description: "There was an error generating the PDF report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const today = new Date().toLocaleDateString();

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <Card className="border-l-4 border-l-timelexx-red">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Daily Sales Report - {today}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Comprehensive summary of today's business performance
          </p>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <ShoppingBag className="w-4 h-4" />
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-timelexx-red">{summary.totalOrders}</p>
            <p className="text-xs text-muted-foreground mt-1">Delivered orders today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <DollarSign className="w-4 h-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-timelexx-yellow">₵{summary.totalRevenue}</p>
            <p className="text-xs text-muted-foreground mt-1">Total earnings today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              Average Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-500">
              ₵{summary.totalOrders > 0 ? Math.round(summary.totalRevenue / summary.totalOrders) : 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Per order value</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Top Performer</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.bestSelling ? (
              <div className="space-y-2">
                <p className="text-lg font-semibold">{summary.bestSelling.name}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Orders:</span>
                  <span className="font-medium">{summary.ordersByMeal[summary.bestSelling.name]}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Revenue:</span>
                  <span className="font-medium text-green-600">₵{summary.revenueByMeal[summary.bestSelling.name]}</span>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No orders yet today</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-orange-600">Needs Attention</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.worstSelling ? (
              <div className="space-y-2">
                <p className="text-lg font-semibold">{summary.worstSelling.name}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Orders:</span>
                  <span className="font-medium">{summary.ordersByMeal[summary.worstSelling.name]}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Revenue:</span>
                  <span className="font-medium text-orange-600">₵{summary.revenueByMeal[summary.worstSelling.name]}</span>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No orders yet today</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Menu Items Summary */}
      {Object.keys(summary.ordersByMeal).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Menu Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(summary.ordersByMeal)
                .sort(([,a], [,b]) => b - a)
                .map(([meal, count]) => (
                  <div key={meal} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{meal}</p>
                      <p className="text-sm text-muted-foreground">{count} orders</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-timelexx-red">₵{summary.revenueByMeal[meal]}</p>
                      <p className="text-xs text-muted-foreground">revenue</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Download Report Action */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Download Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Download today's detailed business report as a read-only PDF file for your records.
            </p>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                The PDF will include all order details, performance metrics, and customer information.
              </p>
              {adminUsername && (
                <p className="text-sm text-blue-800 mt-1">
                  Report will be generated by: Admin {adminUsername}
                </p>
              )}
            </div>
            <Button 
              onClick={handleDownloadReport} 
              disabled={isLoading}
              className="w-full bg-timelexx-red hover:bg-timelexx-red/90"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download Daily Report as PDF
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
