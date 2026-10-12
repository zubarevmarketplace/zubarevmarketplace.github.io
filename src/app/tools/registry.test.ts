import { describe, expect, it } from 'vitest';
import { tools } from './registry';

describe('реестр инструментов', () => {
  it('содержит калькулятор WB и уникальные slug', () => {
    expect(tools[0].slug).toBe('wb-calculator');
    expect(new Set(tools.map((tool) => tool.slug)).size).toBe(tools.length);
  });

  it.each(tools)('$slug: метаданные заполнены и имеют допустимую длину', (tool) => {
    expect(tool.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    expect(tool.title.trim().length).toBeGreaterThan(0);
    expect(tool.title.length).toBeLessThanOrEqual(70);
    expect(tool.h1.trim().length).toBeGreaterThan(0);
    expect(tool.description.trim().length).toBeGreaterThan(0);
    expect(tool.description.length).toBeLessThanOrEqual(160);
    expect(tool.shortDescription.trim().length).toBeGreaterThan(0);
    expect(tool.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}(?:T.*)?$/);
    expect(Number.isNaN(Date.parse(tool.updatedAt))).toBe(false);
    expect(tool.load).toBeTypeOf('function');
    expect(tool.faq.length).toBeGreaterThanOrEqual(3);
    expect(tool.faq.length).toBeLessThanOrEqual(5);
    for (const { question, answer } of tool.faq) {
      expect(question.trim()).not.toBe('');
      expect(answer.trim()).not.toBe('');
    }
  });

  it('все related ссылаются на существующие инструменты', () => {
    const slugs = new Set(tools.map((tool) => tool.slug));
    for (const tool of tools) {
      for (const slug of tool.related) {
        expect(slugs.has(slug), tool.slug + ' → ' + slug).toBe(true);
        expect(slug).not.toBe(tool.slug);
      }
    }
  });
});
