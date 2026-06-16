/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Order } from "../types";
import { 
  Truck, 
  MapPin, 
  KeyRound, 
  Sparkles, 
  ClipboardCheck, 
  UserPlus, 
  Users, 
  Building2, 
  CheckCircle, 
  Bike, 
  Calendar, 
  Search, 
  AlertCircle,
  FileCheck2,
  Trash2,
  TrendingUp,
  Package,
  Activity,
  Pencil,
  Lock,
  X
} from "lucide-react";
import { DeliveryAgent } from "../types";

interface DeliveryPanelProps {
  orders: any[];
  setOrders: React.Dispatch<React.SetStateAction<any[]>>;
  deliveryAgents: DeliveryAgent[];
  setDeliveryAgents: React.Dispatch<React.SetStateAction<DeliveryAgent[]>>;
  activeRole: string;
}

export default function DeliveryPanel({ orders, setOrders, deliveryAgents, setDeliveryAgents, activeRole }: DeliveryPanelProps) {
  // Navigation Tabs inside Delivery console
  const [activeSubTab, setActiveSubTab] = useState<"transits" | "desk" | "registry">("transits");
  const [editingAgent, setEditingAgent] = useState<DeliveryAgent | null>(null);

  // Form states for new delivery agent empanelment
  const [newAgentName, setNewAgentName] = useState("");
  const [newAgentType, setNewAgentType] = useState<"Hired Rider" | "Approved Courier Agency">("Hired Rider");
  const [newAgentContact, setNewAgentContact] = useState("");
  const [newAgentVehicle, setNewAgentVehicle] = useState("Electric Scooter");
  const [newAgentCorp, setNewAgentCorp] = useState("In-House Speedforce");
  const [agentFormSuccess, setAgentFormSuccess] = useState("");

  // Select active active order in courier queue
  const activeDeliveries = orders.filter((o) => o.status === "Out for Delivery");
  const [selectedOrderId, setSelectedOrderId] = useState<string>(activeDeliveries[0]?.id || "");
  const activeOrder = activeDeliveries.find((o) => o.id === selectedOrderId);

  // States for verification OTP
  const [verificationOtp, setVerificationOtp] = useState("");
  const [successToast, setSuccessToast] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Search filter for registry
  const [registrySearch, setRegistrySearch] = useState("");

  // Orders waiting for dispatch (either Preparing, Pending Allocation)
  const pendingDispatchOrders = orders.filter(
    (o) => o.status === "Preparing" || o.status === "Pending Allocation"
  );
  const [selectedPendingId, setSelectedPendingId] = useState<string>(pendingDispatchOrders[0]?.id || "");
  const activePendingOrder = pendingDispatchOrders.find((o) => o.id === selectedPendingId);

  // Assignment states
  const [chosenAgentId, setChosenAgentId] = useState(
    deliveryAgents.filter(a => a.status === "Available")[0]?.id || ""
  );
  const [dispatchError, setDispatchError] = useState("");
  const [dispatchSuccess, setDispatchSuccess] = useState("");

  // Handler to onboard delivery agent / courier firm
  const handleRegisterAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName.trim() || !newAgentContact.trim()) {
      return;
    }

    const uniqueId = "DA-" + (100 + deliveryAgents.length + 1);
    const newAgent: DeliveryAgent = {
      id: uniqueId,
      name: newAgentName,
      type: newAgentType,
      contact: newAgentContact,
      status: "Available",
      vehicle: newAgentVehicle,
      agency: newAgentType === "Hired Rider" ? newAgentCorp : newAgentName,
      rating: 5.0
    };

    setDeliveryAgents(prev => [...prev, newAgent]);
    setNewAgentName("");
    setNewAgentContact("");
    setNewAgentVehicle("Electric Scooter");
    setNewAgentCorp("In-House Speedforce");
    setAgentFormSuccess(`Onboarded ${newAgentType} "${newAgent.name}" successfully under ID ${newAgent.id}`);
    
    // Clear success banner
    setTimeout(() => {
      setAgentFormSuccess("");
    }, 4000);
  };

  // Handler to delete empanelled agent
  const handleDeleteAgent = (id: string) => {
    setDeliveryAgents(prev => prev.filter(a => a.id !== id));
  };

  // Handler to assign agent & trigger OUT FOR DELIVERY dispatch state
  const handleDispatchOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePendingOrder) {
      setDispatchError("No active pending pharmacy order chosen.");
      return;
    }
    if (!chosenAgentId) {
      setDispatchError("Please register or assign a valid delivery boy or courier agency.");
      return;
    }

    const matchedAgent = deliveryAgents.find(a => a.id === chosenAgentId);
    if (!matchedAgent) {
      setDispatchError("Assigned logistics partner metadata not found.");
      return;
    }

    // Allocate order & set Out for Delivery
    setOrders(prev => prev.map(o => {
      if (o.id === activePendingOrder.id) {
        return {
          ...o,
          status: "Out for Delivery",
          deliveryPartnerName: `${matchedAgent.name} (${matchedAgent.type})`,
          deliveryOTP: o.deliveryOTP || Math.floor(1000 + Math.random() * 9000).toString()
        };
      }
      return o;
    }));

    // Update agent status to "On Trip"
    setDeliveryAgents(prev => prev.map(a => a.id === matchedAgent.id ? { ...a, status: "On Trip" } : a));

    setDispatchSuccess(`Shipment ${activePendingOrder.id} successfully released under custody of ${matchedAgent.name}!`);
    setSelectedOrderId(activePendingOrder.id); // set as active transit screen
    
    setTimeout(() => {
      setDispatchSuccess("");
      // Reset pending state
      const remainingPending = pendingDispatchOrders.filter(o => o.id !== activePendingOrder.id);
      setSelectedPendingId(remainingPending[0]?.id || "");
    }, 3000);
  };

  // Handler to confirm customer delivery via OTP hand-off
  const handleVerifyDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;

    if (verificationOtp.trim() === activeOrder.deliveryOTP) {
      setOrders(prev => prev.map(o => o.id === activeOrder.id ? { ...o, status: "Delivered" } : o));
      
      // Release delivery boy status back to "Available"
      const currentPartner = activeOrder.deliveryPartnerName;
      if (currentPartner) {
        setDeliveryAgents(prev => prev.map(a => {
          if (currentPartner.includes(a.name)) {
            return { ...a, status: "Available" };
          }
          return a;
        }));
      }

      setSuccessToast(`Order package ${activeOrder.id} successfully delivered! Hand-off securely stored in transaction logging ledger.`);
      setVerificationOtp("");
      setErrorMessage("");
      
      // Auto switch state or pick next
      setTimeout(() => {
        setSuccessToast("");
        const leftDeliveries = activeDeliveries.filter(d => d.id !== activeOrder.id);
        setSelectedOrderId(leftDeliveries[0]?.id || "");
      }, 4000);
    } else {
      setErrorMessage("Secure validation failure: Delivery OTP handoff mismatch! Please recheck client's medicine app wallet token.");
    }
  };

  // Filtered list of registered courier boys or agencies
  const filteredAgents = deliveryAgents.filter(a => 
    a.name.toLowerCase().includes(registrySearch.toLowerCase()) ||
    a.vehicle.toLowerCase().includes(registrySearch.toLowerCase()) ||
    a.agency.toLowerCase().includes(registrySearch.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6" id="delivery-panel-root">
      
      {/* Delivery Management Subtabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-display">Last-Mile Pharmacy Dispatch Desk</h2>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch chemotherapy, maintenance, and OTC pills securely through in-house riders and licensed courier networks.
          </p>
        </div>

        {/* Action tabs selectors */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200">
          <button
            id="tab-sub-transits"
            onClick={() => setActiveSubTab("transits")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === "transits"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Truck className="h-4 w-4 text-teal-600" />
            <span>Active Transits ({activeDeliveries.length})</span>
          </button>

          <button
            id="tab-sub-desk"
            onClick={() => {
              setActiveSubTab("desk");
              // Pick first dispatchable if not set
              if (!selectedPendingId && pendingDispatchOrders.length > 0) {
                setSelectedPendingId(pendingDispatchOrders[0].id);
              }
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === "desk"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Package className="h-4 w-4 text-amber-500" />
            <span>Smart Despatch ({pendingDispatchOrders.length})</span>
          </button>

          <button
            id="tab-sub-registry"
            onClick={() => setActiveSubTab("registry")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === "registry"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="h-4 w-4 text-sky-500" />
            <span>Agent Registry ({deliveryAgents.length})</span>
          </button>
        </div>
      </div>

      {/* Subtab Content Panels */}
      
      {/* 1. TRANSITS AND DELIVERIES TAB */}
      {activeSubTab === "transits" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active Transits list */}
          <div className="lg:col-span-4 bg-white p-5 border border-slate-200/80 rounded-2xl shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">Active Packages</h3>
              <p className="text-[11px] text-slate-500 mt-1">Dispatched chemist orders currently requiring client contact.</p>
            </div>

            {activeDeliveries.length > 0 ? (
              <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
                {activeDeliveries.map(o => (
                  <button
                    id={`btn-courier-order-${o.id}`}
                    key={o.id}
                    onClick={() => {
                      setSelectedOrderId(o.id);
                      setErrorMessage("");
                      setVerificationOtp("");
                      setSuccessToast("");
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs transition font-semibold flex flex-col gap-2 focus:outline-none ${
                      selectedOrderId === o.id
                        ? "bg-slate-900 border-slate-800 text-white shadow-md transform scale-[1.01]"
                        : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className={`font-mono px-2 py-0.5 rounded text-[9px] font-bold ${
                        selectedOrderId === o.id ? "bg-teal-500 text-slate-950" : "bg-slate-900 text-white"
                      }`}>
                        {o.id}
                      </span>
                      <span className={`text-[10px] font-bold ${selectedOrderId === o.id ? "text-teal-400" : "text-teal-600"}`}>
                        {o.allocatedPharmacyName}
                      </span>
                    </div>
                    <div>
                      <p className={`font-extrabold text-xs ${selectedOrderId === o.id ? "text-slate-100" : "text-slate-800"}`}>
                        {o.patientName}
                      </p>
                      <p className={`text-[10px] mt-0.5 line-clamp-1 ${selectedOrderId === o.id ? "text-slate-400" : "text-slate-500"}`}>
                        To: {o.deliveryAddress}, {o.city}
                      </p>
                    </div>

                    <div className={`mt-1 pt-1.5 border-t text-[9px] font-mono flex justify-between items-center ${
                      selectedOrderId === o.id ? "border-slate-800 text-teal-400" : "border-slate-100 text-slate-500"
                    }`}>
                      <span>Courier: {o.deliveryPartnerName || "Unassigned"}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 px-4 bg-slate-50 border border-slate-200 border-dashed rounded-xl my-2">
                <Bike className="h-9 w-9 text-slate-300 mx-auto stroke-[1.5] mb-2 animate-bounce" />
                <p className="font-bold text-xs text-slate-700">No active parcel trips</p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto">
                  All medical orders are safe in warehouses. Go to the "Smart Despatch" tab to assign riders and schedule runs.
                </p>
              </div>
            )}
          </div>

          {/* Verification Module detail view */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[400px] flex flex-col justify-between">
            {activeOrder ? (
              <div className="flex flex-col gap-5 flex-1" id="delivery-verification">
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-850 flex items-center gap-2">
                      <Truck className="h-5 w-5 text-teal-600" />
                      Active Transiting Package Diagnostic
                    </h3>
                    <p className="text-xs text-slate-500">OTP validation for medicine handover confirmation & compliance logs.</p>
                  </div>
                  <span className="text-[10px] bg-red-50 text-red-800 border border-red-200 px-2 py-0.5 rounded font-mono font-bold">
                    Rx Hand-off Mandate
                  </span>
                </div>

                {/* Banner alert */}
                {successToast && (
                  <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-xl text-xs text-emerald-800 flex items-center gap-2" id="delivery-success-alert">
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                    <span className="font-semibold">{successToast}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <div className="space-y-3">
                    <p className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Package className="h-4 w-4 text-slate-500" />
                      Package Shipment Cart Items
                    </p>
                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto bg-white p-2.5 rounded border border-slate-200 shadow-inner">
                      {activeOrder.items?.map((it, idx) => (
                        <div key={idx} className="p-2 border-b last:border-0 border-slate-100 text-slate-700 flex justify-between items-center [content-visibility:auto]">
                          <div>
                            <span className="font-bold text-slate-800">{it.product.name}</span>
                            <span className="block text-[9px] text-slate-400">Brand: {it.product.brand}</span>
                          </div>
                          <strong className="text-slate-900 font-mono bg-slate-50 px-2 py-0.5 border rounded">
                            {it.quantity} Unit(s)
                          </strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between gap-4">
                    <div className="space-y-2 text-slate-600">
                      <p className="font-bold text-slate-700 uppercase tracking-widest text-[10px]">Recipient Vitals & address</p>
                      <div className="space-y-1.5 bg-white p-2.5 rounded border border-slate-200">
                        <p className="flex items-center gap-1 text-[11px] font-semibold text-slate-800">
                          To: {activeOrder.patientName}
                        </p>
                        <p className="flex items-start gap-1 text-[10px] font-mono text-slate-500">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span>{activeOrder.deliveryAddress}, {activeOrder.city} - {activeOrder.pincode}</span>
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          Assigned Transporter: <strong className="text-emerald-700 font-sans">{activeOrder.deliveryPartnerName}</strong>
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          Drug Origin Dispensation: <strong className="text-slate-700 font-sans">{activeOrder.allocatedPharmacyName}</strong>
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleVerifyDelivery} className="p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-3 shadow-sm">
                      <label className="block text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                        <KeyRound className="h-4 w-4 text-teal-600" /> Authenticate Handover Code
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="input-delivery-otp"
                          type="text"
                          className="flex-1 text-center font-mono font-bold tracking-widest text-sm p-2 border border-teal-300 rounded-lg bg-white text-slate-800 uppercase focus:outline-teal-500"
                          placeholder="4-digit OTP"
                          value={verificationOtp}
                          onChange={(e) => setVerificationOtp(e.target.value)}
                          maxLength={6}
                          required
                        />
                        <button
                          id="btn-verify-submit"
                          type="submit"
                          className="bg-slate-900 hover:bg-slate-800 text-teal-400 font-black text-xs px-4 rounded-lg shadow-sm font-sans transition"
                        >
                          Confirm Handover
                        </button>
                      </div>
                      {errorMessage && (
                        <p className="text-[10px] text-red-600 font-bold bg-white p-1 rounded-md border border-red-200 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {errorMessage}
                        </p>
                      )}
                      <p className="text-[10px] text-teal-800 italic font-medium bg-white/50 p-1.5 rounded border border-teal-100">
                        Simulation secret: Provide client's smart OTP: <strong className="font-mono text-xs text-teal-900 bg-teal-100/80 px-1 py-0.5 rounded">{activeOrder.deliveryOTP}</strong>
                      </p>
                    </form>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex flex-col md:flex-row gap-3 md:items-center justify-between text-xs mt-2 self-end w-full">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-600 animate-pulse" />
                    <span className="text-slate-500 font-bold">Real-time GPS Tracking status:</span>
                  </div>
                  <code className="text-teal-700 bg-teal-50 font-mono text-[10px] px-2.5 py-0.5 rounded-md font-bold border border-teal-200 text-center">
                    Agent Location: Transiting City Center Hub
                  </code>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-center p-12 text-slate-400 my-auto">
                <ClipboardCheck className="h-16 w-16 text-slate-200 stroke-[1.1] mb-3 animate-pulse text-teal-400/80" />
                <h4 className="font-extrabold text-sm text-slate-700 uppercase tracking-wide">All chemist packages delivered</h4>
                <p className="text-xs text-slate-500 max-w-sm mt-1 mx-auto leading-relaxed">
                  Excellent work! There are no transits currently waiting signature authentication. Head over to the <strong className="text-slate-800 font-bold">Smart Despatch</strong> tab to release waiting store drugs.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. DISPATCH DESK TAB (PENDING DRUGS TO COURIER/BOY ASSIGN) */}
      {activeSubTab === "desk" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dispatch-desk-root">
          
          {/* List of Orders Waiting for Assignment */}
          <div className="lg:col-span-4 bg-white p-5 border border-slate-200 rounded-2xl shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">Waiting Dispatches</h3>
              <p className="text-[11px] text-slate-500 mt-1">Orders formulated and packed by pharmacies waiting for carrier pickups.</p>
            </div>

            {pendingDispatchOrders.length > 0 ? (
              <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
                {pendingDispatchOrders.map(o => (
                  <button
                    id={`btn-pending-dispatch-${o.id}`}
                    key={o.id}
                    onClick={() => {
                      setSelectedPendingId(o.id);
                      setDispatchError("");
                      setDispatchSuccess("");
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs transition font-semibold flex flex-col gap-2 focus:outline-none ${
                      selectedPendingId === o.id
                        ? "bg-amber-50 border-amber-300 text-amber-950 shadow-sm"
                        : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-mono bg-slate-900 text-white px-2 py-0.5 rounded text-[9px] font-bold">
                        {o.id}
                      </span>
                      <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded font-bold uppercase">
                        {o.status}
                      </span>
                    </div>

                    <div>
                      <p className="font-extrabold text-slate-850 font-display">{o.patientName}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">Destination: {o.deliveryAddress}, {o.city}</p>
                    </div>

                    <div className="border-t border-dashed border-slate-200 pt-1.5 mt-1 text-[10px] flex justify-between text-slate-500">
                      <span>Packed At: <strong>{o.allocatedPharmacyName}</strong></span>
                      <span className="font-bold text-slate-800">₹{o.total}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 px-4 bg-slate-50 border border-slate-200 border-dashed rounded-xl">
                <FileCheck2 className="h-9 w-9 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-xs text-slate-600">Dispensation Desk Clear</p>
                <p className="text-[10px] text-slate-400 mt-1">No orders are currently packed and waiting shipment allocation at empanelled stores.</p>
              </div>
            )}
          </div>

          {/* Allocation & Carrier Release Desk */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[400px] flex flex-col justify-between">
            {activePendingOrder ? (
              <div className="space-y-5 flex-1 select-none">
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-850 flex items-center gap-2">
                      <ClipboardCheck className="h-5 w-5 text-amber-500 animate-pulse" />
                      Carrier Assignment & Allocation Desk
                    </h3>
                    <p className="text-xs text-slate-500">Release packages to dedicated courier agencies or hired riders safety team.</p>
                  </div>
                  <span className="bg-slate-105 font-mono text-slate-700 text-xs px-2.5 py-1 rounded-md font-bold border">
                    ORDER REF: {activePendingOrder.id}
                  </span>
                </div>

                {/* Toast status banner */}
                {dispatchSuccess && (
                  <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-600" />
                    <span className="font-semibold">{dispatchSuccess}</span>
                  </div>
                )}
                {dispatchError && (
                  <div className="bg-rose-50 border border-rose-300 p-3.5 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                    <AlertCircle className="h-4.5 w-4.5 text-rose-600" />
                    <span className="font-semibold">{dispatchError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <div className="space-y-3">
                    <p className="font-bold text-[10px] uppercase text-slate-400 tracking-widest">Shipment Overview</p>
                    <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                      <div>
                        <span className="text-slate-400 text-[10px]">Recipient client:</span>
                        <p className="font-bold text-slate-800">{activePendingOrder.patientName}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">Medical Packing Location:</span>
                        <p className="font-medium text-slate-700">{activePendingOrder.allocatedPharmacyName}</p>
                        <p className="text-[10px] text-slate-500 font-mono italic">Drug license: verified</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">Delivery point mapping address:</span>
                        <p className="font-medium text-slate-700">{activePendingOrder.deliveryAddress}, {activePendingOrder.city}</p>
                      </div>
                    </div>
                  </div>

                  {/* Dispatch configuration */}
                  <form onSubmit={handleDispatchOrder} className="space-y-4 flex flex-col justify-between">
                    <div className="space-y-2">
                      <p className="font-bold text-[10px] uppercase text-slate-400 tracking-widest">Select Available Carrier / Agency</p>
                      <div className="space-y-1.5">
                        <select
                          id="select-delivery-carrier"
                          value={chosenAgentId}
                          onChange={(e) => setChosenAgentId(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-350 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-teal-500 text-slate-800 focus:outline-none"
                          required
                        >
                          <option value="">-- Choose Logistics custody --</option>
                          
                          <optgroup label="Hired Delivery Boys / In-House Riders">
                            {deliveryAgents.filter(a => a.type === "Hired Rider" && a.status === "Available").map(a => (
                              <option key={a.id} value={a.id}>
                                🏍️ {a.name} ({a.vehicle}) - Rating {a.rating}⭐
                              </option>
                            ))}
                          </optgroup>

                          <optgroup label="Approved Corporate Courier Providers">
                            {deliveryAgents.filter(a => a.type === "Approved Courier Agency").map(a => (
                              <option key={a.id} value={a.id}>
                                🏢 {a.name} ({a.agency}) - {a.status}
                              </option>
                            ))}
                          </optgroup>
                        </select>
                        <p className="text-[9px] text-slate-400">
                          Note: In-house hired riders show real-time workload. Only "Available" riders are dispatch-ready.
                        </p>
                      </div>
                    </div>

                    <button
                      id="btn-confirm-dispatch-allocation"
                      type="submit"
                      className="w-full bg-slate-900 hover:bg-slate-800 text-teal-400 py-3 rounded-lg font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition mt-2 shadow-sm"
                    >
                      <Truck className="h-4 w-4" />
                      Assign Partner & Release Shipment
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-center p-12 text-slate-400 my-auto">
                <CheckCircle className="h-16 w-16 text-slate-200 stroke-[1.1] mb-3 text-emerald-400" />
                <h4 className="font-extrabold text-sm text-slate-700 uppercase tracking-wide">Despatch Desk Idle</h4>
                <p className="text-xs text-slate-500 max-w-sm mt-1 mx-auto leading-relaxed">
                  No packages currently require transportation tasking. All processed medical boxes have been cleared towards shipping teams. Great work!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. COURIER / AGENT REGISTRY TAB */}
      {activeSubTab === "registry" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="registry-manager-root">
          
          {/* Empirical Registration Form */}
          <div className="lg:col-span-4 bg-white p-5 border border-slate-200 rounded-2xl shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">Empanel Delivery Agent</h3>
              <p className="text-[11px] text-slate-500 mt-1">Onboard and license new home delivery courier boys and corporate agency networks.</p>
            </div>

            {agentFormSuccess && (
              <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-xl text-[11px] text-emerald-800 font-semibold flex items-start gap-1">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>{agentFormSuccess}</span>
              </div>
            )}

            <form onSubmit={handleRegisterAgent} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Logistics Partner Name</label>
                <input
                  id="input-agent-name"
                  type="text"
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar / FedEx India"
                  className="w-full p-2 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 text-slate-800 text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Partner Entity Type</label>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setNewAgentType("Hired Rider");
                      setNewAgentVehicle("Electric Scooter");
                    }}
                    className={`py-1.5 px-2 border rounded font-semibold transition text-center ${
                      newAgentType === "Hired Rider"
                        ? "bg-teal-50 border-teal-400 text-teal-900"
                        : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    Hired Delivery Boy
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewAgentType("Approved Courier Agency");
                      setNewAgentVehicle("Refrigerated Van Fleet");
                      setNewAgentCorp("Corporate Logistics");
                    }}
                    className={`py-1.5 px-2 border rounded font-semibold transition text-center ${
                      newAgentType === "Approved Courier Agency"
                        ? "bg-teal-50 border-teal-400 text-teal-900"
                        : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    Courier Agency
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Authorized Contact Mobile</label>
                <input
                  id="input-agent-contact"
                  type="text"
                  value={newAgentContact}
                  onChange={(e) => setNewAgentContact(e.target.value)}
                  placeholder="e.g. +91 99881 12233"
                  className="w-full p-2 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 text-slate-800 text-xs focus:outline-none"
                  required
                />
              </div>

              {newAgentType === "Hired Rider" && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hired Agency / Employer Company</label>
                  <input
                    id="input-agent-employer"
                    type="text"
                    value={newAgentCorp}
                    onChange={(e) => setNewAgentCorp(e.target.value)}
                    placeholder="e.g. In-House Speedforce"
                    className="w-full p-2 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 text-slate-800 text-xs focus:outline-none"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Logistics Vehicle / Transit Mode</label>
                <select
                  id="select-agent-vehicle"
                  value={newAgentVehicle}
                  onChange={(e) => setNewAgentVehicle(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded text-slate-800 text-xs focus:outline-none"
                >
                  <option value="Electric Scooter">Electric Scooter (Zero-Emissions)</option>
                  <option value="Two-Wheeler Bike">Two-Wheeler Motorbike</option>
                  <option value="Refrigerated Van Fleet">Refrigerated Bio-Van (Cold-Chain)</option>
                  <option value="Aero Cargo / Cold-Chain">Commercial Air Cargo Route</option>
                  <option value="Drone Quadcopter">Autonomous Medical Drone</option>
                </select>
              </div>

              <button
                id="btn-register-agent-submit"
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-teal-400 py-2.5 rounded font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1 transition"
              >
                <UserPlus className="h-4 w-4" /> Enroll Logistics Node
              </button>
            </form>
          </div>

          {/* Registry Directory List */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-850 uppercase tracking-wider">Logistics Transporters Registry</h3>
                <p className="text-xs text-slate-500">Authorized local delivery boys & corporate courier contracts currently empanelled.</p>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="input-search-agents"
                  type="text"
                  placeholder="Query agents..."
                  value={registrySearch}
                  onChange={(e) => setRegistrySearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 w-[200px] bg-slate-50 hover:bg-slate-100 border border-slate-250 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3">Partner ID</th>
                    <th className="p-3">Partner Identity / Type</th>
                    <th className="p-3">Vehicle Class</th>
                    <th className="p-3">Logistics Employer / Agency</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Rating</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAgents.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-3 font-mono font-bold text-slate-900">{a.id}</td>
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-850 flex items-center gap-1">
                            {a.type === "Hired Rider" ? "🏍️" : "🏢"} {a.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono italic">{a.contact}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium border font-mono">
                          {a.vehicle}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-slate-600">{a.agency}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                          a.status === "Available" ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
                          a.status === "On Trip" ? "bg-amber-50 text-amber-800 border-amber-200" :
                          "bg-slate-150 text-slate-600 border-slate-300"
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-850 font-display">
                        {a.rating.toFixed(1)} ⭐
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          {/* Edit button with Lock restriction */}
                          <button
                            id={`btn-edit-agent-${a.id}`}
                            type="button"
                            onClick={() => setEditingAgent(a)}
                            title={a.createdByAdmin && activeRole !== "admin" ? "Created by ADMIN (Locked)" : "Edit courier details"}
                            className="text-slate-450 hover:text-teal-600 p-1 rounded transition"
                          >
                            {a.createdByAdmin && activeRole !== "admin" ? (
                              <Lock className="h-3.5 w-3.5 text-slate-400" />
                            ) : (
                              <Pencil className="h-3.5 w-3.5 text-slate-500 hover:text-teal-650" />
                            )}
                          </button>

                          {/* Delete button with Lock restriction */}
                          <button
                            id={`btn-delete-agent-${a.id}`}
                            type="button"
                            onClick={() => {
                              if (confirm(`Remove partner ${a.name} from empanelment database?`)) {
                                handleDeleteAgent(a.id);
                              }
                            }}
                            disabled={a.createdByAdmin && activeRole !== "admin"}
                            title={a.createdByAdmin && activeRole !== "admin" ? "Created by ADMIN (Locked)" : "Remove partner"}
                            className="text-slate-450 hover:text-red-500 p-1 rounded transition disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredAgents.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-xs text-slate-400 italic">
                        No registered transporters match the query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Edit Agent Modal Overlay */}
            {editingAgent && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                  <div className="bg-slate-950 text-white p-4.5 flex justify-between items-center">
                    <div>
                      <h4 className="font-extrabold text-sm tracking-tight flex items-center gap-1.5 text-teal-400">
                        <Pencil className="h-4 w-4" /> Edit Courier Partner
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono">ID ref: {editingAgent.id}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingAgent(null)}
                      className="text-slate-400 hover:text-white p-1 rounded-lg transition"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setDeliveryAgents(prev => prev.map(a => a.id === editingAgent.id ? editingAgent : a));
                      setEditingAgent(null);
                    }}
                    className="p-5 space-y-4 text-xs"
                  >
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Partner Name / Identity</label>
                      <input
                        type="text"
                        required
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800 font-semibold"
                        value={editingAgent.name}
                        onChange={(e) => setEditingAgent(prev => prev ? { ...prev, name: e.target.value } : null)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Partner Type</label>
                        <select
                          className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
                          value={editingAgent.type}
                          onChange={(e) => setEditingAgent(prev => prev ? { ...prev, type: e.target.value as any } : null)}
                        >
                          <option value="Hired Rider">Hired Rider</option>
                          <option value="Approved Courier Agency">Approved Courier Agency</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Contact Info</label>
                        <input
                          type="text"
                          required
                          className="w-full p-2.5 border border-slate-200 rounded-lg font-mono"
                          value={editingAgent.contact}
                          onChange={(e) => setEditingAgent(prev => prev ? { ...prev, contact: e.target.value } : null)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Vehicle Class</label>
                        <input
                          type="text"
                          required
                          className="w-full p-2.5 border border-slate-200 rounded-lg"
                          value={editingAgent.vehicle}
                          onChange={(e) => setEditingAgent(prev => prev ? { ...prev, vehicle: e.target.value } : null)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Logistics Employer</label>
                        <input
                          type="text"
                          required
                          className="w-full p-2.5 border border-slate-200 rounded-lg"
                          value={editingAgent.agency}
                          onChange={(e) => setEditingAgent(prev => prev ? { ...prev, agency: e.target.value } : null)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Current Status</label>
                        <select
                          className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
                          value={editingAgent.status}
                          onChange={(e) => setEditingAgent(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                        >
                          <option value="Available">Available</option>
                          <option value="On Trip">On Trip</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Partner Rating (1-5)</label>
                        <input
                          type="number"
                          step="0.1"
                          max="5"
                          min="1"
                          required
                          className="w-full p-2.5 border border-slate-200 rounded-lg"
                          value={editingAgent.rating}
                          onChange={(e) => setEditingAgent(prev => prev ? { ...prev, rating: parseFloat(e.target.value) || 5 } : null)}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setEditingAgent(null)}
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

            <div className="bg-sky-50 border border-sky-200/60 p-3.5 rounded-xl text-sky-900 mt-2 flex items-start gap-2 text-[11px] leading-relaxed">
              <Building2 className="h-4.5 w-4.5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Third-Party Courier Agency Webhooks Connected</p>
                <p className="text-slate-600">
                  Assigning packages to verified commercial courier agencies (Delhivery, BlueDart, etc.) triggers downstream automated API tracking requests. Delivery boys / riders are controlled via MedConnect Mobile.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
