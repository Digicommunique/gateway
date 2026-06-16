/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Order, Pharmacy, Product } from "../types";
import { 
  ClipboardList, 
  ShieldCheck, 
  Printer, 
  Truck, 
  CheckCircle2, 
  TrendingUp, 
  AlertTriangle,
  PlusCircle,
  Search,
  Plus,
  Tag,
  Info,
  Package,
  Sparkles,
  ShoppingBag,
  Layers,
  Check,
  Percent,
  XCircle,
  Pencil,
  Lock,
  Trash2
} from "lucide-react";

interface PharmacyPanelProps {
  pharmacies: Pharmacy[];
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  activeRole: string;
}

export default function PharmacyPanel({ 
  pharmacies, 
  orders, 
  setOrders, 
  products, 
  setProducts,
  activeRole
}: PharmacyPanelProps) {
  const activePharmacies = pharmacies.filter(p => p.status === "Active");
  const [selectedPharmId, setSelectedPharmId] = useState<string>(activePharmacies[0]?.id || "");
  const activePharmacy = activePharmacies.find(p => p.id === selectedPharmId);

  // Tab state for Pharmacy Portal: "orders" or "catalog"
  const [pharmTab, setPharmTab] = useState<"orders" | "catalog">("orders");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Active printed invoice state
  const [printedOrderId, setPrintedOrderId] = useState<string | null>(null);

  // Filter orders allocated to this active pharmacy
  const pharmacyOrders = orders.filter(o => o.allocatedPharmacyId === activePharmacy?.id);

  // Search filter for catalog list
  const [catalogSearch, setCatalogSearch] = useState<string>("");

  // Product addition state
  const [newSkuName, setNewSkuName] = useState<string>("");
  const [newSkuBrand, setNewSkuBrand] = useState<string>("");
  const [newSkuManufacturer, setNewSkuManufacturer] = useState<string>("");
  const [newSkuCategory, setNewSkuCategory] = useState<"Medicines" | "OTC" | "Surgical Items" | "Health Devices" | "Ayurvedic" | "Supplements">("Medicines");
  const [newSkuMrp, setNewSkuMrp] = useState<string>("");
  const [newSkuSelling, setNewSkuSelling] = useState<string>("");
  const [newSkuStock, setNewSkuStock] = useState<string>("150");
  const [skuRxRequired, setSkuRxRequired] = useState<boolean>(false);
  const [newSkuDesc, setNewSkuDesc] = useState<string>("");
  const [selectedImgPreset, setSelectedImgPreset] = useState<string>("https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=200&auto=format&fit=crop");
  
  // Custom Category State
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState<boolean>(false);
  const [customCategoryName, setCustomCategoryName] = useState<string>("");

  // Publish Alert
  const [publishAlert, setPublishAlert] = useState<string | null>(null);

  const handleUpdateOrderStatus = (orderId: string, status: Order["status"]) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newSkuName.trim() || !newSkuBrand.trim()) {
      alert("Please supply both a Medication Name and and brand label.");
      return;
    }

    const mrpNum = parseFloat(newSkuMrp);
    const sellingPriceNum = parseFloat(newSkuSelling);

    if (isNaN(mrpNum) || mrpNum <= 0) {
      alert("Please enter a valid Max Retail Price (MRP).");
      return;
    }

    if (isNaN(sellingPriceNum) || sellingPriceNum <= 0) {
      alert("Please enter a valid Retailing Selling Price.");
      return;
    }

    if (sellingPriceNum > mrpNum) {
      alert("Warning: Retail Selling price cannot exceed the Manufacturer Max Retail Price (MRP). Please revise values.");
      return;
    }

    const newProdId = `PROD-${(300 + products.length + 1)}`;
    const newProduct: Product = {
      id: newProdId,
      name: newSkuName,
      brand: newSkuBrand,
      manufacturer: newSkuManufacturer || `${newSkuBrand} Lab Ltd.`,
      category: newSkuCategory,
      mrp: mrpNum,
      sellingPrice: sellingPriceNum,
      imageUrl: selectedImgPreset,
      description: newSkuDesc || `${newSkuName} designed for certified standard health applications.`,
      prescriptionRequired: skuRxRequired,
      stock: parseInt(newSkuStock) || 120
    };

    setProducts(prev => [newProduct, ...prev]);

    // Show animation success message
    setPublishAlert(`🎉 Successful Empanelment! Product "${newProduct.name}" is now dynamically synchronised live in our general registry and in-app patient checkout marketplace.`);
    
    // Clear Form fields
    setNewSkuName("");
    setNewSkuBrand("");
    setNewSkuManufacturer("");
    setNewSkuMrp("");
    setNewSkuSelling("");
    setNewSkuStock("150");
    setSkuRxRequired(false);
    setNewSkuDesc("");
    
    setTimeout(() => {
      setPublishAlert(null);
    }, 6000);
  };

  // Filter products for catalog list
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(catalogSearch.toLowerCase()) || 
    p.brand.toLowerCase().includes(catalogSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  const imgPresets = [
    { label: "Red Gel Capsule", url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=200&auto=format&fit=crop" },
    { label: "Medication Pill Jar", url: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?q=80&w=200&auto=format&fit=crop" },
    { label: "Teal Bottle Care", url: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?q=80&w=200&auto=format&fit=crop" },
    { label: "Health Device Box", url: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?q=80&w=200&auto=format&fit=crop" }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="pharmacy-panel-root">
      {/* Sidebar Selector */}
      <div className="lg:col-span-3 bg-white p-5 border border-slate-100 rounded-2xl shadow-sm flex flex-col gap-4">
        <div>
          <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">Active Store</h3>
          <p className="text-xs text-slate-500 mt-1">Simulate incoming order routing on discrete stores.</p>
        </div>

        <div className="flex flex-col gap-2">
          {activePharmacies.map(p => (
            <button
              id={`btn-pharm-store-${p.id}`}
              key={p.id}
              onClick={() => {
                setSelectedPharmId(p.id);
                setPrintedOrderId(null);
              }}
              className={`w-full text-left p-3 rounded-xl border text-xs transition font-semibold ${
                selectedPharmId === p.id
                  ? "bg-teal-50 border-teal-400 text-teal-900"
                  : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
              }`}
            >
              <div className="flex justify-between items-start">
                <p className="font-bold">{p.name}</p>
                {p.isPreferred && (
                  <span className="text-[8px] bg-teal-600 text-white font-mono px-1 py-0.2 rounded font-black uppercase tracking-tight">Preferred</span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">{p.city} • Commission cut: {p.commissionRate}%</p>
            </button>
          ))}
        </div>

        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs space-y-1 mt-4">
          <p className="font-bold text-slate-700">Empanelment Checklist</p>
          <div className="flex items-center gap-1.5 text-emerald-700 text-[10px]">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>Drug license: Verified</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-700 text-[10px]">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>GST profile: Active</span>
          </div> 
        </div>
      </div>

      {/* Main Workspace */}
      <div className="lg:col-span-9 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-6">
        
        {/* Header containing Store context */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 pb-4 gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-850">Pharmacy Operations & Inventory Desk</h2>
            <p className="text-xs text-slate-500 mt-1">Review Smart Router allocated prescriptions, or manage medication catalogue live for patients.</p>
          </div>
          <span className="bg-teal-550 text-white bg-slate-900 text-xs font-mono font-extrabold px-3 py-1 rounded self-start">
            Licensee ID: {activePharmacy?.id || "N/A"}
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200" id="pharmacy-sub-tabs">
          <button
            id="p-tab-orders"
            onClick={() => setPharmTab("orders")}
            className={`px-5 py-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
              pharmTab === "orders" 
                ? "border-teal-600 text-teal-700 font-extrabold" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            Active routed orders ({pharmacyOrders.length})
          </button>
          <button
            id="p-tab-catalog"
            onClick={() => setPharmTab("catalog")}
            className={`px-5 py-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
              pharmTab === "catalog" 
                ? "border-teal-600 text-teal-700 font-extrabold" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <PlusCircle className="h-4 w-4 text-emerald-600" />
            Manage Products & Add Medicine
          </button>
        </div>

        {/* VIEW 1: ACTIVE ORDERS */}
        {pharmTab === "orders" && (
          <div className="space-y-6" id="pharmacy-orders-workspace">
            {/* Dashboard stats Specific to Pharmacy */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-3.5 border border-slate-200 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Assigned</span>
                <p className="text-xl font-bold text-slate-800 mt-1">{pharmacyOrders.length} Orders</p>
              </div>
              <div className="bg-slate-50 p-3.5 border border-slate-200 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400">Gross Sales Volume</span>
                <p className="text-xl font-bold text-slate-800 mt-1">₹ {pharmacyOrders.reduce((sum, o) => sum + o.total, 0)}</p>
              </div>
              <div className="bg-slate-50 p-3.5 border border-slate-200 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400">Your Share (Avg {100 - (activePharmacy?.commissionRate || 10)}%)</span>
                <p className="text-lg font-bold text-emerald-600 mt-1">₹ {pharmacyOrders.reduce((sum, o) => sum + (o.total * (1 - (activePharmacy?.commissionRate || 10)/100)), 0).toFixed(0)}</p>
              </div>
              <div className="bg-slate-50 p-3.5 border border-slate-200 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400">Admin Commission</span>
                <p className="text-lg font-bold text-teal-600 mt-1 font-mono">₹ {pharmacyOrders.reduce((sum, o) => sum + (o.total * ((activePharmacy?.commissionRate || 10)/100)), 0).toFixed(0)}</p>
              </div>
            </div>

            {/* Active routed orders cards */}
            {pharmacyOrders.length > 0 ? (
              <div className="space-y-4" id="pharmacy-orders-list">
                {pharmacyOrders.map((order) => {
                  const isPrinted = printedOrderId === order.id;
                  return (
                    <div key={order.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-slate-350 transition">
                      {/* Status header */}
                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-250 flex justify-between items-center text-xs">
                        <div>
                          <span className="bg-slate-900 text-white font-mono text-[9px] px-2 py-0.5 rounded mr-2 font-bold uppercase">
                            {order.id}
                          </span>
                          <span className="text-slate-500">Beneficiary Patient: <strong>{order.patientName}</strong></span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            order.status === "Delivered" ? "bg-emerald-100 text-emerald-800" :
                            order.status === "Out for Delivery" ? "bg-blue-100 text-blue-800" :
                            order.status === "Preparing" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-800"
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>

                      {/* Order items detail split */}
                      <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-6 space-y-2.5">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Dispensation Checklist</p>
                          <div className="space-y-1.5">
                            {order.items.map((it) => (
                              <div key={it.product.id} className="text-xs flex justify-between items-center bg-slate-50 p-2 rounded">
                                <div>
                                  <span className="font-semibold text-slate-800">{it.product.name}</span>
                                  {it.product.prescriptionRequired && (
                                    <span className="block text-[8px] font-bold text-red-500 uppercase font-mono mt-0.5">Control Rx drug verified</span>
                                  )}
                                </div>
                                <span className="font-mono font-bold text-slate-600 bg-white border px-2 py-0.5 rounded">
                                  Qty: {it.quantity}
                                </span>
                              </div>
                            ))}
                          </div>

                          {order.uploadedPrescriptionUrl && (
                            <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded text-[11px] flex items-center justify-between border border-emerald-250">
                              <span className="font-semibold">Digital prescription signature checked:</span>
                              <code className="bg-emerald-150 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">SHA-256 CHECKED</code>
                            </div>
                          )}
                        </div>

                        {/* Financial split right */}
                        <div className="md:col-span-6 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between text-xs space-y-3">
                          <div>
                            <div className="flex justify-between pb-1.5 border-b border-slate-200">
                              <span className="text-slate-500">Gross Price Subtotal</span>
                              <span className="font-mono font-semibold text-slate-850">₹{order.subtotal}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-200">
                              <span className="text-slate-500">E-Pharmacy Tax (12% CGST/SGST)</span>
                              <span className="font-mono text-slate-600">₹{order.tax.toFixed(0)}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-200 text-teal-800 bg-teal-50/50 px-1 rounded font-semibold">
                              <span>Platform Commission Share ({activePharmacy?.commissionRate || 10}%)</span>
                              <span className="font-mono">₹{(order.total * ((activePharmacy?.commissionRate || 10)/100)).toFixed(0)}</span>
                            </div>
                            <div className="flex justify-between pt-1.5 font-bold text-slate-900 border-t border-slate-200">
                              <span>Patient Bill Payable</span>
                              <span className="font-mono">₹{order.total.toFixed(0)}</span>
                            </div>
                          </div>

                          {/* Store specific workflow buttons */}
                          <div className="flex justify-end gap-2 p-1 bg-white rounded-lg border border-slate-200">
                            <button
                              id={`btn-print-bill-${order.id}`}
                              onClick={() => setPrintedOrderId(isPrinted ? null : order.id)}
                              className="bg-slate-100 hover:bg-slate-200 hover:text-slate-900 text-slate-700 px-3 py-1.5 rounded text-[11px] font-bold flex items-center gap-1 transition"
                            >
                              <Printer className="h-3.5 w-3.5" /> {isPrinted ? "Close bill" : "Dispense Invoice"}
                            </button>

                            {order.status === "Preparing" && (
                              <button
                                id={`btn-ship-${order.id}`}
                                onClick={() => handleUpdateOrderStatus(order.id, "Out for Delivery")}
                                className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded text-[11px] font-bold flex items-center gap-1 shadow-sm transition"
                              >
                                <Truck className="h-3.5 w-3.5" /> Handover to Courier
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Render simulated printed receipt bill invoice */}
                      {isPrinted && (
                        <div className="bg-slate-100 p-5 border-t border-slate-300 font-mono text-xs text-slate-800 space-y-3 animate-fade-in">
                          <div className="text-center border-b border-dashed border-slate-350 pb-3">
                            <h4 className="font-bold uppercase text-sm tracking-wide">{activePharmacy?.name}</h4>
                            <p className="text-[10px] text-slate-500">{activePharmacy?.address}</p>
                            <p className="text-[10px]">Tax Invoice / Drug License: {activePharmacy?.licenseNumber}</p>
                          </div>

                          <div className="space-y-1.5">
                            <p><strong>Invoice No:</strong> TX-90248-1194</p>
                            <p><strong>Customer Name:</strong> {order.patientName}</p>
                            <p><strong>Routing Destination:</strong> {order.deliveryAddress}</p>
                            <div className="border-t border-dashed border-slate-400 my-2 pt-2">
                              {order.items.map((it) => (
                                <div key={it.product.id} className="flex justify-between text-[11px]">
                                  <span>{it.product.name} (x{it.quantity})</span>
                                  <span>₹{it.product.sellingPrice * it.quantity}</span>
                                </div>
                              ))}
                            </div>
                            <div className="border-t border-dashed border-slate-400 pt-1.5 text-right font-bold text-sm">
                              Total Bill Payable (Incl of GST): ₹{order.total.toFixed(0)}
                            </div>
                          </div>

                          <div className="text-center text-[10px] text-slate-500 pt-3 border-t border-dashed border-slate-350">
                            <p>Thank you for using empanelled digital medicine network.</p>
                            <p>Secure token verification: <strong>MD-{order.deliveryOTP}</strong></p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-center p-12 text-slate-400">
                <ClipboardList className="h-12 w-12 text-slate-300 stroke-[1.5] mb-2 animate-pulse" />
                <p className="font-bold text-sm text-slate-700">Order Chamber Quiet</p>
                <p className="text-xs text-slate-400 max-w-sm mt-1">No incoming medicine orders have been routed to this store by the Smart Pharmacy Allocation Engine at this moment.</p>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: PRODUCTS CATALOG MANAGER (ANSWERING "how to add medicine/product/category") */}
        {pharmTab === "catalog" && (
          <div className="space-y-6" id="pharmacy-catalog-workspace">
            
            {publishAlert && (
              <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl text-xs font-bold text-emerald-800 flex items-start gap-2 shadow-sm animate-bounce" id="catalog-success-alert">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <span>{publishAlert}</span>
              </div>
            )}

            {/* Catalog quick statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Dynamic Register Count</span>
                  <p className="text-xl font-black text-slate-800 mt-0.5">{products.length} Products</p>
                </div>
                <div className="p-2.5 bg-sky-100 text-sky-800 rounded-lg">
                  <Package className="h-5 w-5" />
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Prescription-Locked (Rx)</span>
                  <p className="text-xl font-black text-slate-800 mt-0.5">{products.filter(p => p.prescriptionRequired).length} SKU Drugs</p>
                </div>
                <div className="p-2.5 bg-red-150 text-red-700 rounded-lg">
                  <span className="text-xs font-black font-mono">Rx</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Direct OTC Availability</span>
                  <p className="text-xl font-black text-slate-800 mt-0.5">{products.filter(p => !p.prescriptionRequired).length} Products</p>
                </div>
                <div className="p-2.5 bg-teal-100 text-teal-800 rounded-lg">
                  <Percent className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Split Form & Directory */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Form to ADD NEW PRODUCT/MEDICINE */}
              <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                    <PlusCircle className="h-4.5 w-4.5 text-teal-650" />
                    Empanel New SKU Product
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Publish new formulations. Will propagate immediately across the patient marketplace.</p>
                </div>

                <form onSubmit={handleAddProduct} className="space-y-3.5 text-xs">
                  
                  {/* Category select + custom option */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">1. Product Category</label>
                      <button
                        type="button"
                        onClick={() => setShowCustomCategoryInput(!showCustomCategoryInput)}
                        className="text-[11px] text-teal-700 hover:underline font-bold"
                      >
                        {showCustomCategoryInput ? "Choose standard" : "+ Custom Label"}
                      </button>
                    </div>

                    {showCustomCategoryInput ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 p-2 border border-slate-300 rounded-lg bg-white"
                          placeholder="e.g. Inhalers, Pediatric Care..."
                          value={customCategoryName}
                          onChange={(e) => setCustomCategoryName(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (customCategoryName.trim()) {
                              setNewSkuCategory(customCategoryName.trim() as any);
                              setShowCustomCategoryInput(false);
                            }
                          }}
                          className="bg-slate-900 text-white px-2.5 py-1 rounded-lg font-bold"
                        >
                          Keep
                        </button>
                      </div>
                    ) : (
                      <select
                        id="form-sku-category"
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white font-medium"
                        value={newSkuCategory}
                        onChange={(e) => setNewSkuCategory(e.target.value as any)}
                      >
                        <option value="Medicines">Medicines (Normal Rx/Controlled)</option>
                        <option value="OTC">OTC (Over the Counter Generic)</option>
                        <option value="Supplements">Supplements & Nutritionals</option>
                        <option value="Health Devices">Health Devices / Thermometers</option>
                        <option value="Surgical Items">Surgical Items / Kits</option>
                        <option value="Ayurvedic">Ayurvedic / Herbal care</option>
                      </select>
                    )}
                  </div>

                  {/* Sku Name & Brand */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">2. Medication Name & Strength</label>
                    <input
                      id="form-sku-name"
                      type="text"
                      required
                      placeholder="e.g. Paracetamol 650mg (Dolo)"
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white placeholder-slate-400 font-semibold text-slate-800"
                      value={newSkuName}
                      onChange={(e) => setNewSkuName(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Brand Label</label>
                      <input
                        id="form-sku-brand"
                        type="text"
                        required
                        placeholder="e.g. Micro Labs"
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white placeholder-slate-400"
                        value={newSkuBrand}
                        onChange={(e) => setNewSkuBrand(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Manufacturer</label>
                      <input
                        id="form-sku-manufacturer"
                        type="text"
                        placeholder="e.g. Micro Labs Ltd India"
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white placeholder-slate-400"
                        value={newSkuManufacturer}
                        onChange={(e) => setNewSkuManufacturer(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Pricing and Stock */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">MRP (Max price)</label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-2.5 text-slate-400 font-bold">₹</span>
                        <input
                          id="form-sku-mrp"
                          type="number"
                          required
                          placeholder="150"
                          className="w-full p-2 pl-6 border border-slate-300 rounded-lg bg-white font-mono"
                          value={newSkuMrp}
                          onChange={(e) => setNewSkuMrp(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase text-teal-700">Selling Price</label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-2.5 text-teal-650 font-bold">₹</span>
                        <input
                          id="form-sku-selling"
                          type="number"
                          required
                          placeholder="120"
                          className="w-full p-2 pl-6 border border-teal-300 rounded-lg bg-white font-mono font-bold text-teal-900 focus:outline-teal-650"
                          value={newSkuSelling}
                          onChange={(e) => setNewSkuSelling(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Initial Stock</label>
                      <input
                        id="form-sku-stock"
                        type="number"
                        placeholder="200"
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono text-slate-700"
                        value={newSkuStock}
                        onChange={(e) => setNewSkuStock(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Image presets */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">3. Choose SKU Thumbnail Mockup</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {imgPresets.map((preset, index) => {
                        const isSelected = selectedImgPreset === preset.url;
                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setSelectedImgPreset(preset.url)}
                            className={`p-1 bg-white border rounded-xl overflow-hidden text-center transition flex flex-col items-center gap-1 min-h-[46px] relative ${
                              isSelected ? "ring-2 ring-teal-600 border-teal-500" : "hover:border-slate-350"
                            }`}
                          >
                            <img src={preset.url} alt={preset.label} className="h-6 w-full object-cover rounded-md" />
                            <span className="text-[7.5px] scale-95 leading-none block truncate w-full text-slate-500">{preset.label}</span>
                            {isSelected && (
                              <span className="absolute top-0 right-0 h-3.5 w-3.5 bg-teal-600 text-white rounded-bl-lg flex items-center justify-center">
                                <Check className="h-2 w-2" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Prescription Required control toggles */}
                  <div className="py-2.5 px-3 bg-slate-100 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <strong className="text-slate-800 text-[11px] block">Prescription Mandatory? (Schedule H)</strong>
                        <span className="text-[10px] text-slate-400">Force clinical Rx attachments at checkout.</span>
                      </div>
                      <button
                        type="button"
                        id="btn-toggle-rx-req"
                        onClick={() => setSkuRxRequired(!skuRxRequired)}
                        className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-250 ${
                          skuRxRequired ? "bg-red-650 bg-red-600" : "bg-slate-300"
                        }`}
                      >
                        <div className={`bg-white h-5 w-5 rounded-full shadow-md transform transition-transform duration-250 ${
                          skuRxRequired ? "translate-x-5" : "translate-x-0"
                        }`} />
                      </button>
                    </div>
                    {skuRxRequired && (
                      <em className="text-[9.5px] text-red-500 block leading-tight font-sans">
                        ⚠️ Alert: This item will be flagged as Schedule H. Patients CANNOT purchase this unless they attach an authorized digital doctor e-Prescription.
                      </em>
                    )}
                  </div>

                  {/* SKU description */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Product Description & Directives</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. High intensity analgesic used to address persistent physical pain. Take strictly after meal supervision..."
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                      value={newSkuDesc}
                      onChange={(e) => setNewSkuDesc(e.target.value)}
                    />
                  </div>

                  <button
                    id="btn-sku-publish"
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-teal-400 font-extrabold text-[11px] py-3 rounded-lg shadow transition flex items-center justify-center gap-1.5 uppercase"
                  >
                    <Plus className="h-4 w-4" /> Publish SKU & Register Product
                  </button>
                </form>
              </div>

              {/* Right Column: Live Medicine Catalogue Directory inside the sandbox */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800">Dynamic Catalogue Store ({filteredProducts.length})</h4>
                    <span className="text-[10px] text-slate-400">Live directory reflecting client-side database.</span>
                  </div>
                  
                  {/* Search bar inside Catalog */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filter medications..."
                      className="py-1 text-xs pl-8 pr-3 border border-slate-200 rounded-full bg-slate-50 focus:bg-white focus:outline-none"
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="border border-slate-150 rounded-2xl overflow-hidden bg-white max-h-[500px] overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[9px] tracking-wider">
                      <tr>
                        <th className="p-3">SKU Code</th>
                        <th className="p-3">Medication Name</th>
                        <th className="p-3 font-right text-right">Selling Price</th>
                        <th className="p-3 text-center">Stock</th>
                        <th className="p-3 text-right">Verification</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/70 transition [content-visibility:auto]">
                          <td className="p-3 font-mono font-bold text-[10px] text-slate-400">{p.id}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <img src={p.imageUrl} className="h-8 w-8 object-cover rounded-lg border bg-slate-100" referrerPolicy="no-referrer" />
                              <div className="min-w-0">
                                <p className="font-bold text-slate-800 truncate max-w-[170px]">{p.name}</p>
                                <p className="text-[9.5px] text-slate-450 text-slate-400">{p.brand} • <span className="text-[8.5px] px-1 bg-slate-100 border rounded lowercase text-slate-500">#{p.category}</span></p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <span className="font-mono font-bold text-slate-800">₹{p.sellingPrice}</span>
                            {p.mrp > p.sellingPrice && (
                              <span className="block text-[9px] text-slate-400 line-through">MRP: ₹{p.mrp}</span>
                            )}
                          </td>
                          <td className="p-3 text-center font-mono">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              p.stock < 50 ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"
                            }`}>
                              {p.stock} units
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {p.prescriptionRequired ? (
                              <span className="bg-red-50 text-red-700 border border-red-200 rounded px-2 py-0.5 font-bold font-mono text-[9px] uppercase tracking-wide">
                                Rx required
                              </span>
                            ) : (
                              <span className="bg-emerald-50 text-emerald-700 rounded px-2 py-0.5 font-bold font-mono text-[9px] uppercase tracking-wide">
                                OTC Direct
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-1.5">
                              {/* Edit Button with lock restriction */}
                              <button
                                id={`btn-edit-prod-${p.id}`}
                                type="button"
                                onClick={() => setEditingProduct(p)}
                                title={p.createdByAdmin && activeRole !== "admin" ? "Created by ADMIN (Locked)" : "Edit product details"}
                                className="text-slate-400 hover:text-teal-655 p-1 rounded transition"
                              >
                                {p.createdByAdmin && activeRole !== "admin" ? (
                                  <Lock className="h-3.5 w-3.5 text-slate-400" />
                                ) : (
                                  <Pencil className="h-3.5 w-3.5 text-slate-500" />
                                )}
                              </button>

                              {/* Delete Button with lock restriction */}
                              <button
                                id={`btn-delete-prod-${p.id}`}
                                type="button"
                                onClick={() => {
                                  if (confirm(`Remove custom SKU "${p.name}" from catalog forever?`)) {
                                    setProducts(prev => prev.filter(item => item.id !== p.id));
                                  }
                                }}
                                disabled={p.createdByAdmin && activeRole !== "admin"}
                                title={p.createdByAdmin && activeRole !== "admin" ? "Created by ADMIN (Locked)" : "Remove SKU from catalogue"}
                                className="text-slate-400 hover:text-red-500 p-1 rounded transition disabled:opacity-30 disabled:cursor-not-allowed"
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

                {/* Edit Product Modal Overlay */}
                {editingProduct && (
                  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                      <div className="bg-slate-950 text-white p-4.5 flex justify-between items-center">
                        <div>
                          <h4 className="font-extrabold text-sm tracking-tight flex items-center gap-1.5 text-teal-400">
                            <Pencil className="h-4 w-4" /> Edit Medication Product
                          </h4>
                          <p className="text-[10px] text-slate-400 font-mono font-bold">SKU Ref: {editingProduct.id}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingProduct(null)}
                          className="text-slate-400 hover:text-white p-1 rounded-lg transition"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          setProducts(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p));
                          setEditingProduct(null);
                        }}
                        className="p-5 space-y-4 text-xs"
                      >
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Medication Name</label>
                          <input
                            type="text"
                            required
                            className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800 font-semibold"
                            value={editingProduct.name}
                            onChange={(e) => setEditingProduct(prev => prev ? { ...prev, name: e.target.value } : null)}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Product Brand</label>
                            <input
                              type="text"
                              required
                              className="w-full p-2.5 border border-slate-200 rounded-lg"
                              value={editingProduct.brand}
                              onChange={(e) => setEditingProduct(prev => prev ? { ...prev, brand: e.target.value } : null)}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Manufacturer</label>
                            <input
                              type="text"
                              required
                              className="w-full p-2.5 border border-slate-200 rounded-lg"
                              value={editingProduct.manufacturer}
                              onChange={(e) => setEditingProduct(prev => prev ? { ...prev, manufacturer: e.target.value } : null)}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">MRP (₹)</label>
                            <input
                              type="number"
                              required
                              min="1"
                              className="w-full p-2.5 border border-slate-200 rounded-lg font-mono font-bold"
                              value={editingProduct.mrp}
                              onChange={(e) => setEditingProduct(prev => prev ? { ...prev, mrp: parseFloat(e.target.value) || 0 } : null)}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-mono">Selling Price</label>
                            <input
                              type="number"
                              required
                              min="1"
                              className="w-full p-2.5 border border-slate-200 rounded-lg font-mono font-bold text-teal-600"
                              value={editingProduct.sellingPrice}
                              onChange={(e) => setEditingProduct(prev => prev ? { ...prev, sellingPrice: parseFloat(e.target.value) || 0 } : null)}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Stock Units</label>
                            <input
                              type="number"
                              required
                              min="0"
                              className="w-full p-2.5 border border-slate-200 rounded-lg font-mono"
                              value={editingProduct.stock}
                              onChange={(e) => setEditingProduct(prev => prev ? { ...prev, stock: parseInt(e.target.value) || 0 } : null)}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Category</label>
                            <select
                              className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
                              value={editingProduct.category}
                              onChange={(e) => setEditingProduct(prev => prev ? { ...prev, category: e.target.value as any } : null)}
                            >
                              <option value="Medicines">Medicines</option>
                              <option value="OTC">OTC</option>
                              <option value="Surgical Items">Surgical Items</option>
                              <option value="Health Devices">Health Devices</option>
                              <option value="Ayurvedic">Ayurvedic</option>
                              <option value="Supplements">Supplements</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Prescription Code</label>
                            <select
                              className="w-full p-2.5 border border-slate-200 rounded-lg bg-white font-bold"
                              value={editingProduct.prescriptionRequired ? "true" : "false"}
                              onChange={(e) => setEditingProduct(prev => prev ? { ...prev, prescriptionRequired: e.target.value === "true" } : null)}
                            >
                              <option value="false">OTC Direct (No Rx)</option>
                              <option value="true">Prescription Mandatory (Rx)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Illustration Cover Image URL</label>
                          <input
                            type="text"
                            className="w-full p-2.5 border border-slate-200 rounded-lg font-mono"
                            value={editingProduct.imageUrl}
                            onChange={(e) => setEditingProduct(prev => prev ? { ...prev, imageUrl: e.target.value } : null)}
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setEditingProduct(null)}
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

                <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl text-xs flex gap-2.5 items-start text-blue-900">
                  <Info className="h-4.5 w-4.5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-[10px] uppercase">Live Channel Synchronization</span>
                    <p className="text-[10.5px] leading-relaxed text-blue-800">
                      When a new SKU is published here, the virtual database reacts immediately. Logged in patients can immediately view this product under the <strong>Medicine Marketplace</strong> tab, filter by its category range, and purchase it with custom routing criteria.
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
