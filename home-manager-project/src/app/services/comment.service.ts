import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface TaskComment {
  commentId: number;
  text: string;
  createdAt: string;
  userName: string;
}

@Injectable({ providedIn: 'root' })
export class CommentService {
  private apiUrl = 'http://localhost:3000/api/comments';

  constructor(private http: HttpClient) {}

  getComments(taskId: number): Observable<TaskComment[]> {
    return this.http.get<any[]>(`${this.apiUrl}?taskId=${taskId}`).pipe(
      map(data => data.map(comment => ({
        commentId: comment.CommentID,
        text: comment.Text,
        createdAt: comment.CreatedAt,
        userName: comment.UserName
      })))
    );
  }

  addComment(taskId: number, userId: number, text: string): Observable<any> {
    return this.http.post(this.apiUrl, { taskId, userId, text });
  }

  deleteComment(commentId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${commentId}`);
  }
}
