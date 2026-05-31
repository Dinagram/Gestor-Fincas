'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { BlockForm } from './block-form';
import { EventForm } from './event-form';

interface Props {
  communityId: string;
  openHour: number;
  closeHour: number;
}

export function AdminActions({ communityId, openHour, closeHour }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Reservar para la comunidad</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="evento">
          <TabsList className="w-full">
            <TabsTrigger value="evento" className="flex-1">
              Evento comunitario
            </TabsTrigger>
            <TabsTrigger value="bloqueo" className="flex-1">
              Bloquear franja
            </TabsTrigger>
          </TabsList>
          <TabsContent value="evento">
            <EventForm communityId={communityId} openHour={openHour} closeHour={closeHour} />
          </TabsContent>
          <TabsContent value="bloqueo">
            <BlockForm communityId={communityId} openHour={openHour} closeHour={closeHour} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
