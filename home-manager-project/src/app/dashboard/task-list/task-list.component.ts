import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { TaskService, Task } from '../../services/task.service';
import { FormsModule } from '@angular/forms';
import { CommentService, TaskComment } from '../../services/comment.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  familyUsers: { userId: number; userName: string }[] = [];
  expandedTaskId: number | null = null;
  isModalOpen = false;
  commentTexts: { [taskId: number]: string } = {};
  comments: { [taskId: number]: TaskComment[] } = {};
  selectedFiles: File[] = [];
  attachments: { [taskId: number]: any[] } = {};
  readonly apiRoot = 'http://localhost:3000';
  readonly uploadsUrl = `${this.apiRoot}/uploads`;

  newTask: Partial<Task> = {
    title: '',
    description: '',
    dueDate: '',
    assigneeId: undefined
  };

  taskToDelete: number | null = null;
  isDeleteConfirmOpen: boolean = false;

  constructor(public taskService: TaskService, private commentService: CommentService) {}

  ngOnInit() {
    this.loadInitialData();
  }

loadInitialData() {
  const familyId = Number(localStorage.getItem('familyId'));
  const userId = Number(localStorage.getItem('userId'));

  if (!familyId) {
    console.warn("Родина не знайдена");
    return;
  }

  if (!userId) {
    console.warn("Користувача не знайдено");
    return;
  }

  this.loadFamilyUsers(familyId);
  this.refreshTasks(familyId);
}

refreshTasks(familyId: number) {
  this.taskService.getTasks(familyId).subscribe((data) => {
    this.tasks = data;

    this.tasks.forEach(task => {
      this.loadAttachments(task.taskId);
      this.loadComments(task.taskId);
    });
  }, error => {
    console.error("Помилка завантаження завдань: ", error);
  });
}

  loadFamilyUsers(familyId: number) {
    this.taskService.getFamilyUsers(familyId).subscribe(users => {
      this.familyUsers = users;
    });
  }

  getAssigneeName(userId: number): string {
    const user = this.familyUsers.find(u => u.userId === userId);
    return user ? user.userName : '—';
  }

  toggleTaskDetails(taskId: number) {
    this.expandedTaskId = this.expandedTaskId === taskId ? null : taskId;
    if (this.expandedTaskId) this.loadComments(taskId);
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  addTask() {
    const createdBy = Number(localStorage.getItem('userId'));
    const familyId = Number(localStorage.getItem('familyId'));
    if (!createdBy) {
      alert('Користувач не авторизований');
      return;
    }

    if (!this.newTask.title || !this.newTask.dueDate) {
      alert('Назва та дата обовʼязкові');
      return;
    }

    const taskToSend = {
      ...this.newTask,
      createdBy,
      assigneeId: this.newTask.assigneeId || createdBy
    };

    this.taskService.addTask(taskToSend).subscribe((res) => {
    const newTaskId = res.taskId || res.TaskID || res.id;

    if (this.selectedFiles.length > 0 && newTaskId) {
      this.uploadAttachments(newTaskId, () => {
        this.refreshTasks(familyId);
      });
    } else {
      this.refreshTasks(familyId);
    }

    this.newTask = { title: '', description: '', dueDate: '', assigneeId: undefined };
    this.selectedFiles = [];
    this.closeModal();
  });
}

  toggleCompleted(task: Task) {
    const updatedTask = { ...task, isCompleted: !task.isCompleted };
    this.taskService.updateTaskCompletion(updatedTask).subscribe(() => {
      task.isCompleted = updatedTask.isCompleted;
    });
  }

  openDeleteConfirm(taskId: number) {
    this.taskToDelete = taskId;
    this.isDeleteConfirmOpen = true;
  }

  confirmDelete() {
    if (!this.taskToDelete) return;

    this.taskService.deleteTask(this.taskToDelete).subscribe(() => {
      this.ngOnInit();
      this.closeDeleteConfirm();
    }, error => {
      alert('Не вдалося видалити завдання');
      console.error(error);
    });
  }

  closeDeleteConfirm() {
    this.taskToDelete = null;
    this.isDeleteConfirmOpen = false;
  }

  loadComments(taskId: number) {
    this.commentService.getComments(taskId).subscribe(res => {
      this.comments[taskId] = res;
    });
  }

  addComment(taskId: number) {
    const text = this.commentTexts[taskId]?.trim();
    const userId = Number(localStorage.getItem('userId'));
    if (!text) return;

    this.commentService.addComment(taskId, userId, text).subscribe(() => {
      this.commentTexts[taskId] = '';
      this.loadComments(taskId);
    });
  }

  deleteComment(taskId: number, commentId: number) {
    this.commentService.deleteComment(commentId).subscribe(() => {
      this.loadComments(taskId);
    });
  }

  onFileSelected(event: any) {
    this.selectedFiles = Array.from(event.target.files);
  }

  uploadAttachments(taskId: number, callback: () => void) {
    const formData = new FormData();
    this.selectedFiles.forEach(file => formData.append('file', file));
    formData.append('taskId', taskId.toString());

    this.taskService.uploadAttachment(formData).subscribe(() => {
      console.log("Файли завантажено");
      callback();
      this.loadAttachments(taskId);
    });
  }

  loadAttachments(taskId: number) {
    this.taskService.getAttachments(taskId).subscribe(files => {
      this.attachments[taskId] = files;
    });
  }

  extractFileName(path: string): string {
    return path.split('/').pop() || path;
  }
}
