import React, { useState, useEffect, useCallback } from 'react';
import { Wallet, Users, Plus, Trash2, UserPlus, Loader2 } from 'lucide-react';
import { itineraryApi } from '../../services/api';
import { useToast } from '../common/Toast';

const EXPENSE_CATEGORIES = ['Ăn uống', 'Di chuyển', 'Khách sạn', 'Vé tham quan', 'Mua sắm', 'Khác'];

export const ItineraryExpensesMembersPanel = ({ itineraryId, budgetTotal = 0, isOwner = false }) => {
  const toast = useToast();
  const numericId = Number(itineraryId);
  const isValidId = Number.isFinite(numericId) && numericId > 0;

  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [members, setMembers] = useState([]);

  // Expense form
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState('Ăn uống');
  const [expDesc, setExpDesc] = useState('');
  const [submittingExp, setSubmittingExp] = useState(false);

  // Member form
  const [memberEmail, setMemberEmail] = useState('');
  const [submittingMember, setSubmittingMember] = useState(false);

  const loadData = useCallback(async () => {
    if (!isValidId) return;
    setLoading(true);
    try {
      const detail = await itineraryApi.getItineraryById(numericId);
      setExpenses(Array.isArray(detail?.expenses) ? detail.expenses : []);
      setMembers(Array.isArray(detail?.members) ? detail.members : []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [isValidId, numericId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!isValidId) return null;

  const actualTotal = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalPeople = 1 + members.length;
  const perPerson = Math.round(actualTotal / Math.max(1, totalPeople));
  const budgetNum = Number(budgetTotal) || 0;
  const pct = budgetNum > 0 ? Math.min(100, Math.round((actualTotal / budgetNum) * 100)) : 0;
  const isOver = budgetNum > 0 && actualTotal > budgetNum;

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

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
      {/* 1. Chi tiêu thực tế & Chia tiền nhóm */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-sky-600" />
            <span>Chi tiêu thực tế & Chia tiền ({totalPeople} người)</span>
          </h4>
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />}
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Đã chi thực tế:</span>
            <strong className={isOver ? 'text-rose-600' : 'text-slate-900'}>
              {actualTotal.toLocaleString('vi-VN')}đ
            </strong>
          </div>
          {budgetNum > 0 && (
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isOver ? 'bg-rose-500' : 'bg-emerald-500'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          )}
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Bình quân / người:</span>
            <strong className="text-sky-700">{perPerson.toLocaleString('vi-VN')}đ</strong>
          </div>
        </div>

        {expenses.length > 0 && (
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-0.5">
            {expenses.map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between gap-2 text-xs py-1.5 px-2.5 rounded-lg bg-slate-50/70 border border-slate-100"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-slate-800 truncate">
                    {exp.description || exp.category}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {exp.category} · {exp.payerName || 'Thành viên'}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-bold text-slate-900">
                    {Number(exp.amount || 0).toLocaleString('vi-VN')}đ
                  </span>
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => handleDeleteExpense(exp.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                      title="Xóa khoản chi"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {isOwner && (
          <form onSubmit={handleAddExpense} className="space-y-1.5 pt-1">
            <div className="grid grid-cols-2 gap-1.5">
              <input
                type="number"
                min="1000"
                placeholder="Số tiền (VNĐ)"
                value={expAmount}
                onChange={(e) => setExpAmount(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs outline-none focus:border-sky-500"
              />
              <select
                value={expCategory}
                onChange={(e) => setExpCategory(e.target.value)}
                className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs outline-none focus:border-sky-500 bg-white"
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder="Mô tả khoản chi (VD: Ăn hải sản tối)"
                value={expDesc}
                onChange={(e) => setExpDesc(e.target.value)}
                className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                disabled={submittingExp}
                className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ghi</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 2. Bạn đồng hành */}
      <div className="pt-3 border-t border-slate-100 space-y-2.5">
        <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-emerald-600" />
          <span>Bạn đồng hành ({members.length})</span>
        </h4>

        {members.length > 0 ? (
          <div className="space-y-1.5">
            {members.map((m) => (
              <div
                key={m.id || m.userId}
                className="flex items-center justify-between gap-2 text-xs py-1.5 px-2.5 rounded-lg bg-slate-50/70 border border-slate-100"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-slate-800 truncate">{m.fullName || m.email}</div>
                  <div className="text-[10px] text-slate-400 truncate">{m.email}</div>
                </div>
                {isOwner && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(m.userId)}
                    className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                    title="Xóa thành viên"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-slate-400">Chưa có bạn đồng hành nào được mời.</p>
        )}

        {isOwner && (
          <form onSubmit={handleAddMember} className="flex gap-1.5">
            <input
              type="email"
              placeholder="Email bạn đồng hành..."
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={submittingMember}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Mời</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
