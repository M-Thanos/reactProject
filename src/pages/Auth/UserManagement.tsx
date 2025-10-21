import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { UserRole } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
  createdAt: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('حدث خطأ في جلب المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { role: newRole });
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      toast.success('تم تحديث دور المستخدم بنجاح');
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('حدث خطأ في تحديث دور المستخدم');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      return;
    }

    try {
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);
      
      setUsers(users.filter(user => user.id !== userId));
      toast.success('تم حذف المستخدم بنجاح');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('حدث خطأ في حذف المستخدم');
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'designer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'user':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'مدير';
      case 'designer':
        return 'مصمم';
      case 'user':
        return 'مستخدم';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="mb-6 flex items-center justify-between">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          إدارة المستخدمين
        </h4>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          إجمالي المستخدمين: {users.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-right dark:bg-meta-4">
              <th className="py-4 px-4 font-medium text-black dark:text-white">
                البريد الإلكتروني
              </th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">
                الاسم
              </th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">
                الدور
              </th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">
                تاريخ التسجيل
              </th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-stroke dark:border-strokedark">
                <td className="py-5 px-4">
                  <p className="text-black dark:text-white">{user.email}</p>
                </td>
                <td className="py-5 px-4">
                  <p className="text-black dark:text-white">
                    {user.displayName || '-'}
                  </p>
                </td>
                <td className="py-5 px-4">
                  {editingUser === user.id ? (
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                      className="px-3 py-1 rounded border border-stroke dark:border-strokedark bg-transparent text-black dark:text-white"
                      autoFocus
                    >
                      <option value="admin">مدير</option>
                      <option value="designer">مصمم</option>
                      <option value="user">مستخدم</option>
                    </select>
                  ) : (
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-sm font-medium cursor-pointer ${getRoleBadgeColor(user.role)}`}
                      onClick={() => setEditingUser(user.id)}
                    >
                      {getRoleLabel(user.role)}
                    </span>
                  )}
                </td>
                <td className="py-5 px-4">
                  <p className="text-sm text-black dark:text-white">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-EG') : '-'}
                  </p>
                </td>
                <td className="py-5 px-4">
                  <div className="flex items-center space-x-3.5">
                    {editingUser === user.id ? (
                      <button
                        onClick={() => setEditingUser(null)}
                        className="hover:text-primary"
                        title="إلغاء"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingUser(user.id)}
                          className="hover:text-primary"
                          title="تعديل الدور"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="hover:text-danger"
                          title="حذف"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500 dark:text-gray-400">لا يوجد مستخدمين</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;

