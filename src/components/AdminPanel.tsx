import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';

const LEAGUE_DATA_URL = 'https://functions.poehali.dev/c3d5eee7-765d-424f-99f6-4eaebd274117';
const MATCHES_URL = 'https://functions.poehali.dev/8875a9d7-b803-4606-90ac-bd7129670852';

interface AdminPanelProps {
  onUpdate: () => void;
}

export default function AdminPanel({ onUpdate }: AdminPanelProps) {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkPassword = () => {
    if (password === 'phldyez') {
      setIsAuthenticated(true);
      toast.success('Вход выполнен');
    } else {
      toast.error('Неверный пароль');
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('https://api.poehali.dev/upload-image', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    return data.url;
  };

  const updateLeagueInfo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch(LEAGUE_DATA_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password
        },
        body: JSON.stringify({
          type: 'info',
          title: formData.get('title'),
          description: formData.get('description'),
          telegram: formData.get('telegram'),
          discord: formData.get('discord'),
          twitch: formData.get('twitch')
        })
      });
      
      if (response.ok) {
        toast.success('Информация обновлена');
        onUpdate();
      } else {
        toast.error('Ошибка обновления');
      }
    } catch (error) {
      toast.error('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      let logoUrl = '';
      const logoFile = (e.currentTarget.elements.namedItem('logo') as HTMLInputElement).files?.[0];
      
      if (logoFile) {
        logoUrl = await uploadImage(logoFile);
      }
      
      const response = await fetch(LEAGUE_DATA_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password
        },
        body: JSON.stringify({
          type: 'team',
          name: formData.get('team_name'),
          division: formData.get('division'),
          logo_url: logoUrl || null
        })
      });
      
      if (response.ok) {
        toast.success('Команда добавлена');
        onUpdate();
        (e.target as HTMLFormElement).reset();
      } else {
        toast.error('Ошибка добавления команды');
      }
    } catch (error) {
      toast.error('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  const updateTeam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      let logoUrl = formData.get('existing_logo') as string;
      const logoFile = (e.currentTarget.elements.namedItem('logo') as HTMLInputElement).files?.[0];
      
      if (logoFile) {
        logoUrl = await uploadImage(logoFile);
      }
      
      const response = await fetch(LEAGUE_DATA_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password
        },
        body: JSON.stringify({
          type: 'team',
          id: parseInt(formData.get('team_id') as string),
          name: formData.get('team_name'),
          division: formData.get('division'),
          logo_url: logoUrl || null
        })
      });
      
      if (response.ok) {
        toast.success('Команда обновлена');
        onUpdate();
      } else {
        toast.error('Ошибка обновления');
      }
    } catch (error) {
      toast.error('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  const createMatch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch(MATCHES_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password
        },
        body: JSON.stringify({
          home_team_id: parseInt(formData.get('home_team_id') as string),
          away_team_id: parseInt(formData.get('away_team_id') as string),
          match_date: formData.get('match_date'),
          status: 'scheduled',
          home_score: 0,
          away_score: 0
        })
      });
      
      if (response.ok) {
        toast.success('Матч создан');
        onUpdate();
        (e.target as HTMLFormElement).reset();
      } else {
        toast.error('Ошибка создания матча');
      }
    } catch (error) {
      toast.error('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  const updateMatch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch(MATCHES_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password
        },
        body: JSON.stringify({
          id: parseInt(formData.get('match_id') as string),
          home_score: parseInt(formData.get('home_score') as string),
          away_score: parseInt(formData.get('away_score') as string),
          status: formData.get('status'),
          result_type: formData.get('result_type'),
          match_date: formData.get('match_date')
        })
      });
      
      if (response.ok) {
        toast.success('Матч обновлён, таблица пересчитана');
        onUpdate();
      } else {
        toast.error('Ошибка обновления');
      }
    } catch (error) {
      toast.error('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  const addRegulation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch(LEAGUE_DATA_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password
        },
        body: JSON.stringify({
          type: 'regulation',
          title: formData.get('title'),
          content: formData.get('content'),
          position: 999
        })
      });
      
      if (response.ok) {
        toast.success('Пункт регламента добавлен');
        onUpdate();
        (e.target as HTMLFormElement).reset();
      } else {
        toast.error('Ошибка добавления');
      }
    } catch (error) {
      toast.error('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  const addChampion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch(LEAGUE_DATA_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password
        },
        body: JSON.stringify({
          type: 'champion',
          season: formData.get('season'),
          team_name: formData.get('team_name'),
          description: formData.get('description'),
          year: parseInt(formData.get('year') as string)
        })
      });
      
      if (response.ok) {
        toast.success('Чемпион добавлен');
        onUpdate();
        (e.target as HTMLFormElement).reset();
      } else {
        toast.error('Ошибка добавления');
      }
    } catch (error) {
      toast.error('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Lock" size={24} className="text-primary" />
            Вход в админ-панель
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 max-w-md">
            <Input
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && checkPassword()}
            />
            <Button onClick={checkPassword} className="bg-primary hover:bg-primary/90">
              Войти
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Settings" size={24} className="text-primary" />
            Админ-панель
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsAuthenticated(false)}>
            Выйти
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-6 text-xs">
            <TabsTrigger value="info">Информация</TabsTrigger>
            <TabsTrigger value="team-create">Добавить команду</TabsTrigger>
            <TabsTrigger value="team-update">Изменить команду</TabsTrigger>
            <TabsTrigger value="match-create">Создать матч</TabsTrigger>
            <TabsTrigger value="match-update">Обновить матч</TabsTrigger>
            <TabsTrigger value="content">Контент</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <form onSubmit={updateLeagueInfo} className="space-y-4">
              <div>
                <Label>Название лиги</Label>
                <Input name="title" defaultValue="PHL - Первая хоккейная лига" required />
              </div>
              <div>
                <Label>Описание</Label>
                <Textarea name="description" rows={3} />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>Telegram</Label>
                  <Input name="telegram" placeholder="https://t.me/..." />
                </div>
                <div>
                  <Label>Discord</Label>
                  <Input name="discord" placeholder="https://discord.gg/..." />
                </div>
                <div>
                  <Label>Twitch</Label>
                  <Input name="twitch" placeholder="https://twitch.tv/..." />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
                {loading ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="team-create">
            <form onSubmit={createTeam} className="space-y-4">
              <div>
                <Label>Название команды</Label>
                <Input name="team_name" required />
              </div>
              <div>
                <Label>Дивизион</Label>
                <Select name="division" defaultValue="Первый">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Первый">Первый дивизион</SelectItem>
                    <SelectItem value="Второй">Второй дивизион</SelectItem>
                    <SelectItem value="Третий">Третий дивизион</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Логотип команды</Label>
                <Input name="logo" type="file" accept="image/*" />
                <p className="text-xs text-muted-foreground mt-1">Загрузите изображение с компьютера</p>
              </div>
              <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
                {loading ? 'Добавление...' : 'Добавить команду'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="team-update">
            <form onSubmit={updateTeam} className="space-y-4">
              <div>
                <Label>ID команды</Label>
                <Input name="team_id" type="number" required />
                <p className="text-xs text-muted-foreground mt-1">Найти ID можно во вкладке Таблица</p>
              </div>
              <div>
                <Label>Новое название</Label>
                <Input name="team_name" required />
              </div>
              <div>
                <Label>Дивизион</Label>
                <Select name="division" defaultValue="Первый">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Первый">Первый дивизион</SelectItem>
                    <SelectItem value="Второй">Второй дивизион</SelectItem>
                    <SelectItem value="Третий">Третий дивизион</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Новый логотип (необязательно)</Label>
                <Input name="logo" type="file" accept="image/*" />
                <Input name="existing_logo" type="hidden" />
              </div>
              <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
                {loading ? 'Обновление...' : 'Обновить команду'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="match-create">
            <form onSubmit={createMatch} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>ID команды хозяев</Label>
                  <Input name="home_team_id" type="number" required />
                </div>
                <div>
                  <Label>ID команды гостей</Label>
                  <Input name="away_team_id" type="number" required />
                </div>
              </div>
              <div>
                <Label>Дата и время матча</Label>
                <Input name="match_date" type="datetime-local" required />
              </div>
              <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
                {loading ? 'Создание...' : 'Создать матч'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="match-update">
            <form onSubmit={updateMatch} className="space-y-4">
              <div>
                <Label>ID матча</Label>
                <Input name="match_id" type="number" required />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Счёт хозяев</Label>
                  <Input name="home_score" type="number" defaultValue="0" required />
                </div>
                <div>
                  <Label>Счёт гостей</Label>
                  <Input name="away_score" type="number" defaultValue="0" required />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Статус</Label>
                  <Select name="status" defaultValue="scheduled">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Запланирован</SelectItem>
                      <SelectItem value="live">Идёт матч</SelectItem>
                      <SelectItem value="finished">Завершён</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Тип завершения</Label>
                  <Select name="result_type">
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regulation">Основное время</SelectItem>
                      <SelectItem value="overtime">Овертайм</SelectItem>
                      <SelectItem value="shootout">Буллиты</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Дата и время матча</Label>
                <Input name="match_date" type="datetime-local" required />
              </div>
              <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
                {loading ? 'Обновление...' : 'Обновить матч'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="content">
            <div className="space-y-6">
              <div className="border-b border-border pb-6">
                <h3 className="font-semibold mb-4">Добавить пункт регламента</h3>
                <form onSubmit={addRegulation} className="space-y-4">
                  <div>
                    <Label>Заголовок</Label>
                    <Input name="title" required />
                  </div>
                  <div>
                    <Label>Содержание</Label>
                    <Textarea name="content" rows={3} required />
                  </div>
                  <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
                    {loading ? 'Добавление...' : 'Добавить пункт'}
                  </Button>
                </form>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Добавить чемпиона</h3>
                <form onSubmit={addChampion} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Сезон</Label>
                      <Input name="season" placeholder="Сезон 2024/2025" required />
                    </div>
                    <div>
                      <Label>Год</Label>
                      <Input name="year" type="number" placeholder="2024" required />
                    </div>
                  </div>
                  <div>
                    <Label>Название команды</Label>
                    <Input name="team_name" required />
                  </div>
                  <div>
                    <Label>Описание</Label>
                    <Textarea name="description" rows={2} />
                  </div>
                  <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
                    {loading ? 'Добавление...' : 'Добавить чемпиона'}
                  </Button>
                </form>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}