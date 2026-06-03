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
  User,
  ArrowLeft,
  Gift,
  Trophy
} from 'lucide-react';
import { 
  Subscriber, 
  KuriSubscriber, 
  Auction, 
  Payment, 
  Kuri,
  Reminder,
  DEFAULT_SUBSCRIBERS,
  DEFAULT_KURIES,
  DEFAULT_AUCTIONS,
  DEFAULT_PAYMENTS 
} from './mockData';

export default function Home() {
  // --- NAVIGATION STATE ---
  // landing: Ultra-minimal landing page
  // auth: Signup or Login card
  // dashboard: The actual application dashboard
  const [pageState, setPageState] = useState<'landing' | 'auth' | 'dashboard'>('landing');

  // --- STATE ---
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [kuries, setKuries] = useState<Kuri[]>([]);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  // Reminder Modal form state
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderSubId, setReminderSubId] = useState('all');
  const [reminderMessage, setReminderMessage] = useState('');
  
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
    role?: 'admin' | 'member';
    uuid?: string;
  }
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  
  // Auth Form State
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authRole, setAuthRole] = useState<'admin' | 'member'>('admin');

  // Sync State
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'synced' | 'local' | 'error'>('local');
  const [lastSynced, setLastSynced] = useState<string>('');

  // --- FORM STATES ---
  // New Kuri Form
  const [newKuriName, setNewKuriName] = useState('');
  const [newKuriTotalValue, setNewKuriTotalValue] = useState(500000);
  const [newKuriDuration, setNewKuriDuration] = useState(10);
  const [newKuriCommission, setNewKuriCommission] = useState(0);
  const [isCommissionEnabled, setIsCommissionEnabled] = useState(false);
  const [newKuriStartDate, setNewKuriStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newKuriPayday, setNewKuriPayday] = useState(10);
  const [selectedEnrollSubscribers, setSelectedEnrollSubscribers] = useState<string[]>([]);
  
  // New Subscriber Form
  const [newSubName, setNewSubName] = useState('');
  const [newSubPhone, setNewSubPhone] = useState('');
  const [newSubEmail, setNewSubEmail] = useState('');
  const [newSubMemberUuid, setNewSubMemberUuid] = useState('');

  // Unlocked member UUIDs for admin
  const [unlockedUuids, setUnlockedUuids] = useState<string[]>([]);
  const [globalUuidInput, setGlobalUuidInput] = useState('');
  const [schemeUuidInput, setSchemeUuidInput] = useState('');
  const [activeSchemeUuidInput, setActiveSchemeUuidInput] = useState('');

  // Load unlocked UUIDs on mount
  useEffect(() => {
    const stored = localStorage.getItem('kuri_unlocked_uuids');
    if (stored) {
      try {
        setUnlockedUuids(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const visibleSubscribers = useMemo(() => {
    if (user?.role === 'member') {
      return subscribers;
    }
    return subscribers.filter(sub => sub.memberUuid && unlockedUuids.includes(sub.memberUuid));
  }, [subscribers, unlockedUuids, user]);

  const activeAutoReminders = useMemo(() => {
    const list: { id: string; kuriName: string; message: string; diffDays: number }[] = [];
    const today = new Date();
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    kuries.forEach(k => {
      if (k.status !== 'active') return;
      const payday = k.payday || 10;
      const dueDate = new Date(today.getFullYear(), today.getMonth(), payday);
      const diffTime = dueDate.getTime() - todayDateOnly.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if ([10, 5, 3, 2, 1].includes(diffDays)) {
        let shouldRemind = false;
        if (user?.role === 'member') {
          const mySub = subscribers.find(s => s.memberUuid === user.uuid);
          if (mySub) {
            const isEnrolled = k.subscribers.some(ks => ks.subscriberId === mySub.id && !ks.isPrized);
            const hasPending = payments.some(p => p.kuriId === k.id && p.subscriberId === mySub.id && p.month === k.currentMonth && p.status === 'pending');
            shouldRemind = isEnrolled && hasPending;
          }
        } else {
          shouldRemind = true;
        }
        
        if (shouldRemind) {
          list.push({
            id: `auto-${k.id}-${diffDays}`,
            kuriName: k.name,
            message: `⚠️ AUTO-REMINDER: Month ${k.currentMonth} payment of ₹${k.installmentAmount.toLocaleString('en-IN')} for scheme "${k.name}" is due in ${diffDays} days (on the ${payday}th of the month)!`,
            diffDays
          });
        }
      }
    });
    return list;
  }, [kuries, payments, subscribers, user]);

  const displayedReminders = useMemo(() => {
    if (user?.role === 'member') {
      const mySub = subscribers.find(s => s.memberUuid === user.uuid);
      if (!mySub) return [];
      return reminders.filter(r => r.subscriberId === mySub.id);
    }
    return reminders;
  }, [reminders, subscribers, user]);
  
  // Run Auction Form
  const [auctionWinningBid, setAuctionWinningBid] = useState(400000); 
  const [auctionWinningSubId, setAuctionWinningSubId] = useState('');
  const [auctionMode, setAuctionMode] = useState<'bidding' | 'luckydraw'>('bidding');
  
  // Lucky Draw States
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawCandidateIndex, setDrawCandidateIndex] = useState(0);
  const [luckyDrawWinner, setLuckyDrawWinner] = useState<{ id: string; name: string; ticketNumber: number } | null>(null); 
  const [subSearchQuery, setSubSearchQuery] = useState(''); 

  // --- SESSION CHECKING ON MOUNT ---
  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        
        if (data.user) {
          setUser(data.user);
          setSyncStatus('syncing');
          setPageState('dashboard');
          
          // Pull synced state from Neon DB
          const syncRes = await fetch('/api/sync');
          const syncData = await syncRes.json();
          
          if (data.user.role === 'member') {
            setSubscribers(syncData.subscribers || []);
            setKuries(syncData.kuries || []);
            setAuctions(syncData.auctions || []);
            setPayments(syncData.payments || []);
            setReminders(syncData.reminders || []);
            setSyncStatus('synced');
            setLastSynced(new Date().toLocaleTimeString());
            setIsAuthChecking(false);
            return;
          }

          if (syncData.kuries && syncData.kuries.length > 0) {
            setSubscribers(syncData.subscribers);
            setKuries(syncData.kuries);
            setAuctions(syncData.auctions);
            setPayments(syncData.payments);
            setReminders(syncData.reminders || []);
            setSyncStatus('synced');
            setLastSynced(new Date().toLocaleTimeString());
          } else {
            // Seeding DB with default chitty data
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
          setPageState('landing');
        }
      } catch (err) {
        console.error('Session verify error:', err);
        setPageState('landing');
      } finally {
        setIsAuthChecking(false);
      }
    }
    checkSession();
  }, []);

  // --- SAVE & AUTO-SYNC ENGINE ---
  const saveState = async (
    newSubs: Subscriber[], 
    newKuries: Kuri[], 
    newAuctions: Auction[], 
    newPayments: Payment[],
    newReminders: Reminder[] = reminders
  ) => {
    // Update local state instantly
    setSubscribers(newSubs);
    setKuries(newKuries);
    setAuctions(newAuctions);
    setPayments(newPayments);
    setReminders(newReminders);

    // Save fallback to LocalStorage
    localStorage.setItem('kuri_subscribers', JSON.stringify(newSubs));
    localStorage.setItem('kuri_kuries', JSON.stringify(newKuries));
    localStorage.setItem('kuri_auctions', JSON.stringify(newAuctions));
    localStorage.setItem('kuri_payments', JSON.stringify(newPayments));
    localStorage.setItem('kuri_reminders', JSON.stringify(newReminders));

    // Auto-sync to Neon cloud DB if logged in
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
            payments: newPayments,
            reminders: newReminders
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
        const signupRes = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: authName,
            email: authEmail,
            password: authPassword,
            role: authRole
          })
        });
        
        const signupData = await signupRes.json();
        if (!signupRes.ok) {
          throw new Error(signupData.error || 'Signup failed');
        }

        // Auto-login
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
          throw new Error(loginData.error || 'Login failed after registration');
        }

        setUser(loginData.user);
        setSyncStatus('syncing');
        setPageState('dashboard');
        
        if (loginData.user.role === 'member') {
          setSubscribers([]);
          setKuries([]);
          setAuctions([]);
          setPayments([]);
          setSyncStatus('synced');
          setLastSynced(new Date().toLocaleTimeString());
        } else {
          // Seed new Neon account
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
        setSyncStatus('syncing');
        setPageState('dashboard');

        // Fetch user data from Neon DB
        const syncRes = await fetch('/api/sync');
        const syncData = await syncRes.json();
        
        if (loginData.user.role === 'member') {
          setSubscribers(syncData.subscribers || []);
          setKuries(syncData.kuries || []);
          setAuctions(syncData.auctions || []);
          setPayments(syncData.payments || []);
          setReminders(syncData.reminders || []);
        } else if (syncData.kuries && syncData.kuries.length > 0) {
          setSubscribers(syncData.subscribers);
          setKuries(syncData.kuries);
          setAuctions(syncData.auctions);
          setPayments(syncData.payments);
          setReminders(syncData.reminders || []);
        } else {
          // Empty account! Seed Neon with chitty data
          await fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subscribers: DEFAULT_SUBSCRIBERS,
              kuries: DEFAULT_KURIES,
              auctions: DEFAULT_AUCTIONS,
              payments: DEFAULT_PAYMENTS,
              reminders: []
            })
          });
          setSubscribers(DEFAULT_SUBSCRIBERS);
          setKuries(DEFAULT_KURIES);
          setAuctions(DEFAULT_AUCTIONS);
          setPayments(DEFAULT_PAYMENTS);
          setReminders([]);
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
        setPageState('landing');
        setSyncStatus('local');
        setSubscribers([]);
        setKuries([]);
        setAuctions([]);
        setPayments([]);
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
  };

  const handleUnlockMemberByUuid = async (uuidInput: string) => {
    try {
      const response = await fetch(`/api/auth/member-by-uuid?uuid=${uuidInput.trim()}`);
      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Invalid Member UUID');
        return false;
      }
      const data = await response.json();
      const member = data.member; // { name, email, uuid }
      
      let updatedUnlocked = [...unlockedUuids];
      if (!unlockedUuids.includes(member.uuid)) {
        updatedUnlocked.push(member.uuid);
        setUnlockedUuids(updatedUnlocked);
        localStorage.setItem('kuri_unlocked_uuids', JSON.stringify(updatedUnlocked));
      }

      // Check if subscriber already exists with this uuid
      const existingSub = subscribers.find(s => s.memberUuid === member.uuid);
      if (!existingSub) {
        const newSub: Subscriber = {
          id: `sub-${Date.now()}`,
          name: member.name,
          phone: '+91 99999 00000',
          email: member.email,
          memberUuid: member.uuid
        };
        const updatedSubs = [...subscribers, newSub];
        saveState(updatedSubs, kuries, auctions, payments);
        alert(`Successfully unlocked and registered member: ${member.name}`);
      } else {
        alert(`Unlocked member: ${member.name}`);
      }
      return true;
    } catch (err) {
      console.error(err);
      alert('Error verifying UUID');
      return false;
    }
  };

  const handleUnlockAndEnrollInScheme = async (uuidVal: string) => {
    if (!uuidVal.trim()) return;
    try {
      const response = await fetch(`/api/auth/member-by-uuid?uuid=${uuidVal.trim()}`);
      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Invalid Member UUID');
        return;
      }
      const data = await response.json();
      const member = data.member;

      let updatedUnlocked = [...unlockedUuids];
      if (!unlockedUuids.includes(member.uuid)) {
        updatedUnlocked.push(member.uuid);
        setUnlockedUuids(updatedUnlocked);
        localStorage.setItem('kuri_unlocked_uuids', JSON.stringify(updatedUnlocked));
      }

      let sub = subscribers.find(s => s.memberUuid === member.uuid);
      let updatedSubs = [...subscribers];
      if (!sub) {
        sub = {
          id: `sub-${Date.now()}`,
          name: member.name,
          phone: '+91 99999 00000',
          email: member.email,
          memberUuid: member.uuid
        };
        updatedSubs.push(sub);
        saveState(updatedSubs, kuries, auctions, payments);
      }

      if (!selectedEnrollSubscribers.includes(sub.id)) {
        setSelectedEnrollSubscribers([...selectedEnrollSubscribers, sub.id]);
      }
      setSchemeUuidInput('');
      alert(`Enrolled: ${member.name}`);
    } catch (err) {
      console.error(err);
      alert('Error verifying UUID');
    }
  };

  const handleAddMemberToActiveSchemeByUuid = async (kuriId: string, uuidInput: string) => {
    if (!uuidInput.trim()) return;
    try {
      const response = await fetch(`/api/auth/member-by-uuid?uuid=${uuidInput.trim()}`);
      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Invalid Member UUID');
        return;
      }
      const data = await response.json();
      const member = data.member;

      let updatedUnlocked = [...unlockedUuids];
      if (!unlockedUuids.includes(member.uuid)) {
        updatedUnlocked.push(member.uuid);
        setUnlockedUuids(updatedUnlocked);
        localStorage.setItem('kuri_unlocked_uuids', JSON.stringify(updatedUnlocked));
      }

      let sub = subscribers.find(s => s.memberUuid === member.uuid);
      let updatedSubs = [...subscribers];
      if (!sub) {
        sub = {
          id: `sub-${Date.now()}`,
          name: member.name,
          phone: '+91 99999 00000',
          email: member.email,
          memberUuid: member.uuid
        };
        updatedSubs.push(sub);
      }

      const kuri = kuries.find(k => k.id === kuriId);
      if (!kuri) return;

      const alreadyEnrolled = kuri.subscribers.some(ks => ks.subscriberId === sub!.id);
      if (alreadyEnrolled) {
        alert('This subscriber is already enrolled in this scheme!');
        return;
      }

      const nextTicketNumber = kuri.subscribers.length + 1;
      const updatedKuriSubscribers: KuriSubscriber[] = [
        ...kuri.subscribers,
        {
          subscriberId: sub.id,
          ticketNumber: nextTicketNumber,
          isPrized: false
        }
      ];

      const newPayment: Payment = {
        id: `pay-${Date.now()}-${sub.id}`,
        kuriId: kuriId,
        subscriberId: sub.id,
        month: kuri.currentMonth,
        amount: kuri.installmentAmount,
        date: '',
        status: 'pending'
      };

      const updatedKuries = kuries.map(k => {
        if (k.id === kuriId) {
          return {
            ...k,
            subscribers: updatedKuriSubscribers
          };
        }
        return k;
      });

      const updatedPayments = [...payments, newPayment];

      saveState(updatedSubs, updatedKuries, auctions, updatedPayments);
      alert(`Successfully enrolled ${member.name} (Ticket #${nextTicketNumber}) into the scheme.`);
    } catch (err) {
      console.error(err);
      alert('Error verifying and enrolling member');
    }
  };

  // --- COMPUTED DASHBOARD METRICS ---
  const dashboardStats = useMemo(() => {
    const totalFUM = kuries.reduce((sum, k) => sum + Number(k.totalValue), 0);
    const activeKuriesCount = kuries.filter(k => k.status === 'active').length;
    const totalDividends = auctions.reduce((sum, a) => sum + Number(a.discount), 0);
    
    const totalPaymentsCount = payments.length;
    const paidPayments = payments.filter(p => p.status === 'paid');
    const totalCollected = paidPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    
    const pendingPayments = payments.filter(p => p.status === 'pending');
    const totalPending = pendingPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalForemanCommission = 0;

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
  
  // Create Subscriber directly by UUID
  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubMemberUuid.trim()) {
      alert('Please enter a Member UUID.');
      return;
    }
    try {
      const response = await fetch(`/api/auth/member-by-uuid?uuid=${newSubMemberUuid.trim()}`);
      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Invalid Member UUID');
        return;
      }
      const data = await response.json();
      const member = data.member;

      // Check if subscriber already exists
      const existingSub = subscribers.find(s => s.memberUuid === member.uuid);
      if (existingSub) {
        alert(`Member "${member.name}" is already registered as a subscriber.`);
        setIsSubscriberModalOpen(false);
        setNewSubMemberUuid('');
        return;
      }

      const newSub: Subscriber = {
        id: `sub-${Date.now()}`,
        name: member.name,
        phone: '+91 99999 00000',
        email: member.email,
        memberUuid: member.uuid
      };
      const updatedSubs = [...subscribers, newSub];

      let updatedUnlocked = [...unlockedUuids];
      if (!unlockedUuids.includes(member.uuid)) {
        updatedUnlocked.push(member.uuid);
        setUnlockedUuids(updatedUnlocked);
        localStorage.setItem('kuri_unlocked_uuids', JSON.stringify(updatedUnlocked));
      }

      saveState(updatedSubs, kuries, auctions, payments);
      setIsSubscriberModalOpen(false);
      setNewSubMemberUuid('');
      alert(`Successfully registered subscriber: ${member.name}`);
    } catch (err) {
      alert('Error verifying UUID');
    }
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
    const commissionPct = isCommissionEnabled ? Number(newKuriCommission) : 0;
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
      subscribers: enrolledKuriSubs,
      payday: Number(newKuriPayday)
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
    setNewKuriCommission(0);
    setIsCommissionEnabled(false);
    setNewKuriPayday(10);
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

    // Verify if the subscriber has already won
    const subInKuri = k.subscribers.find(sub => sub.subscriberId === auctionWinningSubId);
    if (subInKuri?.isPrized) {
      alert('This subscriber has already won and cannot win again!');
      return;
    }

    const currentM = k.currentMonth;
    const totalVal = k.totalValue;
    const bidAmount = Number(auctionWinningBid); 
    const commission = 0;
    const discount = totalVal - bidAmount;
    const totalDividends = discount;
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
    if (user?.role === 'member') {
      alert('Read-Only Mode: Only Group Admins can toggle subscriber payment collections.');
      return;
    }
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
    const k = kuries.find(x => x.id === kuriId);
    if (!k) return;
    const userInput = prompt(`WARNING: This will permanently delete the Kuri scheme "${k.name}" and all associated payment & auction history.\n\nTo confirm, please type the name of the scheme below:`);
    if (userInput !== k.name) {
      alert('Scheme name did not match. Deletion cancelled.');
      return;
    }
    const updatedKuries = kuries.filter(x => x.id !== kuriId);
    const updatedAuctions = auctions.filter(a => a.kuriId !== kuriId);
    const updatedPayments = payments.filter(p => p.kuriId !== kuriId);
    const updatedReminders = reminders.filter(r => r.kuriId !== kuriId);
    saveState(subscribers, updatedKuries, updatedAuctions, updatedPayments, updatedReminders);
    setSelectedKuriId(null);
    alert('Scheme successfully deleted.');
  };

  const handleSendReminder = (kuriId: string, subId: string, customMessage?: string) => {
    const k = kuries.find(x => x.id === kuriId);
    if (!k) return;
    const sub = subscribers.find(s => s.id === subId);
    const name = sub ? sub.name : `Subscriber ${subId}`;
    
    const currentMonth = k.currentMonth;
    const amount = k.installmentAmount;
    
    const message = customMessage || `Reminder: Please pay your installment of ₹${amount.toLocaleString('en-IN')} for Month ${currentMonth} in scheme "${k.name}". Due day: ${k.payday || 10}th of the month.`;
    
    const newReminder: Reminder = {
      id: `rem-${Date.now()}-${subId}`,
      kuriId,
      subscriberId: subId,
      month: currentMonth,
      message,
      type: 'manual',
      date: new Date().toISOString().split('T')[0],
      isRead: false
    };
    
    const updatedReminders = [...reminders, newReminder];
    saveState(subscribers, kuries, auctions, payments, updatedReminders);
    alert(`Reminder sent successfully to ${name}!`);
  };

  const handleSendReminderToAllUnpaid = (kuriId: string) => {
    const k = kuries.find(x => x.id === kuriId);
    if (!k) return;
    
    const currentMonth = k.currentMonth;
    const unpaidSubs = k.subscribers.filter(ks => {
      const pay = payments.find(p => p.kuriId === kuriId && p.subscriberId === ks.subscriberId && p.month === currentMonth);
      return pay && pay.status === 'pending';
    });
    
    if (unpaidSubs.length === 0) {
      alert('All subscribers have paid for this month!');
      return;
    }
    
    const message = prompt("Enter reminder message:", `Reminder: Please pay your installment of ₹${k.installmentAmount.toLocaleString('en-IN')} for Month ${currentMonth} in scheme "${k.name}" before the payday (${k.payday || 10}th of the month).`);
    if (message === null) return;
    
    const newRems: Reminder[] = unpaidSubs.map(ks => ({
      id: `rem-${Date.now()}-${ks.subscriberId}`,
      kuriId,
      subscriberId: ks.subscriberId,
      month: currentMonth,
      message: message || `Reminder: Please pay your installment of ₹${k.installmentAmount.toLocaleString('en-IN')} for Month ${currentMonth} in scheme "${k.name}" before the payday (${k.payday || 10}th of the month).`,
      type: 'manual',
      date: new Date().toISOString().split('T')[0],
      isRead: false
    }));
    
    const updatedReminders = [...reminders, ...newRems];
    saveState(subscribers, kuries, auctions, payments, updatedReminders);
    alert(`Reminders sent successfully to ${unpaidSubs.length} unpaid members!`);
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



  // --- RENDER RECENT TRANSACTIONS ---
  const recentActivities = useMemo(() => {
    const list: { id: string; type: 'auction' | 'payment'; title: string; date: string; amount: number; desc: string }[] = [];
    
    auctions.forEach(a => {
      const k = kuries.find(kuri => kuri.id === a.kuriId);
      const sub = visibleSubscribers.find(s => s.id === a.winningSubscriberId);
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
      const sub = visibleSubscribers.find(s => s.id === p.subscriberId);
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
    if (!subSearchQuery) return visibleSubscribers;
    return visibleSubscribers.filter(s => 
      s.name.toLowerCase().includes(subSearchQuery.toLowerCase()) || 
      s.email.toLowerCase().includes(subSearchQuery.toLowerCase()) ||
      s.phone.includes(subSearchQuery)
    );
  }, [visibleSubscribers, subSearchQuery]);

  // --- LEDGER MATRIX ---
  const ledgerData = useMemo(() => {
    if (!selectedKuri) return { months: [], rows: [] };
    
    const months = Array.from({ length: selectedKuri.durationMonths }, (_, i) => i + 1);
    
    const rows = selectedKuri.subscribers.map(ks => {
      const sub = visibleSubscribers.find(s => s.id === ks.subscriberId);
      const monthlyPaymentsMap: { [key: number]: Payment } = {};
      
      payments
        .filter(p => p.kuriId === selectedKuri.id && p.subscriberId === ks.subscriberId)
        .forEach(p => {
          monthlyPaymentsMap[p.month] = p;
        });

      return {
        subscriberId: ks.subscriberId,
        name: sub?.name || 'Hidden (Provide UUID to view)',
        ticketNumber: ks.ticketNumber,
        isPrized: ks.isPrized,
        prizedMonth: ks.prizedMonth,
        paymentsMap: monthlyPaymentsMap
      };
    }).sort((a, b) => a.ticketNumber - b.ticketNumber);

    return { months, rows };
  }, [selectedKuri, visibleSubscribers, payments]);

  const prizedCandidates = useMemo(() => {
    if (!selectedKuri) return [];
    return selectedKuri.subscribers
      .filter(ks => !ks.isPrized)
      .map(ks => {
        const sub = visibleSubscribers.find(s => s.id === ks.subscriberId);
        return {
          id: ks.subscriberId,
          name: sub?.name || `Ticket #${ks.ticketNumber} (Hidden)`,
          ticketNumber: ks.ticketNumber
        };
      });
  }, [selectedKuri, visibleSubscribers]);

  const triggerLuckyDraw = () => {
    if (!selectedKuri || prizedCandidates.length === 0) return;
    
    setIsDrawing(true);
    setLuckyDrawWinner(null);
    
    let currentIdx = 0;
    const intervalTime = 60; 
    const totalDuration = 2000; 
    const steps = totalDuration / intervalTime;
    let stepCount = 0;
    
    const interval = setInterval(() => {
      if (prizedCandidates.length === 0) {
        clearInterval(interval);
        setIsDrawing(false);
        return;
      }
      currentIdx = Math.floor(Math.random() * prizedCandidates.length);
      setDrawCandidateIndex(currentIdx);
      stepCount++;
      
      if (stepCount >= steps) {
        clearInterval(interval);
        const finalWinner = prizedCandidates[currentIdx];
        setLuckyDrawWinner(finalWinner);
        setAuctionWinningSubId(finalWinner.id);
        
        // Auto-calculate the maximum payout (No discount)
        const maxPayout = Number(selectedKuri.totalValue);
        setAuctionWinningBid(maxPayout);
        setIsDrawing(false);
      }
    }, intervalTime);
  };

  const openAuctionModal = () => {
    if (!selectedKuri) return;
    setAuctionWinningBid(Number(selectedKuri.totalValue) - 10000);
    setAuctionMode('bidding');
    setLuckyDrawWinner(null);
    if (prizedCandidates.length > 0) {
      setAuctionWinningSubId(prizedCandidates[0].id);
    }
    setIsAuctionModalOpen(true);
  };

  // --- SESSION CHECKING SCREEN ---
  if (isAuthChecking) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] gap-4 bg-zinc-950 text-white">
        <div className="h-10 w-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-sm text-zinc-400 font-semibold tracking-wide">Syncing KuriFlow Authenticator...</p>
      </div>
    );
  }

  // ==========================================
  // --- STATE 1: ULTRA-MINIMAL LANDING PAGE ---
  // ==========================================
  if (pageState === 'landing') {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between relative overflow-hidden">
        
        {/* Glow ambient background elements */}
        <div className="absolute right-0 bottom-0 top-0 left-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none z-0" />
        
        {/* Simple minimal header */}
        <header className="w-full max-w-7xl mx-auto py-8 px-6 md:px-8 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 p-[1px] flex items-center justify-center border border-indigo-500/20">
              <Layers className="h-4.5 w-4.5 text-indigo-400" />
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Kuri Tracker
            </span>
          </div>
        </header>

        {/* Minimal content hero */}
        <main className="max-w-4xl mx-auto w-full px-6 flex-1 flex flex-col items-center justify-center text-center relative z-10 space-y-8 mt-[-40px]">
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/5 text-indigo-400 border border-indigo-500/15 text-[11px] font-bold tracking-wider uppercase">
              <Sparkles className="h-3 w-3 animate-pulse" /> Neon Cloud Authentication
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent leading-none py-1">
              Kuri Tracker
            </h1>
            
            <p className="text-zinc-400 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Schedule monthly auctions, distribute dividends instantly, and manage enrolled subscriber ledger matrix. Backed by transactional AWS Neon PostgreSQL synchronization.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => { setAuthTab('login'); setPageState('auth'); }}
              className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm tracking-wider uppercase rounded-xl transition-all shadow-lg shadow-indigo-600/15 flex items-center gap-2 group animate-float border border-white/5"
            >
              Access Application
              <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-950/80 border border-emerald-500/15 text-[10px] text-emerald-400 font-bold uppercase tracking-widest shadow-lg shadow-emerald-500/5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Secured by Neon
            </div>
          </div>

          {/* Simple bullet points */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 max-w-3xl w-full">
            <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/40 text-left space-y-2">
              <div className="h-7 w-7 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Cloud className="h-4 w-4" />
              </div>
              <h4 className="text-xs font-bold text-white">Neon Cloud Sync</h4>
              <p className="text-[11px] text-zinc-500 leading-normal">Stateless secure data persistence sandboxed to your credentials.</p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/40 text-left space-y-2">
              <div className="h-7 w-7 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Calculator className="h-4 w-4" />
              </div>
              <h4 className="text-xs font-bold text-white">Compound ROI Sim</h4>
              <p className="text-[11px] text-zinc-500 leading-normal">Estimate compound chitty returns, monthly yields and net IRR.</p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/40 text-left space-y-2">
              <div className="h-7 w-7 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Users className="h-4 w-4" />
              </div>
              <h4 className="text-xs font-bold text-white">Subscriber Registry</h4>
              <p className="text-[11px] text-zinc-500 leading-normal">Interactive grid matrix to easily toggle payment collections.</p>
            </div>
          </div>
        </main>

        {/* Minimal Footer */}
        <footer className="w-full max-w-7xl mx-auto py-8 px-6 text-center text-xs text-zinc-600 relative z-10 border-t border-zinc-900">
          <p>© {new Date().getFullYear()} Kuri Tracker , All rights reserved.</p>
        </footer>
      </div>
    );
  }

  // ===================================
  // --- STATE 2: SIGN UP / LOGIN CARD ---
  // ===================================
  if (pageState === 'auth') {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4 relative overflow-hidden">
        
        {/* Radial backdrop */}
        <div className="absolute right-0 bottom-0 top-0 left-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent pointer-events-none z-0" />

        <div className="w-full max-w-md rounded-2xl glass-panel p-8 space-y-6 relative border border-white/10 z-10 shadow-2xl shadow-indigo-500/5">
          
          <button
            onClick={() => setPageState('landing')}
            className="absolute top-4 left-4 text-xs font-semibold text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>

          <div className="text-center space-y-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-400 p-[1px] flex items-center justify-center mx-auto glow-indigo animate-float">
              <div className="h-full w-full rounded-[9px] bg-zinc-950 flex items-center justify-center">
                <Layers className="h-5 w-5 text-indigo-400" />
              </div>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white mt-3">
              {authTab === 'login' ? 'Sign In to KuriFlow' : 'Create KuriFlow Account'}
            </h2>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Neon PostgreSQL Authenticated</p>
          </div>

          {/* Toggle Tab */}
          <div className="flex bg-zinc-900/60 p-1 rounded-xl border border-zinc-800/80">
            <button
              type="button"
              onClick={() => { setAuthTab('login'); setAuthError(''); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
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
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                authTab === 'signup' 
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error display */}
          {authError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2 text-xs text-rose-400">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="font-semibold">{authError}</span>
            </div>
          )}

          {/* Auth form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authTab === 'signup' && (
              <>
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

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400">Account Type</label>
                  <div className="grid grid-cols-2 gap-1.5 bg-zinc-900/60 p-1 rounded-xl border border-zinc-850">
                    <button
                      type="button"
                      onClick={() => setAuthRole('admin')}
                      className={`py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all duration-200 ${
                        authRole === 'admin'
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthRole('member')}
                      className={`py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all duration-200 ${
                        authRole === 'member'
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Member
                    </button>
                  </div>
                  <p className="text-[9px] text-zinc-500 leading-normal px-1">
                    {authRole === 'admin' && 'Organize group saving pools, run monthly auctions, add subscribers.'}
                    {authRole === 'member' && 'Read-only dashboard view linked to a group admin via UUID.'}
                  </p>
                </div>
              </>
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
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:from-zinc-850 disabled:to-zinc-850 disabled:text-zinc-600 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
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

            {/* Neon Security Badge */}
            <div className="pt-3 border-t border-zinc-900 flex justify-center">
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-950/80 border border-emerald-500/15 text-[9px] text-emerald-400 font-extrabold uppercase tracking-wider shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Secured by Neon
              </div>
            </div>
          </form>

        </div>
      </div>
    );
  }

  // =====================================
  // --- STATE 3: THE PRIVATE DASHBOARD ---
  // =====================================
  return (
    <div className="flex-1 flex flex-col pb-16 bg-zinc-950 text-white min-h-screen">
      
      {/* HEADER */}
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
                  Kuri Tracker
                </span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  PRO
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-medium">Neon PostgreSQL Managed Kuri Tracker</p>
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

            {/* Profile Sign-out */}
            {user && (
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
            )}
          </div>
        </div>
      </header>

      {/* DASHBOARD CONTAINER */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 mt-6 flex-1 flex flex-col lg:flex-row gap-6">
        
        {/* SIDEBAR TABS */}
        <nav className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-60 shrink-0 border-b lg:border-b-0 lg:border-r border-zinc-800/80 pr-0 lg:pr-6 scrollbar-thin">
          <button
            onClick={() => { setActiveTab('dashboard'); setSelectedKuriId(null); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 shrink-0 whitespace-nowrap ${
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
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 shrink-0 whitespace-nowrap ${
              activeTab === 'kuries'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/10 glow-indigo'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
            }`}
          >
            <Building className="h-4.5 w-4.5" />
            Active Kuries ({kuries.length})
          </button>
          {user?.role !== 'member' && unlockedUuids.length > 0 && (
            <button
              onClick={() => { setActiveTab('subscribers'); setSelectedKuriId(null); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 shrink-0 whitespace-nowrap ${
                activeTab === 'subscribers'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/10 glow-indigo'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              <Users className="h-4.5 w-4.5" />
              Subscribers Pool
            </button>
          )}

          <div className="hidden lg:block mt-8 p-4 rounded-2xl bg-zinc-900/30 border border-emerald-500/20 text-left space-y-2 shadow-lg shadow-emerald-500/5">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-400 uppercase tracking-widest">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" />
              Secured by Neon
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-semibold">
              Transactional cloud storage via Neon Serverless Postgres. Fully isolated, safe, and secure sandbox database layers.
            </p>
            <div className="pt-2 flex items-center justify-between text-[10px] text-zinc-500 font-mono font-bold border-t border-zinc-800">
              <span>SSL ENCRYPTED</span>
              <span className="text-emerald-500">100% PERSISTENT</span>
            </div>
          </div>
        </nav>

        {/* MAIN PANEL CONTENT */}
        <div className="flex-1 min-w-0 font-sans">
          
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Unlock Member Directory Panel */}
              {user?.role === 'admin' && (
                <div className="p-5 rounded-2xl glass-panel border border-zinc-800 space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-indigo-400" />
                      Unlock Member Directory
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      As an admin, you must enter a registered Member UUID to view their contact details, register them, or add them to saving schemes.
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={globalUuidInput}
                        onChange={(e) => setGlobalUuidInput(e.target.value)}
                        placeholder="Enter Member UUID (e.g. 1c23a456...)"
                        className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                    <button
                      onClick={async () => {
                        if (!globalUuidInput.trim()) return;
                        const verified = await handleUnlockMemberByUuid(globalUuidInput);
                        if (verified) {
                          setGlobalUuidInput('');
                        }
                      }}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shrink-0"
                    >
                      Unlock & Sync Member
                    </button>
                  </div>

                  {unlockedUuids.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-zinc-900">
                      <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Unlocked Member UUIDs ({unlockedUuids.length})</span>
                      <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-1">
                        {unlockedUuids.map(uuid => {
                          const sub = subscribers.find(s => s.memberUuid === uuid);
                          return (
                            <div key={uuid} className="flex items-center gap-2 bg-indigo-950/40 border border-indigo-500/20 px-2.5 py-1.5 rounded-lg text-xs">
                              <span className="font-mono text-[10px] text-indigo-300">{sub ? sub.name : `${uuid.slice(0, 8)}...`}</span>
                              <button
                                onClick={() => {
                                  if (confirm('Are you sure you want to remove this UUID and hide this member?')) {
                                    const updated = unlockedUuids.filter(u => u !== uuid);
                                    setUnlockedUuids(updated);
                                    localStorage.setItem('kuri_unlocked_uuids', JSON.stringify(updated));
                                  }
                                }}
                                className="text-zinc-500 hover:text-rose-400"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Member UUID Banner */}
              {user?.role === 'member' && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 to-sky-950/40 border border-indigo-500/25 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-lg shadow-indigo-500/5 relative overflow-hidden animate-float">
                  <div className="absolute right-0 bottom-0 top-0 w-1/4 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5 font-mono tracking-wider">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      YOUR CHIT SUBSCRIBER UUID
                    </h4>
                    <p className="text-[10px] text-zinc-400 mt-1 font-medium">
                      Provide this 128-bit unique ID to your Group Admin to link your live read-only dashboard.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-zinc-950/80 px-3 py-2 rounded-xl border border-zinc-800 max-w-full overflow-hidden relative z-10">
                    <code className="text-xs font-mono text-indigo-300 break-all select-all font-semibold">{user.uuid}</code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(user.uuid || '');
                        alert('UUID copied to clipboard!');
                      }}
                      className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[10px] font-extrabold uppercase rounded-lg border border-indigo-500/20 transition-all shrink-0 active:scale-95"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

              {/* Top Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-indigo-950/20 border border-zinc-800 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 animate-float">
                      Welcome to Kuri Tracker, {user?.name}!
                      <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
                    </h2>
                    <p className="text-zinc-400 text-sm mt-1 max-w-xl">
                      Organize members, schedule auctions, distribute dividends automatically, and monitor collections instantly in one premium glass dashboard.
                    </p>
                  </div>
                  {user?.role !== 'member' && (
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => setIsKuriModalOpen(true)}
                        className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-indigo-600/15 flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" /> Create Kuri Scheme
                      </button>
                      {unlockedUuids.length > 0 && (
                        <button
                          onClick={() => setIsSubscriberModalOpen(true)}
                          className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-sm rounded-xl border border-zinc-700 transition-colors flex items-center gap-2"
                        >
                          <UserPlus className="h-4 w-4" /> Add Subscriber
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Reminders & Due Date Alerts Panel */}
              {(activeAutoReminders.length > 0 || displayedReminders.length > 0) && (
                <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3.5 relative overflow-hidden animate-fade-in">
                  <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-amber-400 tracking-widest uppercase flex items-center gap-2">
                      <Clock className="h-4.5 w-4.5 text-amber-400 animate-pulse" />
                      Important Payment Reminders ({activeAutoReminders.length + displayedReminders.length})
                    </h3>
                  </div>
                  
                  <div className="space-y-2">
                    {/* Auto reminders */}
                    {activeAutoReminders.map(ar => (
                      <div key={ar.id} className="p-3 bg-zinc-950/60 border border-amber-500/20 rounded-xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                          <p className="text-xs font-semibold text-zinc-300">{ar.message}</p>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded font-mono shrink-0">Auto Alert</span>
                      </div>
                    ))}
                    
                    {/* Manual reminders */}
                    {displayedReminders.map(r => {
                      const kuri = kuries.find(k => k.id === r.kuriId);
                      const sub = subscribers.find(s => s.id === r.subscriberId);
                      return (
                        <div key={r.id} className="p-3 bg-zinc-950/60 border border-indigo-500/20 rounded-xl flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className="h-2 w-2 rounded-full bg-indigo-400 shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-zinc-300">{r.message}</p>
                              {user?.role === 'admin' && (
                                <span className="text-[9px] text-zinc-500 font-medium block mt-0.5">Sent to: {sub?.name || 'Unknown'} (Month {r.month})</span>
                              )}
                            </div>
                          </div>
                          <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded font-mono shrink-0">Admin Alert</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stats Counters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl glass-card relative overflow-hidden group">
                  <div className="absolute top-3 right-3 text-indigo-400/20 group-hover:text-indigo-400/30 transition-colors">
                    <Building className="h-8 w-8" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Value Managed</span>
                  <h3 className="text-2xl font-bold text-white mt-1.5 tracking-tight font-mono">
                    ₹{dashboardStats.totalFUM.toLocaleString('en-IN')}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[10px] font-semibold text-indigo-400 px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/10">
                      {dashboardStats.activeKuriesCount} Schemes
                    </span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl glass-card relative overflow-hidden group">
                  <div className="absolute top-3 right-3 text-emerald-400/20 group-hover:text-emerald-400/30 transition-colors">
                    <TrendingUp className="h-8 w-8" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Dividends Distributed</span>
                  <h3 className="text-2xl font-bold text-emerald-400 mt-1.5 tracking-tight font-mono">
                    ₹{dashboardStats.totalDividends.toLocaleString('en-IN')}
                  </h3>
                  <div className="flex items-center gap-1 mt-2 text-xs text-zinc-400 font-medium">
                    <span className="text-emerald-400">✨ Sub-yield optimized</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl glass-card relative overflow-hidden group">
                  <div className="absolute top-3 right-3 text-indigo-400/20 group-hover:text-indigo-400/30 transition-colors">
                    <Users className="h-8 w-8" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Registered Subscribers</span>
                  <h3 className="text-2xl font-bold text-white mt-1.5 tracking-tight font-mono">
                    {subscribers.length}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-zinc-500">
                    <span>Active global registry pool</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl glass-card relative overflow-hidden group">
                  <div className="absolute top-3 right-3 text-sky-400/20 group-hover:text-sky-400/30 transition-colors">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Month Collection Rate</span>
                  <h3 className="text-2xl font-bold text-sky-400 mt-1.5 tracking-tight font-mono">
                    {dashboardStats.collectionRate}%
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-full bg-zinc-800 rounded-full h-1.5">
                      <div className="bg-sky-400 h-1.5 rounded-full" style={{ width: `${dashboardStats.collectionRate}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inflow chart split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

                  {/* SVG chart */}
                  <div className="w-full overflow-hidden flex items-center justify-center bg-zinc-950/40 rounded-xl p-4 border border-zinc-800/80">
                    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto text-xs">
                      <line x1="40" y1="20" x2={chartWidth - 20} y2="20" stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
                      <line x1="40" y1="60" x2={chartWidth - 20} y2="60" stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
                      <line x1="40" y1="100" x2={chartWidth - 20} y2="100" stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
                      <line x1="40" y1="130" x2={chartWidth - 20} y2="130" stroke="rgba(255,255,255,0.08)" />

                      {cashFlowChartData.map((d, i) => {
                        const step = (chartWidth - 80) / (cashFlowChartData.length - 1 || 1);
                        const x = 50 + i * step;
                        const expY = 130 - (d.expected / maxVal) * 100;
                        const colY = 130 - (d.collected / maxVal) * 100;

                        return (
                          <g key={i}>
                            <rect x={x - 6} y={expY} width="5" height={130 - expY} fill="rgba(99, 102, 241, 0.45)" rx="1.5" className="transition-all duration-300 hover:fill-indigo-500" />
                            <rect x={x} y={colY} width="5" height={130 - colY} fill={d.collected === d.expected ? "rgba(16, 185, 129, 0.75)" : "rgba(16, 185, 129, 0.45)"} rx="1.5" className="transition-all duration-300 hover:fill-emerald-400" />
                            <text x={x - 4} y="148" fill="#71717a" fontSize="9" fontWeight="600" textAnchor="middle">{d.label}</text>
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
                        <div key={k.id} onClick={() => { setSelectedKuriId(k.id); setActiveTab('kuries'); }} className="p-3.5 rounded-xl bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-800 transition-all cursor-pointer flex flex-col gap-2 group">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-zinc-300 group-hover:text-indigo-400 transition-colors">{k.name}</span>
                            <span className="text-[10px] text-zinc-500 font-bold">{k.currentMonth}/{k.durationMonths} Months</span>
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

              {/* Transactions logs */}
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
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">Auction Prized</span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">Subscription Contribution</span>
                            )}
                          </td>
                          <td className="py-3 font-semibold text-zinc-200">
                            {act.title}
                            <span className="block text-[11px] font-normal text-zinc-500">{act.desc}</span>
                          </td>
                          <td className="py-3 text-zinc-400 font-medium">
                            {act.date ? new Date(act.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending'}
                          </td>
                          <td className="py-3 text-right pr-2 font-mono font-bold text-white">₹{act.amount.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                      {recentActivities.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-zinc-500">No activities logged yet. Get started by executing an auction!</td>
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
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => setIsKuriModalOpen(true)}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-indigo-600/10 flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" /> Start New Scheme
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {kuries.map(k => {
                      const progressPct = Math.round((Number(k.currentMonth) / Number(k.durationMonths)) * 100);
                      return (
                        <div key={k.id} className="rounded-2xl glass-card p-5 flex flex-col justify-between h-[230px]">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Month {k.currentMonth}/{k.durationMonths}</span>
                              <span className="text-xs font-semibold text-zinc-500">₹{(Number(k.totalValue) / 100000).toFixed(1)}L Total Value</span>
                            </div>
                            <h3 className="text-lg font-bold text-white mt-3 tracking-tight leading-snug">{k.name}</h3>
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
                              <button onClick={() => setSelectedKuriId(k.id)} className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
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
                        <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">Get started by initializing a new chit fund scheme!</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                
                /* DETAILED KURI LEDGER MATRIX VIEW */
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
                    <div>
                      <button onClick={() => setSelectedKuriId(null)} className="text-xs font-semibold text-zinc-500 hover:text-zinc-300 flex items-center gap-1.5 mb-2 transition-colors">← Back to Schemes</button>
                      <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        {selectedKuri.name}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${selectedKuri.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'}`}>{selectedKuri.status}</span>
                      </h2>
                      <p className="text-xs text-zinc-500 font-semibold mt-1">Scheme started on {new Date(selectedKuri.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>

                    {user?.role !== 'member' && (
                      <div className="flex items-center gap-3">
                        {selectedKuri.status === 'active' && (
                          <>
                            <button onClick={openAuctionModal} className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-indigo-600/10 flex items-center gap-2">
                              <TrendingUp className="h-4.5 w-4.5" /> Run Month {selectedKuri.currentMonth} Auction
                            </button>
                            <button 
                              onClick={() => handleSendReminderToAllUnpaid(selectedKuri.id)}
                              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm rounded-xl transition-all shadow-md flex items-center gap-2"
                              title="Remind unpaid members for this month"
                            >
                              <Clock className="h-4.5 w-4.5" /> Remind Unpaid
                            </button>
                          </>
                        )}
                        <button onClick={() => handleDeleteKuri(selectedKuri.id)} className="p-2.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl border border-zinc-800 transition-all" title="Delete Scheme"><Trash2 className="h-4.5 w-4.5" /></button>
                      </div>
                    )}
                  </div>

                  {user?.role === 'admin' && selectedKuri.status === 'active' && (
                    <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800 space-y-3">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <UserPlus className="h-4 w-4 text-indigo-400" />
                        Enroll New Member to this Scheme
                      </h4>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={activeSchemeUuidInput}
                          onChange={(e) => setActiveSchemeUuidInput(e.target.value)}
                          placeholder="Enter Member UUID to add..."
                          className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            if (!activeSchemeUuidInput.trim()) return;
                            await handleAddMemberToActiveSchemeByUuid(selectedKuri.id, activeSchemeUuidInput);
                            setActiveSchemeUuidInput('');
                          }}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all"
                        >
                          Add Member
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800">
                      <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider font-mono">Pool Value</span>
                      <h4 className="text-lg font-bold text-white mt-1 font-mono">₹{Number(selectedKuri.totalValue).toLocaleString('en-IN')}</h4>
                    </div>
                    <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800">
                      <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider font-mono">Installment Value</span>
                      <h4 className="text-lg font-bold text-white mt-1 font-mono">₹{Number(selectedKuri.installmentAmount).toLocaleString('en-IN')} <span className="text-xs font-normal text-zinc-500">/mo</span></h4>
                    </div>
                    <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800">
                      <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider font-mono">Total Dividends</span>
                      <h4 className="text-lg font-bold text-emerald-400 mt-1 font-mono">₹{auctions.filter(a => a.kuriId === selectedKuri.id).reduce((sum, a) => sum + Number(a.discount), 0).toLocaleString('en-IN')}</h4>
                    </div>
                    <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800">
                      <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider font-mono">Milestone Month</span>
                      <h4 className="text-lg font-bold text-indigo-400 mt-1 font-mono">{selectedKuri.currentMonth} of {selectedKuri.durationMonths}</h4>
                    </div>
                    <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800">
                      <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider font-mono">Monthly Payday</span>
                      <h4 className="text-lg font-bold text-amber-400 mt-1 font-mono">{selectedKuri.payday || 10}th <span className="text-xs font-normal text-zinc-500">/mo</span></h4>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl glass-panel space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">Interactive Collection Ledger Matrix</h3>
                        <p className="text-xs text-zinc-400">Click a grey column installment button to mark payment as Paid</p>
                      </div>
                      <div className="inline-flex lg:hidden items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900/60 border border-zinc-800 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        <span>Swipe months horizontally</span>
                        <span className="animate-bounce">👉</span>
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-zinc-800 rounded-xl scrollbar-thin">
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
                                  <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">#{row.ticketNumber}</span>
                                  {row.name}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                {row.isPrized ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">Month {row.prizedMonth} Winning</span>
                                ) : (
                                  <span className="text-xs text-zinc-600 font-medium">Non-Prized</span>
                                )}
                              </td>
                              {ledgerData.months.map(m => {
                                const pay = row.paymentsMap[m];
                                if (!pay) return <td key={m} className="py-3 px-4 text-center text-xs text-zinc-700">-</td>;
                                const isPaid = pay.status === 'paid';

                                return (
                                  <td key={m} onClick={() => togglePaymentStatus(pay.id)} className="py-3 px-4 text-center cursor-pointer select-none transition-all group">
                                    <div className={`mx-auto w-24 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${isPaid ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20 shadow-sm shadow-emerald-500/5' : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:border-indigo-500 hover:text-indigo-400'}`}>
                                      {isPaid ? <><CheckCircle className="h-3.5 w-3.5 text-emerald-400" />Paid</> : <><Clock className="h-3.5 w-3.5 text-zinc-500 group-hover:text-indigo-400" />Pay ₹{Math.round(pay.amount / 1000)}k</>}
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
                    <div className="p-6 rounded-2xl glass-panel space-y-4">
                      <div>
                        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2"><History className="h-4.5 w-4.5 text-indigo-400" />Historical Auction Logs</h3>
                        <p className="text-xs text-zinc-400">Auction discounts and shared dividends</p>
                      </div>
                      <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-2">
                        {auctions.filter(a => a.kuriId === selectedKuri.id).map(a => {
                          const winner = subscribers.find(s => s.id === a.winningSubscriberId);
                          return (
                            <div key={a.id} className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex items-center justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">Month {a.month}</span>
                                  <span className="text-sm font-bold text-zinc-200">{winner?.name || 'Unknown'}</span>
                                </div>
                                <p className="text-xs text-zinc-400 mt-1 font-medium font-mono">Dividend: <span className="text-emerald-400 font-bold">₹{Number(a.dividendPerMember).toLocaleString('en-IN')}</span></p>
                              </div>
                              <div className="text-right">
                                <span className="text-xs text-zinc-500 font-semibold block">Prized Payout</span>
                                <span className="text-sm font-extrabold text-white font-mono">₹{Number(a.winningBid).toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          );
                        })}
                        {auctions.filter(a => a.kuriId === selectedKuri.id).length === 0 && (
                          <div className="py-8 text-center text-zinc-500 text-xs">No auctions have been conducted yet. Click button above to execute auction.</div>
                        )}
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl glass-panel space-y-4">
                      <div>
                        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2"><Users className="h-4.5 w-4.5 text-indigo-400" />Enrolled Subscriber Registry</h3>
                        <p className="text-xs text-zinc-400">List of subscribers participating in this active scheme</p>
                      </div>
                      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-2">
                        {selectedKuri.subscribers.map(ks => {
                          const sub = visibleSubscribers.find(s => s.id === ks.subscriberId);
                          const displayName = sub ? sub.name : `Ticket #${ks.ticketNumber} (Hidden)`;
                          const displayPhone = sub ? sub.phone : 'UUID locked';
                          return (
                            <div key={ks.subscriberId} className="p-3.5 rounded-xl bg-zinc-900/30 border border-zinc-800/80 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 text-xs font-bold font-mono">#{ks.ticketNumber}</div>
                                <div>
                                  <h4 className="text-sm font-bold text-white">{displayName}</h4>
                                  <span className="text-[10.5px] text-zinc-500 font-medium flex items-center gap-2"><Phone className="h-3 w-3" /> {displayPhone}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {ks.isPrized ? (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Prized (M{ks.prizedMonth})</span>
                                ) : (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Active Subscriber</span>
                                )}
                                {user?.role === 'admin' && !ks.isPrized && (
                                  <button
                                    onClick={() => {
                                      const msg = prompt(`Enter custom reminder for ${displayName}:`, `Reminder: Please pay your installment of ₹${selectedKuri.installmentAmount.toLocaleString('en-IN')} for Month ${selectedKuri.currentMonth} in scheme "${selectedKuri.name}" before the payday (${selectedKuri.payday || 10}th of the month).`);
                                      if (msg !== null) {
                                        handleSendReminder(selectedKuri.id, ks.subscriberId, msg);
                                      }
                                    }}
                                    className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-[10px] font-bold rounded-lg transition-all"
                                  >
                                    Remind
                                  </button>
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
          {activeTab === 'subscribers' && user?.role === 'admin' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Subscribers registry pool</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Manage global contact lists and enrolled active schemes</p>
                </div>
                {user?.role === 'admin' && (
                  <button onClick={() => setIsSubscriberModalOpen(true)} className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-indigo-600/10 flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Register New Subscriber
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <input type="text" value={subSearchQuery} onChange={(e) => setSubSearchQuery(e.target.value)} placeholder="Search by name, phone, email..." className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSubscribersList.map(sub => {
                  const enrolledSchemes = kuries.filter(k => k.subscribers.some(ks => ks.subscriberId === sub.id));
                  const prizedCount = enrolledSchemes.filter(k => k.subscribers.find(ks => ks.subscriberId === sub.id)?.isPrized).length;

                  return (
                    <div key={sub.id} className="rounded-2xl glass-card p-5 flex flex-col justify-between min-h-[210px] h-auto relative group">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 flex items-center justify-center font-bold font-mono">{sub.name.charAt(0)}</div>
                          {user?.role !== 'member' && (
                            <button onClick={() => handleDeleteSubscriber(sub.id)} className="p-1.5 text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100" title="Delete"><Trash2 className="h-4 w-4" /></button>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-white mt-3.5 tracking-tight">{sub.name}</h3>
                        <div className="mt-2 space-y-1 text-xs text-zinc-500 font-medium font-mono">
                          <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {sub.phone}</span>
                          <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {sub.email}</span>
                        </div>
                        {sub.memberUuid && (
                          <div className="mt-3 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-[9px] font-mono text-emerald-400 break-all select-all font-semibold" title="Linked Registered Group Member Account">
                            LINKED: {sub.memberUuid}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between border-t border-zinc-800/80 pt-3.5 mt-4">
                        <div className="text-[11px] text-zinc-400">Enrolled: <span className="font-bold text-white">{enrolledSchemes.length} Schemes</span></div>
                        <div className="text-[11px] text-zinc-500 font-bold font-mono">{prizedCount} Prized Bids</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* --- MODAL 1: CREATE KURI SCHEME --- */}
      {isKuriModalOpen && user?.role === 'admin' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-2xl glass-panel p-6 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsKuriModalOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"><X className="h-5 w-5" /></button>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2"><Sparkles className="h-5 w-5 text-indigo-400" />Initialize New Kuri Scheme</h3>
              <p className="text-xs text-zinc-400 mt-1 font-semibold">Configure installments, duration, and enroll subscribers</p>
            </div>
            <form onSubmit={handleCreateKuri} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400">Kuri Scheme Name</label>
                  <input type="text" required value={newKuriName} onChange={(e) => setNewKuriName(e.target.value)} placeholder="e.g. Royal Gold 5L" className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400">Total Pool Value (₹)</label>
                  <input type="number" required value={newKuriTotalValue} onChange={(e) => setNewKuriTotalValue(Number(e.target.value))} placeholder="500000" className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-indigo-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400">Duration (Months)</label>
                  <input type="number" required min="2" max="60" value={newKuriDuration} onChange={(e) => setNewKuriDuration(Number(e.target.value))} className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-indigo-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400">Start Date</label>
                  <input type="date" required value={newKuriStartDate} onChange={(e) => setNewKuriStartDate(e.target.value)} className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-indigo-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400">Monthly Payday (Day 1-28)</label>
                  <input 
                    type="number" 
                    required 
                    min="1" 
                    max="28" 
                    value={newKuriPayday} 
                    onChange={(e) => setNewKuriPayday(Number(e.target.value))} 
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 font-mono" 
                  />
                </div>
              </div>

              <div className="space-y-2 border-b border-zinc-900 pb-4">
                <label className="text-xs font-semibold text-zinc-400">Enroll Member by UUID</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={schemeUuidInput}
                    onChange={(e) => setSchemeUuidInput(e.target.value)}
                    placeholder="Enter Member UUID (e.g. 1c23a456...)"
                    className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleUnlockAndEnrollInScheme(schemeUuidInput)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all"
                  >
                    Enroll Member
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-zinc-400">Enroll Subscribers ({selectedEnrollSubscribers.length} selected)</label>
                  <span className="text-[10px] text-indigo-400 font-bold">No member limit</span>
                </div>
                <div className="border border-zinc-800 bg-zinc-950/40 rounded-xl p-3.5 max-h-[160px] overflow-y-auto space-y-2">
                  {visibleSubscribers.map((sub) => {
                    const isSelected = selectedEnrollSubscribers.includes(sub.id);
                    return (
                      <div key={sub.id} onClick={() => toggleSubSelect(sub.id)} className={`p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${isSelected ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20' : 'bg-zinc-900/30 text-zinc-400 border-zinc-850 hover:bg-zinc-800/20'}`}>
                        <span>{sub.name}</span>
                        <span className="text-[10px] text-zinc-500 font-medium font-mono">{sub.phone}</span>
                      </div>
                    );
                  })}
                  {visibleSubscribers.length === 0 && (
                    <div className="text-center py-4 text-zinc-500 text-xs">
                      No unlocked members. Use the UUID input above to search and enroll members.
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
                <button type="button" onClick={() => setIsKuriModalOpen(false)} className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-semibold text-xs rounded-xl border border-zinc-800 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/10">Launch Kuri Scheme</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: REGISTER NEW SUBSCRIBER --- */}
      {isSubscriberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl glass-panel p-6 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsSubscriberModalOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"><X className="h-5 w-5" /></button>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2"><UserPlus className="h-5 w-5 text-indigo-400" />Register New Subscriber</h3>
              <p className="text-xs text-zinc-400 mt-1">Provide a registered Member UUID to load and register their subscriber card.</p>
            </div>
            
            <form onSubmit={handleAddSubscriber} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">Member UUID</label>
                <input 
                  type="text" 
                  required
                  value={newSubMemberUuid} 
                  onChange={(e) => setNewSubMemberUuid(e.target.value)} 
                  placeholder="e.g. 1c23a456-7890-bcde-fgh1-23456789abcd" 
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-indigo-500 font-mono" 
                />
              </div>
              
              <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
                <button type="button" onClick={() => setIsSubscriberModalOpen(false)} className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-semibold text-xs rounded-xl border border-zinc-800 transition-colors">Cancel</button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/10"
                >
                  Register Subscriber
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: RUN AUCTION / MONTHLY DRAW --- */}
      {isAuctionModalOpen && selectedKuri && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl glass-panel p-6 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsAuctionModalOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"><X className="h-5 w-5" /></button>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                Month {selectedKuri.currentMonth} Settlement
              </h3>
              <p className="text-xs text-zinc-400 mt-1">Select winner via bidding auction or automatic monthly lucky draw.</p>
            </div>

            {/* Mode selection tabs */}
            <div className="flex bg-zinc-900/60 p-1 rounded-xl border border-zinc-800/80">
              <button
                type="button"
                onClick={() => { setAuctionMode('bidding'); setLuckyDrawWinner(null); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  auctionMode === 'bidding'
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                Bidding Auction
              </button>
              <button
                type="button"
                onClick={() => { setAuctionMode('luckydraw'); setLuckyDrawWinner(null); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  auctionMode === 'luckydraw'
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Gift className="h-3.5 w-3.5" />
                Lucky Draw
              </button>
            </div>
            <form onSubmit={handleRunAuction} className="space-y-4">
              {auctionMode === 'bidding' ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400">Select Prized Subscriber</label>
                    <select required value={auctionWinningSubId} onChange={(e) => setAuctionWinningSubId(e.target.value)} className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-indigo-500">
                      {prizedCandidates.map(c => <option key={c.id} value={c.id}>Ticket #{c.ticketNumber} - {c.name}</option>)}
                      {prizedCandidates.length === 0 && <option value="">No remaining active candidates</option>}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-zinc-400"><label>Prize Payout Bid (₹)</label><span>Max: ₹{Number(selectedKuri.totalValue).toLocaleString('en-IN')}</span></div>
                    <input type="number" required value={auctionWinningBid} onChange={(e) => setAuctionWinningBid(Number(e.target.value))} placeholder="e.g. 430000" className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-indigo-500" />
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  {isDrawing ? (
                    <div className="p-6 bg-indigo-950/20 border border-indigo-500/25 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 animate-pulse">
                      <div className="h-10 w-10 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                      <div>
                        <h4 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">Drawing Lucky Ticket...</h4>
                        <p className="text-lg font-black text-indigo-400 mt-2 font-mono">
                          {prizedCandidates[drawCandidateIndex]?.name || 'Selecting...'}
                        </p>
                        <span className="text-[10px] text-zinc-500 font-bold block mt-1">Ticket #{prizedCandidates[drawCandidateIndex]?.ticketNumber}</span>
                      </div>
                    </div>
                  ) : luckyDrawWinner ? (
                    <div className="p-6 bg-gradient-to-r from-indigo-950/40 to-emerald-950/40 border border-emerald-500/25 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden animate-float">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
                      <Trophy className="h-12 w-12 text-amber-400 animate-pulse animate-bounce" />
                      <div>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1.5 rounded-full font-extrabold uppercase tracking-wider font-mono">Draw Winner Selected!</span>
                        <h4 className="text-lg font-black text-white mt-2 tracking-tight">{luckyDrawWinner.name}</h4>
                        <p className="text-xs text-zinc-400 mt-0.5 font-mono">Ticket Number: <span className="text-white font-bold">#{luckyDrawWinner.ticketNumber}</span></p>
                      </div>
                      <div className="pt-2 text-[10px] text-zinc-500 font-medium">
                        Auto-configured payout: <span className="text-white font-bold">₹{auctionWinningBid.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
                      <Gift className="h-12 w-12 text-indigo-400" />
                      <div>
                        <h4 className="text-sm font-bold text-white">Monthly Lucky Draw Selection</h4>
                        <p className="text-xs text-zinc-400 mt-1">Automatically select a unique winning subscriber at random from the {prizedCandidates.length} remaining eligible candidates.</p>
                      </div>
                      <button
                        type="button"
                        onClick={triggerLuckyDraw}
                        disabled={prizedCandidates.length === 0}
                        className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-600/10 active:scale-95 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 font-semibold"
                      >
                        🎲 Trigger Lucky Draw
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-zinc-400"><span>Pool:</span><span className="font-bold text-white">₹{Number(selectedKuri.totalValue).toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between text-zinc-400"><span>Total Discount:</span><span className="font-bold text-white">₹{Math.round(Number(selectedKuri.totalValue) - auctionWinningBid).toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between border-t border-zinc-850 pt-2 text-zinc-300 font-semibold font-sans">
                  <span>Projected Dividend / member:</span>
                  <span className="text-emerald-400 font-mono">₹{Math.max(0, Math.round((Number(selectedKuri.totalValue) - auctionWinningBid) / selectedKuri.subscribers.length)).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAuctionModalOpen(false)} className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-semibold text-xs rounded-xl border border-zinc-800 transition-colors">Cancel</button>
                <button 
                  type="submit" 
                  disabled={prizedCandidates.length === 0 || isDrawing || (auctionMode === 'luckydraw' && !luckyDrawWinner)} 
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/10"
                >
                  {auctionMode === 'luckydraw' ? 'Confirm Draw Winner Payout' : 'Execute Bid Auction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
