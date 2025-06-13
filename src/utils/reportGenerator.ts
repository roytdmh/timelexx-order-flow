
import { Order, DailySummary } from '@/types';
import emailjs from '@emailjs/browser';

export const generateDailyReport = (summary: DailySummary, orders: Order[]): string => {
  const today = new Date().toLocaleDateString();
  const todaysOrders = orders.filter(order => {
    const orderDate = new Date(order.timestamp);
    const todayDate = new Date();
    return orderDate.toDateString() === todayDate.toDateString();
  });

  let report = `TIMELEXX INN - DAILY SALES REPORT\n`;
  report += `Date: ${today}\n`;
  report += `${'='.repeat(50)}\n\n`;

  // Summary Section
  report += `DAILY SUMMARY\n`;
  report += `${'-'.repeat(20)}\n`;
  report += `Total Orders: ${summary.totalOrders}\n`;
  report += `Total Revenue: ₵${summary.totalRevenue}\n`;
  report += `Average Order Value: ₵${summary.totalOrders > 0 ? Math.round(summary.totalRevenue / summary.totalOrders) : 0}\n\n`;

  // Best and Worst Performing Items
  report += `PERFORMANCE ANALYSIS\n`;
  report += `${'-'.repeat(30)}\n`;
  if (summary.bestSelling) {
    report += `Best Selling Item: ${summary.bestSelling.name}\n`;
    report += `  - Orders: ${summary.ordersByMeal[summary.bestSelling.name]}\n`;
    report += `  - Revenue: ₵${summary.revenueByMeal[summary.bestSelling.name]}\n\n`;
  }
  
  if (summary.worstSelling) {
    report += `Least Selling Item: ${summary.worstSelling.name}\n`;
    report += `  - Orders: ${summary.ordersByMeal[summary.worstSelling.name]}\n`;
    report += `  - Revenue: ₵${summary.revenueByMeal[summary.worstSelling.name]}\n\n`;
  }

  // Detailed Sales by Item
  report += `SALES BY MENU ITEM\n`;
  report += `${'-'.repeat(25)}\n`;
  Object.entries(summary.ordersByMeal).forEach(([meal, count]) => {
    const revenue = summary.revenueByMeal[meal] || 0;
    report += `${meal}:\n`;
    report += `  - Quantity Sold: ${count}\n`;
    report += `  - Revenue: ₵${revenue}\n\n`;
  });

  // Order Details
  report += `ORDER DETAILS\n`;
  report += `${'-'.repeat(20)}\n`;
  const deliveredOrders = todaysOrders.filter(order => order.status === 'delivered');
  const cancelledOrders = todaysOrders.filter(order => order.status === 'cancelled');
  const pendingOrders = todaysOrders.filter(order => order.status === 'pending');

  report += `Delivered Orders: ${deliveredOrders.length}\n`;
  report += `Cancelled Orders: ${cancelledOrders.length}\n`;
  report += `Pending Orders: ${pendingOrders.length}\n\n`;

  // Individual Orders
  if (deliveredOrders.length > 0) {
    report += `DELIVERED ORDERS LIST\n`;
    report += `${'-'.repeat(30)}\n`;
    deliveredOrders.forEach(order => {
      report += `Order #${order.id.slice(-6)} - ${order.timestamp.toLocaleDateString()} at ${order.timestamp.toLocaleTimeString()}\n`;
      if (order.customerName) {
        report += `  Customer: ${order.customerName}\n`;
      }
      report += `  Type: ${order.orderType.toUpperCase()}`;
      if (order.riderNumber) {
        report += ` (${order.riderNumber})`;
      }
      report += `\n`;
      order.items.forEach(item => {
        report += `  - ${item.menuItem.name} x${item.quantity} = ₵${item.menuItem.price * item.quantity}\n`;
      });
      report += `  Total: ₵${order.total}\n\n`;
    });
  }

  report += `${'='.repeat(50)}\n`;
  report += `Report Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\n`;
  report += `Timelexx Inn Order Management System\n`;

  return report;
};

export const sendReportByEmail = async (reportContent: string): Promise<boolean> => {
  try {
    console.log('Initializing EmailJS and sending daily report...');
    
    // Initialize EmailJS with your public key
    emailjs.init('j7ZS7vWDPSzQKCKdW');
    
    const templateParams = {
      to_email: 'roy@ayadata.ai',
      subject: `Timelexx Inn Daily Report - ${new Date().toDateString()}`,
      report_content: reportContent,
      restaurant_name: 'Timelexx Inn',
      date: new Date().toLocaleDateString(),
      from_name: 'Timelexx Inn Order System',
    };

    console.log('Sending email with template params:', templateParams);

    const response = await emailjs.send(
      'service_4k66mqf', // Your EmailJS service ID
      'template_v0xdl2p', // Your EmailJS template ID
      templateParams
    );

    console.log('EmailJS response:', response);

    if (response.status === 200) {
      console.log('✅ Report successfully sent to roy@ayadata.ai');
      return true;
    } else {
      console.error('❌ EmailJS response error:', response);
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending report via EmailJS:', error);
    return false;
  }
};
