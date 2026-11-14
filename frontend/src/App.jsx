import React from 'react';
import { useEffect, useMemo, useState } from 'react';

const KEY = 'expense-tracker-transactions-v1';
const money = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n || 0));
const today = () => new Date().toISOString().slice(0, 10);
const initial = [
  { id: 'demo-1', title: 'Monthly salary', amount: 45000, type: 'income', category: 'Salary', date: today(), note: 'Sample transaction' },
  { id: 'demo-2', title: 'Groceries', amount: 2400, type: 'expense', category: 'Food', date: today(), note: 'Sample transaction' },
  { id: 'demo-3', title: 'Internet bill', amount: 999, type: 'expense', category: 'Bills', date: today(), note: 'Sample transaction' },
];
const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Education', 'Housing', 'Salary', 'Freelance', 'Other'];

export default function App() {
  const [transactions, setTransactions] = useState(() => {
    try { const saved = localStorage.getItem(KEY); return saved ? JSON.parse(saved) : initial; } catch { return initial; }
  });
  const [page, setPage] = useState('Dashboard');
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', amount: '', type: 'expense', category: 'Food', date: today(), note: '' });

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(transactions)); }, [transactions]);
  const totals = useMemo(() => transactions.reduce((a, t) => { a[t.type] += Number(t.amount); return a; }, { income: 0, expense: 0 }), [transactions]);
  const balance = totals.income - totals.expense;
  const filtered = useMemo(() => transactions.filter(t => (page === 'Income' ? t.type === 'income' : page === 'Expenses' ? t.type === 'expense' : true))
    .filter(t => typeFilter === 'all' || t.type === typeFilter)
    .filter(t => `${t.title} ${t.category} ${t.note}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a,b) => b.date.localeCompare(a.date)), [transactions, page, typeFilter, query]);
  const categoryTotals = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((a,t) => { a[t.category] = (a[t.category] || 0) + Number(t.amount); return a; }, {}), [transactions]);

  function openAdd(type = 'expense') { setEditing(null); setForm({ title: '', amount: '', type, category: type === 'income' ? 'Salary' : 'Food', date: today(), note: '' }); setShowForm(true); }
  function openEdit(t) { setEditing(t.id); setForm({ ...t, amount: String(t.amount) }); setShowForm(true); }
  function save(e) { e.preventDefault(); if (!form.title.trim() || Number(form.amount) <= 0) return;
    const item = { ...form, amount: Number(form.amount), id: editing || crypto.randomUUID() };
    setTransactions(old => editing ? old.map(t => t.id === editing ? item : t) : [item, ...old]); setShowForm(false);
  }
  function remove(id) { if (window.confirm('Delete this transaction?')) setTransactions(old => old.filter(t => t.id !== id)); }
  function exportCsv() { const rows = [['Date','Title','Type','Category','Amount','Note'], ...transactions.map(t => [t.date,t.title,t.type,t.category,t.amount,t.note])]; const csv = rows.map(r => r.map(v => `"${String(v ?? '').replaceAll('"','""')}"`).join(',')).join('\n'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'expense-tracker.csv'; a.click(); URL.revokeObjectURL(a.href); }

  return <div className="app-shell">
    <aside className="sidebar"><div className="brand"><span className="brand-mark">₹</span><span>SpendWise</span></div><div className="nav-label">MENU</div>
      {['Dashboard','Income','Expenses','Profile'].map((p,i)=><button key={p} className={`nav-link ${page===p?'active':''}`} onClick={()=>{setPage(p);setTypeFilter('all');}}><span className="nav-icon">{['▦','↗','↘','◉'][i]}</span>{p}</button>)}
      <div className="sidebar-bottom"><div className="avatar">U</div><div><strong>My Account</strong><small>Personal finance</small></div></div>
    </aside>
    <main className="main-area"><header className="topbar"><div><span className="eyebrow">PERSONAL FINANCE</span><h1>{page}</h1></div><button className="primary-btn" onClick={()=>openAdd(page==='Income'?'income':'expense')}>＋ Add transaction</button></header>
      {page === 'Profile' ? <section className="panel profile-panel"><div className="profile-avatar">U</div><h2>My Profile</h2><p>Your transactions are stored locally in this browser.</p><button className="secondary-btn" onClick={exportCsv}>↓ Export my transactions (CSV)</button><button className="danger-text" onClick={()=>{if(window.confirm('Clear all transactions?'))setTransactions([])}}>Clear all data</button></section> : <>
      <section className="summary-grid">
        <article className="summary-card balance-card"><div className="card-top"><span>Total balance</span><span className="card-icon">₹</span></div><strong>{money(balance)}</strong><small>Income minus expenses</small></article>
        <article className="summary-card"><div className="card-top"><span>Total income</span><span className="card-icon income-icon">↗</span></div><strong>{money(totals.income)}</strong><small className="positive">Money received</small></article>
        <article className="summary-card"><div className="card-top"><span>Total expenses</span><span className="card-icon expense-icon">↘</span></div><strong>{money(totals.expense)}</strong><small className="negative">Money spent</small></article>
      </section>
      {page === 'Dashboard' && <section className="dashboard-grid"><div className="panel"><div className="panel-heading"><div><h2>Expense breakdown</h2><p>Where your money is going</p></div></div>{Object.keys(categoryTotals).length ? Object.entries(categoryTotals).sort((a,b)=>b[1]-a[1]).map(([cat,val])=><div className="category-row" key={cat}><div className="category-label"><span>{cat}</span><b>{money(val)}</b></div><div className="bar-track"><div className="bar-fill" style={{width:`${Math.max(3,val/Math.max(...Object.values(categoryTotals))*100)}%`}}/></div></div>) : <div className="empty-state">No expenses yet. Add your first expense to see a breakdown.</div>}</div>
      <div className="panel quick-panel"><h2>Quick actions</h2><p>Keep your finances up to date.</p><button className="quick-action" onClick={()=>openAdd('income')}><span className="quick-icon income-icon">↗</span><span><b>Add income</b><small>Record money received</small></span><span className="arrow">›</span></button><button className="quick-action" onClick={()=>openAdd('expense')}><span className="quick-icon expense-icon">↘</span><span><b>Add expense</b><small>Record money spent</small></span><span className="arrow">›</span></button><button className="secondary-btn full" onClick={exportCsv}>↓ Export transactions</button></div></section>}
      <section className="panel transactions-panel"><div className="panel-heading"><div><h2>{page==='Income'?'Income history':page==='Expenses'?'Expense history':'Recent transactions'}</h2><p>{filtered.length} transaction{filtered.length===1?'':'s'} found</p></div><button className="secondary-btn export-btn" onClick={exportCsv}>↓ Export CSV</button></div><div className="filters"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search transactions..."/><select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}><option value="all">All types</option><option value="income">Income</option><option value="expense">Expenses</option></select></div>
        {filtered.length ? <div className="table-wrap"><table><thead><tr><th>TRANSACTION</th><th>CATEGORY</th><th>DATE</th><th>AMOUNT</th><th></th></tr></thead><tbody>{filtered.map(t=><tr key={t.id}><td><div className="transaction-title"><span className={`transaction-symbol ${t.type}`}>{t.type==='income'?'↗':'↘'}</span><span><b>{t.title}</b><small>{t.note || t.type}</small></span></div></td><td><span className="category-pill">{t.category}</span></td><td>{new Date(`${t.date}T00:00:00`).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</td><td className={t.type==='income'?'amount-positive':'amount-negative'}>{t.type==='income'?'+':'−'}{money(t.amount)}</td><td><button className="icon-btn" title="Edit" onClick={()=>openEdit(t)}>✎</button><button className="icon-btn delete" title="Delete" onClick={()=>remove(t.id)}>×</button></td></tr>)}</tbody></table></div> : <div className="empty-state">No transactions found. Add a transaction to get started.</div>}
      </section></>}
      <footer>SpendWise · Your personal expense tracker <span>Data saved on this device</span></footer>
    </main>
    {showForm && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowForm(false)}}><form className="transaction-modal" onSubmit={save}><div className="modal-head"><div><span className="eyebrow">TRANSACTION DETAILS</span><h2>{editing?'Edit transaction':'Add transaction'}</h2></div><button type="button" className="close-btn" onClick={()=>setShowForm(false)}>×</button></div><label>Type<select value={form.type} onChange={e=>setForm({...form,type:e.target.value,category:e.target.value==='income'?'Salary':'Food'})}><option value="expense">Expense</option><option value="income">Income</option></select></label><label>Title<input required autoFocus value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Grocery shopping"/></label><div className="form-row"><label>Amount (₹)<input required min="1" type="number" step="0.01" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} placeholder="0.00"/></label><label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{categories.map(c=><option key={c}>{c}</option>)}</select></label></div><label>Date<input type="date" required value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label><label>Note (optional)<input value={form.note} onChange={e=>setForm({...form,note:e.target.value})} placeholder="Add a note"/></label><div className="modal-actions"><button type="button" className="secondary-btn" onClick={()=>setShowForm(false)}>Cancel</button><button className="primary-btn" type="submit">{editing?'Save changes':'Save transaction'}</button></div></form></div>}
  </div>;
}
