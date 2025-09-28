import React, { useState } from "react";
import { toast } from 'react-toastify';

const MeasurementForm = ({ selectedButton, onClose, updateButton, setSelectedButton }) => {
    const [width, setWidth] = useState(selectedButton?.width);
    const [height, setHeight] = useState(selectedButton?.height);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateButton(selectedButton.id, { width: Number(width), height: Number(height) });
            toast.success('تم تحديث أبعاد الزر بنجاح');
            setSelectedButton(null);
            onClose();
        } catch (error) {
            toast.error('حدث خطأ أثناء تحديث أبعاد الزر');
            console.error('Error updating button dimensions:', error);
        }
    };

    return (
        <div className="absolute z-99999 top-0 left-0 w-full h-full bg-black bg-opacity-90">
            <div className="fixed inset-0 flex justify-center items-center">
                <div className="bg-white dark:bg-gray-900 p-6 rounded shadow-lg w-full max-w-md">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                        تحديث أبعاد الزر
                    </h2>
                    <form onSubmit={handleSubmit} className="text-right text-black space-y-4">
                        <div>
                            <label className="block text-gray-700 dark:text-gray-200 mb-1">
                                العرض (بالبكسل):
                            </label>
                            <input
                                type="number"
                                value={width || ''}
                                onChange={(e) => setWidth(e.target.value ? Math.max(Number(e.target.value)) : '')}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                                required
                                min="100"
                                max="9999"
                            /> 
                        </div>
                        <div>
                            <label className="block text-gray-700 dark:text-gray-200 mb-1">
                                العرض (بالبكسل):                            </label>
                            <input
                                type="number"
                                value={height || ''}
                                onChange={(e) => setHeight(e.target.value ? Math.max(Number(e.target.value)) : '')}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                                required
                                min="20"
                                max="9999"
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-white rounded hover:bg-gray-400"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                حفظ
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MeasurementForm;
