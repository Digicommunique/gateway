/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Doctor, Specialty, Pharmacy, Product, CartItem, Appointment, Order, Prescription, EmpanelmentStatus, ConsultationMode, DeliveryAgent } from "./types";
import { INITIAL_DOCTORS, INITIAL_SPECIALTIES, INITIAL_PHARMACIES, INITIAL_PRODUCTS, INITIAL_CAMPAIGNS, INITIAL_CITIES } from "./data";

import AdminPanel from "./components/AdminPanel";
import DoctorPortal from "./components/DoctorPortal";
import PatientPortal from "./components/PatientPortal";
import PharmacyPanel from "./components/PharmacyPanel";
import DeliveryPanel from "./components/DeliveryPanel";
import TelemetryDiagnostics from "./components/TelemetryDiagnostics";
import LoginScreen from "./components/LoginScreen";

import { Shield, Stethoscope, Users, Building, Truck, Sparkles, PhoneCall, Heart, Crosshair, LogOut } from "lucide-react";

export default function App() {
  // Shared global state mimicking full-stack databases
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [specialties, setSpecialties] = useState<Specialty[]>(INITIAL_SPECIALTIES);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>(INITIAL_PHARMACIES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS);
  const [cities, setCities] = useState(INITIAL_CITIES);
  const [deliveryAgents, setDeliveryAgents] = useState<DeliveryAgent[]>([
    { id: "DA-101", name: "Rohan Gupta", type: "Hired Rider", contact: "+91 98210 11223", status: "Available", vehicle: "Electric Scooter", agency: "In-House Speedforce", rating: 4.9, createdByAdmin: true },
    { id: "DA-102", name: "Amit Kumar", type: "Hired Rider", contact: "+91 97110 44556", status: "On Trip", vehicle: "Two-Wheeler Bike", agency: "In-House Speedforce", rating: 4.7 },
    { id: "DA-103", name: "Delhivery Med-Logistics", type: "Approved Courier Agency", contact: "+91 11 3912 4000", status: "Available", vehicle: "Refrigerated Van Fleet", agency: "Delhivery Ltd", rating: 4.8, createdByAdmin: true },
    { id: "DA-104", name: "BlueDart Pharma-Express", type: "Approved Courier Agency", contact: "+91 80 4422 1100", status: "Available", vehicle: "Aero Cargo / Cold-Chain", agency: "BlueDart Express", rating: 4.9 },
    { id: "DA-105", name: "Suresh Pillai", type: "Hired Rider", contact: "+91 91520 99881", status: "Inactive", vehicle: "Electric Scooter", agency: "In-House Speedforce", rating: 4.5 }
  ]);

  // Authentication & Credentials Manager State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [credentialsList, setCredentialsList] = useState([
    {
      id: "cred-patient",
      role: "patient" as const,
      roleLabel: "Patient Marketplace & Outpatient App",
      email: "aarav@gmail.com",
      name: "Aarav Sharma",
      password: "aarav123"
    },
    {
      id: "cred-doctor",
      role: "doctor" as const,
      roleLabel: "Doctor Workspace & Telehealth Room",
      email: "dr.alok@medconnect.org",
      name: "Dr. Alok Sharma",
      password: "alok123"
    },
    {
      id: "cred-pharmacy",
      role: "pharmacy" as const,
      roleLabel: "Pharma Partner Store #12",
      email: "apollo@pharmacy.com",
      name: "Apollo Pharmacy Store #12",
      password: "apollo123"
    },
    {
      id: "cred-delivery",
      role: "delivery" as const,
      roleLabel: "Logistics Delivery Runner Desk",
      email: "flash@delivery.com",
      name: "Flash Courier Partner",
      password: "delivery123"
    },
    {
      id: "cred-admin",
      role: "admin" as const,
      roleLabel: "Ecosystem Administrator Console",
      email: "admin@medconnect.org",
      name: "Ecosystem Administrator",
      password: "admin123"
    }
  ]);

  // Active user screen selection
  const [activeRole, setActiveRole] = useState<"admin" | "doctor" | "patient" | "pharmacy" | "delivery" | "triage">("patient");

  // Telehealth Appointment queue state
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: "appt-demo-1",
      patientId: "UHID-209420",
      patientName: "Aarav Sharma",
      patientAge: 32,
      patientGender: "Male",
      patientAllergies: ["Penicillin"],
      patientChronic: ["Mild Asthma"],
      doctorId: "DOC-0021", // Dr Alok Sharma Gen Medicine
      doctorName: "Dr. Alok Sharma",
      specialty: "General Medicine",
      date: new Date().toISOString().split("T")[0],
      timeSlot: "10:30 AM - 11:00 AM",
      mode: ConsultationMode.VIDEO,
      status: "Scheduled",
      symptoms: "Persistent dry cough, body fatigue, low grade fever",
      vitals: { temp: "98.9 F", pulse: "80 bpm", bp: "124/82 mmhg", spo2: "97%", rr: "16" },
      tokenNumber: 1
    },
    {
      id: "appt-demo-2",
      patientId: "UHID-892014",
      patientName: "Siddharth Joshi",
      patientAge: 58,
      patientGender: "Male",
      patientAllergies: [],
      patientChronic: ["Secondary Hypertension"],
      doctorId: "DOC-2810", // Dr Rajesh Iyer Cardiology
      doctorName: "Dr. Rajesh Iyer",
      specialty: "Cardiology",
      date: new Date().toISOString().split("T")[0],
      timeSlot: "11:45 AM - 12:15 PM",
      mode: ConsultationMode.VIDEO,
      status: "Scheduled",
      symptoms: "Chest tightness, sudden pulse flutter during climbing stairs",
      vitals: { temp: "98.4 F", pulse: "92 bpm", bp: "148/94 mmhg", spo2: "96%", rr: "18" },
      tokenNumber: 2
    }
  ]);

  // EMR digital prescription registry
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  // Marketplace states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ORD-92815",
      patientName: "Aarav Sharma",
      deliveryAddress: "Flat 402, Oakwood Appts, Near MG Road",
      city: "Bengaluru",
      pincode: "560001",
      items: [
        { product: INITIAL_PRODUCTS[3], quantity: 1 }, // Paracetamol
        { product: INITIAL_PRODUCTS[4], quantity: 1 }  // Benadryl Form
      ],
      subtotal: 175,
      tax: 21,
      deliveryFee: 50,
      total: 246,
      allocatedPharmacyId: "PHARM-01",
      allocatedPharmacyName: "Apollo Pharmacy Store #12",
      routingLogic: {
        reason: "Smart Allocation: Routed to local Preferred Pharmacy with matching stock reserves.",
        priorityOrder: ["Preferred Local Pharmacy", "Nearest outlet"]
      },
      status: "Preparing",
      deliveryOTP: "4820",
      deliveryPartnerName: "Flash Logistics Hub",
      commissionPlatform: 24,
      commissionPharmacy: 222
    }
  ]);

  // platform revenue diagnostics stats
  const [revenueStats, setRevenueStats] = useState({
    totalConsultations: 3,
    platformConsultationShare: 1497 * 0.20, // 20% convenienve share represent
    platformPharmacyEarn: 246 * 0.12, // Avg pharmacy cut represent
    platformDiagEarn: 349 * 0.15 // Avg diag lab share
  });

  const addRevenue = (consultationFee: number) => {
    setRevenueStats(prev => ({
      ...prev,
      totalConsultations: prev.totalConsultations + 1,
      platformConsultationShare: prev.platformConsultationShare + (consultationFee * 0.20)
    }));
  };

  if (!isAuthenticated) {
    return (
      <LoginScreen
        onLoginSuccess={(role) => {
          setIsAuthenticated(true);
          setActiveRole(role);
        }}
        credentialsList={credentialsList}
        setCredentialsList={setCredentialsList}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800" id="main-application-frame">
      
      {/* Global Top Navigation Bar */}
      <header className="bg-slate-950 text-white border-b border-slate-900 sticky top-0 z-40 px-6 py-4 shadow-md flex flex-col md:flex-row gap-4 items-center justify-between" id="global-header">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-teal-500 rounded-xl flex items-center justify-center font-bold text-slate-950 font-sans tracking-tight border border-teal-400">
            H+
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight font-sans leading-none">MEDCONNECT ECOSYSTEM</h1>
            <p className="text-[10px] text-teal-400 font-mono tracking-wider mt-1 uppercase font-semibold">Online Consultations, E-Rx, Smart E-Pharmacy Router</p>
          </div>
          <button
            id="btn-global-logout"
            onClick={() => setIsAuthenticated(false)}
            className="ml-3 bg-red-950/45 hover:bg-red-900 border border-red-900 text-red-200 px-2.5 py-1 rounded-xl text-[10.5px] font-bold transition flex items-center gap-1 shrink-0"
          >
            <LogOut className="h-3 w-3" />
            <span>Logout</span>
          </button>
        </div>

        {/* Global Role Switcher - Simulation Dashboard Controls */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800" id="global-tabs">
          <p className="hidden xl:block text-[10px] font-bold text-slate-500 uppercase px-2">Role switcher sandbox:</p>
          
          <button
            id="tab-btn-patient"
            onClick={() => setActiveRole("patient")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeRole === "patient" ? "bg-teal-500 text-slate-950 shadow-md font-extrabold" : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Patient App</span>
          </button>

          <button
            id="tab-btn-doctor"
            onClick={() => setActiveRole("doctor")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeRole === "doctor" ? "bg-teal-500 text-slate-950 shadow-md font-extrabold" : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Stethoscope className="h-3.5 w-3.5" />
            <span>Doctor Portal</span>
          </button>

          <button
            id="tab-btn-pharmacy"
            onClick={() => setActiveRole("pharmacy")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeRole === "pharmacy" ? "bg-teal-500 text-slate-950 shadow-md font-extrabold" : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Building className="h-3.5 w-3.5" />
            <span>Pharma Partner</span>
          </button>

          <button
            id="tab-btn-delivery"
            onClick={() => setActiveRole("delivery")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeRole === "delivery" ? "bg-teal-500 text-slate-950 shadow-md font-extrabold" : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Truck className="h-3.5 w-3.5" />
            <span>Delivery Courier</span>
          </button>

          <button
            id="tab-btn-admin"
            onClick={() => setActiveRole("admin")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeRole === "admin" ? "bg-teal-500 text-slate-950 shadow-md font-extrabold" : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Admin Console</span>
          </button>

          <button
            id="tab-btn-triage"
            onClick={() => setActiveRole("triage")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeRole === "triage" ? "bg-teal-400/25 text-teal-300 border border-teal-500/25 font-extrabold" : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <Crosshair className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
            <span>AI Symptom Triage</span>
          </button>
        </div>
      </header>

      {/* Main Container Stage Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 lg:p-6 flex flex-col gap-6" id="applet-viewport">
        
        {/* Floating AI banner info matching active role */}
        <div className="bg-gradient-to-r from-teal-500/10 via-sky-500/5 to-transparent border border-teal-500/15 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-700" id="role-context-badge">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4.5 w-4.5 text-teal-600 animate-pulse shrink-0" />
            <div>
              <p className="font-bold text-slate-800">
                {activeRole === "patient" && "Active Role: Patient Dashboard & E-Pharmacy Marketplace"}
                {activeRole === "doctor" && "Active Role: Clinician Examination Room & Secured E-Prescription Desk"}
                {activeRole === "pharmacy" && "Active Role: Contracted Pharmacy Network & Dispensation desk"}
                {activeRole === "admin" && "Active Role: Super Admin Location, Licensing Onboard & display Ad Tender office"}
                {activeRole === "delivery" && "Active Role: Dispatch Carrier Last-Mile OTP Authentication"}
                {activeRole === "triage" && "Active Role: Clinical Symptom triage checking engine and referral router"}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {activeRole === "patient" && "Book a telemedicine consultation or buy medicine from local empanelled pharmacies under custom routing priority."}
                {activeRole === "doctor" && "Examine queued appointments, view allergies, entry vitals, audit contraindications and seal your professional sign code on Rx sheets."}
                {activeRole === "pharmacy" && "Review incoming orders routed by Smart Pharmacy Allocation Engine, verify licenses, print GST receipts, and dispatch parcels."}
                {activeRole === "admin" && "Verify medical doctor credentials, evaluate state operational areas, configure base specialist parameters, view analytics summaries."}
                {activeRole === "delivery" && "Retrieve packages out for physical logistics and log customer's payment token code to verify delivery."}
                {activeRole === "triage" && "Analyze subjective health problems to yield matched ICD codes and referral specialists before scheduling consults."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 font-mono text-[11px] font-bold shrink-0">
            <span className="bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded">
              Mock Network: Connected
            </span>
          </div>
        </div>

        {/* Dynamic Panel Mount */}
        <div className="flex-1 w-full" id="role-mount-stage">
          {activeRole === "admin" && (
            <AdminPanel
              doctors={doctors}
              setDoctors={setDoctors}
              specialties={specialties}
              setSpecialties={setSpecialties}
              pharmacies={pharmacies}
              setPharmacies={setPharmacies}
              campaigns={campaigns}
              setCampaigns={setCampaigns}
              cities={cities}
              setCities={setCities}
              revenueStats={revenueStats}
              appointments={appointments}
              orders={orders}
              products={products}
              setProducts={setProducts}
              deliveryAgents={deliveryAgents}
              setDeliveryAgents={setDeliveryAgents}
            />
          )}

          {activeRole === "doctor" && (
            <DoctorPortal
              doctors={doctors}
              appointments={appointments}
              setAppointments={setAppointments}
              prescriptions={prescriptions}
              setPrescriptions={setPrescriptions}
              addRevenue={addRevenue}
            />
          )}

          {activeRole === "patient" && (
            <PatientPortal
              doctors={doctors}
              specialties={specialties}
              pharmacies={pharmacies}
              products={products}
              cities={cities}
              appointments={appointments}
              setAppointments={setAppointments}
              cart={cart}
              setCart={setCart}
              orders={orders}
              setOrders={setOrders}
              prescriptions={prescriptions}
              setPrescriptions={setPrescriptions}
              campaigns={campaigns}
              setCampaigns={setCampaigns}
            />
          )}

          {activeRole === "pharmacy" && (
            <PharmacyPanel
              pharmacies={pharmacies}
              orders={orders}
              setOrders={setOrders}
              products={products}
              setProducts={setProducts}
              activeRole={activeRole}
            />
          )}

          {activeRole === "delivery" && (
            <DeliveryPanel
              orders={orders}
              setOrders={setOrders}
              deliveryAgents={deliveryAgents}
              setDeliveryAgents={setDeliveryAgents}
              activeRole={activeRole}
            />
          )}

          {activeRole === "triage" && (
            <TelemetryDiagnostics
              onSelectRole={(role) => setActiveRole(role)}
            />
          )}
        </div>
      </main>

      {/* Unified Global Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 text-center" id="global-footer">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" />
            <span className="font-semibold text-slate-300">MedConnect Healthcare Enterprise Suite v1.12</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4 font-normal text-slate-500">
            <span>Telemedicine Consent Policy Compliance</span>
            <span>•</span>
            <span>Drug Controller General of India (DCGI) Compliant</span>
            <span>•</span>
            <span>NABL Integrated Diagnostics Lab API Ready</span>
          </div>
          <p className="text-[10px] text-slate-600 font-mono">© 2026 MedConnect Inc. High-fidelity medical network simulation.</p>
        </div>
      </footer>

    </div>
  );
}
