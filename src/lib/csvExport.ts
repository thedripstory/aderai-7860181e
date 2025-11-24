/**
 * Utility functions for CSV export
 */

export const exportToCSV = (data: any[], filename: string, columns?: string[]) => {
  if (!data || data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // Get columns from first object if not provided
  const headers = columns || Object.keys(data[0]);

  // Create CSV content
  const csvRows = [
    headers.join(","), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values that contain commas, quotes, or newlines
        if (value === null || value === undefined) return "";
        const stringValue = String(value);
        if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(",")
    )
  ];

  const csvContent = csvRows.join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportUsersToCSV = async (users: any[]) => {
  const exportData = users.map(user => ({
    email: user.email,
    account_name: user.account_name,
    email_verified: user.email_verified ? "Yes" : "No",
    created_at: new Date(user.created_at).toLocaleDateString(),
    klaviyo_setup_completed: user.klaviyo_setup_completed ? "Yes" : "No",
    onboarding_completed: user.onboarding_completed ? "Yes" : "No",
  }));

  exportToCSV(exportData, "users");
};

export const exportFeedbackToCSV = async (feedback: any[]) => {
  const exportData = feedback.map(item => ({
    user_email: item.user?.email || "N/A",
    feedback_type: item.feedback_type,
    title: item.title || "",
    description: item.description,
    status: item.status,
    created_at: new Date(item.created_at).toLocaleDateString(),
  }));

  exportToCSV(exportData, "feedback");
};

export const exportAnalyticsToCSV = async (events: any[]) => {
  const exportData = events.map(event => ({
    user_email: event.user?.email || "N/A",
    event_name: event.event_name,
    page_url: event.page_url || "",
    created_at: new Date(event.created_at).toISOString(),
  }));

  exportToCSV(exportData, "analytics-events");
};
