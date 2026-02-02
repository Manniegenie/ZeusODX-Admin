import { useState, useEffect, useContext, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardTitleContext } from '@/layouts/DashboardTitleContext';
import { toast } from 'sonner';
import { 
  Clock, 
  Play, 
  Pause, 
  TestTube, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Bell
} from 'lucide-react';
import axiosInstance from '@/core/services/axios';

interface ScheduledNotificationStatus {
  isRunning: boolean;
  jobsCount: number;
  schedules: Array<{
    time: string;
    running: boolean;
  }>;
}

export function ScheduledNotifications() {
  const titleCtx = useContext(DashboardTitleContext);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<ScheduledNotificationStatus | null>(null);
  const [testing, setTesting] = useState(false);
  const testInProgressRef = useRef(false);

  useEffect(() => {
    titleCtx?.setTitle('Scheduled Notifications');
  }, [titleCtx]);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const response = await axiosInstance.get('/admin/scheduled-notifications/status');
      setStatus(response.data.data);
    } catch (error) {
      console.error('Failed to load status:', error);
      toast.error('Failed to load scheduled notification status');
    }
  };

  const startNotifications = async () => {
    setLoading(true);
    try {
      await axiosInstance.post('/admin/scheduled-notifications/start');
      toast.success('Scheduled notifications started successfully');
      loadStatus();
    } catch (error) {
      console.error('Failed to start notifications:', error);
      toast.error('Failed to start scheduled notifications');
    } finally {
      setLoading(false);
    }
  };

  const stopNotifications = async () => {
    setLoading(true);
    try {
      await axiosInstance.post('/admin/scheduled-notifications/stop');
      toast.success('Scheduled notifications stopped successfully');
      loadStatus();
    } catch (error) {
      console.error('Failed to stop notifications:', error);
      toast.error('Failed to stop scheduled notifications');
    } finally {
      setLoading(false);
    }
  };

  const testNotification = async () => {
    if (testInProgressRef.current) return;
    testInProgressRef.current = true;
    setTesting(true);
    try {
      const { data } = await axiosInstance.post('/admin/scheduled-notifications/test');
      if (data.success && data.data?.delivered !== undefined) {
        const { totalUsers, delivered, failed, skipped } = data.data;
        if (delivered > 0) {
          toast.success(`Sent to ${delivered}/${totalUsers} users${failed ? ` (${failed} failed)` : ''}`);
        } else {
          toast.warning(data.message || `0/${totalUsers} delivered. ${skipped ? `${skipped} skipped (no valid token).` : ''}`);
        }
      } else if (!data.success) {
        toast.error(data.message || 'Test failed');
      } else {
        toast.success(data.message || 'Test completed');
      }
    } catch (error: any) {
      console.error('Failed to send test notification:', error);
      const msg = error?.response?.data?.message || error?.response?.data?.error || 'Failed to send test notification';
      toast.error(msg);
    } finally {
      setTesting(false);
      testInProgressRef.current = false;
    }
  };

  const getTimeIcon = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return '🌅'; // Morning
    if (hour < 18) return '☀️'; // Afternoon
    return '🌙'; // Evening
  };

  return (
    <div className="w-full bg-white space-y-6 p-4 rounded">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-8 h-8 text-blue-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Scheduled Notifications</h1>
            <p className="text-gray-600">Manage automated price notifications</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={testNotification}
            disabled={testing}
            className="flex items-center gap-2"
          >
            {testing ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <TestTube className="w-4 h-4" />
            )}
            {testing ? 'Testing...' : 'Test Now'}
          </Button>
          <Button
            onClick={loadStatus}
            className="flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Service Status
          </h2>
          <div className="flex items-center gap-2">
            {status?.isRunning ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Running</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Stopped</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">Active Jobs</p>
            <p className="text-2xl font-bold">{status?.jobsCount || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="text-lg font-medium">
              {status?.isRunning ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {status?.isRunning ? (
            <Button
              onClick={stopNotifications}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Pause className="w-4 h-4" />
              )}
              Stop Service
            </Button>
          ) : (
            <Button
              onClick={startNotifications}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Start Service
            </Button>
          )}
        </div>
      </Card>

      {/* Schedule Details */}
      {status?.schedules && status.schedules.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Notification Schedule</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {status.schedules.map((schedule, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  schedule.running
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getTimeIcon(schedule.time)}</span>
                  <div>
                    <p className="font-semibold text-lg">{schedule.time}</p>
                    <div className="flex items-center gap-1">
                      {schedule.running ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-gray-400" />
                      )}
                      <span className={`text-sm ${
                        schedule.running ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {schedule.running ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Notification Template Preview */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Notification Template</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="font-semibold text-lg">Latest Prices</div>
            <div className="text-gray-700">
              Latest prices are BTC - $113,000 (-0.73%), ETH - $3,450 (+1.2%), BNB - $580 (-0.5%), SOL - $95 (+2.1%). Trade now.
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-3">
          This template will be automatically populated with real-time prices from your CryptoPrice collection.
        </p>
      </Card>

      {/* Instructions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">How it Works</h2>
        <div className="space-y-3 text-gray-600">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">1</div>
            <p>Fetches latest prices from your CryptoPrice collection for BTC, ETH, BNB, and SOL</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">2</div>
            <p>Formats prices with percentage changes and creates a notification message</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">3</div>
            <p>Sends push notifications to all users with registered FCM or Expo tokens</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">4</div>
            <p>Runs automatically at 6:00 AM, 12:00 PM, 6:00 PM, and 9:00 PM daily</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
