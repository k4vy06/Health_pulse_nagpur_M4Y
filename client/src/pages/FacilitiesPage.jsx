import React, { useState, useEffect } from 'react';
import { facilitiesAPI, wardsAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import BedCapacityMeter from '../components/charts/BedCapacityMeter';
import { StatusBadge } from '../components/common/Badge';
import {
  Hospital,
  Building2,
  Search,
  Filter,
  Phone,
  MapPin,
  Stethoscope,
  Users,
  AlertCircle,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { formatNumber, calculateBedOccupancy } from '../utils/helpers';

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        setLoading(true);
        const data = await facilitiesAPI.getAll();
        setFacilities(data || []);
      } catch (err) {
        console.error('Failed to load facilities:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFacilities();
  }, []);

  const facilityTypes = ['ALL', 'PHC', 'URBAN_HEALTH_CENTER', 'DISTRICT_HOSPITAL', 'CHC', 'DISPENSARY'];

  const filteredFacilities = facilities.filter((f) => {
    const matchesSearch =
      (f.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.wardId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.address || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || f.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || f.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return <LoadingSpinner message="Querying Hospital & PHC Bed Capacities..." fullPage />;
  }

  const totalBeds = facilities.reduce((sum, f) => sum + (f.beds || 0), 0);
  const totalAvailBeds = facilities.reduce((sum, f) => sum + (f.availableBeds || 0), 0);
  const totalDoctors = facilities.reduce((sum, f) => sum + (f.doctors || 0), 0);
  const pressureCount = facilities.filter((f) => f.status === 'PRESSURE' || f.status === 'CRITICAL').length;
  const overallOccupancy = Math.round(((totalBeds - totalAvailBeds) / totalBeds) * 100) || 72;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Healthcare Facility & Bed Capacity Tracker
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400 border border-primary-500/30">
              City Health Network
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Real-time bed availability, patient surge capacity, and clinical staffing across Primary Health Centers (PHCs) and District Hospitals.
          </p>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-surface-800 border border-surface-700 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase">Total City Beds</span>
            <div className="text-lg font-bold text-white">{formatNumber(totalBeds)}</div>
          </div>
          <Hospital className="w-5 h-5 text-primary-400" />
        </div>
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase">Available Surge Beds</span>
            <div className="text-lg font-bold text-emerald-400">{formatNumber(totalAvailBeds)}</div>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase">Facilities Under Pressure</span>
            <div className="text-lg font-bold text-amber-400">{pressureCount}</div>
          </div>
          <AlertCircle className="w-5 h-5 text-amber-400" />
        </div>
        <div className="p-3.5 rounded-xl bg-surface-800 border border-surface-700 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase">Doctors on Duty</span>
            <div className="text-lg font-bold text-white">{totalDoctors} Staff</div>
          </div>
          <Stethoscope className="w-5 h-5 text-cyan-400" />
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface-800/90 backdrop-blur border border-surface-600 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by facility name, address, or ward ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-700 border border-surface-600 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
          />
        </div>

        {/* Facility Type Filter */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-bold text-gray-400 uppercase mr-1">Type:</span>
          {facilityTypes.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                typeFilter === t
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-700 text-gray-400 hover:text-white'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Pressure Status Filter */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-bold text-gray-400 uppercase mr-1">Status:</span>
          {['ALL', 'PRESSURE', 'NORMAL'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === s
                  ? 'bg-red-600 text-white'
                  : 'bg-surface-700 text-gray-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFacilities.map((fac) => {
          const occupancy = calculateBedOccupancy(fac.beds, fac.availableBeds);
          const isPressure = fac.status === 'PRESSURE' || fac.status === 'CRITICAL';

          return (
            <div
              key={fac._id}
              className={`bg-surface-800/90 border rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 ${
                isPressure ? 'border-red-500/40 hover:border-red-500/70' : 'border-surface-600/80 hover:border-primary-500/50'
              }`}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-surface-700 text-gray-400 border border-surface-600">
                        {fac.wardId || 'W01'}
                      </span>
                      <span className="text-[10px] font-bold text-primary-400 uppercase">
                        {fac.type?.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1 leading-snug">{fac.name}</h3>
                  </div>
                  <StatusBadge status={fac.status} size="xs" />
                </div>

                {/* Bed Capacity Meter */}
                <BedCapacityMeter
                  beds={fac.beds}
                  availableBeds={fac.availableBeds}
                  type={fac.type}
                  showDetails={true}
                />

                {/* Staffing & Location Details */}
                <div className="space-y-1.5 text-xs text-gray-300 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-primary-400" /> Doctors on duty:
                    </span>
                    <span className="font-bold text-white">{fac.doctors || '3'} physicians</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" /> Helpline:
                    </span>
                    <span className="font-mono text-gray-200">{fac.phone || '0712-2631000'}</span>
                  </div>

                  <div className="text-[11px] text-gray-400 pt-1 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{fac.address || 'Nagpur'}</span>
                  </div>
                </div>
              </div>

              {/* Action Trigger */}
              <div className="pt-3 border-t border-surface-700/80 flex items-center justify-between">
                <a
                  href={`tel:${fac.phone || '0712-2631000'}`}
                  className="btn-ghost text-xs py-1.5 px-2.5 flex items-center gap-1.5"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call Emergency Desk</span>
                </a>

                {isPressure && (
                  <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                    Surge Alert
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
