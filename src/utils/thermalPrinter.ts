import { Order, DailySummary } from '@/types';
import { generateDailyReport } from './reportGenerator';

// ESC/POS commands for thermal printers
const ESC = '\x1B';
const GS = '\x1D';

// Food icons mapping for thermal printers (using simple ASCII art)
const getFoodIcon = (category: string): string => {
  const icons: Record<string, string> = {
    'Main Dishes': '[M]',
    'Sides': '[S]',
    'Beverages': '[B]',
    'Desserts': '[D]',
    'Breakfast': '[BR]',
    'Specials': '[SP]'
  };
  return icons[category] || '[F]';
};

// Generate HTML receipt for browser printing (laser printers)
const generateHTMLReceipt = (order: Order, action: 'placed' | 'accepted'): string => {
  const itemsHTML = order.items.map(item => `
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px dashed #ccc;">
        ${item.menuItem.name}<br/>
        <small style="color: #666;">Qty: ${item.quantity} × GHS ${item.menuItem.price.toFixed(2)}</small>
      </td>
      <td style="padding: 8px 0; text-align: right; border-bottom: 1px dashed #ccc;">
        GHS ${(item.quantity * item.menuItem.price).toFixed(2)}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Receipt</title>
      <style>
        @media print {
          body { margin: 0; padding: 20px; }
          @page { margin: 0.5cm; size: 80mm auto; }
        }
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          max-width: 300px;
          margin: 0 auto;
        }
        .header { text-align: center; margin-bottom: 20px; }
        .header h1 { font-size: 18px; margin: 5px 0; }
        .header p { margin: 3px 0; }
        .section { margin: 15px 0; border-top: 2px solid #000; padding-top: 10px; }
        table { width: 100%; border-collapse: collapse; }
        .total { font-size: 16px; font-weight: bold; margin-top: 10px; }
        .footer { text-align: center; margin-top: 20px; border-top: 2px solid #000; padding-top: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>TIMELEXX INN</h1>
        <p>Kitchen Order</p>
        <p style="font-weight: bold;">${action === 'placed' ? 'NEW ORDER' : 'ACCEPTED'}</p>
      </div>
      
      <div class="section">
        <p><strong>Order #:</strong> ${order.id.slice(0, 8).toUpperCase()}</p>
        <p><strong>Type:</strong> ${order.orderType.toUpperCase()}</p>
        <p><strong>Date:</strong> ${new Date(order.timestamp).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${new Date(order.timestamp).toLocaleTimeString()}</p>
      </div>

      ${order.customerName || order.customerNumber ? `
      <div class="section">
        <p><strong>Customer Details:</strong></p>
        ${order.customerName ? `<p>Name: ${order.customerName}</p>` : ''}
        ${order.customerNumber ? `<p>Phone: ${order.customerNumber}</p>` : ''}
        ${order.customerLocation?.address ? `<p>Address: ${order.customerLocation.address}</p>` : ''}
      </div>
      ` : ''}

      <div class="section">
        <p><strong>Order Items:</strong></p>
        <table>
          ${itemsHTML}
        </table>
      </div>

      <div class="total">
        TOTAL: GHS ${order.total.toFixed(2)}
      </div>

      ${order.orderType === 'delivery' && order.riderNumber ? `
      <div class="section">
        <p><strong>Delivery Info:</strong></p>
        <p>Rider: ${order.riderNumber}</p>
      </div>
      ` : ''}

      <div class="footer">
        <p>Thank you!</p>
        <p>Printed: ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
  `;
};

// Print using browser's print dialog (works with any printer)
const printWithBrowser = (order: Order, action: 'placed' | 'accepted'): void => {
  const htmlContent = generateHTMLReceipt(order, action);
  const printWindow = window.open('', '_blank', 'width=400,height=600');
  
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        // Close after printing (user can cancel)
        setTimeout(() => printWindow.close(), 100);
      }, 250);
    };
  }
};

// Separate thermal printer logic
const printToThermalPrinter = async (device: any, order: Order, action: 'placed' | 'accepted'): Promise<void> => {
  // Connect to the device
  const server = await device.gatt?.connect();
  if (!server) throw new Error('Failed to connect to printer');

  const services = await server.getPrimaryServices();
  if (services.length === 0) throw new Error('No services found');
  
  const service = services[0];
  const characteristics = await service.getCharacteristics();
  if (characteristics.length === 0) throw new Error('No characteristics found');
  
  const characteristic = characteristics[0];

  // Build ESC/POS commands
  let commands = '';

  // Initialize printer
  commands += ESC + '@'; // Initialize
  commands += ESC + 'a' + '\x01'; // Center align
  commands += ESC + 'E' + '\x01'; // Bold on
  commands += GS + '!' + '\x11'; // Double size
  commands += 'TIMELEXX INN\n';
  commands += GS + '!' + '\x00'; // Normal size
  commands += ESC + 'E' + '\x00'; // Bold off
  commands += 'Kitchen Order\n';
  commands += '================================\n\n';

  // Order status
  commands += ESC + 'a' + '\x00'; // Left align
  commands += ESC + 'E' + '\x01'; // Bold
  commands += `Status: ${action === 'placed' ? 'NEW ORDER' : 'ACCEPTED'}\n`;
  commands += ESC + 'E' + '\x00'; // Bold off
  commands += `Order #: ${order.id.slice(0, 8).toUpperCase()}\n`;
  commands += `Type: ${order.orderType.toUpperCase()}\n`;
  commands += `Date: ${new Date(order.timestamp).toLocaleDateString()}\n`;
  commands += `Time: ${new Date(order.timestamp).toLocaleTimeString()}\n`;
  commands += '--------------------------------\n\n';

  // Customer details
  if (order.customerName || order.customerNumber) {
    commands += ESC + 'E' + '\x01' + 'Customer Details:\n' + ESC + 'E' + '\x00';
    if (order.customerName) commands += `Name: ${order.customerName}\n`;
    if (order.customerNumber) commands += `Phone: ${order.customerNumber}\n`;
    if (order.customerLocation?.address) commands += `Address: ${order.customerLocation.address}\n`;
    commands += '--------------------------------\n\n';
  }

  // Order items
  commands += ESC + 'E' + '\x01' + 'Order Items:\n' + ESC + 'E' + '\x00\n';
  order.items.forEach((item) => {
    const icon = getFoodIcon(item.menuItem.category);
    commands += `${icon} ${item.menuItem.name}\n`;
    commands += `   Qty: ${item.quantity} x GHS ${item.menuItem.price}\n\n`;
  });

  // Total
  commands += '================================\n';
  commands += ESC + 'E' + '\x01' + GS + '!' + '\x10';
  commands += `TOTAL: GHS ${order.total}\n`;
  commands += GS + '!' + '\x00' + ESC + 'E' + '\x00';
  commands += '================================\n\n';

  // Delivery info
  if (order.orderType === 'delivery' && order.riderNumber) {
    commands += ESC + 'E' + '\x01' + 'Delivery Info:\n' + ESC + 'E' + '\x00';
    commands += `Rider: ${order.riderNumber}\n`;
    commands += '--------------------------------\n\n';
  }

  // Footer
  commands += ESC + 'a' + '\x01'; // Center
  commands += 'Thank you!\n';
  commands += `Printed: ${new Date().toLocaleString()}\n\n\n`;
  
  // Cut paper (if supported)
  commands += GS + 'V' + '\x41' + '\x03';

  // Send data to printer in chunks (avoid buffer overflow)
  const encoder = new TextEncoder();
  const data = encoder.encode(commands);
  const chunkSize = 512;
  
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, Math.min(i + chunkSize, data.length));
    await characteristic.writeValue(chunk);
    await new Promise(resolve => setTimeout(resolve, 50)); // Small delay between chunks
  }
};

// Try thermal printer via ESC/POS (Bluetooth), fallback to browser print
export const printOrderReceipt = async (order: Order, action: 'placed' | 'accepted'): Promise<void> => {
  try {
    // Check if Web Bluetooth API is available
    const nav = navigator as any;
    
    // Try thermal printer first (silent if paired)
    if (nav.bluetooth) {
      try {
        const devices = await nav.bluetooth.getDevices();
        const device = devices.find((d: any) => d.name?.toLowerCase().includes('printer')) || devices[0];
        
        if (device) {
          // Attempt thermal print
          await printToThermalPrinter(device, order, action);
          console.log('✓ Printed to thermal printer');
          return;
        }
      } catch (e) {
        console.log('Thermal printer not available, using browser print');
      }
    }
    
    // Fallback to browser print (works with any printer type)
    printWithBrowser(order, action);
    
  } catch (error) {
    console.error('Print error:', error);
    // Still try browser print as last resort
    printWithBrowser(order, action);
  }
};

export const connectPrinter = async (): Promise<void> => {
  try {
    const nav = navigator as any;
    if (!nav.bluetooth) {
      throw new Error('Web Bluetooth not supported');
    }

    const device = await nav.bluetooth.requestDevice({
      filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }],
      optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
    });

    await device.gatt.connect();
    console.log('Printer connected successfully');
  } catch (error) {
    console.error('Connection error:', error);
    throw error;
  }
};

export const printDailyReport = async (summary: DailySummary, orders: Order[], adminUsername?: string): Promise<void> => {
  try {
    // Generate report text
    const reportText = generateDailyReport(summary, orders, adminUsername);
    
    const nav = navigator as any;
    if (!nav.bluetooth) {
      console.log('Web Bluetooth not available - print skipped');
      return;
    }

    // Try to get already paired devices first
    let device: any;
    try {
      const devices = await nav.bluetooth.getDevices();
      device = devices.find((d: any) => d.name?.toLowerCase().includes('printer')) || devices[0];
      
      if (!device) {
        console.log('No paired printer found - print skipped');
        return;
      }
    } catch (e) {
      console.log('No printer available - print skipped');
      return;
    }

    const server = await device.gatt?.connect();
    if (!server) return;

    const services = await server.getPrimaryServices();
    if (services.length === 0) return;
    
    const service = services[0];
    const characteristics = await service.getCharacteristics();
    if (characteristics.length === 0) return;
    
    const characteristic = characteristics[0];

    // Format report for thermal printer with ESC/POS commands
    let commands = '';
    
    // Initialize
    commands += ESC + '@';
    
    // Header
    commands += ESC + 'a' + '\x01'; // Center
    commands += ESC + 'E' + '\x01'; // Bold
    commands += GS + '!' + '\x11'; // Double size
    commands += 'TIMELEXX INN\n';
    commands += GS + '!' + '\x00'; // Normal size
    commands += 'Daily Sales Report\n';
    commands += ESC + 'E' + '\x00'; // Bold off
    commands += '================================\n\n';
    
    // Split report into lines and format
    const lines = reportText.split('\n');
    commands += ESC + 'a' + '\x00'; // Left align
    
    lines.forEach(line => {
      if (line.includes('===') || line.includes('---')) {
        commands += line + '\n';
      } else if (line.includes('DAILY SALES REPORT')) {
        commands += ESC + 'a' + '\x01' + ESC + 'E' + '\x01';
        commands += line + '\n';
        commands += ESC + 'E' + '\x00' + ESC + 'a' + '\x00';
      } else if (line.trim().startsWith('Total') || line.includes('GHS')) {
        commands += ESC + 'E' + '\x01' + line + ESC + 'E' + '\x00' + '\n';
      } else {
        commands += line + '\n';
      }
    });
    
    // Footer
    commands += '\n\n';
    commands += ESC + 'a' + '\x01'; // Center
    commands += `Printed: ${new Date().toLocaleString()}\n`;
    commands += '\n\n\n';
    commands += GS + 'V' + '\x41' + '\x03'; // Cut

    // Send to printer in chunks
    const encoder = new TextEncoder();
    const data = encoder.encode(commands);
    const chunkSize = 512;
    
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, Math.min(i + chunkSize, data.length));
      await characteristic.writeValue(chunk);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('Daily report printed successfully');
  } catch (error) {
    console.error('Daily report print error:', error);
    throw error;
  }
};
