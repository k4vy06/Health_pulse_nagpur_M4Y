import React, { useState, useEffect } from 'react';
import { interventionsAPI, wardsAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import {
  ClipboardList,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Users,
  ShieldAlert,
  Calendar,
  Sparkles,
  Plus,
  Trash2,
  Activity
} from 'lucide-react';
import { formatRelativeTime } from '../utils/helpers';

export default function InterventionsPage() {
  const [interventions, setInterventions] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form State for creating new intervention
  const [newForm, setNewForm] = useState({
    wardId: 'W01',
    wardName: 'Sakkardara',
    disease: 'Dengue',
    title: '',
    priority: 'URGENT',
    assignedTeam: 'Vector Control Team Alpha',
    notes: '',
    tasks: [
      { label: 'Field inspection of breeding sites', completed: false },
      { label: 'Chemical fogging in high density zones', completed: false },
      { label: 'Door-to-door community awareness', completed: false },
      { label: 'Day 7 follow-up fever surveillance', completed: false }
    ]
  });

  const fetchInterventions = async () => {
    try {
      setLoading(true);
      const [intData, wardsData] = await Promise.all([
        interventionsAPI.getAll(),
        wardsAPI.getAll()
      ]);
      setInterventions(intData || []);
      setWards(wardsData || []);
    } catch (err) {
      console.error('Failed to load interventions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterventions();
  }, []);

  const handleTaskToggle = async (interventionId, taskIndex, currentStatus) => {
    try {
      await interventionsAPI.updateTask(interventionId, taskIndex, !currentStatus);
      setInterventions((prev) =>
        prev.map((item) => {
          if (item._id === interventionId && item.tasks) {
            const updated = [...item.tasks];
            updated[taskIndex] = { ...updated[taskIndex], completed: !currentStatus };
            const allCompleted = updated.every((t) => t.completed);
            return {
              ...item,
              tasks: updated,
              status: allCompleted ? 'COMPLETED' : item.status === 'ASSIGNED' ? 'IN_PROGRESS' : item.status
            };
          }
          return item;
        })
      );
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newForm.title) return;
    try {
      await interventionsAPI.create(newForm);
      setIsCreateModalOpen(false);
      fetchInterventions();
      // Reset form
      setNewForm({
        wardId: 'W01',
        wardName: 'Sakkardara',
        disease: 'Dengue',
        title: '',
        priority: 'URGENT',
        assignedTeam: 'Vector Control Team Alpha',
        notes: '',
        tasks: [
          { label: 'Field inspection of breeding sites', completed: false },
          { label: 'Chemical fogging in high density zones', completed: false },
          { label: 'Door-to-door community awareness', completed: false }
        ]
      });
    } catch (err) {
      console.error('Failed to create intervention:', err);
    }
  };

  const handleAddTaskInput = () => {
    setNewForm({
      ...newForm,
      tasks: [...newForm.tasks, { label: '', completed: false }]
    });
  };

  const handleRemoveTaskInput = (index) => {
    setNewForm({
      ...newForm,
      tasks: newForm.tasks.filter((_, i) => i !== index)
    });
  };

  const filteredInterventions = interventions.filter((item) => {
    const matchesSearch =
      (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.wardName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.disease || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.assignedTeam || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || item.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) {
    return <LoadingSpinner message="Loading Municipal Intervention Logs..." fullPage />;
  }

  const inProgressCount = interventions.filter((i) => i.status === 'IN_PROGRESS').length;
  const assignedCount = interventions.filter((i) => i.status === 'ASSIGNED').length;
  const completedCount = interventions.filter((i) => i.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Containment Operations Manager
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {inProgressCount + assignedCount} Active Teams
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Deploy and track municipal containment teams, vector spray operations, chlorination drives, and ASHA worker checklists.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary flex items-center gap-2 text-xs bg-gradient-to-r from-primary-600 to-indigo-600 shadow-lg shadow-primary-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Deploy New Intervention</span>
        </button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase">In Progress</span>
            <div className="text-lg font-bold text-amber-400">{inProgressCount} Ops</div>
          </div>
          <Clock className="w-5 h-5 text-amber-400" />
        </div>
        <div className="p-3.5 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-primary-400 uppercase">Assigned / Dispatched</span>
            <div className="text-lg font-bold text-primary-400">{assignedCount} Ops</div>
          </div>
          <Users className="w-5 h-5 text-primary-400" />
        </div>
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase">Completed</span>
            <div className="text-lg font-bold text-emerald-400">{completedCount} Ops</div>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="p-3.5 rounded-xl bg-surface-800 border border-surface-700 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase">Urgent Priority</span>
            <div className="text-lg font-bold text-white">
              {interventions.filter((i) => i.priority === 'URGENT').length}
            </div>
          </div>
          <ShieldAlert className="w-5 h-5 text-red-400" />
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface-800/90 backdrop-blur border border-surface-600 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by operation title, ward, team, or pathogen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-700 border border-surface-600 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 overflow-x-auto">
          <span className="text-[11px] font-bold text-gray-400 uppercase mr-1">Status:</span>
          {['ALL', 'IN_PROGRESS', 'ASSIGNED', 'COMPLETED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === s
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-700 text-gray-400 hover:text-white'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1 overflow-x-auto">
          <span className="text-[11px] font-bold text-gray-400 uppercase mr-1">Priority:</span>
          {['ALL', 'URGENT', 'HIGH', 'ROUTINE'].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-2 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                priorityFilter === p
                  ? 'bg-red-600 text-white'
                  : 'bg-surface-700 text-gray-400 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Interventions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredInterventions.map((intv) => {
          const completedTasks = (intv.tasks || []).filter((t) => t.completed).length;
          const totalTasks = (intv.tasks || []).length || 1;
          const progressPercent = Math.round((completedTasks / totalTasks) * 100);

          return (
            <div
              key={intv._id}
              className="bg-surface-800/90 border border-surface-600/80 rounded-2xl p-5 space-y-4 shadow-lg hover:border-primary-500/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Top Row: Ward, Disease, Badges */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[11px] font-bold text-gray-400">{intv.wardId}</span>
                      <span className="text-xs font-semibold text-gray-300">{intv.wardName}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs font-bold text-primary-400">{intv.disease}</span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1 leading-snug">{intv.title}</h3>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <PriorityBadge priority={intv.priority} size="xs" />
                    <StatusBadge status={intv.status} size="xs" />
                  </div>
                </div>

                {/* Assigned Team & Timeline */}
                <div className="flex items-center justify-between text-xs text-gray-400 bg-surface-700/40 px-3 py-2 rounded-xl border border-surface-600/60">
                  <span>Team: <strong className="text-gray-200">{intv.assignedTeam}</strong></span>
                  <span>{formatRelativeTime(intv.createdAt)}</span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] font-bold uppercase text-gray-400">Task Completion</span>
                    <span className="font-mono font-bold text-white">
                      {completedTasks}/{totalTasks} ({progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Interactive Tasks Checklist */}
                <div className="space-y-2 pt-2 border-t border-surface-700/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                    Protocol Action Items:
                  </span>
                  {(intv.tasks || []).map((task, idx) => (
                    <label
                      key={idx}
                      className="flex items-start gap-2.5 p-2 rounded-lg bg-surface-700/50 hover:bg-surface-700 border border-surface-600/60 cursor-pointer transition-colors text-xs text-gray-200"
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleTaskToggle(intv._id, idx, task.completed)}
                        className="rounded bg-surface-700 border-surface-500 text-emerald-500 focus:ring-0 cursor-pointer mt-0.5"
                      />
                      <span className={task.completed ? 'line-through text-gray-400' : 'font-medium'}>
                        {task.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {intv.notes && (
                <div className="pt-2 text-[11px] text-gray-400 italic border-t border-surface-700">
                  Note: {intv.notes}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* New Intervention Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Deploy New Outbreak Intervention"
        subtitle="Authorize an official public health containment team for municipal deployment"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Target Ward</label>
              <select
                value={newForm.wardId}
                onChange={(e) => {
                  const selWard = wards.find((w) => w.wardId === e.target.value);
                  setNewForm({
                    ...newForm,
                    wardId: e.target.value,
                    wardName: selWard?.name || 'Sakkardara'
                  });
                }}
                className="w-full bg-surface-700 border border-surface-600 rounded-xl p-2.5 text-white"
              >
                {wards.map((w) => (
                  <option key={w.wardId} value={w.wardId}>
                    {w.wardId} - {w.name} ({w.zone} Zone)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">Target Pathogen</label>
              <select
                value={newForm.disease}
                onChange={(e) => setNewForm({ ...newForm, disease: e.target.value })}
                className="w-full bg-surface-700 border border-surface-600 rounded-xl p-2.5 text-white"
              >
                <option value="Dengue">Dengue</option>
                <option value="Malaria">Malaria</option>
                <option value="Chikungunya">Chikungunya</option>
                <option value="Typhoid">Typhoid</option>
                <option value="Influenza">Influenza</option>
                <option value="Diarrheal Disease">Diarrheal Disease</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Operation Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Sakkardara Vector Control & Larval Containment Phase 1"
              value={newForm.title}
              onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
              className="w-full bg-surface-700 border border-surface-600 rounded-xl p-2.5 text-white placeholder-gray-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Response Priority</label>
              <select
                value={newForm.priority}
                onChange={(e) => setNewForm({ ...newForm, priority: e.target.value })}
                className="w-full bg-surface-700 border border-surface-600 rounded-xl p-2.5 text-white"
              >
                <option value="URGENT">URGENT (0-24h Response)</option>
                <option value="HIGH">HIGH (1-3 Days Response)</option>
                <option value="ROUTINE">ROUTINE (Surveillance)</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">Assigned Response Team</label>
              <input
                type="text"
                value={newForm.assignedTeam}
                onChange={(e) => setNewForm({ ...newForm, assignedTeam: e.target.value })}
                className="w-full bg-surface-700 border border-surface-600 rounded-xl p-2.5 text-white"
              />
            </div>
          </div>

          {/* Action Tasks List Builder */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-gray-300 font-semibold">Action Tasks</label>
              <button
                type="button"
                onClick={handleAddTaskInput}
                className="text-[11px] font-bold text-primary-400 hover:text-primary-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Task
              </button>
            </div>

            <div className="space-y-2">
              {newForm.tasks.map((task, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={task.label}
                    onChange={(e) => {
                      const updated = [...newForm.tasks];
                      updated[idx].label = e.target.value;
                      setNewForm({ ...newForm, tasks: updated });
                    }}
                    placeholder={`Task #${idx + 1}`}
                    className="flex-1 bg-surface-700 border border-surface-600 rounded-lg px-3 py-1.5 text-white text-xs"
                  />
                  {newForm.tasks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTaskInput(idx)}
                      className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Operational Notes</label>
            <textarea
              rows={2}
              value={newForm.notes}
              onChange={(e) => setNewForm({ ...newForm, notes: e.target.value })}
              placeholder="Specific briefing notes or local instructions..."
              className="w-full bg-surface-700 border border-surface-600 rounded-xl p-2.5 text-white placeholder-gray-500"
            />
          </div>

          <div className="pt-3 border-t border-surface-700 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="btn-ghost text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs bg-primary-600 hover:bg-primary-500"
            >
              Deploy Team
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
