import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import React from 'react';
import axios from 'axios';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Equipment', href: '/equipment' },
];

type Equipment = {
    id: number;
    name: string;
    serial_number?: string;
    model?: string;
    description?: string;
};

type EquipmentForm = {
    name: string;
    serial_number: string;
    model: string;
    description: string;
};

function useEquipmentCRUD() {
    const [equipment, setEquipment] = React.useState<Equipment[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const fetchEquipment = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get('http://localhost:8000/api/equipment/getAll');
            setEquipment(res.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch equipment');
        } finally {
            setLoading(false);
        }
    };

    const createEquipment = async (data: Omit<Equipment, 'id'>) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post('http://localhost:8000/api/equipment/store', data);
            setEquipment((prev) => [...prev, res.data]);
            alert('Equipment added!');
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to create equipment');
        } finally {
            setLoading(false);
        }
    };

    const updateEquipment = async (id: number, data: Omit<Equipment, 'id'>) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.put(`http://localhost:8000/api/equipment/${id}`, data);
            setEquipment((prev) =>
                prev.map((item) => (item.id === id ? res.data : item))
            );
            alert('Equipment updated!');
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to update equipment');
        } finally {
            setLoading(false);
        }
    };

    const deleteEquipment = async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            await axios.delete(`http://localhost:8000/api/equipment/${id}`);
            setEquipment((prev) => prev.filter((item) => item.id !== id));
            alert('Equipment deleted!');
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to delete equipment');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchEquipment();
    }, []);

    return {
        equipment,
        loading,
        error,
        fetchEquipment,
        createEquipment,
        updateEquipment,
        deleteEquipment,
    };
}

export default function EquipmentPage() {
    const {
        equipment,
        loading,
        error,
        createEquipment,
        updateEquipment,
        deleteEquipment,
    } = useEquipmentCRUD();

    // Modal state
    const [modalOpen, setModalOpen] = React.useState(false);
    const [editItem, setEditItem] = React.useState<Equipment | null>(null);
    const [form, setForm] = React.useState<EquipmentForm>({
        name: '',
        serial_number: '',
        model: '',
        description: '',
    });

    // Search state
    const [search, setSearch] = React.useState('');

    // Rows per page state
    const PAGE_SIZE_OPTIONS = [5, 10, 25];
    const [rowsPerPage, setRowsPerPage] = React.useState(PAGE_SIZE_OPTIONS[0]);
    const [page, setPage] = React.useState(0);

    // Filtered equipment
    const filteredEquipment = equipment.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.serial_number && item.serial_number.toLowerCase().includes(search.toLowerCase())) ||
        (item.model && item.model.toLowerCase().includes(search.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(search.toLowerCase()))
    );

    // Pagination logic
    const totalRows = filteredEquipment.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    const paginatedEquipment = filteredEquipment.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );
    const from = page * rowsPerPage + 1;
    const to = Math.min((page + 1) * rowsPerPage, totalRows);

    const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setRowsPerPage(Number(e.target.value));
        setPage(0);
    };

    const handleChangePage = (newPage: number) => {
        setPage(newPage);
    };

    const handleOpenCreate = () => {
        setEditItem(null);
        setForm({ name: '', serial_number: '', model: '', description: '' });
        setModalOpen(true);
    };

    const handleOpenEdit = (item: Equipment) => {
        setEditItem(item);
        setForm({
            name: item.name,
            serial_number: item.serial_number || '',
            model: item.model || '',
            description: item.description || '',
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editItem) {
            await updateEquipment(editItem.id, {
                ...form,
                name: form.name.trim(),
                serial_number: form.serial_number.trim(),
                model: form.model.trim(),
                description: form.description.trim(),
            });
        } else {
            await createEquipment({
                ...form,
                name: form.name.trim(),
                serial_number: form.serial_number.trim(),
                model: form.model.trim(),
                description: form.description.trim(),
            });
        }
        setModalOpen(false);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this equipment?')) {
            await deleteEquipment(id);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Equipment" />
            <div className="p-2 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
                    <h2 className="text-xl font-bold">Equipment List</h2>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <input
                            type="text"
                            className="border rounded px-2 py-1 text-sm w-full sm:w-auto"
                            placeholder="Search equipment..."
                            value={search}
                            onChange={e => {
                                setSearch(e.target.value);
                                setPage(0);
                            }}
                        />
                        <button
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto"
                            onClick={handleOpenCreate}
                        >
                            Add Equipment
                        </button>
                    </div>
                </div>
                {loading && (
                    <div className="mb-2 flex items-center gap-2 text-blue-600">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                        </svg>
                        Loading...
                    </div>
                )}
                {error && <div className="mb-2 text-red-600">{error}</div>}
                <div className="w-full overflow-x-auto rounded-lg shadow border border-gray-200 bg-white">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                {/* <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">ID</th> */}
                                <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Name</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Serial Number</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Model</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Description</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {paginatedEquipment.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-400">
                                        No equipment found.
                                    </td>
                                </tr>
                            ) : (
                                paginatedEquipment.map((item) => (
                                    <tr key={item.id}>
                                        {/* <td className="px-4 py-3 whitespace-nowrap">{item.id}</td> */}
                                        <td className="px-4 py-3 whitespace-nowrap">{item.name}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">{item.serial_number}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">{item.model}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">{item.description}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <button
                                                className="text-blue-600 hover:underline mr-2"
                                                onClick={() => handleOpenEdit(item)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="text-red-600 hover:underline"
                                                onClick={() => handleDelete(item.id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between px-2 py-2 border-t border-neutral-200 bg-white gap-2 mt-2">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-neutral-700">Rows per page:</span>
                        <select
                            className="border rounded px-2 py-1 text-sm"
                            value={rowsPerPage}
                            onChange={handleChangeRowsPerPage}
                        >
                            {PAGE_SIZE_OPTIONS.map((n) => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-neutral-700">
                            {from}-{to} of {totalRows}
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                className="p-1 rounded-full border text-neutral-500 hover:bg-neutral-100 disabled:opacity-50"
                                onClick={() => handleChangePage(0)}
                                disabled={page === 0}
                                aria-label="First page"
                            >
                                &#171;
                            </button>
                            <button
                                className="p-1 rounded-full border text-neutral-500 hover:bg-neutral-100 disabled:opacity-50"
                                onClick={() => handleChangePage(page - 1)}
                                disabled={page === 0}
                                aria-label="Previous page"
                            >
                                &#8249;
                            </button>
                            <button
                                className="p-1 rounded-full border text-neutral-500 hover:bg-neutral-100 disabled:opacity-50"
                                onClick={() => handleChangePage(page + 1)}
                                disabled={page >= totalPages - 1}
                                aria-label="Next page"
                            >
                                &#8250;
                            </button>
                            <button
                                className="p-1 rounded-full border text-neutral-500 hover:bg-neutral-100 disabled:opacity-50"
                                onClick={() => handleChangePage(totalPages - 1)}
                                disabled={page >= totalPages - 1}
                                aria-label="Last page"
                            >
                                &#187;
                            </button>
                        </div>
                    </div>
                </div>
                {/* Modal for Create/Update */}
                {modalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                        <div className="bg-white rounded shadow-lg p-4 w-full max-w-md mx-2">
                            <h3 className="text-lg font-bold mb-4">
                                {editItem ? 'Edit Equipment' : 'Add Equipment'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium">Name</label>
                                    <input
                                        className="border rounded px-2 py-1 w-full"
                                        required
                                        value={form.name}
                                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Serial Number</label>
                                    <input
                                        className="border rounded px-2 py-1 w-full"
                                        required
                                        value={form.serial_number}
                                        onChange={e => setForm(f => ({ ...f, serial_number: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Model</label>
                                    <input
                                        className="border rounded px-2 py-1 w-full"
                                        value={form.model}
                                        onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Description</label>
                                    <input
                                        className="border rounded px-2 py-1 w-full"
                                        value={form.description}
                                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                                    <button
                                        type="button"
                                        className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                                        onClick={() => setModalOpen(false)}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                                        disabled={loading}
                                    >
                                        {loading ? 'Saving...' : editItem ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
