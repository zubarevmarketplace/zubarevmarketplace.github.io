import TariffDateNote from '../../components/tools/TariffDateNote';

export default function CoefficientGuide() {
  return (
    <section aria-labelledby="coefficient-guide" className="space-y-4">
      <h2 id="coefficient-guide" className="text-xl md:text-2xl">Как читать коэффициенты</h2>
      <div className="max-w-3xl space-y-3 text-sm leading-relaxed text-white/70">
        <p>Коэффициент — множитель базового тарифа в расчётной модели: 1 означает 100% базы, 1,95 — 195% базы. Логистика, хранение и FBS имеют отдельные коэффициенты. Это не коэффициент приёмки.</p>
        <p>Здесь показан снимок данных листа «Короба» из файла warehouse-coefficients.xlsx в репозитории. Специальные склады и виртуальные центры сохранены под исходными названиями. Строки без коэффициентов логистики и хранения и тарифы монопаллет в эту таблицу не входят.</p>
        <p>WB пересматривает тарифы и правила их применения. Действующее значение может отличаться от выгрузки: учитывайте способ хранения, дату поставки и период фиксации тарифа. Пометка «FBS недоступен» означает отсутствие коэффициента FBS в исходном файле; текущую возможность отгрузки нужно проверить в кабинете.</p>
        <p>Актуальные значения смотрите на портале продавца WB в разделе «Поставки и заказы → Тарифы», выбрав склад и способ хранения. Перед поставкой проверьте также применимые к ней условия. <a href="https://seller.wildberries.ru/instructions/ru/ru/material/fees-site-section" target="_blank" rel="noopener noreferrer" className="text-cyan-300 underline underline-offset-4 hover:text-cyan-200">Инструкция WB по разделу «Тарифы»</a>.</p>
      </div>
      <TariffDateNote />
    </section>
  );
}
