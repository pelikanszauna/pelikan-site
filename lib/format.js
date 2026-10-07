export const huf = (n) =>
  new Intl.NumberFormat('hu-HU').format(n).replace(/\u00a0|\u202f/g, ' ') + ' Ft';

export const audienceLabel = { open: '', women: 'Women only', members: 'Members only' };
