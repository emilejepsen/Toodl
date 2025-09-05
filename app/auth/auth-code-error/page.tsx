import { Card, Button, Heading, Text } from '../../../components/ui'
import Link from 'next/link'

interface AuthCodeErrorPageProps {
  searchParams: { error?: string; error_description?: string }
}

export default function AuthCodeErrorPage({ searchParams }: AuthCodeErrorPageProps) {
  const { error, error_description } = searchParams;
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-6">
      <Card padding="lg" className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <Heading level={1} className="text-red-600 mb-2">
            Noget gik galt
          </Heading>
          <Text color="secondary" className="mb-4">
            Der opstod en fejl under login processen.
          </Text>
          
          {/* Detailed error information */}
          {(error || error_description) && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
              <Text size="sm" weight="medium" className="text-gray-700 mb-2">
                Tekniske detaljer:
              </Text>
              {error && (
                <Text size="xs" className="text-gray-600 mb-1">
                  <strong>Fejl:</strong> {error}
                </Text>
              )}
              {error_description && (
                <Text size="xs" className="text-gray-600">
                  <strong>Beskrivelse:</strong> {error_description}
                </Text>
              )}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Link href="/login" className="block">
            <Button className="w-full">
              Prøv igen
            </Button>
          </Link>
          
          <Link href="/" className="block">
            <Button variant="outline" className="w-full">
              Tilbage til forsiden
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}