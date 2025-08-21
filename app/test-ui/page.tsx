import { Header, Card, Button, Text } from '../../components/ui';

export default function TestUIPage() {
  return (
    <div className="min-h-screen bg-amber-50 p-6">
      <Header subtitle="Test af UI komponenter" />
      <div className="max-w-md mx-auto">
        <Card>
          <Text>Dette er en test af UI komponenterne</Text>
          <Button>Test knap</Button>
        </Card>
      </div>
    </div>
  );
}
