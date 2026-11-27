import React, { useState, useEffect, useCallback } from 'react';
import { Wallet, Users, Plus, Trash2, UserPlus, Loader2 } from 'lucide-react';
import { itineraryApi } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { useToast } from '../common/Toast';

const EXPENSE_CATEGORIES = ['Ăn uống', 'Di chuyển', 'Khách sạn', 'Vé tham quan', 'Mua sắm', 'Khác'];

export const ItineraryExpensesMembersPanel = ({
  itineraryId,
  budgetTotal = 0,
  isOwner = false,
  creatorName = '',
  creatorEmail = '',
  mode = 'expenses' // 'expenses' | 'members'
}) => {
  const { currentUser } = useApp();
  const toast = useToast();
  const numericId = Number(itineraryId);
  const isValidId = Number.isFinite(numericId) && numericId > 0;

  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [members, setMembers] = useState([]);
  const [detailCreator, setDetailCreator] = useState({ name: '', email: '' });

  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState('Ăn uống');
  const [expDesc, setExpDesc] = useState('');
  const [submittingExp, setSubmittingExp] = useState(false);

  const [memberEmail, setMemberEmail] = useState('');
  const [submittingMember, setSubmittingMember] = useState(false);

  const loadData = useCallback(async () => {
    if (!isValidId) return;
    setLoading(true);
    try {
      const detail = await itineraryApi.getItineraryById(numericId);
      setExpenses(Array.isArray(detail?.expenses) ? detail.expenses : []);
      setMembers(Array.isArray(detail?.members) ? detail.members : []);
      setDetailCreator({
        name: detail?.creatorName || detail?.authorName || '',
        email: detail?.creatorEmail || ''
      });
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [isValidId, numericId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!isValidId) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        Lịch trình chưa được lưu vào cơ sở dữ liệu.
      </div>
    );
  }

  // Deduplicate owner so owner never appears twice (once as Owner and once in members list)
  const rawOwnerEmail = (detailCreator.email || creatorEmail || '').trim().toLowerCase();
  const ownerFromMembers = members.find(
    (m) =>
      String(m.role || '').toUpperCase() === 'OWNER' ||
      (rawOwnerEmail && String(m.email || '').trim().toLowerCase() === rawOwnerEmail)
  );
  const ownerDisplayName = ownerFromMembers?.fullName || detailCreator.name || creatorName || 'Chủ chuyến đi';
  const ownerDisplayEmail = ownerFromMembers?.email || detailCreator.email || creatorEmail || '';
  const ownerEmailKey = ownerDisplayEmail.trim().toLowerCase();

  const companions = [];
  const seenKeys = new Set(ownerEmailKey ? [ownerEmailKey] : []);
  for (const m of members) {
    if (String(m.role || '').toUpperCase() === 'OWNER') continue;
    const key = String(m.email || m.userId || m.id || '').trim().toLowerCase();
    if (!key || seenKeys.has(key)) continue;
    seenKeys.add(key);
    companions.push(m);
  }

  const actualTotal = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalPeople = 1 + companions.length;
  const perPerson = Math.round(actualTotal / Math.max(1, totalPeople));
  const budgetNum = Number(budgetTotal) || 0;
  const remaining = budgetNum - actualTotal;
  const pct = budgetNum > 0 ? Math.min(100, Math.round((actualTotal / budgetNum) * 100)) : 0;
  const isOver = budgetNum > 0 && actualTotal > budgetNum;

  const isMember = Boolean(
    currentUser &&
      companions.some(
        (m) =>
          (m.email && currentUser.email && m.email.toLowerCase() === currentUser.email.toLowerCase()) ||
          (m.userId != null && currentUser.id != null && String(m.userId) === String(currentUser.id))
      )
  );
  const canLogExpense = isOwner || isMember;

  const handleAddExpense = async (e) => {
    e.preventDefault();
    const num = Number(String(expAmount).replace(/\D/g, ''));
    if (!num || num <= 0) {
      toast.showError('Vui lòng nhập số tiền hợp lệ.');
      return;
    }
    setSubmittingExp(true);
    try {
      await itineraryApi.addExpense(numericId, {
        amount: num,
        category: expCategory,
        description: expDesc.trim() || expCategory
      });
      setExpAmount('');
      setExpDesc('');
      toast.showSuccess('Đã ghi nhận khoản chi tiêu!');
      await loadData();
    } catch (err) {
      toast.showError(err?.message || 'Không thể thêm chi tiêu.');
    } finally {
      setSubmittingExp(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      await itineraryApi.deleteExpense(expenseId);
      setExpenses((prev) => prev.filter((item) => item.id !== expenseId));
      toast.showInfo('Đã xóa khoản chi tiêu.');
    } catch (err) {
      toast.showError(err?.message || 'Không thể xóa khoản chi.');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    const email = memberEmail.trim();
    if (!email || !email.includes('@')) {
      toast.showError('Vui lòng nhập email thành viên hợp lệ.');
      return;
    }
    setSubmittingMember(true);
    try {
      await itineraryApi.addMember(numericId, email, 'VIEWER');
      setMemberEmail('');
      toast.showSuccess(`Đã mời ${email} tham gia chuyến đi!`);
      await loadData();
    } catch (err) {
      toast.showError(err?.message || 'Không thể mời thành viên.');
    } finally {
      setSubmittingMember(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await itineraryApi.removeMember(numericId, userId);
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
      toast.showInfo('Đã xóa thành viên khỏi chuyến đi.');
    } catch (err) {
      toast.showError(err?.message || 'Không thể xóa thành viên.');
    }
  };

  if (mode === 'members') {
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Mời bạn đồng hành */}
        {isOwner && (
          <form onSubmit={handleAddMember} className="bg-white p-4 rounded-xl border border-slate-200 space-y-2.5">
            <label className="block text-xs font-bold text-slate-700">
              Mời bạn đồng hành qua email
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Nhập email tài khoản Wayfare (VD: banbe@gmail.com)..."
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                disabled={submittingMember}
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{submittingMember ? 'Đang mời...' : 'Mời tham gia'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Danh sách thành viên */}
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          <div className="px-4 py-3 flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-500" />
              <span>Thành viên chuyến đi ({totalPeople})</span>
            </h4>
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />}
          </div>

          {/* Chủ chuyến đi */}
          <div className="px-4 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-bold text-slate-900 truncate">
                {ownerDisplayName}
              </div>
              {ownerDisplayEmail && (
                <div className="text-xs text-slate-400 truncate">{ownerDisplayEmail}</div>
              )}
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold shrink-0">
              Chủ chuyến đi
            </span>
          </div>

          {/* Bạn đồng hành */}
          {companions.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-slate-400">
              Chưa có bạn đồng hành nào. {isOwner ? 'Nhập email phía trên để mời bạn bè cùng theo dõi và ghi chi tiêu.' : ''}
            </div>
          ) : (
            companions.map((m) => (
              <div key={m.id || m.userId} className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-800 truncate">{m.fullName || m.email}</div>
                  <div className="text-xs text-slate-400 truncate">{m.email}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                    Thành viên
                  </span>
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(m.userId)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                      title="Xóa thành viên"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // mode === 'expenses'
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* 1. 3 chỉ số cơ bản rõ ràng */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="grid grid-cols-3 gap-3 text-center sm:text-left">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Ngân sách dự kiến</div>
            <div className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
              {budgetNum.toLocaleString('vi-VN')}đ
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Đã chi thực tế</div>
            <div className={`text-sm sm:text-base font-bold mt-0.5 ${isOver ? 'text-rose-600' : 'text-emerald-700'}`}>
              {actualTotal.toLocaleString('vi-VN')}đ
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Chia đều ({totalPeople} người)</div>
            <div className="text-sm sm:text-base font-bold text-sky-700 mt-0.5">
              {perPerson.toLocaleString('vi-VN')}đ/người
            </div>
          </div>
        </div>

        {budgetNum > 0 && (
          <div className="space-y-1">
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isOver ? 'bg-rose-500' : 'bg-emerald-500'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Đã dùng {pct}% ngân sách</span>
              <span className={isOver ? 'text-rose-600 font-semibold' : ''}>
                {isOver
                  ? `Vượt ${Math.abs(remaining).toLocaleString('vi-VN')}đ`
                  : `Còn lại ${remaining.toLocaleString('vi-VN')}đ`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Form ghi khoản chi mới (chủ chuyến đi hoặc bạn đồng hành) */}
      {canLogExpense && (
        <form onSubmit={handleAddExpense} className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="text-xs font-bold text-slate-800">Ghi khoản chi mới</div>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <input
              type="number"
              min="1000"
              placeholder="Số tiền (VNĐ)"
              value={expAmount}
              onChange={(e) => setExpAmount(e.target.value)}
              className="sm:col-span-3 px-3 py-2 rounded-lg border border-slate-200 text-xs outline-none focus:border-sky-500"
            />
            <select
              value={expCategory}
              onChange={(e) => setExpCategory(e.target.value)}
              className="sm:col-span-3 px-3 py-2 rounded-lg border border-slate-200 text-xs outline-none focus:border-sky-500 bg-white"
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Mô tả (VD: Ăn tối hải sản)"
              value={expDesc}
              onChange={(e) => setExpDesc(e.target.value)}
              className="sm:col-span-4 px-3 py-2 rounded-lg border border-slate-200 text-xs outline-none focus:border-sky-500"
            />
            <button
              type="submit"
              disabled={submittingExp}
              className="sm:col-span-2 px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{submittingExp ? '...' : 'Ghi'}</span>
            </button>
          </div>
        </form>
      )}

      {/* 3. Danh sách các khoản đã chi */}
      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        <div className="px-4 py-3 flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-slate-500" />
            <span>Danh sách khoản chi ({expenses.length})</span>
          </h4>
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />}
        </div>

        {expenses.length === 0 ? (
          <div className="px-4 py-8 text-center text-xs text-slate-400">
            Chưa có khoản chi tiêu thực tế nào được ghi nhận.
          </div>
        ) : (
          expenses.map((exp) => (
            <div key={exp.id} className="px-4 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900 truncate">
                  {exp.description || exp.category}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {exp.category} · Người chi: {exp.payerName || 'Thành viên'}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-bold text-slate-900">
                  {Number(exp.amount || 0).toLocaleString('vi-VN')}đ
                </span>
                {(isOwner || (currentUser?.id != null && String(exp.payerId) === String(currentUser.id))) && (
                  <button
                    type="button"
                    onClick={() => handleDeleteExpense(exp.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                    title="Xóa khoản chi"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
