const test = require('node:test');
const assert = require('node:assert/strict');
const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');

// These fixtures model the reported scenarios entirely in memory.
// An omitted gstRate lets checkout resolve HSN while the invoice uses its fallback.
function calculate(id, items, coupon = '') {
  return {
    printed: invoice.computeInvoiceFigures({ id, items, coupon }),
    checkout: pricing.computeTotals(items, coupon)
  };
}

function figures({ subtotal, discount, tax, cgst, sgst, total }) {
  return { subtotal, discount, tax, cgst, sgst, total };
}

function invoiceLineTaxes({ rows }) {
  return rows.map(({ hsn, gstPercent, lineTax }) => ({ hsn, gstPercent, lineTax }));
}

test('CURRENT BEHAVIOUR: #1001 invoice uses 18% for 5% and 12% HSN items', () => {
  const items = [
    { name: 'Rice', price: 100, qty: 2, hsn: '1006' },
    { name: 'Ghee', price: 300, qty: 1, hsn: '0405' }
  ];
  const { printed, checkout } = calculate(1001, items);

  assert.deepEqual(invoiceLineTaxes(printed), [
    { hsn: '1006', gstPercent: 18, lineTax: 36 },
    { hsn: '0405', gstPercent: 18, lineTax: 54 }
  ]);
  assert.deepEqual(figures(printed), {
    subtotal: 500, discount: 0, tax: 90, cgst: 45, sgst: 45, total: 590
  });
  assert.deepEqual(checkout.lines.map(line => line.gstPercent), [5, 12]);
  assert.deepEqual(figures(checkout), {
    subtotal: 500, discount: 0, tax: 46, cgst: 23, sgst: 23, total: 546
  });
});

test('CURRENT BEHAVIOUR: #1002 invoice applies SAVE10 after GST', () => {
  const items = [{ name: 'Rice', price: 300, qty: 2, hsn: '1006', gstRate: 5 }];
  const { printed, checkout } = calculate(1002, items, 'SAVE10');

  assert.deepEqual(invoiceLineTaxes(printed), [
    { hsn: '1006', gstPercent: 5, lineTax: 30 }
  ]);
  assert.deepEqual(figures(printed), {
    subtotal: 600, discount: 63, tax: 30, cgst: 15, sgst: 15, total: 567
  });
  assert.deepEqual(figures(checkout), {
    subtotal: 600, discount: 60, tax: 27, cgst: 13.5, sgst: 13.5, total: 567
  });
});

test('CURRENT BEHAVIOUR: #1004 invoice ignores the SAVE10 cap', () => {
  const items = [{ name: 'Tea', price: 560, qty: 4, hsn: '0902' }];
  const { printed, checkout } = calculate(1004, items, 'SAVE10');

  assert.deepEqual(invoiceLineTaxes(printed), [
    { hsn: '0902', gstPercent: 18, lineTax: 403.2 }
  ]);
  assert.deepEqual(figures(printed), {
    subtotal: 2240, discount: 264.32, tax: 403.2, cgst: 201.6, sgst: 201.6, total: 2378.88
  });
  assert.deepEqual(figures(checkout), {
    subtotal: 2240, discount: 150, tax: 376.2, cgst: 188.1, sgst: 188.1, total: 2466.2
  });
});

test('CURRENT BEHAVIOUR: #1008 invoice matches checkout for 18% items without a coupon', () => {
  const items = [
    { name: 'Tea', price: 125, qty: 1, hsn: '0902' },
    { name: 'Coffee', price: 75, qty: 1, hsn: '0901', gstRate: 18 }
  ];
  const { printed, checkout } = calculate(1008, items);

  assert.deepEqual(invoiceLineTaxes(printed), [
    { hsn: '0902', gstPercent: 18, lineTax: 22.5 },
    { hsn: '0901', gstPercent: 18, lineTax: 13.5 }
  ]);
  assert.deepEqual(figures(printed), {
    subtotal: 200, discount: 0, tax: 36, cgst: 18, sgst: 18, total: 236
  });
  assert.deepEqual(figures(checkout), figures(printed));
});
