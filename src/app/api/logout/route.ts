import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function getBaseUrl(request: NextRequest): string {
    // In production behind a reverse proxy (EasyPanel/nginx), use forwarded headers
    const forwardedHost = request.headers.get('x-forwarded-host')
    const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
    if (forwardedHost) {
        return `${forwardedProto}://${forwardedHost}`
    }
    // Fallback to request origin (works locally)
    const { protocol, host } = request.nextUrl
    return `${protocol}//${host}`
}

export async function GET(request: NextRequest) {
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll() },
                setAll() { },
            },
        }
    )

    await supabase.auth.signOut()

    const baseUrl = getBaseUrl(request)
    const response = NextResponse.redirect(`${baseUrl}/login`)

    // Clear all Supabase session cookies
    request.cookies.getAll().forEach(cookie => {
        if (cookie.name.startsWith('sb-')) {
            response.cookies.delete(cookie.name)
        }
    })

    return response
}
