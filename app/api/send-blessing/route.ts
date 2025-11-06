/* app/api/send-blessing/route.ts
   Send blessing via Shopify customer form
*/
export const runtime = 'edge';

const SHOPIFY_STORE_URL = process.env.SHOPIFY_STORE_URL || 'https://luckyspell.myshopify.com';

interface BlessingPayload {
  email: string;
  blessing: string;
  sidthieKey: string;
  sidthieLabel: string;
  explanation?: string;
  userName?: string;
}

export async function POST(req: Request) {
  try {
    const payload: BlessingPayload = await req.json();
    
    if (!payload.email || !payload.blessing) {
      return new Response(
        JSON.stringify({ error: 'Email and blessing required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Prepare Shopify contact form submission
    const formData = new URLSearchParams();
    formData.append('form_type', 'customer');
    formData.append('utf8', '✓');
    formData.append('contact[email]', payload.email);
    formData.append('contact[accepts_marketing]', 'true');
    
    // Add tags
    const tags = ['Bless Chat'];
    if (payload.sidthieLabel) {
      tags.push(`Sidthie: ${payload.sidthieLabel}`);
    }
    formData.append('contact[tags]', tags.join(', '));
    
    // Build message body
    const messageParts: string[] = [];
    if (payload.userName) {
      messageParts.push(`Name: ${payload.userName}`);
    }
    if (payload.sidthieLabel) {
      messageParts.push(`Sidthie: ${payload.sidthieLabel} (${payload.sidthieKey})`);
    }
    if (payload.explanation) {
      messageParts.push(`\nExplanation:\n${payload.explanation}`);
    }
    messageParts.push(`\nYour Blessing:\n${payload.blessing}`);
    
    formData.append('contact[body]', messageParts.join('\n\n'));
    
    // Submit to Shopify
    const shopifyResponse = await fetch(`${SHOPIFY_STORE_URL}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });
    
    if (!shopifyResponse.ok) {
      throw new Error(`Shopify responded with ${shopifyResponse.status}`);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Blessing sent to your email'
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error: any) {
    console.error('Send blessing error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send blessing',
        details: error?.message 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
