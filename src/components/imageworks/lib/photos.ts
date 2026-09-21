import { WORK_PROJECTS } from "@/lib/work-projects";
export const PHOTOS = WORK_PROJECTS.map((project) => project.image);
export type PhotoId = string;
export function photoUrl(id: PhotoId, _size: number): string {
  void _size;
  return id;
}
export function photoSrc(id: PhotoId, _width: number, _height: number): string {
  void _width;
  void _height;
  return id;
}
