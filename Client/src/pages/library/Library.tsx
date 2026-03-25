import { format } from 'date-fns';
import {
  Award,
  Beaker,
  BookOpen,
  Camera,
  ChevronDown,
  Clock,
  Download,
  Eye,
  File,
  FileJson,
  FileText,
  Filter,
  Folder,
  Grid,
  HardDrive,
  Image as ImageIcon,
  List,
  Search,
  Star,
  Trash2,
  Upload,
  Video,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserFromStorage } from '../../helper/cryptoUser';

// Types based on CRM workflow
export interface LibraryItem {
  id: number;
  title: string;
  description: string;
  category: 'photos' | 'tools' | 'lab_reports' | 'training' | 'best_practices';
  type: 'image' | 'document' | 'video' | 'pdf' | 'archive';
  url: string;
  thumbnail?: string;
  size: number;
  uploadedBy: {
    id: number;
    name: string;
    role: 'manager' | 'student';
    avatar?: string;
  };
  uploadedAt: string;
  activityId?: number; // Link to original activity for photos
  activityTitle?: string;
  tags: string[];
  downloads: number;
  views: number;
  isStarred?: boolean; // For best practices
  starredBy?: {
    id: number;
    name: string;
    date: string;
  };
  metadata?: {
    occasion?: string;
    samplingType?: string;
    productSampled?: string;
    location?: string;
    participants?: number;
  };
}

export interface LibraryCategory {
  id: string;
  name: string;
  icon: any;
  color: string;
  description: string;
  managerOnly: boolean;
}

export default function Library() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [imgErrors, setImgErrors] = useState<{[key: number]: boolean}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<string>('photos');
  
  const userData = getUserFromStorage();
  const isManager = userData?.role === 'manager';

  // Library Categories based on CRM
  const categories: LibraryCategory[] = [
    {
      id: 'photos',
      name: 'Activity Photos',
      icon: Camera,
      color: '#4f3fe0',
      description: 'Photos captured during sampling and activation activities',
      managerOnly: false
    },
    {
      id: 'tools',
      name: 'Marketing Tools',
      icon: HardDrive,
      color: '#10b981',
      description: 'Tools, brochures, and marketing collateral used by teams',
      managerOnly: true
    },
    {
      id: 'lab_reports',
      name: 'Lab Reports',
      icon: Beaker,
      color: '#f59e0b',
      description: 'Product testing reports and quality analysis documents',
      managerOnly: true
    },
    {
      id: 'training',
      name: 'Trainings',
      icon: BookOpen,
      color: '#ef4444',
      description: 'Training materials, decks, and educational content',
      managerOnly: true
    },
    {
      id: 'best_practices',
      name: 'Best Practices',
      icon: Award,
      color: '#8b5cf6',
      description: 'Starred activities and exemplary work samples',
      managerOnly: false
    }
  ];

  // Mock data - Replace with actual API calls
  const [items, setItems] = useState<LibraryItem[]>([
    // Activity Photos
    {
      id: 1,
      title: 'College Fest Sampling - March 2026',
      description: 'Students sampling Cool Mint at annual tech fest',
      category: 'photos',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400',
      size: 3200000,
      uploadedBy: {
        id: 101,
        name: 'John Doe',
        role: 'student',
      },
      uploadedAt: '2026-03-15T10:30:00',
      activityId: 1001,
      activityTitle: 'Tech Fest Sampling Drive',
      tags: ['fest', 'sampling', 'college'],
      downloads: 45,
      views: 234,
      metadata: {
        occasion: 'Sports',
        samplingType: '1-on-1 Sampling',
        productSampled: 'Cool Mint',
        location: 'Engineering College',
        participants: 150
      }
    },
    {
      id: 2,
      title: 'Sports Day Activation',
      description: 'Rage Bull sampling at university sports complex',
      category: 'photos',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400',
      size: 2800000,
      uploadedBy: {
        id: 102,
        name: 'Jane Smith',
        role: 'student',
      },
      uploadedAt: '2026-03-14T14:20:00',
      activityId: 1002,
      activityTitle: 'Sports Day Activation',
      tags: ['sports', 'sampling', 'rage-bull'],
      downloads: 78,
      views: 456,
      metadata: {
        occasion: 'Sports',
        samplingType: 'Event Support',
        productSampled: 'Rage Bull',
        location: 'Sports Complex',
        participants: 200
      }
    },
    {
      id: 3,
      title: 'Gaming Night Event',
      description: 'Bubblegum sampling at gaming tournament',
      category: 'photos',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400',
      size: 3500000,
      uploadedBy: {
        id: 103,
        name: 'Mike Johnson',
        role: 'student',
      },
      uploadedAt: '2026-03-13T18:45:00',
      activityId: 1003,
      activityTitle: 'Gaming Tournament Activation',
      tags: ['gaming', 'sampling', 'bubblegum'],
      downloads: 92,
      views: 567,
      metadata: {
        occasion: 'Gaming',
        samplingType: '1-on-1 Sampling',
        productSampled: 'Bubblegum',
        location: 'Gaming Arena',
        participants: 85
      }
    },
    // Tools
    {
      id: 4,
      title: 'Sampling Kit - Urban Edition',
      description: 'Complete sampling kit with brochures and samples',
      category: 'tools',
      type: 'document',
      url: '#',
      size: 5200000,
      uploadedBy: {
        id: 201,
        name: 'Sarah Manager',
        role: 'manager',
      },
      uploadedAt: '2026-03-10T09:15:00',
      tags: ['kit', 'sampling', 'tools'],
      downloads: 156,
      views: 345,
    },
    {
      id: 5,
      title: 'Brand Guidelines 2026',
      description: 'Updated brand usage and guidelines document',
      category: 'tools',
      type: 'document',
      url: '#',
      size: 8200000,
      uploadedBy: {
        id: 201,
        name: 'Sarah Manager',
        role: 'manager',
      },
      uploadedAt: '2026-03-08T11:30:00',
      tags: ['brand', 'guidelines', 'marketing'],
      downloads: 234,
      views: 789,
    },
    // Lab Reports
    {
      id: 6,
      title: 'Rage Bull - Quality Analysis Q1 2026',
      description: 'Laboratory test results for Rage Bull energy drink',
      category: 'lab_reports',
      type: 'document',
      url: '#',
      size: 4500000,
      uploadedBy: {
        id: 202,
        name: 'Technical Team',
        role: 'manager',
      },
      uploadedAt: '2026-03-05T13:20:00',
      tags: ['lab', 'quality', 'rage-bull'],
      downloads: 89,
      views: 234,
    },
    // Training Materials
    {
      id: 7,
      title: 'Sampling Techniques Training',
      description: 'Video training on effective 1-on-1 sampling techniques',
      category: 'training',
      type: 'video',
      url: '#',
      thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
      size: 45000000,
      uploadedBy: {
        id: 201,
        name: 'Sarah Manager',
        role: 'manager',
      },
      uploadedAt: '2026-03-03T10:00:00',
      tags: ['training', 'video', 'techniques'],
      downloads: 267,
      views: 892,
    },
    {
      id: 8,
      title: 'Product Knowledge Deck',
      description: 'Comprehensive guide to all WHam Energy products',
      category: 'training',
      type: 'document',
      url: '#',
      size: 15000000,
      uploadedBy: {
        id: 201,
        name: 'Sarah Manager',
        role: 'manager',
      },
      uploadedAt: '2026-03-01T14:30:00',
      tags: ['training', 'product', 'knowledge'],
      downloads: 345,
      views: 678,
    },
    // Best Practices (Starred Activities)
    {
      id: 9,
      title: 'College Fest Success - March 2026',
      description: 'Starred activity: Exemplary execution at Engineering College',
      category: 'best_practices',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400',
      size: 3800000,
      uploadedBy: {
        id: 103,
        name: 'Mike Johnson',
        role: 'student',
      },
      uploadedAt: '2026-02-28T16:20:00',
      activityId: 1005,
      activityTitle: 'Spring Fest Activation',
      tags: ['starred', 'best-practice', 'fest'],
      downloads: 189,
      views: 1023,
      isStarred: true,
      starredBy: {
        id: 201,
        name: 'Sarah Manager',
        date: '2026-03-01T09:00:00'
      },
      metadata: {
        occasion: 'Study',
        samplingType: 'Event Support',
        productSampled: 'Coffee, Bubblegum',
        location: 'Engineering College',
        participants: 300
      }
    },
    {
      id: 10,
      title: 'Gaming Tournament - High Engagement',
      description: 'Starred activity: Exceptional engagement at gaming event',
      category: 'best_practices',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400',
      size: 4200000,
      uploadedBy: {
        id: 104,
        name: 'Alex Chen',
        role: 'student',
      },
      uploadedAt: '2026-02-25T19:45:00',
      activityId: 1006,
      activityTitle: 'Gaming Championship',
      tags: ['starred', 'gaming', 'high-engagement'],
      downloads: 156,
      views: 876,
      isStarred: true,
      starredBy: {
        id: 201,
        name: 'Sarah Manager',
        date: '2026-02-26T10:30:00'
      },
      metadata: {
        occasion: 'Gaming',
        samplingType: '1-on-1 Sampling',
        productSampled: 'Rage Bull',
        location: 'Gaming Zone',
        participants: 120
      }
    }
  ]);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter items based on search, category, and type
  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesType = selectedType === 'all' || item.type === selectedType;
    
    // Filter out manager-only categories for non-managers
    const category = categories.find(c => c.id === item.category);
    if (category?.managerOnly && !isManager) {
      return false;
    }
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleSelectItem = (id: number) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon size={20} className="text-blue-500" />;
      case 'document':
        return <FileText size={20} className="text-yellow-500" />;
      case 'video':
        return <Video size={20} className="text-purple-500" />;
      case 'pdf':
        return <FileJson size={20} className="text-red-500" />;
      default:
        return <File size={20} className="text-gray-500" />;
    }
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.icon || Folder;
  };

  // const getCategoryColor = (categoryId: string) => {
  //   const category = categories.find(c => c.id === categoryId);
  //   return category?.color || '#6b7280';
  // };

  const getCategoryBadge = (categoryId: string) => {
    switch (categoryId) {
      case 'photos':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'tools':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'lab_reports':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'training':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'best_practices':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleImageError = (id: number) => {
    setImgErrors(prev => ({ ...prev, [id]: true }));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleStarItem = (itemId: number) => {
    // API call to star/unstar item
    setItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, isStarred: !item.isStarred }
        : item
    ));
  };

  const handleDeleteItem = (itemId: number) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setItems(prev => prev.filter(item => item.id !== itemId));
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  const handleUpload = () => {
    // Navigate to upload page or open modal
    setShowUploadModal(true);
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex justify-center items-center">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center max-w-md">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Folder className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600 mb-6">Please log in to access the library</p>
          <Link
            to="/auth/login"
            className="inline-flex items-center justify-center px-6 py-3 bg-[#4f3fe0] text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-r from-[#5441ff] to-[#4531ff] rounded-lg flex items-center justify-center shadow-sm">
              <Folder className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Library</h1>
              <p className="text-sm text-slate-500">
                {isManager ? 'Manage photos, tools, reports, and training materials' : 'Access activity photos and best practices'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-[#4f3fe0] text-white' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-[#4f3fe0] text-white' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <List size={20} />
            </button>
            {isManager && (
              <button
                onClick={handleUpload}
                className="flex items-center gap-2 px-4 py-2 bg-[#4f3fe0] text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Upload size={18} />
                <span className="hidden sm:inline">Upload</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Quick Access */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {categories.map(category => {
            // Hide manager-only categories from students
            if (category.managerOnly && !isManager) return null;
            
            const Icon = category.icon;
            const itemCount = items.filter(i => i.category === category.id).length;
            
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-4 bg-white rounded-xl border transition-all ${
                  selectedCategory === category.id
                    ? 'border-[#4f3fe0] ring-2 ring-[#4f3fe0]/20'
                    : 'border-slate-200 hover:border-[#4f3fe0]/50 hover:shadow-sm'
                }`}
              >
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <Icon size={20} style={{ color: category.color }} />
                </div>
                <p className="text-xs font-medium text-slate-700 text-center truncate">{category.name}</p>
                <p className="text-xs text-slate-400 text-center">{itemCount} items</p>
              </button>
            );
          })}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by title, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f3fe0]/20 focus:border-[#4f3fe0]"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative min-w-[140px]">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="appearance-none w-full bg-white border border-slate-200 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#4f3fe0]/20 focus:border-[#4f3fe0]"
                >
                  <option value="all">All Types</option>
                  <option value="image">Images</option>
                  <option value="document">Documents</option>
                  <option value="video">Videos</option>
                  <option value="pdf">PDFs</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors ${
                  showFilters 
                    ? 'bg-[#4f3fe0] text-white border-[#4f3fe0]' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Filter size={18} />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Upload Date
                  </label>
                  <select className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4f3fe0]/20 focus:border-[#4f3fe0]">
                    <option>All Time</option>
                    <option>Today</option>
                    <option>This Week</option>
                    <option>This Month</option>
                    <option>This Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Occasion (for photos)
                  </label>
                  <select className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4f3fe0]/20 focus:border-[#4f3fe0]">
                    <option>All Occasions</option>
                    <option>Study</option>
                    <option>Fitness</option>
                    <option>Sports</option>
                    <option>Party & Socializing</option>
                    <option>Gaming</option>
                    <option>Work</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Sort By
                  </label>
                  <select className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4f3fe0]/20 focus:border-[#4f3fe0]">
                    <option>Newest First</option>
                    <option>Oldest First</option>
                    <option>Most Downloaded</option>
                    <option>Most Viewed</option>
                    <option>Name (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 mb-4 flex items-center justify-between sticky top-4 z-10">
            <div className="flex items-center gap-3">
              <button
                onClick={handleSelectAll}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                {selectedItems.length === filteredItems.length ? 'Deselect All' : 'Select All'}
              </button>
              <span className="text-sm text-slate-400">
                {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors" title="Download">
                <Download size={18} />
              </button>
              {isManager && (
                <>
                  <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-md transition-colors" title="Mark as Best Practice">
                    <Star size={18} />
                  </button>
                  <button 
                    onClick={() => handleDeleteItem(selectedItems[0])}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors" 
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Content Area */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-[#4f3fe0] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-500 mt-4">Loading library...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Folder className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No items found</h3>
            <p className="text-slate-500 mb-6">Try adjusting your filters or upload new files</p>
            {isManager && (
              <button
                onClick={handleUpload}
                className="px-6 py-3 bg-[#4f3fe0] text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
              >
                <Upload size={18} />
                Upload Files
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredItems.map(item => {
                  const CategoryIcon = getCategoryIcon(item.category);
                 
                  return (
                    <div
                      key={item.id}
                      className={`bg-white rounded-xl border transition-all ${
                        selectedItems.includes(item.id)
                          ? 'border-[#4f3fe0] ring-2 ring-[#4f3fe0]/20'
                          : 'border-slate-200 hover:border-[#4f3fe0]/50 hover:shadow-md'
                      }`}
                    >
                      <div className="relative">
                        {/* Thumbnail */}
                        <div className="aspect-video bg-slate-100 rounded-t-xl overflow-hidden">
                          {item.type === 'image' && !imgErrors[item.id] && item.thumbnail ? (
                            <img
                              src={item.thumbnail}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              onError={() => handleImageError(item.id)}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-100">
                              {getFileIcon(item.type)}
                            </div>
                          )}
                        </div>
                        
                        {/* Selection Checkbox */}
                        <div className="absolute top-2 left-2">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleSelectItem(item.id)}
                            className="w-4 h-4 rounded border-slate-300 text-[#4f3fe0] focus:ring-[#4f3fe0]"
                          />
                        </div>

                        {/* Star Indicator for Best Practices */}
                        {item.isStarred && (
                          <div className="absolute top-2 right-2">
                            <div className="bg-yellow-400 text-white p-1 rounded-full shadow-lg">
                              <Star size={12} fill="white" />
                            </div>
                          </div>
                        )}

                        {/* Category Badge */}
                        <div className="absolute bottom-2 left-2">
                          <span className={`text-xs px-2 py-1 rounded-full border ${getCategoryBadge(item.category)} flex items-center gap-1`}>
                            <CategoryIcon size={10} />
                            {categories.find(c => c.id === item.category)?.name.split(' ')[0]}
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900 truncate flex-1">{item.title}</h3>
                          {isManager && (
                            <button
                              onClick={() => handleStarItem(item.id)}
                              className={`p-1 rounded hover:bg-slate-100 transition-colors ${
                                item.isStarred ? 'text-yellow-500' : 'text-slate-300'
                              }`}
                            >
                              <Star size={14} fill={item.isStarred ? 'currentColor' : 'none'} />
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                        
                        {/* Activity Context (for photos) */}
                        {item.activityTitle && (
                          <div className="mt-2 p-2 bg-slate-50 rounded-lg">
                            <p className="text-xs text-slate-600">
                              <span className="font-medium">Activity:</span> {item.activityTitle}
                            </p>
                          </div>
                        )}

                        {/* Metadata for photos/best practices */}
                        {item.metadata && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {item.metadata.occasion && (
                              <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                                {item.metadata.occasion}
                              </span>
                            )}
                            {item.metadata.productSampled && (
                              <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">
                                {item.metadata.productSampled}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Tags */}
                        {item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                #{tag}
                              </span>
                            ))}
                            {item.tags.length > 2 && (
                              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                +{item.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                          <div className="flex items-center gap-1">
                            <Download size={12} />
                            <span>{item.downloads}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye size={12} />
                            <span>{item.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={12} />
                            <span>{format(new Date(item.uploadedAt), 'MMM d')}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-linear-to-br from-indigo-100 to-purple-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">
                              {getInitials(item.uploadedBy.name)}
                            </div>
                            <span className="text-xs text-slate-600 truncate max-w-20">
                              {item.uploadedBy.name.split(' ')[0]}
                            </span>
                            {item.uploadedBy.role === 'manager' && (
                              <span className="text-[10px] bg-purple-100 text-purple-700 px-1 rounded">
                                Mgr
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400">{formatFileSize(item.size)}</span>
                        </div>

                        {/* Starred By Info */}
                        {item.starredBy && (
                          <div className="mt-2 text-[10px] text-purple-600 bg-purple-50 p-1 rounded flex items-center gap-1">
                            <Star size={10} />
                            <span>Starred by {item.starredBy.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                            onChange={handleSelectAll}
                            className="w-4 h-4 rounded border-slate-300 text-[#4f3fe0] focus:ring-[#4f3fe0]"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">File</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Size</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Uploaded By</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Uploaded</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Stats</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredItems.map(item => {
                        const CategoryIcon = getCategoryIcon(item.category);
                        
                        return (
                          <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(item.id)}
                                onChange={() => handleSelectItem(item.id)}
                                className="w-4 h-4 rounded border-slate-300 text-[#4f3fe0] focus:ring-[#4f3fe0]"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center">
                                  {getFileIcon(item.type)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-medium text-slate-900">{item.title}</h3>
                                    {item.isStarred && (
                                      <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-500">{item.description}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs px-2 py-1 rounded-full border ${getCategoryBadge(item.category)} flex items-center gap-1 w-fit`}>
                                <CategoryIcon size={10} />
                                {categories.find(c => c.id === item.category)?.name}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs text-slate-600 capitalize">{item.type}</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">{formatFileSize(item.size)}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-linear-to-br from-indigo-100 to-purple-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">
                                  {getInitials(item.uploadedBy.name)}
                                </div>
                                <span className="text-sm text-slate-600">{item.uploadedBy.name}</span>
                                {item.uploadedBy.role === 'manager' && (
                                  <span className="text-[10px] bg-purple-100 text-purple-700 px-1 rounded">
                                    Mgr
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              {format(new Date(item.uploadedAt), 'MMM d, yyyy')}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span title="Downloads">{item.downloads} ↓</span>
                                <span title="Views">{item.views} 👁️</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded" title="Download">
                                  <Download size={16} />
                                </button>
                                {isManager && (
                                  <>
                                    <button 
                                      onClick={() => handleStarItem(item.id)}
                                      className={`p-1 rounded hover:bg-slate-100 ${
                                        item.isStarred ? 'text-yellow-500' : 'text-slate-400'
                                      }`}
                                      title={item.isStarred ? 'Remove Star' : 'Star as Best Practice'}
                                    >
                                      <Star size={16} fill={item.isStarred ? 'currentColor' : 'none'} />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteItem(item.id)}
                                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" 
                                      title="Delete"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">Upload to Library</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4f3fe0]/20 focus:border-[#4f3fe0]"
                  >
                    {categories.filter(c => c.managerOnly === isManager).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    File
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center hover:border-[#4f3fe0] transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-400 mt-1">Images, Documents, Videos up to 100MB</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter file title"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4f3fe0]/20 focus:border-[#4f3fe0]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter description"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4f3fe0]/20 focus:border-[#4f3fe0]"
                  />
                </div>

                {uploadCategory === 'photos' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Link to Activity (Optional)
                      </label>
                      <select className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4f3fe0]/20 focus:border-[#4f3fe0]">
                        <option>Select Activity</option>
                        <option>Tech Fest Sampling - Mar 15</option>
                        <option>Sports Day Activation - Mar 14</option>
                        <option>Gaming Night - Mar 13</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., sampling, college, students"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#4f3fe0]/20 focus:border-[#4f3fe0]"
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 px-4 py-2 bg-[#4f3fe0] text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Upload
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}