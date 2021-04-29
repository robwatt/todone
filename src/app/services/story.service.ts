import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  Query
} from '@angular/fire/firestore';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { Story } from '../models/story';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class StoryService {
  storyItems: Subject<Story[]>;
  private storyCollection: AngularFirestoreCollection<Story>;
  private storySubscription: Subscription;
  private lastPriority = 0;

  constructor(
    private afs: AngularFirestore,
    private auth: AuthenticationService
  ) {
    this.storyItems = new BehaviorSubject<Story[]>(null);
  }

  getStories(epicId: string): void {
    if (this.storySubscription) {
      this.storySubscription.unsubscribe();
    }
    this.storyCollection = this.afs.collection<Story>(
      `users/${this.auth.getUID()}/epics/${epicId}/stories`,
      (ref: Query) => ref.orderBy('priority')
    );
    this.storyCollection
      .valueChanges({ idField: 'id' })
      .subscribe((stories: Story[]) => {
        if (stories.length > 0) {
          this.lastPriority = stories[stories.length - 1].priority;
        }
        this.storyItems.next(stories);
      });
  }

  addStory(data: Story): void {
    // add the correct priority
    data.priority = this.incremementPriority();
    this.storyCollection.add(data);
  }

  updateStory(storyId: string, data: Partial<Story>): void {
    this.storyCollection.doc(storyId).update(data);
  }

  private incremementPriority(): number {
    this.lastPriority = this.lastPriority + 1;
    return this.lastPriority;
  }
}
