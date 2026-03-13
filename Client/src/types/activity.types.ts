//typs/activity.types.ts
export interface Occasions {
  occ_id: number;
  occ_name: string;
  status: "A" | "I";
}

export interface Compaign {
  comp_id: number;
  comp_name: string;
  status: "A" | "I";
}

export interface College {
  clg_id: number;
  clg_name: string;
}

export interface Department {
  dept_id: number;
  dept_name: string;
}

export interface SelectedLocation {
  id: number;
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
  pin: string;
}

export interface SelectedMember {
  id: number;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  full_name? : string;
}

export interface SelectedTeam {
  id: number;
  name: string;
}

export interface Tasks {
  id: number;
  status: string;
  step_id: number;
  task_desc: string;
  task_name: string;
}

export interface SubActivityCard {
  id: number;
  taskId?: number;
  taskName?: string;
  title: string;
  startTime: string;
  endTime: string;
  notes: string;
  attachment: File | null;
  attachmentName?: string;
}