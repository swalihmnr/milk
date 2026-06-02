import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Map, Truck, Check, X } from 'lucide-react';

export default function DeliveryList() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Deliveries</h2>
          <p className="text-gray-500">Today's routes and delivery confirmations.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Map className="mr-2 h-4 w-4" /> Manage Routes</Button>
          <Button className="bg-accent hover:bg-blue-700">
            <Truck className="mr-2 h-4 w-4" /> Assign Boys
          </Button>
        </div>
      </div>

      {/* Route Filter */}
      <div className="flex gap-2 pb-4">
        <Button variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Route A (North)</Button>
        <Button variant="outline">Route B (South)</Button>
        <Button variant="outline">Route C (East)</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Route A - Morning Shift</CardTitle>
              <CardDescription>Delivery Boy: Ramesh Kumar • Total: 24L</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-success">18 / 22 Delivered</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100 border-t border-gray-100">
            
            {/* Delivered Item */}
            <div className="flex items-center justify-between p-4 bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">1. Rahul Sharma</p>
                  <p className="text-xs text-gray-500">1.5L • 06:15 AM</p>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">OTP: Verified</div>
            </div>

            {/* Pending Item */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="font-bold text-blue-600">2</span>
                </div>
                <div>
                  <p className="font-medium">2. Anita Desai</p>
                  <p className="text-xs text-gray-500">0.5L • H.No 442, Main St</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-danger hover:bg-red-50 hover:text-red-700"><X className="h-4 w-4" /></Button>
                <Button size="sm" className="bg-success hover:bg-green-600"><Check className="h-4 w-4" /></Button>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
