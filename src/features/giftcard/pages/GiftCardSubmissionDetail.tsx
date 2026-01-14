import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, XCircle, Eye, Clock, User, CreditCard, DollarSign, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardTitleContext } from '@/layouts/DashboardTitleContext';
import { GiftCardService } from '../services/giftcardService';
import type { GiftCardSubmission, RejectionReason } from '../types/giftcard';
import { SuccessModal } from '@/components/ui/SuccessModal';

// Helper function to format time ago
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMonths > 0) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  if (diffWeeks > 0) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  return 'just now';
};

const REJECTION_REASONS: { value: RejectionReason; label: string }[] = [
  { value: 'INVALID_IMAGE', label: 'Invalid or Unclear Image' },
  { value: 'ALREADY_USED', label: 'Card Already Used' },
  { value: 'INSUFFICIENT_BALANCE', label: 'Insufficient Balance' },
  { value: 'FAKE_CARD', label: 'Fake/Counterfeit Card' },
  { value: 'UNREADABLE', label: 'Unreadable Card Details' },
  { value: 'WRONG_TYPE', label: 'Wrong Card Type' },
  { value: 'EXPIRED', label: 'Expired Card' },
  { value: 'INVALID_ECODE', label: 'Invalid E-Code' },
  { value: 'DUPLICATE_ECODE', label: 'Duplicate E-Code' },
  { value: 'OTHER', label: 'Other Reason' },
];

export function GiftCardSubmissionDetail() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const titleCtx = useContext(DashboardTitleContext);

  const [loading, setLoading] = useState(false);
  const [submission, setSubmission] = useState<GiftCardSubmission | null>(
    location.state?.submission || null
  );

  // Dialog states
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');

  // Approval form
  const [approvedValue, setApprovedValue] = useState(0);
  const [paymentRate, setPaymentRate] = useState(0);
  const [approvalNotes, setApprovalNotes] = useState('');

  // Rejection form
  const [rejectionReason, setRejectionReason] = useState<RejectionReason>('OTHER');
  const [rejectionNotes, setRejectionNotes] = useState('');

  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalData, setSuccessModalData] = useState({
    title: '',
    message: '',
  });

  // Set page title
  useEffect(() => {
    titleCtx?.setTitle('Gift Card Submission Detail');
  }, [titleCtx]);

  // Load submission if not in state
  useEffect(() => {
    if (!submission && submissionId) {
      loadSubmission();
    }
  }, [submissionId, submission]);

  // Initialize approval values when submission loads
  useEffect(() => {
    if (submission) {
      setApprovedValue(submission.cardValue);
      setPaymentRate(submission.expectedRate);
    }
  }, [submission]);

  const loadSubmission = async () => {
    if (!submissionId) return;

    try {
      setLoading(true);
      const response = await GiftCardService.getSubmissionById(submissionId);

      if (response.success) {
        setSubmission(response.data);
      } else {
        toast.error('Failed to load submission');
        navigate('/giftcards/submissions');
      }
    } catch (error: any) {
      console.error('Error loading submission:', error);
      toast.error(error.response?.data?.message || 'Failed to load submission');
      navigate('/giftcards/submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReviewing = async () => {
    if (!submissionId) return;

    try {
      setLoading(true);
      const response = await GiftCardService.markAsReviewing(submissionId);

      if (response.success) {
        toast.success('Submission marked as reviewing');
        await loadSubmission();
      }
    } catch (error: any) {
      console.error('Error marking as reviewing:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!submissionId) return;

    if (approvedValue <= 0) {
      toast.error('Approved value must be greater than 0');
      return;
    }

    if (paymentRate <= 0) {
      toast.error('Payment rate must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      const response = await GiftCardService.approveSubmission(submissionId, {
        approvedValue,
        paymentRate,
        notes: approvalNotes
      });

      if (response.success) {
        setShowApproveDialog(false);
        setSuccessModalData({
          title: 'Submission Approved',
          message: `Successfully approved submission and credited user with ₦${response.data.paymentAmount.toLocaleString()}`,
        });
        setShowSuccessModal(true);
        await loadSubmission();
      }
    } catch (error: any) {
      console.error('Error approving submission:', error);
      toast.error(error.response?.data?.message || 'Failed to approve submission');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!submissionId) return;

    if (!rejectionNotes.trim() && rejectionReason === 'OTHER') {
      toast.error('Please provide rejection notes for "Other" reason');
      return;
    }

    try {
      setLoading(true);
      const response = await GiftCardService.rejectSubmission(submissionId, {
        rejectionReason,
        notes: rejectionNotes
      });

      if (response.success) {
        setShowRejectDialog(false);
        setSuccessModalData({
          title: 'Submission Rejected',
          message: 'The gift card submission has been rejected and the user has been notified.',
        });
        setShowSuccessModal(true);
        await loadSubmission();
      }
    } catch (error: any) {
      console.error('Error rejecting submission:', error);
      toast.error(error.response?.data?.message || 'Failed to reject submission');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      REVIEWING: 'bg-blue-100 text-blue-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      PAID: 'bg-emerald-100 text-emerald-800',
    };
    return <Badge className={variants[status] || variants.PENDING}>{status}</Badge>;
  };

  const calculatedPaymentAmount = approvedValue * paymentRate;

  if (!submission) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading submission...</p>
          </div>
        </div>
      </div>
    );
  }

  const canApprove = submission.status === 'PENDING' || submission.status === 'REVIEWING';
  const canReject = submission.status === 'PENDING' || submission.status === 'REVIEWING';
  const canMarkReviewing = submission.status === 'PENDING';

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/giftcards/submissions')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Submission Detail</h1>
            <p className="text-muted-foreground">
              Review and process gift card submission
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(submission.status)}
        </div>
      </div>

      {/* Action Buttons */}
      {(canApprove || canReject || canMarkReviewing) && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">Quick Actions</h3>
                <p className="text-sm text-blue-700">Review and process this submission</p>
              </div>
              <div className="flex gap-2">
                {canMarkReviewing && (
                  <Button
                    variant="outline"
                    onClick={handleMarkReviewing}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    Mark as Reviewing
                  </Button>
                )}
                {canApprove && (
                  <Button
                    onClick={() => setShowApproveDialog(true)}
                    disabled={loading}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </Button>
                )}
                {canReject && (
                  <Button
                    onClick={() => setShowRejectDialog(true)}
                    disabled={loading}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-black"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(() => {
              // Handle both formats: user field from list API or populated userId from detail API
              const user = submission.user || (typeof submission.userId === 'object' ? submission.userId : null);
              return (
                <>
                  <div>
                    <Label className="text-gray-500">Name</Label>
                    <div className="font-medium">
                      {user
                        ? `${user.firstname || 'N/A'} ${user.lastname || ''}`
                        : 'User data unavailable'}
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-500">Email</Label>
                    <div className="font-medium text-sm">
                      {user ? user.email || 'N/A' : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-500">Phone</Label>
                    <div className="font-medium">
                      {user ? user.phonenumber || 'N/A' : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-500">User ID</Label>
                    <div className="font-mono text-xs text-gray-600">
                      {user ? user._id || 'N/A' : 'N/A'}
                    </div>
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>

        {/* Card Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Card Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-gray-500">Card Type</Label>
              <div className="font-medium">{submission.cardType}</div>
            </div>
            <div>
              <Label className="text-gray-500">Format</Label>
              <div className="font-medium">{submission.cardFormat}</div>
            </div>
            <div>
              <Label className="text-gray-500">Country</Label>
              <div className="font-medium">{submission.country}</div>
            </div>
            {submission.vanillaType && (
              <div>
                <Label className="text-gray-500">Vanilla Type</Label>
                <div className="font-medium">{submission.vanillaType}</div>
              </div>
            )}
            <div>
              <Label className="text-gray-500">Card Value</Label>
              <div className="font-medium">
                {submission.currency} {submission.cardValue.toLocaleString()}
              </div>
            </div>
            {submission.eCode && (
              <div>
                <Label className="text-gray-500">E-Code</Label>
                <div className="font-mono text-sm bg-gray-100 p-2 rounded break-all">
                  {submission.eCode}
                </div>
              </div>
            )}
            {submission.cardRange && (
              <div>
                <Label className="text-gray-500">Card Range</Label>
                <div className="font-medium">{submission.cardRange}</div>
              </div>
            )}
            {submission.description && (
              <div>
                <Label className="text-gray-500">Description</Label>
                <div className="text-sm">{submission.description}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-gray-500">Expected Rate</Label>
              <div className="font-medium">{submission.expectedRateDisplay}</div>
            </div>
            <div>
              <Label className="text-gray-500">Expected Amount</Label>
              <div className="font-medium text-lg">
                ₦{submission.expectedAmountToReceive.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
            </div>
            {submission.approvedValue && (
              <>
                <div>
                  <Label className="text-gray-500">Approved Value</Label>
                  <div className="font-medium">
                    {submission.currency} {submission.approvedValue.toLocaleString()}
                  </div>
                </div>
                <div>
                  <Label className="text-gray-500">Payment Rate</Label>
                  <div className="font-medium">₦{submission.paymentRate}</div>
                </div>
                <div>
                  <Label className="text-gray-500">Payment Amount</Label>
                  <div className="font-medium text-lg text-green-600">
                    ₦{submission.paymentAmount?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                </div>
              </>
            )}
            {submission.paidAt && (
              <div>
                <Label className="text-gray-500">Paid At</Label>
                <div className="text-sm">
                  {new Date(submission.paidAt).toLocaleString()}
                </div>
              </div>
            )}
            {submission.transactionId && (
              <div>
                <Label className="text-gray-500">Transaction ID</Label>
                <div className="font-mono text-xs text-gray-600 break-all">
                  {submission.transactionId}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Card Images */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Card Images ({submission.totalImages})
          </CardTitle>
          <CardDescription>
            Click on an image to view in full size
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {submission.imageUrls.map((url, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => {
                  setSelectedImage(url);
                  setShowImageDialog(true);
                }}
              >
                <img
                  src={url}
                  alt={`Card image ${index + 1}`}
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center">
                  <Eye className="w-8 h-8 text-white opacity-0 hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Review Information */}
      {(submission.reviewedAt || submission.reviewNotes || submission.rejectionReason) && (
        <Card>
          <CardHeader>
            <CardTitle>Review Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {submission.reviewedAt && (
              <div>
                <Label className="text-gray-500">Reviewed At</Label>
                <div className="text-sm">
                  {new Date(submission.reviewedAt).toLocaleString()} (
                  {formatTimeAgo(new Date(submission.reviewedAt))})
                </div>
              </div>
            )}
            {submission.reviewedBy && (
              <div>
                <Label className="text-gray-500">Reviewed By</Label>
                <div className="font-medium">{submission.reviewedBy}</div>
              </div>
            )}
            {submission.rejectionReason && (
              <div>
                <Label className="text-gray-500">Rejection Reason</Label>
                <div className="font-medium text-red-600">
                  {REJECTION_REASONS.find(r => r.value === submission.rejectionReason)?.label || submission.rejectionReason}
                </div>
              </div>
            )}
            {submission.reviewNotes && (
              <div>
                <Label className="text-gray-500">Review Notes</Label>
                <div className="text-sm bg-gray-50 p-3 rounded">{submission.reviewNotes}</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Submission Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-500">Submission ID</Label>
              <div className="font-mono text-xs">{submission._id}</div>
            </div>
            <div>
              <Label className="text-gray-500">Created At</Label>
              <div>
                {new Date(submission.createdAt).toLocaleString()} (
                {formatTimeAgo(new Date(submission.createdAt))})
              </div>
            </div>
            {submission.metadata?.submittedAt && (
              <div>
                <Label className="text-gray-500">Submitted At</Label>
                <div>{new Date(submission.metadata.submittedAt).toLocaleString()}</div>
              </div>
            )}
            {submission.metadata?.ipAddress && (
              <div>
                <Label className="text-gray-500">IP Address</Label>
                <div className="font-mono">{submission.metadata.ipAddress}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="max-w-md !bg-white !text-black">
          <DialogHeader>
            <DialogTitle className="text-black">Approve Gift Card Submission</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Approved Card Value ({submission.currency})</Label>
              <Input
                type="number"
                value={approvedValue}
                onChange={(e) => setApprovedValue(parseFloat(e.target.value))}
                placeholder="Enter approved value"
              />
              <p className="text-xs text-gray-500 mt-1">
                Original value: {submission.currency} {submission.cardValue}
              </p>
            </div>

            <div>
              <Label>Payment Rate (₦ per {submission.currency})</Label>
              <Input
                type="number"
                value={paymentRate}
                onChange={(e) => setPaymentRate(parseFloat(e.target.value))}
                placeholder="Enter payment rate"
              />
              <p className="text-xs text-gray-500 mt-1">
                Expected rate: {submission.expectedRateDisplay}
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 p-4 rounded">
              <Label className="text-green-800">User will receive:</Label>
              <div className="text-2xl font-bold text-green-900">
                ₦{calculatedPaymentAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-green-700 mt-1">
                {approvedValue} × ₦{paymentRate} = ₦{calculatedPaymentAmount.toFixed(2)}
              </p>
            </div>

            <div>
              <Label>Notes (Optional)</Label>
              <Textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Add approval notes..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={loading || approvedValue <= 0 || paymentRate <= 0}
              className="bg-green-600 hover:bg-green-700"
            >
              Approve & Fund User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-md !bg-white !text-black">
          <DialogHeader>
            <DialogTitle className="text-black">Reject Gift Card Submission</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Rejection Reason</Label>
              <Select
                value={rejectionReason}
                onValueChange={(value) => setRejectionReason(value as RejectionReason)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REJECTION_REASONS.map(reason => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Rejection Notes {rejectionReason === 'OTHER' && '*'}</Label>
              <Textarea
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                placeholder="Provide details about the rejection..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={loading || (rejectionReason === 'OTHER' && !rejectionNotes.trim())}
              className="bg-red-600 hover:bg-red-700 text-black"
            >
              Reject Submission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Viewer Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Card Image</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center">
            <img
              src={selectedImage}
              alt="Full size card"
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={successModalData.title}
        message={successModalData.message}
        redirectTo="/giftcards/submissions"
        autoRedirectDelay={3000}
        redirectButtonText="Back to Submissions"
      />
    </div>
  );
}
