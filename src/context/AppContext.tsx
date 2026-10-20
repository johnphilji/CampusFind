import React, { createContext, useContext, useState, useEffect } from 'react';
import { CampusItem, AppNotification, ClaimRecord, MatchSuggestion } from '../types';
import { INITIAL_ITEMS, INITIAL_NOTIFICATIONS, INITIAL_CLAIMS, INITIAL_MATCHES } from '../data/mockData';

interface UserProfile {
  name: string;
  email: string;
  studentId: string;
  department: string;
  role: 'student' | 'admin';
  avatar: string;
  phone?: string;
}

interface AppContextType {
  items: CampusItem[];
  notifications: AppNotification[];
  claims: ClaimRecord[];
  matches: MatchSuggestion[];
  user: UserProfile;
  activeRole: 'student' | 'admin';
  toggleRole: () => void;
  addItem: (item: Omit<CampusItem, 'id' | 'referenceNumber' | 'status' | 'timeAgo'>) => CampusItem;
  updateItemStatus: (id: string, status: CampusItem['status']) => void;
  submitClaim: (itemId: string, details: { name: string; email: string; studentId: string; proof: string }) => ClaimRecord;
  updateClaimStatus: (claimId: string, status: ClaimRecord['status'], notes?: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  unreadCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CampusItem[]>(() => {
    const saved = localStorage.getItem('cf_items');
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('cf_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [claims, setClaims] = useState<ClaimRecord[]>(() => {
    const saved = localStorage.getItem('cf_claims');
    return saved ? JSON.parse(saved) : INITIAL_CLAIMS;
  });

  const [matches, setMatches] = useState<MatchSuggestion[]>(INITIAL_MATCHES);

  const [activeRole, setActiveRole] = useState<'student' | 'admin'>('student');

  const [user, setUser] = useState<UserProfile>({
    name: 'Alex Morgan',
    email: 'alex.m@college.edu',
    studentId: 'IEC2023048',
    department: 'Information Technology, 3rd Year',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    phone: '+1 (555) 234-8901'
  });

  useEffect(() => {
    localStorage.setItem('cf_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('cf_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('cf_claims', JSON.stringify(claims));
  }, [claims]);

  const toggleRole = () => {
    setActiveRole(prev => {
      const next = prev === 'student' ? 'admin' : 'student';
      setUser(current => ({
        ...current,
        role: next,
        name: next === 'admin' ? 'Dr. Sarah Connor (Admin Desk)' : 'Alex Morgan'
      }));
      return next;
    });
  };

  const addItem = (newItemData: Omit<CampusItem, 'id' | 'referenceNumber' | 'status' | 'timeAgo'>) => {
    const refNum = `CF-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newItem: CampusItem = {
      ...newItemData,
      id: `item-${Date.now()}`,
      referenceNumber: refNum,
      status: 'open',
      timeAgo: 'Just now'
    };

    setItems(prev => [newItem, ...prev]);

    // Add notification
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: `${newItem.type === 'lost' ? 'Lost' : 'Found'} Item Registered`,
      message: `Your report for "${newItem.title}" has been published with reference ${refNum}.`,
      timestamp: 'Just now',
      read: false,
      type: 'report',
      targetId: newItem.id
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Check for smart matches
    const possible = items.find(
      i => i.type !== newItem.type &&
      (i.category === newItem.category || i.location === newItem.location)
    );

    if (possible) {
      const newMatch: MatchSuggestion = {
        id: `match-${Date.now()}`,
        lostItemId: newItem.type === 'lost' ? newItem.id : possible.id,
        foundItemId: newItem.type === 'found' ? newItem.id : possible.id,
        similarityScore: 89,
        reason: `Matched category "${newItem.category}" and proximity to campus location.`,
        lostItem: newItem.type === 'lost' ? newItem : possible,
        foundItem: newItem.type === 'found' ? newItem : possible,
        createdAt: 'Just now'
      };
      setMatches(prev => [newMatch, ...prev]);
    }

    return newItem;
  };

  const updateItemStatus = (id: string, status: CampusItem['status']) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, status } : item));
  };

  const submitClaim = (itemId: string, details: { name: string; email: string; studentId: string; proof: string }) => {
    const targetItem = items.find(i => i.id === itemId);
    const newClaim: ClaimRecord = {
      id: `CLM-${Math.floor(1000 + Math.random() * 9000)}`,
      itemId,
      claimantName: details.name,
      claimantEmail: details.email,
      claimantId: details.studentId,
      proofDetails: details.proof,
      status: 'Under Review',
      submittedAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      itemTitle: targetItem ? targetItem.title : 'Campus Item',
      itemType: targetItem ? targetItem.type : 'found',
      itemLocation: targetItem ? targetItem.location : 'Campus'
    };

    setClaims(prev => [newClaim, ...prev]);
    updateItemStatus(itemId, 'under_review');

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Claim Submitted for Review',
      message: `Your ownership claim for "${newClaim.itemTitle}" (${newClaim.id}) is being verified by Admin Desk.`,
      timestamp: 'Just now',
      read: false,
      type: 'claim',
      targetId: itemId
    };
    setNotifications(prev => [notif, ...prev]);

    return newClaim;
  };

  const updateClaimStatus = (claimId: string, status: ClaimRecord['status'], notes?: string) => {
    setClaims(prev => prev.map(c => {
      if (c.id === claimId) {
        return { ...c, status, adminNotes: notes || c.adminNotes };
      }
      return c;
    }));

    const targetClaim = claims.find(c => c.id === claimId);
    if (targetClaim) {
      if (status === 'Approved' || status === 'Item Returned') {
        updateItemStatus(targetClaim.itemId, 'resolved');
      }
      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        title: `Claim ${status}`,
        message: `Status of claim ${claimId} for "${targetClaim.itemTitle}" changed to "${status}".`,
        timestamp: 'Just now',
        read: false,
        type: 'claim',
        targetId: targetClaim.itemId
      };
      setNotifications(prev => [notif, ...prev]);
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        items,
        notifications,
        claims,
        matches,
        user,
        activeRole,
        toggleRole,
        addItem,
        updateItemStatus,
        submitClaim,
        updateClaimStatus,
        markNotificationRead,
        markAllNotificationsRead,
        unreadCount
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
