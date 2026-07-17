import { useEffect, useMemo, useState } from "react";
import {
    Edit,
    KeyRound,
    LoaderCircle,
    Search,
    Trash2,
    UserPlus,
    Users as UsersIcon,
} from "lucide-react";

import api from "../services/api";

const initialForm = {
    name: "",
    email: "",
    password: "",
    role: "expert",
    isActive: true,
};

const Users = () => {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState(initialForm);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [editingUser, setEditingUser] = useState(null);
    const [passwordModalUser, setPasswordModalUser] = useState(null);
    const [newPassword, setNewPassword] = useState("");
    const [passwordSubmitting, setPasswordSubmitting] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/users");

            setUsers(response.data.users || []);
        } catch (requestError) {
            console.error(
                "Kullanıcılar alınamadı:",
                requestError.response?.data || requestError.message
            );

            setError(
                requestError.response?.data?.message ||
                "Kullanıcılar alınırken hata oluştu."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setMessage("");
        setError("");

        if (
            !formData.name.trim() ||
            !formData.email.trim() ||
            (!editingUser && !formData.password)
        ) {
            setError(
                editingUser
                    ? "Ad ve e-posta alanları zorunludur."
                    : "Ad, e-posta ve şifre alanları zorunludur."
            );
            return;
        }

        try {
            setSubmitting(true);

            if (editingUser) {
                const userId = getUserId(editingUser);

                const response = await api.put(`/users/${userId}`, {
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    role: formData.role,
                    isActive: formData.isActive,
                });

                setUsers((previousUsers) =>
                    previousUsers.map((currentUser) =>
                        getUserId(currentUser) === userId
                            ? response.data.user
                            : currentUser
                    )
                );

                setMessage(
                    response.data.message ||
                    "Kullanıcı başarıyla güncellendi."
                );

                setEditingUser(null);
                setFormData(initialForm);
            } else {
                const response = await api.post("/users", {
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    password: formData.password,
                    role: formData.role,
                });

                setUsers((previousUsers) => [
                    response.data.user,
                    ...previousUsers,
                ]);

                setFormData(initialForm);

                setMessage(
                    response.data.message ||
                    "Kullanıcı başarıyla oluşturuldu."
                );
            }
        } catch (requestError) {
            console.error(
                "Kullanıcı kaydetme hatası:",
                requestError.response?.data || requestError.message
            );

            setError(
                requestError.response?.data?.message ||
                "Kullanıcı kaydedilirken hata oluştu."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (selectedUser) => {
        setEditingUser(selectedUser);

        setFormData({
            name: selectedUser.name || "",
            email: selectedUser.email || "",
            password: "",
            role: selectedUser.role || "expert",
            isActive: selectedUser.isActive ?? true,
        });

        setMessage("");
        setError("");
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
        setFormData(initialForm);
        setMessage("");
        setError("");
    };


    const handlePasswordReset = async (event) => {
        event.preventDefault();

        if (!passwordModalUser) {
            return;
        }

        if (newPassword.length < 6) {
            setError("Yeni şifre en az 6 karakter olmalıdır.");
            return;
        }

        try {
            setPasswordSubmitting(true);
            setError("");
            setMessage("");

            const userId = getUserId(passwordModalUser);

            const response = await api.patch(
                `/users/${userId}/password`,
                {
                    password: newPassword,
                }
            );

            setMessage(
                response.data.message ||
                "Kullanıcı şifresi başarıyla güncellendi."
            );

            setPasswordModalUser(null);
            setNewPassword("");
        } catch (requestError) {
            console.error(
                "Şifre sıfırlama hatası:",
                requestError.response?.data || requestError.message
            );

            setError(
                requestError.response?.data?.message ||
                "Şifre güncellenirken hata oluştu."
            );
        } finally {
            setPasswordSubmitting(false);
        }
    };

    const handleDelete = async (userId, userName) => {
        const confirmed = window.confirm(
            `${userName} adlı kullanıcıyı silmek istediğinize emin misiniz?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(userId);
            setMessage("");
            setError("");

            const response = await api.delete(`/users/${userId}`);

            setUsers((previousUsers) =>
                previousUsers.filter(
                    (currentUser) =>
                        getUserId(currentUser) !== userId
                )
            );

            setMessage(
                response.data.message ||
                "Kullanıcı başarıyla silindi."
            );
        } catch (requestError) {
            console.error(
                "Kullanıcı silme hatası:",
                requestError.response?.data || requestError.message
            );

            setError(
                requestError.response?.data?.message ||
                "Kullanıcı silinirken hata oluştu."
            );
        } finally {
            setDeletingId(null);
        }
    };

    const filteredUsers = useMemo(() => {
        const normalizedSearch = searchTerm
            .trim()
            .toLowerCase();

        if (!normalizedSearch) {
            return users;
        }

        return users.filter((currentUser) => {
            const name = currentUser.name?.toLowerCase() || "";
            const email = currentUser.email?.toLowerCase() || "";
            const role = currentUser.role?.toLowerCase() || "";

            return (
                name.includes(normalizedSearch) ||
                email.includes(normalizedSearch) ||
                role.includes(normalizedSearch)
            );
        });
    }, [users, searchTerm]);

    const activeUserCount = users.filter(
        (currentUser) => currentUser.isActive
    ).length;

    const adminCount = users.filter(
        (currentUser) => currentUser.role === "admin"
    ).length;

    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-6">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                            <UsersIcon size={22} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                Kullanıcı Yönetimi
                            </h1>

                            <p className="text-sm text-slate-500">
                                Sisteme erişebilecek kullanıcıları yönetin.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mb-6 grid gap-4 sm:grid-cols-3">
                    <StatCard
                        title="Toplam Kullanıcı"
                        value={users.length}
                    />

                    <StatCard
                        title="Aktif Kullanıcı"
                        value={activeUserCount}
                    />

                    <StatCard
                        title="Admin"
                        value={adminCount}
                    />
                </div>

                {message && (
                    <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
                    <section className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-5 flex items-center gap-2">
                            <UserPlus
                                size={20}
                                className="text-blue-600"
                            />

                            <h2 className="text-lg font-semibold text-slate-900">
                                {editingUser
                                    ? "Kullanıcı Güncelle"
                                    : "Yeni Kullanıcı"}
                            </h2>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-4"
                        >
                            <FormField
                                label="Ad Soyad"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Örn. Ahmet Yılmaz"
                            />

                            <FormField
                                label="E-posta"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="ornek@bebka.org.tr"
                            />

                            {!editingUser && (
                                <FormField
                                    label="Geçici Şifre"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="En az 6 karakter"
                                />
                            )}

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Rol
                                </label>

                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="expert">
                                        Uzman
                                    </option>

                                    <option value="admin">
                                        Admin
                                    </option>
                                </select>
                            </div>

                            {editingUser && (
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Durum
                                    </label>

                                    <select
                                        name="isActive"
                                        value={String(formData.isActive)}
                                        onChange={(event) =>
                                            setFormData((previous) => ({
                                                ...previous,
                                                isActive: event.target.value === "true",
                                            }))
                                        }
                                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value="true">Aktif</option>
                                        <option value="false">Pasif</option>
                                    </select>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {submitting ? (
                                    <>
                                        <LoaderCircle
                                            size={18}
                                            className="animate-spin"
                                        />
                                        Kaydediliyor...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus size={18} />

                                        {editingUser
                                            ? "Kullanıcıyı Güncelle"
                                            : "Kullanıcı Oluştur"}
                                    </>
                                )}
                            </button>

                            {editingUser && (
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    Düzenlemeyi İptal Et
                                </button>
                            )}

                        </form>
                    </section>

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 p-5">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Kullanıcı Listesi
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        {filteredUsers.length} kullanıcı gösteriliyor
                                    </p>
                                </div>

                                <div className="relative w-full sm:w-72">
                                    <Search
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(event) =>
                                            setSearchTerm(event.target.value)
                                        }
                                        placeholder="Ad, e-posta veya rol ara..."
                                        className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex min-h-80 items-center justify-center">
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <LoaderCircle
                                        size={20}
                                        className="animate-spin"
                                    />

                                    Kullanıcılar yükleniyor...
                                </div>
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="flex min-h-80 flex-col items-center justify-center p-6 text-center">
                                <UsersIcon
                                    size={38}
                                    className="text-slate-300"
                                />

                                <p className="mt-3 font-medium text-slate-700">
                                    Kullanıcı bulunamadı
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    Arama kriterini değiştirin veya yeni kullanıcı ekleyin.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[850px]">
                                    <thead className="bg-slate-50">
                                        <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                                            <th className="px-5 py-3 font-semibold">
                                                Kullanıcı
                                            </th>

                                            <th className="px-5 py-3 font-semibold">
                                                Rol
                                            </th>

                                            <th className="px-5 py-3 font-semibold">
                                                Durum
                                            </th>

                                            <th className="px-5 py-3 font-semibold">
                                                Son Giriş
                                            </th>

                                            <th className="px-5 py-3 text-right font-semibold">
                                                İşlemler
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {filteredUsers.map((currentUser) => {
                                            const userId = getUserId(currentUser);

                                            return (
                                                <tr
                                                    key={userId}
                                                    className="transition hover:bg-slate-50"
                                                >
                                                    <td className="px-5 py-4">
                                                        <p className="font-medium text-slate-900">
                                                            {currentUser.name}
                                                        </p>

                                                        <p className="mt-1 text-sm text-slate-500">
                                                            {currentUser.email}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <RoleBadge role={currentUser.role} />
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <StatusBadge
                                                            isActive={currentUser.isActive}
                                                        />
                                                    </td>

                                                    <td className="px-5 py-4 text-sm text-slate-600">
                                                        {formatDate(currentUser.lastLoginAt)}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                type="button"
                                                                title="Düzenle"
                                                                onClick={() => handleEdit(currentUser)}
                                                                className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                                            >
                                                                <Edit size={17} />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                title="Şifre sıfırla"
                                                                onClick={() => {
                                                                    setPasswordModalUser(currentUser);
                                                                    setNewPassword("");
                                                                    setError("");
                                                                    setMessage("");
                                                                }}
                                                                className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600"
                                                            >
                                                                <KeyRound size={17} />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                title="Sil"
                                                                disabled={deletingId === userId}
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        userId,
                                                                        currentUser.name
                                                                    )
                                                                }
                                                                className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                {deletingId === userId ? (
                                                                    <LoaderCircle
                                                                        size={17}
                                                                        className="animate-spin"
                                                                    />
                                                                ) : (
                                                                    <Trash2 size={17} />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            </div>
            {passwordModalUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <h2 className="text-xl font-bold text-slate-900">
                            Şifre Sıfırla
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            {passwordModalUser.name} kullanıcısı için yeni bir şifre belirleyin.
                        </p>

                        <form
                            onSubmit={handlePasswordReset}
                            className="mt-5 space-y-4"
                        >
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Yeni Şifre
                                </label>

                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(event) =>
                                        setNewPassword(event.target.value)
                                    }
                                    placeholder="En az 6 karakter"
                                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPasswordModalUser(null);
                                        setNewPassword("");
                                    }}
                                    className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    İptal
                                </button>

                                <button
                                    type="submit"
                                    disabled={passwordSubmitting}
                                    className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-60"
                                >
                                    {passwordSubmitting && (
                                        <LoaderCircle
                                            size={17}
                                            className="animate-spin"
                                        />
                                    )}

                                    Şifreyi Güncelle
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ title, value }) => {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
                {title}
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
                {value}
            </p>
        </div>
    );
};

const FormField = ({
    label,
    name,
    type = "text",
    value,
    onChange,
    placeholder,
}) => {
    return (
        <div>
            <label
                htmlFor={name}
                className="mb-1.5 block text-sm font-medium text-slate-700"
            >
                {label}
            </label>

            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
        </div>
    );
};

const RoleBadge = ({ role }) => {
    const isAdmin = role === "admin";

    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${isAdmin
                ? "bg-purple-100 text-purple-700"
                : "bg-blue-100 text-blue-700"
                }`}
        >
            {isAdmin ? "Admin" : "Uzman"}
        </span>
    );
};

const StatusBadge = ({ isActive }) => {
    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${isActive
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-200 text-slate-600"
                }`}
        >
            {isActive ? "Aktif" : "Pasif"}
        </span>
    );
};

const getUserId = (user) => {
    return user.id || user._id;
};

const formatDate = (dateValue) => {
    if (!dateValue) {
        return "Henüz giriş yapmadı";
    }

    return new Intl.DateTimeFormat("tr-TR", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(new Date(dateValue));
};

export default Users;