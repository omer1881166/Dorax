"use client";

import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import configData from '@/data/config.json';

export interface Option {
    id: string;
    label: string;
    addedCost: number;
    value?: any;
    isInStock?: boolean;
    metadata?: any;
}

export interface Attribute {
    id: string;
    name: string;
    type: string;
    options: Option[];
}

export interface LogicRule {
    id: string;
    trigger: {
        attributeId: string;
        value: string;
    };
    action: 'restrict' | 'hide';
    targetAttributeId: string;
    allowedValues?: string[];
    message?: string;
}

export interface Country {
    id: string;
    name: string;
    code: string;
    taxMultiplier: number;
    fixedFee: number;
    isDefault: boolean;
}

export interface Category {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    attributes: Attribute[];
    logic: LogicRule[];
}

export interface SlotItem {
    id: string;
    optionId: string;
    label: string;
    type: 'socket' | 'protection' | 'calculation';
    position: number;
}

interface ConfigState {
    categories: Category[];
    selectedCategoryId: string | null;
    selections: Record<string, string>;
    quantities: Record<string, number>;
    theme: 'light' | 'dark';
    countries: Country[];
    selectedCountry: Country | null;
    isLoading: boolean;
    error: string | null;
    pduLayout: SlotItem[];

    // Actions
    setCategory: (categoryId: string) => void;
    setSelection: (attributeId: string, optionId: string) => void;
    setQuantity: (optionId: string, quantity: number) => void;
    resetSelections: () => void;
    toggleTheme: () => void;
    setCountry: (countryId: string) => void;
    fetchData: () => Promise<void>;
    setPduLayout: (layout: SlotItem[]) => void;
    initPduLayout: () => void;

    // Derived helpers
    getSelectedCategory: () => Category | null;
    calculateTotalPrice: () => number;
    getFilteredOptions: (attributeId: string) => Option[];
    getActiveMessages: () => string[];
    openCountrySelector: () => void;
}

export const useConfigStore = create<ConfigState>((set, get) => ({
    categories: [],
    selectedCategoryId: null,
    selections: {},
    quantities: {},
    theme: 'light',
    countries: [],
    selectedCountry: null,
    isLoading: false,
    error: null,
    pduLayout: [],

    fetchData: async () => {
        set({ isLoading: true, error: null });
        try {
            // Check if Supabase is initialized
            if (!supabase) {
                console.warn('Supabase not initialized, using local fallback.');
                set({
                    categories: configData.categories as Category[],
                    selectedCategoryId: '00000000-0000-0000-0000-000000000001',
                    countries: [
                        { id: 'tr', name: 'Turkey', code: 'TR', taxMultiplier: 1.20, fixedFee: 0, isDefault: true }
                    ],
                    selectedCountry: { id: 'tr', name: 'Turkey', code: 'TR', taxMultiplier: 1.20, fixedFee: 0, isDefault: true },
                    isLoading: false
                });
                return;
            }

            // Fetch Countries first
            const { data: countriesData } = await supabase.from('countries').select('*');
            const mappedCountries: Country[] = (countriesData || []).map((c: any) => ({
                id: c.id,
                name: c.name,
                code: c.code,
                taxMultiplier: Number(c.tax_multiplier),
                fixedFee: Number(c.fixed_fee),
                isDefault: c.is_default
            }));

            const defaultCountry = mappedCountries.find(c => c.isDefault) || mappedCountries[0] || null;

            // Attempt Supabase fetch
            const { data: categories, error } = await supabase
                .from('categories')
                .select(`
                    id, name, description, base_price,
                    attributes (
                        id, name, type, order_index,
                        options (id, label, added_cost, metadata, is_in_stock)
                    ),
                    logic_rules (*)
                `)
                .order('order_index', { foreignTable: 'attributes' });

            if (error || !categories || categories.length === 0) {
                console.warn('Supabase fetch failed or empty, falling back to local config:', error);
                set({
                    categories: configData.categories as Category[],
                    selectedCategoryId: '00000000-0000-0000-0000-000000000001',
                    isLoading: false
                });
                return;
            }

            // Map Supabase DB schema to Store Interface
            const mappedCategories: Category[] = categories.map((cat: any) => ({
                id: cat.id,
                name: cat.name,
                description: cat.description,
                basePrice: cat.base_price,
                attributes: cat.attributes.map((attr: any) => ({
                    id: attr.id,
                    name: attr.name,
                    type: attr.type,
                    options: attr.options.map((opt: any) => ({
                        id: opt.id,
                        label: opt.label,
                        addedCost: opt.added_cost,
                        value: opt.metadata?.value,
                        isInStock: opt.is_in_stock ?? true,
                        metadata: opt.metadata
                    }))
                })),
                logic: cat.logic_rules.map((rule: any) => ({
                    id: rule.id,
                    trigger: {
                        attributeId: rule.trigger_attribute_id,
                        value: rule.trigger_value
                    },
                    action: rule.action,
                    targetAttributeId: rule.target_attribute_id,
                    allowedValues: rule.allowed_values,
                    message: rule.message
                }))
            }));

            set({
                categories: mappedCategories,
                selectedCategoryId: mappedCategories[0]?.id || null,
                countries: mappedCountries,
                selectedCountry: null,
                isLoading: false
            });
        } catch (err: any) {
            console.error('Migration Fetch Error:', err);
            set({
                categories: configData.categories as Category[],
                selectedCategoryId: '00000000-0000-0000-0000-000000000001',
                isLoading: false
            });
        }
    },

    setCategory: (categoryId) => {
        set({ selectedCategoryId: categoryId, selections: {}, quantities: {} });
    },

    toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

    setCountry: (countryId) => {
        const country = get().countries.find(c => c.id === countryId) || null;
        set({ selectedCountry: country });
    },

    openCountrySelector: () => {
        set({ selectedCountry: null });
    },

    setSelection: (attributeId, optionId) => {
        set((state) => ({
            selections: { ...state.selections, [attributeId]: optionId }
        }));

        // After selection, check if other selections are still valid
        const state = get();
        const category = state.getSelectedCategory();
        if (!category) return;

        const newSelections = { ...get().selections };
        let changed = false;

        category.attributes.forEach(attr => {
            const filtered = state.getFilteredOptions(attr.id);
            const currentSelection = newSelections[attr.id];
            if (currentSelection && !filtered.find(o => o.id === currentSelection)) {
                delete newSelections[attr.id];
                changed = true;
            }
        });

        if (changed) {
            set({ selections: newSelections });
        }
    },

    resetSelections: () => set({ selections: {}, quantities: {}, pduLayout: [] }),

    setQuantity: (optionId, quantity) => {
        set((state) => ({
            quantities: { ...state.quantities, [optionId]: Math.max(0, quantity) }
        }));
    },

    setPduLayout: (layout) => set({ pduLayout: layout }),

    initPduLayout: () => {
        const state = get();
        const category = state.getSelectedCategory();
        if (!category) return;

        const SOCKET_ATTR = '00000000-0000-0000-0000-000000000103';
        const PROT_ATTR = '00000000-0000-0000-0000-000000000106';
        const CALC_ATTR = '00000000-0000-0000-0000-000000000107';

        const slots: SlotItem[] = [];
        let pos = 0;

        const addSlots = (attrId: string, slotType: 'socket' | 'protection' | 'calculation') => {
            const attr = category.attributes.find(a => a.id === attrId);
            if (!attr) return;
            attr.options.forEach(opt => {
                const count = state.quantities[opt.id] || 0;
                for (let i = 0; i < count; i++) {
                    slots.push({
                        id: `${opt.id}_${i}`,
                        optionId: opt.id,
                        label: opt.label,
                        type: slotType,
                        position: pos++
                    });
                }
            });
        };

        addSlots(SOCKET_ATTR, 'socket');
        addSlots(PROT_ATTR, 'protection');
        addSlots(CALC_ATTR, 'calculation');

        set({ pduLayout: slots });
    },

    getSelectedCategory: () => {
        const { categories, selectedCategoryId } = get();
        return categories.find((c) => c.id === selectedCategoryId) || null;
    },

    calculateTotalPrice: () => {
        const category = get().getSelectedCategory();
        if (!category) return 0;

        let total = category.basePrice;
        const { selections } = get();

        Object.entries(selections).forEach(([attrId, optionId]) => {
            const attr = category.attributes.find((a) => a.id === attrId);
            const option = attr?.options.find((o) => o.id === optionId);
            if (option) {
                total += option.addedCost;
            }
        });

        // Add Multi-Quantity Sockets (Phase 10)
        Object.entries(get().quantities).forEach(([optionId, count]) => {
            if (count <= 0) return;
            // Find option in category to get its addedCost
            category.attributes.forEach(attr => {
                const opt = attr.options.find(o => o.id === optionId);
                if (opt) {
                    total += opt.addedCost * count;
                }
            });
        });

        const country = get().selectedCountry;
        const multiplier = country?.taxMultiplier ?? 1;
        const fee = country?.fixedFee ?? 0;

        return (total * multiplier) + fee;
    },

    getFilteredOptions: (attributeId) => {
        const category = get().getSelectedCategory();
        if (!category) return [];

        const attr = category.attributes.find((a) => a.id === attributeId);
        if (!attr) return [];

        const { selections } = get();

        // Handle 'hide' logic first
        const isHidden = category.logic.some((rule) => {
            if (rule.action !== 'hide') return false;

            const targetMatches = rule.targetAttributeId === '*' || rule.targetAttributeId === attributeId;
            if (!targetMatches) return false;

            // If it's a wildcard hide, allow specific attributes to stay visible
            if (rule.targetAttributeId === '*' && rule.allowedValues?.includes(attributeId)) {
                return false;
            }

            const triggerValue = selections[rule.trigger.attributeId] || '';
            const triggerMatches = triggerValue === rule.trigger.value;

            return triggerMatches;
        });

        if (isHidden) return [];

        let options = [...attr.options];

        category.logic.forEach((rule) => {
            if (
                rule.action === 'restrict' &&
                rule.targetAttributeId === attributeId &&
                selections[rule.trigger.attributeId] === rule.trigger.value
            ) {
                options = options.filter((opt) => rule.allowedValues?.includes(opt.id));
            }
        });

        return options;
    },

    getActiveMessages: () => {
        const category = get().getSelectedCategory();
        if (!category) return [];

        const { selections } = get();
        const messages: string[] = [];

        category.logic.forEach((rule) => {
            if (
                rule.message &&
                selections[rule.trigger.attributeId] === rule.trigger.value
            ) {
                const targetAttr = category.attributes.find(a => a.id === rule.targetAttributeId);
                if (targetAttr) {
                    messages.push(rule.message);
                }
            }
        });

        return messages;
    }
}));
