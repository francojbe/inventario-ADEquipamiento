import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function getBaseUrl(request: NextRequest): string {
    const forwardedHost = request.headers.get('x-forwarded-host')
    const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
    if (forwardedHost) {
        return `${forwardedProto}://${forwardedHost}`
    }
    const { protocol, host } = request.nextUrl
    return `${protocol}//${host}`
}

export async function middleware(request: NextRequest) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-url', request.url)
    requestHeaders.set('x-pathname', request.nextUrl.pathname)

    let supabaseResponse = NextResponse.next({
        request: {
            headers: requestHeaders,
        }
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl
    const isLoginPage = pathname === '/login'
    const isPublic =
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname === '/favicon.ico' ||
        pathname === '/logo.webp'

    if (isPublic) return supabaseResponse

    if (!user && !isLoginPage) {
        const baseUrl = getBaseUrl(request)
        return NextResponse.redirect(`${baseUrl}/login`)
    }

    if (user && isLoginPage) {
        const baseUrl = getBaseUrl(request)
        return NextResponse.redirect(`${baseUrl}/`)
    }

    return supabaseResponse
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
