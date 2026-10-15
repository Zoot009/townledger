import assert from 'node:assert/strict'
import { test } from 'node:test'
import { plural, recordNo, safeUrl } from './utils.ts'

test('record numbers are stable, well-formed and differ for neighbouring ids', () => {
  assert.equal(recordNo('12345'), recordNo('12345'))
  assert.match(recordNo('12345'), /^TL-[0-9A-F]{4}-[0-9A-F]{4}$/)
  assert.notEqual(recordNo('12345').slice(0, 7), recordNo('12346').slice(0, 7))
})

test('plurals for headings', () => {
  assert.equal(plural('dentist'), 'dentists')
  assert.equal(plural('pharmacy'), 'pharmacies')
  assert.equal(plural('car wash'), 'car washes')
  assert.equal(plural('car repair'), 'car repair')
})

test('only http(s) links from scraped data', () => {
  assert.equal(safeUrl('javascript:alert(1)'), undefined)
  assert.equal(safeUrl('https://example.com'), 'https://example.com')
})
