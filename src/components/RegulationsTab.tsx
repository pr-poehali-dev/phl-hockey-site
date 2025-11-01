import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Regulation {
  id: number;
  title: string;
  content: string;
  position: number;
}

interface RegulationsTabProps {
  regulations: Regulation[];
}

export default function RegulationsTab({ regulations }: RegulationsTabProps) {
  const sortedRegulations = [...regulations].sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-4">
      {sortedRegulations.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center">
            <Icon name="FileText" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Регламент пока не добавлен</p>
          </CardContent>
        </Card>
      ) : (
        sortedRegulations.map((regulation) => (
          <Card 
            key={regulation.id}
            className="bg-card border-border hover:border-primary/50 transition-all"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="FileText" size={20} className="text-primary" />
                {regulation.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{regulation.content}</p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}