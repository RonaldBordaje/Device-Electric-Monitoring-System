export const MERALCO_RATE = 14.3496; // PHP per kWh

export interface HardwareProfile {
  cpu: string;
  gpu: string;
  ram: number;
  storage: string;
  display: string;
  peripherals: string[];
}

export interface PowerEstimate {
  idle: number;
  average: number;
  peak: number;
}

export interface QuickProfile {
  name: string;
  type: 'laptop' | 'desktop';
  description: string;
  hardware: HardwareProfile;
  power: PowerEstimate;
}

export const QUICK_PROFILES: QuickProfile[] = [
  {
    name: 'Office Laptop',
    type: 'laptop',
    description: 'Basic office tasks, web browsing, documents',
    hardware: {
      cpu: 'Intel Core i5-1235U',
      gpu: 'Intel Iris Xe (Integrated)',
      ram: 8,
      storage: '256GB SSD',
      display: '14" FHD IPS',
      peripherals: ['Wireless Mouse']
    },
    power: { idle: 8, average: 25, peak: 45 }
  },
  {
    name: 'Student Laptop',
    type: 'laptop',
    description: 'Schoolwork, coding, light multimedia',
    hardware: {
      cpu: 'AMD Ryzen 5 7530U',
      gpu: 'AMD Radeon Graphics (Integrated)',
      ram: 16,
      storage: '512GB SSD',
      display: '15.6" FHD IPS',
      peripherals: ['USB Mouse', 'USB Hub']
    },
    power: { idle: 10, average: 30, peak: 55 }
  },
  {
    name: 'Creative Laptop',
    type: 'laptop',
    description: 'Photo/video editing, design work',
    hardware: {
      cpu: 'Intel Core i7-13700H',
      gpu: 'NVIDIA RTX 4060 Laptop',
      ram: 32,
      storage: '1TB NVMe SSD',
      display: '16" QHD+ OLED',
      peripherals: ['Drawing Tablet', 'External Monitor']
    },
    power: { idle: 15, average: 65, peak: 140 }
  },
  {
    name: 'Gaming Laptop',
    type: 'laptop',
    description: 'High-end gaming, streaming',
    hardware: {
      cpu: 'Intel Core i9-13900HX',
      gpu: 'NVIDIA RTX 4080 Laptop',
      ram: 32,
      storage: '2TB NVMe SSD',
      display: '17.3" QHD 240Hz',
      peripherals: ['Gaming Mouse', 'Headset', 'Cooling Pad']
    },
    power: { idle: 25, average: 95, peak: 200 }
  },
  {
    name: 'Office Desktop',
    type: 'desktop',
    description: 'Basic office productivity',
    hardware: {
      cpu: 'Intel Core i3-12100',
      gpu: 'Intel UHD 730 (Integrated)',
      ram: 8,
      storage: '256GB SSD',
      display: '24" FHD Monitor',
      peripherals: ['Keyboard', 'Mouse', 'Speakers']
    },
    power: { idle: 35, average: 65, peak: 95 }
  },
  {
    name: 'Workstation Desktop',
    type: 'desktop',
    description: 'Professional work, development, CAD',
    hardware: {
      cpu: 'AMD Ryzen 7 7700X',
      gpu: 'NVIDIA RTX 4070',
      ram: 32,
      storage: '1TB NVMe SSD + 2TB HDD',
      display: '27" 4K IPS Monitor',
      peripherals: ['Mech Keyboard', 'Mouse', 'Webcam', 'UPS']
    },
    power: { idle: 65, average: 180, peak: 350 }
  },
  {
    name: 'Gaming Desktop',
    type: 'desktop',
    description: 'High-end gaming, content creation',
    hardware: {
      cpu: 'Intel Core i9-14900K',
      gpu: 'NVIDIA RTX 4090',
      ram: 64,
      storage: '2TB NVMe SSD + 4TB HDD',
      display: '32" 4K 144Hz Monitor',
      peripherals: ['Mech Keyboard', 'Gaming Mouse', 'Headset', 'Dual Monitors', 'RGB Lighting']
    },
    power: { idle: 95, average: 350, peak: 650 }
  },
  {
    name: 'Server / NAS',
    type: 'desktop',
    description: 'Home server, network storage, always-on',
    hardware: {
      cpu: 'Intel Xeon E-2388G',
      gpu: 'None (Headless)',
      ram: 64,
      storage: '4x 8TB HDD RAID',
      display: 'None',
      peripherals: ['UPS', 'Network Switch']
    },
    power: { idle: 45, average: 85, peak: 150 }
  }
];

export function calculateCosts(watts: number) {
  const kw = watts / 1000;
  const hourly = kw * MERALCO_RATE;
  const daily = hourly * 8; // 8 hours typical usage
  const monthly = daily * 30;
  const yearly = monthly * 12;
  return { hourly, daily, monthly, yearly, kw };
}

export function getEfficiencyGrade(avgWatts: number, type: 'laptop' | 'desktop'): { grade: string; score: number; color: string } {
  const thresholds = type === 'laptop'
    ? [
        { max: 20, grade: 'S', score: 98, color: '#00FF88' },
        { max: 35, grade: 'A', score: 85, color: '#44FF44' },
        { max: 55, grade: 'B', score: 72, color: '#FFFF00' },
        { max: 80, grade: 'C', score: 58, color: '#FF8800' },
        { max: 120, grade: 'D', score: 40, color: '#FF4400' },
        { max: Infinity, grade: 'F', score: 20, color: '#FF0000' },
      ]
    : [
        { max: 60, grade: 'S', score: 98, color: '#00FF88' },
        { max: 100, grade: 'A', score: 85, color: '#44FF44' },
        { max: 200, grade: 'B', score: 72, color: '#FFFF00' },
        { max: 350, grade: 'C', score: 58, color: '#FF8800' },
        { max: 500, grade: 'D', score: 40, color: '#FF4400' },
        { max: Infinity, grade: 'F', score: 20, color: '#FF0000' },
      ];

  const t = thresholds.find(t => avgWatts <= t.max)!;
  return t;
}

export function getCarbonFootprint(avgWatts: number, hoursPerDay: number = 8): { daily: number; monthly: number; yearly: number } {
  // Philippines grid emission factor: ~0.68 kg CO2 per kWh
  const emissionFactor = 0.68;
  const kw = avgWatts / 1000;
  const dailyKwh = kw * hoursPerDay;
  return {
    daily: dailyKwh * emissionFactor,
    monthly: dailyKwh * 30 * emissionFactor,
    yearly: dailyKwh * 365 * emissionFactor,
  };
}

export function getRecommendations(profile: QuickProfile): string[] {
  const recs: string[] = [];
  const { power, type, hardware } = profile;

  if (power.average > 100) {
    recs.push('Enable power-saving mode in your OS to reduce average consumption by 15-20%');
  }
  if (hardware.gpu.includes('RTX 40')) {
    recs.push('Use NVIDIA\'s whisper mode or set a GPU power limit to reduce energy draw during gaming');
  }
  if (type === 'desktop') {
    recs.push('Use a smart power strip to eliminate phantom power draw when your PC is off');
    recs.push('Consider enabling ErP/EuP in BIOS to minimize standby power to <1W');
  }
  if (type === 'laptop') {
    recs.push('Keep your battery between 20-80% to extend battery life and reduce charging cycles');
  }
  if (hardware.ram >= 32) {
    recs.push('Close unused applications — high RAM doesn\'t mean free power, active modules consume energy');
  }
  if (power.peak > 300) {
    recs.push('Invest in an 80+ Gold or Platinum rated PSU for better energy efficiency');
  }
  if (hardware.display.includes('4K') || hardware.display.includes('QHD')) {
    recs.push('Lower resolution when not needed — 1080p uses significantly less GPU power');
  }
  recs.push('Schedule heavy tasks during off-peak hours (10PM-6AM) for lower electricity rates');
  recs.push('Enable display auto-brightness and reduce max brightness by 20% to save 5-10W');
  
  return recs.slice(0, 6);
}

export function getComponentBreakdown(profile: QuickProfile): { component: string; watts: number; percentage: number }[] {
  const { power, hardware } = profile;
  const total = power.average;
  
  const hasGpu = !hardware.gpu.includes('Integrated') && !hardware.gpu.includes('None');
  const isDesktop = profile.type === 'desktop';
  
  const components: { component: string; watts: number }[] = [];
  
  if (hasGpu) {
    const gpuW = total * (isDesktop ? 0.45 : 0.40);
    const cpuW = total * (isDesktop ? 0.25 : 0.28);
    components.push({ component: 'GPU', watts: Math.round(gpuW) });
    components.push({ component: 'CPU', watts: Math.round(cpuW) });
  } else {
    const cpuW = total * 0.45;
    components.push({ component: 'CPU (w/ iGPU)', watts: Math.round(cpuW) });
  }
  
  const ramW = Math.round(hardware.ram * 0.3);
  components.push({ component: 'RAM', watts: ramW });
  
  const storageW = hardware.storage.includes('HDD') ? 8 : 3;
  components.push({ component: 'Storage', watts: storageW });
  
  if (hardware.display !== 'None') {
    const displayW = isDesktop ? Math.round(total * 0.15) : Math.round(total * 0.12);
    components.push({ component: 'Display', watts: displayW });
  }
  
  const accounted = components.reduce((s, c) => s + c.watts, 0);
  const otherW = Math.max(total - accounted, 2);
  components.push({ component: 'Other (fans, USB, etc)', watts: Math.round(otherW) });
  
  const grandTotal = components.reduce((s, c) => s + c.watts, 0);
  
  return components.map(c => ({
    ...c,
    percentage: Math.round((c.watts / grandTotal) * 100)
  }));
}
