import { useState, useEffect, useContext, useRef } from 'react';
import { DashboardTitleContext } from '@/layouts/DashboardTitleContext';
import { BlogService } from '../services/blogService';
import type { BlogPost, BlogFormData } from '../types/blog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Globe,
  FileText,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  X,
} from 'lucide-react';

const EMPTY_FORM: BlogFormData = {
  title: '',
  excerpt: '',
  content: '',
  author: '',
  tags: '',
  isPublished: false,
  coverImage: null,
};

export function BlogManagement() {
  const { setTitle } = useContext(DashboardTitleContext);
  useEffect(() => { setTitle('Blog Management'); }, [setTitle]);

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Pagination & filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const LIMIT = 10;

  // Dialogs
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [deletingPost, setDeletingPost] = useState<BlogPost | null>(null);
  const [viewingPost, setViewingPost] = useState<BlogPost | null>(null);

  // Form state
  const [form, setForm] = useState<BlogFormData>(EMPTY_FORM);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: LIMIT };
      if (search) params.search = search;
      if (statusFilter === 'published') params.isPublished = true;
      if (statusFilter === 'draft') params.isPublished = false;

      const res = await BlogService.getPosts(params);
      if (res.success) {
        setPosts(res.data.posts);
        setTotalPages(res.data.pagination.totalPages);
        setTotalItems(res.data.pagination.totalItems);
      }
    } catch {
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page, statusFilter]);

  const handleSearch = () => {
    setPage(1);
    fetchPosts();
  };

  // Open create dialog
  const openCreate = () => {
    setEditingPost(null);
    setForm(EMPTY_FORM);
    setImagePreview(null);
    setIsFormOpen(true);
  };

  // Open edit dialog — fetch full content first
  const openEdit = async (post: BlogPost) => {
    try {
      const res = await BlogService.getPost(post._id);
      const full = res.data;
      setEditingPost(full);
      setForm({
        title: full.title,
        excerpt: full.excerpt ?? '',
        content: full.content ?? '',
        author: full.author,
        tags: full.tags.join(', '),
        isPublished: full.isPublished,
        coverImage: null,
      });
      setImagePreview(full.coverImage ?? null);
      setIsFormOpen(true);
    } catch {
      toast.error('Failed to load post details');
    }
  };

  // Open view dialog
  const openView = async (post: BlogPost) => {
    try {
      const res = await BlogService.getPost(post._id);
      setViewingPost(res.data);
      setIsViewOpen(true);
    } catch {
      toast.error('Failed to load post');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setForm(f => ({ ...f, coverImage: file }));
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setForm(f => ({ ...f, coverImage: null }));
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.content.trim()) { toast.error('Content is required'); return; }
    if (!form.author.trim()) { toast.error('Author is required'); return; }

    setSubmitting(true);
    try {
      if (editingPost) {
        await BlogService.updatePost(editingPost._id, form);
        toast.success('Post updated successfully');
      } else {
        await BlogService.createPost(form);
        toast.success('Post created successfully');
      }
      setIsFormOpen(false);
      fetchPosts();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Failed to save post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    setTogglingId(post._id);
    try {
      const res = await BlogService.togglePublish(post._id);
      toast.success(res.message);
      fetchPosts();
    } catch {
      toast.error('Failed to toggle publish status');
    } finally {
      setTogglingId(null);
    }
  };

  const openDelete = (post: BlogPost) => {
    setDeletingPost(post);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingPost) return;
    setDeletingId(deletingPost._id);
    try {
      await BlogService.deletePost(deletingPost._id);
      toast.success('Post deleted');
      setIsDeleteOpen(false);
      fetchPosts();
    } catch {
      toast.error('Failed to delete post');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">{totalItems} article{totalItems !== 1 ? 's' : ''} total</p>
        </div>
        <Button onClick={openCreate} className="flex items-center gap-1.5 text-sm">
          <Plus className="w-4 h-4" />
          New Article
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex gap-2 flex-1">
          <Input
            placeholder="Search by title or excerpt..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="flex-1 text-sm h-9"
          />
          <Button variant="outline" size="sm" onClick={handleSearch} className="h-9 px-3">
            <Search className="w-4 h-4" />
          </Button>
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as typeof statusFilter); setPage(1); }}>
          <SelectTrigger className="w-36 h-9 text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Article</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Author</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Tags</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Date</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">Loading...</td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">No articles found</td>
              </tr>
            ) : (
              posts.map(post => (
                <tr key={post._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {post.coverImage ? (
                        <img src={post.coverImage} alt="" className="w-10 h-10 rounded object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center shrink-0">
                          <ImageIcon className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate max-w-[200px]">{post.title}</p>
                        {post.excerpt && (
                          <p className="text-xs text-gray-400 truncate max-w-[200px]">{post.excerpt}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{post.author}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {post.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">{tag}</span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="text-xs text-gray-400">+{post.tags.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell whitespace-nowrap">
                    {formatDate(post.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleTogglePublish(post)}
                      disabled={togglingId === post._id}
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full transition-colors ${
                        post.isPublished
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {post.isPublished ? (
                        <><Globe className="w-3 h-3" />Published</>
                      ) : (
                        <><FileText className="w-3 h-3" />Draft</>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openView(post)}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(post)}
                        className="p-1.5 rounded hover:bg-blue-50 text-gray-500 hover:text-blue-600"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDelete(post)}
                        className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page <= 1} className="h-8 px-2">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages} className="h-8 px-2">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? 'Edit Article' : 'New Article'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Cover Image */}
            <div className="space-y-1.5">
              <Label>Cover Image</Label>
              {imagePreview ? (
                <div className="relative w-full h-44 rounded-lg overflow-hidden border border-gray-200">
                  <img src={imagePreview} alt="Cover" className="w-full h-full object-cover" />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors"
                >
                  <ImageIcon className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-sm text-gray-400">Click to upload cover image</span>
                  <span className="text-xs text-gray-300 mt-0.5">PNG, JPG up to 5MB</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Article title"
                  className="text-sm"
                />
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Input
                  id="excerpt"
                  value={form.excerpt}
                  onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                  placeholder="Short description..."
                  className="text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="author">Author <span className="text-red-500">*</span></Label>
                <Input
                  id="author"
                  value={form.author}
                  onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                  placeholder="Author name"
                  className="text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="crypto, news, defi"
                  className="text-sm"
                />
                <p className="text-xs text-gray-400">Comma-separated</p>
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="content">Content <span className="text-red-500">*</span></Label>
                <textarea
                  id="content"
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="Write your article content here..."
                  rows={10}
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
                />
              </div>

              <div className="col-span-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={form.isPublished}
                  onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 accent-primary cursor-pointer"
                />
                <Label htmlFor="isPublished" className="cursor-pointer">Publish immediately</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Saving...' : editingPost ? 'Update Article' : 'Create Article'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Article</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete <span className="font-semibold">"{deletingPost?.title}"</span>? This will also remove its cover image from storage. This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={!!deletingId}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={!!deletingId}>
              {deletingId ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="pr-6">{viewingPost?.title}</DialogTitle>
          </DialogHeader>
          {viewingPost && (
            <div className="space-y-4">
              {viewingPost.coverImage && (
                <img src={viewingPost.coverImage} alt="Cover" className="w-full h-52 object-cover rounded-lg" />
              )}
              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                <span>By <strong>{viewingPost.author}</strong></span>
                <span>·</span>
                <span>{formatDate(viewingPost.createdAt)}</span>
                <span>·</span>
                <span>{viewingPost.views} views</span>
                <span>·</span>
                <span className={viewingPost.isPublished ? 'text-green-600 font-medium' : 'text-gray-400'}>
                  {viewingPost.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
              {viewingPost.excerpt && (
                <p className="text-sm text-gray-600 italic border-l-4 border-gray-200 pl-3">{viewingPost.excerpt}</p>
              )}
              {viewingPost.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {viewingPost.tags.map(tag => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">{tag}</span>
                  ))}
                </div>
              )}
              <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {viewingPost.content}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
            {viewingPost && (
              <Button onClick={() => { setIsViewOpen(false); openEdit(viewingPost); }}>Edit</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
