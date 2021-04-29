export interface Story {
  title: string;
  description: string;
  needsRefinement: boolean;
  mvp: boolean;
  priority: number;
  id?: string;
}
