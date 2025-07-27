import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Leaf, ChevronLeft, ChevronRight } from 'lucide-react';
import { categoriesAPI } from '../services/api';
import CategoryModal from '../components/CategoryModal';
import toast from 'react-hot-toast';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, category: null });

  const fetchCategories = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      const response = await categoriesAPI.getAll(params);
      if (response && response.data) {
        setCategories(response.data.data);
        setPagination(response.data.pagination);
      } else {
        throw new Error('Invalid response format from categories API');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Gagal memuat kategori');
      setCategories([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories(currentPage);
  }, [fetchCategories, currentPage]);

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setModalOpen(true);
  };

  const handleDeleteCategory = (category) => {
    setDeleteModal({ isOpen: true, category });
  };

  const confirmDelete = async () => {
    if (!deleteModal.category) return;
    
    try {
      await categoriesAPI.delete(deleteModal.category.id);
      
      // Refresh categories from API after deletion
      await fetchCategories(currentPage);
      
      toast.success('Kategori berhasil dihapus');
      setDeleteModal({ isOpen: false, category: null });
    } catch (error) {
      console.error('Error deleting category:', error);
      
      // Handle specific error cases
      if (error.response?.status === 409 && error.response?.data?.code === 'CATEGORY_IN_USE') {
        toast.error('Tidak dapat menghapus kategori karena masih digunakan oleh produk');
      } else if (error.response?.status === 404) {
        toast.error('Kategori tidak ditemukan. Mungkin sudah dihapus.');
        // Refresh the list to remove the non-existent category
        await fetchCategories(currentPage);
      } else {
        const message = error.response?.data?.error || error.message || 'Failed to delete category';
        toast.error(message);
      }
      setDeleteModal({ isOpen: false, category: null });
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, category: null });
  };

  const handleModalSuccess = () => {
    fetchCategories(currentPage);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Kategori</h1>
            <p className="text-gray-600">Atur produk Anda berdasarkan kategori</p>
          </div>
          <button 
            onClick={handleAddCategory}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kategori</span>
          </button>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Leaf className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{categories.length}</h3>
              <p className="text-sm text-gray-600">Total Kategori</p>
            </div>
          </div>
        </div>
      </div>

      {categories.length === 0 && !loading ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Leaf className="w-16 h-16 mx-auto" />
          </div>
          <p className="text-gray-600 mb-4">Tidak ada kategori ditemukan</p>
          <button
            onClick={handleAddCategory}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Buat Kategori Pertama Anda</span>
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map(category => (
              <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded-md hover:bg-blue-50"
                      title="Edit kategori"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category)}
                      className="text-red-600 hover:text-red-800 transition-colors p-1 rounded-md hover:bg-red-50"
                      title="Hapus kategori"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span>{category.color}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Dibuat {new Date(category.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {pagination && pagination.total > 0 && (
            <div className="flex items-center justify-between mt-6">
              <span className="text-sm text-gray-700">
                Halaman {pagination.page} dari {pagination.totalPages} (Total: {pagination.total} item)
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <CategoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        category={selectedCategory}
        onSuccess={handleModalSuccess}
      />

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Hapus Kategori
            </h3>
            <div className="flex items-center space-x-3 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: deleteModal.category?.color }}
              >
                {deleteModal.category?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-gray-900">{deleteModal.category?.name}</span>
            </div>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus kategori ini? Tindakan ini tidak dapat dibatalkan dan akan mempengaruhi produk yang menggunakan kategori ini.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
