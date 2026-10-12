import Layout from '../components/layout/Layout';

export default function NotFoundPage() {
  return (
    <Layout currentPage="tools">
      <section className="mx-auto max-w-3xl space-y-6 px-4 py-16 md:px-8">
        <h1 className="text-3xl tracking-tight md:text-4xl">Страница не найдена</h1>
        <p className="text-white/70">Проверьте адрес или выберите нужный инструмент.</p>
        <div className="flex flex-wrap gap-6">
          <a href="/" className="text-cyan-300 underline underline-offset-4">На главную</a>
          <a href="/tools" className="text-cyan-300 underline underline-offset-4">Все инструменты</a>
        </div>
      </section>
    </Layout>
  );
}
