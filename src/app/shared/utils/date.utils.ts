const MONTHS = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

const WEEKDAYS = [
  'Воскресенье',
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
];

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function fromDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);

  return new Date(year, month - 1, day);
}

export function formatDateFull(dateKey: string): string {
  const date = fromDateKey(dateKey);
  const weekday = WEEKDAYS[date.getDay()];
  const day = date.getDate();
  const month = MONTHS[date.getMonth()];

  return `${weekday}, ${day} ${month}`;
}

export function formatShortDate(dateKey: string): string {
  return fromDateKey(dateKey).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
}

export function moodToEmoji(mood: number | null): string {
  if (!mood) return '—';

  const moods: Record<number, string> = {
    1: '😞',
    2: '😕',
    3: '😐',
    4: '🙂',
    5: '😄',
  };

  return moods[mood] ?? '—';
}
