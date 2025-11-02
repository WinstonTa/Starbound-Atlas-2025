/**
 * SHARED SCHEMAS - Happy Hour MVP
 * 
 * This file defines data structures used by:
 * - Backend Team (Firestore collections)
 * - Frontend Team (React Native app)
 * - AI Team (FastAPI output format)
 * 
 * Keep this file in sync across all teams!
 */

// ============================================
// AI TEAM OUTPUT FORMAT
// ============================================
// This matches what AI team's FastAPI returns
// See: ai/gemini_parser/models.py

export interface AIDealItem {
  /** Deal item extracted from menu (e.g., "Margarita", "$5") */
  name: string;
  /** Price as string (e.g., "$5", "50% off") */
  price: string;
  /** Optional description (e.g., "Classic lime margarita") */
  description?: string | null;
}

export interface AITimeWindow {
  /** Start time (e.g., "4:00 PM", "17:00") */
  start_time: string;
  /** End time (e.g., "7:00 PM", "19:00") */
  end_time: string;
  /** Days when deal is active (e.g., ["Monday", "Tuesday"]) or null */
  days?: string[] | null;
}

export interface AIMenuParsing {
  /** Restaurant/bar name from image, or null if not visible */
  restaurant_name?: string | null;
  /** List of deals extracted from menu */
  deals: AIDealItem[];
  /** Time windows when deal is available */
  time_frame: AITimeWindow[];
  /** Special conditions/restrictions (e.g., ["Dine-in only", "Max 2 per person"]) */
  special_conditions?: string[] | null;
}

// ============================================
// FIRESTORE DATA STRUCTURES
// ============================================
// These are stored in Firebase Firestore

export interface FirestoreDealItem {
  /** Item name (e.g., "Margarita") */
  name: string;
  /** Price (e.g., "$5", "50% off") */
  price: string;
  /** Optional description */
  description?: string | null;
}

export interface FirestoreTimeWindow {
  /** Start time in 24h format (e.g., "17:00") */
  startTime: string;
  /** End time in 24h format (e.g., "19:00") */
  endTime: string;
  /** Days when active (e.g., ["monday", "tuesday"]) */
  days: string[];
}

export interface FirestoreDeal {
  /** Auto-generated Firestore ID */
  id: string;
  
  /** Venue this deal belongs to */
  venueId: string;
  
  /** User who uploaded this deal */
  userId: string;
  
  /** URL to menu image in Firebase Storage */
  imageUrl: string;
  
  /** AI-extracted data from menu image */
  extractedData: {
    /** Restaurant name (from AI or manual entry) */
    restaurantName?: string | null;
    /** List of deal items */
    deals: FirestoreDealItem[];
    /** Time windows for deal */
    timeFrames: FirestoreTimeWindow[];
    /** Special conditions/restrictions */
    specialConditions?: string[] | null;
  };
  
  /** Is this deal verified? (community votes or business owner) */
  verified: boolean;
  
  /** Community voting counts */
  votes: {
    upvotes: number;
    downvotes: number;
    /** Map of userId -> vote type ("upvote" | "downvote") */
    userVotes?: Record<string, "upvote" | "downvote">;
  };
  
  /** Is deal currently active? */
  active: boolean;
  
  /** Timestamp when deal was created */
  createdAt: FirebaseFirestore.Timestamp;
  
  /** Timestamp when deal expires (optional) */
  expiresAt?: FirebaseFirestore.Timestamp | null;
  
  /** GeoPoint location of venue (for nearby queries) */
  location: FirebaseFirestore.GeoPoint;
  
  /** Restaurant name (for quick lookup, may differ from extractedData.restaurantName) */
  restaurantName?: string;
}

export interface FirestoreVenue {
  /** Auto-generated Firestore ID */
  id: string;
  
  /** Venue name */
  name: string;
  
  /** Street address */
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  
  /** Full address string for display */
  fullAddress: string;
  
  /** GeoPoint location (latitude, longitude) */
  location: FirebaseFirestore.GeoPoint;
  
  /** Latitude (for queries) */
  latitude: number;
  
  /** Longitude (for queries) */
  longitude: number;
  
  /** Business owner ID if venue is claimed */
  claimedBy?: string | null;
  
  /** Array of deal IDs for this venue */
  dealIds: string[];
  
  /** Hours of operation (optional) */
  hoursOfOperation?: string | null;
  
  /** Timestamp when venue was created */
  createdAt: FirebaseFirestore.Timestamp;
}

export interface FirestoreUser {
  /** User ID from Firebase Authentication */
  id: string;
  
  /** Username/display name */
  username: string;
  
  /** Email address */
  email?: string;
  
  /** Array of deal IDs user has uploaded */
  uploadedDealIds: string[];
  
  /** Array of deal IDs user has voted on */
  votedDealIds: string[];
  
  /** Timestamp when user account was created */
  createdAt: FirebaseFirestore.Timestamp;
}

export interface FirestoreBusiness {
  /** Auto-generated Firestore ID */
  id: string;
  
  /** Venue ID this business owns */
  venueId: string;
  
  /** Owner user ID */
  ownerId: string;
  
  /** Business name (may differ from venue name) */
  businessName: string;
  
  /** Array of deal IDs posted directly by business */
  directDealIds: string[];
  
  /** Timestamp when business account was created */
  createdAt: FirebaseFirestore.Timestamp;
}

// ============================================
// FRONTEND-BACKEND API CONTRACTS
// ============================================
// Cloud Functions that frontend will call

/**
 * Cloud Function: extractDealFromImage
 * 
 * Frontend calls this after uploading image to Storage.
 * This function:
 * 1. Takes imageUrl from Storage
 * 2. Calls AI team's FastAPI endpoint
 * 3. Saves extracted data to Firestore
 * 4. Returns structured deal data
 */
export interface ExtractDealFromImageInput {
  /** Firebase Storage URL of uploaded menu image */
  imageUrl: string;
  /** Optional: Venue ID if user knows which venue */
  venueId?: string | null;
  /** Optional: Restaurant name if user wants to override AI */
  restaurantName?: string | null;
  /** User's current location (for associating with nearby venue) */
  location?: {
    latitude: number;
    longitude: number;
  } | null;
}

export interface ExtractDealFromImageOutput {
  /** Whether extraction was successful */
  success: boolean;
  /** Created deal document (if successful) */
  deal?: FirestoreDeal;
  /** Error message (if failed) */
  error?: string;
  /** AI extraction result (for debugging) */
  aiResult?: AIMenuParsing;
}

/**
 * Cloud Function: voteOnDeal
 * 
 * Frontend calls this when user votes on a deal.
 */
export interface VoteOnDealInput {
  /** Deal ID to vote on */
  dealId: string;
  /** Vote type */
  voteType: "upvote" | "downvote";
}

export interface VoteOnDealOutput {
  /** Whether vote was successful */
  success: boolean;
  /** Updated vote counts */
  votes?: {
    upvotes: number;
    downvotes: number;
  };
  /** Error message (if failed) */
  error?: string;
}

/**
 * Cloud Function: verifyDeal
 * 
 * Frontend calls this when deal reaches verification threshold
 * or business owner confirms.
 */
export interface VerifyDealInput {
  /** Deal ID to verify */
  dealId: string;
  /** Verification method */
  method: "community" | "business_owner";
}

export interface VerifyDealOutput {
  /** Whether verification was successful */
  success: boolean;
  /** Error message (if failed) */
  error?: string;
}

// ============================================
// HELPER TYPES
// ============================================

/** Convert AI output format to Firestore format */
export function convertAIToFirestore(aiResult: AIMenuParsing): {
  deals: FirestoreDealItem[];
  timeFrames: FirestoreTimeWindow[];
  specialConditions?: string[] | null;
} {
  // Normalize days to lowercase for consistency
  const normalizeDays = (days?: string[] | null): string[] => {
    if (!days || days.length === 0) return [];
    return days.map(day => day.toLowerCase());
  };

  // Convert time format if needed (e.g., "4:00 PM" -> "16:00")
  const normalizeTime = (time: string): string => {
    // If already in 24h format, return as-is
    if (time.includes(":")) {
      const isPM = time.toUpperCase().includes("PM");
      const isAM = time.toUpperCase().includes("AM");
      
      if (isPM || isAM) {
        const [hours, minutes] = time.replace(/[APM]/gi, "").trim().split(":");
        let hour24 = parseInt(hours);
        if (isPM && hour24 !== 12) hour24 += 12;
        if (isAM && hour24 === 12) hour24 = 0;
        return `${hour24.toString().padStart(2, "0")}:${minutes || "00"}`;
      }
    }
    return time;
  };

  return {
    deals: aiResult.deals.map(deal => ({
      name: deal.name,
      price: deal.price,
      description: deal.description ?? null,
    })),
    timeFrames: aiResult.time_frame.map(tf => ({
      startTime: normalizeTime(tf.start_time),
      endTime: normalizeTime(tf.end_time),
      days: normalizeDays(tf.days),
    })),
    specialConditions: aiResult.special_conditions ?? null,
  };
}

