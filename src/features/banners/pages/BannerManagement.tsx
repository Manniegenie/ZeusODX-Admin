import { useContext, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { DashboardTitleContext } from '@/layouts/DashboardTitleContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Filter, Plus, RefreshCw, ChevronLeft, ChevronRight, Edit, Trash2, ToggleLeft, ToggleRight, AlertCircle, Image as ImageIcon, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { BannerService } from '../services/bannerService';
import type { Banner, FilterParams, CreateBannerRequest, UpdateBannerRequest } from '../types/banner';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export function BannerManagement() {
  const titleCtx = useContext(DashboardTitleContext);
  const [loading, setLoading] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [totalBanners, setTotalBanners] = useState(0);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterParams>({
    isActive: undefined,
    page: 1,
    limit: 10,
    sortBy: 'priority',
    sortOrder: 'desc'
  });

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);

  // Form states
  const [formData, setFormData] = useState<CreateBannerRequest>({
    title: '',
    imageUrl: '',
    link: '',
    priority: 0,
    isActive: true
  });

  // Set page title
  useEffect(() => {
    titleCtx?.setTitle('Banners');
  }, [titleCtx]);

  // Load banners
  const loadBanners = async (params: FilterParams = filters) => {
    try {
      setLoading(true);
      const response = await BannerService.getBanners(params);

      if (response.success) {
        setBanners(response.data.banners);
        setTotalBanners(response.data.pagination.totalItems);
        setCurrentPage(response.data.pagination.currentPage);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        toast.error('Failed to load banners');
      }
    } catch (error) {
      console.error('Error loading banners:', error);
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadBanners();
  }, []);

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterParams, value: string | boolean | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    const newFilters = { ...filters, page: 1 };
    setFilters(newFilters);
    loadBanners(newFilters);
  };

  // Clear filters
  const clearFilters = () => {
    const clearedFilters: FilterParams = {
      isActive: undefined,
      page: 1,
      limit: 10,
      sortBy: 'priority',
      sortOrder: 'desc'
    };
    setFilters(clearedFilters);
    loadBanners(clearedFilters);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    loadBanners(newFilters);
  };

  // Handle create banner
  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.imageUrl.trim()) {
      toast.error('Title and Image URL are required');
      return;
    }

    try {
      setLoading(true);
      const response = await BannerService.createBanner(formData);

      if (response.success) {
        toast.success('Banner created successfully');
        setShowCreateDialog(false);
        resetForm();
        loadBanners();
      }
    } catch (error: any) {
      console.error('Error creating banner:', error);
      toast.error(error.response?.data?.message || 'Failed to create banner');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit banner
  const handleEdit = (banner: Banner) => {
    setSelectedBanner(banner);
    setFormData({
      title: banner.title,
      imageUrl: banner.imageUrl,
      link: banner.link || '',
      priority: banner.priority,
      isActive: banner.isActive
    });
    setShowEditDialog(true);
  };

  // Handle update banner
  const handleUpdate = async () => {
    if (!selectedBanner) return;

    if (!formData.title.trim() || !formData.imageUrl.trim()) {
      toast.error('Title and Image URL are required');
      return;
    }

    try {
      setLoading(true);
      const updateData: UpdateBannerRequest = {
        title: formData.title,
        imageUrl: formData.imageUrl,
        link: formData.link,
        priority: formData.priority,
        isActive: formData.isActive
      };

      const response = await BannerService.updateBanner(selectedBanner.id, updateData);

      if (response.success) {
        toast.success('Banner updated successfully');
        setShowEditDialog(false);
        resetForm();
        setSelectedBanner(null);
        loadBanners();
      }
    } catch (error: any) {
      console.error('Error updating banner:', error);
      toast.error(error.response?.data?.message || 'Failed to update banner');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete banner
  const handleDelete = async (banner: Banner) => {
    if (!confirm(`Are you sure you want to delete the banner "${banner.title}"?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await BannerService.deleteBanner(banner.id);

      if (response.success) {
        toast.success('Banner deleted successfully');
        loadBanners();
      }
    } catch (error: any) {
      console.error('Error deleting banner:', error);
      toast.error(error.response?.data?.message || 'Failed to delete banner');
    } finally {
      setLoading(false);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (banner: Banner) => {
    try {
      setLoading(true);
      const response = await BannerService.toggleBannerStatus(banner.id);

      if (response.success) {
        toast.success(`Banner ${response.data.isActive ? 'activated' : 'deactivated'} successfully`);
        loadBanners();
      }
    } catch (error: any) {
      console.error('Error toggling banner status:', error);
      toast.error(error.response?.data?.message || 'Failed to toggle banner status');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      imageUrl: '',
      link: '',
      priority: 0,
      isActive: true
    });
  };

  // Count active filters
  const activeFilterCount = [filters.isActive !== undefined ? 'active' : ''].filter(Boolean).length;

  return (
    <div className="w-full bg-white space-y-6 p-4 rounded" style={{ color: '#1A1A1A' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>Banners</h1>
          <p style={{ color: '#4B5563' }} className="mt-1">
            Manage promotional banners for the app ({totalBanners} total, max 4 allowed)
          </p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2"
          disabled={totalBanners >= 4}
        >
          <Plus className="w-4 h-4" />
          Add New Banner
        </Button>
      </div>

      {/* Banner Limit Warning */}
      {totalBanners >= 4 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <p className="text-sm" style={{ color: '#92400E' }}>
            Maximum banner limit reached (4 banners). Delete an existing banner to add a new one.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="w-full">
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters ? 'bg-purple-50 border-purple-500 text-purple-700' : 'border-gray-300 hover:bg-gray-50'
            }`}
            style={{ color: showFilters ? '#7C3AED' : '#374151' }}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-red-600 hover:bg-red-50 border border-red-300 rounded-lg transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Status</label>
                <Select
                  value={filters.isActive === undefined ? '' : filters.isActive.toString()}
                  onValueChange={(value) => handleFilterChange('isActive', value === '' ? undefined : value === 'true')}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Sort By</label>
                <Select
                  value={filters.sortBy || 'priority'}
                  onValueChange={(value) => handleFilterChange('sortBy', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="createdAt">Created Date</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Sort Order</label>
                <Select
                  value={filters.sortOrder || 'desc'}
                  onValueChange={(value) => handleFilterChange('sortOrder', value as 'asc' | 'desc')}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sort order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button onClick={applyFilters} className="bg-purple-600 text-white hover:bg-purple-700">
                Apply Filters
              </Button>
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      <Card className="w-full bg-white rounded">
        <div className="p-4">
          {/* Table Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm" style={{ color: '#4B5563' }}>
              Showing {banners.length > 0 ? ((currentPage - 1) * (filters.limit || 10)) + 1 : 0} to {Math.min(currentPage * (filters.limit || 10), totalBanners)} of {totalBanners} banners
            </div>
            <Button
              onClick={() => loadBanners()}
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              <span className="ml-2" style={{ color: '#4B5563' }}>Loading banners...</span>
            </div>
          ) : banners.length === 0 ? (
            <div className="text-center py-8">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2" style={{ color: '#111827' }}>No banners found</h3>
              <p style={{ color: '#4B5563' }}>Add a new banner to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" style={{ color: '#1A1A1A' }}>
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left p-3 font-semibold" style={{ color: '#111827' }}>Priority</th>
                    <th className="text-left p-3 font-semibold" style={{ color: '#111827' }}>Preview</th>
                    <th className="text-left p-3 font-semibold" style={{ color: '#111827' }}>Title</th>
                    <th className="text-left p-3 font-semibold" style={{ color: '#111827' }}>Link</th>
                    <th className="text-left p-3 font-semibold" style={{ color: '#111827' }}>Status</th>
                    <th className="text-left p-3 font-semibold" style={{ color: '#111827' }}>Created</th>
                    <th className="text-left p-3 font-semibold" style={{ color: '#111827' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {banners.map((banner) => (
                    <tr key={banner.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-gray-400" />
                          <span className="font-medium" style={{ color: '#111827' }}>{banner.priority}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="w-20 h-12 rounded overflow-hidden bg-gray-100">
                          {banner.imageUrl ? (
                            <img
                              src={banner.imageUrl}
                              alt={banner.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="48" viewBox="0 0 80 48"><rect fill="%23e5e7eb" width="80" height="48"/><text fill="%239ca3af" font-size="10" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">No Image</text></svg>';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-medium" style={{ color: '#111827' }}>{banner.title}</span>
                      </td>
                      <td className="p-3">
                        {banner.link ? (
                          <span className="text-sm" style={{ color: '#6B7280' }}>{banner.link}</span>
                        ) : (
                          <span style={{ color: '#9CA3AF' }}>No link</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {banner.isActive ? (
                            <ToggleRight className="w-5 h-5 text-green-500" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-gray-400" />
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            banner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {banner.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-sm" style={{ color: '#6B7280' }}>
                          {formatDate(banner.createdAt)}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleEdit(banner)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleStatus(banner)}
                            className="flex items-center gap-1"
                          >
                            {banner.isActive ? (
                              <>
                                <ToggleLeft className="h-4 w-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <ToggleRight className="h-4 w-4" />
                                Activate
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(banner)}
                            className="flex items-center gap-1"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {banners.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm" style={{ color: '#4B5563' }}>
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Create Banner Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ color: '#111827' }}>Create New Banner</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label style={{ color: '#374151' }}>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Enter banner title"
              />
            </div>

            <div>
              <Label style={{ color: '#374151' }}>Image URL *</Label>
              <Input
                value={formData.imageUrl}
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                placeholder="https://example.com/image.jpg"
              />
              {formData.imageUrl && (
                <div className="mt-2 w-full h-32 rounded overflow-hidden bg-gray-100">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <Label style={{ color: '#374151' }}>Link (optional)</Label>
              <Input
                value={formData.link}
                onChange={(e) => setFormData({...formData, link: e.target.value})}
                placeholder="e.g., /user/Swap or https://..."
              />
              <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                Internal path (e.g., /user/Swap) or external URL
              </p>
            </div>

            <div>
              <Label style={{ color: '#374151' }}>Priority</Label>
              <Input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value) || 0})}
                placeholder="0"
              />
              <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                Higher numbers show first
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="w-4 h-4 rounded border-gray-300"
              />
              <Label htmlFor="isActive" style={{ color: '#374151' }}>Active (visible to users)</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreateDialog(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={loading || !formData.title.trim() || !formData.imageUrl.trim()}>
              Create Banner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Banner Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ color: '#111827' }}>Edit Banner</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label style={{ color: '#374151' }}>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Enter banner title"
              />
            </div>

            <div>
              <Label style={{ color: '#374151' }}>Image URL *</Label>
              <Input
                value={formData.imageUrl}
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                placeholder="https://example.com/image.jpg"
              />
              {formData.imageUrl && (
                <div className="mt-2 w-full h-32 rounded overflow-hidden bg-gray-100">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <Label style={{ color: '#374151' }}>Link (optional)</Label>
              <Input
                value={formData.link}
                onChange={(e) => setFormData({...formData, link: e.target.value})}
                placeholder="e.g., /user/Swap or https://..."
              />
            </div>

            <div>
              <Label style={{ color: '#374151' }}>Priority</Label>
              <Input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value) || 0})}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="editIsActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="w-4 h-4 rounded border-gray-300"
              />
              <Label htmlFor="editIsActive" style={{ color: '#374151' }}>Active (visible to users)</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEditDialog(false); resetForm(); setSelectedBanner(null); }}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={loading || !formData.title.trim() || !formData.imageUrl.trim()}>
              Update Banner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
