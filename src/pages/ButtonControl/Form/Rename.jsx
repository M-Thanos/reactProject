import React, { useState } from "react";
import { toast } from 'react-toastify';

const Rename = ({ selectedButton, onClose, updateButton, setSelectedButton }) => {
    const [name, setName] = useState(selectedButton?.name || "");
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateButton(selectedButton.id, { name });
            toast.success('تم تحديث اسم الزر بنجاح');
            setSelectedButton(null);
            onClose();
        } catch (error) {
            toast.error('حدث خطأ أثناء تحديث اسم الزر');
            console.error('Error updating button name:', error);
        }
    };

    // console.log('selectedButtonRename', selectedButton);

    return (
        <div className="absolute z-[9998] top-0 left-0 w-full h-full bg-black bg-opacity-90">
            <div className="fixed inset-0 flex justify-center items-center">
                <div className="bg-white dark:bg-gray-900 p-6 rounded shadow-lg w-full max-w-md">
                    <h2 className="text-xl text-right font-bold mb-4">تغير اسم الزر </h2>
                    <form className="text-right" onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block mb-2">اسم الزر</label>
                            <input
                                type="text"
                                value={name}
                                placeholder="اسم الزر"
                                onChange={(e) => setName(e.target.value)}
                                className="text-right text-black w-full p-2 border rounded"
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-500 text-white rounded"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-500 text-white rounded"
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

export default Rename;
