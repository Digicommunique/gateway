/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Doctor, Specialty, Pharmacy, AdCampaign, EmpanelmentStatus, Appointment, Order, Product, DeliveryAgent } from "../types";
import { Shield, MapPin, Stethoscope, FileText, Percent, Award, Megaphone, CheckCircle2, XCircle, Clock, Video, FileCheck, Check, Plus, Trash2, TrendingUp, Users, BookOpen, Landmark, RefreshCw, AlertTriangle, FileSpreadsheet, Scale, Filter, ChevronRight, Calculator, HelpCircle, Pencil, Lock } from "lucide-react";
import AccountingDashboard from "./AccountingDashboard";

interface AdminPanelProps {
  doctors: Doctor[];
  setDoctors: React.Dispatch<React.SetStateAction<Doctor[]>>;
  specialties: Specialty[];
  setSpecialties: React.Dispatch<React.SetStateAction<Specialty[]>>;
  pharmacies: Pharmacy[];
  setPharmacies: React.Dispatch<React.SetStateAction<Pharmacy[]>>;
  campaigns: AdCampaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<AdCampaign[]>>;
  cities: string[];
  setCities: React.Dispatch<React.SetStateAction<string[]>>;
  revenueStats: {
    totalConsultations: number;
    platformConsultationShare: number;
    platformPharmacyEarn: number;
    platformDiagEarn: number;
  };
  appointments: Appointment[];
  orders: Order[];
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  deliveryAgents: DeliveryAgent[];
  setDeliveryAgents: React.Dispatch<React.SetStateAction<DeliveryAgent[]>>;
}

export default function AdminPanel({
  doctors,
  setDoctors,
  specialties,
  setSpecialties,
  pharmacies,
  setPharmacies,
  campaigns,
  setCampaigns,
  cities,
  setCities,
  revenueStats,
  appointments,
  orders,
  products,
  setProducts,
  deliveryAgents,
  setDeliveryAgents
}: AdminPanelProps) {
  // Inline edit state variables
  const [editingDoc, setEditingDoc] = useState<Doctor | null>(null);
  const [editingPharmacy, setEditingPharmacy] = useState<Pharmacy | null>(null);
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<AdCampaign | null>(null);
  // Tabs within Admin panel
  const [activeSubTab, setActiveSubTab] = useState<"masters" | "empanelment" | "commissions" | "ads" | "analytics" | "accounting">("empanelment");

  // Master Settings state
  const [platformSettings, setPlatformSettings] = useState({
    name: "MedConnect Hub",
    gstNo: "22AAAAA1111A1Z0",
    panNo: "AAACM5500A",
    supportEmail: "support@medconnecthub.com",
    supportPhone: "+91 1800 200 4500",
    prescriptionTemplate: "Standard Rx with Digital Verification QR & Encrypted Keys",
    disclaimer: "This digital consultation is not suitable for severe medical emergencies."
  });

  // Doctor Selected for Workflow progression
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const selectedDoc = doctors.find((d) => d.id === selectedDocId);

  // Form states for adding elements
  const [newCity, setNewCity] = useState("");
  const [newSpec, setNewSpec] = useState({ name: "", description: "", minFee: 300, maxFee: 600 });
  const [newAd, setNewAd] = useState({ title: "", advertiser: "", type: "Banner Ad" as const, imageUrl: "", targetLink: "" });

  const handleUpdateDocStatus = (id: string, newStatus: EmpanelmentStatus) => {
    setDoctors(prev => prev.map(doc => doc.id === id ? { ...doc, status: newStatus } : doc));
  };

  const handleUpdatePharmacyStatus = (id: string, status: "Active" | "Approval Pending" | "Rejected") => {
    setPharmacies(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const handleAddCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCity && !cities.includes(newCity)) {
      setCities(prev => [...prev, newCity]);
      setNewCity("");
    }
  };

  const handleAddSpecialty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpec.name) return;
    const added: Specialty = {
      id: `spec-${Date.now()}`,
      name: newSpec.name,
      description: newSpec.description,
      consultationFeeRange: `₹${newSpec.minFee} - ₹${newSpec.maxFee}`,
      displayOrder: specialties.length + 1,
      status: "Active",
      createdByAdmin: true
    };
    setSpecialties(prev => [...prev, added]);
    setNewSpec({ name: "", description: "", minFee: 300, maxFee: 600 });
  };

  const handleAddAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAd.title || !newAd.advertiser) return;
    const added: AdCampaign = {
      id: `ad-${Date.now()}`,
      ...newAd,
      imageUrl: newAd.imageUrl || "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=300&auto=format&fit=crop",
      impressions: 0,
      clicks: 0,
      createdByAdmin: true
    };
    setCampaigns(prev => [...prev, added]);
    setNewAd({ title: "", advertiser: "", type: "Banner Ad", imageUrl: "", targetLink: "" });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="admin-panel-root">
      {/* Admin Sidebar Navigation */}
      <div className="lg:col-span-3 bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800 flex flex-col gap-1 shadow-md" id="admin-sidebar">
        <div className="flex items-center gap-2 mb-6 px-2">
          <Shield className="h-6 w-6 text-teal-400" />
          <h3 className="font-semibold text-lg tracking-tight">Admin Console</h3>
        </div>

        <button
          id="btn-subtab-empanelment"
          onClick={() => setActiveSubTab("empanelment")}
          className={`w-full text-left py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${
            activeSubTab === "empanelment"
              ? "bg-teal-500/20 text-teal-300 border-l-4 border-teal-500"
              : "hover:bg-slate-800 text-slate-300"
          }`}
        >
          <Award className="h-4 w-4" />
          <span>Empanelment Hub</span>
        </button>

        <button
          id="btn-subtab-masters"
          onClick={() => setActiveSubTab("masters")}
          className={`w-full text-left py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${
            activeSubTab === "masters"
              ? "bg-teal-500/20 text-teal-300 border-l-4 border-teal-500"
              : "hover:bg-slate-800 text-slate-300"
          }`}
        >
          <MapPin className="h-4 w-4" />
          <span>System Masters</span>
        </button>

        <button
          id="btn-subtab-commissions"
          onClick={() => setActiveSubTab("commissions")}
          className={`w-full text-left py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${
            activeSubTab === "commissions"
              ? "bg-teal-500/20 text-teal-300 border-l-4 border-teal-500"
              : "hover:bg-slate-800 text-slate-300"
          }`}
        >
          <Percent className="h-4 w-4" />
          <span>Commissions & Fees</span>
        </button>

        <button
          id="btn-subtab-ads"
          onClick={() => setActiveSubTab("ads")}
          className={`w-full text-left py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${
            activeSubTab === "ads"
              ? "bg-teal-500/20 text-teal-300 border-l-4 border-teal-500"
              : "hover:bg-slate-800 text-slate-300"
          }`}
        >
          <Megaphone className="h-4 w-4" />
          <span>Promo & Ad Manager</span>
        </button>

        <button
          id="btn-subtab-analytics"
          onClick={() => setActiveSubTab("analytics")}
          className={`w-full text-left py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${
            activeSubTab === "analytics"
              ? "bg-teal-500/20 text-teal-300 border-l-4 border-teal-500"
              : "hover:bg-slate-800 text-slate-300"
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span>Ecosystem Reports</span>
        </button>

        <button
          id="btn-subtab-accounting"
          onClick={() => setActiveSubTab("accounting")}
          className={`w-full text-left py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${
            activeSubTab === "accounting"
              ? "bg-teal-500/20 text-teal-300 border-l-4 border-teal-500"
              : "hover:bg-slate-800 text-slate-300"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Treasury & Ledger</span>
        </button>

        <div className="mt-8 border-t border-slate-800 pt-6 px-2 text-xs text-slate-400">
          <p className="font-semibold text-slate-200">Logged in as:</p>
          <p className="mt-1 font-mono text-slate-400">Super Admin / Audit Officer</p>
          <p className="text-[10px] text-slate-500 mt-2">Active Node: Cloud Run v1.0.8</p>
        </div>
      </div>

      {/* Main Admin Content Panel */}
      <div className="lg:col-span-9 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-6" id="admin-main-content">
        
        {/* subtab 1: DR EMPANELMENT & VERIFICATION WORKFLOWS */}
        {activeSubTab === "empanelment" && (
          <div className="flex flex-col gap-6" id="empanelment-tab">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 font-sans tracking-tight">Onboarding & Empanelment Board</h2>
                <p className="text-sm text-slate-500 mt-1">Medical Registrations, credential verification checks, and agreement status.</p>
              </div>
              <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 font-mono">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                Action Required
              </span>
            </div>

            {/* Doctor Verification Workflow Tracker */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
              {/* Doc list left */}
              <div>
                <h4 className="font-semibold text-sm text-slate-700 mb-3 flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-teal-600" />
                  Doctor Applications ({doctors.length})
                </h4>
                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                  {doctors.map((doc) => (
                    <button
                      id={`btn-select-doc-${doc.id}`}
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                        selectedDocId === doc.id
                          ? "bg-teal-50 border-teal-300 shadow-sm"
                          : "bg-white border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img src={doc.photoUrl} alt={doc.name} className="h-9 w-9 rounded-full object-cover border border-slate-200" referrerPolicy="no-referrer" />
                        <div>
                          <p className="font-semibold text-sm text-slate-800">{doc.name}</p>
                          <p className="text-xs text-slate-500">{doc.specialty} • {doc.experience} yr exp</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        doc.status === EmpanelmentStatus.APPROVED ? "bg-emerald-100 text-emerald-800" :
                        doc.status === EmpanelmentStatus.PENDING ? "bg-amber-100 text-amber-800" :
                        doc.status === EmpanelmentStatus.UNDER_REVIEW ? "bg-sky-100 text-sky-800" : "bg-red-100 text-red-800"
                      }`}>
                        {doc.status}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Workflow details right */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                {selectedDoc ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                      <div>
                        <h5 className="font-bold text-slate-800 text-sm">{selectedDoc.name}</h5>
                        <p className="text-xs text-slate-500">{selectedDoc.qualification} • {selectedDoc.registrationNumber}</p>
                      </div>
                      <span className="text-xs font-mono font-semibold text-teal-600 bg-teal-50 px-2 py-1 rounded">
                        {selectedDoc.id}
                      </span>
                    </div>

                    {/* Sequential Progress pipeline */}
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-bold text-slate-600">6-Stage Empanelment Progress Checklist:</p>
                      <div className="space-y-2">
                        {/* Step 1 */}
                        <div className="flex items-center gap-2.5 text-xs text-slate-700">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span className="line-through text-slate-400">1. Verified MBBS Certificate</span>
                        </div>
                        {/* Step 2 */}
                        <div className="flex items-center justify-between text-xs text-slate-700">
                          <div className="flex items-center gap-2.5">
                            {selectedDoc.documents.mdms ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <Clock className="h-4 w-4 text-amber-500" />
                            )}
                            <span className={selectedDoc.documents.mdms ? "line-through text-slate-400" : ""}>2. MD/MS Postgraduate Specialization Verify</span>
                          </div>
                          {!selectedDoc.documents.mdms && (
                            <button
                              id="btn-verify-md"
                              onClick={() => {
                                setDoctors(prev => prev.map(d => d.id === selectedDoc.id ? { ...d, documents: { ...d.documents, mdms: true } } : d));
                              }}
                              className="text-[10px] text-teal-600 hover:underline font-semibold"
                            >
                              Approve Doc
                            </button>
                          )}
                        </div>
                        {/* Step 3 */}
                        <div className="flex items-center gap-2.5 text-xs text-slate-700">
                          {selectedDoc.documents.registration ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-amber-500" />
                          )}
                          <span>3. Medical Council Registration Check ({selectedDoc.medicalCouncil})</span>
                        </div>
                        {/* Step 4 */}
                        <div className="flex items-center justify-between text-xs text-slate-700">
                          <div className="flex items-center gap-2.5">
                            <Video className="h-4 w-4 text-blue-500" />
                            <span>4. Credentialing Video Interview</span>
                          </div>
                          <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">Completed</span>
                        </div>
                        {/* Step 5 */}
                        <div className="flex items-center justify-between text-xs text-slate-700">
                          <div className="flex items-center gap-2.5">
                            <FileCheck className="h-4 w-4 text-indigo-500" />
                            <span>5. Agreement Executed (E-Signature)</span>
                          </div>
                          {selectedDoc.documents.signature ? (
                            <span className="text-[10px] font-mono text-slate-500">Key: {selectedDoc.documents.signature.slice(0, 10)}...</span>
                          ) : (
                            <span className="text-[10px] text-amber-600 font-semibold animate-pulse">Signature Pending</span>
                          )}
                        </div>
                        {/* Step 6 */}
                        <div className="flex items-center gap-2.5 text-xs text-slate-700">
                          {selectedDoc.status === EmpanelmentStatus.APPROVED ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-slate-300" />
                          )}
                          <span className={selectedDoc.status === EmpanelmentStatus.APPROVED ? "text-slate-800 font-semibold" : "text-slate-400"}>6. Issue Portal Access Credentials & Live Onboarding</span>
                        </div>
                      </div>
                    </div>

                    {/* Change Status Action trigger buttons */}
                    <div className="mt-2 pt-3 border-t border-slate-100 flex flex-wrap justify-end gap-2 items-center">
                      <button
                        id="btn-edit-doctor-profile"
                        type="button"
                        onClick={() => setEditingDoc(selectedDoc)}
                        className="bg-slate-100 hover:bg-slate-200 border text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-sm"
                      >
                        <Pencil className="h-3 w-3 text-teal-600" /> Edit Profile
                      </button>

                      <button
                        id={`btn-delete-doctor-${selectedDoc.id}`}
                        type="button"
                        onClick={() => {
                          if (confirm(`Completely remove Dr. ${selectedDoc.name} from empanelment directory?`)) {
                            setDoctors(prev => prev.filter(d => d.id !== selectedDoc.id));
                            setSelectedDocId("");
                          }
                        }}
                        className="bg-red-50 text-red-650 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-sm"
                      >
                        <Trash2 className="h-3 w-3" /> De-Empanel
                      </button>

                      <span className="text-slate-200">|</span>

                      {selectedDoc.status !== EmpanelmentStatus.REJECTED && (
                        <button
                          id="btn-status-reject"
                          onClick={() => handleUpdateDocStatus(selectedDoc.id, EmpanelmentStatus.REJECTED)}
                          className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Reject
                        </button>
                      )}
                      {selectedDoc.status !== EmpanelmentStatus.APPROVED && (
                        <button
                          id="btn-status-approve"
                          onClick={() => {
                            // Automatically fill missing signatures for approved doctors
                            setDoctors(prev => prev.map(d => d.id === selectedDoc.id ? { 
                              ...d, 
                              status: EmpanelmentStatus.APPROVED,
                              documents: { ...d.documents, registration: true, mdms: true, signature: "Sig_Authorized_" + d.name.replace(/\s+/g, '_') }
                            } : d));
                          }}
                          className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <Check className="h-3.5 w-3.5" /> Approve & Activate
                        </button>
                      )}
                      {selectedDoc.status === EmpanelmentStatus.APPROVED && (
                        <button
                          id="btn-status-suspend"
                          onClick={() => handleUpdateDocStatus(selectedDoc.id, EmpanelmentStatus.SUSPENDED)}
                          className="bg-amber-50 text-amber-600 hover:bg-amber-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                        >
                          Suspend Credentials
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col justify-center items-center text-center p-6 text-slate-400">
                    <Award className="h-10 w-10 text-slate-300 stroke-[1.5] mb-2" />
                    <p className="text-sm font-semibold">Select an applicant doctor to process credentials workflow.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Pharmacies Empanelment Review */}
            <div className="border border-slate-150 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-150 flex justify-between items-center">
                <h4 className="font-bold text-sm text-slate-700 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-violet-600" />
                  Empanelled Pharmacies Network Status & Agreements
                </h4>
                <span className="text-[10px] bg-teal-100 text-teal-800 font-semibold px-2 py-0.5 rounded">
                  {pharmacies.filter(p => p.status === "Active").length} Live Channels
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-mono text-[10px] border-b border-slate-150">
                    <tr>
                      <th className="px-4 py-3">Pharmacy Name / City</th>
                      <th className="px-4 py-3">Drug License No</th>
                      <th className="px-4 py-3">GST details</th>
                      <th className="px-4 py-3 text-center">Commission Key</th>
                      <th className="px-4 py-3">Legal Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pharmacies.map((pharm) => (
                      <tr key={pharm.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {pharm.name}
                          <span className="block text-[10px] font-normal text-slate-500 font-mono">{pharm.address}, {pharm.city}</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-600 font-medium">{pharm.licenseNumber}</td>
                        <td className="px-4 py-3 font-mono text-[11px]">{pharm.gstNumber}</td>
                        <td className="px-4 py-3 text-center font-bold text-slate-700 font-mono">{pharm.commissionRate}% cut</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            pharm.status === "Active" ? "bg-emerald-50 text-emerald-700" :
                            pharm.status === "Rejected" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${pharm.status === "Active" ? "bg-emerald-500" : "bg-amber-500"}`}></span>
                            {pharm.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {pharm.status !== "Active" ? (
                              <button
                                id={`btn-approve-pharm-${pharm.id}`}
                                onClick={() => handleUpdatePharmacyStatus(pharm.id, "Active")}
                                className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-2 py-1 rounded font-bold text-[10px] transition"
                              >
                                Approve License
                              </button>
                            ) : (
                              <button
                                id={`btn-reject-pharm-${pharm.id}`}
                                onClick={() => handleUpdatePharmacyStatus(pharm.id, "Approval Pending")}
                                className="bg-amber-50 text-amber-655 hover:bg-amber-105 px-2 py-1 rounded font-bold text-[10px] transition"
                              >
                                Hold
                              </button>
                            )}

                            {/* Edit Pharmacy Icon */}
                            <button
                              id={`btn-edit-pharm-${pharm.id}`}
                              type="button"
                              onClick={() => setEditingPharmacy(pharm)}
                              title="Edit pharmacy details"
                              className="text-slate-400 hover:text-teal-600 p-1 rounded transition border bg-slate-50 hover:bg-white"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>

                            {/* Delete Pharmacy Icon */}
                            <button
                              id={`btn-delete-pharm-${pharm.id}`}
                              type="button"
                              onClick={() => {
                                if (confirm(`Are you sure you want to completely de-empanel ${pharm.name}?`)) {
                                  setPharmacies(prev => prev.filter(p => p.id !== pharm.id));
                                }
                              }}
                              title="De-empanel pharmacy"
                              className="text-slate-400 hover:text-red-500 p-1 rounded transition border bg-slate-50 hover:bg-white"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* subtab 2: SYSTEM MASTERS */}
        {activeSubTab === "masters" && (
          <div className="flex flex-col gap-6" id="masters-tab">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">System Master Registry</h2>
              <p className="text-sm text-slate-500">Register active cities, specialities database index, and global contact parameters.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Platform Master Setup values */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h4 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-teal-600" />
                  Ecosystem Global Variables Office
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Company / Platform Tradename</label>
                    <input
                      id="input-platform-name"
                      type="text"
                      className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-lg bg-white"
                      value={platformSettings.name}
                      onChange={(e) => setPlatformSettings(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tax GSTIN Number</label>
                      <input
                        id="input-gst"
                        type="text"
                        className="w-full text-xs font-mono p-2 border border-slate-200 rounded-lg bg-white"
                        value={platformSettings.gstNo}
                        onChange={(e) => setPlatformSettings(prev => ({ ...prev, gstNo: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">PAN Card Number</label>
                      <input
                        id="input-pan"
                        type="text"
                        className="w-full text-xs font-mono p-2 border border-slate-200 rounded-lg bg-white"
                        value={platformSettings.panNo}
                        onChange={(e) => setPlatformSettings(prev => ({ ...prev, panNo: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Support SLA Email</label>
                      <input
                        id="input-email"
                        type="email"
                        className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
                        value={platformSettings.supportEmail}
                        onChange={(e) => setPlatformSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Direct Helpdesk TollFree</label>
                      <input
                        id="input-phone"
                        type="text"
                        className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
                        value={platformSettings.supportPhone}
                        onChange={(e) => setPlatformSettings(prev => ({ ...prev, supportPhone: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Legal Telemedicine Disclaimer (Shown on Rx/Portal)</label>
                    <textarea
                      id="input-disclaimer"
                      rows={2}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white resize-none"
                      value={platformSettings.disclaimer}
                      onChange={(e) => setPlatformSettings(prev => ({ ...prev, disclaimer: e.target.value }))}
                    />
                  </div>
                  <div className="bg-teal-50 border border-teal-100 p-2.5 rounded-lg flex items-center justify-between">
                    <span className="text-[10px] text-teal-800 font-medium">Automatic system configuration live synced</span>
                    <button
                      id="btn-settings-save"
                      onClick={() => alert("Ecosystem parameters locked & recorded in Master Registry successfully!")}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] py-1 px-2.5 rounded"
                    >
                      Lock Changes
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Location availability List */}
              <div className="flex flex-col gap-6">
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-teal-600" />
                      Active Operating Cities
                    </h4>
                    <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                      {cities.length} Cities
                    </span>
                  </div>

                  <form onSubmit={handleAddCity} className="flex gap-2 mb-4">
                    <input
                      id="input-new-city"
                      type="text"
                      className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white"
                      placeholder="Add high-tier city (e.g. Hyderabad)..."
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                    />
                    <button
                      id="btn-add-city"
                      type="submit"
                      className="bg-teal-600 hover:bg-teal-700 text-white text-xs px-3 rounded-lg font-bold flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" /> Add
                    </button>
                  </form>

                  <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto p-1">
                    {cities.map((city) => (
                      <span
                        key={city}
                        className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 text-xs py-1 px-2.5 rounded-full font-medium"
                      >
                        {city}
                        <button
                          type="button"
                          onClick={() => {
                            const newName = prompt(`Rename operating City reference:`, city);
                            if (newName && newName.trim()) {
                              setCities(prev => prev.map(c => c === city ? newName.trim() : c));
                            }
                          }}
                          className="text-slate-400 hover:text-teal-600 text-[10px]"
                          title="Rename city"
                        >
                          ✎
                        </button>
                        <button
                          id={`btn-remove-city-${city.replace(/\s+/g, '-')}`}
                          type="button"
                          onClick={() => setCities(prev => prev.filter(c => c !== city))}
                          className="text-slate-400 hover:text-red-500 text-[10px] ml-0.5 font-bold font-mono"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Specialties creation and pricing desk */}
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-teal-600" />
                    Specialties Database Master
                  </h4>
                  <form onSubmit={handleAddSpecialty} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        id="input-spec-name"
                        type="text"
                        className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white"
                        placeholder="Specialty Name (e.g. Oncology)"
                        value={newSpec.name}
                        onChange={(e) => setNewSpec(prev => ({ ...prev, name: e.target.value }))}
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400">Fee:</span>
                        <input
                          id="input-spec-min"
                          type="number"
                          className="w-full text-xs p-1.5 border border-slate-200 rounded-lg bg-white"
                          placeholder="Min ₹"
                          value={newSpec.minFee}
                          onChange={(e) => setNewSpec(prev => ({ ...prev, minFee: Number(e.target.value) }))}
                        />
                        <span className="text-[10px] text-slate-400">-</span>
                        <input
                          id="input-spec-max"
                          type="number"
                          className="w-full text-xs p-1.5 border border-slate-200 rounded-lg bg-white"
                          placeholder="Max ₹"
                          value={newSpec.maxFee}
                          onChange={(e) => setNewSpec(prev => ({ ...prev, maxFee: Number(e.target.value) }))}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <input
                        id="input-spec-desc"
                        type="text"
                        className="flex-1 text-xs p-2 border border-slate-200 rounded-lg bg-white"
                        placeholder="Specialty category description..."
                        value={newSpec.description}
                        onChange={(e) => setNewSpec(prev => ({ ...prev, description: e.target.value }))}
                      />
                      <button
                        id="btn-add-spec"
                        type="submit"
                        className="bg-teal-600 hover:bg-teal-700 text-white text-xs px-3 py-1.5 rounded-lg font-bold"
                      >
                        Add Specialty
                      </button>
                    </div>
                  </form>
                  <div className="mt-4 max-h-[140px] overflow-y-auto space-y-1.5 pr-1">
                    {specialties.map((s) => (
                      <div key={s.id} className="bg-white p-2.5 rounded-lg border border-slate-150 flex justify-between items-center text-xs">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-800">{s.name}</p>
                          <p className="text-[10px] text-slate-500 line-clamp-1">{s.description}</p>
                          <span className="bg-slate-100 font-bold px-2 rounded text-[10px] text-teal-850 mt-1 inline-block">{s.consultationFeeRange}</span>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            id={`btn-edit-spec-${s.id}`}
                            type="button"
                            onClick={() => setEditingSpecialty(s)}
                            className="bg-slate-50 border border-slate-200 text-slate-400 hover:text-teal-600 p-1.5 rounded"
                            title="Edit Specialty"
                          >
                            <Pencil className="h-3.5 w-3.5 text-slate-500" />
                          </button>
                          <button
                            id={`btn-delete-spec-${s.id}`}
                            type="button"
                            onClick={() => {
                              if (confirm(`Remove specialty "${s.name}"?`)) {
                                setSpecialties(prev => prev.filter(item => item.id !== s.id));
                              }
                            }}
                            className="bg-slate-50 border border-slate-200 text-slate-400 hover:text-red-505 p-1.5 rounded animate-pulse"
                            title="Delete Specialty"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-slate-500 hover:text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* subtab 3: COMMISSIONS & FEES */}
        {activeSubTab === "commissions" && (
          <div className="flex flex-col gap-6" id="commissions-tab">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Commission Split Configurator</h2>
              <p className="text-sm text-slate-500">Define revenue-shared parameters dynamically between clinical consultants, contractual chemist networks, and home-diagnostics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Box 1 */}
              <div className="border border-slate-150 p-4 rounded-xl flex flex-col gap-3">
                <div className="flex items-center gap-2 text-teal-600">
                  <Stethoscope className="h-5 w-5" />
                  <span className="font-bold text-sm text-slate-800">Telemedicine Consultation</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg flex flex-col gap-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Platform Convenience fee</span>
                    <span className="font-bold text-slate-800">20% cut</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Empanelled Doctor payout</span>
                    <span className="font-bold text-slate-800">80% gross</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 italic">Convenience fee and teleconsult fee ranges can be modified on master tiers.</p>
              </div>

              {/* Box 2 */}
              <div className="border border-slate-150 p-4 rounded-xl flex flex-col gap-3">
                <div className="flex items-center gap-2 text-violet-600">
                  <FileText className="h-5 w-5" />
                  <span className="font-bold text-sm text-slate-800">Pharmacy E-Pharmacy Deals</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg flex flex-col gap-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">OTC Allied markup cut</span>
                    <span className="font-bold text-slate-800">12% avg commission</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Prescription drugs margin</span>
                    <span className="font-bold text-slate-800">10% fixed cut</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 italic">Smart Allocation routing prioritizes lower commission/nearby pharmacies.</p>
              </div>

              {/* Box 3 */}
              <div className="border border-slate-150 p-4 rounded-xl flex flex-col gap-3">
                <div className="flex items-center gap-2 text-blue-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-bold text-sm text-slate-800">Home Diagnostic Labs</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg flex flex-col gap-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">NABL lab specimen markup</span>
                    <span className="font-bold text-slate-800">15% platform fee</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Phlebotomist commission</span>
                    <span className="font-bold text-slate-800">₹150 flat per visit</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 italic">Diagnostic labs feed reports directly back to Electronic Medical Records (EMR).</p>
              </div>
            </div>

            {/* Financial Ledger overview table */}
            <div className="bg-slate-950 text-slate-100 p-5 rounded-xl font-mono text-xs">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-3">
                <h4 className="font-bold text-teal-400">Platform Transaction Ledger (Aggregated)</h4>
                <span className="text-[10px] text-slate-400">FY 2026-II</span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded">
                  <p className="text-slate-400 text-[10px] uppercase">Direct consultation fee</p>
                  <p className="text-lg font-bold text-emerald-400 mt-1">₹ {revenueStats.totalConsultations * 499}</p>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded">
                  <p className="text-slate-400 text-[10px] uppercase">Platform consultation share</p>
                  <p className="text-lg font-bold text-emerald-400 mt-1">₹ {Math.round(revenueStats.platformConsultationShare)}</p>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded">
                  <p className="text-slate-400 text-[10px] uppercase">E-Pharmacy commissions</p>
                  <p className="text-lg font-bold text-emerald-400 mt-1">₹ {Math.round(revenueStats.platformPharmacyEarn)}</p>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded">
                  <p className="text-slate-400 text-[10px] uppercase">Home Diag Lab commissions</p>
                  <p className="text-lg font-bold text-emerald-400 mt-1">₹ {revenueStats.platformDiagEarn}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* subtab 4: PROMO & ADS MANAGER */}
        {activeSubTab === "ads" && (
          <div className="flex flex-col gap-6" id="ads-tab">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Ecosystem Display Banner Ad Engine</h2>
              <p className="text-sm text-slate-500">Inject banner promos, sponsored empanelled clinics, and featured product listings to generate secondary revenue streams.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Form addition */}
              <div className="md:col-span-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-1.5">
                  <Plus className="h-4 w-4 text-teal-600" /> Put New Display Ad
                </h4>
                <form onSubmit={handleAddAd} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Ad Campaign Title</label>
                    <input
                      id="input-ad-title"
                      type="text"
                      placeholder="e.g. 50% Off Diagnostic Check"
                      className="w-full text-xs p-2 border border-slate-200 rounded bg-white font-medium"
                      value={newAd.title}
                      onChange={(e) => setNewAd(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Paying Advertiser</label>
                    <input
                      id="input-ad-advertiser"
                      type="text"
                      placeholder="e.g. SRL Laboratories"
                      className="w-full text-xs p-2 border border-slate-200 rounded bg-white"
                      value={newAd.advertiser}
                      onChange={(e) => setNewAd(prev => ({ ...prev, advertiser: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Promotional Type</label>
                    <select
                      id="select-ad-type"
                      className="w-full text-xs p-2 border border-slate-200 rounded bg-white"
                      value={newAd.type}
                      onChange={(e) => setNewAd(prev => ({ ...prev, type: e.target.value as any }))}
                    >
                      <option value="Banner Ad">Carousel Banner Ad</option>
                      <option value="Featured Doctor">Featured Doctor Spotlight</option>
                      <option value="Sponsored Product">Sponsored Pharmacy Items</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Banner Unsplash URL (Optional)</label>
                    <input
                      id="input-ad-image"
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      className="w-full text-xs p-2 border border-slate-200 rounded bg-white font-mono"
                      value={newAd.imageUrl}
                      onChange={(e) => setNewAd(prev => ({ ...prev, imageUrl: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Internal Target Router Token</label>
                    <input
                      id="input-ad-link"
                      type="text"
                      placeholder="package-diagnostics"
                      className="w-full text-xs p-2 border border-slate-200 rounded bg-white"
                      value={newAd.targetLink}
                      onChange={(e) => setNewAd(prev => ({ ...prev, targetLink: e.target.value }))}
                    />
                  </div>
                  <button
                    id="btn-ad-submit"
                    type="submit"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2 rounded-lg transition"
                  >
                    Deploy Campaign Live
                  </button>
                </form>
              </div>

              {/* Campaign list */}
              <div className="md:col-span-2 space-y-4">
                <h4 className="font-bold text-sm text-slate-800">Active Live Display Tenders({campaigns.length})</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {campaigns.map((ad) => (
                    <div key={ad.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between white bg-white">
                      <div className="relative h-28 bg-slate-100">
                        <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">
                          {ad.type}
                        </span>
                        <span className="absolute bottom-2 right-2 bg-teal-500 text-slate-950 text-[10px] font-semibold px-2 py-0.5 rounded">
                          Paid by: {ad.advertiser}
                        </span>
                      </div>
                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="font-bold text-xs text-slate-800 line-clamp-1">{ad.title}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-1">Ref link: {ad.targetLink || "default"}</p>
                        </div>
                        <div className="flex justify-between items-center text-[10px] border-t border-slate-100 pt-2.5 mt-2 font-mono">
                          <span className="text-slate-500">Impressions: <strong>{ad.impressions}</strong></span>
                          <span className="text-slate-500">Clicks: <strong className="text-teal-600">{ad.clicks}</strong></span>
                          <div className="flex gap-2">
                            <button
                              id={`btn-edit-ad-${ad.id}`}
                              type="button"
                              onClick={() => setEditingCampaign(ad)}
                              className="text-teal-600 hover:text-teal-800 font-bold"
                            >
                              Edit Link
                            </button>
                            <span className="text-slate-200">|</span>
                            <button
                              id={`btn-delete-ad-${ad.id}`}
                              type="button"
                              onClick={() => setCampaigns(prev => prev.filter(item => item.id !== ad.id))}
                              className="text-red-500 hover:text-red-700 font-bold"
                            >
                              Tear Down
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* subtab 5: ECOSYSTEM REPORTS */}
        {activeSubTab === "analytics" && (
          <div className="flex flex-col gap-6" id="analytics-tab">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Active Health Grid Analytics</h2>
              <p className="text-sm text-slate-500">Aggregated telehealth diagnostics reports, active doctor distributions, and pharmacy routing speeds.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Box 1: Specialties share customized visual SVG */}
              <div className="border border-slate-200 p-5 rounded-xl">
                <h4 className="font-bold text-sm text-slate-700 mb-4">Patient Demographics Specialty-wise Share</h4>
                <div className="flex flex-col gap-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>General Medicine</span>
                      <span>45% of users</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 rounded-full" style={{ width: "45%" }}></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>Pediatrics</span>
                      <span>25% of users</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-500 rounded-full" style={{ width: "25%" }}></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>Cardiology</span>
                      <span>15% of users</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: "15%" }}></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>Other Specialities</span>
                      <span>15% of users</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: "15%" }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 2: System Audit Log */}
              <div className="border border-slate-200 p-5 rounded-xl bg-slate-50">
                <h4 className="font-bold text-sm text-slate-700 mb-2.5">Ecosystem Compliance & Audit Logs</h4>
                <div className="font-mono text-[10px] text-slate-500 space-y-2 max-h-[160px] overflow-y-auto">
                  <p className="border-b border-slate-200 pb-1">
                    <span className="text-teal-600">[06:14:02 UTC]</span> Doctor Verification System: Auto-checked MCI status for Dr. Alok Sharma. Result: ACTIVE.
                  </p>
                  <p className="border-b border-slate-200 pb-1">
                    <span className="text-teal-600">[06:15:30 UTC]</span> Smart Router Engine: Routed order ORD-1194 to Metro Medicos (Nearest Pharmacy within 0.5km).
                  </p>
                  <p className="border-b border-slate-200 pb-1">
                    <span className="text-teal-600">[06:18:11 UTC]</span> E-Signature HSM: Secure SHA256 key emitted for Rx PDF #Rx-3042.
                  </p>
                  <p className="border-b border-slate-200 pb-1">
                    <span className="text-teal-600">[06:21:44 UTC]</span> Audit system: GST liability 18% evaluated on ₹3450 medicine sales.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "accounting" && (
          <AccountingDashboard
            appointments={appointments}
            orders={orders}
            campaigns={campaigns}
          />
        )}

        {/* ================= EDIT MODALS SECTION ================= */}
        {/* 1. Doctor Profile Edit Modal */}
        {editingDoc && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="bg-slate-950 text-white p-4.5 flex justify-between items-center">
                <div>
                  <h4 className="font-extrabold text-sm tracking-tight flex items-center gap-1.5 text-teal-400">
                    <Pencil className="h-4 w-4" /> Edit Doctor Profile
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono">Registry ID: {editingDoc.id}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingDoc(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition"
                >
                  <XCircle className="h-4.5 w-4.5" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setDoctors(prev => prev.map(d => d.id === editingDoc.id ? editingDoc : d));
                  setEditingDoc(null);
                }}
                className="p-5 space-y-4 text-xs overflow-y-auto max-h-[70vh]"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Doctor Name</label>
                    <input
                      type="text"
                      required
                      className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800 font-semibold"
                      value={editingDoc.name}
                      onChange={(e) => setEditingDoc(prev => prev ? { ...prev, name: e.target.value } : null)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Specialty</label>
                    <select
                      className="w-full p-2.5 border border-slate-200 rounded-lg bg-white font-semibold"
                      value={editingDoc.specialty}
                      onChange={(e) => setEditingDoc(prev => prev ? { ...prev, specialty: e.target.value } : null)}
                    >
                      {specialties.map(s => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Experience (years)</label>
                    <input
                      type="number"
                      required
                      className="w-full p-2.5 border border-slate-200 rounded-lg"
                      value={editingDoc.experience}
                      onChange={(e) => setEditingDoc(prev => prev ? { ...prev, experience: parseInt(e.target.value) || 0 } : null)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Consultation Fee (₹)</label>
                    <input
                      type="number"
                      required
                      className="w-full p-2.5 border border-slate-200 rounded-lg text-teal-600 font-bold"
                      value={editingDoc.consultationFee}
                      onChange={(e) => setEditingDoc(prev => prev ? { ...prev, consultationFee: parseFloat(e.target.value) || 300 } : null)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Reg Number</label>
                    <input
                      type="text"
                      required
                      className="w-full p-2.5 border border-slate-200 rounded-lg font-mono uppercase"
                      value={editingDoc.registrationNumber}
                      onChange={(e) => setEditingDoc(prev => prev ? { ...prev, registrationNumber: e.target.value } : null)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Qualification</label>
                    <input
                      type="text"
                      required
                      className="w-full p-2.5 border border-slate-200 rounded-lg"
                      value={editingDoc.qualification}
                      onChange={(e) => setEditingDoc(prev => prev ? { ...prev, qualification: e.target.value } : null)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mobile Contact</label>
                    <input
                      type="text"
                      required
                      className="w-full p-2.5 border border-slate-200 rounded-lg font-mono"
                      value={editingDoc.mobile}
                      onChange={(e) => setEditingDoc(prev => prev ? { ...prev, mobile: e.target.value } : null)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Clinic Name</label>
                    <input
                      type="text"
                      required
                      className="w-full p-2.5 border border-slate-100 rounded-lg"
                      value={editingDoc.clinicName}
                      onChange={(e) => setEditingDoc(prev => prev ? { ...prev, clinicName: e.target.value } : null)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Clinic Address</label>
                    <input
                      type="text"
                      required
                      className="w-full p-2.5 border border-slate-100 rounded-lg"
                      value={editingDoc.clinicAddress}
                      onChange={(e) => setEditingDoc(prev => prev ? { ...prev, clinicAddress: e.target.value } : null)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Operating City</label>
                    <select
                      className="w-full p-2.5 border border-slate-250 rounded-lg bg-white"
                      value={editingDoc.city}
                      onChange={(e) => setEditingDoc(prev => prev ? { ...prev, city: e.target.value } : null)}
                    >
                      {cities.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Empanelment Status</label>
                    <select
                      className="w-full p-2.5 border border-slate-250 rounded-lg bg-white font-bold"
                      value={editingDoc.status}
                      onChange={(e) => setEditingDoc(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                    >
                      <option value={EmpanelmentStatus.APPROVED}>Approved & Active</option>
                      <option value={EmpanelmentStatus.PENDING}>Pending Allocation</option>
                      <option value={EmpanelmentStatus.UNDER_REVIEW}>Under Review</option>
                      <option value={EmpanelmentStatus.REJECTED}>Rejected</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingDoc(null)}
                    className="px-4 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-600 hover:bg-slate-100 font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-teal-400 font-extrabold rounded-lg transition"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 2. Pharmacy Edit Modal */}
        {editingPharmacy && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="bg-slate-950 text-white p-4.5 flex justify-between items-center">
                <div>
                  <h4 className="font-extrabold text-sm tracking-tight flex items-center gap-1.5 text-teal-400">
                    <Pencil className="h-4 w-4" /> Edit Pharmacy Details
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono">Registry ID: {editingPharmacy.id}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingPharmacy(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition"
                >
                  <XCircle className="h-4.5 w-4.5" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setPharmacies(prev => prev.map(p => p.id === editingPharmacy.id ? editingPharmacy : p));
                  setEditingPharmacy(null);
                }}
                className="p-5 space-y-4 text-xs"
              >
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Pharmacy Outlet Name</label>
                  <input
                    type="text"
                    required
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800 font-semibold"
                    value={editingPharmacy.name}
                    onChange={(e) => setEditingPharmacy(prev => prev ? { ...prev, name: e.target.value } : null)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">License Code</label>
                    <input
                      type="text"
                      required
                      className="w-full p-2.5 border border-slate-200 rounded-lg font-mono uppercase"
                      value={editingPharmacy.licenseNumber}
                      onChange={(e) => setEditingPharmacy(prev => prev ? { ...prev, licenseNumber: e.target.value } : null)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">GSTIN Certificate</label>
                    <input
                      type="text"
                      required
                      className="w-full p-2.5 border border-slate-200 rounded-lg font-mono uppercase"
                      value={editingPharmacy.gstNumber}
                      onChange={(e) => setEditingPharmacy(prev => prev ? { ...prev, gstNumber: e.target.value } : null)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Commission Rate (%)</label>
                    <input
                      type="number"
                      required
                      className="w-full p-2.5 border border-slate-200 rounded-lg font-mono font-bold"
                      value={editingPharmacy.commissionRate}
                      onChange={(e) => setEditingPharmacy(prev => prev ? { ...prev, commissionRate: parseFloat(e.target.value) || 10 } : null)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Operating City</label>
                    <select
                      className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
                      value={editingPharmacy.city}
                      onChange={(e) => setEditingPharmacy(prev => prev ? { ...prev, city: e.target.value } : null)}
                    >
                      {cities.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Store Address</label>
                  <input
                    type="text"
                    required
                    className="w-full p-2.5 border border-slate-200 rounded-lg"
                    value={editingPharmacy.address}
                    onChange={(e) => setEditingPharmacy(prev => prev ? { ...prev, address: e.target.value } : null)}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingPharmacy(null)}
                    className="px-4 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-600 hover:bg-slate-100 font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-teal-400 font-extrabold rounded-lg transition"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 3. Specialty Edit Modal */}
        {editingSpecialty && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="bg-slate-950 text-white p-4.5 flex justify-between items-center">
                <div>
                  <h4 className="font-extrabold text-sm tracking-tight flex items-center gap-1.5 text-teal-400">
                    <Pencil className="h-4 w-4" /> Edit Specialty Master
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono font-bold">Ref: {editingSpecialty.id}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingSpecialty(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition"
                >
                  <XCircle className="h-4.5 w-4.5" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSpecialties(prev => prev.map(s => s.id === editingSpecialty.id ? editingSpecialty : s));
                  setEditingSpecialty(null);
                }}
                className="p-5 space-y-4 text-xs"
              >
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Specialty Name</label>
                  <input
                    type="text"
                    required
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800 font-bold"
                    value={editingSpecialty.name}
                    onChange={(e) => setEditingSpecialty(prev => prev ? { ...prev, name: e.target.value } : null)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Consultation Fee Range</label>
                  <input
                    type="text"
                    required
                    className="w-full p-2.5 border border-slate-200 rounded-lg"
                    value={editingSpecialty.consultationFeeRange}
                    onChange={(e) => setEditingSpecialty(prev => prev ? { ...prev, consultationFeeRange: e.target.value } : null)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Master Category Description</label>
                  <textarea
                    required
                    className="w-full p-2.5 border border-slate-200 rounded-lg h-24 text-slate-750 font-medium"
                    value={editingSpecialty.description}
                    onChange={(e) => setEditingSpecialty(prev => prev ? { ...prev, description: e.target.value } : null)}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingSpecialty(null)}
                    className="px-4 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-600 hover:bg-slate-100 font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-teal-400 font-extrabold rounded-lg transition"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 4. Campaign Edit Modal */}
        {editingCampaign && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="bg-slate-950 text-white p-4.5 flex justify-between items-center">
                <div>
                  <h4 className="font-extrabold text-sm tracking-tight flex items-center gap-1.5 text-teal-400">
                    <Pencil className="h-4 w-4" /> Edit Ad Tender/Campaign
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono">Reference: {editingCampaign.id}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingCampaign(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition"
                >
                  <XCircle className="h-4.5 w-4.5" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setCampaigns(prev => prev.map(c => c.id === editingCampaign.id ? editingCampaign : c));
                  setEditingCampaign(null);
                }}
                className="p-5 space-y-4 text-xs"
              >
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Campaign Title</label>
                  <input
                    type="text"
                    required
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800 font-semibold"
                    value={editingCampaign.title}
                    onChange={(e) => setEditingCampaign(prev => prev ? { ...prev, title: e.target.value } : null)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Advertiser</label>
                    <input
                      type="text"
                      required
                      className="w-full p-2.5 border border-slate-200 rounded-lg"
                      value={editingCampaign.advertiser}
                      onChange={(e) => setEditingCampaign(prev => prev ? { ...prev, advertiser: e.target.value } : null)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tender Type</label>
                    <select
                      className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
                      value={editingCampaign.type}
                      onChange={(e) => setEditingCampaign(prev => prev ? { ...prev, type: e.target.value as any } : null)}
                    >
                      <option value="Banner Ad">Banner Ad</option>
                      <option value="Featured Doctor">Featured Doctor</option>
                      <option value="Sponsored Product">Sponsored Product</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Redirect Target URL</label>
                  <input
                    type="text"
                    required
                    className="w-full p-2.5 border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                    value={editingCampaign.targetLink}
                    onChange={(e) => setEditingCampaign(prev => prev ? { ...prev, targetLink: e.target.value } : null)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Billboard Artwork Image URL</label>
                  <input
                    type="text"
                    required
                    className="w-full p-2.5 border border-slate-200 rounded-lg font-mono"
                    value={editingCampaign.imageUrl}
                    onChange={(e) => setEditingCampaign(prev => prev ? { ...prev, imageUrl: e.target.value } : null)}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingCampaign(null)}
                    className="px-4 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-600 hover:bg-slate-100 font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-teal-400 font-extrabold rounded-lg transition"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
