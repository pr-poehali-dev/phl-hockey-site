import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Match {
  id: number;
  home_team_name: string;
  away_team_name: string;
  home_score: number;
  away_score: number;
  match_date: string;
  status: string;
  result_type: string | null;
  home_logo: string | null;
  away_logo: string | null;
}

interface ScheduleTabProps {
  matches: Match[];
  teams: any[];
  onUpdate: () => void;
}

const getStatusBadge = (status: string, resultType: string | null) => {
  if (status === 'live') {
    return <Badge className="bg-green-600 hover:bg-green-700">Идёт матч</Badge>;
  }
  if (status === 'finished') {
    if (resultType === 'regulation') {
      return <Badge className="bg-blue-600 hover:bg-blue-700">ОВ</Badge>;
    }
    if (resultType === 'overtime') {
      return <Badge className="bg-purple-600 hover:bg-purple-700">ОТ</Badge>;
    }
    if (resultType === 'shootout') {
      return <Badge className="bg-orange-600 hover:bg-orange-700">Б</Badge>;
    }
  }
  return <Badge variant="outline">Запланирован</Badge>;
};

export default function ScheduleTab({ matches, teams, onUpdate }: ScheduleTabProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Дата не указана';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const sortedMatches = [...matches].sort((a, b) => {
    const dateA = new Date(a.match_date || 0).getTime();
    const dateB = new Date(b.match_date || 0).getTime();
    return dateB - dateA;
  });

  return (
    <div className="space-y-4">
      {sortedMatches.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center">
            <Icon name="Calendar" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Матчи пока не запланированы</p>
          </CardContent>
        </Card>
      ) : (
        sortedMatches.map((match) => (
          <Card 
            key={match.id} 
            className="bg-card border-border hover:border-primary/50 transition-all hover:shadow-lg"
          >
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      {match.home_logo ? (
                        <img src={match.home_logo} alt={match.home_team_name} className="w-10 h-10 object-contain" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Icon name="Shield" size={20} className="text-primary" />
                        </div>
                      )}
                      <span className="font-bold text-lg">{match.home_team_name}</span>
                    </div>
                    
                    <div className="text-center px-4">
                      {match.status === 'finished' || match.status === 'live' ? (
                        <div className="text-2xl font-bold">
                          {match.home_score} : {match.away_score}
                        </div>
                      ) : (
                        <div className="text-2xl font-bold text-muted-foreground">—</div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 flex-1 justify-end">
                      <span className="font-bold text-lg">{match.away_team_name}</span>
                      {match.away_logo ? (
                        <img src={match.away_logo} alt={match.away_team_name} className="w-10 h-10 object-contain" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Icon name="Shield" size={20} className="text-primary" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Icon name="Calendar" size={14} />
                      <span>{formatDate(match.match_date)}</span>
                    </div>
                    {getStatusBadge(match.status, match.result_type)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}