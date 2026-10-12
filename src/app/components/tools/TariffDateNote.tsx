import { formatTariffDate, tariffRegistry } from '../../config/tariffRegistry';

export default function TariffDateNote() {
  return (
    <p className="text-sm leading-relaxed text-white/60">
      Тарифы актуальны на <time dateTime={tariffRegistry.meta.updatedAt}>{formatTariffDate()}</time>.
      {' '}Перед поставкой сверьте с кабинетом WB.
    </p>
  );
}
