import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface InfoTabProps {
  data: any;
}

export default function InfoTab({ data }: InfoTabProps) {
  if (!data) return null;

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border hover:border-primary/50 transition-all">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Info" size={24} className="text-primary" />
            О лиге
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">{data.title}</h3>
            <p className="text-muted-foreground">{data.description}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border hover:border-primary/50 transition-all">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Share2" size={24} className="text-primary" />
            Наши социальные сети
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {data.telegram && (
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-primary/10 hover:border-primary transition-all group"
                onClick={() => window.open(data.telegram, '_blank')}
              >
                <Icon name="Send" size={20} className="text-primary group-hover:scale-110 transition-transform" />
                <span className="ml-3">Telegram</span>
              </Button>
            )}
            {data.discord && (
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-primary/10 hover:border-primary transition-all group"
                onClick={() => window.open(data.discord, '_blank')}
              >
                <Icon name="MessageCircle" size={20} className="text-primary group-hover:scale-110 transition-transform" />
                <span className="ml-3">Discord</span>
              </Button>
            )}
            {data.twitch && (
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-primary/10 hover:border-primary transition-all group"
                onClick={() => window.open(data.twitch, '_blank')}
              >
                <Icon name="Video" size={20} className="text-primary group-hover:scale-110 transition-transform" />
                <span className="ml-3">Twitch</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}