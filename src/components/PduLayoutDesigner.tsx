"use client";

import React from 'react';
import { useConfigStore, SlotItem } from '@/store/useConfigStore';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, AlertCircle, Zap, Shield, BarChart3 } from 'lucide-react';

/** 
 * SCHUKO SOCKET SCHEMA (Based on user photo)
 */
const SchukoSvg = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-current">
    <rect x="5" y="5" width="90" height="90" rx="15" fill="none" stroke="currentColor" strokeWidth="2.5" />
    <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="38" cy="50" r="4.5" fill="currentColor" />
    <circle cx="62" cy="50" r="4.5" fill="currentColor" />
    <rect x="47" y="15" width="6" height="10" rx="1" fill="currentColor" />
    <rect x="47" y="75" width="6" height="10" rx="1" fill="currentColor" />
    <line x1="45" y1="50" x2="55" y2="50" stroke="currentColor" strokeWidth="2" />
    <line x1="50" y1="45" x2="50" y2="55" stroke="currentColor" strokeWidth="2" />
    <circle cx="50" cy="50" r="8" fill="none" stroke="currentColor" strokeWidth="1" />
  </svg>
);

/**
 * IEC C13 SCHEMA
 */
const IecC13Svg = () => (
  <svg viewBox="0 0 100 60" className="w-full h-full text-current">
    <path d="M20,10 L80,10 L90,25 L90,45 L10,45 L10,25 Z" fill="none" stroke="currentColor" strokeWidth="3" />
    <rect x="25" y="22" width="6" height="12" rx="1" fill="currentColor" />
    <rect x="69" y="22" width="6" height="12" rx="1" fill="currentColor" />
    <rect x="47" y="18" width="6" height="12" rx="1" fill="currentColor" />
  </svg>
);

/**
 * MCB / BREAKER SCHEMA
 */
const BreakerSvg = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-current">
    <rect x="20" y="10" width="60" height="80" rx="4" fill="none" stroke="currentColor" strokeWidth="3" />
    <rect x="35" y="30" width="30" height="40" rx="2" fill="currentColor" opacity="0.2" />
    <rect x="42" y="35" width="16" height="30" rx="1" fill="currentColor" />
    <line x1="10" y1="50" x2="20" y2="50" stroke="currentColor" strokeWidth="2" />
    <line x1="80" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="2" />
    <text x="50" y="25" textAnchor="middle" fontSize="8" fontWeight="bold" fill="currentColor">MCB</text>
  </svg>
);

/**
 * METER / DISPLAY SCHEMA
 */
const MeterSvg = () => (
  <svg viewBox="0 0 100 60" className="w-full h-full text-current">
    <rect x="5" y="5" width="90" height="50" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5" />
    <rect x="15" y="15" width="70" height="30" rx="2" fill="currentColor" opacity="0.1" />
    <text x="50" y="36" textAnchor="middle" fontSize="18" fontFamily="monospace" fontWeight="bold" fill="currentColor">88.8</text>
    <circle cx="80" cy="40" r="1.5" fill="currentColor" className="animate-pulse" />
  </svg>
);

interface SortableItemProps {
  item: SlotItem;
}

const SortableItem = ({ item }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  const renderSchema = () => {
    const labelLower = item.label.toLowerCase();
    if (item.type === 'protection') return <BreakerSvg />;
    if (item.type === 'calculation') return <MeterSvg />;
    if (labelLower.includes('schuko')) return <SchukoSvg />;
    if (labelLower.includes('c13')) return <IecC13Svg />;
    if (labelLower.includes('c19')) return <IecC13Svg />; // Simplified for now
    return <Zap className="w-8 h-8 opacity-20" />;
  };

  const getThemeColors = () => {
    switch (item.type) {
      case 'protection': return 'text-orange-500/80';
      case 'calculation': return 'text-emerald-500/80';
      default: return 'text-blue-500/80';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-center justify-between gap-4 p-4 min-h-[140px] w-full max-w-[120px] mx-auto 
        bg-[#f8fafc] dark:bg-[#0f172a] border-x-4 border-y border-[#cbd5e1] dark:border-[#334155]
        transition-all duration-200 cursor-default select-none
        ${isDragging ? 'shadow-2xl scale-105 opacity-80 ring-2 ring-[var(--accent-brand)] z-50' : 'hover:bg-white dark:hover:bg-[#1e293b]'}
      `}
    >
      {/* Visual background marks like the real pdu */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex flex-col justify-between p-1">
        {[...Array(10)].map((_, i) => <div key={i} className="h-px w-full bg-current" />)}
      </div>

      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners} 
        className="absolute -right-10 top-1/2 -translate-y-1/2 p-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm cursor-grab active:cursor-grabbing hover:scale-110 transition-transform opacity-0 group-hover:opacity-100"
      >
        <GripVertical className="w-5 h-5 text-slate-400" />
      </div>

      <div className={`w-full h-full flex flex-col items-center justify-center gap-3 ${getThemeColors()}`}>
        <div className="w-16 h-16 flex items-center justify-center">
          {renderSchema()}
        </div>
        
        <div className="text-center">
          <span className="block text-[8px] font-black uppercase tracking-widest opacity-40 leading-none mb-1">
            {item.type}
          </span>
          <p className="text-[10px] font-black uppercase tracking-tight text-slate-600 dark:text-slate-400 leading-tight px-1">
            {item.label}
          </p>
        </div>
      </div>
    </div>
  );
};

export const PduLayoutDesigner: React.FC = () => {
  const { pduLayout, setPduLayout, selections } = useConfigStore();
  
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = pduLayout.findIndex((i) => i.id === active.id);
      const newIndex = pduLayout.findIndex((i) => i.id === over.id);
      const newLayout = arrayMove(pduLayout, oldIndex, newIndex).map((item, index) => ({
        ...item,
        position: index
      }));
      setPduLayout(newLayout);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 mb-10">
        <h2 className="text-2xl font-black text-[var(--text-app)] uppercase tracking-tight">
          PDU Technical <span className="text-[var(--accent-brand)]">Schema</span>
        </h2>
        <div className="flex items-center gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider leading-relaxed">
            Drag modules to arrange them on the rail. The top is the power input side. <br/>
            Order from top to bottom represents the physical layout of your PDU.
          </p>
        </div>
      </div>

      <div className="relative max-w-[400px] mx-auto p-12 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-inner">
        {/* PDU RAIL CONTAINER */}
        <div className="relative mx-auto w-[180px] min-h-[600px] bg-[#e2e8f0] dark:bg-[#1e293b] rounded-xl border-4 border-[#94a3b8] dark:border-[#334155] shadow-2xl p-0 overflow-visible">
          
          {/* Rail Header / Top Caps */}
          <div className="absolute -top-6 inset-x-0 h-6 bg-[#64748b] rounded-t-lg flex items-center justify-center">
            <div className="w-8 h-1 bg-white/20 rounded-full" />
          </div>
          
          {/* Inlet Marker */}
          <div className="p-4 border-b-2 border-slate-400/30 flex flex-col items-center gap-1 bg-slate-400/10">
            <Zap className="w-5 h-5 text-amber-500" />
            <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Power Inlet</span>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="flex flex-col">
              <SortableContext
                items={pduLayout.map(i => i.id)}
                strategy={verticalListSortingStrategy}
              >
                {pduLayout.map((item) => (
                  <SortableItem key={item.id} item={item} />
                ))}
              </SortableContext>

              {pduLayout.length === 0 && (
                <div className="p-20 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-loose">
                    Empty Rail<br/>(Check Selections)
                  </p>
                </div>
              )}
            </div>
          </DndContext>

          {/* Rail Footer / End Cap */}
          <div className="p-4 border-t-2 border-slate-400/30 flex items-center justify-center bg-slate-400/10 h-10">
            <div className="w-2 h-2 rounded-full bg-slate-400/50" />
          </div>
          <div className="absolute -bottom-6 inset-x-0 h-6 bg-[#64748b] rounded-b-lg" />
          
          {/* Dimensions Labels Style */}
          <div className="absolute -right-20 inset-y-0 flex flex-col justify-between py-20 pointer-events-none opacity-40">
            <div className="h-px w-8 bg-slate-500 relative">
               <span className="absolute left-10 -top-2 text-[9px] font-bold text-slate-500">OP-A</span>
            </div>
            <div className="h-full w-px bg-slate-500 mx-4" />
            <div className="h-px w-8 bg-slate-500 relative">
               <span className="absolute left-10 -top-2 text-[9px] font-bold text-slate-500">BT-0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
