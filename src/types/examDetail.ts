export interface PartTag {
  name: string;
  color: string;
}

export interface Part {
  label: string;
  tags: PartTag[];
}
