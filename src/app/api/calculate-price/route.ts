import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// This will eventually fetch prices and logic from Supabase
// For now, it's a shell for the professional backend calculation
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { categoryId, selections, quantities = {}, countryId } = body;

        if (!categoryId) {
            return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
        }

        // 1. Fetch category from Supabase
        const { data: category, error: catError } = await supabase
            .from('categories')
            .select('*')
            .eq('id', categoryId)
            .single();

        if (catError || !category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        let total = Number(category.base_price);

        // Internal PDU keys that are NOT in the database attributes
        const pduInternalKeys = [
            '00000000-0000-0000-0000-000000000101', // Orientation
            '00000000-0000-0000-0000-000000000102', // Color
            '00000000-0000-0000-0000-000000000106', // Protection
            'pdu_cable_length',
            '_pdu_sockets_confirmed',
            '00000000-0000-0000-0000-000000000104', // Energy
            '00000000-0000-0000-0000-000000000105', // Cable Type
            'pdu_case_type',
            'pdu_case_color',
            'pdu_case_length',
            'pdu_cable_cross_section',
            '_pdu_cable_props_confirmed',
            '_pdu_protection_confirmed',
            '_pdu_calculation_confirmed'
        ];

        // 2. Resolve all selected Option IDs (Single + Multi)
        const selectedOptionIds = [
            ...Object.values(selections as Record<string, string>),
            ...Object.keys(quantities as Record<string, number>)
        ].filter(id => id && id.length > 10); // Simple check to avoid internal strings

        // 3. Batch fetch all prices and labels
        const { data: dbOptions } = await supabase
            .from('options')
            .select('id, added_cost, label, attribute_id')
            .in('id', selectedOptionIds);

        const priceMap: Record<string, number> = {};
        const attrMap: Record<string, string> = {};
        dbOptions?.forEach((opt: any) => {
            priceMap[opt.id] = Number(opt.added_cost || 0);
            attrMap[opt.id] = opt.attribute_id;
        });

        // 4. Calculate Single-Select Costs
        for (const [attrId, optionId] of Object.entries(selections as Record<string, string>)) {
            if (priceMap[optionId] !== undefined) {
                total += priceMap[optionId];
            }
        }

        // 5. Calculate Multi-Quantity Costs & Validate Limits (PDU)
        let totalSocketsForLimit = 0;
        let totalProtectionCount = 0;
        let totalCalculationCount = 0;
        const PDU_CAT_ID = '00000000-0000-0000-0000-000000000001';

        for (const [optionId, count] of Object.entries(quantities as Record<string, number>)) {
            if (count <= 0) continue;

            const price = priceMap[optionId] || 0;
            total += price * count;

            // PDU Specific Logic
            if (categoryId === PDU_CAT_ID) {
                const attrId = attrMap[optionId];
                if (attrId === '00000000-0000-0000-0000-000000000106') { // Protection
                    totalProtectionCount += count;
                } else if (attrId === '00000000-0000-0000-0000-000000000107') { // Calculation
                    totalCalculationCount += count;
                } else if (attrId === '00000000-0000-0000-0000-000000000103') { // Sockets
                    totalSocketsForLimit += count;
                }
            }
        }

        // 6. PDU Validation
        if (categoryId === PDU_CAT_ID) {
            // Check 3-Phase Protection Rule
            const is3Phase = selections['00000000-0000-0000-0000-000000000104'] === '925f13b3-0128-4907-a55a-f0e80ad4977d';

            // Limit 1-Phase to 2 modules, and 3-Phase to a higher industrial limit (9)
            const maxProt = is3Phase ? 9 : 2;

            if (is3Phase && totalProtectionCount > 0 && totalProtectionCount < 3) {
                return NextResponse.json({ error: `3-Phase requires 0 or at least 3 protection modules (Current: ${totalProtectionCount})` }, { status: 400 });
            }

            if (totalProtectionCount > maxProt) {
                return NextResponse.json({ error: `Protection limit exceeded (Max ${maxProt} for ${is3Phase ? '3-Phase' : '1-Phase'}, got ${totalProtectionCount})` }, { status: 400 });
            }
            if (totalCalculationCount > 3) {
                return NextResponse.json({ error: `Calculation limit exceeded (Max 3, got ${totalCalculationCount})` }, { status: 400 });
            }
        }

        // 7. Apply Regional Multipliers
        let multiplier = 1;
        let fee = 0;

        if (countryId) {
            const { data: country } = await supabase
                .from('countries')
                .select('tax_multiplier, fixed_fee')
                .eq('id', countryId)
                .single();

            if (country) {
                multiplier = Number(country.tax_multiplier);
                fee = Number(country.fixed_fee);
            }
        }

        const finalPrice = (total * multiplier) + fee;

        return NextResponse.json({
            total: Math.round(finalPrice),
            basePrice: total,
            regionalAdjustment: (total * multiplier) - total + fee
        });

    } catch (error) {
        console.error('Pricing API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
