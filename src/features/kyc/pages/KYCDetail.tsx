import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DashboardTitleContext } from '@/layouts/DashboardTitleContext';
import { ArrowLeft, CheckCircle, XCircle, Loader2, AlertCircle, User, Mail, Phone, Calendar, FileText, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { KYCService } from '../services/kycService';
import type { KYCDetailsResponse } from '../types/kyc';

export function KYCDetail() {
  const { kycId } = useParams<{ kycId: string }>();
  const navigate = useNavigate();
  const titleCtx = useContext(DashboardTitleContext);
  
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [approvingBvn, setApprovingBvn] = useState(false);
  const [verifyingBvn, setVerifyingBvn] = useState(false);
  const [disablingBvn, setDisablingBvn] = useState(false);
  const [disablingKyc, setDisablingKyc] = useState(false);
  const [kycData, setKycData] = useState<KYCDetailsResponse['data'] | null>(null);
  
  // Form states for manual approval
  const [idType, setIdType] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [bvnNumber, setBvnNumber] = useState('');

  useEffect(() => {
    titleCtx?.setTitle('KYC Details');
    titleCtx?.setBreadcrumb(['KYC', 'KYC Review', 'KYC Details']);
  }, [titleCtx]);

  // Fetch KYC details
  useEffect(() => {
    const fetchKycDetails = async () => {
      if (!kycId) {
        toast.error('KYC ID is required');
        navigate('/kyc');
        return;
      }

      try {
        setLoading(true);
        const response = await KYCService.getKycDetails(kycId);
        
        if (response.success && response.data) {
          setKycData(response.data);
          // Pre-fill form with existing data if available
          if (response.data.kyc) {
            setIdType(response.data.kyc.frontendIdType || response.data.kyc.idType || '');
            setIdNumber(response.data.kyc.idNumber || '');
            setFullName(response.data.kyc.fullName || `${response.data.user.firstname} ${response.data.user.lastname}` || '');
            // Pre-fill BVN if it's a BVN verification
            if (response.data.kyc.frontendIdType === 'bvn' || response.data.kyc.idType === 'BVN') {
              setBvnNumber(response.data.kyc.idNumber || '');
            }
          }
        } else {
          toast.error('Failed to load KYC details');
          navigate('/kyc');
        }
      } catch (error: any) {
        console.error('Error fetching KYC details:', error);
        toast.error(error?.response?.data?.error || 'Failed to load KYC details');
        navigate('/kyc');
      } finally {
        setLoading(false);
      }
    };

    fetchKycDetails();
  }, [kycId, navigate]);

  // Handle approval
  const handleApprove = async () => {
    if (!kycData?.user?.phonenumber) {
      toast.error('User phone number is required');
      return;
    }

    if (!idType || !idNumber) {
      toast.error('ID Type and ID Number are required for approval');
      return;
    }

    try {
      setApproving(true);
      const response = await KYCService.approveKyc(
        kycData.user.phonenumber,
        idType,
        idNumber,
        fullName || undefined
      );

      if (response.success) {
        toast.success('KYC approved successfully');
        // Refresh the data
        const updatedResponse = await KYCService.getKycDetails(kycId!);
        if (updatedResponse.success && updatedResponse.data) {
          setKycData(updatedResponse.data);
        }
      } else {
        toast.error(response.error || 'Failed to approve KYC');
      }
    } catch (error: any) {
      console.error('Error approving KYC:', error);
      toast.error(error?.response?.data?.error || 'Failed to approve KYC');
    } finally {
      setApproving(false);
    }
  };

  // Handle BVN approval
  const handleApproveBvn = async () => {
    if (!kycData?.user?.phonenumber) {
      toast.error('User phone number is required');
      return;
    }

    if (!bvnNumber.trim()) {
      toast.error('BVN is required for approval');
      return;
    }

    try {
      setApprovingBvn(true);
      const response = await KYCService.approveBvn(
        kycData.user.phonenumber,
        bvnNumber.trim()
      );

      if (response.success) {
        toast.success('BVN approved successfully');
        // Refresh the data
        const updatedResponse = await KYCService.getKycDetails(kycId!);
        if (updatedResponse.success && updatedResponse.data) {
          setKycData(updatedResponse.data);
        }
        setBvnNumber('');
      } else {
        toast.error(response.error || 'Failed to approve BVN');
      }
    } catch (error: any) {
      console.error('Error approving BVN:', error);
      toast.error(error?.response?.data?.error || 'Failed to approve BVN');
    } finally {
      setApprovingBvn(false);
    }
  };

  // Handle decline/rejection
  const handleDecline = async () => {
    if (!kycData?.user?.phonenumber) {
      toast.error('User phone number is required');
      return;
    }

    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      setDeclining(true);
      const response = await KYCService.cancelKyc(
        kycData.user.phonenumber,
        rejectionReason
      );

      if (response.success) {
        toast.success('KYC declined successfully');
        // Refresh the data
        const updatedResponse = await KYCService.getKycDetails(kycId!);
        if (updatedResponse.success && updatedResponse.data) {
          setKycData(updatedResponse.data);
        }
        setRejectionReason('');
      } else {
        toast.error(response.error || 'Failed to decline KYC');
      }
    } catch (error: any) {
      console.error('Error declining KYC:', error);
      toast.error(error?.response?.data?.error || 'Failed to decline KYC');
    } finally {
      setDeclining(false);
    }
  };

  // Handle verify BVN
  const handleVerifyBvn = async () => {
    if (!kycData?.user?.phonenumber) {
      toast.error('User phone number is required');
      return;
    }

    if (!user.bvn) {
      toast.error('User does not have a BVN on record');
      return;
    }

    if (!window.confirm(`Verify BVN ${user.bvn}? This will permanently set bvnVerified to true and create an approved record.`)) {
      return;
    }

    try {
      setVerifyingBvn(true);
      const response = await KYCService.verifyBvn(
        kycData.user.phonenumber,
        user.bvn
      );

      if (response.success) {
        toast.success('BVN verified successfully');
        // Refresh the data
        const updatedResponse = await KYCService.getKycDetails(kycId!);
        if (updatedResponse.success && updatedResponse.data) {
          setKycData(updatedResponse.data);
        }
      } else {
        toast.error(response.error || 'Failed to verify BVN');
      }
    } catch (error: any) {
      console.error('Error verifying BVN:', error);
      toast.error(error?.response?.data?.error || 'Failed to verify BVN');
    } finally {
      setVerifyingBvn(false);
    }
  };

  // Handle disable BVN
  const handleDisableBvn = async () => {
    if (!kycData?.user?.phonenumber) {
      toast.error('User phone number is required');
      return;
    }

    if (!window.confirm('Are you sure you want to disable this user\'s BVN? This action cannot be undone.')) {
      return;
    }

    try {
      setDisablingBvn(true);
      const response = await KYCService.disableBvn(kycData.user.phonenumber);

      if (response.success) {
        toast.success('BVN disabled successfully');
        // Refresh the data
        const updatedResponse = await KYCService.getKycDetails(kycId!);
        if (updatedResponse.success && updatedResponse.data) {
          setKycData(updatedResponse.data);
        }
      } else {
        toast.error(response.error || 'Failed to disable BVN');
      }
    } catch (error: any) {
      console.error('Error disabling BVN:', error);
      toast.error(error?.response?.data?.error || 'Failed to disable BVN');
    } finally {
      setDisablingBvn(false);
    }
  };

  // Handle disable KYC
  const handleDisableKyc = async () => {
    if (!kycData?.user?.phonenumber) {
      toast.error('User phone number is required');
      return;
    }

    if (!window.confirm('Are you sure you want to disable this user\'s KYC? This will cancel all pending KYC submissions and reset their KYC status.')) {
      return;
    }

    try {
      setDisablingKyc(true);
      const response = await KYCService.cancelKyc(
        kycData.user.phonenumber,
        'KYC disabled by admin'
      );

      if (response.success) {
        toast.success('KYC disabled successfully');
        // Refresh the data
        const updatedResponse = await KYCService.getKycDetails(kycId!);
        if (updatedResponse.success && updatedResponse.data) {
          setKycData(updatedResponse.data);
        }
      } else {
        toast.error(response.error || 'Failed to disable KYC');
      }
    } catch (error: any) {
      console.error('Error disabling KYC:', error);
      toast.error(error?.response?.data?.error || 'Failed to disable KYC');
    } finally {
      setDisablingKyc(false);
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'provisional':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Helper function to get ID type display name
  const getIdTypeDisplayName = (idType: string) => {
    const typeMap: { [key: string]: string } = {
      'bvn': 'BVN',
      'national_id': 'National ID',
      'passport': 'Passport',
      'drivers_license': "Driver's License",
      'nin': 'NIN',
      'nin_slip': 'NIN Slip',
      'voter_id': 'Voter ID'
    };
    return typeMap[idType] || idType;
  };

  if (loading) {
    return (
      <div className="w-full bg-white space-y-6 p-4 rounded">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#35297F]" />
          <span className="ml-2 text-gray-600">Loading KYC details...</span>
        </div>
      </div>
    );
  }

  if (!kycData) {
    return (
      <div className="w-full bg-white space-y-6 p-4 rounded">
        <div className="flex items-center justify-center py-12">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <span className="ml-2 text-gray-600">KYC details not found</span>
        </div>
      </div>
    );
  }

  const { kyc, user } = kycData;
  const canApprove = kyc.status === 'PENDING' || kyc.status === 'REJECTED' || kyc.status === 'PROVISIONAL';
  const canDecline = kyc.status === 'PENDING' || kyc.status === 'PROVISIONAL';
  const isBvnVerification = kyc.frontendIdType === 'bvn' || kyc.idType === 'BVN';
  const canApproveBvn = isBvnVerification && (kyc.status === 'PENDING' || kyc.status === 'REJECTED' || kyc.status === 'PROVISIONAL');

  return (
    <div className="w-full bg-white space-y-6 p-4 rounded">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/kyc')}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to KYC Review
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">KYC Details</h1>
            <p className="text-gray-600 mt-1">Review and manage KYC submission</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user.bvn && (
            <Button
              variant="success"
              onClick={handleVerifyBvn}
              disabled={verifyingBvn}
              size="sm"
            >
              {verifyingBvn ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                'Verify BVN'
              )}
            </Button>
          )}
          {user.bvn && user.bvnVerified && (
            <Button
              variant="warning"
              onClick={handleDisableBvn}
              disabled={disablingBvn}
              size="sm"
            >
              {disablingBvn ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                'Disable BVN'
              )}
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={handleDisableKyc}
            disabled={disablingKyc}
            size="sm"
          >
            {disablingKyc ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              'Disable KYC'
            )}
          </Button>
          <div className={`px-4 py-2 rounded-lg border font-medium ${getStatusColor(kyc.status)}`}>
            {kyc.status}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              User Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-500">Full Name</Label>
                <p className="text-base font-medium">{user.firstname} {user.lastname}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Email</Label>
                <p className="text-base font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Phone Number</Label>
                <p className="text-base font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {user.phonenumber}
                </p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">KYC Level</Label>
                <p className="text-base font-medium">Level {user.kycLevel}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">KYC Status</Label>
                <p className="text-base font-medium">{user.kycStatus}</p>
              </div>
              {user.bvn && (
                <div>
                  <Label className="text-sm text-gray-500">BVN</Label>
                  <p className="text-base font-mono font-medium">
                    {user.bvn}
                    {user.bvnVerified !== undefined && (
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                        user.bvnVerified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.bvnVerified ? 'Verified' : 'Not Verified'}
                      </span>
                    )}
                  </p>
                </div>
              )}
              <div>
                <Label className="text-sm text-gray-500">Account Created</Label>
                <p className="text-base font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(user.createdAt)}
                </p>
              </div>
            </div>
          </Card>

          {/* Document Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Document Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-500">ID Type</Label>
                <p className="text-base font-medium">
                  {kyc.frontendIdType || kyc.idType ? getIdTypeDisplayName(kyc.frontendIdType || kyc.idType) : 'N/A'}
                </p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">ID Number</Label>
                <p className="text-base font-mono font-medium">
                  {kyc.idNumber || 'N/A'}
                </p>
              </div>
              {kyc.fullName && (
                <div>
                  <Label className="text-sm text-gray-500">Name on Document</Label>
                  <p className="text-base font-medium">{kyc.fullName}</p>
                </div>
              )}
              {kyc.dateOfBirth && (
                <div>
                  <Label className="text-sm text-gray-500">Date of Birth</Label>
                  <p className="text-base font-medium">{kyc.dateOfBirth}</p>
                </div>
              )}
              {kyc.gender && (
                <div>
                  <Label className="text-sm text-gray-500">Gender</Label>
                  <p className="text-base font-medium">{kyc.gender}</p>
                </div>
              )}
              {kyc.country && (
                <div>
                  <Label className="text-sm text-gray-500">Country</Label>
                  <p className="text-base font-medium">{kyc.country}</p>
                </div>
              )}
              {kyc.documentExpiryDate && (
                <div>
                  <Label className="text-sm text-gray-500">Document Expiry Date</Label>
                  <p className="text-base font-medium">{kyc.documentExpiryDate}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Verification Details */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Verification Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-500">Verification Date</Label>
                <p className="text-base font-medium">{formatDate(kyc.verificationDate)}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Submitted Date</Label>
                <p className="text-base font-medium">{formatDate(kyc.createdAt)}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Last Updated</Label>
                <p className="text-base font-medium">{formatDate(kyc.lastUpdated)}</p>
              </div>
              {kyc.confidenceValue && (
                <div>
                  <Label className="text-sm text-gray-500">Confidence Score</Label>
                  <p className="text-base font-medium">{kyc.confidenceValue}</p>
                </div>
              )}
              {kyc.resultCode && (
                <div>
                  <Label className="text-sm text-gray-500">Result Code</Label>
                  <p className="text-base font-medium">{kyc.resultCode}</p>
                </div>
              )}
              {kyc.resultText && (
                <div className="md:col-span-2">
                  <Label className="text-sm text-gray-500">Result Text</Label>
                  <p className="text-base font-medium">{kyc.resultText}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Images */}
          {kyc.imageLinks && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Submitted Images
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {kyc.imageLinks.selfie_image && (
                  <div>
                    <Label className="text-sm text-gray-500 mb-2 block">Selfie Image</Label>
                    <div className="border rounded-lg overflow-hidden">
                      <img
                        src={kyc.imageLinks.selfie_image}
                        alt="Selfie"
                        className="w-full h-auto object-contain max-h-96"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                    </div>
                  </div>
                )}
                {kyc.imageLinks.document_image && (
                  <div>
                    <Label className="text-sm text-gray-500 mb-2 block">Document Image</Label>
                    <div className="border rounded-lg overflow-hidden">
                      <img
                        src={kyc.imageLinks.document_image}
                        alt="Document"
                        className="w-full h-auto object-contain max-h-96"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                    </div>
                  </div>
                )}
                {kyc.imageLinks.cropped_image && (
                  <div>
                    <Label className="text-sm text-gray-500 mb-2 block">Cropped Document Image</Label>
                    <div className="border rounded-lg overflow-hidden">
                      <img
                        src={kyc.imageLinks.cropped_image}
                        alt="Cropped Document"
                        className="w-full h-auto object-contain max-h-96"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                    </div>
                  </div>
                )}
                {kyc.imageLinks.liveness_images && kyc.imageLinks.liveness_images.length > 0 && (
                  <div className="md:col-span-2">
                    <Label className="text-sm text-gray-500 mb-2 block">Liveness Images ({kyc.imageLinks.liveness_images.length})</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {kyc.imageLinks.liveness_images.map((img, index) => (
                        <div key={index} className="border rounded-lg overflow-hidden">
                          <img
                            src={img}
                            alt={`Liveness ${index + 1}`}
                            className="w-full h-auto object-contain max-h-48"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          {/* BVN Approval Form (only for BVN verifications) */}
          {canApproveBvn && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Approve BVN
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bvnNumber">BVN *</Label>
                  <Input
                    id="bvnNumber"
                    value={bvnNumber}
                    onChange={(e) => setBvnNumber(e.target.value)}
                    placeholder="Enter BVN number"
                    className="mt-1"
                  />
                </div>
                <Button
                  variant="success"
                  onClick={handleApproveBvn}
                  disabled={approvingBvn || !bvnNumber.trim()}
                  className="w-full"
                >
                  {approvingBvn ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve BVN
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}

          {/* Approval Form (for non-BVN verifications) */}
          {canApprove && !isBvnVerification && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Approve KYC
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="idType">ID Type *</Label>
                  <select
                    id="idType"
                    value={idType}
                    onChange={(e) => setIdType(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#35297F]"
                  >
                    <option value="">Select ID Type</option>
                    <option value="bvn">BVN</option>
                    <option value="national_id">National ID</option>
                    <option value="passport">Passport</option>
                    <option value="drivers_license">Driver's License</option>
                    <option value="nin">NIN</option>
                    <option value="nin_slip">NIN Slip</option>
                    <option value="voter_id">Voter ID</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="idNumber">ID Number *</Label>
                  <Input
                    id="idNumber"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder="Enter ID number"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="fullName">Full Name (Optional)</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name"
                    className="mt-1"
                  />
                </div>
                <Button
                  variant="success"
                  onClick={handleApprove}
                  disabled={approving || !idType || !idNumber}
                  className="w-full"
                >
                  {approving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve KYC
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}

          {/* Decline Form */}
          {canDecline && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                Decline KYC
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="rejectionReason">Rejection Reason *</Label>
                  <textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection"
                    rows={4}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4444] resize-none"
                  />
                </div>
                <Button
                  variant="destructive"
                  onClick={handleDecline}
                  disabled={declining || !rejectionReason.trim()}
                  className="w-full"
                >
                  {declining ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Declining...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Decline KYC
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}

          {/* Status Info */}
          {!canApprove && !canDecline && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Status Information</h2>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  This KYC submission has been {kyc.status.toLowerCase()}.
                </p>
                {kyc.status === 'APPROVED' && (
                  <p className="text-sm text-green-600 font-medium">
                    ✓ User's KYC has been approved and upgraded.
                  </p>
                )}
                {kyc.status === 'REJECTED' && (
                  <p className="text-sm text-red-600 font-medium">
                    ✗ This KYC submission has been rejected.
                  </p>
                )}
              </div>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
