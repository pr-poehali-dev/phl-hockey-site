import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';

interface Team {
  id: number;
  name: string;
  logo_url: string | null;
  played: number;
  wins: number;
  wins_ot: number;
  losses_ot: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  points: number;
}

interface StandingsTabProps {
  teams: Team[];
}

export default function StandingsTab({ teams }: StandingsTabProps) {
  const sortedTeams = [...teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return (b.goals_for - b.goals_against) - (a.goals_for - a.goals_against);
  });

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Table" size={24} className="text-primary" />
          Турнирная таблица
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead>Команда</TableHead>
                <TableHead className="text-center">И</TableHead>
                <TableHead className="text-center">В</TableHead>
                <TableHead className="text-center">ВО</TableHead>
                <TableHead className="text-center">ПО</TableHead>
                <TableHead className="text-center">П</TableHead>
                <TableHead className="text-center">Ш</TableHead>
                <TableHead className="text-center">О</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTeams.map((team, index) => (
                <TableRow 
                  key={team.id} 
                  className="hover:bg-primary/5 transition-colors border-border"
                >
                  <TableCell className="text-center font-bold">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {team.logo_url ? (
                        <img src={team.logo_url} alt={team.name} className="w-8 h-8 object-contain" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <Icon name="Shield" size={16} className="text-primary" />
                        </div>
                      )}
                      <span className="font-semibold">{team.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{team.played}</TableCell>
                  <TableCell className="text-center">{team.wins}</TableCell>
                  <TableCell className="text-center">{team.wins_ot}</TableCell>
                  <TableCell className="text-center">{team.losses_ot}</TableCell>
                  <TableCell className="text-center">{team.losses}</TableCell>
                  <TableCell className="text-center">
                    {team.goals_for}:{team.goals_against}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-bold text-primary">{team.points}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-6 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          <p className="font-semibold mb-2">Обозначения:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div>И — Игры</div>
            <div>В — Победы (ОВ)</div>
            <div>ВО — Победы (ОТ/Б)</div>
            <div>ПО — Поражения (ОТ/Б)</div>
            <div>П — Поражения (ОВ)</div>
            <div>Ш — Разность шайб</div>
            <div className="col-span-2">О — Очки</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}