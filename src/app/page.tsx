'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Layers, 
  Plus, 
  Calculator, 
  History, 
  UserPlus, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  ChevronRight, 
  Info, 
  Percent, 
  Calendar, 
  Sparkles, 
  Trash2, 
  Search, 
  X, 
  Mail,
  Phone,
  Building,
  ShieldCheck,
  TrendingDown,
  HelpCircle,
  AlertCircle,
  LogIn,
  LogOut,
  KeyRound,
  UserCheck,
  Cloud,
  CloudLightning,
  User
} from 'lucide-react';
import { 
  Subscriber, 
  KuriSubscriber, 
  Auction, 
  Payment, 
  Kuri,
  DEFAULT_SUBSCRIBERS,
  DEFAULT_KURIES,
  DEFAULT_AUCTIONS,
  DEFAULT_PAYMENTS 
} from './mockData';

export default function Home() {
  // --- STATE ---
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [kuries, setKuries] = useState<Kuri[]>([]);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'kuries' | 'subscribers' | 'calculator'>('dashboard');
  const [selectedKuriId, setSelectedKuriId] = useState<string | null>(null);
  
  // Modals state
  const [isKuriModalOpen, setIsKuriModalOpen] = useState(false);
  const [isSubscriberModalOpen, setIsSubscriberModalOpen] = useState(false);
  const [isAuctionModalOpen, setIsAuctionModalOpen] = useState(false);
  
  // --- AUTHENTICATION STATE ---
  interface UserProfile {
    id: number;
    name: string;
    email: string;
  }
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [showAuthOverlay, setShowAuthOverlay] = useState(true);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  
  // Auth Form State
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  // Sync State
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'synced' | 'local' | 'error'>('local');
  const [lastSynced, setLastSynced] = useState<string>('');

  // --- FORM STATES ---
  // New Kuri Form
  const [newKuriName, setNewKuriName] = useState('');
  const [newKuriTotalValue, setNewKuriTotalValue] = useState(500000);
  const [newKuriDuration, setNewKuriDuration] = useState(10);
  const [newKuriCommission, setNewKuriCommission] = useState(5);
  const [newKuriStartDate, setNewKuriStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEnrollSubscribers, setSelectedEnrollSubscribers] = useState<string[]>([]);
  
  // New Subscriber Form
  const [newSubName, setNewSubName] = useState('');
  const [newSubPhone, setNewSubPhone] = useState('');
  const [newSubEmail, setNewSubEmail] = useState('');
  
  // Run Auction Form
  const [auctionWinningBid, setAuctionWinningBid] = useState(400000); 
  const [auctionWinningSubId, setAuctionWinningSubId] = useState('');
  
  // Subscriber Search & Filters
  const [subSearchQuery, setSubSearchQuery] = useState('');
  
  // Simulator state
  const [simChitAmount, setSimChitAmount] = useState(500000);
  const [simMonths, setSimMonths] = useState(20);
  const [simCommission, setSimCommission] = useState(5);
  const [simAvgDiscount, setSimAvgDiscount] = useState(25); 

  // --- AUTH PROFILE CHECK ON MOUNT ---
  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        
        if (data.user) {
          setUser(data.user);
          setShowAuthOverlay(false);
          setSyncStatus('syncing');
          
          // Pull synced state from Neon DB
          const syncRes = await fetch('/api/sync');
          const syncData = await syncRes.json();
          
          if (syncData.kuries && syncData.kuries.length > 0) {
            setSubscribers(syncData.subscribers);
            setKuries(syncData.kuries);
            setAuctions(syncData.auctions);
            setPayments(syncData.payments);
            setSyncStatus('synced');
            setLastSynced(new Date().toLocaleTimeString());
          } else {
            // New account is empty! Hydrate database with our gorgeous default mockup data.
            await fetch('/api/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                subscribers: DEFAULT_SUBSCRIBERS,
                kuries: DEFAULT_KURIES,
                auctions: DEFAULT_AUCTIONS,
                payments: DEFAULT_PAYMENTS
              })
            });
            setSubscribers(DEFAULT_SUBSCRIBERS);
            setKuries(DEFAULT_KURIES);
            setAuctions(DEFAULT_AUCTIONS);
            setPayments(DEFAULT_PAYMENTS);
            setSyncStatus('synced');
            setLastSynced(new Date().toLocaleTimeString());
          }
        } else {
          // No session found, load from LocalStorage fallback if previously selected skipped mode
          const skipped = localStorage.getItem('kuriflow_auth_skipped') === 'true';
          if (skipped) {
            setShowAuthOverlay(false);
            loadLocalStorageFallback();
          }
        }
      } catch (err) {
        console.error('Session verify error:', err);
        loadLocalStorageFallback();
      } finally {
        setIsAuthChecking(false);
      }
    }
    checkSession();
  }, []);

  const loadLocalStorageFallback = () => {
    const storedSubs = localStorage.getItem('kuri_subscribers');
    const storedKuries = localStorage.getItem('kuri_kuries');
    const storedAuctions = localStorage.getItem('kuri_auctions');
    const storedPayments = localStorage.getItem('kuri_payments');
    
    if (storedSubs && storedKuries && storedAuctions && storedPayments) {
      setSubscribers(JSON.parse(storedSubs));
      setKuries(JSON.parse(storedKuries));
      setAuctions(JSON.parse(storedAuctions));
      setPayments(JSON.parse(storedPayments));
    } else {
      setSubscribers(DEFAULT_SUBSCRIBERS);
      setKuries(DEFAULT_KURIES);
      setAuctions(DEFAULT_AUCTIONS);
      setPayments(DEFAULT_PAYMENTS);
    }
    setSyncStatus('local');
  };

  // --- SAVE & AUTO-SYNC ENGINE ---
  const saveState = async (
    newSubs: Subscriber[], 
    newKuries: Kuri[], 
    newAuctions: Auction[], 
    newPayments: Payment[]
  ) => {
    // 1. Instantly update local state for real-time fluid responsiveness
    setSubscribers(newSubs);
    setKuries(newKuries);
    setAuctions(newAuctions);
    setPayments(newPayments);

    // 2. Persist to LocalStorage fallback
    localStorage.setItem('kuri_subscribers', JSON.stringify(newSubs));
    localStorage.setItem('kuri_kuries', JSON.stringify(newKuries));
    localStorage.setItem('kuri_auctions', JSON.stringify(newAuctions));
    localStorage.setItem('kuri_payments', JSON.stringify(newPayments));

    // 3. Auto-sync to Neon DB if logged in
    if (user) {
      setSyncStatus('syncing');
      try {
        const syncRes = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscribers: newSubs,
            kuries: newKuries,
            auctions: newAuctions,
            payments: newPayments
          })
        });
        
        if (syncRes.ok) {
          setSyncStatus('synced');
          setLastSynced(new Date().toLocaleTimeString());
        } else {
          setSyncStatus('error');
        }
      } catch (err) {
        console.error('Auto sync error:', err);
        setSyncStatus('error');
      }
    } else {
      setSyncStatus('local');
    }
  };

  // --- AUTH HANDLERS ---
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      if (authTab === 'signup') {
        // Sign Up Flow
        const signupRes = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: authName,
            email: authEmail,
            password: authPassword
          })
        });
        
        const signupData = await signupRes.json();
        
        if (!signupRes.ok) {
          throw new Error(signupData.error || 'Signup failed');
        }

        // Successfully registered! Auto-login them now.
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: authEmail,
            password: authPassword
          })
        });

        const loginData = await loginRes.json();
        if (!loginRes.ok) {
          throw new Error(loginData.error || 'Auto-login failed after registration');
        }

        setUser(loginData.user);
        setShowAuthOverlay(false);
        setSyncStatus('syncing');
        
        // Auto-seed Neon DB with current local/mock data on new signup
        const activeSubs = subscribers.length > 0 ? subscribers : DEFAULT_SUBSCRIBERS;
        const activeKuries = kuries.length > 0 ? kuries : DEFAULT_KURIES;
        const activeAuctions = auctions.length > 0 ? auctions : DEFAULT_AUCTIONS;
        const activePayments = payments.length > 0 ? payments : DEFAULT_PAYMENTS;
        
        await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscribers: activeSubs,
            kuries: activeKuries,
            auctions: activeAuctions,
            payments: activePayments
          })
        });
        
        setSubscribers(activeSubs);
        setKuries(activeKuries);
        setAuctions(activeAuctions);
        setPayments(activePayments);
        setSyncStatus('synced');
        setLastSynced(new Date().toLocaleTimeString());

      } else {
        // Login Flow
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: authEmail,
            password: authPassword
          })
        });

        const loginData = await loginRes.json();
        if (!loginRes.ok) {
          throw new Error(loginData.error || 'Invalid credentials');
        }

        setUser(loginData.user);
        setShowAuthOverlay(false);
        setSyncStatus('syncing');

        // Fetch user data from Neon DB
        const syncRes = await fetch('/api/sync');
        const syncData = await syncRes.json();
        
        if (syncData.kuries && syncData.kuries.length > 0) {
          setSubscribers(syncData.subscribers);
          setKuries(syncData.kuries);
          setAuctions(syncData.auctions);
          setPayments(syncData.payments);
        } else {
          // Empty account! Seed Neon with their current client data (mockup or local custom edits)
          const activeSubs = subscribers.length > 0 ? subscribers : DEFAULT_SUBSCRIBERS;
          const activeKuries = kuries.length > 0 ? kuries : DEFAULT_KURIES;
          const activeAuctions = auctions.length > 0 ? auctions : DEFAULT_AUCTIONS;
          const activePayments = payments.length > 0 ? payments : DEFAULT_PAYMENTS;

          await fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subscribers: activeSubs,
              kuries: activeKuries,
              auctions: activeAuctions,
              payments: activePayments
            })
          });
          setSubscribers(activeSubs);
          setKuries(activeKuries);
          setAuctions(activeAuctions);
          setPayments(activePayments);
        }
        
        setSyncStatus('synced');
        setLastSynced(new Date().toLocaleTimeString());
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
        setUser(null);
        localStorage.removeItem('kuriflow_auth_skipped');
        setShowAuthOverlay(true);
        setSyncStatus('local');
        // Reset state to defaults
        setSubscribers(DEFAULT_SUBSCRIBERS);
        setKuries(DEFAULT_KURIES);
        setAuctions(DEFAULT_AUCTIONS);
        setPayments(DEFAULT_PAYMENTS);
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
  };

  const handleSkipAuth = () => {
    localStorage.setItem('kuriflow_auth_skipped', 'true');
    setShowAuthOverlay(false);
    loadLocalStorageFallback();
  };

  // --- COMPUTED DASHBOARD METRICS ---
  const dashboardStats = useMemo(() => {
    const totalFUM = kuries.reduce((sum, k) => sum + Number(k.totalValue), 0);
    const activeKuriesCount = kuries.filter(k => k.status === 'active').length;
    
    const totalDividends = auctions.reduce((sum, a) => sum + (Number(a.discount) - Number(a.commission)), 0);
    
    const totalPaymentsCount = payments.length;
    const paidPayments = payments.filter(p => p.status === 'paid');
    const totalCollected = paidPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    
    const pendingPayments = payments.filter(p => p.status === 'pending');
    const totalPending = pendingPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    
    const totalForemanCommission = auctions.reduce((sum, a) => sum + Number(a.commission), 0);

    return {
      totalFUM,
      activeKuriesCount,
      totalDividends,
      totalCollected,
      totalPending,
      totalForemanCommission,
      collectionRate: totalPaymentsCount > 0 ? Math.round((paidPayments.length / totalPaymentsCount) * 100) : 0
    };
  }, [kuries, auctions, payments]);

  // Selected Kuri for Detail View
  const selectedKuri = useMemo(() => {
    if (!selectedKuriId) return null;
    return kuries.find(k => k.id === selectedKuriId) || null;
  }, [kuries, selectedKuriId]);

  // --- FRONTEND ACTION HANDLERS ---
  
  // Create Subscriber
  const handleAddSubscriber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;
    
    const newSub: Subscriber = {
      id: `sub-${Date.now()}`,
      name: newSubName,
      phone: newSubPhone || '+91 99999 00000',
      email: newSubEmail || `${newSubName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
    };
    
    const updatedSubs = [...subscribers, newSub];
    saveState(updatedSubs, kuries, auctions, payments);
    
    setNewSubName('');
    setNewSubPhone('');
    setNewSubEmail('');
    setIsSubscriberModalOpen(false);
  };

  // Create Kuri
  const handleCreateKuri = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKuriName.trim() || selectedEnrollSubscribers.length === 0) {
      alert('Please fill out all details and select at least 1 subscriber!');
      return;
    }
    
    const duration = Number(newKuriDuration);
    const totalVal = Number(newKuriTotalValue);
    const commissionPct = Number(newKuriCommission);
    const installmentAmt = totalVal / duration;
    const kuriId = `kuri-${Date.now()}`;
    
    const enrolledKuriSubs: KuriSubscriber[] = selectedEnrollSubscribers.map((subId, idx) => ({
      subscriberId: subId,
      ticketNumber: idx + 1,
      isPrized: false
    }));
    
    const newKuri: Kuri = {
      id: kuriId,
      name: newKuriName,
      totalValue: totalVal,
      durationMonths: duration,
      installmentAmount: installmentAmt,
      foremanCommissionPercent: commissionPct,
      startDate: newKuriStartDate,
      status: 'active',
      currentMonth: 1,
      subscribers: enrolledKuriSubs
    };

    const newInstallmentPayments: Payment[] = enrolledKuriSubs.map(sub => ({
      id: `pay-${Date.now()}-${sub.subscriberId}`,
      kuriId: kuriId,
      subscriberId: sub.subscriberId,
      month: 1,
      amount: installmentAmt,
      date: '',
      status: 'pending'
    }));

    const updatedKuries = [...kuries, newKuri];
    const updatedPayments = [...payments, ...newInstallmentPayments];

    saveState(subscribers, updatedKuries, auctions, updatedPayments);
    
    setNewKuriName('');
    setNewKuriTotalValue(500000);
    setNewKuriDuration(10);
    setNewKuriCommission(5);
    setSelectedEnrollSubscribers([]);
    setIsKuriModalOpen(false);
    setSelectedKuriId(kuriId); 
    setActiveTab('kuries');
  };

  // Conduct/Record Auction
  const handleRunAuction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKuriId || !auctionWinningSubId) return;
    
    const k = kuries.find(k => k.id === selectedKuriId);
    if (!k) return;

    const currentM = k.currentMonth;
    const totalVal = k.totalValue;
    const bidAmount = Number(auctionWinningBid); 
    const commission = (totalVal * k.foremanCommissionPercent) / 100;
    const discount = totalVal - bidAmount;
    
    if (discount < commission) {
      alert(`Discount (${discount}) cannot be less than Foreman Commission (${commission})! Winning bid is too high.`);
      return;
    }
    
    const totalDividends = discount - commission;
    const numSubscribers = k.subscribers.length;
    const dividendPerMember = totalDividends / numSubscribers;
    const netInstallment = k.installmentAmount - dividendPerMember;

    const newAuction: Auction = {
      id: `auc-${Date.now()}`,
      kuriId: selectedKuriId,
      month: currentM,
      date: new Date().toISOString().split('T')[0],
      winningSubscriberId: auctionWinningSubId,
      winningBid: bidAmount,
      discount: discount,
      commission: commission,
      dividendPerMember: dividendPerMember,
      netInstallment: netInstallment
    };

    const updatedKuries = kuries.map(currKuri => {
      if (currKuri.id === selectedKuriId) {
        const updatedSubs = currKuri.subscribers.map(sub => {
          if (sub.subscriberId === auctionWinningSubId) {
            return {
              ...sub,
              isPrized: true,
              prizedMonth: currentM,
              prizedAmount: bidAmount
            };
          }
          return sub;
        });

        const isLastMonth = currentM >= currKuri.durationMonths;
        return {
          ...currKuri,
          currentMonth: isLastMonth ? currentM : currentM + 1,
          status: isLastMonth ? 'completed' : currKuri.status,
          subscribers: updatedSubs
        };
      }
      return currKuri;
    });

    let updatedPayments: Payment[] = payments.map(pay => {
      if (pay.kuriId === selectedKuriId && pay.month === currentM) {
        return {
          ...pay,
          amount: netInstallment
        };
      }
      return pay;
    });

    const isLastMonth = currentM >= k.durationMonths;
    if (!isLastMonth) {
      const nextMonthPayments: Payment[] = k.subscribers.map(sub => ({
        id: `pay-${Date.now()}-m${currentM + 1}-${sub.subscriberId}`,
        kuriId: selectedKuriId,
        subscriberId: sub.subscriberId,
        month: currentM + 1,
        amount: k.installmentAmount, 
        date: '',
        status: 'pending'
      }));
      updatedPayments = [...updatedPayments, ...nextMonthPayments];
    }

    const updatedAuctions = [...auctions, newAuction];

    saveState(subscribers, updatedKuries, updatedAuctions, updatedPayments);
    setIsAuctionModalOpen(false);
    setAuctionWinningSubId('');
  };

  // Toggle Payment Status
  const togglePaymentStatus = (paymentId: string) => {
    const updatedPayments: Payment[] = payments.map(pay => {
      if (pay.id === paymentId) {
        return {
          ...pay,
          status: (pay.status === 'paid' ? 'pending' : 'paid') as 'paid' | 'pending',
          date: pay.status === 'pending' ? new Date().toISOString().split('T')[0] : ''
        };
      }
      return pay;
    });
    saveState(subscribers, kuries, auctions, updatedPayments);
  };

  // Delete Kuri
  const handleDeleteKuri = (kuriId: string) => {
    if (confirm('Are you sure you want to delete this Kuri and all its auction/payment records?')) {
      const updatedKuries = kuries.filter(k => k.id !== kuriId);
      const updatedAuctions = auctions.filter(a => a.kuriId !== kuriId);
      const updatedPayments = payments.filter(p => p.kuriId !== kuriId);
      saveState(subscribers, updatedKuries, updatedAuctions, updatedPayments);
      setSelectedKuriId(null);
    }
  };

  // Delete Subscriber
  const handleDeleteSubscriber = (subId: string) => {
    const isEnrolled = kuries.some(k => 
      k.status === 'active' && k.subscribers.some(ks => ks.subscriberId === subId)
    );
    if (isEnrolled) {
      alert('This subscriber is currently enrolled in an active Kuri and cannot be deleted!');
      return;
    }

    if (confirm('Are you sure you want to delete this subscriber?')) {
      const updatedSubs = subscribers.filter(s => s.id !== subId);
      saveState(updatedSubs, kuries, auctions, payments);
    }
  };

  const toggleSubSelect = (subId: string) => {
    if (selectedEnrollSubscribers.includes(subId)) {
      setSelectedEnrollSubscribers(selectedEnrollSubscribers.filter(id => id !== subId));
    } else {
      setSelectedEnrollSubscribers([...selectedEnrollSubscribers, subId]);
    }
  };

  // --- FINANCIAL CALCULATOR / SIMULATION LOGIC ---
  const simulationSchedule = useMemo(() => {
    const amount = Number(simChitAmount);
    const months = Number(simMonths);
    const commPct = Number(simCommission);
    const commission = (amount * commPct) / 100;
    
    const avgDiscountAmt = amount * (simAvgDiscount / 100);
    const totalAvailDividends = avgDiscountAmt - commission;
    const avgMonthlyDividend = totalAvailDividends / months;
    
    let totalPaid = 0;
    const schedule = [];
    
    for (let m = 1; m <= months; m++) {
      const maxDiscountPct = simAvgDiscount * 1.5; 
      const minDiscountPct = commPct; 
      
      const ratio = (m - 1) / (months - 1 || 1);
      const currentDiscountPct = maxDiscountPct - (maxDiscountPct - minDiscountPct) * Math.pow(ratio, 1.5);
      
      const currentDiscount = amount * (currentDiscountPct / 100);
      const currentCommission = commission;
      const currentDividendPool = Math.max(0, currentDiscount - currentCommission);
      const dividendPerMember = currentDividendPool / months;
      
      const standardInstallment = amount / months;
      const netInstallment = standardInstallment - dividendPerMember;
      const prizedPayout = amount - currentDiscount;
      
      totalPaid += netInstallment;
      
      schedule.push({
        month: m,
        netInstallment: Math.round(netInstallment),
        prizedPayout: Math.round(prizedPayout),
        dividendEarned: Math.round(dividendPerMember),
        discountPct: Math.round(currentDiscountPct),
        cumulativePaid: Math.round(totalPaid)
      });
    }
    
    const totalDividendsEarned = schedule.reduce((sum, item) => sum + item.dividendEarned, 0);
    const netReturn = amount - totalPaid;
    const returnRatePct = (netReturn / totalPaid) * 100;
    
    return {
      schedule,
      totalPaid: Math.round(totalPaid),
      totalDividendsEarned: Math.round(totalDividendsEarned),
      netReturn: Math.round(netReturn),
      returnRatePct: Number(returnRatePct.toFixed(2)),
      avgInstallment: Math.round(totalPaid / months),
      commissionTotal: commission * months
    };
  }, [simChitAmount, simMonths, simCommission, simAvgDiscount]);

  // --- RENDER RECENT TRANSACTIONS ---
  const recentActivities = useMemo(() => {
    const list: { id: string; type: 'auction' | 'payment'; title: string; date: string; amount: number; desc: string }[] = [];
    
    auctions.forEach(a => {
      const k = kuries.find(kuri => kuri.id === a.kuriId);
      const sub = subscribers.find(s => s.id === a.winningSubscriberId);
      if (k && sub) {
        list.push({
          id: `act-a-${a.id}`,
          type: 'auction',
          title: `Auction Won by ${sub.name}`,
          date: a.date,
          amount: Number(a.winningBid),
          desc: `${k.name} • Month ${a.month} Pool`
        });
      }
    });

    payments.filter(p => p.status === 'paid').forEach(p => {
      const k = kuries.find(kuri => kuri.id === p.kuriId);
      const sub = subscribers.find(s => s.id === p.subscriberId);
      if (k && sub) {
        list.push({
          id: `act-p-${p.id}`,
          type: 'payment',
          title: `Payment from ${sub.name}`,
          date: p.date,
          amount: Number(p.amount),
          desc: `${k.name} • Month ${p.month} Contribution`
        });
      }
    });

    return list.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  }, [auctions, payments, kuries, subscribers]);

  // --- RENDER CUSTOM SVG GRAPH ---
  const cashFlowChartData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYearMonths = [1, 2, 3, 4, 5, 6, 7]; 
    
    return currentYearMonths.map((mNum, idx) => {
      const expected = payments
        .filter(p => p.month === mNum)
        .reduce((sum, p) => sum + Number(p.amount), 0) || (200000 - idx * 15000); 
      
      const collected = payments
        .filter(p => p.month === mNum && p.status === 'paid')
        .reduce((sum, p) => sum + Number(p.amount), 0) || (idx === 4 ? expected * 0.7 : idx > 4 ? 0 : expected); 
      
      return {
        label: monthNames[mNum - 1],
        expected: Math.round(expected),
        collected: Math.round(collected)
      };
    });
  }, [payments]);

  const chartHeight = 160;
  const chartWidth = 500;
  const maxVal = Math.max(...cashFlowChartData.map(d => d.expected), 100000) * 1.1;

  // --- SEARCH FILTERED SUBSCRIBERS ---
  const filteredSubscribersList = useMemo(() => {
    if (!subSearchQuery) return subscribers;
    return subscribers.filter(s => 
      s.name.toLowerCase().includes(subSearchQuery.toLowerCase()) || 
      s.email.toLowerCase().includes(subSearchQuery.toLowerCase()) ||
      s.phone.includes(subSearchQuery)
    );
  }, [subscribers, subSearchQuery]);

  // --- LEDGER MATRIX COMPUTATION ---
  const ledgerData = useMemo(() => {
    if (!selectedKuri) return { months: [], rows: [] };
    
    const months = Array.from({ length: selectedKuri.durationMonths }, (_, i) => i + 1);
    
    const rows = selectedKuri.subscribers.map(ks => {
      const sub = subscribers.find(s => s.id === ks.subscriberId);
      
      const monthlyPaymentsMap: { [key: number]: Payment } = {};
      payments
        .filter(p => p.kuriId === selectedKuri.id && p.subscriberId === ks.subscriberId)
        .forEach(p => {
          monthlyPaymentsMap[p.month] = p;
        });

      return {
        subscriberId: ks.subscriberId,
        name: sub?.name || 'Unknown',
        ticketNumber: ks.ticketNumber,
        isPrized: ks.isPrized,
        prizedMonth: ks.prizedMonth,
        paymentsMap: monthlyPaymentsMap
      };
    }).sort((a, b) => a.ticketNumber - b.ticketNumber);

    return { months, rows };
  }, [selectedKuri, subscribers, payments]);

  const prizedCandidates = useMemo(() => {
    if (!selectedKuri) return [];
    return selectedKuri.subscribers
      .filter(ks => !ks.isPrized)
      .map(ks => {
        const sub = subscribers.find(s => s.id === ks.subscriberId);
        return {
          id: ks.subscriberId,
          name: sub?.name || 'Unknown',
          ticketNumber: ks.ticketNumber
        };
      });
  }, [selectedKuri, subscribers]);

  const openAuctionModal = () => {
    if (!selectedKuri) return;
    const commission = (Number(selectedKuri.totalValue) * Number(selectedKuri.foremanCommissionPercent)) / 100;
    setAuctionWinningBid(Number(selectedKuri.totalValue) - commission - 10000);
    if (prizedCandidates.length > 0) {
      setAuctionWinningSubId(prizedCandidates[0].id);
    }
    setIsAuctionModalOpen(true);
  };

  // --- SESSION CHECKING SCREEN ---
  if (isAuthChecking) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <div className="h-10 w-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-sm text-zinc-400 font-semibold tracking-wide">Syncing KuriFlow Authenticator...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col pb-16">
      
      {/* AUTHENTICATION OVERLAY MODAL */}
      {showAuthOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-lg">
          <div className="w-full max-w-md rounded-2xl glass-panel p-8 space-y-6 relative border border-white/10 glow-indigo">
            
            <div className="text-center space-y-2">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-400 p-[1px] flex items-center justify-center mx-auto glow-indigo animate-float">
                <div className="h-full w-full rounded-[15px] bg-zinc-950 flex items-center justify-center">
                  <Layers className="h-6 w-6 text-indigo-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent mt-3">
                Welcome to KuriFlow
              </h2>
              <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Neon Cloud Chitty Management</p>
            </div>

            {/* Tabs selection */}
            <div className="flex bg-zinc-900/60 p-1 rounded-xl border border-zinc-800/80">
              <button
                type="button"
                onClick={() => { setAuthTab('login'); setAuthError(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  authTab === 'login' 
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthTab('signup'); setAuthError(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  authTab === 'signup' 
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5 text-xs text-rose-400">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{authError}</span>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authTab === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-600" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Pillai"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-600" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. ramesh@gmail.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-zinc-600" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2"
              >
                {authLoading ? (
                  <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : authTab === 'login' ? (
                  <>
                    <LogIn className="h-4 w-4" /> Sign In securely
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" /> Initialize Account
                  </>
                )}
              </button>
            </form>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-zinc-800/80"></div>
              <span className="flex-shrink mx-4 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Or</span>
              <div className="flex-grow border-t border-zinc-800/80"></div>
            </div>

            {/* Skip Auth Option */}
            <button
              onClick={handleSkipAuth}
              className="w-full py-2 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 font-semibold text-xs rounded-xl border border-zinc-800/80 transition-colors"
            >
              Skip Cloud Sync (Try Offline Demo Mode)
            </button>
          </div>
        </div>
      )}

      {/* STICKY HEADER */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/5 py-4 px-6 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-400 p-[1px] flex items-center justify-center glow-indigo">
              <div className="h-full w-full rounded-[11px] bg-zinc-950 flex items-center justify-center">
                <Layers className="h-5 w-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                  KuriFlow
                </span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  PRO
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-medium">Neon PostgreSQL Managed Chit Fund Tracker</p>
            </div>
          </div>

          {/* Sync & User Indicators */}
          <div className="flex items-center flex-wrap gap-4 text-xs">
            {/* Sync Badge */}
            {syncStatus === 'synced' && (
              <div className="flex items-center gap-1.5 bg-emerald-500/5 px-3 py-1.5 rounded-lg border border-emerald-500/15 text-emerald-400 font-semibold" title={`Last synced to Neon AWS DB: ${lastSynced}`}>
                <Cloud className="h-3.5 w-3.5" />
                <span>Neon Synced</span>
              </div>
            )}
            {syncStatus === 'syncing' && (
              <div className="flex items-center gap-1.5 bg-indigo-500/5 px-3 py-1.5 rounded-lg border border-indigo-500/15 text-indigo-400 font-semibold animate-pulse">
                <div className="h-3 w-3 border-2 border-indigo-400/20 border-t-indigo-400 rounded-full animate-spin"></div>
                <span>Syncing Cloud...</span>
              </div>
            )}
            {syncStatus === 'error' && (
              <div className="flex items-center gap-1.5 bg-rose-500/5 px-3 py-1.5 rounded-lg border border-rose-500/15 text-rose-400 font-semibold animate-pulse">
                <CloudLightning className="h-3.5 w-3.5" />
                <span>Sync Error</span>
              </div>
            )}
            {syncStatus === 'local' && (
              <div 
                onClick={() => setShowAuthOverlay(true)}
                className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 cursor-pointer px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-400 font-semibold"
                title="Your data is saved locally. Click to Sign Up / Log In for Neon Cloud Sync."
              >
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                <span>Offline Demo</span>
              </div>
            )}

            {/* Profile Sign-out */}
            {user ? (
              <div className="flex items-center gap-3 bg-zinc-900/60 pl-3 pr-1 py-1 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="text-zinc-300 font-bold">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                  title="Sign out securely"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setAuthTab('login'); setShowAuthOverlay(true); }}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <LogIn className="h-3.5 w-3.5" /> Connect Cloud
              </button>
            )}
          </div>
        </div>
      </header>

      {/* DASHBOARD CONTAINER */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 mt-6 flex-1 flex flex-col lg:flex-row gap-6">
        
        {/* SIDEBAR TABS */}
        <nav className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-60 shrink-0 border-b lg:border-b-0 lg:border-r border-zinc-800/80 pr-0 lg:pr-6">
          <button
            onClick={() => { setActiveTab('dashboard'); setSelectedKuriId(null); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 shrink-0 ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/10 glow-indigo'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
            }`}
          >
            <Layers className="h-4.5 w-4.5" />
            Overview Dashboard
          </button>
          
          <button
            onClick={() => { setActiveTab('kuries'); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 shrink-0 ${
              activeTab === 'kuries'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/10 glow-indigo'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
            }`}
          >
            <Building className="h-4.5 w-4.5" />
            Active Kuries ({kuries.length})
          </button>

          <button
            onClick={() => { setActiveTab('subscribers'); setSelectedKuriId(null); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 shrink-0 ${
              activeTab === 'subscribers'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/10 glow-indigo'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
            }`}
          >
            <Users className="h-4.5 w-4.5" />
            Subscribers Pool
          </button>

          <button
            onClick={() => { setActiveTab('calculator'); setSelectedKuriId(null); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 shrink-0 ${
              activeTab === 'calculator'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/10 glow-indigo'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
            }`}
          >
            <Calculator className="h-4.5 w-4.5" />
            ROI Chitty Simulator
          </button>

          {/* Quick Stats Sidebar Panel */}
          <div className="hidden lg:block mt-8 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-semibold text-zinc-300">Quick Simulation</span>
            </div>
            <p className="text-xs text-zinc-500 leading-normal mb-3">
              Simulate investment yields and compound dividend returns in real-time with our custom planner.
            </p>
            <button
              onClick={() => setActiveTab('calculator')}
              className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-lg border border-zinc-700 transition-colors"
            >
              Open Simulator
            </button>
          </div>
        </nav>

        {/* MAIN PANEL CONTENT */}
        <div className="flex-1 min-w-0">
          
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Top Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-indigo-950/20 border border-zinc-800 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                      Welcome to KuriFlow
                      <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
                    </h2>
                    <p className="text-zinc-400 text-sm mt-1 max-w-xl">
                      Organize members, schedule auctions, distribute dividends automatically, and monitor collections instantly in one premium glass dashboard.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => setIsKuriModalOpen(true)}
                      className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-indigo-600/15 flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" /> Create Kuri Scheme
                    </button>
                    <button
                      onClick={() => setIsSubscriberModalOpen(true)}
                      className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-sm rounded-xl border border-zinc-700 transition-colors flex items-center gap-2"
                    >
                      <UserPlus className="h-4 w-4" /> Add Subscriber
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats Counters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Stat 1 */}
                <div className="p-5 rounded-2xl glass-card relative overflow-hidden group">
                  <div className="absolute top-3 right-3 text-indigo-400/20 group-hover:text-indigo-400/30 transition-colors">
                    <Building className="h-8 w-8" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Value Managed</span>
                  <h3 className="text-2xl font-bold text-white mt-1.5 tracking-tight">
                    ₹{dashboardStats.totalFUM.toLocaleString('en-IN')}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[10px] font-semibold text-indigo-400 px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/10">
                      {dashboardStats.activeKuriesCount} Schemes
                    </span>
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="p-5 rounded-2xl glass-card relative overflow-hidden group">
                  <div className="absolute top-3 right-3 text-emerald-400/20 group-hover:text-emerald-400/30 transition-colors">
                    <TrendingUp className="h-8 w-8" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Dividends Distributed</span>
                  <h3 className="text-2xl font-bold text-emerald-400 mt-1.5 tracking-tight">
                    ₹{dashboardStats.totalDividends.toLocaleString('en-IN')}
                  </h3>
                  <div className="flex items-center gap-1 mt-2 text-xs text-zinc-400">
                    <span className="text-emerald-400 font-medium">✨ Sub-yield optimized</span>
                  </div>
                </div>

                {/* Stat 3 */}
                <div className="p-5 rounded-2xl glass-card relative overflow-hidden group">
                  <div className="absolute top-3 right-3 text-amber-500/20 group-hover:text-amber-500/30 transition-colors">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Foreman Gross Profit</span>
                  <h3 className="text-2xl font-bold text-white mt-1.5 tracking-tight">
                    ₹{dashboardStats.totalForemanCommission.toLocaleString('en-IN')}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-zinc-500">
                    <span>From {auctions.length} recorded auctions</span>
                  </div>
                </div>

                {/* Stat 4 */}
                <div className="p-5 rounded-2xl glass-card relative overflow-hidden group">
                  <div className="absolute top-3 right-3 text-sky-400/20 group-hover:text-sky-400/30 transition-colors">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Month Collection Rate</span>
                  <h3 className="text-2xl font-bold text-sky-400 mt-1.5 tracking-tight">
                    {dashboardStats.collectionRate}%
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-full bg-zinc-800 rounded-full h-1.5">
                      <div className="bg-sky-400 h-1.5 rounded-full" style={{ width: `${dashboardStats.collectionRate}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Dashboard Panel Split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Block: Analytics Chart */}
                <div className="lg:col-span-2 p-6 rounded-2xl glass-panel space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                        Installment Inflow Analysis
                        <span title="Comparison of expected collections vs actually collected payments across monthly installments.">
                          <Info className="h-4 w-4 text-zinc-500 cursor-help" />
                        </span>
                      </h3>
                      <p className="text-xs text-zinc-400">Total cash inflows for the months of 2026</p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs font-medium">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                        <span className="text-zinc-300">Expected</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                        <span className="text-zinc-300">Collected</span>
                      </div>
                    </div>
                  </div>

                  {/* CUSTOM SVG GRAPH */}
                  <div className="w-full overflow-hidden flex items-center justify-center bg-zinc-950/40 rounded-xl p-4 border border-zinc-800/80">
                    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto text-xs">
                      {/* Grid Lines */}
                      <line x1="40" y1="20" x2={chartWidth - 20} y2="20" stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
                      <line x1="40" y1="60" x2={chartWidth - 20} y2="60" stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
                      <line x1="40" y1="100" x2={chartWidth - 20} y2="100" stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
                      <line x1="40" y1="130" x2={chartWidth - 20} y2="130" stroke="rgba(255,255,255,0.08)" />

                      {/* Render data pillars */}
                      {cashFlowChartData.map((d, i) => {
                        const step = (chartWidth - 80) / (cashFlowChartData.length - 1 || 1);
                        const x = 50 + i * step;
                        const expY = 130 - (d.expected / maxVal) * 100;
                        const colY = 130 - (d.collected / maxVal) * 100;

                        return (
                          <g key={i} className="group">
                            {/* Expected Pillar (indigo) */}
                            <rect 
                              x={x - 6} 
                              y={expY} 
                              width="5" 
                              height={130 - expY} 
                              fill="rgba(99, 102, 241, 0.45)" 
                              rx="1.5"
                              className="transition-all duration-300 hover:fill-indigo-500" 
                            />
                            {/* Collected Pillar (emerald) */}
                            <rect 
                              x={x} 
                              y={colY} 
                              width="5" 
                              height={130 - colY} 
                              fill={d.collected === d.expected ? "rgba(16, 185, 129, 0.75)" : "rgba(16, 185, 129, 0.45)"}
                              rx="1.5"
                              className="transition-all duration-300 hover:fill-emerald-400" 
                            />
                            {/* Month Label */}
                            <text x={x - 4} y="148" fill="#71717a" fontSize="9" fontWeight="600" textAnchor="middle">
                              {d.label}
                            </text>
                            
                            <title>{`Month ${i+1}: Expected: ₹${d.expected.toLocaleString('en-IN')}, Collected: ₹${d.collected.toLocaleString('en-IN')}`}</title>
                          </g>
                        );
                      })}

                      <text x="35" y="25" fill="#71717a" fontSize="8" textAnchor="end">Max</text>
                      <text x="35" y="75" fill="#71717a" fontSize="8" textAnchor="end">Mid</text>
                      <text x="35" y="133" fill="#71717a" fontSize="8" textAnchor="end">0</text>
                    </svg>
                  </div>
                </div>

                {/* Right Block: Schemes Status */}
                <div className="p-6 rounded-2xl glass-panel space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                      <Clock className="h-4.5 w-4.5 text-indigo-400" />
                      Active Schemes Status
                    </h3>
                    <p className="text-xs text-zinc-400">Month milestones of active schemes</p>
                  </div>

                  <div className="space-y-3 mt-4 flex-1">
                    {kuries.slice(0, 3).map(k => {
                      const completedPct = Math.round((Number(k.currentMonth) / Number(k.durationMonths)) * 100);
                      const prizeCount = k.subscribers.filter(s => s.isPrized).length;
                      
                      return (
                        <div 
                          key={k.id} 
                          onClick={() => { setSelectedKuriId(k.id); setActiveTab('kuries'); }}
                          className="p-3.5 rounded-xl bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-800 transition-all cursor-pointer flex flex-col gap-2 group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-zinc-300 group-hover:text-indigo-400 transition-colors">
                              {k.name}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-bold">
                              {k.currentMonth}/{k.durationMonths} Months
                            </span>
                          </div>
                          
                          <div className="w-full bg-zinc-950 rounded-full h-1.5">
                            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${completedPct}%` }}></div>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-zinc-500 font-medium">
                            <span>{prizeCount} prized subscribers</span>
                            <span>{k.subscribers.length - prizeCount} remaining</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Block: Recent Transactions */}
              <div className="p-6 rounded-2xl glass-panel space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <History className="h-4.5 w-4.5 text-indigo-400" />
                    Recent Live Activity Ledger
                  </h3>
                  <p className="text-xs text-zinc-400">Latest recorded auctions and payments in the system</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-500 font-bold">
                        <th className="pb-3 pl-2">Event Type</th>
                        <th className="pb-3">Details</th>
                        <th className="pb-3">Transaction Date</th>
                        <th className="pb-3 text-right pr-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900 text-sm">
                      {recentActivities.map((act) => (
                        <tr key={act.id} className="hover:bg-zinc-900/20 transition-colors">
                          <td className="py-3 pl-2">
                            {act.type === 'auction' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                                Auction Prized
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
                                Subscription Contribution
                              </span>
                            )}
                          </td>
                          <td className="py-3 font-semibold text-zinc-200">
                            {act.title}
                            <span className="block text-[11px] font-normal text-zinc-500">{act.desc}</span>
                          </td>
                          <td className="py-3 text-zinc-400 font-medium">
                            {act.date ? new Date(act.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending'}
                          </td>
                          <td className="py-3 text-right pr-2 font-mono font-bold text-white">
                            ₹{act.amount.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                      {recentActivities.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-zinc-500">
                            No activities logged yet. Get started by executing an auction in your active Kuries!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: ACTIVE KURIES LIST */}
          {activeTab === 'kuries' && (
            <div className="space-y-6">
              
              {!selectedKuri ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white tracking-tight">Active Kuri Schemes</h2>
                      <p className="text-xs text-zinc-400 mt-0.5">Manage details, auctions, and members of active chit funds</p>
                    </div>
                    <button
                      onClick={() => setIsKuriModalOpen(true)}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-indigo-600/10 flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" /> Start New Scheme
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {kuries.map(k => {
                      const prizedCount = k.subscribers.filter(s => s.isPrized).length;
                      const progressPct = Math.round((Number(k.currentMonth) / Number(k.durationMonths)) * 100);
                      
                      return (
                        <div key={k.id} className="rounded-2xl glass-card p-5 flex flex-col justify-between h-[230px]">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                Month {k.currentMonth}/{k.durationMonths}
                              </span>
                              <span className="text-xs font-semibold text-zinc-500">
                                ₹{(Number(k.totalValue) / 100000).toFixed(1)}L Total Value
                              </span>
                            </div>

                            <h3 className="text-lg font-bold text-white mt-3 tracking-tight group-hover:text-indigo-400 leading-snug">
                              {k.name}
                            </h3>
                            
                            <p className="text-xs text-zinc-400 font-medium mt-2">
                              Installment: <span className="font-bold text-zinc-200">₹{Number(k.installmentAmount).toLocaleString('en-IN')} / month</span>
                            </p>
                          </div>

                          <div className="space-y-3.5 mt-4">
                            <div className="space-y-1">
                              <div className="flex justify-between text-[11px] text-zinc-500 font-bold">
                                <span>Scheme Progress</span>
                                <span>{progressPct}%</span>
                              </div>
                              <div className="w-full bg-zinc-950 rounded-full h-1.5">
                                <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${progressPct}%` }}></div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-zinc-800/80 pt-3">
                              <div className="flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5 text-zinc-500" />
                                <span className="text-xs text-zinc-400 font-semibold">{k.subscribers.length} Members</span>
                              </div>
                              
                              <button
                                onClick={() => setSelectedKuriId(k.id)}
                                className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                              >
                                Manage Ledger
                                <ChevronRight className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {kuries.length === 0 && (
                      <div className="col-span-full p-12 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/10">
                        <AlertCircle className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
                        <h4 className="font-bold text-zinc-400 text-sm">No schemes configured</h4>
                        <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                          Get started by initializing a new chit fund scheme with custom subscribers!
                        </p>
                        <button
                          onClick={() => setIsKuriModalOpen(true)}
                          className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs rounded-xl border border-zinc-700 transition-colors"
                        >
                          Create First Scheme
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                
                /* DETAILED KURI LEDGER VIEW */
                <div className="space-y-6">
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
                    <div>
                      <button
                        onClick={() => setSelectedKuriId(null)}
                        className="text-xs font-semibold text-zinc-500 hover:text-zinc-300 flex items-center gap-1.5 mb-2 transition-colors"
                      >
                        ← Back to Schemes
                      </button>
                      <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        {selectedKuri.name}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                          selectedKuri.status === 'active' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                        }`}>
                          {selectedKuri.status}
                        </span>
                      </h2>
                      <p className="text-xs text-zinc-500 font-semibold mt-1">
                        Scheme started on {new Date(selectedKuri.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {selectedKuri.status === 'active' && (
                        <button
                          onClick={openAuctionModal}
                          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-indigo-600/10 flex items-center gap-2"
                        >
                          <TrendingUp className="h-4.5 w-4.5" /> Run Month {selectedKuri.currentMonth} Auction
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteKuri(selectedKuri.id)}
                        className="p-2.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl border border-zinc-800 transition-all"
                        title="Delete Scheme"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800">
                      <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider font-mono">Chit Value</span>
                      <h4 className="text-lg font-bold text-white mt-1">₹{Number(selectedKuri.totalValue).toLocaleString('en-IN')}</h4>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800">
                      <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider font-mono">Installment Value</span>
                      <h4 className="text-lg font-bold text-white mt-1">₹{Number(selectedKuri.installmentAmount).toLocaleString('en-IN')} <span className="text-xs font-normal text-zinc-500">/mo</span></h4>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800">
                      <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider font-mono">Total Dividends</span>
                      <h4 className="text-lg font-bold text-emerald-400 mt-1">
                        ₹{auctions.filter(a => a.kuriId === selectedKuri.id).reduce((sum, a) => sum + (Number(a.discount) - Number(a.commission)), 0).toLocaleString('en-IN')}
                      </h4>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800">
                      <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider font-mono">Milestone Month</span>
                      <h4 className="text-lg font-bold text-indigo-400 mt-1">{selectedKuri.currentMonth} of {selectedKuri.durationMonths}</h4>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl glass-panel space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                        Interactive Collection Ledger Matrix
                        <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-bold uppercase">
                          Click Ledger Cell to Pay
                        </span>
                      </h3>
                      <p className="text-xs text-zinc-400">Monitor collections, trace prized subscribers and record monthly payments instantly.</p>
                    </div>

                    <div className="overflow-x-auto border border-zinc-800 rounded-xl">
                      <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                          <tr className="bg-zinc-900/80 border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-500 font-bold">
                            <th className="py-3 px-4 sticky left-0 bg-zinc-900/90 z-10">Ticket & Subscriber</th>
                            <th className="py-3 px-4">Prize Won</th>
                            {ledgerData.months.map(m => (
                              <th key={m} className="py-3 px-4 text-center">Month {m}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900 text-sm">
                          {ledgerData.rows.map((row) => (
                            <tr key={row.subscriberId} className="hover:bg-zinc-900/30 transition-colors">
                              <td className="py-3 px-4 font-semibold text-zinc-200 sticky left-0 bg-zinc-950/90 border-r border-zinc-900 z-10">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                                    #{row.ticketNumber}
                                  </span>
                                  {row.name}
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                {row.isPrized ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                                    Month {row.prizedMonth} Winning
                                  </span>
                                ) : (
                                  <span className="text-xs text-zinc-600 font-medium">Non-Prized</span>
                                )}
                              </td>

                              {ledgerData.months.map(m => {
                                const pay = row.paymentsMap[m];
                                if (!pay) {
                                  return (
                                    <td key={m} className="py-3 px-4 text-center text-xs text-zinc-700">
                                      -
                                    </td>
                                  );
                                }

                                const isPaid = pay.status === 'paid';
                                return (
                                  <td 
                                    key={m} 
                                    onClick={() => togglePaymentStatus(pay.id)}
                                    className="py-3 px-4 text-center cursor-pointer select-none transition-all group"
                                  >
                                    <div className={`mx-auto w-24 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                                      isPaid 
                                        ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20 shadow-sm shadow-emerald-500/5' 
                                        : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:border-indigo-500 hover:text-indigo-400'
                                    }`}>
                                      {isPaid ? (
                                        <>
                                          <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                                          Paid
                                        </>
                                      ) : (
                                        <>
                                          <Clock className="h-3.5 w-3.5 text-zinc-500 group-hover:text-indigo-400" />
                                          Pay ₹{Math.round(pay.amount / 1000)}k
                                        </>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Log of Auctions */}
                    <div className="p-6 rounded-2xl glass-panel space-y-4">
                      <div>
                        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                          <History className="h-4.5 w-4.5 text-indigo-400" />
                          Historical Auction Logs
                        </h3>
                        <p className="text-xs text-zinc-400">Auction discounts, commission deductions, and monthly dividends</p>
                      </div>

                      <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-2">
                        {auctions.filter(a => a.kuriId === selectedKuri.id).map(a => {
                          const winner = subscribers.find(s => s.id === a.winningSubscriberId);
                          
                          return (
                            <div key={a.id} className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex items-center justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded animate-float">
                                    Month {a.month}
                                  </span>
                                  <span className="text-sm font-bold text-zinc-200">
                                    {winner?.name || 'Unknown'}
                                  </span>
                                </div>
                                <p className="text-xs text-zinc-400 mt-1 font-medium font-mono">
                                  Dividend per member: <span className="text-emerald-400 font-bold">₹{Number(a.dividendPerMember).toLocaleString('en-IN')}</span>
                                </p>
                              </div>

                              <div className="text-right">
                                <span className="text-xs text-zinc-500 font-semibold block">Prized Payout</span>
                                <span className="text-sm font-extrabold text-white font-mono">
                                  ₹{Number(a.winningBid).toLocaleString('en-IN')}
                                </span>
                              </div>
                            </div>
                          );
                        })}

                        {auctions.filter(a => a.kuriId === selectedKuri.id).length === 0 && (
                          <div className="py-8 text-center text-zinc-500 text-xs">
                            No auctions have been conducted yet. Mark the first month's prized subscriber above.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Subscriber registry in active Kuri */}
                    <div className="p-6 rounded-2xl glass-panel space-y-4">
                      <div>
                        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                          <Users className="h-4.5 w-4.5 text-indigo-400" />
                          Enrolled Subscriber Registry
                        </h3>
                        <p className="text-xs text-zinc-400">List of subscribers participating in this active scheme</p>
                      </div>

                      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-2">
                        {selectedKuri.subscribers.map(ks => {
                          const sub = subscribers.find(s => s.id === ks.subscriberId);
                          if (!sub) return null;
                          
                          return (
                            <div key={ks.subscriberId} className="p-3.5 rounded-xl bg-zinc-900/30 border border-zinc-800/80 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 text-xs font-bold font-mono">
                                  #{ks.ticketNumber}
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-white">{sub.name}</h4>
                                  <span className="text-[10.5px] text-zinc-500 font-medium flex items-center gap-2">
                                    <Phone className="h-3 w-3" /> {sub.phone}
                                  </span>
                                </div>
                              </div>

                              <div>
                                {ks.isPrized ? (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    Prized (M{ks.prizedMonth})
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                    Active Subscriber
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                </div>
              )}

            </div>
          )}

          {/* TAB 3: GLOBAL SUBSCRIBERS POOL */}
          {activeTab === 'subscribers' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Subscribers registry pool</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Manage global contact lists and trace participating schemes</p>
                </div>
                
                <button
                  onClick={() => setIsSubscriberModalOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-indigo-600/10 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" /> Register New Subscriber
                </button>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    value={subSearchQuery}
                    onChange={(e) => setSubSearchQuery(e.target.value)}
                    placeholder="Search by name, phone, email..."
                    className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSubscribersList.map(sub => {
                  const enrolledSchemes = kuries.filter(k => 
                    k.subscribers.some(ks => ks.subscriberId === sub.id)
                  );
                  
                  const prizedCount = enrolledSchemes.filter(k => 
                    k.subscribers.find(ks => ks.subscriberId === sub.id)?.isPrized
                  ).length;

                  return (
                    <div key={sub.id} className="rounded-2xl glass-card p-5 flex flex-col justify-between h-[210px] relative group">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 flex items-center justify-center font-bold font-mono">
                            {sub.name.charAt(0)}
                          </div>
                          
                          <button
                            onClick={() => handleDeleteSubscriber(sub.id)}
                            className="p-1.5 text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete Subscriber"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <h3 className="text-base font-bold text-white mt-3.5 tracking-tight font-sans">
                          {sub.name}
                        </h3>

                        <div className="mt-2 space-y-1 text-xs text-zinc-500 font-medium font-mono">
                          <span className="flex items-center gap-1.5">
                            <Phone className="h-3 w-3" /> {sub.phone}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Mail className="h-3 w-3" /> {sub.email}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-zinc-800/80 pt-3.5 mt-4">
                        <div className="text-[11px] text-zinc-400">
                          Enrolled: <span className="font-bold text-white">{enrolledSchemes.length} Schemes</span>
                        </div>

                        <div className="text-[11px] text-zinc-500 font-bold font-mono">
                          {prizedCount} Prized Bids
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredSubscribersList.length === 0 && (
                  <div className="col-span-full p-12 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/10">
                    <AlertCircle className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
                    <h4 className="font-bold text-zinc-400 text-sm">No subscribers found</h4>
                    <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                      Create new subscriber records to enroll them in active schemes.
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 4: CHIT FUND CALCULATOR / INVESTMENT SIMULATOR */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">ROI Chit Fund Simulator</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Model compound chitty auctions, estimate net dividend returns and compute IRR yields</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="p-6 rounded-2xl glass-panel space-y-5">
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                    <Calculator className="h-4.5 w-4.5 text-indigo-400" />
                    Simulation Parameters
                  </h3>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-zinc-400">
                      <label>Chit Value Pool</label>
                      <span className="text-white">₹{Number(simChitAmount).toLocaleString('en-IN')}</span>
                    </div>
                    <input
                      type="range"
                      min="50000"
                      max="2000000"
                      step="50000"
                      value={simChitAmount}
                      onChange={(e) => setSimChitAmount(Number(e.target.value))}
                      className="w-full accent-indigo-500 bg-zinc-850 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-zinc-400 font-mono">
                      <label>Duration (Months/Members)</label>
                      <span className="text-white">{simMonths} Months</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      step="5"
                      value={simMonths}
                      onChange={(e) => setSimMonths(Number(e.target.value))}
                      className="w-full accent-indigo-500 bg-zinc-850 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-zinc-400 font-mono">
                      <label>Foreman Commission</label>
                      <span className="text-white">{simCommission}%</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="10"
                      step="1"
                      value={simCommission}
                      onChange={(e) => setSimCommission(Number(e.target.value))}
                      className="w-full accent-indigo-500 bg-zinc-850 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-zinc-400 font-mono">
                      <label>Expected Average Bid Discount</label>
                      <span className="text-white">{simAvgDiscount}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="40"
                      step="2"
                      value={simAvgDiscount}
                      onChange={(e) => setSimAvgDiscount(Number(e.target.value))}
                      className="w-full accent-indigo-500 bg-zinc-850 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="pt-3 border-t border-zinc-800/80 text-[11px] text-zinc-500 leading-normal flex items-start gap-2">
                    <Info className="h-4 w-4 text-zinc-400 shrink-0" />
                    <span>
                      Estimates are calculated using standard Indian chitty formulas. Bidding discounts are modeled to decrease dynamically month-over-month.
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block font-mono">Estimated Total Investment</span>
                      <h4 className="text-lg font-bold text-white mt-1">₹{simulationSchedule.totalPaid.toLocaleString('en-IN')}</h4>
                      <span className="text-[10px] text-zinc-500 font-semibold block mt-0.5">Base: ₹{simChitAmount.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block font-mono">Total Dividends Earned</span>
                      <h4 className="text-lg font-bold text-emerald-400 mt-1 font-mono">₹{simulationSchedule.totalDividendsEarned.toLocaleString('en-IN')}</h4>
                      <span className="text-[10px] text-zinc-500 font-semibold block mt-0.5">Average: ₹{simulationSchedule.avgInstallment.toLocaleString('en-IN')}/mo</span>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block font-mono">Net Yield ROI</span>
                      <h4 className="text-lg font-bold text-indigo-400 mt-1 font-mono">+{simulationSchedule.returnRatePct}%</h4>
                      <span className="text-[10px] text-zinc-500 font-semibold block mt-0.5">Profit: ₹{simulationSchedule.netReturn.toLocaleString('en-IN')}</span>
                    </div>

                  </div>

                  <div className="p-6 rounded-2xl glass-panel space-y-4">
                    <h3 className="text-sm font-bold text-white tracking-tight">Month-by-Month Projected Schedule</h3>
                    
                    <div className="overflow-x-auto max-h-[300px] overflow-y-auto border border-zinc-800 rounded-xl pr-1">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-zinc-900/80 border-b border-zinc-800 text-[10px] uppercase font-bold text-zinc-500">
                            <th className="py-2.5 px-4 text-center">Month</th>
                            <th className="py-2.5 px-4 text-center">Discount Bid</th>
                            <th className="py-2.5 px-4 text-right">Dividend Earned</th>
                            <th className="py-2.5 px-4 text-right">Net Payable</th>
                            <th className="py-2.5 px-4 text-right">Prized Payout Option</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900 font-medium text-zinc-300 font-mono">
                          {simulationSchedule.schedule.map((row) => (
                            <tr key={row.month} className="hover:bg-zinc-900/20 transition-colors">
                              <td className="py-2.5 px-4 text-center text-zinc-400 font-bold">Month {row.month}</td>
                              <td className="py-2.5 px-4 text-center font-semibold text-zinc-400">{row.discountPct}%</td>
                              <td className="py-2.5 px-4 text-right text-emerald-400">+₹{row.dividendEarned.toLocaleString('en-IN')}</td>
                              <td className="py-2.5 px-4 text-right text-white">₹{row.netInstallment.toLocaleString('en-IN')}</td>
                              <td className="py-2.5 px-4 text-right font-bold text-indigo-400">₹{row.prizedPayout.toLocaleString('en-IN')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

        </div>
      </main>

      {/* --- MODAL 1: CREATE KURI SCHEME --- */}
      {isKuriModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-2xl glass-panel p-6 space-y-6 relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsKuriModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                Initialize New Kuri Scheme
              </h3>
              <p className="text-xs text-zinc-400 mt-1 font-semibold">Configure installments, duration, and enroll subscribers</p>
            </div>

            <form onSubmit={handleCreateKuri} className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400">Kuri Scheme Name</label>
                  <input
                    type="text"
                    required
                    value={newKuriName}
                    onChange={(e) => setNewKuriName(e.target.value)}
                    placeholder="e.g. Royal Gold 5L"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400">Total Pool Value (₹)</label>
                  <input
                    type="number"
                    required
                    value={newKuriTotalValue}
                    onChange={(e) => setNewKuriTotalValue(Number(e.target.value))}
                    placeholder="500000"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400">Duration (Months)</label>
                  <input
                    type="number"
                    required
                    min="2"
                    max="60"
                    value={newKuriDuration}
                    onChange={(e) => setNewKuriDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400">Commission (%)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="15"
                    value={newKuriCommission}
                    onChange={(e) => setNewKuriCommission(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newKuriStartDate}
                    onChange={(e) => setNewKuriStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-zinc-400">
                    Enroll Subscribers ({selectedEnrollSubscribers.length} selected)
                  </label>
                  <span className="text-[10px] text-zinc-500 font-bold">
                    Need exactly {newKuriDuration} subscribers matching duration
                  </span>
                </div>

                <div className="border border-zinc-800 bg-zinc-950/40 rounded-xl p-3.5 max-h-[160px] overflow-y-auto space-y-2">
                  {subscribers.map((sub) => {
                    const isSelected = selectedEnrollSubscribers.includes(sub.id);
                    return (
                      <div 
                        key={sub.id}
                        onClick={() => toggleSubSelect(sub.id)}
                        className={`p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                          isSelected 
                            ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20' 
                            : 'bg-zinc-900/30 text-zinc-400 border-zinc-850 hover:bg-zinc-800/20'
                        }`}
                      >
                        <span>{sub.name}</span>
                        <span className="text-[10px] text-zinc-500 font-medium font-mono">{sub.phone}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsKuriModalOpen(false)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-semibold text-xs rounded-xl border border-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/10"
                >
                  Launch Kuri Scheme
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: REGISTER NEW SUBSCRIBER --- */}
      {isSubscriberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl glass-panel p-6 space-y-6 relative">
            
            <button
              onClick={() => setIsSubscriberModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-indigo-400" />
                Register New Subscriber
              </h3>
              <p className="text-xs text-zinc-400 mt-1">Create a subscriber card to enroll them in schemes.</p>
            </div>

            <form onSubmit={handleAddSubscriber} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">Full Name</label>
                <input
                  type="text"
                  required
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">Contact Number</label>
                <input
                  type="text"
                  value={newSubPhone}
                  onChange={(e) => setNewSubPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">Email Address</label>
                <input
                  type="email"
                  value={newSubEmail}
                  onChange={(e) => setNewSubEmail(e.target.value)}
                  placeholder="ramesh@gmail.com"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSubscriberModalOpen(false)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-semibold text-xs rounded-xl border border-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/10"
                >
                  Create Record
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: RUN AUCTION / BIDDING SESSION --- */}
      {isAuctionModalOpen && selectedKuri && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl glass-panel p-6 space-y-6 relative">
            
            <button
              onClick={() => setIsAuctionModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-400" />
                Conduct Month {selectedKuri.currentMonth} Auction
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Enter winning bid payout accepted by the prized subscriber.
              </p>
            </div>

            <form onSubmit={handleRunAuction} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">Select Prized Subscriber</label>
                <select
                  required
                  value={auctionWinningSubId}
                  onChange={(e) => setAuctionWinningSubId(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                >
                  {prizedCandidates.map(c => (
                    <option key={c.id} value={c.id}>
                      Ticket #{c.ticketNumber} - {c.name}
                    </option>
                  ))}
                  {prizedCandidates.length === 0 && (
                    <option value="">No remaining active candidates</option>
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-zinc-400">
                  <label>Prize Payout Bid (₹)</label>
                  <span>Max: ₹{(Number(selectedKuri.totalValue) - (Number(selectedKuri.totalValue) * Number(selectedKuri.foremanCommissionPercent))/100).toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="number"
                  required
                  value={auctionWinningBid}
                  onChange={(e) => setAuctionWinningBid(Number(e.target.value))}
                  placeholder="e.g. 430000"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-zinc-400">
                  <span>Chit Fund Pool:</span>
                  <span className="font-bold text-white">₹{Number(selectedKuri.totalValue).toLocaleString('en-IN')}</span>
                </div>
                
                <div className="flex justify-between text-zinc-400">
                  <span>Foreman Commission:</span>
                  <span className="font-bold text-white">₹{((Number(selectedKuri.totalValue) * Number(selectedKuri.foremanCommissionPercent)) / 100).toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between text-zinc-400">
                  <span>Total Discount offered:</span>
                  <span className="font-bold text-white">₹{(Number(selectedKuri.totalValue) - auctionWinningBid).toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between border-t border-zinc-850 pt-2 text-zinc-300 font-semibold font-sans">
                  <span>Projected Dividend / member:</span>
                  <span className="text-emerald-400 font-mono">
                    ₹{Math.max(0, Math.round(((Number(selectedKuri.totalValue) - auctionWinningBid) - (Number(selectedKuri.totalValue) * Number(selectedKuri.foremanCommissionPercent)) / 100) / selectedKuri.subscribers.length)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAuctionModalOpen(false)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-semibold text-xs rounded-xl border border-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={prizedCandidates.length === 0}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/10"
                >
                  Execute Bid Auction
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
