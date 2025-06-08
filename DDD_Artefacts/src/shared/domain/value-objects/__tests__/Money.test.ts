import { Money } from '../../Money';

describe('Money value object', () => {
  it('adds two amounts with same currency', () => {
    const a = new Money(10, 'USD');
    const b = new Money(5, 'USD');
    const result = a.add(b);
    expect(result.value).toBe(15);
    expect(result.currency).toBe('USD');
  });

  it('throws when adding different currencies', () => {
    const usd = new Money(10, 'USD');
    const eur = new Money(5, 'EUR');
    
    expect(() => usd.add(eur)).toThrow('Currency mismatch');
  });

  it('throws when creating with negative amount', () => {
    expect(() => new Money(-1, 'USD')).toThrow('Amount cannot be negative');
  });
});
