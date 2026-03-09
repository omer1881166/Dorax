import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            customerEmail,
            customerName,
            categoryId,
            countryId,
            selections,
            quantities,
            totalPrice,
            basePrice,
            regionalAdjustment
        } = body;

        if (!customerEmail || !categoryId || !totalPrice) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Save order to Supabase
        const { data, error } = await supabase
            .from('orders')
            .insert([{
                customer_email: customerEmail,
                customer_name: customerName,
                category_id: categoryId,
                country_id: countryId,
                selections: selections,
                quantities: quantities,
                total_price: totalPrice,
                base_price: basePrice,
                regional_adjustment: regionalAdjustment,
                status: 'pending'
            }])
            .select()
            .single();

        if (error) {
            console.error('Order Submission Error:', error);
            return NextResponse.json({ error: 'Failed to submit inquiry' }, { status: 500 });
        }

        return NextResponse.json({ success: true, orderId: data.id });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
