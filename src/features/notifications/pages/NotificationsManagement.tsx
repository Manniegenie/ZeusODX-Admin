import { useState, useEffect, useContext } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DashboardTitleContext } from '@/layouts/DashboardTitleContext';
import { notificationService } from '../services/notificationService';
import type { NotificationStats, SendNotificationFormData } from '../types/notification.types';
import { toast } from 'sonner';
import {
  Bell,
  Send,
  Users,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Activity,
  Zap
} from 'lucide-react';

export function NotificationsManagement() {
  const titleCtx = useContext(DashboardTitleContext);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [firebaseStatus, setFirebaseStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [clearAllLoading, setClearAllLoading] = useState(false);
  const [clearPhoneLoading, setClearPhoneLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formData, setFormData] = useState<SendNotificationFormData>({
    title: '',
    body: '',
    data: '{}',
    targetType: 'all',
    targetValue: ''
  });

  useEffect(() => {
    titleCtx?.setTitle('Push Notifications');
  }, [titleCtx]);

  useEffect(() => {
    loadStats();
    testFirebase();
  }, []);

  const loadStats = async () => {
    try {
      const statsData = await notificationService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
      toast.error('Failed to load notification statistics');
    }
  };

  const testFirebase = async () => {
    try {
      const status = await notificationService.testFirebase();
      setFirebaseStatus(status);
    } catch (error) {
      console.error('Failed to test Firebase:', error);
      setFirebaseStatus({ success: false, message: 'Firebase connection failed' });
    }
  };

  const handleInputChange = (field: keyof SendNotificationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSendNotification = async () => {
    if (!formData.title.trim() || !formData.body.trim()) {
      toast.error('Title and body are required');
      return;
    }

    if (formData.targetType !== 'all' && !formData.targetValue.trim()) {
      toast.error('Target value is required when not sending to all users');
      return;
    }

    // Validate JSON data
    if (formData.data.trim()) {
      try {
        JSON.parse(formData.data);
      } catch (error) {
        toast.error('Invalid JSON format in data field');
        return;
      }
    }

    setLoading(true);
    try {
      const result = await notificationService.sendNotification(formData);
      
      if (result.success) {
        // Show detailed success message for bulk sends
        if (result.total !== undefined) {
          toast.success(
            `Notification sent successfully! ${result.successful || 0} out of ${result.total} users received it.${result.failed ? ` ${result.failed} failed.` : ''}`,
            { duration: 5000 }
          );
        } else {
          toast.success(result.message || 'Notification sent successfully!');
        }
        
        // Reset form
        setFormData({
          title: '',
          body: '',
          data: '{}',
          targetType: 'all',
          targetValue: ''
        });
        // Reload stats
        loadStats();
      } else {
        toast.error(result.message || 'Failed to send notification');
      }
    } catch (error: any) {
      console.error('Error sending notification:', error);
      const errorMessage = error.message || 'Failed to send notification';
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllTokens = async () => {
    setClearAllLoading(true);
    try {
      const result = await notificationService.clearAllTokens();
      toast.success(result.message || 'All tokens cleared');
      loadStats();
    } catch (error: any) {
      toast.error(error.message || 'Failed to clear tokens');
    } finally {
      setClearAllLoading(false);
    }
  };

  const handleClearTokensByPhone = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Phone number is required');
      return;
    }
    setClearPhoneLoading(true);
    try {
      const result = await notificationService.clearTokensByPhone(phoneNumber.trim());
      toast.success(result.message || 'Tokens cleared for phone number');
      setPhoneNumber('');
      loadStats();
    } catch (error: any) {
      toast.error(error.message || 'Failed to clear tokens by phone');
    } finally {
      setClearPhoneLoading(false);
    }
  };

  const getTargetPlaceholder = () => {
    switch (formData.targetType) {
      case 'user':
        return 'Enter User ID (e.g., 507f1f77bcf86cd799439011)';
      case 'device':
        return 'Enter Device ID (e.g., ios-simulator-test)';
      default:
        return '';
    }
  };

  return (
    <div className="w-full bg-white space-y-6 p-4 rounded">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-8 h-8 text-blue-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Push Notifications</h1>
            <p className="text-gray-600">Send notifications to users via Expo</p>
          </div>
        </div>
        <Button
          onClick={testFirebase}
          className="flex items-center gap-2"
        >
          <Activity className="w-4 h-4" />
          Test Service
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold">{stats?.totalUsers || '—'}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Smartphone className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Users with Tokens</p>
              <p className="text-2xl font-bold">{stats?.usersWithTokens || '—'}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-500">Active Tokens</p>
              <p className="text-2xl font-bold">{stats?.expoTokens || '—'}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-sm text-gray-500">Expo Tokens</p>
              <p className="text-2xl font-bold">{stats?.expoTokens || '—'}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Notification Service Status */}
      {firebaseStatus && (
        <Card className={`p-4 ${firebaseStatus.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-3">
            {firebaseStatus.success ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-500" />
            )}
            <div>
              <p className={`font-medium ${firebaseStatus.success ? 'text-green-800' : 'text-red-800'}`}>
                Expo Service Status: {firebaseStatus.success ? 'Ready' : 'Unavailable'}
              </p>
              <p className={`text-sm ${firebaseStatus.success ? 'text-green-600' : 'text-red-600'}`}>
                {firebaseStatus.message}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Send Notification Form */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Send className="w-5 h-5" />
          Send Notification
        </h2>

        <div className="space-y-4">
          {/* Target Type */}
          <div>
            <Label htmlFor="targetType">Target</Label>
            <Select
              value={formData.targetType}
              onValueChange={(value) => handleInputChange('targetType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select target type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="user">Specific User (by ID)</SelectItem>
                <SelectItem value="device">Specific Device (by Device ID)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Target Value */}
          {formData.targetType !== 'all' && (
            <div>
              <Label htmlFor="targetValue">Target Value</Label>
              <Input
                id="targetValue"
                value={formData.targetValue}
                onChange={(e) => handleInputChange('targetValue', e.target.value)}
                placeholder={getTargetPlaceholder()}
              />
            </div>
          )}

          {/* Title */}
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter notification title"
              maxLength={100}
            />
          </div>

          {/* Body */}
          <div>
            <Label htmlFor="body">Message *</Label>
            <Textarea
              id="body"
              value={formData.body}
              onChange={(e) => handleInputChange('body', e.target.value)}
              placeholder="Enter notification message"
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Data (JSON) */}
          <div>
            <Label htmlFor="data">Data (JSON)</Label>
            <Textarea
              id="data"
              value={formData.data}
              onChange={(e) => handleInputChange('data', e.target.value)}
              placeholder='{"key": "value", "action": "open_screen"}'
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional JSON data to send with the notification
            </p>
          </div>

          {/* Send Button */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSendNotification}
              disabled={loading || !formData.title.trim() || !formData.body.trim()}
              className="flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {loading ? 'Sending...' : 'Send Notification'}
            </Button>

            <Button
              onClick={() => {
                setFormData({
                  title: '',
                  body: '',
                  data: '{}',
                  targetType: 'all',
                  targetValue: ''
                });
              }}
            >
              Clear Form
            </Button>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <Button
            onClick={() => {
              setFormData(prev => ({
                ...prev,
                title: 'System Maintenance',
                body: 'We will be performing scheduled maintenance. Some features may be temporarily unavailable.',
                targetType: 'all'
              }));
            }}
            className="justify-start"
          >
            <Bell className="w-4 h-4 mr-2" />
            Maintenance Notice
          </Button>

          <Button
            onClick={() => {
              setFormData(prev => ({
                ...prev,
                title: 'New Feature Available',
                body: 'Check out our latest features and improvements in the app!',
                targetType: 'all'
              }));
            }}
            className="justify-start"
          >
            <Zap className="w-4 h-4 mr-2" />
            Feature Announcement
          </Button>

          <Button
            onClick={() => {
              setFormData(prev => ({
                ...prev,
                title: 'Security Alert',
                body: 'Please verify your account security settings.',
                targetType: 'all',
                data: '{"type": "security", "action": "verify_security"}'
              }));
            }}
            className="justify-start"
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            Security Alert
          </Button>
        </div>
      </Card>

      {/* Token Maintenance */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Token Maintenance
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <Label>Clear all tokens</Label>
            <p className="text-sm text-gray-600">
              Removes all stored Expo push tokens for every user. Devices will need to re-register on next app open.
            </p>
            <Button
              type="button"
              onClick={handleClearAllTokens}
              disabled={clearAllLoading}
              className="w-full justify-center"
            >
              {clearAllLoading ? 'Clearing...' : 'Clear all tokens'}
            </Button>
          </div>

          <div className="space-y-3">
            <Label htmlFor="phone-clear">Clear by phone number</Label>
            <Input
              id="phone-clear"
              placeholder="Enter phone number (e.g., +2348012345678)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <Button
              type="button"
              onClick={handleClearTokensByPhone}
              disabled={clearPhoneLoading}
              className="w-full justify-center"
            >
              {clearPhoneLoading ? 'Clearing...' : 'Clear tokens for phone'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}




