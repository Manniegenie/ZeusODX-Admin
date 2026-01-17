import { useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DashboardTitleContext } from '@/layouts/DashboardTitleContext';
import type { AppDispatch, RootState } from '@/core/store/store';
import { GiftDataTable } from '../components/gift-card-table';
import { giftCardColumns } from '../components/gift-card-columns';
import { fetchGiftCardRates } from '../store/giftCardRateSlice';

export function GiftCardRates() {
  const dispatch = useDispatch<AppDispatch>();
  const { rates, loading, error, pagination } = useSelector((state: RootState) => state.giftCardRates);
  const titleCtx = useContext(DashboardTitleContext);

  useEffect(() => {
    titleCtx?.setTitle('Gift Card Rates');
    titleCtx?.setBreadcrumb([
      'Fees & Rates',
      'Gift card rates',
    ]);
    
    dispatch(fetchGiftCardRates({}));
  }, [dispatch]);


  return (
    <div className="w-full bg-white space-y-6 p-4 rounded" style={{ color: '#1A1A1A' }}>
      <div className="w-full">
        {loading ? (
          <div className="flex items-center justify-center w-full h-32">
            <svg className="animate-spin h-8 w-8 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center w-full h-32 text-red-500">
            {error}
          </div>
        ) : (
          <GiftDataTable columns={giftCardColumns} data={rates || []}  pagination={pagination} />
        )}
      </div>
    </div>
  );
}