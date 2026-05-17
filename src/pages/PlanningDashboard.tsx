import { useEffect, useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import { AlertCircle, Building2, CalendarDays, CheckCircle2, ClipboardList, Shirt, WalletCards } from 'lucide-react';
import {
  ensurePlanningSeed,
  subscribePlanningState,
  updatePlanningBudgetActual,
} from '../services/planningFirestore';
import {
  emptyPlanningState,
  money,
  normalizeCurrencyInput,
  planningSeed,
  type PlanningState,
} from '../services/planningData';

const tabs = [
  { id: 'budget', label: '예산', icon: WalletCards },
  { id: 'vendors', label: '업체', icon: Shirt },
  { id: 'housing', label: '주거', icon: Building2 },
  { id: 'policy', label: '정책', icon: CheckCircle2 },
  { id: 'timeline', label: '일정', icon: CalendarDays },
] as const;

type TabId = typeof tabs[number]['id'];

export default function PlanningDashboard({
  user,
  coupleId,
  isConnected,
}: {
  user: User;
  coupleId: string;
  isConnected: boolean;
}) {
  const [activeTab, setActiveTab] = useState<TabId>('budget');
  const [state, setState] = useState<PlanningState>(emptyPlanningState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let unsubscribe = () => {};
    let isCancelled = false;

    const start = async () => {
      setLoading(true);
      setError('');
      try {
        await ensurePlanningSeed(coupleId, user.uid);
        if (isCancelled) return;
        unsubscribe = subscribePlanningState(
          coupleId,
          (nextState) => {
            setState(nextState);
            setLoading(false);
          },
          (nextError) => {
            console.error(nextError);
            setError('플래닝 데이터를 불러오지 못했습니다.');
            setLoading(false);
          },
        );
      } catch (nextError) {
        console.error(nextError);
        if (!isCancelled) {
          setError('플래닝 초기 데이터를 준비하지 못했습니다.');
          setLoading(false);
        }
      }
    };

    start();

    return () => {
      isCancelled = true;
      unsubscribe();
    };
  }, [coupleId, user.uid]);

  const budgetTotals = useMemo(() => {
    const planned = state.budgetRows.reduce((sum, row) => sum + Number(row.planned || 0), 0);
    const actual = state.budgetRows.reduce((sum, row) => sum + Number(row.actual || 0), 0);
    return {
      planned,
      actual,
      remaining: planningSeed.budgetCap - actual,
      usage: planningSeed.budgetCap > 0 ? Math.round((actual / planningSeed.budgetCap) * 100) : 0,
    };
  }, [state.budgetRows]);

  const handleActualChange = async (rowId: string, rawValue: string) => {
    try {
      await updatePlanningBudgetActual(rowId, normalizeCurrencyInput(rawValue));
    } catch (nextError) {
      console.error(nextError);
      setError('예산 금액을 저장하지 못했습니다.');
    }
  };

  return (
    <div className="min-h-full bg-slate-50 px-6 pb-10 pt-fixed-page-header">
      <div className="fixed inset-x-0 top-0 z-20">
        <div className="mx-auto max-w-md border-b border-white/40 bg-slate-50/95 px-6 pb-4 pt-safe-top backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800">결혼 관리</h1>
              <p className="mt-1 text-sm text-slate-500">예산, 업체, 주거, 정책을 함께 관리합니다.</p>
            </div>
            <ClipboardList className="h-6 w-6 text-rose-400" />
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {!isConnected && (
          <div className="clay-card bg-rose-50/60 p-4 text-sm leading-relaxed text-slate-600">
            혼자 기록 중입니다. 설정 탭에서 연인과 연결하면 이 데이터가 커플 공간으로 병합됩니다.
          </div>
        )}

        {error && (
          <div className="flex gap-2 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-600">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="hide-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex min-w-[72px] flex-col items-center gap-1 rounded-2xl px-3 py-3 text-xs font-bold transition-all ${
                  isActive ? 'bg-slate-800 text-white shadow-lg shadow-slate-200' : 'clay-btn text-slate-500'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm font-bold text-slate-400">플래닝 데이터를 불러오는 중...</div>
        ) : (
          <>
            {activeTab === 'budget' && (
              <BudgetSection
                actual={budgetTotals.actual}
                planned={budgetTotals.planned}
                remaining={budgetTotals.remaining}
                usage={budgetTotals.usage}
                rows={state.budgetRows}
                onActualChange={handleActualChange}
              />
            )}
            {activeTab === 'vendors' && <VendorSection state={state} />}
            {activeTab === 'housing' && <HousingSection state={state} />}
            {activeTab === 'policy' && <PolicySection state={state} />}
            {activeTab === 'timeline' && <TimelineSection state={state} />}
          </>
        )}
      </div>
    </div>
  );
}

function BudgetSection({
  actual,
  planned,
  remaining,
  usage,
  rows,
  onActualChange,
}: {
  actual: number;
  planned: number;
  remaining: number;
  usage: number;
  rows: PlanningState['budgetRows'];
  onActualChange: (rowId: string, rawValue: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <MetricCard label="총상한" value={money(planningSeed.budgetCap)} />
        <MetricCard label="실지출" value={money(actual)} caption={`${usage}% 사용`} />
        <MetricCard label="잔여" value={money(remaining)} tone={remaining < 0 ? 'danger' : 'normal'} />
        <MetricCard label="계획합계" value={money(planned)} />
      </div>

      <div className="space-y-3">
        {rows.map((row) => (
          <article key={row.id} className="clay-card p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-rose-400">{row.group}</span>
                <h3 className="mt-1 text-sm font-bold text-slate-800">{row.item}</h3>
                <p className="mt-1 text-[11px] text-slate-400">{row.due} · {row.owner} · {row.status}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">
                {money(row.planned)}
              </span>
            </div>
            <input
              key={`${row.id}-${row.actual}`}
              aria-label={`${row.item} 실제 계약금`}
              inputMode="numeric"
              className="clay-input w-full p-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-200"
              defaultValue={row.actual || ''}
              onBlur={(event) => onActualChange(row.id, event.target.value)}
              placeholder="실제 금액"
            />
          </article>
        ))}
      </div>
    </div>
  );
}

function VendorSection({ state }: { state: PlanningState }) {
  return (
    <div className="space-y-4">
      {state.vendors.map((vendor) => (
        <article key={vendor.id} className="clay-card p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-800">{vendor.title}</h3>
              <p className="mt-1 text-xs font-bold text-rose-500">{vendor.decision}</p>
            </div>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">
              {vendor.marketRange}
            </span>
          </div>
          <p className="mb-3 text-xs leading-relaxed text-slate-500">{vendor.target}</p>
          <p className="rounded-2xl bg-slate-100/70 p-3 text-[11px] text-slate-500">{vendor.sourceHint}</p>
          <div className="mt-4 space-y-3">
            {vendor.options.map((option) => (
              <div key={option.name} className="rounded-2xl bg-white/60 p-3">
                <div className="flex justify-between gap-3">
                  <strong className="text-sm text-slate-700">{option.name}</strong>
                  <span className="text-[11px] font-bold text-slate-500">{option.price}</span>
                </div>
                <p className="mt-2 text-xs text-slate-500">{option.strengths}</p>
                <p className="mt-1 text-[11px] text-slate-400">{option.risks}</p>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function HousingSection({ state }: { state: PlanningState }) {
  return (
    <div className="space-y-3">
      {state.apartments.map((candidate) => (
        <article key={candidate.id} className="clay-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">{candidate.name}</h3>
              <p className="mt-1 text-xs text-slate-400">{candidate.year} · {candidate.households.toLocaleString('ko-KR')}세대 · {candidate.size}</p>
            </div>
            <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${
              candidate.verdict === '1차후보' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {candidate.verdict}
            </span>
          </div>
          <p className="mt-3 text-sm font-bold text-slate-700">{candidate.price}</p>
          <p className="mt-1 text-xs text-slate-500">{candidate.risk}</p>
        </article>
      ))}
    </div>
  );
}

function PolicySection({ state }: { state: PlanningState }) {
  return (
    <div className="space-y-3">
      {state.policies.map((policy) => (
        <article key={policy.id} className="clay-card p-4">
          <div className="mb-2 flex items-start justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-800">{policy.name}</h3>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">{policy.verdict}</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-500">{policy.reason}</p>
          <p className="mt-2 text-xs font-bold text-rose-500">{policy.action}</p>
        </article>
      ))}
    </div>
  );
}

function TimelineSection({ state }: { state: PlanningState }) {
  return (
    <div className="space-y-3">
      {state.timeline.map((item) => (
        <article key={item.id} className="clay-card p-4">
          <span className="text-[10px] font-bold text-rose-400">{item.date}</span>
          <h3 className="mt-1 text-sm font-bold text-slate-800">{item.title}</h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">{item.detail}</p>
        </article>
      ))}
    </div>
  );
}

function MetricCard({
  label,
  value,
  caption,
  tone = 'normal',
}: {
  label: string;
  value: string;
  caption?: string;
  tone?: 'normal' | 'danger';
}) {
  return (
    <article className="clay-card p-4">
      <span className="text-[10px] font-bold text-slate-400">{label}</span>
      <strong className={`mt-2 block break-words text-lg ${tone === 'danger' ? 'text-rose-600' : 'text-slate-800'}`}>
        {value}
      </strong>
      {caption && <small className="mt-1 block text-[10px] text-slate-400">{caption}</small>}
    </article>
  );
}
