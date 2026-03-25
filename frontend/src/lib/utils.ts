/**
 * Format a date string like "2 hours ago", "3 days ago", etc.
 */
export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }
  return 'Just now';
}

/**
 * Format date as readable string.
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get status badge color classes.
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'APPROVED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'PENDING':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'REJECTED':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'CANCELLED':
      return 'bg-gray-100 text-gray-500 border-gray-200';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200';
  }
}

/**
 * Get leave type badge color classes.
 */
export function getLeaveTypeColor(type: string): string {
  switch (type) {
    case 'SICK':
      return 'bg-rose-50 text-rose-700';
    case 'CASUAL':
      return 'bg-blue-50 text-blue-700';
    case 'EARNED':
      return 'bg-violet-50 text-violet-700';
    default:
      return 'bg-gray-50 text-gray-600';
  }
}
