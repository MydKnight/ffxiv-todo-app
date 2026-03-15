import { generateDataHash, compareVersions, hasDataChanged } from '../../src/utils/data-versioning';

describe('Data Versioning Utility', () => {
  it('should generate a consistent hash for the same data', () => {
    const data = { foo: 'bar', value: 42 };
    const hash1 = generateDataHash(data);
    const hash2 = generateDataHash(data);
    expect(hash1).toBe(hash2);
  });

  it('should generate different hashes for different data', () => {
    const data1 = { foo: 'bar', value: 42 };
    const data2 = { foo: 'baz', value: 42 };
    const hash1 = generateDataHash(data1);
    const hash2 = generateDataHash(data2);
    expect(hash1).not.toBe(hash2);
  });

  it('should handle empty data objects', () => {
    const hash = generateDataHash({});
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });

  it('should compare identical version strings as equal', () => {
    expect(compareVersions('abc123', 'abc123')).toBe(0);
  });

  it('should compare different version strings as not equal', () => {
    expect(compareVersions('abc123', 'def456')).not.toBe(0);
  });

  it('should detect data has not changed if hashes are equal', () => {
    const data = { foo: 'bar' };
    const hash = generateDataHash(data);
    expect(hasDataChanged(data, hash)).toBe(false);
  });

  it('should detect data has changed if hashes are different', () => {
    const data = { foo: 'bar' };
    const oldHash = generateDataHash({ foo: 'baz' });
    expect(hasDataChanged(data, oldHash)).toBe(true);
  });

  it('should handle deeply nested objects', () => {
    const data = { a: { b: { c: 1 } } };
    const hash = generateDataHash(data);
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });

  it('should produce the same hash for objects with same content but different key order', () => {
    const data1 = { a: 1, b: 2 };
    const data2 = { b: 2, a: 1 };
    expect(generateDataHash(data1)).toBe(generateDataHash(data2));
  });
});
