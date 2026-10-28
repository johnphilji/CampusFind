export type ItemType = 'lost' | 'found';

export type ItemCategory =
  | 'Electronics'
  | 'ID Cards'
  | 'Keys'
  | 'Wallets & Money'
  | 'Bags & Backpacks'
  | 'Books & Notes'
  | 'Headphones & Audio'
  | 'Water Bottles'
  | 'Apparel & Clothing'
  | 'Eyewear & Accessories'
  | 'Medical & Personal Care'
  | 'Other';

export type SecurityLevel = 'standard' | 'valuable_secure' | 'hazardous_restricted' | 'perishable';

export type VerificationMethod =
  | 'Serial / IMEI Number'
  | 'Photo ID Match'
  | 'Device Passcode / Unlock'
  | 'Unique Markings'
  | 'Purchase Receipt'
  | 'Witness Attestation';

export type CustodyLocation = 
  | 'Campus Security HQ (Central Safe)'
  | 'Central Library Desk'
  | 'Student Center Information Counter'
  | 'Sports Complex Reception'
  | 'Departmental Front Desk'
  | 'Hostel Warden Office';

export type ItemStatus = 'open' | 'claimed' | 'under_review' | 'resolved' | 'disposed' | 'police_custody';

export interface CampusItem {
  id: string;
  title: string;
  type: ItemType;
  category: ItemCategory;
  location: string;
  custodyLocation?: CustodyLocation;
  securityLevel?: SecurityLevel;
  date: string;
  reportedTime?: string;
  timeAgo: string;
  description: string;
  imageUrl: string;
  status: ItemStatus;
  reporterName: string;
  reporterEmail?: string;
  reporterId?: string;
  reporterDepartment?: string;
  referenceNumber: string;
  identifyingQuestion?: string;
  possibleMatchCount?: number;
  retentionExpiresAt?: string;
  daysRetained?: number;
  isHighValue?: boolean;
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
  claimantPhone?: string;
  proofDetails: string;
  status: 'Submitted' | 'Under Review' | 'More Information Required' | 'Approved' | 'Rejected' | 'Item Returned';
  submittedAt: string;
  itemTitle: string;
  itemType: ItemType;
  itemLocation: string;
  itemCategory?: ItemCategory;
  itemImageUrl?: string;
  itemReferenceNumber?: string;
  itemDescription?: string;
  reportStatus?: ItemStatus;
  adminNotes?: string;
  verificationMethod?: 'Serial / IMEI Number' | 'Photo ID Match' | 'Device Passcode / Unlock' | 'Unique Markings';
}

