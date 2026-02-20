import { type TodoistTask } from "@/lib/todoist";

/**
 * タスク一覧をTodoist CSV形式に変換してダウンロードする。
 */
export const exportToTodoistCSV = (tasks: TodoistTask[]) => {
  const headers = ["TYPE", "CONTENT", "DESCRIPTION", "PRIORITY", "INDENT", "AUTHOR", "RESPONSIBLE", "DATE"];

  const rows = tasks.map(task => [
    "task",
    `"${task.content.replace(/"/g, '""')}"`,
    "",
    task.priority || 1,
    1,
    "",
    "",
    task.due?.date || "",
  ]);

  const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "todoist_import.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
