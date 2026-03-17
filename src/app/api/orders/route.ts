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
            layout,
            totalPrice,
            basePrice,
            regionalAdjustment
        } = body;

        console.log('Order Submission Payload:', body);

        if (!customerEmail || !categoryId || totalPrice === undefined) {
            console.error('Validation Failed: Missing required fields', { customerEmail, categoryId, totalPrice });
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Generate unique order ID on server (prevents RLS rollback on .select())
        const orderId = crypto.randomUUID();

        // 2. Save order to Supabase
        const { error } = await supabase
            .from('orders')
            .insert([{
                id: orderId, // Manually set ID
                customer_email: customerEmail,
                customer_name: customerName,
                category_id: categoryId,
                country_id: countryId,
                selections: selections,
                quantities: quantities,
                layout: layout,
                total_price: totalPrice,
                base_price: basePrice,
                regional_adjustment: regionalAdjustment,
                status: 'pending'
            }]);

        if (error) {
            console.error('Supabase Insertion Error DETAILED:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            return NextResponse.json({ error: `Database Error: ${error.message}` }, { status: 500 });
        }

        console.log('Order Successfully Created:', orderId);

        return NextResponse.json({ success: true, orderId });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
