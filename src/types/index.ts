export type ItemType = 'lost' | 'found';

export type ItemCategory =
  | 'Electronics'
  | 'ID Cards'
  | 'Keys'
  | 'Bags'
  | 'Books'
  | 'Earphones'
  | 'Bottles'
  | 'Clothing'
  | 'Accessories'
  | 'Other';

export type ItemStatus = 'open' | 'claimed' | 'under_review' | 'resolved';

export interface CampusItem {
  id: string;
  title: string;
  type: ItemType;
  category: ItemCategory;
  location: string;
  date: string;
  timeAgo: string;
  description: string;
  imageUrl: string;
  status: ItemStatus;
  reporterName: string;
  reporterDepartment?: string;
  referenceNumber: string;
  identifyingQuestion?: string;
  possibleMatchCount?: number;
}

export interface MatchSuggestion {
  id: string;
  lostItemId: string;
  foundItemId: string;
  similarityScore: number;
  reason: string;
  lostItem: CampusItem;
  foundItem: CampusItem;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'match' | 'claim' | 'system' | 'report' | 'message';
  targetId?: string;
}

export interface ClaimRecord {
  id: string;
  itemId: string;
  claimantName: string;
  claimantEmail: string;
  claimantId: string;
  proofDetails: string;
  status: 'Submitted' | 'Under Review' | 'More Information Required' | 'Approved' | 'Rejected' | 'Item Returned';
  submittedAt: string;
  itemTitle: string;
  itemType: ItemType;
  itemLocation: string;
  adminNotes?: string;
}
