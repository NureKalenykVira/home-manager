import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Task {
  taskId: number;
  title: string;
  description: string;
  dueDate: string;
  isCompleted: boolean;
  createdBy: number;
  createdAt: string;
  assigneeId: number;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:3000/api/tasks';
  public uploadsUrl = 'http://localhost:3000/uploads';

  constructor(private http: HttpClient) {}

  getTasks(familyId: number): Observable<Task[]> {
    return this.http.get<any[]>(`${this.apiUrl}?familyId=${familyId}`).pipe(
      map(data => data.map(item => ({
        taskId: item.TaskID,
        title: item.Title,
        description: item.Description,
        dueDate: item.DueDate,
        isCompleted: item.IsCompleted,
        createdBy: item.CreatedBy,
        createdAt: item.CreatedAt,
        assigneeId: item.AssigneeID
      })))
    );
  }

  addTask(task: Partial<Task>): Observable<any> {
    return this.http.post(this.apiUrl, task);
  }

  updateTaskCompletion(task: Task): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${task.taskId}`, {
      isCompleted: task.isCompleted
    });
  }

  deleteTask(taskId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${taskId}`);
  }

  getFamilyUsers(familyId: number): Observable<{ userId: number, userName: string }[]> {
    return this.http.get<any[]>(`http://localhost:3000/api/family/users?familyId=${familyId}`).pipe(
      map(data => data.map(user => ({
        userId: user.UserID,
        userName: user.UserName
      })))
    );
  }

  uploadAttachment(data: FormData): Observable<any> {
    return this.http.post('http://localhost:3000/api/attachments/upload', data);
  }

  getAttachments(taskId: number): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:3000/api/attachments?taskId=${taskId}`);
  }
}
