import { ClipboardModule } from '@angular/cdk/clipboard';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { LayoutModule } from '@angular/cdk/layout';
import { NgModule } from '@angular/core';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTreeModule } from '@angular/material/tree';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LuxonModule } from 'luxon-angular';
import { NgxAuthFirebaseUIModule } from 'ngx-auth-firebaseui';
import { MarkdownModule } from 'ngx-markdown';
import 'prismjs';
import 'prismjs/components/prism-typescript.min.js';
import 'prismjs/plugins/line-highlight/prism-line-highlight.js';
import 'prismjs/plugins/line-numbers/prism-line-numbers.js';
import { environment } from 'src/environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EpicDetailsComponent } from './epics/epic-details/epic-details.component';
import { CreateEpicDialogComponent } from './epics/epic/create-epic-dialog/create-epic-dialog.component';
import { EpicComponent } from './epics/epic/epic.component';
import { StoriesComponent } from './epics/stories/stories.component';
import { StoryDetailsComponent } from './epics/stories/story-details/story-details.component';
import { StoryListComponent } from './epics/stories/story-list/story-list.component';
import { HeaderComponent } from './header/header.component';
import { LoginComponent } from './login/login.component';
import { NavMenuComponent } from './navigation/nav-menu/nav-menu.component';
import { NavigationComponent } from './navigation/navigation.component';
import { RegisterComponent } from './register/register.component';
import { AddTaskFieldComponent } from './todo/add-task-field/add-task-field.component';
import { DetailsComponent } from './todo/details/details.component';
import { EditContentComponent} from './common/edit-content/edit-content.component';
import { FilterComponent } from './todo/filter/filter.component';
import { TaskListComponent } from './todo/task-list/task-list.component';
import { TaskComponent } from './todo/task/task.component';
import { TodoComponent } from './todo/todo.component';
import { NoteListComponent } from './notes/note-list/note-list.component';
import { NotesComponent } from './notes/notes.component';
import { NoteDetailsComponent } from './notes/note-details/note-details.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    HeaderComponent,
    NavigationComponent,
    LoginComponent,
    RegisterComponent,
    TodoComponent,
    DetailsComponent,
    TaskComponent,
    EditContentComponent,
    AddTaskFieldComponent,
    TaskListComponent,
    FilterComponent,
    NavMenuComponent,
    EpicComponent,
    CreateEpicDialogComponent,
    EpicDetailsComponent,
    StoriesComponent,
    StoryDetailsComponent,
    StoryListComponent,
    NoteListComponent,
    NotesComponent,
    NoteDetailsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFireAuthModule,
    NgxAuthFirebaseUIModule.forRoot(
      environment.firebaseConfig,
      () => 'fire-template',
      {
        enableFirestoreSync: true, // enable/disable autosync users with firestore
        toastMessageOnAuthSuccess: false, // whether to open/show a snackbar message on auth success - default : true
        toastMessageOnAuthError: false, // whether to open/show a snackbar message on auth error - default : true
        authGuardFallbackURL: '/login', // url for unauthenticated users - to use in combination with canActivate feature on a route
        authGuardLoggedInURL: '/dashboard', // url for authenticated users - to use in combination with canActivate feature on a route
        passwordMaxLength: 60, // `min/max` input parameters in components should be within this range.
        passwordMinLength: 8, // Password length min/max in forms independently of each componenet min/max.
        // Same as password but for the name
        nameMaxLength: 50,
        nameMinLength: 2,
        // If set, sign-in/up form is not available until email has been verified.
        // Plus protected routes are still protected even though user is connected.
        guardProtectedRoutesUntilEmailIsVerified: true,
        enableEmailVerification: true, // default: true
        // If set to true outputs the UserCredential object instead of firebase.User after login and signup - Default: false
        useRawUserCredential: true
      }
    ),
    FlexLayoutModule,
    LuxonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    LayoutModule,
    MatListModule,
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
    MatSnackBarModule,
    MatDialogModule,
    MatExpansionModule,
    MatTabsModule,
    MatSelectModule,
    MatChipsModule,
    MatTreeModule,
    MatPaginatorModule,
    MarkdownModule.forRoot(),
    ClipboardModule,
    MatGridListModule,
    DragDropModule,
    MatSlideToggleModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
