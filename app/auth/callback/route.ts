import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const next = searchParams.get('next') ?? '/home'

  console.log('🔄 Auth callback received:', {
    code: code ? 'Present' : 'Missing',
    error,
    errorDescription,
    origin,
    next,
    fullUrl: request.url
  })

  // Handle OAuth errors from provider
  if (error) {
    console.error('❌ OAuth provider error:', { error, errorDescription })
    const errorUrl = new URL('/auth/auth-code-error', origin)
    errorUrl.searchParams.set('error', error)
    if (errorDescription) {
      errorUrl.searchParams.set('error_description', errorDescription)
    }
    return NextResponse.redirect(errorUrl.toString())
  }

  if (code) {
    try {
      const cookieStore = cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
            },
            set(name: string, value: string, options: any) {
              cookieStore.set({ name, value, ...options })
            },
            remove(name: string, options: any) {
              cookieStore.set({ name, value: '', ...options })
            },
          },
        }
      )

      console.log('🔑 Exchanging code for session...')
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('❌ Session exchange error:', {
          message: exchangeError.message,
          status: exchangeError.status,
          details: exchangeError
        })
        
        const errorUrl = new URL('/auth/auth-code-error', origin)
        errorUrl.searchParams.set('error', 'session_exchange_failed')
        errorUrl.searchParams.set('error_description', exchangeError.message)
        return NextResponse.redirect(errorUrl.toString())
      }
      
      console.log('✅ Session exchange successful:', {
        user: data.user?.email,
        sessionExists: !!data.session
      })
      
      return NextResponse.redirect(`${origin}${next}`)
      
    } catch (exception: any) {
      console.error('💥 Auth callback exception:', {
        name: exception?.name,
        message: exception?.message,
        stack: exception?.stack
      })
      
      const errorUrl = new URL('/auth/auth-code-error', origin)
      errorUrl.searchParams.set('error', 'callback_exception')
      errorUrl.searchParams.set('error_description', exception?.message || 'Unknown error')
      return NextResponse.redirect(errorUrl.toString())
    }
  }

  // No code parameter - invalid callback
  console.error('❌ No authorization code received')
  const errorUrl = new URL('/auth/auth-code-error', origin)
  errorUrl.searchParams.set('error', 'no_code')
  errorUrl.searchParams.set('error_description', 'No authorization code received from OAuth provider')
  return NextResponse.redirect(errorUrl.toString())
}