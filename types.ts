export enum UserRole {
  BIDDER = 'BIDDER',
  BUYER = 'BUYER',
  ADMIN = 'ADMIN',
}

export interface Review {
  id: string;
  orderId: string;
  reviewerId: number;
  reviewerUsername: string;
  revieweeId: number;
  rating: number; // 1-5
  comment?: string;
  timestamp: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  reviews: Review[];
  // Optional profile fields
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

export interface Bid {
  id: number;
  userId: number;
  username: string;
  maxBid: number; // User's maximum bid (for proxy bidding)
  timestamp: string;
}

export enum Condition {
  NEW = 'NEW',
  USED = 'USED',
}

export enum ListingType {
  AUCTION = 'AUCTION',
  FIXED_PRICE = 'FIXED_PRICE',
}

export interface Product {
  id: string;
  title: string;
  description: string;
  seller: string;
  imageUrl: string;
  category: string;
  condition: Condition;
  location: string;
  listingType: ListingType;
  startingPrice: number;
  currentPrice: number;
  buyNowPrice?: number;
  endDate: string;
  bids: Bid[];
  userId: number;
  isWatched?: boolean; // For UI state
}

export enum NotificationType {
    OUTBID = 'OUTBID',
    WON = 'WON',
    ENDING_SOON = 'ENDING_SOON',
    NEW_MESSAGE = 'NEW_MESSAGE',
}

export interface Notification {
    id: string;
    userId: number;
    type: NotificationType;
    message: string;
    relatedId: string; // productId or conversationId
    title: string;
    isRead: boolean;
    timestamp: string;
}

export enum OrderStatus {
  COMPLETED = 'COMPLETED',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  SHIPPED = 'SHIPPED',
  DISPUTED = 'DISPUTED',
}

export interface Order {
  id: string;
  productId: string;
  productTitle: string;
  sellerId: number;
  buyerId: number;
  finalPrice: number;
  purchaseDate: string;
  status: OrderStatus;
  reviewLeftByBuyer: boolean;
  reviewLeftBySeller: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Message {
  id: string;
  senderId: number;
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  participantIds: number[];
  participantUsernames: { [key: number]: string };
  lastMessage: Message;
  productId: string;
  productTitle: string;
}

export enum DisputeStatus {
    OPEN = 'OPEN',
    UNDER_REVIEW = 'UNDER_REVIEW',
    RESOLVED = 'RESOLVED',
}

export interface Dispute {
    id: string;
    orderId: string;
    productTitle: string;
    userId: number; // The user who filed the dispute
    reason: string;
    status: DisputeStatus;
    createdAt: string;
}