/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Doctor, Specialty, Pharmacy, Product, CartItem, Appointment, ConsultationMode, Order, Prescription, AdCampaign } from "../types";
import { DEMO_LAB_TESTS } from "../data";
import { Search, ShoppingCart, Calendar, FileText, Activity, Layers, Tag, MapPin, Video, Send, Check, Upload, ArrowRight, ShieldAlert, Sparkles, UserPlus, ListOrdered, ClipboardList, Lock, Shield, Download, Trash2, Key, Info, CheckCircle2, ShieldCheck } from "lucide-react";

interface PatientPortalProps {
  doctors: Doctor[];
  specialties: Specialty[];
  pharmacies: Pharmacy[];
  products: Product[];
  cities: string[];
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  prescriptions: Prescription[];
  setPrescriptions: React.Dispatch<React.SetStateAction<Prescription[]>>;
  campaigns: AdCampaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<AdCampaign[]>>;
}

export default function PatientPortal({
  doctors,
  specialties,
  pharmacies,
  products,
  cities,
  appointments,
  setAppointments,
  cart,
  setCart,
  orders,
  setOrders,
  prescriptions,
  setPrescriptions,
  campaigns,
  setCampaigns
}: PatientPortalProps) {
  // Active Client screen tab
  const [activeTab, setActiveTab] = useState<"book" | "marketplace" | "emr" | "labs" | "profile">("book");

  // EMR Vault activation states
  const [emrActivated, setEmrActivated] = useState<boolean>(() => {
    // If there are already active prescriptions, consider the vault pre-activated
    return prescriptions.length > 0;
  });
  const [abhaNumber, setAbhaNumber] = useState<string>("91-8930-4819-2094");
  const [emrLoading, setEmrLoading] = useState<boolean>(false);
  const [emrOtpSent, setEmrOtpSent] = useState<boolean>(false);
  const [emrOtpInput, setEmrOtpInput] = useState<string>("");
  const [emrOtpError, setEmrOtpError] = useState<string>("");
  const [emrConsent, setEmrConsent] = useState<boolean>(true);
  const [emrCountdown, setEmrCountdown] = useState<number>(30);
  const [aadhaarInput, setAadhaarInput] = useState<string>("3820-9420-1589"); // Prepopulated Aarav's Aadhaar simulation
  
  // Custom manual record uploads tracker
  const [customRecords, setCustomRecords] = useState<{
    id: string;
    filename: string;
    type: string;
    date: string;
    size: string;
    labName: string;
    remarks: string;
  }[]>([
    {
      id: "REC-9104",
      filename: "CBC_Hemogram_Report.pdf",
      type: "Hematology Lab Report",
      date: "2026-05-15",
      size: "1.4 MB",
      labName: "MedConnect Diagnostics Hub, Bengaluru",
      remarks: "Hemoglobin 14.8 g/dL (Normal). Platelet counts stable."
    }
  ]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [newRecordName, setNewRecordName] = useState<string>("");
  const [newRecordLab, setNewRecordLab] = useState<string>("");
  const [newRecordType, setNewRecordType] = useState<string>("Blood Report");
  const [newRecordRemarks, setNewRecordRemarks] = useState<string>("");
  const [showUploadForm, setShowUploadForm] = useState<boolean>(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string>("");

  // Patient User Profile state
  const [profile, setProfile] = useState({
    uhid: "UHID-209420",
    name: "Aarav Sharma",
    mobile: "+91 99887 76655",
    email: "aarav_sharma@gmail.com",
    dob: "1994-08-15",
    gender: "Male",
    city: "Bengaluru",
    pincode: "560001",
    allergies: ["Penicillin"],
    chronic: ["Mild Asthma"]
  });

  // Family Member list
  const [family, setFamily] = useState([
    { name: "Kiran Sharma", relation: "Spouse", age: 30, history: "No major illness" }
  ]);
  const [newFamilyInput, setNewFamilyInput] = useState({ name: "", relation: "Child", age: "", history: "" });

  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(true);

  // Appointment Booking form state
  const [bookSpecId, setBookSpecId] = useState<string>("spec-1");
  const [bookCity, setBookCity] = useState("Bengaluru");
  const [bookDocId, setBookDocId] = useState<string>("");
  const [bookMode, setBookMode] = useState<ConsultationMode>(ConsultationMode.VIDEO);
  const [bookTime, setBookTime] = useState("10:00 AM - 10:30 AM");
  const [bookSymptoms, setBookSymptoms] = useState("");

  // Telemedicine Active Video Call session tracker
  const [activeCallApptId, setActiveCallApptId] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatThread, setChatThread] = useState<{ sender: "Doctor" | "Patient"; text: string }[]>([
    { sender: "Doctor", text: "Hello! Please upload your previous pulse and blood pressure stats if available. I am opening your EMR." }
  ]);

  // Marketplace filter
  const [selectedCategory, setSelectedCategory] = useState<string>("Medicines");
  const [searchQuery, setSearchQuery] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  // checkout delivery details
  const [deliveryAddress, setDeliveryAddress] = useState("Flat 402, Oakwood Appts, Near MG Road");
  const [deliverySlot, setDeliverySlot] = useState("Express Same-Day (Within 4 Hours)");
  const [paymentMode, setPaymentMode] = useState("Health Wallet (Prepaid)");
  const [uploadedRxUrl, setUploadedRxUrl] = useState<string>("");
  const [isCheckoutSummaryOpen, setIsCheckoutSummaryOpen] = useState(false);

  // Diagnostic Test orders
  const [bookedLabTests, setBookedLabTests] = useState<{ id: string; provider: string; price: number }[]>([]);
  const [lastConfirmedAppt, setLastConfirmedAppt] = useState<Appointment | null>(null);

  // Action methods
  const handleAdClick = (ad: AdCampaign) => {
    // 1. Increment clicks in the global campaigns state
    setCampaigns(prev => prev.map(item => item.id === ad.id ? { ...item, clicks: item.clicks + 1 } : item));
    
    // 2. Perform route routing based on targetLink
    if (ad.targetLink) {
      if (ad.targetLink.includes("labs") || ad.targetLink.includes("diagnostic")) {
        setActiveTab("labs");
      } else if (ad.targetLink.includes("marketplace") || ad.targetLink.includes("pharmacy")) {
        setActiveTab("marketplace");
      } else if (ad.targetLink.includes("profile")) {
        setActiveTab("profile");
      } else {
        // Find specialist specialty matching the target text
        const matchSpec = specialties.find(s => s.name.toLowerCase().includes(ad.targetLink.toLowerCase()) || ad.targetLink.toLowerCase().includes(s.name.toLowerCase()));
        if (matchSpec) {
          setBookSpecId(matchSpec.id);
          setActiveTab("book");
        }
      }
    }
  };

  const handleAddFamily = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyInput.name || !newFamilyInput.age) return;
    setFamily(prev => [...prev, {
      name: newFamilyInput.name,
      relation: newFamilyInput.relation,
      age: Number(newFamilyInput.age),
      history: newFamilyInput.history || "None"
    }]);
    setNewFamilyInput({ name: "", relation: "Child", age: "", history: "" });
  };

  const handleBookAppointment = () => {
    const selectedDoc = doctors.find((d) => d.id === bookDocId || d.specialty === specialties.find(s=>s.id===bookSpecId)?.name);
    if (!selectedDoc) {
      alert("No available doctor in selected city/specialty category right now.");
      return;
    }

    const tokenNum = appointments.filter(a => a.doctorId === selectedDoc.id).length + 1;
    const newAppt: Appointment = {
      id: `appt-${Date.now()}`,
      patientId: profile.uhid,
      patientName: profile.name,
      patientAge: 32, // Calculated from DOB
      patientGender: profile.gender,
      patientAllergies: profile.allergies,
      patientChronic: profile.chronic,
      doctorId: selectedDoc.id,
      doctorName: selectedDoc.name,
      specialty: selectedDoc.specialty,
      date: new Date().toISOString().split("T")[0],
      timeSlot: bookTime,
      mode: bookMode,
      status: "Scheduled",
      symptoms: bookSymptoms || "Routine Medical Checkup",
      vitals: { temp: "98.6 F", pulse: "78 bpm", bp: "120/80 mmhg", spo2: "99%", rr: "16" },
      tokenNumber: tokenNum
    };

    setAppointments(prev => [...prev, newAppt]);
    setLastConfirmedAppt(newAppt); // This triggers our high-fidelity SMS & WhatsApp confirmation modal!
    setBookSymptoms("");
  };

  // Marketplace logic
  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateCartQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(item => item.product.id !== id));
    } else {
      setCart(prev => prev.map(item => item.product.id === id ? { ...item, quantity: qty } : item));
    }
  };

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === "MED10") {
      setAppliedDiscount(10);
      alert("Coupon is valid: 10% flat discount applied!");
    } else if (couponCode.toUpperCase() === "HEALTH20") {
      setAppliedDiscount(20);
      alert("Coupon is valid: 20% flat discount applied!");
    } else {
      alert("Invalid promotional code.");
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    // Check if prescription required and if there is either an uploaded prescription or a digital prescription issued directly in this session
    const needsPrescription = cart.some(item => item.product.prescriptionRequired);
    const hasDigitalRx = prescriptions.length > 0;

    if (needsPrescription && !uploadedRxUrl && !hasDigitalRx) {
      alert("PRESCRIPTION MANDATE ALERT: This order contains controlled substances. Please upload a physical doctor script, or first perform a Tele-consult on the portal to automatically attach your issued Electronic-Rx.");
      return;
    }

    // Run the Smart Pharmacy Allocation Engine
    // 1) Find active pharmacies in the patient's city
    const localPharmacies = pharmacies.filter(p => p.status === "Active" && p.city.toLowerCase() === profile.city.toLowerCase());
    let chosenPharm: Pharmacy | undefined;
    let fallbackReason = "";

    // Priority 1: Preferred Pharmacies in the city
    const preferred = localPharmacies.find(p => p.isPreferred);
    if (preferred) {
      chosenPharm = preferred;
      fallbackReason = `Smart Allocation: Routed to [Preferred Pharmacy] ${preferred.name} due to active contractual billing SLA and stock availability.`;
    } 
    // Priority 2: Closest Distance Pharmacy
    else if (localPharmacies.length > 0) {
      const closest = [...localPharmacies].sort((a, b) => (a.distanceFromPatient || 10) - (b.distanceFromPatient || 10))[0];
      chosenPharm = closest;
      fallbackReason = `Smart Allocation: Preferred pharmacy unavailable locally. Assigned to nearest chemist outlet (${closest.name} at ${closest.distanceFromPatient}km) for SLA delivery window compliance.`;
    } 
    // Priority 3: National Chain Backups
    else if (pharmacies.length > 0) {
      const fallback = pharmacies[0];
      chosenPharm = fallback;
      fallbackReason = `Smart Allocation: Generic national fallback network allocated. Out-of-city dispatch routing activated from central warehouse.`;
    }

    const subtotal = cart.reduce((acc, item) => acc + item.product.sellingPrice * item.quantity, 0);
    const discountAmt = subtotal * (appliedDiscount / 100);
    const tax = subtotal * 0.12; // 12% GST
    const delFee = subtotal > 500 ? 0 : 50;
    const total = subtotal - discountAmt + tax + delFee;

    const newOrder: Order = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      patientName: profile.name,
      deliveryAddress,
      city: profile.city,
      pincode: profile.pincode,
      items: [...cart],
      subtotal,
      tax,
      deliveryFee: delFee,
      total,
      uploadedPrescriptionUrl: uploadedRxUrl || (hasDigitalRx ? `Linked-E-Rx-${prescriptions[0].prescriptionNumber}` : undefined),
      allocatedPharmacyId: chosenPharm?.id,
      allocatedPharmacyName: chosenPharm?.name,
      routingLogic: {
        reason: fallbackReason,
        priorityOrder: ["Preferred Pharmacy", "Nearest outlet", "National Chain Franchise"]
      },
      status: "Preparing",
      deliveryOTP: Math.floor(1000 + Math.random() * 9000).toString(),
      deliveryPartnerName: "Flash Logistics Hub",
      commissionPlatform: total * 0.10, // 10% commission
      commissionPharmacy: total * 0.90
    };

    setOrders(prev => [...prev, newOrder]);
    setCart([]);
    setIsCheckoutSummaryOpen(false);
    alert(`Order ${newOrder.id} successfully queued! Routed to ${newOrder.allocatedPharmacyName}. Secure Delivery confirmation OTP: ${newOrder.deliveryOTP}.`);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage) return;
    setChatThread(prev => [...prev, { sender: "Patient", text: chatMessage }]);
    setChatMessage("");
    setTimeout(() => {
      setChatThread(prev => [...prev, { sender: "Doctor", text: "Understood. I am updating your provisional diagnoses in the clinical portal. Please wait." }]);
    }, 1500);
  };

  const handleBookLabTest = (test: typeof DEMO_LAB_TESTS[0]) => {
    setBookedLabTests(prev => [...prev, { id: test.id, provider: test.provider, price: test.price }]);
    alert(`Home Specimen Collection configured for: ${test.name}. Phlebotomist partner will call 1 hour before collection slot.`);
  };

  // Find Doctors for selected specialty & city
  const selectedSpecName = specialties.find(s => s.id === bookSpecId)?.name;
  const filteredDoctors = doctors.filter(d => d.status === "Approved" && d.specialty === selectedSpecName);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="patient-portal-root">
      {/* Patient Tab Navigation Headers */}
      <div className="lg:col-span-12 bg-white p-2.5 rounded-2xl border border-slate-100 flex flex-wrap gap-2 justify-between items-center" id="patient-navbar">
        <div className="flex items-center gap-2 px-3">
          <Activity className="h-5 w-5 text-teal-600" />
          <span className="font-extrabold text-sm text-slate-800 tracking-tight">Patient e-Health Hub</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            id="pbtn-book"
            onClick={() => setActiveTab("book")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "book" ? "bg-teal-600 text-white" : "hover:bg-slate-100 text-slate-600"
            }`}
          >
            <Calendar className="h-4 w-4" /> Book Consultation
          </button>
          <button
            id="pbtn-marketplace"
            onClick={() => setActiveTab("marketplace")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "marketplace" ? "bg-teal-600 text-white" : "hover:bg-slate-100 text-slate-600"
            }`}
          >
            <ShoppingCart className="h-4 w-4" /> Medicine Marketplace
            {cart.length > 0 && (
              <span className="bg-red-500 text-white text-[9px] h-4 w-4 rounded-full flex items-center justify-center font-bold">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </button>
          <button
            id="pbtn-emr"
            onClick={() => setActiveTab("emr")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "emr" ? "bg-teal-600 text-white" : "hover:bg-slate-100 text-slate-600"
            }`}
          >
            <FileText className="h-4 w-4" /> EMR Records Vault
            {prescriptions.length > 0 && (
              <span className="bg-teal-500 text-slate-950 text-[9px] px-1.5 rounded-full font-bold">
                {prescriptions.length} Rx
              </span>
            )}
          </button>
          <button
            id="pbtn-labs"
            onClick={() => setActiveTab("labs")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "labs" ? "bg-teal-600 text-white" : "hover:bg-slate-100 text-slate-600"
            }`}
          >
            <Layers className="h-4 w-4" /> Home Diagnostic Labs
          </button>
          <button
            id="pbtn-profile"
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "profile" ? "bg-teal-600 text-white" : "hover:bg-slate-100 text-slate-600"
            }`}
          >
            <UserPlus className="h-4 w-4" /> Family Registry
          </button>
        </div>
      </div>

      {/* Active Promos and Banners added by ADMIN */}
      {campaigns && campaigns.length > 0 && (
        <div className="lg:col-span-12 p-0.5" id="patient-ad-banners-carousels">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white relative overflow-hidden shadow-md">
            <div className="absolute right-0 top-0 h-full w-1/3 bg-radial from-teal-500/10 via-transparent to-transparent pointer-events-none"></div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-teal-400 bg-teal-900/30 px-2 py-0.5 rounded flex items-center gap-1 font-sans">
                <Sparkles className="h-3 w-3 animate-pulse text-amber-300" />
                Empanelled Health Partner Banners & Promos
              </span>
              <span className="text-[9px] font-mono text-slate-400">Click banner to redirect instantly</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {campaigns.map((ad) => (
                <div 
                  key={ad.id} 
                  id={`patient-banner-ad-${ad.id}`}
                  onClick={() => handleAdClick(ad)}
                  className="bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden hover:border-teal-500/50 transition cursor-pointer group flex items-stretch h-20"
                >
                  <div className="w-20 bg-slate-800 shrink-0 relative overflow-hidden">
                    <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" referrerPolicy="no-referrer" />
                  </div>
                  <div className="p-2.5 flex flex-col justify-between flex-1 min-w-0">
                    <div>
                      <p className="font-extrabold text-[11px] text-slate-100 line-clamp-1 group-hover:text-teal-400 transition">{ad.title}</p>
                      <p className="text-[9px] text-slate-400 line-clamp-1 mt-0.5">By: {ad.advertiser}</p>
                    </div>
                    <div className="flex justify-between items-center text-[8px] font-mono">
                      <span className="text-slate-500 lowercase">#{ad.type.replace(/\s+/g, '')}</span>
                      <span className="text-teal-400 font-bold group-hover:translate-x-0.5 transition duration-200">Claim Offer &rarr;</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main active sub-view */}
      <div className="lg:col-span-12 min-h-[450px]">
        
        {/* subtab 1: BOOK CONSULTATION */}
        {activeTab === "book" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="book-consult-pane">
            <div className="lg:col-span-4 bg-slate-50 p-5 rounded-xl border border-slate-200 flex flex-col gap-4">
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider border-b border-slate-250 pb-2">Configure Consultation</h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">1. Choose Speciality</label>
                <select
                  id="sel-book-spec"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white font-medium"
                  value={bookSpecId}
                  onChange={(e) => {
                    setBookSpecId(e.target.value);
                    setBookDocId("");
                  }}
                >
                  {specialties.map(spec => (
                    <option key={spec.id} value={spec.id}>{spec.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">2. Local Operating City</label>
                <select
                  id="sel-book-city"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white"
                  value={bookCity}
                  onChange={(e) => setBookCity(e.target.value)}
                >
                  {cities.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">3. Select Empanelled Doctor</label>
                <select
                  id="sel-book-doc"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white font-semibold"
                  value={bookDocId}
                  onChange={(e) => setBookDocId(e.target.value)}
                >
                  <option value="">-- Closest matching doctor --</option>
                  {filteredDoctors.map(doc => (
                    <option key={doc.id} value={doc.id}>{doc.name} (Exp: {doc.experience}yr, Fee: ₹{doc.consultationFee})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">4. Consultation Mode Mode</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.values(ConsultationMode).map(mode => (
                    <button
                      id={`btn-mode-${mode.replace(/\s+/g, '-')}`}
                      key={mode}
                      type="button"
                      onClick={() => setBookMode(mode)}
                      className={`p-2 border rounded-lg font-bold text-[10px] transition ${
                        bookMode === mode ? "bg-teal-600 text-white border-teal-600" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Describe Symptoms or Vitals</label>
                <textarea
                  id="area-symptoms"
                  rows={2}
                  placeholder="Tell your doctor what's bothering you..."
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white"
                  value={bookSymptoms}
                  onChange={(e) => setBookSymptoms(e.target.value)}
                />
              </div>

              <button
                id="btn-confirm-appt"
                onClick={handleBookAppointment}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-3 rounded-lg shadow-md transition flex items-center justify-center gap-1.5"
              >
                <Calendar className="h-4 w-4" /> Place Appointment Booking
              </button>
            </div>

            {/* active telemedicine video simulation center */}
            <div className="lg:col-span-8 bg-white border border-slate-150 p-5 rounded-xl flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-slate-800">Direct Telehealth Telemedicine Link</h3>
                  <p className="text-xs text-slate-500">Live WebRTC video session and secure clinic file sharing system.</p>
                </div>
                <div className="flex gap-2">
                  {appointments.filter(a => a.status === "Scheduled").map(appt => (
                    <button
                      id={`btn-launch-call-${appt.id}`}
                      key={appt.id}
                      onClick={() => setActiveCallApptId(appt.id)}
                      className="bg-teal-50 text-teal-800 hover:bg-teal-100 px-3 py-1.5 rounded-lg border border-teal-200 text-xs font-bold flex items-center gap-1"
                    >
                      <Video className="h-3.5 w-3.5" /> Launch Calling ({appt.doctorName})
                    </button>
                  ))}
                </div>
              </div>

              {activeCallApptId ? (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4" id="telemedicine-session">
                  {/* Camera visual feed */}
                  <div className="md:col-span-3 h-80 bg-slate-900 rounded-xl overflow-hidden relative flex flex-col items-center justify-center border border-slate-800">
                    {/* Simulated doc feed */}
                    <img
                      src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600&auto=format&fit=crop"
                      alt="Doctor Live feed"
                      className="w-full h-full object-cover opacity-85"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 left-2 bg-slate-950/70 text-emerald-400 font-mono text-[9px] uppercase px-2 py-0.5 rounded tracking-widest flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      Secure Audio/HD-Video Link Active
                    </div>
                    {/* Simulated generic user overlay */}
                    <div className="absolute bottom-2 right-2 h-20 w-28 bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                      <div className="h-full w-full flex items-center justify-center text-slate-500 text-xs font-bold">
                        (Your Camera)
                      </div>
                    </div>
                  </div>

                  {/* Chat frame panel */}
                  <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between h-80">
                    <div className="p-3 border-b border-slate-200 bg-white font-bold text-xs text-slate-700 flex items-center gap-1.5">
                      <ArrowRight className="h-3.5 w-3.5 text-teal-600 rotate-90" />
                      Patient-Doctor Chat Channel
                    </div>
                    {/* Chat log */}
                    <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
                      {chatThread.map((msg, i) => (
                        <div key={i} className={`flex flex-col ${msg.sender === "Patient" ? "items-end" : "items-start"}`}>
                          <span className="text-[9px] text-slate-400 font-bold mb-0.5">{msg.sender}</span>
                          <span className={`p-2 rounded-lg max-w-[90%] ${
                            msg.sender === "Patient" ? "bg-teal-600 text-white rounded-tr-none" : "bg-slate-200 text-slate-800 rounded-tl-none"
                          }`}>
                            {msg.text}
                          </span>
                        </div>
                      ))}
                    </div>
                    {/* Input form chat */}
                    <form onSubmit={handleSendChatMessage} className="p-2 border-t border-slate-200 bg-white flex gap-1.5">
                      <input
                        id="input-tele-chat"
                        type="text"
                        placeholder="Type messaging to doctor..."
                        className="flex-1 text-xs px-2 py-1.5 border border-slate-200 rounded"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                      />
                      <button
                        id="btn-tele-send"
                        type="submit"
                        className="bg-teal-600 hover:bg-teal-700 text-white px-2.5 rounded font-bold"
                      >
                        <Send className="h-3 w-3" />
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 py-12 rounded-xl flex flex-col items-center justify-center text-center p-6 text-slate-500 min-h-[300px]">
                  <Video className="h-12 w-12 text-slate-300 stroke-[1.5] mb-2 animate-bounce" />
                  <p className="font-semibold text-sm">Consultation Chamber Closed</p>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">When your doctor opens your scheduled consult meeting node, click the telemedicine launcher button to initiate HD Secure Call.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* subtab 2: MEDICINE & ALLIED MARKETPLACE */}
        {activeTab === "marketplace" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="marketplace-pane">
            
            {/* Catalog Categories sidebar */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              <div className="bg-white p-4 border border-slate-150 rounded-xl shadow-sm">
                <div className="relative mb-4">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    id="input-catalog-search"
                    type="text"
                    placeholder="Search medicines..."
                    className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  {["Medicines", "OTC", "Health Devices", "Ayurvedic"].map(cat => (
                    <button
                      id={`btn-cat-${cat}`}
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-between ${
                        selectedCategory === cat ? "bg-teal-600 text-white" : "hover:bg-slate-100 text-slate-600"
                      }`}
                    >
                      <span>{cat} Directory</span>
                      <span className="text-[10px] bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded-full font-mono">
                        {products.filter(p => p.category === cat).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Shopping Cart Drawer panel */}
              <div className="bg-white p-4 border border-slate-150 rounded-xl shadow-sm space-y-4">
                <h4 className="font-bold text-xs text-slate-700 uppercase tracking-widest border-b border-slate-100 pb-2 flex justify-between">
                  <span>Your Shopping Cart</span>
                  <ShoppingCart className="h-4 w-4 text-teal-600" />
                </h4>

                {cart.length > 0 ? (
                  <div className="space-y-3">
                    <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                      {cart.map((item) => (
                        <div key={item.product.id} className="text-xs flex justify-between items-start gap-1.5 pb-2.5 border-b border-slate-100">
                          <div className="flex-1">
                            <p className="font-bold text-slate-800 line-clamp-1">{item.product.name}</p>
                            <p className="text-[10px] text-teal-600 font-semibold">₹{item.product.sellingPrice} per unit</p>
                            {item.product.prescriptionRequired && (
                              <span className="inline-block bg-amber-100 text-amber-800 text-[8px] font-extrabold px-1.5 py-0.2 rounded mt-0.5 uppercase">
                                Rx required
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 font-mono">
                            <button
                              id={`btn-dec-qty-${item.product.id}`}
                              onClick={() => handleUpdateCartQty(item.product.id, item.quantity - 1)}
                              className="bg-slate-100 hover:bg-slate-200 px-1 py-0.2 rounded font-bold text-[10px]"
                            >
                              -
                            </button>
                            <span className="w-4 text-center font-bold">{item.quantity}</span>
                            <button
                              id={`btn-inc-qty-${item.product.id}`}
                              onClick={() => handleUpdateCartQty(item.product.id, item.quantity + 1)}
                              className="bg-slate-100 hover:bg-slate-200 px-1 py-0.2 rounded font-bold text-[10px]"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Rx upload request if needed */}
                    {cart.some(i => i.product.prescriptionRequired) && (
                      <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-xs space-y-2">
                        <p className="font-semibold text-amber-800 flex items-center gap-1 text-[10px]">
                          <ShieldAlert className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                          Rx Prescription Link Required
                        </p>
                        {prescriptions.length > 0 ? (
                          <div className="bg-white p-1 rounded border border-teal-300 text-[10px] text-slate-700 flex justify-between items-center">
                            <span>Direct e-Rx #{prescriptions[0].prescriptionNumber}</span>
                            <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                              <Check className="h-3 w-3" /> Attached
                            </span>
                          </div>
                        ) : (
                          <div>
                            <input
                              id="rx-upload-field"
                              type="file"
                              className="hidden"
                              onChange={(e) => {
                                setUploadedRxUrl("Simulated_Rx_Document_Uploader_Success.pdf");
                                alert("Medical script document uploaded and SHA-Hash checked!");
                              }}
                            />
                            <button
                              id="btn-upload-trigger"
                              onClick={() => document.getElementById("rx-upload-field")?.click()}
                              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-[9px] py-1 px-2 rounded uppercase flex items-center justify-center gap-1"
                            >
                              <Upload className="h-3 w-3" /> {uploadedRxUrl ? "Change Script doc" : "Upload Doctor's prescription"}
                            </button>
                            {uploadedRxUrl && (
                              <p className="text-[9px] text-emerald-700 mt-1 truncate">File: {uploadedRxUrl}</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Checkout parameters & allocation trigger */}
                    <button
                      id="btn-pre-checkout"
                      onClick={() => setIsCheckoutSummaryOpen(true)}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-2.5 rounded-lg shadow transition text-center"
                    >
                      Route Order Diagnostics
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic text-center py-6">E-Pharmacy cart is currently empty.</p>
                )}
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="lg:col-span-9 flex flex-col gap-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                <span>Displaying <strong>{selectedCategory}</strong> catalog category</span>
                <span className="text-[10px] text-slate-400">Locked location: {profile.city}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {products
                  .filter((p) => p.category === selectedCategory && p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((product) => (
                    <div key={product.id} className="border border-slate-200 p-4 rounded-xl white bg-white shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="w-full h-32 bg-slate-100 rounded-lg overflow-hidden mb-3">
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-xs text-slate-800 line-clamp-2">{product.name}</h4>
                          {product.prescriptionRequired && (
                            <span className="bg-red-50 text-red-600 border border-red-200 text-[8px] font-extrabold px-1 rounded uppercase shrink-0">
                              Rx Required
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">{product.brand} • {product.manufacturer}</p>
                        <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">{product.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 line-through">MRP ₹{product.mrp}</span>
                          <p className="text-sm font-black text-slate-900">₹{product.sellingPrice}</p>
                        </div>
                        <button
                          id={`btn-add-to-cart-${product.id}`}
                          onClick={() => handleAddToCart(product)}
                          className="bg-teal-50 hover:bg-teal-600 hover:text-white text-teal-800 border border-teal-200 text-xs font-bold py-1.5 px-3 rounded-lg transition"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* checkout routing logic summary Modal */}
            {isCheckoutSummaryOpen && (
              <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl w-full max-w-lg p-6 border border-slate-150 shadow-2xl flex flex-col gap-4">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="font-extrabold text-base text-slate-800 flex items-center gap-1.5">
                        <Sparkles className="h-5 w-5 text-teal-600 animate-pulse" />
                        Smart Pharmacy Router Config
                      </h4>
                      <p className="text-xs text-slate-500">Real-time allocation routing check for drug items.</p>
                    </div>
                    <button id="btn-close-checkout" onClick={() => setIsCheckoutSummaryOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">×</button>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                      <p className="font-bold text-slate-700">1. Verification Address & Slots</p>
                      <input
                        id="check-address"
                        type="text"
                        className="w-full p-2 border border-slate-200 rounded text-slate-800 bg-white"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                      />
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <select
                          id="check-slot"
                          className="w-full p-2 border border-slate-200 rounded bg-white text-slate-700"
                          value={deliverySlot}
                          onChange={(e) => setDeliverySlot(e.target.value)}
                        >
                          <option>Express Same-Day (Within 4 Hours)</option>
                          <option>Standard Delivery (Next Day)</option>
                          <option>Pickup from closest Pharmacy Store</option>
                        </select>
                        <select
                          id="check-payment"
                          className="w-full p-2 border border-slate-200 rounded bg-white text-slate-700"
                          value={paymentMode}
                          onChange={(e) => setPaymentMode(e.target.value)}
                        >
                          <option>Health Wallet (Prepaid)</option>
                          <option>Cash / Card on Delivery (COD)</option>
                          <option>Contractual Insurance Direct Billing</option>
                        </select>
                      </div>
                    </div>

                    {/* Routing logic explanation */}
                    <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg space-y-1.5 text-teal-900">
                      <p className="font-bold flex items-center gap-1 text-[11px] uppercase">
                        <Layers className="h-4 w-4" /> Routing Engine Strategy
                      </p>
                      <p className="text-[11px] text-teal-800 mt-1 leading-relaxed">
                        The system will queries closest empanelled pharmacies in <strong>{profile.city}</strong> that hold active licensed certificates and stock capacity. Distance margins are evaluated dynamically to comply with delivery SLAs.
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                    <button
                      id="btn-checkout-cancel"
                      onClick={() => setIsCheckoutSummaryOpen(false)}
                      className="bg-slate-100 hover:bg-slate-250 text-slate-700 font-bold px-4 py-2 rounded-lg text-xs"
                    >
                      Wait list Cart
                    </button>
                    <button
                      id="btn-checkout-place"
                      onClick={handleCheckout}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2.5 rounded-lg text-xs shadow-md transition"
                    >
                      Route and Dispatch Order
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* subtab 3: MY EMR HEALTH VAULT */}
        {activeTab === "emr" && (
          <div className="flex flex-col gap-6" id="emr-vault-pane">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-base text-slate-800">Electronic Medical Records (EMR) Vault</h3>
                <p className="text-xs text-slate-500">Your historical consultations, digital signatures Rx sheets, and laboratory findings.</p>
              </div>
              <span className="text-xs text-teal-700 bg-teal-50 font-semibold px-2.5 py-1 rounded font-mono">
                Govt Compliance Standard: ISO-27001 Secured
              </span>
            </div>

            {/* CASE 1: VAULT IS NOT YET ACTIVATED */}
            {!emrActivated ? (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm" id="emr-activation-wizard">
                <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-teal-500/20 text-teal-400 rounded-xl flex items-center justify-center border border-teal-500/30">
                      <Lock className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm tracking-tight">NATIONAL DIGITAL HEALTH VAULT ACTIVATION</h4>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">Compliant with Ayushman Bharat Digital Mission (ABDM) Standards</p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-block text-[10px] bg-red-500/20 text-red-300 font-bold px-2.5 py-1 rounded border border-red-500/30 uppercase tracking-widest font-mono">
                    Locked / Inactive
                  </span>
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left explanation column */}
                  <div className="lg:col-span-5 space-y-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 block">Security Verification Overview</span>
                    <h5 className="font-bold text-slate-800 text-sm leading-tight">Authorize cryptographic linkage to protect your health credentials</h5>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Your EMR account stores critical drug interactions, allergic warnings, and certified digital doctor prescriptions. To proceed, please activate your secure portal locker.
                    </p>

                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 bg-slate-50 rounded-lg flex gap-2 border border-slate-100">
                        <Shield className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-700 block">AES-256 Bit Encryption</strong>
                          <span className="text-[10px] text-slate-400">All health datasets are hashed and sealed locally in the sandbox.</span>
                        </div>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg flex gap-2 border border-slate-100">
                        <Key className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-700 block">Unified Patient ID (UHID)</strong>
                          <span className="text-[10px] text-slate-400">Instantly links external diagnostics feeds using National Health ID cards.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right form submission columns */}
                  <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                    {/* Simulated process loading screen */}
                    {emrLoading ? (
                      <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                        <div className="h-10 w-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="font-bold text-slate-700 text-xs">Verifying details with National Health Authority registries...</p>
                        <p className="text-[10px] text-slate-400 font-mono">Generating certified ISO-27001 signature keys</p>
                      </div>
                    ) : !emrOtpSent ? (
                      /* STEP 1: ENROLLMENT FORM */
                      <div className="space-y-4 text-xs">
                        <div className="flex justify-between items-center border-b pb-2">
                          <span className="font-bold text-slate-700 uppercase tracking-wide text-[10px]">Step 1: Patient Credentials Verification</span>
                          <span className="text-[10px] text-slate-400">Aarav Sharma ({profile.uhid})</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">Interactive Aadhaar / Voter ID Number</label>
                            <input
                              type="text"
                              className="w-full p-2.5 border rounded-lg bg-white font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                              placeholder="e.g. 1234-5678-9012"
                              value={aadhaarInput}
                              onChange={(e) => setAadhaarInput(e.target.value)}
                            />
                            <p className="text-[9px] text-slate-400">Pre-validated with government biometric index</p>
                          </div>
                          
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">Patient Registered Mobile</label>
                            <input
                              type="text"
                              disabled
                              className="w-full p-2.5 border rounded-lg bg-slate-100 font-mono text-slate-500 cursor-not-allowed"
                              value={profile.mobile}
                            />
                            <p className="text-[9px] text-slate-400">Sourced securely from demographic card</p>
                          </div>
                        </div>

                        <div className="p-3 bg-teal-50 border border-teal-100 rounded-lg flex items-start gap-2 text-teal-900">
                          <input
                            type="checkbox"
                            id="emr-consent-chk"
                            className="mt-1 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                            checked={emrConsent}
                            onChange={(e) => setEmrConsent(e.target.checked)}
                          />
                          <label htmlFor="emr-consent-chk" className="text-[11px] leading-relaxed block text-teal-800 select-none">
                            <strong>I grant clinical consensus</strong> to link my dynamic consultation charts, prescription QR files, and hematology reports with MedConnect secure vaults. I retain rights to revoke access at any point from my profile workspace.
                          </label>
                        </div>

                        <button
                          id="btn-request-emr-otp"
                          disabled={!emrConsent || !aadhaarInput}
                          onClick={() => {
                            setEmrLoading(true);
                            setTimeout(() => {
                              setEmrLoading(false);
                              setEmrOtpSent(true);
                              setEmrOtpError("");
                            }, 1000);
                          }}
                          className={`w-full py-2.5 rounded-lg font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 ${
                            emrConsent && aadhaarInput
                              ? "bg-slate-900 hover:bg-slate-800 text-teal-400"
                              : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                          }`}
                        >
                          <Send className="h-4 w-4" /> Request Secure Activation OTP
                        </button>
                      </div>
                    ) : (
                      /* STEP 2: OTP CHALLENGE */
                      <div className="space-y-4 text-xs">
                        <div className="flex justify-between items-center border-b pb-2">
                          <span className="font-bold text-slate-700 uppercase tracking-wide text-[10px]">Step 2: Enter Cryptographic PIN</span>
                          <span className="text-[10px] text-red-600 font-mono">OTP Sent to {profile.mobile}</span>
                        </div>

                        {/* Interactive testing assist tool */}
                        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-amber-900 flex items-start gap-2">
                          <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold block text-[10px] uppercase">Locker Simulation Node Code</span>
                            <span className="mt-0.5 block leading-tight">
                              The national portal routed a secure OTP: <strong className="font-mono bg-white px-1 py-0.5 rounded border border-amber-300 text-amber-800">2026</strong>. Enter this code below to instantly activate.
                            </span>
                          </div>
                        </div>

                        {emrOtpError && (
                          <div className="bg-red-50 border border-red-200 p-2 text-red-800 font-semibold rounded text-[11px] flex items-center gap-1">
                            <ShieldAlert className="h-4 w-4 text-red-650 shrink-0" />
                            <span>{emrOtpError}</span>
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">6-Digit Access Code</label>
                          <input
                            type="text"
                            maxLength={6}
                            className="w-full text-center tracking-[12px] font-bold font-mono text-base p-2 border border-slate-300 rounded-lg bg-white text-slate-800"
                            placeholder="000000"
                            value={emrOtpInput}
                            onChange={(e) => setEmrOtpInput(e.target.value.replace(/\D/g, ""))}
                          />
                        </div>

                        <div className="flex justify-between items-center text-[11px] text-slate-400">
                          <span>Verification token expires in {emrCountdown}s</span>
                          <button 
                            type="button" 
                            onClick={() => {
                              setEmrOtpInput("");
                              setEmrCountdown(30);
                              setEmrOtpError("");
                            }} 
                            className="text-teal-600 hover:underline font-bold"
                          >
                            Resend Access Token
                          </button>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEmrOtpSent(false);
                              setEmrOtpInput("");
                              setEmrOtpError("");
                            }}
                            className="flex-1 bg-slate-200 hover:bg-slate-250 text-slate-700 py-2.5 rounded-lg font-bold"
                          >
                            Back
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              if (emrOtpInput !== "2026") {
                                setEmrOtpError("Access Denied: The signature code provided does not match the verification registry. Please use 2026.");
                                return;
                              }
                              setEmrLoading(true);
                              setTimeout(() => {
                                setEmrLoading(false);
                                setEmrActivated(true);
                                
                                // Seed the historical prescriptions if they are currently blank
                                if (prescriptions.length === 0) {
                                  const historicalRx: Prescription[] = [
                                    {
                                      id: "JE-APT-HIST-1",
                                      appointmentId: "appt-hist-1",
                                      prescriptionNumber: "MED-RX-2201-92",
                                      date: "2026-05-18",
                                      doctorId: "DOC-2810",
                                      doctorName: "Dr. Rajesh Iyer",
                                      patientName: "Aarav Sharma",
                                      patientUHID: "UHID-209420",
                                      vitals: { temp: "98.2 F", pulse: "84 bpm", bp: "142/88 mmhg", spo2: "98%" },
                                      chiefComplaint: "Mild evening headache, transient head dizziness",
                                      provisionalDiagnosis: "Grade 1 Essential Hypertension",
                                      icd10Code: "I10",
                                      medicines: [
                                        { name: "Telmisartan", strength: "40 mg", dosage: "1-0-0", frequency: "Morning, before food", duration: "30 Days", advice: "Take strictly at the same time daily" },
                                        { name: "Amlodipine", strength: "5 mg", dosage: "0-0-1", frequency: "Bedtime, after food", duration: "30 Days", advice: "Monitor for ankle swelling" }
                                      ],
                                      investigations: ["Serum Creatinine", "Lipid Profile Ratio", "12-Lead Electrocardiogram"],
                                      dietAdvice: "Strict low sodium (DASH) dietary regimen. Restrict salt intake to less than 2 grams daily.",
                                      lifestyleAdvice: "Cardiovascular exercise (brisk walking/cycling) 35 mins/day. Avoid heavy caffeine at night.",
                                      signature: "SECURE-DR-RAJESH-IYER-DIGISIGN-77FF92",
                                      qrcode: "MOCK-QR-HEALTH-VAULT-RAJESH01"
                                    },
                                    {
                                      id: "JE-APT-HIST-2",
                                      appointmentId: "appt-hist-2",
                                      prescriptionNumber: "MED-RX-1940-05",
                                      date: "2026-06-01",
                                      doctorId: "DOC-0021",
                                      doctorName: "Dr. Alok Sharma",
                                      patientName: "Aarav Sharma",
                                      patientUHID: "UHID-209420",
                                      vitals: { temp: "98.4 F", pulse: "78 bpm", bp: "120/80 mmhg", spo2: "99%" },
                                      chiefComplaint: "Severe nasal blockage, watering of eyes, throat itching",
                                      provisionalDiagnosis: "Allergic Rhinopharyngitis (Dust Overlap)",
                                      icd10Code: "J30.9",
                                      medicines: [
                                        { name: "Montelukast + Levocetirizine", strength: "10mg/5mg", dosage: "0-0-1", frequency: "Night, after food", duration: "10 Days", advice: "May cause minor daytime drowsiness" },
                                        { name: "Fluticasone Aqueous Nasal Spray", strength: "50 mcg", dosage: "2 sprays in each nostril", frequency: "Daily, morning", duration: "15 Days", advice: "Shake thoroughly before administration" }
                                      ],
                                      investigations: ["Absolute Eosinophil Count (AEC)", "Serum Total Immunoglobulin E (IgE)"],
                                      dietAdvice: "Hydrate with warm fluids. Restrict cold foods/carbonated beverages.",
                                      lifestyleAdvice: "Ensure room bedding is allergen-free/vacuumed regularly. Use steam inhalations twice daily.",
                                      signature: "SECURE-DR-ALOK-SHARMA-DIGISIGN-88AA11",
                                      qrcode: "MOCK-QR-HEALTH-VAULT-ALOK02"
                                    }
                                  ];
                                  setPrescriptions(historicalRx);
                                }
                              }, 1200);
                            }}
                            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-lg font-bold shadow-md transition"
                          >
                            Verify & Configure Vault
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* CASE 2: VAULT IS FULLY ACTIVATED & LOADED */
              <div className="space-y-6" id="active-emr-dashboard">
                
                {/* 1. ABHA DIGITAL ID CARD RENDER */}
                <div className="bg-gradient-to-br from-emerald-50 via-white to-slate-50 border border-emerald-300 rounded-2xl p-5 shadow-sm relative overflow-hidden" id="abha-digital-id-card">
                  {/* Design accent lines */}
                  <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-100/30 rounded-full blur-2xl"></div>
                  <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-teal-100/25 rounded-full blur-xl"></div>
                  
                  {/* Top Bar inside card */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-emerald-200/80 pb-3 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-emerald-600 p-1.5 rounded-lg text-white">
                        <Shield className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-800 tracking-tight">NATIONAL HEALTH AUTHORITY</h4>
                        <p className="text-[8.5px] text-emerald-700 tracking-wide font-mono uppercase font-black">ABHA (Ayushman Bharat Health Account) Locker</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black border border-emerald-300 px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                        <span className="bg-emerald-500 h-1.5 w-1.5 rounded-full animate-ping"></span>
                        ABDM Approved Wallet
                      </span>
                    </div>
                  </div>

                  {/* Demographics Area inside card */}
                  <div className="py-4 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    {/* Mock Photo Avater */}
                    <div className="sm:col-span-3 flex justify-center">
                      <div className="h-20 w-18 bg-white border border-slate-200 rounded-xl p-1 shadow-sm relative group">
                        <div className="w-full h-full bg-slate-100 rounded-lg flex flex-col justify-end items-center overflow-hidden">
                          {/* Face Avatar */}
                          <div className="w-10 h-10 bg-teal-200 rounded-full mb-1"></div>
                          <div className="w-14 h-5 bg-teal-600 rounded-b-lg"></div>
                        </div>
                        <span className="absolute bottom-0.5 right-0.5 h-3 w-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                      </div>
                    </div>

                    {/* Patient Specific ABHA fields */}
                    <div className="sm:col-span-6 space-y-1.5 text-xs text-slate-600 font-medium">
                      <p className="text-slate-900 font-black text-sm">{profile.name}</p>
                      
                      <div className="grid grid-cols-2 gap-3 text-[11px] leading-snug">
                        <div>
                          <span className="text-[9px] text-slate-400 block uppercase font-bold">ABHA Address</span>
                          <span className="text-slate-800 font-mono font-bold">aarav_sharma@drr</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block uppercase font-bold">ABHA Registry ID</span>
                          <b className="text-slate-800 font-mono tracking-wider">{abhaNumber}</b>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block uppercase font-bold">Unified UHID No.</span>
                          <span className="text-slate-805 font-mono">{profile.uhid}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block uppercase font-bold">DOB & Gender</span>
                          <span className="text-slate-800">{profile.dob} ({profile.gender})</span>
                        </div>
                      </div>
                    </div>

                    {/* Digital QR payload */}
                    <div className="sm:col-span-3 flex flex-col items-center justify-center p-2.5 bg-white border border-emerald-200/60 rounded-xl">
                      <div className="grid grid-cols-4 gap-0.5 w-12 h-12 bg-slate-900 rounded p-1">
                        <span className="bg-white"></span>
                        <span className="bg-transparent"></span>
                        <span className="bg-white"></span>
                        <span className="bg-white"></span>
                        <span className="bg-transparent"></span>
                        <span className="bg-white"></span>
                        <span className="bg-white"></span>
                        <span className="bg-transparent"></span>
                      </div>
                      <span className="text-[7px] text-slate-400 mt-1 uppercase font-black font-mono">Scan for Clinical Consent</span>
                    </div>
                  </div>

                  {/* Card Bottom Panel with Actions */}
                  <div className="border-t border-emerald-200/80 pt-3 flex flex-wrap gap-3 justify-between items-center text-xs">
                    <p className="text-[10px] text-slate-400 font-mono">
                      Security Authority Hash: <b className="text-slate-600 font-bold">AES-GCM-256-SHA384</b>
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          alert(`Downloading authenticated e-Health ID card for Aarav Sharma (ABHA Number: ${abhaNumber}). Security signature hashes are appended to metadata.`);
                        }}
                        className="bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition text-[11px]"
                      >
                        <Download className="h-3.5 w-3.5" /> Download Digital Card PDF
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to deactivate your digital consensus, seal the EMR logs, and unlink your national ID card? This will hide records from clinicians.")) {
                            setEmrActivated(false);
                            setEmrOtpSent(false);
                            setEmrOtpInput("");
                          }
                        }}
                        className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg font-bold transition text-[11px]"
                      >
                        Revoke Consent / Lock Vault
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. TABBED PANEL FOR HEALTH DATA SHEETS */}
                <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                  
                  {/* Tab bar header */}
                  <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div className="flex items-center gap-1 bg-slate-200 p-0.5 rounded-lg border">
                      <h4 className="text-xs font-extrabold text-slate-700 px-3">VAULT DIRECTORY VIEW:</h4>
                    </div>

                    <div className="flex gap-2 text-xs">
                      <button
                        onClick={() => setShowUploadForm(!showUploadForm)}
                        className="bg-slate-900 hover:bg-slate-800 text-teal-400 font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                      >
                        <Upload className="h-3.5 w-3.5" /> Link External Health Report (PDF/Image)
                      </button>
                    </div>
                  </div>

                  {/* Interactive mock PDF upload sheet form */}
                  {showUploadForm && (
                    <div className="p-6 bg-slate-50 border-b border-slate-200 text-xs text-slate-700 space-y-4 shadow-inner">
                      <div className="flex justify-between items-center border-b pb-2">
                        <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Upload className="h-4 w-4 text-teal-600" />
                          Vault Document Upload Form (Strictly Encrypted locally)
                        </h5>
                        <button onClick={() => setShowUploadForm(false)} className="text-slate-400 hover:text-slate-600 font-extrabold">✕</button>
                      </div>

                      {uploadSuccessMsg && (
                        <div className="bg-teal-50 border border-teal-200 p-2.5 rounded font-bold text-teal-900 flex items-center gap-1.5">
                          <CheckCircle2 className="h-4.5 w-4.5 text-teal-600" />
                          {uploadSuccessMsg}
                        </div>
                      )}

                      {uploadProgress !== null ? (
                        <div className="space-y-2 py-4">
                          <div className="flex justify-between font-bold text-[11px]">
                            <span>Uploading secure payload: {newRecordName || "unnamed_clinical_report"}</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-teal-600 h-full transition-all duration-150" style={{ width: `${uploadProgress}%` }}></div>
                          </div>
                          <span className="text-[10px] text-slate-400 block font-mono">Running secure MD5 CRC audits & AES-256 wrapping...</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <label className="block font-bold text-slate-500 uppercase">Document/Report File Name</label>
                            <input
                              type="text"
                              className="w-full p-2.5 border rounded-lg bg-white"
                              placeholder="e.g. Lipids_Ration_Med.pdf"
                              value={newRecordName}
                              onChange={(e) => setNewRecordName(e.target.value)}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block font-bold text-slate-500">Document Classification Category</label>
                            <select
                              className="w-full p-2.5 border rounded-lg bg-white"
                              value={newRecordType}
                              onChange={(e) => setNewRecordType(e.target.value)}
                            >
                              <option value="Pathology Blood Report">Pathology Blood Report</option>
                              <option value="ECG / Cardiology Scan">ECG / Cardiology Scan</option>
                              <option value="Radiology Chest X-Ray">Radiology Chest X-Ray</option>
                              <option value="COVID Vaccination certificate">Vaccine Certificate</option>
                              <option value="Old Discharge Sheet Summary">Old Discharge Sheet Summary</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="block font-bold text-slate-500">Laboratory / Clinic Issuer Node</label>
                            <input
                              type="text"
                              className="w-full p-2.5 border rounded-lg bg-white"
                              placeholder="e.g. Dr Lal PathLabs, MG Road"
                              value={newRecordLab}
                              onChange={(e) => setNewRecordLab(e.target.value)}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block font-bold text-slate-500">Clinical Remarks Summary</label>
                            <input
                              type="text"
                              className="w-full p-2.5 border rounded-lg bg-white"
                              placeholder="e.g. Blood sugar levels are slightly boundary high"
                              value={newRecordRemarks}
                              onChange={(e) => setNewRecordRemarks(e.target.value)}
                            />
                          </div>
                        </div>
                      )}

                      {uploadProgress === null && (
                        <div className="flex justify-end gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              // Trigger an animated upload sequence
                              if (!newRecordName.trim() || !newRecordLab.trim()) {
                                alert("Please enter both the report filename and issuing lab details.");
                                return;
                              }
                              let p = 0;
                              setUploadProgress(0);
                              const interval = setInterval(() => {
                                p += 20;
                                setUploadProgress(p);
                                if (p >= 100) {
                                  clearInterval(interval);
                                  setTimeout(() => {
                                    // Add to report array
                                    const newRep = {
                                      id: "REC-" + (1000 + Math.floor(Math.random() * 9000)),
                                      filename: newRecordName.endsWith(".pdf") ? newRecordName : `${newRecordName}.pdf`,
                                      type: newRecordType,
                                      date: new Date().toISOString().split("T")[0],
                                      size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
                                      labName: newRecordLab,
                                      remarks: newRecordRemarks.trim() || "Consensus aligned. Cleared by clinician."
                                    };
                                    setCustomRecords(prev => [newRep, ...prev]);
                                    setUploadProgress(null);
                                    setNewRecordName("");
                                    setNewRecordRemarks("");
                                    setNewRecordLab("");
                                    setUploadSuccessMsg(`Document ${newRep.filename} successfully registered, signed and linked in your EMR Vault!`);
                                    setTimeout(() => setUploadSuccessMsg(""), 4500);
                                  }, 500);
                                }
                              }, 150);
                            }}
                            className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-lg"
                          >
                            Encrypt & Transmit to Vault
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Multi-section content grids */}
                  <div className="p-6 space-y-8">
                    
                    {/* SECTION A: DIGITAL PRESCRIPTIONS INSIDE VAULT */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-1.5 border-b pb-1.5">
                        <FileText className="h-5 w-5 text-teal-650" />
                        <h4 className="font-extrabold text-sm text-slate-800 tracking-tight uppercase">Authenticated Clinician E-Prescriptions ({prescriptions.length})</h4>
                      </div>

                      {prescriptions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {prescriptions.map((rx) => (
                            <div key={rx.id} className="border border-slate-350 bg-slate-50 p-5 rounded-2xl flex flex-col justify-between shadow-sm relative hover:border-teal-300 transition">
                              {/* Official Rx header */}
                              <div className="flex justify-between items-start border-b border-slate-300 pb-3">
                                <div>
                                  <span className="text-[9px] bg-teal-600 text-white font-mono px-2 py-0.5 rounded uppercase tracking-wider font-bold">
                                    E-PRESCRIBED Rx
                                  </span>
                                  <h5 className="font-black text-slate-800 text-sm mt-1">Prescription No: {rx.prescriptionNumber}</h5>
                                  <p className="text-[10px] text-slate-500">Date: {rx.date} • Issuer Dr: {rx.doctorName}</p>
                                </div>

                                {/* Mock QR block */}
                                <div className="h-12 w-12 bg-white border border-slate-300 p-1 rounded flex flex-col items-center justify-center text-center">
                                  <div className="grid grid-cols-3 gap-0.5 w-9 h-9 bg-slate-900 rounded">
                                    <span className="bg-white"></span>
                                    <span className="bg-slate-950"></span>
                                    <span className="bg-white"></span>
                                    <span className="bg-slate-950"></span>
                                    <span className="bg-white"></span>
                                    <span className="bg-slate-950"></span>
                                  </div>
                                </div>
                              </div>

                              {/* Vitals Diagnostics */}
                              <div className="py-3 text-xs grid grid-cols-2 gap-3 border-b border-slate-200">
                                <div>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Diagnosis / ICD-10 Code</span>
                                  <p className="font-bold text-slate-800 italic">{rx.provisionalDiagnosis} ({rx.icd10Code})</p>
                                </div>
                                <div>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Patient Vitals recorded</span>
                                  <p className="text-[11px] font-mono text-slate-700">BP: {rx.vitals.bp} • SPO2: {rx.vitals.spo2} • Pulse: {rx.vitals.pulse}</p>
                                </div>
                              </div>

                              {/* Medicines details */}
                              <div className="py-3">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Prescribed Medication regimens</p>
                                <div className="space-y-1.5">
                                  {rx.medicines.map((med, idx) => (
                                    <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs flex justify-between items-center transition hover:bg-slate-50/50">
                                      <div>
                                        <strong className="text-slate-800">{med.name} {med.strength}</strong>
                                        <span className="block text-[10px] text-slate-400 leading-none mt-0.5">{med.frequency} • {med.duration}</span>
                                      </div>
                                      <div className="text-right font-mono text-[11px]">
                                        <span className="font-bold text-teal-700 block text-xs">{med.dosage}</span>
                                        {med.advice && <span className="text-[9px] text-slate-400 block max-w-[120px] truncate" title={med.advice}>{med.advice}</span>}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Diet advices */}
                              <div className="bg-teal-50 border border-teal-100 p-2.5 rounded-lg text-xs text-teal-900 mt-2">
                                <span className="font-bold block text-[10px] uppercase text-teal-800">Diet & Additional Clinical Advice</span>
                                <p className="text-[11px] italic mt-0.5">{rx.lifestyleAdvice || rx.dietAdvice || "No specific advice logged."}</p>
                              </div>

                              {/* Cryptographic metadata signature */}
                              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-4 pt-3 border-t border-slate-200">
                                <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-600" /> Digitally Signed Hash:</span>
                                <b className="text-slate-800">{rx.signature.slice(0, 16)}...</b>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-slate-50 border border-dashed border-slate-300 py-10 rounded-xl text-center text-slate-400">
                          <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                          <p className="font-bold text-xs">No active digitally signed prescriptions found.</p>
                          <p className="text-[11px] mt-0.5">Consult with medical practitioners on the platform to automatically route e-Rx reports here.</p>
                        </div>
                      )}
                    </div>

                    {/* SECTION B: HEALTH DIALOC REPORTS & LINKED RECORDS */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-1.5 border-b pb-1.5">
                        <Layers className="h-5 w-5 text-emerald-650" />
                        <h4 className="font-extrabold text-sm text-slate-800 tracking-tight uppercase">Labs Reports & External Documents Wallet ({customRecords.length})</h4>
                      </div>

                      <div className="bg-white border rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 uppercase text-[9px] tracking-wider text-slate-500 border-b">
                            <tr>
                              <th className="p-3">Record ID</th>
                              <th className="p-3">File Name</th>
                              <th className="p-3">Classification Type</th>
                              <th className="p-3">Laboratory Issuer</th>
                              <th className="p-3">Clinical Remarks / Observations</th>
                              <th className="p-3">Date Added</th>
                              <th className="p-3 text-right">Size</th>
                              <th className="p-3 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-150 font-medium text-slate-700">
                            {customRecords.map((rec) => (
                              <tr key={rec.id} className="hover:bg-slate-50/55 transition [content-visibility:auto]">
                                <td className="p-3 font-mono font-bold text-slate-800">{rec.id}</td>
                                <td className="p-3">
                                  <div className="flex items-center gap-1.5">
                                    <div className="h-7 w-7 bg-red-100 text-red-700 rounded flex items-center justify-center font-bold font-mono text-[9px]" title="PDF Record">
                                      PDF
                                    </div>
                                    <span className="font-bold text-slate-800 hover:underline cursor-pointer" onClick={() => alert(`Opening secure cached file proxy for ${rec.filename}`)}>{rec.filename}</span>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
                                    {rec.type}
                                  </span>
                                </td>
                                <td className="p-3 text-slate-650 text-[11px]">{rec.labName}</td>
                                <td className="p-3 text-slate-450 italic text-[11px] max-w-[200px] truncate" title={rec.remarks}>{rec.remarks}</td>
                                <td className="p-3 text-slate-500 font-mono text-[11px]">{rec.date}</td>
                                <td className="p-3 text-right font-mono text-slate-400 text-[11px]">{rec.size}</td>
                                <td className="p-3 text-center">
                                  <button
                                    onClick={() => {
                                      if (confirm(`Remove linked file ${rec.filename} from your secure government-approved locker?`)) {
                                        setCustomRecords(prev => prev.filter(r => r.id !== rec.id));
                                      }
                                    }}
                                    className="text-red-500 hover:text-red-700 transition p-1"
                                    title="Unlink PDF Report"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* subtab 4: HOME DIAGNOSTICS LABS */}
        {activeTab === "labs" && (
          <div className="flex flex-col gap-6" id="labs-pane">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-base text-slate-800">Home Diagnostic specimen Collection</h3>
                <p className="text-xs text-slate-500">Book trusted NABL accredited pathology tests and check reports directly on your clinic dashboard.</p>
              </div>
              <span className="bg-emerald-50 text-emerald-800 text-xs font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                Acreadited Labs: SRL, Thyrocare, Pathkind
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DEMO_LAB_TESTS.map((test) => {
                const isBooked = bookedLabTests.some(t => t.id === test.id);
                return (
                  <div key={test.id} className="border border-slate-200 p-4 rounded-xl white bg-white shadow-sm flex justify-between items-center">
                    <div>
                      <span className="text-[9px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold uppercase">{test.provider}</span>
                      <h4 className="font-bold text-sm text-slate-800 mt-1">{test.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Report delivery window: {test.duration}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-slate-400 text-xs line-through">₹{test.mrp}</span>
                        <span className="font-black text-slate-900 text-sm">₹{test.price}</span>
                      </div>
                    </div>
                    <div>
                      {isBooked ? (
                        <span className="bg-emerald-150 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 border border-emerald-200">
                          <Check className="h-4 w-4" /> Collection Booked
                        </span>
                      ) : (
                        <button
                          id={`btn-book-test-${test.id}`}
                          onClick={() => handleBookLabTest(test)}
                          className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm"
                        >
                          Book Home Visit
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* subtab 5: FAMILY REGISTRY & PROFILE */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="profile-pane">
            <div className="md:col-span-5 bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-widest border-b border-slate-150 pb-2">Your Demographic Profile</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">Patient Name</span>
                  <input
                    id="prof-name"
                    type="text"
                    className="w-full p-2 border border-slate-200 rounded text-slate-800 font-bold bg-white"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">Mobile Number</span>
                  <input
                    id="prof-mobile"
                    type="text"
                    className="w-full p-2 border border-slate-200 rounded text-slate-850 font-mono bg-white"
                    value={profile.mobile}
                    onChange={(e) => setProfile(prev => ({ ...prev, mobile: e.target.value }))}
                  />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase">Aadhaar (Card Hash)</span>
                  <input
                    id="prof-aadhaar"
                    type="text"
                    className="w-full p-2 border border-slate-200 rounded text-slate-550 font-mono bg-white"
                    placeholder="xxxx-xxxx-xxxx"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Allergy Alerts</span>
                    <input
                      id="prof-allergies"
                      type="text"
                      className="w-full p-2 border border-slate-200 rounded text-slate-800 bg-white"
                      value={profile.allergies.join(", ")}
                      onChange={(e) => setProfile(prev => ({ ...prev, allergies: e.target.value.split(", ") }))}
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Chronic Illness</span>
                    <input
                      id="prof-chronic"
                      type="text"
                      className="w-full p-2 border border-slate-200 rounded text-slate-800 bg-white"
                      value={profile.chronic.join(", ")}
                      onChange={(e) => setProfile(prev => ({ ...prev, chronic: e.target.value.split(", ") }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Family registry management */}
            <div className="md:col-span-7 bg-white p-5 border border-slate-200 rounded-xl space-y-4">
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">Family Dependents Registry ({family.length})</h3>

              <form onSubmit={handleAddFamily} className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                <div className="sm:col-span-1.5">
                  <input
                    id="fam-name"
                    type="text"
                    placeholder="Full Name"
                    className="w-full p-2 border border-slate-200 rounded bg-white"
                    value={newFamilyInput.name}
                    onChange={(e) => setNewFamilyInput(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <select
                    id="fam-relation"
                    className="w-full p-2 border border-slate-200 rounded bg-white text-slate-700"
                    value={newFamilyInput.relation}
                    onChange={(e) => setNewFamilyInput(prev => ({ ...prev, relation: e.target.value }))}
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    <option value="Parent">Parent</option>
                    <option value="Grandparent">Grandparent</option>
                  </select>
                </div>
                <div>
                  <input
                    id="fam-age"
                    type="number"
                    placeholder="Age"
                    className="w-full p-2 border border-slate-150 rounded bg-white"
                    value={newFamilyInput.age}
                    onChange={(e) => setNewFamilyInput(prev => ({ ...prev, age: e.target.value }))}
                  />
                </div>
                <div className="sm:col-span-4 flex gap-2">
                  <input
                    id="fam-history"
                    type="text"
                    placeholder="Chronic History (e.g. Hypertension)"
                    className="flex-1 p-2 border border-slate-150 rounded bg-white"
                    value={newFamilyInput.history}
                    onChange={(e) => setNewFamilyInput(prev => ({ ...prev, history: e.target.value }))}
                  />
                  <button
                    id="btn-add-family"
                    type="submit"
                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 rounded"
                  >
                    Register Member
                  </button>
                </div>
              </form>

              <div className="space-y-2">
                {family.map((fam, idx) => (
                  <div key={idx} className="border border-slate-150 p-3 rounded-lg flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{fam.name} ({fam.relation})</p>
                      <p className="text-[10px] text-slate-500">Age: {fam.age} • History: {fam.history}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Appointment Confirmation Overlay Model: Showing exact WhatsApp / SMS messages */}
      {lastConfirmedAppt && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in" id="appointment-dispatch-modal">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] antialiased">
            {/* Header banner */}
            <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-slate-950 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="bg-white/20 p-2 rounded-xl">
                  <CheckCircle2 className="h-5.5 w-5.5 text-teal-300 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight leading-none">Booking Receipt & Dispatch Confirmation</h3>
                  <p className="text-[10px] text-teal-200 mt-1 uppercase font-mono tracking-wider font-semibold">Dynamic WhatsApp & SMS Gateway Confirmed</p>
                </div>
              </div>
              <button 
                onClick={() => setLastConfirmedAppt(null)}
                className="hover:bg-white/10 text-white p-1.5 rounded-full transition text-xs font-bold"
                id="btn-close-dispatch-top"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-slate-800">
              
              {/* Token Receipt details */}
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="space-y-1 text-center md:text-left">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Clinician Connected</p>
                  <strong className="text-slate-900 text-base block">{lastConfirmedAppt.doctorName}</strong>
                  <span className="bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded font-bold text-[10.5px] inline-block mt-1">
                    {lastConfirmedAppt.specialty}
                  </span>
                  <div className="text-[11px] text-slate-500 mt-2 space-y-0.5 font-medium">
                    <p>📅 <strong>Schedule Date:</strong> {lastConfirmedAppt.date}</p>
                    <p>⏰ <strong>Time Slot:</strong> {lastConfirmedAppt.timeSlot}</p>
                    <p>💼 <strong>Consult mode:</strong> {lastConfirmedAppt.mode}</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-teal-600 to-emerald-700 text-white p-4 rounded-2xl text-center w-36 shadow-md border border-teal-400 shrink-0">
                  <span className="text-[9px] uppercase font-bold text-teal-100 tracking-widest block mb-0.5">QUEUE TOKEN</span>
                  <p className="text-4xl font-black font-sans leading-none my-1 tracking-tight">#{lastConfirmedAppt.tokenNumber}</p>
                  <p className="text-[9.5px] text-teal-200 font-mono mt-1">Live status updated</p>
                </div>
              </div>

              {/* Dynamic SMS confirmation message carrier */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                    📲 Carrier SMS Dispatched Receipt
                  </span>
                  <span className="text-[9.5px] font-mono text-slate-400">Sender: ID-MEDCON</span>
                </div>
                <div className="bg-slate-950 text-slate-100 rounded-2xl p-4 font-mono text-[11px] relative overflow-hidden border border-slate-800 shadow-inner">
                  <div className="absolute right-3 top-3 bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded text-[8.5px] font-bold tracking-tight">
                    DELIVERED ✓
                  </div>
                  <p className="text-slate-400 mb-1">To: +91 99887 76655</p>
                  <div className="border-t border-slate-800 mt-2 pt-2 text-slate-200 whitespace-pre-wrap leading-relaxed">
                    SMS_CONFIRMED: Namaste Aarav, your tele-con consultation with {lastConfirmedAppt.doctorName} is successfully booked! Token allocated: #{lastConfirmedAppt.tokenNumber}. Date: {lastConfirmedAppt.date}, Time: {lastConfirmedAppt.timeSlot}. Login at your client portal to join HD secure WebRTC videocall node. Click: https://medconnect.io/tele/{lastConfirmedAppt.id}
                  </div>
                </div>
              </div>

              {/* Secure WhatsApp Chat receipt */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                    💚 Secure WhatsApp Confirmation Node
                  </span>
                  <span className="text-[9.5px] font-mono text-slate-400">Recipient: +91 99887 76655</span>
                </div>
                <div className="bg-slate-900 text-slate-100 rounded-2xl overflow-hidden border border-slate-800 shadow">
                  {/* WhatsApp contact bar */}
                  <div className="bg-slate-950 p-2.5 px-4 border-b border-slate-850 flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse animate-ping"></div>
                    <span className="text-xs font-bold text-slate-200">MedConnect Automated Concierge (Verified Hub)</span>
                  </div>
                  {/* WhatsApp message bubble */}
                  <div className="p-4 bg-emerald-950/20 text-[11px] leading-relaxed">
                    <div className="bg-emerald-900/30 border border-emerald-500/20 p-3.5 rounded-2xl rounded-tl-none max-w-[90%] text-slate-200 space-y-2 font-sans relative">
                      <p className="font-extrabold text-teal-400">🟢 MedConnect Health Network</p>
                      <p>Dear <strong>Aarav Sharma</strong>,</p>
                      <p className="leading-normal">
                        Your electronic outpatient token reservation is completed. Our active hospital-clinician routing engine has registered your digital portfolio inside our clinic stream.
                      </p>
                      <div className="bg-slate-950/45 p-2 rounded-lg border border-teal-500/10 space-y-0.5 text-[10.5px]">
                        <p>👤 <strong>Doctor:</strong> {lastConfirmedAppt.doctorName}</p>
                        <p>🏥 <strong>Depart:</strong> {lastConfirmedAppt.specialty}</p>
                        <p>⏱️ <strong>Slot:</strong> {lastConfirmedAppt.timeSlot}</p>
                        <p>🏷️ <strong>Token:</strong> #{lastConfirmedAppt.tokenNumber}</p>
                      </div>
                      <p className="text-[10px] text-teal-400 font-bold leading-normal">
                        🔗 Click here to immediately test your home vitals telemetry or check for prescribing updates: <span className="underline hover:text-teal-300 cursor-pointer">https://medconnect.io/portal-active</span>
                      </p>
                      <span className="text-[8px] text-slate-400 block text-right mt-1.5">Sent at {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • Read ✓✓</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-1.5 text-[10.5px] text-slate-500 font-semibold">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                <span>Simulated Telecom Gateway • Fully instant routing</span>
              </div>
              <button
                id="btn-confirm-close-receipt"
                onClick={() => setLastConfirmedAppt(null)}
                className="bg-slate-900 hover:bg-slate-800 text-teal-400 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all self-stretch sm:self-auto text-center"
              >
                Acknowledge & Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
