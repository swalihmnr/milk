import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SupportCenter() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Support & Complaints</h2>
          <p className="text-gray-500">Manage customer issues and platform support tickets.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-l-4 border-l-danger">
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <CardTitle className="text-lg">Sour Milk Issue</CardTitle>
              <AlertCircle className="h-5 w-5 text-danger" />
            </div>
            <CardDescription>From: Anita Desai</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              The milk delivered this morning was sour when boiled. Requesting a replacement or refund for today.
            </p>
            <div className="flex justify-between items-center border-t border-gray-100 pt-4">
              <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-1 rounded">High Priority</span>
              <Button size="sm" className="h-8 text-xs bg-accent">Respond</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <CardTitle className="text-lg">Delivery Delay</CardTitle>
              <MessageSquare className="h-5 w-5 text-warning" />
            </div>
            <CardDescription>From: Rahul Sharma</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              Milk hasn't arrived yet and it's past 7 AM. Please check with the delivery boy.
            </p>
            <div className="flex justify-between items-center border-t border-gray-100 pt-4">
              <span className="text-xs font-medium bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Medium Priority</span>
              <Button size="sm" variant="outline" className="h-8 text-xs">View Route</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success opacity-75">
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <CardTitle className="text-lg">Billing Discrepancy</CardTitle>
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <CardDescription>From: Suresh Patel</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              My invoice shows 30L but I paused delivery for 2 days.
            </p>
            <div className="flex justify-between items-center border-t border-gray-100 pt-4">
              <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">Resolved</span>
              <Button size="sm" variant="ghost" className="h-8 text-xs">View Log</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
