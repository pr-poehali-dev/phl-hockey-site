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
  const [leagueInfo, setLeagueInfo] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [regulations, setRegulations] = useState<any[]>([]);
  const [createDivision, setCreateDivision] = useState('Первый');
  const [updateDivision, setUpdateDivision] = useState('Первый');

  const checkPassword = async () => {
    if (password === 'phldyez') {
      setIsAuthenticated(true);
      toast.success('Вход выполнен');
      
      const response = await fetch(`${LEAGUE_DATA_URL}?type=all`);
      const data = await response.json();
      setLeagueInfo(data.info);
      setTeams(data.teams || []);
      setRegulations(data.regulations || []);
      setRegulations(data.regulations || []);
    } else {
      toast.error('Неверный пароль');
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    if (!file) {
      throw new Error('Файл не выбран');
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('Файл должен быть изображением');
    }

    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('https://api.poehali.dev/upload-image', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка загрузки: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.url) {
        throw new Error('URL изображения не получен');
      }
      
      return data.url;
    } catch (error) {
      console.error('Ошибка загрузки изображения:', error);
      toast.error('Не удалось загрузить изображение');
      throw error;
    }
  };

  const updateLeagueInfo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      let logoUrl = formData.get('existing_logo') as string;
      const logoFile = (e.currentTarget.elements.namedItem('league_logo') as HTMLInputElement).files?.[0];
      
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
          type: 'info',
          title: formData.get('title'),
          description: formData.get('description'),
          telegram: formData.get('telegram'),
          discord: formData.get('discord'),
          twitch: formData.get('twitch'),
          logo_url: logoUrl || null
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
        try {
          toast.info('Загружаю логотип...');
          logoUrl = await uploadImage(logoFile);
          toast.success('Логотип загружен');
        } catch (uploadError) {
          console.error('Ошибка загрузки логотипа:', uploadError);
          setLoading(false);
          return;
        }
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
          division: createDivision,
          logo_url: logoUrl || null
        })
      });
      
      if (response.ok) {
        toast.success('Команда добавлена');
        const resp = await fetch(`${LEAGUE_DATA_URL}?type=all`);
        const data = await resp.json();
        setTeams(data.teams || []);
        onUpdate();
        (e.target as HTMLFormElement).reset();
        setCreateDivision('Первый');
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || 'Ошибка добавления команды');
      }
    } catch (error) {
      console.error('Ошибка создания команды:', error);
      toast.error(error instanceof Error ? error.message : 'Ошибка сети');
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
        try {
          toast.info('Загружаю новый логотип...');
          logoUrl = await uploadImage(logoFile);
          toast.success('Логотип загружен');
        } catch (uploadError) {
          console.error('Ошибка загрузки логотипа:', uploadError);
          setLoading(false);
          return;
        }
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
          division: updateDivision,
          logo_url: logoUrl || null
        })
      });
      
      if (response.ok) {
        toast.success('Команда обновлена');
        const resp = await fetch(`${LEAGUE_DATA_URL}?type=all`);
        const data = await resp.json();
        setTeams(data.teams || []);
        onUpdate();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || 'Ошибка обновления');
      }
    } catch (error) {
      console.error('Ошибка обновления команды:', error);
      toast.error(error instanceof Error ? error.message : 'Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  const deleteTeam = async (teamId: number) => {
    if (!confirm('Вы уверены что хотите удалить команду? Это действие необратимо.')) return;
    
    setLoading(true);
    try {
      const response = await fetch(LEAGUE_DATA_URL, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password
        },
        body: JSON.stringify({
          type: 'team',
          id: teamId
        })
      });
      
      if (response.ok) {
        toast.success('Команда удалена');
        const resp = await fetch(`${LEAGUE_DATA_URL}?type=all`);
        const data = await resp.json();
        setTeams(data.teams || []);
        onUpdate();
      } else {
        toast.error('Ошибка удаления команды');
      }
    } catch (error) {
      toast.error('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  const updateTeamStats = async (e: React.FormEvent<HTMLFormElement>) => {
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
          type: 'team_stats',
          id: parseInt(formData.get('team_id') as string),
          played: parseInt(formData.get('played') as string),
          wins: parseInt(formData.get('wins') as string),
          wins_ot: parseInt(formData.get('wins_ot') as string),
          losses_ot: parseInt(formData.get('losses_ot') as string),
          losses: parseInt(formData.get('losses') as string),
          goals_for: parseInt(formData.get('goals_for') as string),
          goals_against: parseInt(formData.get('goals_against') as string),
          points: parseInt(formData.get('points') as string)
        })
      });
      
      if (response.ok) {
        toast.success('Статистика обновлена');
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

  const updateRegulation = async (e: React.FormEvent<HTMLFormElement>) => {
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
          id: parseInt(formData.get('regulation_id') as string),
          title: formData.get('title'),
          content: formData.get('content')
        })
      });
      
      if (response.ok) {
        toast.success('Регламент обновлён');
        onUpdate();
        const res = await fetch(`${LEAGUE_DATA_URL}?type=all`);
        const data = await res.json();
        setRegulations(data.regulations || []);
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
        const resp = await fetch(`${LEAGUE_DATA_URL}?type=all`);
        const data = await resp.json();
        setRegulations(data.regulations || []);
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

  const updateRegulation = async (e: React.FormEvent<HTMLFormElement>) => {
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
          id: parseInt(formData.get('regulation_id') as string),
          title: formData.get('title'),
          content: formData.get('content')
        })
      });
      
      if (response.ok) {
        toast.success('Регламент обновлён');
        const resp = await fetch(`${LEAGUE_DATA_URL}?type=all`);
        const data = await resp.json();
        setRegulations(data.regulations || []);
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

  const deleteRegulation = async (regId: number) => {
    if (!confirm('Вы уверены что хотите удалить пункт регламента?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(LEAGUE_DATA_URL, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password
        },
        body: JSON.stringify({
          type: 'regulation',
          id: regId
        })
      });
      
      if (response.ok) {
        toast.success('Пункт удалён');
        const resp = await fetch(`${LEAGUE_DATA_URL}?type=all`);
        const data = await resp.json();
        setRegulations(data.regulations || []);
        onUpdate();
      } else {
        toast.error('Ошибка удаления');
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
          <TabsList className="grid w-full grid-cols-8 text-xs">
            <TabsTrigger value="info">Информация</TabsTrigger>
            <TabsTrigger value="team-create">Добавить</TabsTrigger>
            <TabsTrigger value="team-update">Изменить</TabsTrigger>
            <TabsTrigger value="team-delete">Управление</TabsTrigger>
            <TabsTrigger value="team-stats">Статистика</TabsTrigger>
            <TabsTrigger value="match-create">Матч</TabsTrigger>
            <TabsTrigger value="match-update">Обновить</TabsTrigger>
            <TabsTrigger value="content">Контент</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <form onSubmit={updateLeagueInfo} className="space-y-4">
              <div>
                <Label>Название лиги</Label>
                <Input name="title" defaultValue="PHL - Первая хоккейная лига" required />
              </div>
              <div>
                <Label>Логотип лиги (в левом верхнем углу)</Label>
                <Input name="league_logo" type="file" accept="image/*" />
                <Input name="existing_logo" type="hidden" value={leagueInfo?.logo_url || ''} />
                <p className="text-xs text-muted-foreground mt-1">Загрузите изображение с компьютера</p>
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
                <Select value={createDivision} onValueChange={setCreateDivision}>
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
                <Select value={updateDivision} onValueChange={setUpdateDivision}>
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

          <TabsContent value="team-delete">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Управление командами: удаление и изменение позиций</p>
              <div className="space-y-2">
                {teams.map((team, index) => (
                  <div key={team.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {team.logo_url && (
                        <img src={team.logo_url} alt={team.name} className="w-8 h-8 object-contain" />
                      )}
                      <div>
                        <p className="font-medium">{team.name}</p>
                        <p className="text-xs text-muted-foreground">{team.division} дивизион · Позиция {index + 1}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => moveTeamPosition(team.id, 'up')} 
                        disabled={loading || index === 0}
                        variant="outline"
                        size="sm"
                      >
                        <Icon name="ArrowUp" size={16} />
                      </Button>
                      <Button 
                        onClick={() => moveTeamPosition(team.id, 'down')} 
                        disabled={loading || index === teams.length - 1}
                        variant="outline"
                        size="sm"
                      >
                        <Icon name="ArrowDown" size={16} />
                      </Button>
                      <Button 
                        onClick={() => deleteTeam(team.id)} 
                        disabled={loading}
                        variant="destructive"
                        size="sm"
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="team-stats">
            <form onSubmit={updateTeamStats} className="space-y-4">
              <div>
                <Label>Выберите команду</Label>
                <Select name="team_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите команду" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map(team => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        {team.name} ({team.division})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>Игры</Label>
                  <Input name="played" type="number" defaultValue="0" required />
                </div>
                <div>
                  <Label>Победы</Label>
                  <Input name="wins" type="number" defaultValue="0" required />
                </div>
                <div>
                  <Label>Победы ОТ</Label>
                  <Input name="wins_ot" type="number" defaultValue="0" required />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>Поражения ОТ</Label>
                  <Input name="losses_ot" type="number" defaultValue="0" required />
                </div>
                <div>
                  <Label>Поражения</Label>
                  <Input name="losses" type="number" defaultValue="0" required />
                </div>
                <div>
                  <Label>Очки</Label>
                  <Input name="points" type="number" defaultValue="0" required />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Голы забитые</Label>
                  <Input name="goals_for" type="number" defaultValue="0" required />
                </div>
                <div>
                  <Label>Голы пропущенные</Label>
                  <Input name="goals_against" type="number" defaultValue="0" required />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
                {loading ? 'Сохранение...' : 'Сохранить статистику'}
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
                <h3 className="font-semibold mb-4">Список регламента</h3>
                <div className="space-y-2">
                  {regulations.map(reg => (
                    <div key={reg.id} className="flex items-start justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{reg.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{reg.content}</p>
                      </div>
                      <Button 
                        onClick={() => deleteRegulation(reg.id)} 
                        disabled={loading}
                        variant="destructive"
                        size="sm"
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-b border-border pb-6">
                <h3 className="font-semibold mb-4">Редактировать пункт регламента</h3>
                <form onSubmit={updateRegulation} className="space-y-4">
                  <div>
                    <Label>Выберите пункт</Label>
                    <Select name="regulation_id" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите пункт регламента" />
                      </SelectTrigger>
                      <SelectContent>
                        {regulations.map(reg => (
                          <SelectItem key={reg.id} value={reg.id.toString()}>
                            {reg.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Новый заголовок</Label>
                    <Input name="title" required />
                  </div>
                  <div>
                    <Label>Новое содержание</Label>
                    <Textarea name="content" rows={5} required />
                  </div>
                  <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
                    {loading ? 'Сохранение...' : 'Сохранить изменения'}
                  </Button>
                </form>
              </div>

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