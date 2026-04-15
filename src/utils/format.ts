import {ContractStatus, ContractType} from '@/types/contract';

/**
 * Format an ISO date string into a human-readable format.
 * e.g. "Apr 14, 2026"
 */
export function formatDate(iso: string): string {
  try {
    const date = new Date(iso);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

/**
 * Format an ISO date string with time.
 * e.g. "Apr 14, 2026 at 3:45 PM"
 */
export function formatDateTime(iso: string): string {
  try {
    const date = new Date(iso);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return iso;
  }
}

/**
 * Return a relative time string for recent dates.
 * e.g. "2 hours ago", "3 days ago"
 */
export function formatRelativeTime(iso: string): string {
  try {
    const now = Date.now();
    const then = new Date(iso).getTime();
    const diffMs = now - then;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) {
      return 'just now';
    }
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    }
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }
    if (diffDays < 7) {
      return `${diffDays}d ago`;
    }
    return formatDate(iso);
  } catch {
    return iso;
  }
}

/**
 * Map a ContractType enum value to a display label.
 */
export function formatContractType(type: ContractType): string {
  const map: Record<ContractType, string> = {
    service_agreement: 'Service Agreement',
    freelance_agreement: 'Freelance Agreement',
    payment_agreement: 'Payment Agreement',
    general_agreement: 'General Agreement',
  };
  return map[type] ?? type;
}

/**
 * Map a ContractStatus enum value to a display label.
 */
export function formatStatus(status: ContractStatus): string {
  const map: Record<ContractStatus, string> = {
    draft: 'Draft',
    generated: 'Generated',
    signed_by_me: 'Signed by Me',
    sent: 'Sent',
    viewed: 'Viewed',
    signed_by_other: 'Signed by Other Party',
    completed: 'Completed',
  };
  return map[status] ?? status;
}

/**
 * Truncate a string to a max length with ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Format a currency amount.
 * Attempts to parse numeric values and format as USD.
 */
export function formatCurrency(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value;
  if (isNaN(num)) {
    return String(value);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(num);
}
