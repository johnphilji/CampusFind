export type UserRole = 'student' | 'admin' | 'security_staff';

export interface User {
  id: string;
  email: string;
  password_hash?: string;
  full_name: string;
  student_id: string;
  department?: string;
  role: UserRole;
  avatar_url?: string;
  phone_number?: string;
  created_at: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  studentId: string;
  role: UserRole;
}

export type ItemType = 'lost' | 'found';
export type ItemStatus = 'open' | 'claimed' | 'under_review' | 'resolved' | 'archived';

export interface ReportItem {
  id: string;
  reference_number: string;
  title: string;
  type: ItemType;
  category: string;
  location: string;
  report_date: string;
  description: string;
  image_url: string;
  status: ItemStatus;
  reporter_id: string;
  reporter_name?: string;
  reporter_department?: string;
  identifying_question?: string;
  created_at: string;
}

export type ClaimStatus =
  | 'Submitted'
  | 'Under Review'
  | 'More Information Required'
  | 'Approved'
  | 'Rejected'
  | 'Item Returned';

export interface Claim {
  id: string;
  claim_reference: string;
  report_id: string;
  claimant_id: string;
  claimant_name?: string;
  claimant_email?: string;
  claimant_student_id?: string;
  item_title?: string;
  item_location?: string;
  proof_details: string;
  status: ClaimStatus;
  admin_notes?: string;
  verified_by?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'match' | 'claim' | 'system' | 'report' | 'message';
  target_report_id?: string;
  is_read: boolean;
  created_at: string;
}
