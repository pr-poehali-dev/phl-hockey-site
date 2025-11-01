import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Champion {
  id: number;
  season: string;
  team_name: string;
  description: string | null;
  year: number;
}

interface ChampionsTabProps {
  champions: Champion[];
}

export default function ChampionsTab({ champions }: ChampionsTabProps) {
  const sortedChampions = [...champions].sort((a, b) => (b.year || 0) - (a.year || 0));

  return (
    <div className="space-y-4">
      {sortedChampions.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center">
            <Icon name="Trophy" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">История чемпионов появится после первого сезона</p>
          </CardContent>
        </Card>
      ) : (
        sortedChampions.map((champion, index) => (
          <Card 
            key={champion.id}
            className="bg-card border-border hover:border-primary/50 transition-all hover:shadow-lg group"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon name="Trophy" size={24} className="text-yellow-900" />
                </div>
                <div>
                  <div className="text-xl font-bold">{champion.team_name}</div>
                  <div className="text-sm text-muted-foreground font-normal">{champion.season}</div>
                </div>
              </CardTitle>
            </CardHeader>
            {champion.description && (
              <CardContent>
                <p className="text-muted-foreground">{champion.description}</p>
              </CardContent>
            )}
          </Card>
        ))
      )}
    </div>
  );
}