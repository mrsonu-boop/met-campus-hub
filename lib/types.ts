export type Branch = "Computer" | "IT" | "AIDS" | "Mechanical" | "Civil";

export type Year = "FE" | "SE" | "TE" | "BE";

export type GearCategory =
  | "Textbooks"
  | "Calculators"
  | "Drawing Drafters"
  | "Lab Coats";

export type ListingType = "rent" | "sale" | "donate";

export type GearCondition = "Like New" | "Good" | "Fair";

export type VerificationTier = "teacher" | "topper";

export type TransactionStatus = "awaiting-handoff" | "verified" | "disputed";

export type TabId = "gear" | "vault" | "exchange";

export interface GearListing {
  id: string;
  title: string;
  subtitle: string;
  category: GearCategory;
  listingType: ListingType;
  /** null renders as the FREE / donation badge */
  price: number | null;
  priceUnit?: "semester" | "one-time";
  condition: GearCondition;
  seller: string;
  branch: Branch;
  year: Year;
  spot: string;
  phone: string;
  postedAgo: string;
  featured?: boolean;
  verified?: boolean;
}

export interface NoteUnit {
  id: string;
  unit: string;
  topics: string[];
  pages: number;
  fileSize: string;
  upvotes: number;
  verifiedBy: string;
  verification: VerificationTier;
  updatedOn: string;
}

export interface NoteSet {
  id: string;
  subject: string;
  courseCode: string;
  branch: Branch;
  semester: string;
  accent: "emerald" | "indigo" | "amber" | "sky" | "rose" | "violet";
  description: string;
  downloads: number;
  units: NoteUnit[];
}

export interface ExchangeTransaction {
  id: string;
  item: string;
  itemCategory: GearCategory;
  listingType: ListingType;
  amount: string;
  counterparty: string;
  counterpartyRole: string;
  branch: Branch;
  year: Year;
  meetSpot: string;
  slot: string;
  status: TransactionStatus;
  /** 4-digit handoff PIN the counterparty must read out */
  pin: string;
  agreedTerms: string;
}

export interface NewListingDraft {
  title: string;
  category: GearCategory;
  listingType: ListingType;
  price: string;
  condition: GearCondition;
  spot: string;
  phone: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}
