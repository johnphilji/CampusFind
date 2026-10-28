import React, { createContext, useContext, useState, useEffect } from 'react';
import { CampusItem, AppNotification, ClaimRecord, MatchSuggestion } from '../types';
import { INITIAL_ITEMS, INITIAL_NOTIFICATIONS, INITIAL_CLAIMS, INITIAL_MATCHES } from '../data/mockData';
import { api } from '../services/api';

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  studentId: string;
  department: string;
  role: 'student' | 'admin' | 'security_staff';
  avatar: string;
  phone?: string;
}

const DEFAULT_GUEST_USER: UserProfile = {
  name: '',
  email: '',
  studentId: '',
  department: '',
  role: 'student',
  avatar: '',
  phone: ''
};

interface AppContextType {
  items: CampusItem[];
  notifications: AppNotification[];
  claims: ClaimRecord[];
  matches: MatchSuggestion[];
  user: UserProfile;
  isAuthenticated: boolean;
  activeRole: 'student' | 'admin' | 'security_staff';
  login: (credentials: { email: string; password: string; rememberMe?: boolean }) => Promise<void>;
  register: (data: { fullName: string; email: string; password: string; studentId: string; department?: string; phone?: string; rememberMe?: boolean }) => Promise<void>;
  logout: () => void;
  addItem: (item: Omit<CampusItem, 'id' | 'referenceNumber' | 'status' | 'timeAgo'>) => Promise<CampusItem>;
  updateItemStatus: (id: string, status: CampusItem['status']) => void;
  submitClaim: (itemId: string, details: { name: string; email: string; studentId: string; proof: string }) => Promise<ClaimRecord>;
  updateClaimStatus: (claimId: string, status: ClaimRecord['status'], notes?: string) => Promise<void>;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  unreadCount: number;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    const hasToken = api.getToken();
    const saved = localStorage.getItem('cf_user') || sessionStorage.getItem('cf_user');
    if (hasToken && saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_GUEST_USER;
      }
    }
    return DEFAULT_GUEST_USER;
  });

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
  const [activeRole, setActiveRole] = useState<'student' | 'admin' | 'security_staff'>(
    user?.role || 'student'
  );

  const isAuthenticated = Boolean(api.getToken());

  // Load backend profile & data on mount if token exists
  const refreshData = async () => {
    try {
      if (api.getToken()) {
        const profileRes = await api.getProfile();
        if (profileRes?.user) {
          const profile: UserProfile = {
            id: profileRes.user.id,
            name: profileRes.user.fullName || profileRes.user.full_name,
            email: profileRes.user.email,
            studentId: profileRes.user.studentId || profileRes.user.student_id,
            department: profileRes.user.department || 'Campus Department',
            role: profileRes.user.role || 'student',
            avatar: profileRes.user.avatarUrl || profileRes.user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            phone: profileRes.user.phoneNumber || profileRes.user.phone_number
          };
          setUser(profile);
          setActiveRole(profile.role);
          localStorage.setItem('cf_user', JSON.stringify(profile));
        }
      }

      // Fetch reports from backend
      const repRes = await api.getReports();
      if (repRes?.data && repRes.data.length > 0) {
        const mappedItems: CampusItem[] = repRes.data.map((r: any) => ({
          id: r.id,
          referenceNumber: r.reference_number || r.referenceNumber,
          title: r.title,
          type: r.type,
          category: r.category,
          location: r.location,
          date: r.report_date || r.reportDate || 'Recent',
          timeAgo: 'Recently updated',
          description: r.description,
          imageUrl: r.image_url || r.imageUrl,
          status: r.status,
          identifyingQuestion: r.identifying_question || r.identifyingQuestion,
          reporterName: r.reporter_name || r.reporterName,
          reporterDepartment: r.reporter_department || r.reporterDepartment
        }));
        setItems(mappedItems);
        localStorage.setItem('cf_items', JSON.stringify(mappedItems));
      }

      // Fetch claims if authenticated
      if (api.getToken()) {
        const claimRes = await api.getClaims().catch(() => null);
        if (claimRes?.claims) {
          const mappedClaims: ClaimRecord[] = claimRes.claims.map((c: any) => ({
            id: c.claim_reference || c.id,
            itemId: c.report_id,
            claimantId: c.claimant_id || 'user-1',
            claimantName: c.claimant_name || 'Student',
            claimantEmail: c.claimant_email || 'student@college.edu',
            claimantPhone: c.claimant_phone,
            itemTitle: c.item_title || 'Campus Item',
            itemType: c.item_type || 'found',
            itemLocation: c.item_location || 'Campus',
            itemCategory: c.item_category,
            itemImageUrl: c.item_image_url,
            itemReferenceNumber: c.item_reference_number,
            itemDescription: c.item_description,
            reportStatus: c.report_status,
            submittedAt: new Date(c.created_at).toLocaleDateString(),
            status: c.status,
            proofDetails: c.proof_details,
            adminNotes: c.admin_notes
          }));
          setClaims(mappedClaims);
          localStorage.setItem('cf_claims', JSON.stringify(mappedClaims));
        }

        // Fetch notifications from backend
        const notifRes = await api.getNotifications().catch(() => null);
        if (notifRes?.notifications && notifRes.notifications.length > 0) {
          const mappedNotifs: AppNotification[] = notifRes.notifications.map((n: any) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            timestamp: new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            read: n.read,
            type: (['match', 'claim', 'system', 'report', 'message'].includes(n.type) ? n.type : 'system') as any,
            targetId: n.reportId
          }));
          setNotifications(mappedNotifs);
          localStorage.setItem('cf_notifications', JSON.stringify(mappedNotifs));
        }
      }
    } catch (err) {
      console.warn('Backend sync warning (using cached data):', err);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const login = async (credentials: { email: string; password: string; rememberMe?: boolean }) => {
    const remember = credentials.rememberMe !== false;
    const res = await api.login({ email: credentials.email, password: credentials.password });
    api.setToken(res.token, remember);
    const profile: UserProfile = {
      id: res.user.id,
      name: res.user.fullName || res.user.full_name,
      email: res.user.email,
      studentId: res.user.studentId || res.user.student_id,
      department: res.user.department || 'Campus Department',
      role: res.user.role || 'student',
      avatar: res.user.avatarUrl || res.user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      phone: res.user.phoneNumber || res.user.phone_number
    };
    setUser(profile);
    setActiveRole(profile.role);
    if (remember) {
      localStorage.setItem('cf_user', JSON.stringify(profile));
      sessionStorage.removeItem('cf_user');
    } else {
      sessionStorage.setItem('cf_user', JSON.stringify(profile));
      localStorage.removeItem('cf_user');
    }
    await refreshData();
  };

  const register = async (data: { fullName: string; email: string; password: string; studentId: string; department?: string; phone?: string; rememberMe?: boolean }) => {
    const remember = data.rememberMe !== false;
    const res = await api.register({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      studentId: data.studentId,
      department: data.department,
      phone: data.phone
    });
    api.setToken(res.token, remember);
    const profile: UserProfile = {
      id: res.user.id,
      name: res.user.fullName || res.user.full_name,
      email: res.user.email,
      studentId: res.user.studentId || res.user.student_id,
      department: res.user.department || 'Campus Department',
      role: res.user.role || 'student',
      avatar: res.user.avatarUrl || res.user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      phone: res.user.phoneNumber || res.user.phone_number
    };
    setUser(profile);
    setActiveRole(profile.role);
    if (remember) {
      localStorage.setItem('cf_user', JSON.stringify(profile));
      sessionStorage.removeItem('cf_user');
    } else {
      sessionStorage.setItem('cf_user', JSON.stringify(profile));
      localStorage.removeItem('cf_user');
    }
    await refreshData();
  };

  const logout = () => {
    api.removeToken();
    localStorage.removeItem('cf_user');
    sessionStorage.removeItem('cf_user');
    setUser(DEFAULT_GUEST_USER);
    setActiveRole('student');
  };

  const addItem = async (newItemData: Omit<CampusItem, 'id' | 'referenceNumber' | 'status' | 'timeAgo'>): Promise<CampusItem> => {
    let createdItem: CampusItem;

    try {
      if (api.getToken()) {
        const res = await api.createReport({
          title: newItemData.title,
          type: newItemData.type,
          category: newItemData.category,
          location: newItemData.location,
          reportDate: newItemData.date || new Date().toISOString().split('T')[0],
          description: newItemData.description,
          imageUrl: newItemData.imageUrl,
          identifyingQuestion: newItemData.identifyingQuestion
        });

        const r = res.report;
        createdItem = {
          id: r.id,
          referenceNumber: r.reference_number,
          title: r.title,
          type: r.type,
          category: r.category,
          location: r.location,
          date: r.report_date,
          timeAgo: 'Just now',
          description: r.description,
          imageUrl: r.image_url,
          status: r.status,
          identifyingQuestion: r.identifying_question,
          reporterName: user?.name,
          reporterDepartment: user?.department
        };
      } else {
        throw new Error('Not logged in');
      }
    } catch {
      // Local fallback
      const refNum = `CF-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      createdItem = {
        ...newItemData,
        id: `item-${Date.now()}`,
        referenceNumber: refNum,
        status: 'open',
        timeAgo: 'Just now'
      };
    }

    setItems(prev => [createdItem, ...prev]);

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: `${createdItem.type === 'lost' ? 'Lost' : 'Found'} Item Registered`,
      message: `Your report for "${createdItem.title}" has been published with ID ${createdItem.referenceNumber}.`,
      timestamp: 'Just now',
      read: false,
      type: 'report',
      targetId: createdItem.id
    };
    setNotifications(prev => [notif, ...prev]);

    return createdItem;
  };

  const updateItemStatus = (id: string, status: CampusItem['status']) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, status } : item));
  };

  const submitClaim = async (itemId: string, details: { name: string; email: string; studentId: string; proof: string }): Promise<ClaimRecord> => {
    const targetItem = items.find(i => i.id === itemId);
    let newClaim: ClaimRecord;

    try {
      if (api.getToken()) {
        const res = await api.submitClaim(itemId, details.proof);
        const c = res.claim;
        newClaim = {
          id: c.claim_reference || c.id,
          itemId,
          claimantId: c.claimant_id || user.id || 'claimant-1',
          claimantName: details.name,
          claimantEmail: details.email,
          itemTitle: targetItem ? targetItem.title : 'Campus Item',
          itemType: targetItem ? targetItem.type : 'found',
          itemLocation: targetItem ? targetItem.location : 'Campus',
          submittedAt: new Date().toLocaleDateString(),
          status: 'Submitted',
          proofDetails: details.proof
        };
      } else {
        throw new Error('Not authenticated');
      }
    } catch (err: any) {
      if (err.message && err.message.includes('already have an active claim')) {
        throw err;
      }
      const claimRef = `CLM-${Math.floor(1000 + Math.random() * 9000)}`;
      newClaim = {
        id: claimRef,
        itemId,
        claimantId: user.id || 'claimant-1',
        claimantName: details.name,
        claimantEmail: details.email,
        itemTitle: targetItem ? targetItem.title : 'Campus Item',
        itemType: targetItem ? targetItem.type : 'found',
        itemLocation: targetItem ? targetItem.location : 'Campus',
        submittedAt: new Date().toLocaleDateString(),
        status: 'Submitted',
        proofDetails: details.proof
      };
    }

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

  const updateClaimStatus = async (claimId: string, status: ClaimRecord['status'], notes?: string): Promise<void> => {
    try {
      if (api.getToken()) {
        await api.reviewClaim(claimId, status, notes);
      }
    } catch (err) {
      console.warn('API review claim fallback:', err);
    }

    setClaims(prev => prev.map(c => {
      if (c.id === claimId) {
        return { ...c, status, adminNotes: notes || c.adminNotes };
      }
      return c;
    }));

    const targetClaim = claims.find(c => c.id === claimId);
    if (targetClaim) {
      if (status === 'Approved' || status === 'Item Returned') {
        updateItemStatus(targetClaim.itemId, status === 'Item Returned' ? 'resolved' : 'claimed');
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
    if (api.getToken()) {
      api.markNotificationRead(id).catch(() => null);
    }
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    if (api.getToken()) {
      api.markAllNotificationsRead().catch(() => null);
    }
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
        isAuthenticated,
        activeRole,
        login,
        register,
        logout,
        addItem,
        updateItemStatus,
        submitClaim,
        updateClaimStatus,
        markNotificationRead,
        markAllNotificationsRead,
        unreadCount,
        refreshData
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
