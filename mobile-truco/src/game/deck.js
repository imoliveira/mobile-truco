// Lógica pura de cartas — idêntica à do backend (deck.js), reaproveitada
// aqui só para exibição/ordenação local no cliente, se necessário.
// A autoridade sobre força de carta e resultado de vaza continua sendo o servidor.

export const SUITS = ['ouro', 'espada', 'copas', 'zap'];
export const VALUES = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'];

const BASE_POWER = {
  '4': 0, '5': 1, '6': 2, '7': 3, 'Q': 4, 'J': 5, 'K': 6, 'A': 7, '2': 8, '3': 9
};

export function getManilhaValue(viraValue) {
  const index = VALUES.indexOf(viraValue);
  return index === VALUES.length - 1 ? VALUES[0] : VALUES[index + 1];
}

export function calculateCardPower(card, manilhaValue) {
  const suitPower = SUITS.indexOf(card.suit);
  if (card.value === manilhaValue) {
    return 10 + suitPower;
  }
  return BASE_POWER[card.value];
}

export const SUIT_SYMBOLS = {
  ouro: '♦',
  espada: '♠',
  copas: '♥',
  zap: '♣',
};
