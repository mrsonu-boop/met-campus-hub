"use client";

import React, { useState, useEffect } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  Search,
  MessageCircle,
  Phone,
  MapPin,
  Sparkles,
  PlusCircle,
  GraduationCap,
  X,
  Send,
  CreditCard,
  Flag,
  UserCheck,
  Building2,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ImageIcon,
  Upload,
  Tag,
  Utensils,
  BookOpen,
  Wrench,
  Handshake,
  Info,
  ChevronDown
} from "lucide-react";

let browserSupabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  if (!browserSupabase) {
    browserSupabase = createClient(url, anonKey);
  }
  return browserSupabase;
}

type ListingType = "Rent" | "Sale" | "Free";

interface Listing {
  id: string;
  title: string;
  category: string;
  department: string;
  year: "FE" | "SE" | "TE" | "BE";
  condition: string;
  price: number;
  originalPrice: number;
  sellerName: string;
  phoneNumber: string;
  location: string;
  timeAgo: string;
  image: string;
  listingType: ListingType;
  status?: "Available" | "Exchanged";
}

const LISTING_TYPE_BADGE: Record<ListingType, string> = {
  Rent: "FOR RENT",
  Sale: "FOR SALE",
  Free: "FREE"
};

const SAMPLE_LISTINGS: Listing[] = [
  {
    id: "1",
    title: "Casio fx-991EX ClassWiz Scientific Calculator",
    category: "Calculators",
    department: "Computer",
    year: "SE",
    condition: "Like New",
    price: 950,
    originalPrice: 1595,
    sellerName: "Prathmesh Thorwat",
    phoneNumber: "+91 98765 43210",
    location: "Main Canteen / Library",
    timeAgo: "2 hours ago",
    image: "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600&auto=format&fit=crop&q=80",
    listingType: "Sale"
  },
  {
    id: "2",
    title: "Engineering Graphics Drafter & A1 Sheet Holder",
    category: "Lab Kits & Drafters",
    department: "Mechanical",
    year: "FE",
    condition: "Good",
    price: 450,
    originalPrice: 1100,
    sellerName: "Aman Sharma",
    phoneNumber: "+91 98123 45678",
    location: "Workshop / Ground",
    timeAgo: "5 hours ago",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80",
    listingType: "Rent"
  },
  {
    id: "3",
    title: "SPPU Semester 3 Computer Engg Textbooks (Set of 4)",
    category: "SPPU Textbooks",
    department: "Computer",
    year: "SE",
    condition: "Lightly Used",
    price: 600,
    originalPrice: 1400,
    sellerName: "Neha Patil",
    phoneNumber: "+91 97654 32109",
    location: "Library Reading Room",
    timeAgo: "1 day ago",
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80",
    listingType: "Sale"
  },
  {
    id: "4",
    title: "Official MET Engineering Apron / Lab Coat (Size L)",
    category: "Lab Kits & Drafters",
    department: "Civil",
    year: "FE",
    condition: "Excellent",
    price: 200,
    originalPrice: 500,
    sellerName: "Rohan Kulkarni",
    phoneNumber: "+91 99887 76655",
    location: "Main Gate / Canteen",
    timeAgo: "1 day ago",
    image: "https://images.unsplash.com/photo-1584697964409-373307611a51?w=600&auto=format&fit=crop&q=80",
    listingType: "Free"
  }
];

const DEPARTMENTS = ["All Branches", "Computer", "Mechanical", "E&TC", "Civil", "AIDS"];
const YEARS = ["All Years", "FE", "SE", "TE", "BE"];
const CATEGORIES = ["All Gear", "Calculators", "Lab Kits & Drafters", "SPPU Textbooks", "Electronics & Microcontrollers", "Hostel Gear"];

const DRAWER_CATEGORIES = [
  { emoji: "📐", label: "Lab Kits & Drafters", value: "Lab Kits & Drafters" },
  { emoji: "🔢", label: "Scientific Calculators", value: "Calculators" },
  { emoji: "📚", label: "SPPU Textbooks & Notes", value: "SPPU Textbooks" },
  { emoji: "💻", label: "Electronics & Microcontrollers", value: "Electronics & Microcontrollers" },
  { emoji: "🏠", label: "Hostel Gear", value: "Hostel Gear" }
];

const DRAWER_LISTING_TYPES = [
  { emoji: "🏷️", label: "Rent", value: "Rent" as ListingType },
  { emoji: "💰", label: "Sale", value: "Sale" as ListingType },
  { emoji: "🎁", label: "Free / Giveaways", value: "Free" as ListingType }
];

const DRAWER_DEPARTMENTS = [
  { label: "FE", kind: "year" as const, value: "FE" },
  { label: "Computer", kind: "branch" as const, value: "Computer" },
  { label: "Mechanical", kind: "branch" as const, value: "Mechanical" },
  { label: "E&TC", kind: "branch" as const, value: "E&TC" },
  { label: "Civil", kind: "branch" as const, value: "Civil" },
  { label: "AI & Data Science (AIDS)", kind: "branch" as const, value: "AIDS" }
];

const REPORT_REASONS = [
  "Incorrect Price / Scam",
  "Item Already Sold",
  "Invalid PRN / Non-MET Student",
  "Inappropriate Content / Spam"
];

const TERMS_HIGHLIGHTS = [
  {
    title: "Student Identity",
    desc: "Strictly for MET BKC students. Verified PRN & phone numbers required for listings."
  },
  {
    title: "Damaged Item Policy",
    desc: "Borrowers/renters are liable up to 80% replacement cost for gear damaged during usage."
  },
  {
    title: "Lost Item Policy",
    desc: "Borrowers/renters must reimburse 100% replacement cost to the owner if gear is lost."
  },
  {
    title: "Safe Campus Handoffs",
    desc: "All physical transactions must occur at designated campus zones (Main Canteen, Central Library, Workshop, Main Gate Plaza)."
  },
  {
    title: "Platform Guarantee",
    desc: "0% brokerage, direct peer-to-peer handoffs with zero hidden platform fees."
  }
];

const HANDOFF_ZONES = [
  {
    name: "Main Canteen & Food Court Zone",
    desc: "High-footfall, well-lit spot for quick calculator, textbook and kit exchanges between lectures.",
    icon: Utensils
  },
  {
    name: "Central Library Reading Room Hall",
    desc: "Calm, CCTV-monitored indoor area ideal for inspecting SPPU textbook sets and drafting gear.",
    icon: BookOpen
  },
  {
    name: "Mechanical / Civil Workshop Courtyard",
    desc: "Open-air yard best suited for bulky lab kits, drafters, aprons and workshop equipment.",
    icon: Wrench
  },
  {
    name: "Campus Main Gate Security & Administrative Plaza",
    desc: "Guarded entry plaza for verified handoffs during college hours, right beside campus security.",
    icon: ShieldCheck
  }
];

const RECENT_EXCHANGES = [
  { item: "Casio FX-991CW Calculator", spot: "Exchanged at Main Canteen", time: "15 mins ago" },
  { item: "Engineering Graphics Drafter", spot: "Exchanged at Workshop Courtyard", time: "48 mins ago" },
  { item: "SPPU M-1 Textbook Set", spot: "Exchanged at Central Library", time: "2 hours ago" }
];

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Search & Filter",
    desc: "Find drafters, calculators and textbooks by department and academic year.",
    icon: Search
  },
  {
    step: "2",
    title: "Reserve & Chat",
    desc: "Connect directly on WhatsApp or reserve the item with a small token deposit.",
    icon: MessageCircle
  },
  {
    step: "3",
    title: "Campus Handoff",
    desc: "Meet at verified MET BKC spots: Main Canteen, Central Library or Ground.",
    icon: MapPin
  }
];

const RECENT_HANDOFFS = [
  { item: "Casio FX-991CW Calculator", spot: "Main Canteen", time: "10 mins ago" },
  { item: "Engineering Drawing Kit", spot: "Mechanical Workshop", time: "1 hour ago" },
  { item: "SPPU M-1 & M-2 Textbooks", spot: "Central Library", time: "Yesterday" }
];

export default function METCampusHubFullPage() {
  const [selectedBranch, setSelectedBranch] = useState("All Branches");
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [selectedCategory, setSelectedCategory] = useState("All Gear");
  const [searchQuery, setSearchQuery] = useState("");

  const [view, setView] = useState<"none" | "login" | "register" | "forgot">("none");
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    prn: string;
    email: string;
    branch: string;
    phone: string;
    year?: string;
  } | null>(null);

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [authWarning, setAuthWarning] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [regName, setRegName] = useState("");
  const [regPrn, setRegPrn] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regBranch, setRegBranch] = useState(DEPARTMENTS[1]);
  const [regYear, setRegYear] = useState("FE");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regError, setRegError] = useState("");

  const [forgotInput, setForgotInput] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState("");

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isAiVaultOpen, setIsAiVaultOpen] = useState(false);
  const [reportingItem, setReportingItem] = useState<Listing | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportItemTitle, setReportItemTitle] = useState("");
  const [reportSellerName, setReportSellerName] = useState("");
  const [reportFeedback, setReportFeedback] = useState("");
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [selectedListingType, setSelectedListingType] = useState<"All" | ListingType>("All");
  const [showTermsOnArrival, setShowTermsOnArrival] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [reserveItem, setReserveItem] = useState<Listing | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [listings, setListings] = useState<Listing[]>(SAMPLE_LISTINGS);

  const [postTitle, setPostTitle] = useState("");
  const [postPrice, setPostPrice] = useState("");
  const [postSeller, setPostSeller] = useState("");
  const [postPhone, setPostPhone] = useState("");
  const [postCategory, setPostCategory] = useState(CATEGORIES[1]);
  const [postDepartment, setPostDepartment] = useState(DEPARTMENTS[1]);
  const [postYear, setPostYear] = useState<"FE" | "SE" | "TE" | "BE">("FE");
  const [postType, setPostType] = useState<ListingType>("Sale");
  const [postImage, setPostImage] = useState("");
  const [postImageUrl, setPostImageUrl] = useState("");

  const [aiQuery, setAiQuery] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiChatHistory, setAiChatHistory] = useState<{ sender: "ai" | "user"; text: string }[]>([
    { sender: "ai", text: "Welcome to SPPU AI Study Vault! Ask me anything regarding SPPU syllabus notes, past papers, or unit summaries." }
  ]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("met_current_user");
      if (saved) setCurrentUser(JSON.parse(saved));
    } catch {
      // ignore malformed session data
    }
  }, []);

  useEffect(() => {
    // The Terms & Conditions popup is shown on every page load/refresh.
    setShowTermsOnArrival(true);
  }, []);

  const acceptTerms = () => {
    if (!termsAgreed) return;
    setShowTermsOnArrival(false);
    setIsTermsOpen(false);
    setTermsAgreed(false);
    showToast("Welcome to MET Campus Hub. Terms accepted.");
  };

  const openTerms = () => {
    setTermsAgreed(false);
    setShowTermsOnArrival(false);
    setIsTermsOpen(true);
  };

  const closeCategories = () => setIsCategoriesOpen(false);

  const applyDrawerCategory = (category: string) => {
    setSelectedCategory(category);
    closeCategories();
  };

  const applyDrawerListingType = (type: ListingType) => {
    setSelectedListingType(type);
    closeCategories();
  };

  const applyDrawerDepartment = (kind: "year" | "branch", value: string) => {
    if (kind === "year") {
      setSelectedYear(value);
    } else {
      setSelectedBranch(value);
    }
    closeCategories();
  };

  const goToHandoffZones = () => {
    closeCategories();
    window.setTimeout(() => {
      document.getElementById("handoff-zones")?.scrollIntoView({ behavior: "smooth" });
    }, 250);
  };

  const openLostAndFound = () => {
    closeCategories();
    showToast("Lost & Found Vault is coming soon to MET Campus Hub.");
  };

  const openAiVaultFromDrawer = () => {
    closeCategories();
    setIsAiVaultOpen(true);
  };

  const openTermsFromDrawer = () => {
    closeCategories();
    openTerms();
  };

  const openProfileModal = () => {
    setIsProfileMenuOpen(false);
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
    setIsProfileMenuOpen(false);
  };

  const toggleListingStatus = (id: string) => {
    setListings((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: (item.status ?? "Available") === "Available" ? "Exchanged" : "Available"
            }
          : item
      )
    );
  };

  const profileFeatureToast = (label: string) => {
    setIsProfileMenuOpen(false);
    showToast(`${label} is coming soon to MET Campus Hub.`);
  };

  const persistUser = (user: { name: string; prn: string; email: string; branch: string; phone: string; year?: string }) => {
    setCurrentUser(user);
    try {
      window.localStorage.setItem("met_current_user", JSON.stringify(user));
    } catch {
      // storage unavailable; session stays in-memory only
    }
    setView("none");
    setAuthWarning("");
    showToast(`Welcome, ${user.name}!`);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = loginId.trim();
    if (!id) {
      setLoginError("Please enter your PRN number or campus email.");
      return;
    }
    if (loginPassword.length < 1) {
      setLoginError("Please enter your password.");
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setLoginError(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
      return;
    }

    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: id,
        password: loginPassword
      });

      if (error || !data.session) {
        setLoginError("Invalid email/PRN or password. Please try again.");
        return;
      }

      const meta = (data.user?.user_metadata ?? {}) as {
        name?: string;
        prn?: string;
        branch?: string;
        phone?: string;
        year?: string;
      };
      persistUser({
        name: meta.name || data.user?.email?.split("@")[0] || "MET Student",
        prn: meta.prn || "",
        email: data.user?.email || id,
        branch: meta.branch || "MET BKC",
        phone: meta.phone || "",
        year: meta.year || ""
      });
      setLoginError("");
      setLoginId("");
      setLoginPassword("");
    } catch {
      setLoginError("Invalid email/PRN or password. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPrn.replace(/\D/g, "").length < 6) {
      setRegError("Enter a valid PRN (at least 6 digits).");
      return;
    }
    if (!regEmail.includes("@") || !regEmail.includes(".")) {
      setRegError("Enter a valid campus or personal email address.");
      return;
    }
    if (regPassword.length < 6) {
      setRegError("Password must be at least 6 characters.");
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setRegError(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
      return;
    }

    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: regEmail.trim(),
        password: regPassword,
        options: {
          data: {
            name: regName.trim(),
            prn: regPrn.trim(),
            branch: regBranch,
            phone: regPhone.trim(),
            year: regYear
          }
        }
      });

      if (error) {
        setRegError(error.message);
        return;
      }

      setRegError("");
      setRegName("");
      setRegPrn("");
      setRegEmail("");
      setRegPhone("");
      setRegPassword("");

      if (data.session) {
        persistUser({
          name: regName.trim() || "MET Student",
          prn: regPrn.trim(),
          email: regEmail.trim(),
          branch: regBranch,
          phone: regPhone.trim(),
          year: regYear
        });
      } else {
        showToast("Account created. Please check your email to confirm, then log in.");
        setView("login");
      }
    } catch (err) {
      setRegError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = forgotInput.trim();
    if (!email) return;

    const supabase = getSupabaseClient();
    if (!supabase) {
      setForgotError(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
      return;
    }

    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        setForgotError(error.message);
        return;
      }

      setForgotError("");
      setForgotSent(true);
    } catch (err) {
      setForgotError(
        err instanceof Error ? err.message : "Could not send reset link. Please try again."
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const closeAuth = () => {
    setView("none");
    setLoginError("");
    setRegError("");
    setForgotSent(false);
    setForgotInput("");
    setForgotError("");
    setAuthWarning("");
  };

  const openPostModal = () => {
    if (!currentUser) {
      setAuthWarning("Please log in with your MET PRN or email to list academic gear.");
      setView("login");
      return;
    }
    setPostSeller(currentUser.name);
    if (currentUser.phone) setPostPhone(currentUser.phone);
    setIsPostModalOpen(true);
  };

  const openReportModal = (item?: Listing) => {
    setReportingItem(item ?? null);
    setReportItemTitle(item?.title ?? "");
    setReportSellerName(item?.sellerName ?? "");
    setReportReason("");
    setReportFeedback("");
    setIsReportModalOpen(true);
  };

  const closeReportModal = () => {
    setIsReportModalOpen(false);
    setReportingItem(null);
    setReportItemTitle("");
    setReportSellerName("");
    setReportReason("");
    setReportFeedback("");
  };

  const signOut = () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      void supabase.auth.signOut();
    }
    setCurrentUser(null);
    try {
      window.localStorage.removeItem("met_current_user");
    } catch {
      // ignore
    }
    showToast("Signed out of MET Campus Hub.");
  };

  const tokenAmountFor = (item: Listing) => (item.price <= 500 ? 50 : 100);

  const priceLabelFor = (item: Listing) =>
    item.listingType === "Free" ? "Free" : `₹${item.price}`;

  const whatsappLinkFor = (item: Listing) => {
    const text =
      `Hi ${item.sellerName}, I am interested in your ${item.title} ` +
      `(${item.listingType}, ${priceLabelFor(item)}) listed on MET Campus Hub. ` +
      `Is it still available for campus handoff at MET BKC?`;
    return `https://wa.me/${item.phoneNumber.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
  };

  const resetPostForm = () => {
    setPostTitle("");
    setPostPrice("");
    setPostSeller("");
    setPostPhone("");
    setPostCategory(CATEGORIES[1]);
    setPostDepartment(DEPARTMENTS[1]);
    setPostYear("FE");
    setPostType("Sale");
    setPostImage("");
    setPostImageUrl("");
  };

  const handlePostImageFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPostImage(typeof reader.result === "string" ? reader.result : "");
      setPostImageUrl("");
    };
    reader.readAsDataURL(file);
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalImage = postImage || postImageUrl.trim();
    const newListing: Listing = {
      id: `local-${Date.now()}`,
      title: postTitle.trim() || "Untitled Campus Item",
      category: postCategory,
      department: currentUser?.branch && currentUser.branch !== "MET BKC" ? currentUser.branch : postDepartment,
      year: postYear,
      condition: "Good",
      price: postType === "Free" ? 0 : Math.max(0, Number(postPrice) || 0),
      originalPrice: postType === "Free" ? 0 : Math.max(0, Math.round((Number(postPrice) || 0) * 1.8)),
      sellerName: currentUser?.name || postSeller.trim() || "MET Student",
      phoneNumber: currentUser?.phone || postPhone.trim() || "+91 90000 00000",
      location: "Main Canteen / Library",
      timeAgo: "Just now",
      image: finalImage,
      listingType: postType,
      status: "Available"
    };
    setListings((prev) => [newListing, ...prev]);
    setIsPostModalOpen(false);
    resetPostForm();
    showToast("Listing created successfully.");
  };

  const loadRazorpay = () =>
    new Promise<boolean>((resolve) => {
      if (typeof window === "undefined") return resolve(false);
      if ((window as unknown as { Razorpay?: unknown }).Razorpay) return resolve(true);

      const existing = document.getElementById("razorpay-checkout-js") as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener("load", () => resolve(true));
        existing.addEventListener("error", () => resolve(false));
        return;
      }

      const script = document.createElement("script");
      script.id = "razorpay-checkout-js";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleRazorpayPayment = async (item: Listing) => {
    const tokenAmount = tokenAmountFor(item);
    const ready = await loadRazorpay();

    if (!ready || !(window as unknown as { Razorpay?: unknown }).Razorpay) {
      setReserveItem(item);
      return;
    }

    let order: { id: string; amount: number; currency: string };
    try {
      const res = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ amount: tokenAmount, itemTitle: item.title })
      });
      if (!res.ok) throw new Error("order creation failed");
      order = (await res.json()) as { id: string; amount: number; currency: string };
      if (!order?.id) throw new Error("missing order id");
    } catch {
      setReserveItem(item);
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      order_id: order.id,
      name: "MET Campus Hub",
      description: "Item Reservation Deposit",
      image: "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=100&auto=format&fit=crop&q=80",
      handler: function (response: { razorpay_payment_id?: string; razorpay_order_id?: string }) {
        setReserveItem(null);
        showToast(
          `Reservation confirmed. Token ₹${tokenAmount} paid. Payment ID: ${response.razorpay_payment_id ?? "N/A"}`
        );
      },
      prefill: {
        name: "Student Buyer",
        email: "student@met.edu",
        contact: "9876543210"
      },
      theme: {
        color: "#059669"
      }
    };
    const rzp = new ((window as unknown as { Razorpay: new (opts: unknown) => { open: () => void } }).Razorpay)(options);
    rzp.open();
  };

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userMsg = aiQuery.trim();
    if (!userMsg || isAiLoading) return;

    const conversation = [...aiChatHistory, { sender: "user" as const, text: userMsg }];
    setAiChatHistory([...conversation, { sender: "ai" as const, text: "" }]);
    setAiQuery("");
    setIsAiLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: conversation.map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text
          }))
        })
      });

      if (!res.ok || !res.body) throw new Error("AI service unavailable");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setAiChatHistory((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { sender: "ai", text: acc };
          return copy;
        });
      }

      if (!acc.trim()) throw new Error("empty response");
    } catch {
      setAiChatHistory((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          sender: "ai",
          text: "Sorry, the SPPU AI Study Vault is temporarily unavailable. Please try again in a moment."
        };
        return copy;
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredListings = listings.filter((item) => {
    const matchesBranch = selectedBranch === "All Branches" || item.department === selectedBranch;
    const matchesYear = selectedYear === "All Years" || item.year === selectedYear;
    const matchesCategory = selectedCategory === "All Gear" || item.category === selectedCategory;
    const matchesType = selectedListingType === "All" || item.listingType === selectedListingType;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sellerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBranch && matchesYear && matchesCategory && matchesType && matchesSearch;
  });

  const myListings = currentUser
    ? listings.filter((item) => item.sellerName === currentUser.name)
    : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased relative">
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-zinc-900 text-zinc-300 text-xs py-2 px-4 text-center font-medium border-b border-zinc-800">
        <span>⚡ MET BKC Campus Hub • Verified Peer-to-Peer Student Marketplace • Zero Fees &amp; 0% Brokerage</span>
      </div>

      {/* 2. NAVBAR */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCategoriesOpen(true)}
              className="inline-flex items-center gap-1.5 border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold text-sm px-3 py-2 rounded-lg transition"
              aria-label="Open categories menu"
            >
              <span className="text-base leading-none">☰</span>
              <span className="hidden sm:inline">Categories</span>
            </button>
            <a href="#" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
                M
              </div>
              <div>
                <span className="font-bold text-lg text-slate-900 tracking-tight block leading-none">
                  MET Campus Hub
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold tracking-wide uppercase">
                  BKC IOE Nashik
                </span>
              </div>
            </a>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#marketplace" className="text-slate-900 hover:text-emerald-600 transition-colors">
              Marketplace
            </a>
            <button
              onClick={() => setIsAiVaultOpen(true)}
              className="hover:text-emerald-600 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>SPPU AI Vault</span>
            </button>
            <button
              onClick={openTerms}
              className="hover:text-emerald-600 transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              <span>Terms &amp; Policy</span>
            </button>
            <button
              onClick={() => openReportModal()}
              className="text-rose-600 hover:text-rose-700 transition-colors flex items-center gap-1.5 font-semibold"
            >
              <Flag className="w-4 h-4" />
              <span>Report Safety / Flag Listing</span>
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={openPostModal}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-4 py-2 rounded-lg transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Item Free</span>
            </button>
            {currentUser ? (
              <div
                className="relative"
                onMouseEnter={() => setIsProfileMenuOpen(true)}
                onMouseLeave={() => setIsProfileMenuOpen(false)}
              >
                <button
                  onClick={() => setIsProfileMenuOpen((v) => !v)}
                  className="inline-flex items-center gap-1.5 border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold text-sm px-3.5 py-2 rounded-lg transition"
                >
                  <span className="max-w-[9rem] truncate">Hello, {currentUser.name}</span>
                  <span>👤</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-full z-50">
                    <div className="pt-2">
                      <div className="w-[36rem] max-w-[92vw] bg-white border border-slate-200 rounded-xl shadow-2xl p-5">
                        <div className="grid grid-cols-2 gap-5">
                      <div>
                        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 pb-1.5 border-b border-slate-100">
                          Your Campus Saved Lists
                        </h4>
                        <button
                          onClick={() => profileFeatureToast("Saved / Wishlisted Gear")}
                          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition text-left"
                        >
                          <span>📌</span>
                          <span>Saved / Wishlisted Gear</span>
                        </button>
                        <button
                          onClick={() => profileFeatureToast("Active Item Inquiries")}
                          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition text-left"
                        >
                          <span>🔔</span>
                          <span>Active Item Inquiries</span>
                        </button>
                        <button
                          onClick={() => profileFeatureToast("Wanted Gear Requests")}
                          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition text-left"
                        >
                          <span>🏷️</span>
                          <span>Wanted Gear Requests</span>
                        </button>
                      </div>

                      <div>
                        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 pb-1.5 border-b border-slate-100">
                          Your Campus Account
                        </h4>
                        <button
                          onClick={openProfileModal}
                          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition text-left"
                        >
                          <span>🎓</span>
                          <span>Profile &amp; Verified PRN Status</span>
                        </button>
                        <div className="ml-2 mb-1 inline-flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            PRN: {currentUser.prn || "—"}
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            Branch: {currentUser.branch}
                          </span>
                        </div>
                        <button
                          onClick={openProfileModal}
                          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition text-left"
                        >
                          <span>📦</span>
                          <span>My Active Listings (Manage, Edit, or Mark as Sold)</span>
                        </button>
                        <button
                          onClick={() => profileFeatureToast("Campus Handoff History")}
                          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition text-left"
                        >
                          <span>🤝</span>
                          <span>Campus Handoff History</span>
                        </button>
                        <button
                          onClick={() => profileFeatureToast("Account Security & Password Settings")}
                          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition text-left"
                        >
                          <span>⚙️</span>
                          <span>Account Security &amp; Password Settings</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            signOut();
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50 transition text-left"
                        >
                          <span>🚪</span>
                          <span>Sign Out / Logout</span>
                        </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setView("login")}
                className="border border-slate-300 hover:bg-slate-100 text-slate-800 font-medium text-sm px-3.5 py-2 rounded-lg transition"
              >
                Log In / Register
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 3. HERO & ACADEMIC BRANCH/YEAR FILTER BAR */}
      <section className="bg-white border-b border-slate-200 py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-3">
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <span>MET BKC Engineering & Polytechnic Campus</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-3">
            Pre-Loved Academic Gear & <span className="text-emerald-600">Syllabus Vault</span>
          </h1>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto relative mb-6">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search calculators, drafters, lab coats, SPPU books, seller..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-24 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-sm"
              />
            </div>
          </div>

          {/* ACADEMIC BRANCH & YEAR SELECTORS SECTION */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-1/2 text-left">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                Select Branch
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 text-xs font-semibold rounded-lg p-2.5 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-1/2 text-left">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                Select Academic Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 text-xs font-semibold rounded-lg p-2.5 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {YEARS.map((yr) => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pt-4 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap border ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. ITEM GRID */}
      <section id="marketplace" className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span>Campus Flash Deals</span>
              <span className="text-amber-500">⚡</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Filtered by: <strong>{selectedBranch}</strong> • <strong>{selectedYear}</strong>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-100">
                      <ImageIcon className="w-10 h-10" />
                      <span className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wide">
                        No Photo
                      </span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm border border-slate-200 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                    {item.year} - {item.department}
                  </div>
                  <div className="absolute top-3 right-3 bg-slate-900/80 text-white text-[11px] font-medium px-2 py-0.5 rounded shadow-sm">
                    {item.condition}
                  </div>
                  <div className="absolute bottom-3 left-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm tracking-wide">
                    {LISTING_TYPE_BADGE[item.listingType]}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
                    {item.title}
                  </h3>

                  {/* DISPLAY PHONE NUMBER & SELLER NAME */}
                  <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-xs">
                    <div className="flex items-center justify-between font-medium text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        {item.sellerName}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        MET Verified
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 font-bold text-slate-900 pt-0.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{item.phoneNumber}</span>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.location}</span>
                    </div>
                    <button
                      onClick={() => openReportModal(item)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-1 rounded-md transition"
                    >
                      <span>🚩 Report Item</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* CARD ACTIONS */}
              <div className="p-4 pt-0 border-t border-slate-100 mt-2 flex flex-col gap-2">
                <div className="flex items-center justify-between pt-2">
                  <div>
                    {item.listingType !== "Free" && item.originalPrice > item.price && (
                      <span className="text-xs text-slate-400 block line-through">
                        ₹{item.originalPrice}
                      </span>
                    )}
                    <span className="text-xl font-extrabold text-slate-900">
                      {item.listingType === "Free" ? "FREE" : `₹${item.price}`}
                    </span>
                  </div>

                  <button
                    onClick={() => handleRazorpayPayment(item)}
                    className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-3 py-2 rounded-lg transition shadow-sm"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Pay / Reserve Token</span>
                  </button>
                </div>

                <a
                  href={whatsappLinkFor(item)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2 rounded-lg transition shadow-sm"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4B. OFFICIAL CAMPUS HANDOFF ZONES */}
      <section id="handoff-zones" className="bg-slate-50 border-y border-slate-200 py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-3">
              <Handshake className="w-4 h-4 text-emerald-600" />
              <span>Official Campus Handoff Spots</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">MET Campus Handoff Zones</h2>
            <p className="text-slate-500 text-sm mt-1">
              Verified physical exchange locations at MET BKC IOE, Nashik
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {HANDOFF_ZONES.map((zone) => {
              const Icon = zone.icon;
              return (
                <div
                  key={zone.name}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition flex flex-col gap-3"
                >
                  <div className="w-10 h-10 bg-emerald-600 text-white rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{zone.name}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{zone.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-3xl mx-auto mb-8">
            <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-900 leading-relaxed">
              Always inspect items physically at these designated campus handoff spots before making payments or
              completing exchanges.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Recent Sample Exchanges
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {RECENT_EXCHANGES.map((ex) => (
                <div key={ex.item} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900 text-xs leading-snug">{ex.item}</p>
                      <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {ex.spot}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {ex.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS & CAMPUS HANDOFF */}
      <section id="how-it-works" className="bg-white border-y border-slate-200 py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-slate-900">How MET Campus Hub Works</h2>
            <p className="text-slate-500 text-sm mt-1">
              Safe, peer-to-peer campus handoffs in 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {HOW_IT_WORKS.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-1">
                    {step.step}. {step.title}
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-sm">{step.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="max-w-3xl mx-auto">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Recent Successful Campus Handoffs
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {RECENT_HANDOFFS.map((h) => (
                <div
                  key={h.item}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900 text-xs leading-snug">{h.item}</p>
                      <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {h.spot}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {h.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. AUTH SUITE MODALS */}
      {view !== "none" && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200">
            <button
              onClick={closeAuth}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {view !== "forgot" && (
              <div className="grid grid-cols-2 gap-1 bg-slate-100 rounded-lg p-1 mb-5">
                <button
                  type="button"
                  onClick={() => setView("login")}
                  className={`py-2 rounded-md text-sm font-semibold transition ${
                    view === "login" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => setView("register")}
                  className={`py-2 rounded-md text-sm font-semibold transition ${
                    view === "register" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Register
                </button>
              </div>
            )}

            {authWarning && (
              <div className="mb-4 flex items-start gap-2 text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <span>{authWarning}</span>
              </div>
            )}

            {view === "login" && (
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Welcome Back to MET Hub</h3>
                <p className="text-xs text-slate-500 mb-4">Log in with your verified student account.</p>

                {loginError && (
                  <div className="mb-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                    {loginError}
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email or PRN Number</label>
                    <input
                      type="text"
                      placeholder="student@met.edu or PRN Number"
                      required
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button type="button" onClick={() => { setLoginError(""); setForgotSent(false); setView("forgot"); }} className="text-emerald-700 hover:underline font-semibold">
                      Forgot Password?
                    </button>
                    <button type="button" onClick={() => setView("register")} className="text-slate-600 hover:underline">
                      Need an account? Register
                    </button>
                  </div>

                  <button type="submit" disabled={authLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-semibold transition mt-2">
                    {authLoading ? "Signing In..." : "Sign In"}
                  </button>
                </form>
              </div>
            )}

            {view === "register" && (
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Create Student Account</h3>
                <p className="text-xs text-slate-500 mb-4">Verify your details for MET BKC campus trading.</p>

                {regError && (
                  <div className="mb-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                    {regError}
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Full Name (e.g. Prathmesh Thorwat)"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Branch</label>
                      <select
                        value={regBranch}
                        onChange={(e) => setRegBranch(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                      >
                        {DEPARTMENTS.filter(d => d !== "All Branches").map(d => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Academic Year</label>
                      <select
                        value={regYear}
                        onChange={(e) => setRegYear(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                      >
                        {YEARS.filter(y => y !== "All Years").map(y => <option key={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">PRN Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 1234567890"
                      required
                      value={regPrn}
                      onChange={(e) => setRegPrn(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Personal / College Email</label>
                    <input
                      type="email"
                      placeholder="you@met.edu"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Phone / WhatsApp Number</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <input
                    type="password"
                    placeholder="Create Password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs"
                  />

                  <div className="text-xs text-right pt-1">
                    <button type="button" onClick={() => setView("login")} className="text-emerald-700 hover:underline font-semibold">
                      Already registered? Log In
                    </button>
                  </div>

                  <button type="submit" disabled={authLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-semibold transition">
                    {authLoading ? "Creating Account..." : "Register & Verify OTP"}
                  </button>
                </form>
              </div>
            )}

            {view === "forgot" && (
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Reset Password</h3>
                <p className="text-xs text-slate-500 mb-4">Enter your PRN or registered email to receive a password reset link.</p>

                {forgotSent ? (
                  <div className="space-y-3">
                    <div className="flex items-start gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span>
                        Password reset link sent! Please check your email inbox/spam folder.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setForgotSent(false); setForgotInput(""); setForgotError(""); setView("login"); }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-sm font-semibold transition"
                    >
                      Back to Login
                    </button>
                  </div>
                ) : (
                  <>
                    {forgotError && (
                      <div className="mb-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                        {forgotError}
                      </div>
                    )}
                    <form onSubmit={handleForgotSubmit} className="space-y-3">
                      <input
                        type="email"
                        placeholder="Registered Email Address"
                        required
                        value={forgotInput}
                        onChange={(e) => setForgotInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 border rounded-lg text-sm"
                      />
                      <button type="submit" disabled={authLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-semibold transition">
                        {authLoading ? "Sending..." : "Send Reset Link"}
                      </button>
                    </form>

                    <div className="text-xs text-center mt-3">
                      <button type="button" onClick={() => setView("login")} className="text-slate-600 hover:underline">
                        Back to Login
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            <p className="mt-4 text-[11px] text-slate-500 flex items-start gap-1.5 border-t border-slate-100 pt-3">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <span>PRN &amp; Phone numbers are verified for campus safety.</span>
            </p>
          </div>
        </div>
      )}

      {/* 6. POST ITEM MODAL */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsPostModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Post Campus Listing</h3>
            <p className="text-xs text-slate-500 mb-4">List unused calculators, drafters, or textbooks in 30 seconds.</p>
            <form onSubmit={handlePostSubmit} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              <input
                type="text"
                placeholder="Item Title (e.g. Casio fx-991EX)"
                required
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 border rounded-lg text-sm"
              />

              <div className="grid grid-cols-3 gap-2">
                {(["Rent", "Sale", "Free"] as ListingType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setPostType(t)}
                    className={`py-2 rounded-lg text-xs font-bold border transition ${
                      postType === t
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 -mt-1 flex items-center gap-1">
                <Tag className="w-3 h-3 text-slate-400" />
                Listing type: <strong>{LISTING_TYPE_BADGE[postType]}</strong>
              </p>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value)}
                  className="w-full px-3 py-2.5 border rounded-lg text-xs text-slate-800"
                >
                  {CATEGORIES.filter((c) => c !== "All Gear").map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <select
                  value={postDepartment}
                  onChange={(e) => setPostDepartment(e.target.value)}
                  className="w-full px-3 py-2.5 border rounded-lg text-xs text-slate-800"
                >
                  {DEPARTMENTS.filter((d) => d !== "All Branches").map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={postYear}
                  onChange={(e) => setPostYear(e.target.value as "FE" | "SE" | "TE" | "BE")}
                  className="w-full px-3 py-2.5 border rounded-lg text-xs text-slate-800"
                >
                  {YEARS.filter((y) => y !== "All Years").map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min={0}
                  placeholder={postType === "Free" ? "Price (free)" : "Price (₹)"}
                  required={postType !== "Free"}
                  disabled={postType === "Free"}
                  value={postType === "Free" ? "" : postPrice}
                  onChange={(e) => setPostPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 border rounded-lg text-sm disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Item Photo</label>
                <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-lg py-3 cursor-pointer text-xs font-semibold text-slate-600 transition">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>Upload Photo (JPG / PNG)</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePostImageFile(e.target.files?.[0])}
                  />
                </label>
                <input
                  type="url"
                  placeholder="or paste an image URL"
                  value={postImageUrl}
                  onChange={(e) => {
                    setPostImageUrl(e.target.value);
                    setPostImage("");
                  }}
                  className="w-full mt-2 px-3.5 py-2 border rounded-lg text-xs"
                />
                {(postImage || postImageUrl) && (
                  <div className="mt-2 relative w-full aspect-[16/10] rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                    <img
                      src={postImage || postImageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <input
                type="text"
                placeholder="Your Name (seller)"
                required
                value={postSeller}
                onChange={(e) => setPostSeller(e.target.value)}
                className="w-full px-3.5 py-2.5 border rounded-lg text-sm"
              />
              <input
                type="tel"
                placeholder="Your WhatsApp Phone Number"
                required
                value={postPhone}
                onChange={(e) => setPostPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 border rounded-lg text-sm"
              />
              <button type="submit" className="w-full bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700">
                Submit Listing
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 7. SPPU AI VAULT DRAWER */}
      {isAiVaultOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-6 flex flex-col justify-between relative shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-slate-900">SPPU AI Study Vault</h3>
                </div>
                <button onClick={() => setIsAiVaultOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto">
                {aiChatHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl text-xs ${
                      msg.sender === "user" ? "bg-emerald-600 text-white ml-8" : "bg-slate-100 text-slate-800 mr-8"
                    }`}
                  >
                    {msg.text || "Thinking..."}
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleAiSubmit} className="pt-4 border-t flex gap-2">
              <input
                type="text"
                placeholder="Ask SPPU syllabus query..."
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg text-xs"
              />
              <button
                type="submit"
                disabled={isAiLoading}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-xs font-bold transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 8. REPORT AN ITEM / LISTING SAFETY MODAL */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200">
            <button
              onClick={closeReportModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-rose-600 font-bold mb-1">
              <Flag className="w-5 h-5" />
              <h3 className="text-lg">Report an Item / Listing Safety</h3>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              {reportingItem
                ? "Reporting this listing to the MET BKC campus safety team."
                : "Flag a listing or safety concern anywhere on MET Campus Hub."}
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast("Thank you! Your report has been submitted to MET BKC Campus Safety.");
                closeReportModal();
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Item Title</label>
                <input
                  type="text"
                  placeholder="e.g. Casio fx-991EX Calculator"
                  value={reportItemTitle}
                  onChange={(e) => setReportItemTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Seller Name</label>
                <input
                  type="text"
                  placeholder="e.g. Prathmesh Thorwat"
                  value={reportSellerName}
                  onChange={(e) => setReportSellerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Report</label>
                <div className="space-y-1.5">
                  {REPORT_REASONS.map((reason) => (
                    <label
                      key={reason}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-xs cursor-pointer transition ${
                        reportReason === reason
                          ? "border-rose-300 bg-rose-50 text-rose-900 font-semibold"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        value={reason}
                        checked={reportReason === reason}
                        onChange={(e) => setReportReason(e.target.value)}
                        required
                        className="accent-rose-600"
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Additional Feedback <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={reportFeedback}
                  onChange={(e) => setReportFeedback(e.target.value)}
                  placeholder="Explain why this listing violates campus guidelines..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2.5 rounded-lg text-xs transition"
              >
                Submit Report to Campus Admin
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 8C. PROFILE & MY ACTIVE LISTINGS MODAL */}
      {isProfileModalOpen && currentUser && (
        <div className="fixed inset-0 z-[58] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl relative border border-slate-200">
            <button
              onClick={closeProfileModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-bold text-slate-900">Profile &amp; My Listings</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              MET BKC IOE student account &amp; posted gear
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Student Verification
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Student
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="block text-slate-400">Name</span>
                  <span className="font-semibold text-slate-900">{currentUser.name}</span>
                </div>
                <div>
                  <span className="block text-slate-400">PRN</span>
                  <span className="font-semibold text-slate-900">{currentUser.prn || "—"}</span>
                </div>
                <div>
                  <span className="block text-slate-400">Branch</span>
                  <span className="font-semibold text-slate-900">{currentUser.branch}</span>
                </div>
                <div>
                  <span className="block text-slate-400">Year</span>
                  <span className="font-semibold text-slate-900">{currentUser.year || "—"}</span>
                </div>
              </div>
            </div>

            <h4 className="text-sm font-bold text-slate-900 mb-3">My Active Listings</h4>

            {myListings.length === 0 ? (
              <p className="text-xs text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-lg px-3 py-4 text-center">
                You have not posted any gear yet. Use &ldquo;Post Item Free&rdquo; to list an item.
              </p>
            ) : (
              <div className="space-y-2">
                {myListings.map((item) => {
                  const available = (item.status ?? "Available") === "Available";
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 border border-slate-200 rounded-lg p-3"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 text-xs truncate">{item.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {LISTING_TYPE_BADGE[item.listingType]} &bull;{" "}
                          {item.listingType === "Free" ? "Free" : `₹${item.price}`}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleListingStatus(item.id)}
                        className={`shrink-0 text-[11px] font-bold px-2.5 py-1.5 rounded-md border transition ${
                          available
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {available ? "Available" : "Exchanged"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8B. CATEGORIES SIDEBAR DRAWER */}
      <div className={`fixed inset-0 z-[55] ${isCategoriesOpen ? "" : "pointer-events-none"}`} aria-hidden={!isCategoriesOpen}>
        <div
          onClick={closeCategories}
          className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${
            isCategoriesOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          className={`absolute top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
            isCategoriesOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          role="dialog"
          aria-label="Categories navigation"
        >
          <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-sm">
                M
              </div>
              <span className="font-bold text-base">
                Hello, {currentUser?.name || "Student"}
              </span>
            </div>
            <button
              onClick={closeCategories}
              className="text-slate-300 hover:text-white p-1"
              aria-label="Close categories menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-3">
            <div className="px-3 py-2">
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Browse Academic Categories
              </h3>
            </div>
            {DRAWER_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => applyDrawerCategory(cat.value)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition text-left"
              >
                <span className="text-base">{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}

            <div className="my-3 border-t border-slate-100" />

            <div className="px-3 py-2">
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Filter by Listing Type
              </h3>
            </div>
            {DRAWER_LISTING_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => applyDrawerListingType(t.value)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition text-left"
              >
                <span className="text-base">{t.emoji}</span>
                <span>{t.label}</span>
              </button>
            ))}

            <div className="my-3 border-t border-slate-100" />

            <div className="px-3 py-2">
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Filter by Department
              </h3>
            </div>
            {DRAWER_DEPARTMENTS.map((dept) => (
              <button
                key={dept.label}
                onClick={() => applyDrawerDepartment(dept.kind, dept.value)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition text-left"
              >
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>{dept.label}</span>
              </button>
            ))}

            <div className="my-3 border-t border-slate-100" />

            <div className="px-3 py-2">
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Campus Hub Features
              </h3>
            </div>
            <button
              onClick={openAiVaultFromDrawer}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition text-left"
            >
              <span className="text-base">🤖</span>
              <span>SPPU AI Study Vault Assistant</span>
            </button>
            <button
              onClick={openLostAndFound}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition text-left"
            >
              <span className="text-base">🔍</span>
              <span>Lost &amp; Found Vault</span>
            </button>
            <button
              onClick={goToHandoffZones}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition text-left"
            >
              <span className="text-base">📍</span>
              <span>Campus Handoff Zones</span>
            </button>
            <button
              onClick={openTermsFromDrawer}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition text-left"
            >
              <span className="text-base">📜</span>
              <span>Terms &amp; Rental Liability Policy</span>
            </button>
          </div>

          <div className="border-t border-slate-100 px-5 py-3 text-[11px] text-slate-400">
            MET BKC IOE, Nashik &bull; Verified student marketplace
          </div>
        </aside>
      </div>

      {/* 9. TERMS & USAGE POLICY MODAL (MANUAL + FIRST-VISIT POPUP) */}
      {(isTermsOpen || showTermsOnArrival) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl relative border border-slate-200">
            <button
              onClick={() => { setShowTermsOnArrival(false); setIsTermsOpen(false); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 pr-8">
                Welcome to MET Campus Hub &bull; Campus Guidelines &amp; Safety Policy
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Official Student-to-Student Peer Marketplace for MET BKC IOE, Nashik.
            </p>

            <div className="space-y-3">
              {TERMS_HIGHLIGHTS.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-0.5">{item.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {showTermsOnArrival ? (
              <div className="mt-6 border-t border-slate-100 pt-4">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 leading-relaxed">
                  <input
                    type="checkbox"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-emerald-600 shrink-0"
                  />
                  <span>
                    I agree to the MET Campus Hub Terms of Service, Rental Liability Policy, and
                    Campus Safety Rules.
                  </span>
                </label>

                <button
                  onClick={acceptTerms}
                  disabled={!termsAgreed}
                  className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition"
                >
                  I Accept &amp; Continue to Hub
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsTermsOpen(false)}
                className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg text-sm transition"
              >
                I Understand
              </button>
            )}
          </div>
        </div>
      )}

      {/* 10. RESERVE TOKEN DRAWER (RAZORPAY FALLBACK) */}
      {reserveItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200">
            <button
              onClick={() => setReserveItem(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-bold text-slate-900">Reserve with Token</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Pay a small token to hold this item until campus handoff. The remaining amount is paid directly to the seller.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4 text-xs space-y-1">
              <p className="font-semibold text-slate-900">{reserveItem.title}</p>
              <div className="flex items-center justify-between text-slate-600">
                <span>Seller</span>
                <span className="font-medium text-slate-900">{reserveItem.sellerName}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Item price</span>
                <span className="font-medium text-slate-900">₹{reserveItem.price}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-1 mt-1">
                <span className="font-semibold text-slate-900">Token deposit</span>
                <span className="font-extrabold text-emerald-700">₹{tokenAmountFor(reserveItem)}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mb-4">
              Razorpay checkout is unavailable right now. Confirm to log an offline reservation request, then connect on WhatsApp.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setReserveItem(null)}
                className="flex-1 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold py-2.5 rounded-lg text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const item = reserveItem;
                  setReserveItem(null);
                  showToast(`Reservation logged for ${item.title}. Token ₹${tokenAmountFor(item)} payable at handoff.`);
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg text-sm transition"
              >
                Confirm Reservation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. FOOTER */}
      <footer className="bg-zinc-900 text-zinc-400 py-10 px-4 sm:px-6 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              M
            </div>
            <div>
              <span className="font-bold text-white text-sm block leading-none">MET Campus Hub</span>
              <span className="text-zinc-500">MET BKC Institute of Engineering, Nashik</span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <button
              onClick={openTerms}
              className="hover:text-white transition flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Terms &amp; Policy</span>
            </button>
            <button
              onClick={() => setIsAiVaultOpen(true)}
              className="hover:text-white transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>SPPU AI Vault</span>
            </button>
            <button
              onClick={() => openReportModal()}
              className="text-rose-500 hover:text-rose-400 transition flex items-center gap-1.5 font-semibold"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Report Safety / Flag Listing</span>
            </button>
            <span className="text-zinc-600">© 2026 MET Campus Hub</span>
          </div>
        </div>
      </footer>

      {/* 12. TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[60] bg-slate-900 text-white text-xs font-medium px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 max-w-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}