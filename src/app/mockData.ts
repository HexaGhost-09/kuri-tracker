export interface Subscriber {
  id: string;
  name: string;
  phone: string;
  email: string;
  memberUuid?: string;
}

export interface KuriSubscriber {
  subscriberId: string;
  ticketNumber: number;
  isPrized: boolean;
  prizedMonth?: number;
  prizedAmount?: number;
}

export interface Auction {
  id: string;
  kuriId: string;
  month: number;
  date: string;
  winningSubscriberId: string;
  winningBid: number; // The amount the prized subscriber accepted (e.g. 75,000 out of 100,000 pool)
  discount: number; // totalValue - winningBid
  commission: number; // foreman commission (e.g. 5% of totalValue)
  // Standard Indian Kuri rule: Foreman commission is deducted from the total value or the monthly collection.
  // Usually, discount is distributed to subscribers, but foreman commission is subtracted first.
  // Net pool to prize = winningBid.
  // Total dividend = discount. (Actually, subscribers get: (discount - foreman commission) / totalSubscribers. Let's make it standard).
  dividendPerMember: number;
  netInstallment: number; // standardInstallment - dividendPerMember
}

export interface Payment {
  id: string;
  kuriId: string;
  subscriberId: string;
  month: number;
  amount: number;
  date: string;
  status: 'paid' | 'pending';
}

export interface Kuri {
  id: string;
  name: string;
  totalValue: number; // e.g. 5,00,000
  durationMonths: number; // e.g. 20
  installmentAmount: number; // totalValue / durationMonths (e.g. 25,000)
  foremanCommissionPercent: number; // e.g. 5%
  startDate: string;
  status: 'active' | 'completed';
  subscribers: KuriSubscriber[];
  currentMonth: number;
}

// Default Global Subscribers Pool
export const DEFAULT_SUBSCRIBERS: Subscriber[] = [
  { id: 'sub-1', name: 'Ragesh Pillai', phone: '+91 98456 12301', email: 'ragesh@gmail.com' },
  { id: 'sub-2', name: 'Anjali Menon', phone: '+91 94471 23456', email: 'anjali.m@yahoo.com' },
  { id: 'sub-3', name: 'Dr. Thomas Kurian', phone: '+91 98950 87654', email: 'thomas.k@kims.health' },
  { id: 'sub-4', name: 'Faisal Muhammad', phone: '+91 95620 98765', email: 'faisal.m@gmail.com' },
  { id: 'sub-5', name: 'Sandhya Suresh', phone: '+91 81290 55432', email: 'sandhya.s@outlook.com' },
  { id: 'sub-6', name: 'Vikram Seth', phone: '+91 90370 12121', email: 'vikram.seth@gmail.com' },
  { id: 'sub-7', name: 'Nandu Krishna', phone: '+91 97441 55667', email: 'nandukrish@chitty.in' },
  { id: 'sub-8', name: 'Mary Joseph', phone: '+91 94951 88990', email: 'mary.j@stmarys.edu' },
  { id: 'sub-9', name: 'Abhilash Nair', phone: '+91 85472 33445', email: 'abhilash.n@tcs.com' },
  { id: 'sub-10', name: 'Deepa Varma', phone: '+91 96330 44556', email: 'deepa.varma@gmail.com' },
];

// Sample Kuries
export const DEFAULT_KURIES: Kuri[] = [
  {
    id: 'kuri-1',
    name: 'Royal Elite Monthly 5 Lakhs',
    totalValue: 500000,
    durationMonths: 10,
    installmentAmount: 50000,
    foremanCommissionPercent: 5,
    startDate: '2026-01-10',
    status: 'active',
    currentMonth: 4,
    subscribers: [
      { subscriberId: 'sub-1', ticketNumber: 1, isPrized: true, prizedMonth: 1, prizedAmount: 380000 },
      { subscriberId: 'sub-2', ticketNumber: 2, isPrized: true, prizedMonth: 2, prizedAmount: 410000 },
      { subscriberId: 'sub-3', ticketNumber: 3, isPrized: true, prizedMonth: 3, prizedAmount: 430000 },
      { subscriberId: 'sub-4', ticketNumber: 4, isPrized: false },
      { subscriberId: 'sub-5', ticketNumber: 5, isPrized: false },
      { subscriberId: 'sub-6', ticketNumber: 6, isPrized: false },
      { subscriberId: 'sub-7', ticketNumber: 7, isPrized: false },
      { subscriberId: 'sub-8', ticketNumber: 8, isPrized: false },
      { subscriberId: 'sub-9', ticketNumber: 9, isPrized: false },
      { subscriberId: 'sub-10', ticketNumber: 10, isPrized: false },
    ],
  },
  {
    id: 'kuri-2',
    name: 'Smart Savers 1 Lakh',
    totalValue: 100000,
    durationMonths: 5,
    installmentAmount: 20000,
    foremanCommissionPercent: 5,
    startDate: '2026-03-01',
    status: 'active',
    currentMonth: 2,
    subscribers: [
      { subscriberId: 'sub-4', ticketNumber: 1, isPrized: true, prizedMonth: 1, prizedAmount: 82000 },
      { subscriberId: 'sub-5', ticketNumber: 2, isPrized: false },
      { subscriberId: 'sub-6', ticketNumber: 3, isPrized: false },
      { subscriberId: 'sub-7', ticketNumber: 4, isPrized: false },
      { subscriberId: 'sub-8', ticketNumber: 5, isPrized: false },
    ],
  },
  {
    id: 'kuri-3',
    name: 'Grand Premium 10 Lakhs',
    totalValue: 1000000,
    durationMonths: 20,
    installmentAmount: 50000,
    foremanCommissionPercent: 5,
    startDate: '2026-05-15',
    status: 'active',
    currentMonth: 1,
    subscribers: [
      { subscriberId: 'sub-1', ticketNumber: 1, isPrized: false },
      { subscriberId: 'sub-2', ticketNumber: 2, isPrized: false },
      { subscriberId: 'sub-3', ticketNumber: 3, isPrized: false },
      { subscriberId: 'sub-4', ticketNumber: 4, isPrized: false },
      { subscriberId: 'sub-5', ticketNumber: 5, isPrized: false },
      { subscriberId: 'sub-6', ticketNumber: 6, isPrized: false },
      { subscriberId: 'sub-7', ticketNumber: 7, isPrized: false },
      { subscriberId: 'sub-8', ticketNumber: 8, isPrized: false },
      { subscriberId: 'sub-9', ticketNumber: 9, isPrized: false },
      { subscriberId: 'sub-10', ticketNumber: 10, isPrized: false },
    ],
  }
];

// Sample Auctions
export const DEFAULT_AUCTIONS: Auction[] = [
  // Royal Elite Monthly 5 Lakhs (Kuri 1)
  {
    id: 'auc-1',
    kuriId: 'kuri-1',
    month: 1,
    date: '2026-01-10',
    winningSubscriberId: 'sub-1',
    winningBid: 380000,
    discount: 120000,
    commission: 25000,
    dividendPerMember: 9500, // (120000 - 25000 foreman) / 10 = 9500
    netInstallment: 40500,  // 50000 - 9500
  },
  {
    id: 'auc-2',
    kuriId: 'kuri-1',
    month: 2,
    date: '2026-02-10',
    winningSubscriberId: 'sub-2',
    winningBid: 410000,
    discount: 90000,
    commission: 25000,
    dividendPerMember: 6500, // (90000 - 25000) / 10 = 6500
    netInstallment: 43500,  // 50000 - 6500
  },
  {
    id: 'auc-3',
    kuriId: 'kuri-1',
    month: 3,
    date: '2026-03-10',
    winningSubscriberId: 'sub-3',
    winningBid: 430000,
    discount: 70000,
    commission: 25000,
    dividendPerMember: 4500, // (70000 - 25000) / 10 = 4500
    netInstallment: 45500,  // 50000 - 4500
  },
  // Smart Savers 1 Lakh (Kuri 2)
  {
    id: 'auc-4',
    kuriId: 'kuri-2',
    month: 1,
    date: '2026-03-01',
    winningSubscriberId: 'sub-4',
    winningBid: 82000,
    discount: 18000,
    commission: 5000,
    dividendPerMember: 2600, // (18000 - 5000) / 5 = 2600
    netInstallment: 17400,  // 20000 - 2600
  }
];

// Sample Payments
export const DEFAULT_PAYMENTS: Payment[] = [
  // Payments for Kuri 1, Month 1 (installment was 40500)
  { id: 'pay-1', kuriId: 'kuri-1', subscriberId: 'sub-1', month: 1, amount: 40500, date: '2026-01-08', status: 'paid' },
  { id: 'pay-2', kuriId: 'kuri-1', subscriberId: 'sub-2', month: 1, amount: 40500, date: '2026-01-09', status: 'paid' },
  { id: 'pay-3', kuriId: 'kuri-1', subscriberId: 'sub-3', month: 1, amount: 40500, date: '2026-01-09', status: 'paid' },
  { id: 'pay-4', kuriId: 'kuri-1', subscriberId: 'sub-4', month: 1, amount: 40500, date: '2026-01-10', status: 'paid' },
  { id: 'pay-5', kuriId: 'kuri-1', subscriberId: 'sub-5', month: 1, amount: 40500, date: '2026-01-10', status: 'paid' },
  { id: 'pay-6', kuriId: 'kuri-1', subscriberId: 'sub-6', month: 1, amount: 40500, date: '2026-01-11', status: 'paid' },
  { id: 'pay-7', kuriId: 'kuri-1', subscriberId: 'sub-7', month: 1, amount: 40500, date: '2026-01-12', status: 'paid' },
  { id: 'pay-8', kuriId: 'kuri-1', subscriberId: 'sub-8', month: 1, amount: 40500, date: '2026-01-12', status: 'paid' },
  { id: 'pay-9', kuriId: 'kuri-1', subscriberId: 'sub-9', month: 1, amount: 40500, date: '2026-01-07', status: 'paid' },
  { id: 'pay-10', kuriId: 'kuri-1', subscriberId: 'sub-10', month: 1, amount: 40500, date: '2026-01-10', status: 'paid' },

  // Payments for Kuri 1, Month 2 (installment was 43500)
  { id: 'pay-11', kuriId: 'kuri-1', subscriberId: 'sub-1', month: 2, amount: 43500, date: '2026-02-08', status: 'paid' },
  { id: 'pay-12', kuriId: 'kuri-1', subscriberId: 'sub-2', month: 2, amount: 43500, date: '2026-02-09', status: 'paid' },
  { id: 'pay-13', kuriId: 'kuri-1', subscriberId: 'sub-3', month: 2, amount: 43500, date: '2026-02-09', status: 'paid' },
  { id: 'pay-14', kuriId: 'kuri-1', subscriberId: 'sub-4', month: 2, amount: 43500, date: '2026-02-10', status: 'paid' },
  { id: 'pay-15', kuriId: 'kuri-1', subscriberId: 'sub-5', month: 2, amount: 43500, date: '2026-02-10', status: 'paid' },
  { id: 'pay-16', kuriId: 'kuri-1', subscriberId: 'sub-6', month: 2, amount: 43500, date: '2026-02-11', status: 'paid' },
  { id: 'pay-17', kuriId: 'kuri-1', subscriberId: 'sub-7', month: 2, amount: 43500, date: '2026-02-12', status: 'paid' },
  { id: 'pay-18', kuriId: 'kuri-1', subscriberId: 'sub-8', month: 2, amount: 43500, date: '2026-02-12', status: 'paid' },
  { id: 'pay-19', kuriId: 'kuri-1', subscriberId: 'sub-9', month: 2, amount: 43500, date: '2026-02-07', status: 'paid' },
  { id: 'pay-20', kuriId: 'kuri-1', subscriberId: 'sub-10', month: 2, amount: 43500, date: '2026-02-10', status: 'paid' },

  // Payments for Kuri 1, Month 3 (installment was 45500)
  { id: 'pay-21', kuriId: 'kuri-1', subscriberId: 'sub-1', month: 3, amount: 45500, date: '2026-03-08', status: 'paid' },
  { id: 'pay-22', kuriId: 'kuri-1', subscriberId: 'sub-2', month: 3, amount: 45500, date: '2026-03-09', status: 'paid' },
  { id: 'pay-23', kuriId: 'kuri-1', subscriberId: 'sub-3', month: 3, amount: 45500, date: '2026-03-09', status: 'paid' },
  { id: 'pay-24', kuriId: 'kuri-1', subscriberId: 'sub-4', month: 3, amount: 45500, date: '2026-03-10', status: 'paid' },
  { id: 'pay-25', kuriId: 'kuri-1', subscriberId: 'sub-5', month: 3, amount: 45500, date: '2026-03-10', status: 'paid' },
  { id: 'pay-26', kuriId: 'kuri-1', subscriberId: 'sub-6', month: 3, amount: 45500, date: '2026-03-11', status: 'paid' },
  { id: 'pay-27', kuriId: 'kuri-1', subscriberId: 'sub-7', month: 3, amount: 45500, date: '2026-03-12', status: 'paid' },
  { id: 'pay-28', kuriId: 'kuri-1', subscriberId: 'sub-8', month: 3, amount: 45500, date: '2026-03-12', status: 'paid' },
  { id: 'pay-29', kuriId: 'kuri-1', subscriberId: 'sub-9', month: 3, amount: 45500, date: '2026-03-07', status: 'paid' },
  { id: 'pay-30', kuriId: 'kuri-1', subscriberId: 'sub-10', month: 3, amount: 45500, date: '2026-03-10', status: 'paid' },

  // Payments for Kuri 1, Month 4 (current installment: 50000, since auction 4 hasn't run yet)
  { id: 'pay-31', kuriId: 'kuri-1', subscriberId: 'sub-1', month: 4, amount: 50000, date: '2026-04-05', status: 'paid' },
  { id: 'pay-32', kuriId: 'kuri-1', subscriberId: 'sub-2', month: 4, amount: 50000, date: '2026-04-06', status: 'paid' },
  { id: 'pay-33', kuriId: 'kuri-1', subscriberId: 'sub-3', month: 4, amount: 50000, date: '2026-04-06', status: 'paid' },
  { id: 'pay-34', kuriId: 'kuri-1', subscriberId: 'sub-4', month: 4, amount: 50000, date: '2026-04-07', status: 'pending' },
  { id: 'pay-35', kuriId: 'kuri-1', subscriberId: 'sub-5', month: 4, amount: 50000, date: '2026-04-07', status: 'paid' },
  { id: 'pay-36', kuriId: 'kuri-1', subscriberId: 'sub-6', month: 4, amount: 50000, date: '', status: 'pending' },
  { id: 'pay-37', kuriId: 'kuri-1', subscriberId: 'sub-7', month: 4, amount: 50000, date: '2026-04-08', status: 'paid' },
  { id: 'pay-38', kuriId: 'kuri-1', subscriberId: 'sub-8', month: 4, amount: 50000, date: '', status: 'pending' },
  { id: 'pay-39', kuriId: 'kuri-1', subscriberId: 'sub-9', month: 4, amount: 50000, date: '2026-04-04', status: 'paid' },
  { id: 'pay-40', kuriId: 'kuri-1', subscriberId: 'sub-10', month: 4, amount: 50000, date: '', status: 'pending' },

  // Payments for Kuri 2, Month 1 (installment 17400)
  { id: 'pay-41', kuriId: 'kuri-2', subscriberId: 'sub-4', month: 1, amount: 17400, date: '2026-03-01', status: 'paid' },
  { id: 'pay-42', kuriId: 'kuri-2', subscriberId: 'sub-5', month: 1, amount: 17400, date: '2026-03-02', status: 'paid' },
  { id: 'pay-43', kuriId: 'kuri-2', subscriberId: 'sub-6', month: 1, amount: 17400, date: '2026-03-02', status: 'paid' },
  { id: 'pay-44', kuriId: 'kuri-2', subscriberId: 'sub-7', month: 1, amount: 17400, date: '2026-03-03', status: 'paid' },
  { id: 'pay-45', kuriId: 'kuri-2', subscriberId: 'sub-8', month: 1, amount: 17400, date: '2026-03-03', status: 'paid' },

  // Payments for Kuri 2, Month 2 (installment 20000, since auction 2 hasn't run yet)
  { id: 'pay-46', kuriId: 'kuri-2', subscriberId: 'sub-4', month: 2, amount: 20000, date: '2026-04-01', status: 'paid' },
  { id: 'pay-47', kuriId: 'kuri-2', subscriberId: 'sub-5', month: 2, amount: 20000, date: '', status: 'pending' },
  { id: 'pay-48', kuriId: 'kuri-2', subscriberId: 'sub-6', month: 2, amount: 20000, date: '2026-04-02', status: 'paid' },
  { id: 'pay-49', kuriId: 'kuri-2', subscriberId: 'sub-7', month: 2, amount: 20000, date: '', status: 'pending' },
  { id: 'pay-50', kuriId: 'kuri-2', subscriberId: 'sub-8', month: 2, amount: 20000, date: '2026-04-02', status: 'paid' },
];
