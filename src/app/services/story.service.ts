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

  /**
   * Creates the document collection of stories for the given epic.
   * This will update the storyItem subject so those listening will be told of the new stories.
   * @param epicId Epic ID to get stories for
   */
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

  /**
   * Adds a new story to the current epic.
   * @param story Story to add
   */
  addStory(story: Story): void {
    // add the correct priority
    story.priority = this.incremementPriority();
    this.storyCollection.add(story);
  }

  /**
   * Updates a single story with the data provided, for the currently selected epic
   * @param storyId ID of the story to update
   * @param data Data to update the story with
   */
  updateStory(storyId: string, data: Partial<Story>): void {
    this.storyCollection.doc(storyId).update(data);
  }

  /**
   * Batch updates stories in the currently selected epic
   * @param stories List of stories to update.
   */
  updateStories(stories: { id: string; data: any }[]): void {
    const batch = this.afs.firestore.batch();

    stories.forEach((story) => {
      const storyRef = this.storyCollection.doc(story.id).ref;
      batch.update(storyRef, story.data);
    });

    batch.commit();
  }

  /**
   * Deletes a story in the current epic collection
   * @param storyId ID of story to delete
   */
  deleteStory(storyId: string): void {
    this.storyCollection.doc(storyId).delete();
  }

  private incremementPriority(): number {
    this.lastPriority = this.lastPriority + 1;
    return this.lastPriority;
  }
}
