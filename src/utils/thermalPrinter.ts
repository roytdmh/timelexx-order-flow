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

export const printOrderReceipt = async (order: Order, action: 'placed' | 'accepted'): Promise<void> => {
  try {
    // Check if Web Bluetooth API is available
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

    // Connect to the device
    const server = await device.gatt?.connect();
    if (!server) return;

    const services = await server.getPrimaryServices();
    if (services.length === 0) return;
    
    const service = services[0];
    const characteristics = await service.getCharacteristics();
    if (characteristics.length === 0) return;
    
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
      commands += 'Delivery Info:\n';
      commands += `Rider: ${order.riderNumber}\n`;
      commands += '--------------------------------\n\n';
    }

    // Footer
    commands += ESC + 'a' + '\x01'; // Center
    commands += '\n--- Kitchen Copy ---\n\nPrepare with care!\n\n\n';
    commands += GS + 'V' + '\x00'; // Cut paper

    // Send to printer
    const encoder = new TextEncoder();
    const data = encoder.encode(commands);
    await characteristic.writeValue(data);

    console.log('Order printed successfully');

  } catch (error) {
    // Silent fail - don't show errors to user
    console.log('Print skipped:', error);
  }
};

export const connectPrinter = async (): Promise<void> => {
  try {
    const nav = navigator as any;
    if (!nav.bluetooth) {
      throw new Error('Web Bluetooth not supported');
    }

    const device = await nav.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ['battery_service', 'device_information']
    });

    console.log('Printer paired:', device.name);
  } catch (error) {
    console.log('Printer pairing cancelled or failed');
  }
};

export const printDailyReport = async (summary: DailySummary, orders: Order[], adminUsername?: string): Promise<void> => {
  try {
    // Check if Web Bluetooth API is available
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

    // Connect to the device
    const server = await device.gatt?.connect();
    if (!server) return;

    const services = await server.getPrimaryServices();
    if (services.length === 0) return;
    
    const service = services[0];
    const characteristics = await service.getCharacteristics();
    if (characteristics.length === 0) return;
    
    const characteristic = characteristics[0];

    // Generate the full text report
    const reportText = generateDailyReport(summary, orders, adminUsername);
    
    // Build ESC/POS commands
    let commands = '';

    // Initialize printer
    commands += ESC + '@'; // Initialize
    commands += ESC + 'a' + '\x01'; // Center align
    commands += ESC + 'E' + '\x01'; // Bold on
    commands += GS + '!' + '\x11'; // Double size
    commands += 'TIMELEXX INN\n';
    commands += 'DAILY SALES REPORT\n';
    commands += GS + '!' + '\x00'; // Normal size
    commands += ESC + 'E' + '\x00'; // Bold off
    commands += ESC + 'a' + '\x00'; // Left align
    commands += '================================\n\n';

    // Process report lines
    const lines = reportText.split('\n');
    for (const line of lines) {
      // Skip the header lines we already printed
      if (line.includes('TIMELEXX INN') || line.includes('DAILY SALES REPORT')) {
        continue;
      }
      
      // Check if line is a section header (all caps, not too long)
      const isSectionHeader = line.match(/^[A-Z\s]+$/) && 
                             line.trim().length > 0 && 
                             line.trim().length < 40 &&
                             !line.includes('=');
      
      if (isSectionHeader) {
        commands += ESC + 'E' + '\x01'; // Bold on
        commands += line + '\n';
        commands += ESC + 'E' + '\x00'; // Bold off
      } else {
        commands += line + '\n';
      }
    }

    // Footer
    commands += '\n================================\n';
    commands += ESC + 'a' + '\x01'; // Center align
    commands += '\nThank you!\n\n\n';
    commands += GS + 'V' + '\x00'; // Cut paper

    // Send to printer in chunks to avoid buffer overflow
    const encoder = new TextEncoder();
    const data = encoder.encode(commands);
    const chunkSize = 512;
    
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, Math.min(i + chunkSize, data.length));
      await characteristic.writeValue(chunk);
      // Small delay between chunks
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log('Daily report printed successfully');

  } catch (error) {
    // Silent fail - don't show errors to user
    console.log('Print skipped:', error);
  }
};
