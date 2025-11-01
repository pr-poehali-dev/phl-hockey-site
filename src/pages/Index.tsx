import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import InfoTab from '@/components/InfoTab';
import StandingsTab from '@/components/StandingsTab';
import ScheduleTab from '@/components/ScheduleTab';
import ChampionsTab from '@/components/ChampionsTab';
import RegulationsTab from '@/components/RegulationsTab';
import AdminPanel from '@/components/AdminPanel';
import { toast } from 'sonner';

const LEAGUE_DATA_URL = 'https://functions.poehali.dev/c3d5eee7-765d-424f-99f6-4eaebd274117';

export default function Index() {
  const [activeTab, setActiveTab] = useState('info');
  const [showAdmin, setShowAdmin] = useState(false);
  const [leagueData, setLeagueData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch(`${LEAGUE_DATA_URL}?type=all`);
      const data = await response.json();
      setLeagueData(data);
    } catch (error) {
      toast.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {leagueData?.info?.logo_url ? (
                <img 
                  src={leagueData.info.logo_url} 
                  alt="Логотип лиги" 
                  className="w-12 h-12 object-contain transform hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-red-800 rounded-lg flex items-center justify-center transform hover:scale-105 transition-transform">
                  <span className="text-2xl">🏒</span>
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-red-600 bg-clip-text text-transparent">
                  {leagueData?.info?.title || 'PHL'}
                </h1>
                <p className="text-sm text-muted-foreground">Первая хоккейная лига</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdmin(!showAdmin)}
              className="hover:bg-primary/10 transition-colors"
            >
              <Icon name="Settings" size={16} />
              <span className="ml-2">Админ</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {showAdmin && (
          <div className="mb-8 animate-fade-in">
            <AdminPanel onUpdate={fetchData} />
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-card border border-border">
            <TabsTrigger value="info" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Info" size={16} className="mr-2" />
              Информация
            </TabsTrigger>
            <TabsTrigger value="standings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Table" size={16} className="mr-2" />
              Таблица
            </TabsTrigger>
            <TabsTrigger value="schedule" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Calendar" size={16} className="mr-2" />
              Расписание
            </TabsTrigger>
            <TabsTrigger value="champions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Trophy" size={16} className="mr-2" />
              Чемпионы
            </TabsTrigger>
            <TabsTrigger value="regulations" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="FileText" size={16} className="mr-2" />
              Регламент
            </TabsTrigger>
          </TabsList>

          <div className="animate-fade-in">
            <TabsContent value="info">
              <InfoTab data={leagueData?.info} />
            </TabsContent>

            <TabsContent value="standings">
              <StandingsTab teams={leagueData?.teams || []} />
            </TabsContent>

            <TabsContent value="schedule">
              <ScheduleTab matches={leagueData?.matches || []} teams={leagueData?.teams || []} onUpdate={fetchData} />
            </TabsContent>

            <TabsContent value="champions">
              <ChampionsTab champions={leagueData?.champions || []} />
            </TabsContent>

            <TabsContent value="regulations">
              <RegulationsTab regulations={leagueData?.regulations || []} />
            </TabsContent>
          </div>
        </Tabs>
      </main>

      <footer className="mt-16 border-t border-border bg-card/50 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 PHL - Первая хоккейная лига. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}