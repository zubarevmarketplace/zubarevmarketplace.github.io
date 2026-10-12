import { serializeStructuredData } from '../../seo/metadata';

type StructuredDataProps = { data: Record<string, unknown> };

export default function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeStructuredData(data) }}
    />
  );
}
